#!/usr/bin/env python3
"""Build api/clinic-contacts.json — clinic key ("name|city", lowercase)
-> public contact email, for the schedule-request endpoint
(api/request-time.php), which resolves recipients server-side so the
form never carries a clinic address.

Sources (both already public in the served JS — this adds no new
exposure):
  1. js/data.js        — clinic objects in the *_CLINICS arrays that
                         carry an `email:` field (one object per line).
  2. js/clinic-slots.js — CLINIC_SLOTS[key]._em, the Jane-harvested
                         inbox already used by the cards' email action.
                         Wins on conflict (booking-page verified).

Run from the repo root:  python3 scripts/build_clinic_contacts.py
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def from_data_js(path):
    out = {}
    field = lambda line, name: (re.search(r'\b%s:\s*"([^"]*)"' % name, line) or [None, None])[1]
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            if "email:" not in line:
                continue
            name, city, email = field(line, "name"), field(line, "city"), field(line, "email")
            if name and city and email and "@" in email:
                out[(name + "|" + city).lower()] = email
    return out


def from_slots_js(path):
    with open(path, encoding="utf-8") as fh:
        src = fh.read()
    start = src.index("window.CLINIC_SLOTS = ") + len("window.CLINIC_SLOTS = ")
    depth, i = 0, start
    while True:  # brace-match the JSON object
        ch = src[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                break
        i += 1
    slots = json.loads(src[start:i + 1])
    return {k: v["_em"] for k, v in slots.items() if isinstance(v, dict) and v.get("_em")}


def main():
    contacts = from_data_js(os.path.join(ROOT, "js", "data.js"))
    slots = from_slots_js(os.path.join(ROOT, "js", "clinic-slots.js"))
    contacts.update(slots)
    dest = os.path.join(ROOT, "api", "clinic-contacts.json")
    with open(dest, "w", encoding="utf-8") as fh:
        json.dump(contacts, fh, indent=1, sort_keys=True)
        fh.write("\n")
    print("wrote %s: %d clinic emails (data.js + clinic-slots _em)" % (dest, len(contacts)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
