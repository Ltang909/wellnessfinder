/* ============================================================
   WellFinder data
   All clinic listings are scraped from public sources in the
   original project. Confirm pricing, billing and coverage with
   each clinic before booking.
   ============================================================ */

/* ---------- Treatments (home directory) ---------- */
const TREATMENTS = [
  { group: "Move Better", name: "Clinical Pilates", billed: "Physio / Chiro",
    categories: ["Physiotherapy", "Chiropractic"], link: "pilates.html",
    desc: "One-on-one reformer or movement sessions guided by a physiotherapist or rehab professional. A workout experience with a clinical twist — great for posture, strength, mobility, and injury prevention.",
    detail: "Because the session is delivered by a regulated physiotherapist or chiropractor, it's billed as physiotherapy or chiropractic rather than as a fitness class — which is why it often lands inside your extended health benefits." },

  { group: "Move Better", name: "Facial Manual Therapy", billed: "Osteopathy",
    categories: ["Osteopathy"], link: null,
    desc: "Gentle facial and jaw-focused bodywork using techniques like craniosacral and myofascial release. Facial relaxation meets whole-body alignment — cleanse, massage, and finish with a mask.",
    detail: "Delivered by an osteopathic practitioner, so it's typically claimed under an osteopathy benefit. Confirm your osteopathy allowance and whether your plan recognizes your provider's designation." },

  { group: "Move Better", name: "Golf Swing Assessment", billed: "Physio / Chiro",
    categories: ["Physiotherapy", "Chiropractic"], link: "golf.html",
    desc: "A TPI movement screen for golfers — mobility, stability, and rotation — run by a TPI-certified physiotherapist or chiropractor, not a golf pro.",
    detail: "Because it's a physical screen delivered by a physio or chiro, it's billed like any other physio/chiro visit — worth checking your benefits before assuming it's an out-of-pocket golf lesson." },

  { group: "Look & Feel Better", name: "Cosmetic Acupuncture", billed: "Acupuncture / Naturo",
    categories: ["Acupuncture", "Naturopathy"], link: "naturopath.html",
    desc: "Fine needle treatments focused on skin tone, circulation, and a natural glow.",
    detail: "Often provided by a naturopathic doctor or registered acupuncturist, so it can be claimed under naturopathy or acupuncture depending on the provider's credentials and your plan." },

  { group: "Look & Feel Better", name: "Microneedling", billed: "Naturopathy*",
    categories: ["Naturopathy"], link: "naturopath.html",
    desc: "Collagen-focused skin treatment often paired with a naturopathic skin consultation. *Coverage varies by provider.",
    detail: "When performed within a naturopathic visit, part of the appointment may be claimable under naturopathy. Coverage varies widely — always confirm with the clinic and your insurer first." },

  { group: "Look & Feel Better", name: "Vitamin B Injections", billed: "Naturopathy",
    categories: ["Naturopathy"], link: "naturopath.html",
    desc: "A wellness injection often explored for energy support and maintenance.",
    detail: "Administered during a naturopathic appointment and typically billed under naturopathy. Ask whether the injectable itself and the visit are billed separately." },

  { group: "Look & Feel Better", name: "Glutathione Injections", billed: "Naturopathy",
    categories: ["Naturopathy"], link: "naturopath.html",
    desc: "An antioxidant-focused wellness treatment often explored for skin and overall wellness goals.",
    detail: "Offered by naturopathic doctors and generally claimed under naturopathy. Confirm the per-visit cost and what portion your plan reimburses." },

  { group: "Look & Feel Better", name: "IV Vitamin Therapy", billed: "Naturopathy",
    categories: ["Naturopathy"], link: "naturopath.html",
    desc: "Personalized vitamin and hydration infusions administered by qualified practitioners.",
    detail: "When supervised by a naturopathic doctor, the consult portion is often claimable under naturopathy even if the infusion itself is out of pocket. Check the split with the clinic." },

  { group: "Perform Better", name: "Interview Preparation", billed: "Speech‑Language",
    categories: ["Speech Therapy"], link: null,
    desc: "Not just for speech challenges — speech therapists can help with communication confidence, presentations, interviews, and vocal skills.",
    detail: "Delivered by a speech-language pathologist, so it can be claimed under a speech therapy benefit that many people never think to use for communication coaching." },

  { group: "Perform Better", name: "Singing Voice Therapy", billed: "Speech‑Language",
    categories: ["Speech Therapy"], link: null,
    desc: "Voice coaching and therapy techniques to improve vocal control, endurance, and performance. Perfect for anyone who wants to become a better karaoke singer.",
    detail: "Provided by speech-language pathologists who specialize in voice, so it may be covered under your speech-language benefit rather than paid as a private singing lesson." },

  { group: "Brain & Mind", name: "Neurofeedback", billed: "Psychotherapy*",
    categories: ["Psychotherapy"], link: null,
    desc: "Brain-training sessions using real-time feedback to build awareness, focus, and regulation. *Coverage varies by provider.",
    detail: "When offered by a registered psychotherapist or psychologist, sessions may be claimed under mental-health benefits. Coverage varies by provider designation, so confirm first." },
];

const TREATMENT_GROUPS = ["Move Better", "Look & Feel Better", "Perform Better", "Brain & Mind"];
const TREATMENT_TABS = ["All", "Physiotherapy", "Chiropractic", "Osteopathy", "Naturopathy", "Acupuncture", "Speech Therapy", "Psychotherapy"];

/* ---------- Popular goal categories ---------- */
const GOAL_CATEGORIES = [
  { emoji: "🩹", label: "Pain Relief" }, { emoji: "🏃", label: "Sports Injury" },
  { emoji: "🧠", label: "Mental Health" }, { emoji: "🌸", label: "Women's Health" },
  { emoji: "🤸", label: "Mobility" }, { emoji: "🌱", label: "Fertility" },
  { emoji: "⚡", label: "Chronic Pain" }, { emoji: "🍃", label: "Stress" },
  { emoji: "🩺", label: "Post Surgery" }, { emoji: "🧒", label: "Children" },
  { emoji: "🧓", label: "Seniors" }, { emoji: "💻", label: "Office Workers" },
];

/* ---------- Still exploring ---------- */
const EXPLORING = [
  { name: "Bike Fitting", tag: "Physio?", desc: "A biomechanical assessment to adjust saddle height, reach, and cleat position for injury prevention and efficiency. Some physiotherapists offer this as part of a movement assessment." },
  { name: "Orthotic Shoes", tag: "Chiropody?", desc: "Custom-made footwear (not just insoles) prescribed to correct alignment issues. Often bundled with a chiropodist or podiatrist assessment." },
  { name: "Sleep Apnea Machine", tag: "Equipment?", desc: "CPAP machines are usually filed under a separate \"durable medical equipment\" benefit rather than paramedical — worth checking if your plan splits it out from your regular treatment allowance." },
];

/* ---------- Resources ---------- */
const RESOURCES = [
  { tag: "Treatment guide", title: "What is Clinical Pilates?", desc: "How it differs from a studio Pilates class, and why it's billed through physiotherapy." },
  { tag: "Treatment guide", title: "How does Acupuncture work?", desc: "The basics of the practice, and what cosmetic acupuncture adds on top." },
  { tag: "Insurance guide", title: "Can Physiotherapy bill insurance directly?", desc: "What direct billing means, and how to ask a clinic before your first visit." },
  { tag: "Treatment guide", title: "Chiropractor vs. Osteopath — what's the difference?", desc: "Two commonly confused, commonly covered paramedical disciplines, compared." },
];

/* ---------- Insurers ---------- */
const INSURERS = ["Sun Life", "Manulife", "Canada Life", "Green Shield Canada", "Blue Cross", "Desjardins", "ClaimSecure", "Equitable Life", "Beneva", "Empire Life", "People Corporation", "RWAM", "Medavie Blue Cross"];

/* ---------- Insurance analyzer keyword map ---------- */
/* Each entry: keywords that appear in a benefits booklet -> the paramedical
   category, plain-language note, and the WellFinder treatments it unlocks. */
const COVERAGE_MAP = [
  { key: "physiotherapy", label: "Physiotherapy",
    keywords: ["physiotherapy", "physiotherapist", "physio", "\\bpt\\b"],
    note: "Covers registered physiotherapy visits — and the paramedical umbrella that Clinical Pilates and TPI golf assessments are billed under.",
    unlocks: ["Clinical Pilates", "Golf Swing Assessment"] },
  { key: "chiropractic", label: "Chiropractic",
    keywords: ["chiropractic", "chiropractor", "chiro"],
    note: "Chiropractic visits can also cover movement-based services like Clinical Pilates and golf swing screens when a chiropractor delivers them.",
    unlocks: ["Clinical Pilates", "Golf Swing Assessment"] },
  { key: "massage", label: "Massage Therapy",
    keywords: ["massage", "\\brmt\\b", "registered massage"],
    note: "The most-used paramedical benefit — usually needs a Registered Massage Therapist (RMT) receipt.",
    unlocks: [] },
  { key: "naturopathy", label: "Naturopathy",
    keywords: ["naturopath", "naturopathy", "\\bnd\\b", "naturopathic"],
    note: "A surprisingly broad benefit — microneedling, cosmetic acupuncture, IV therapy and vitamin injections are often delivered inside a naturopathic visit.",
    unlocks: ["Microneedling", "Cosmetic Acupuncture", "IV Vitamin Therapy", "Vitamin B Injections", "Glutathione Injections"] },
  { key: "acupuncture", label: "Acupuncture",
    keywords: ["acupuncture", "acupuncturist"],
    note: "Covers registered acupuncture — which can include cosmetic acupuncture for skin tone and circulation.",
    unlocks: ["Cosmetic Acupuncture"] },
  { key: "osteopathy", label: "Osteopathy",
    keywords: ["osteopath", "osteopathy"],
    note: "An osteopathy benefit can cover facial manual therapy and craniosacral bodywork, not just back-and-neck work.",
    unlocks: ["Facial Manual Therapy"] },
  { key: "psychology", label: "Psychology / Mental Health",
    keywords: ["psycholog", "psychotherap", "mental health", "social worker", "counsel"],
    note: "Mental-health benefits can extend to neurofeedback when delivered by a registered psychotherapist or psychologist.",
    unlocks: ["Neurofeedback"] },
  { key: "speech", label: "Speech-Language",
    keywords: ["speech", "speech-language", "slp", "pathologist"],
    note: "Rarely-used, but speech-language benefits can cover communication coaching, interview prep and singing voice therapy.",
    unlocks: ["Interview Preparation", "Singing Voice Therapy"] },
  { key: "chiropody", label: "Chiropody / Podiatry",
    keywords: ["chiropody", "chiropodist", "podiatr", "orthotic"],
    note: "Foot-care benefits sometimes include custom orthotics or orthotic footwear with an assessment.",
    unlocks: [] },
  { key: "dietitian", label: "Dietitian / Nutrition",
    keywords: ["dietitian", "dietician", "nutrition"],
    note: "Covers registered dietitian visits for nutrition and metabolic support.",
    unlocks: [] },
];

/* ============================================================
   PILATES CLINICS (41)
   ============================================================ */
const PILATES_CLINICS = [
  { name: "Aurora North Medical Centre", city: "Aurora", loc: "Aurora, ON", prov: "ON", directBill: false, modalities: "Reformer, Mat, Clinical / Rehab", billed: "Physio / Chiro", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://share.google/qvf5UVRrbQMZfx8h5" },
  { name: "BODY MAISON", city: "Toronto", loc: "Toronto, ON (Yonge & Bloor)", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "$125-150", db: "No", web: "https://bodymaison.com" },
  { name: "JC Clinic", city: "North York", loc: "North York, ON", prov: "ON", directBill: false, modalities: "Clinical / Rehab", billed: "Physio / Chiro / Naturo", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://jcclinic.ca", email: "jcclinicto@gmail.com" },
  { name: "Reconnect Wellness", city: "Newmarket", loc: "Newmarket, ON", prov: "ON", directBill: true, modalities: "Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Yes", web: "https://reconphysio.ca", email: "forum@reconphysio.ca" },
  { name: "Bijoy's Physio & Pilates", city: "Aurora", loc: "Aurora, ON", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://www.bijoysphysioandpilates.com" },
  { name: "MVMT Physiotherapy", city: "Vaughan", loc: "Vaughan, ON (Maple)", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "No", web: "https://mvmtphysio.com", email: "feelbetter@mvmtphysio.com" },
  { name: "Rehab Plus Pilates Studio", city: "Richmond Hill", loc: "Richmond Hill, ON", prov: "ON", directBill: false, modalities: "Reformer, Mat, Clinical / Rehab, Prenatal, Group", billed: "Pilates (physio-led)", price: "From $85 (private)", db: "Confirm with clinic", web: "https://www.rehabpluspilates.com", email: "info@rehabpluspilates.com" },
  { name: "Neurocore Physiotherapy & Pilates Centre", city: "Richmond Hill", loc: "Richmond Hill, ON", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab, Group", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://neurocore.ca", email: "info@neurocore.ca" },
  { name: "Revival Physio", city: "East York", loc: "East York, ON (Leaside)", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://www.revivalphysio.ca", email: "ellie@revivalphysio.ca" },
  { name: "Personal Best Physiotherapy, Pilates, Rehabilitation", city: "Toronto", loc: "Toronto, ON (Davisville Village)", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "http://pbphysio.com", email: "personalbestphysio@gmail.com" },
  { name: "Fairlawn Physiotherapy & Rehabilitation Centre", city: "Toronto", loc: "Toronto, ON (Yonge & Lawrence)", prov: "ON", directBill: false, modalities: "Group, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://fairlawnphysiotherapy.com", email: "fairlawnphysiotherapy@rogers.com" },
  { name: "Kinective Health & Performance", city: "Toronto", loc: "Toronto, ON (Forest Hill)", prov: "ON", directBill: false, modalities: "Reformer, Mat, Clinical / Rehab", billed: "Physio / Chiro", price: "Confirm with clinic", db: "No", web: "https://www.kinectivehealth.com", email: "info@kinectivehealth.com" },
  { name: "Kaizen Physiotherapy Group / Kaizen Pilates", city: "Etobicoke", loc: "Etobicoke, ON", prov: "ON", directBill: false, modalities: "Clinical / Rehab, Mat", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://kaizenphysiotherapygroup.ca", email: "info@kaizenphysiogroup.ca" },
  { name: "Pilates4Physio", city: "Toronto", loc: "Toronto, ON (Downtown/Esplanade)", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://pilates4physio.ca", email: "info@pilates4physio.ca" },
  { name: "Toronto Physiotherapy (Danforth & Chester)", city: "Toronto", loc: "Toronto, ON (Danforth)", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "$120 (Physio Pilates)", db: "Confirm with clinic", web: "https://torontophysiotherapy.ca/services/physio-pilates/", email: "info@torontophysiotherapy.ca" },
  { name: "Beachealth", city: "Toronto", loc: "Toronto, ON (East Toronto / Beaches / Danforth / Scarborough)", prov: "ON", directBill: false, modalities: "Reformer, Mat, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://beachealth.com/services/physio-pilates/" },
  { name: "Myo (Myodetox) — Leslieville", city: "Toronto", loc: "Toronto, ON (Leslieville)", prov: "ON", directBill: true, modalities: "Reformer, Clinical / Rehab, Chiro, Massage", billed: "Physio / Chiro / Massage", price: "Confirm with clinic", db: "Yes", web: "https://www.myodetox.com/ca/locations/leslieville" },
  { name: "Myo (Myodetox) — Yorkville", city: "Toronto", loc: "Toronto, ON (Yorkville)", prov: "ON", directBill: true, modalities: "Reformer, Clinical / Rehab, Chiro, Massage", billed: "Physio / Chiro / Massage", price: "Confirm with clinic", db: "Yes", web: "https://www.myodetox.com/ca/locations/yorkville" },
  { name: "Myo (Myodetox) — CityPlace", city: "Toronto", loc: "Toronto, ON (CityPlace)", prov: "ON", directBill: true, modalities: "Reformer, Clinical / Rehab, Chiro, Massage", billed: "Physio / Chiro / Massage", price: "Confirm with clinic", db: "Yes", web: "https://www.myodetox.com/ca/locations/cityplace" },
  { name: "Myo (Myodetox) — Liberty Village", city: "Toronto", loc: "Toronto, ON (Liberty Village)", prov: "ON", directBill: true, modalities: "Reformer, Clinical / Rehab, Chiro, Massage", billed: "Physio / Chiro / Massage", price: "Confirm with clinic", db: "Yes", web: "https://www.myodetox.com/locations/liberty-village" },
  { name: "Myo (Myodetox) — PATH Exchange Tower", city: "Toronto", loc: "Toronto, ON (Financial District/PATH)", prov: "ON", directBill: true, modalities: "Reformer, Clinical / Rehab, Chiro, Massage", billed: "Physio / Chiro / Massage", price: "Confirm with clinic", db: "Yes", web: "https://www.myodetox.com/ca/locations/path-exchange-tower" },
  { name: "Myo (Myodetox) — Richmond Hill", city: "Richmond Hill", loc: "Richmond Hill, ON", prov: "ON", directBill: true, modalities: "Reformer, Clinical / Rehab, Chiro, Massage", billed: "Physio / Chiro / Massage", price: "Confirm with clinic", db: "Yes", web: "https://www.myodetox.com/ca/locations/richmond-hill" },
  { name: "Myo (Myodetox) — Markham", city: "Markham", loc: "Markham, ON", prov: "ON", directBill: true, modalities: "Reformer, Clinical / Rehab, Chiro, Massage", billed: "Physio / Chiro / Massage", price: "Confirm with clinic", db: "Yes", web: "https://www.myodetox.com/ca/locations/markham" },
  { name: "Resilience Physiotherapy — Toronto Annex", city: "Toronto", loc: "Toronto, ON (Annex)", prov: "ON", directBill: false, modalities: "Reformer, Mat, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://www.resiliencephysiotherapy.com", email: "info@resiliencephysiotherapy.com" },
  { name: "New Life Rehab Clinic", city: "North York", loc: "North York / East Toronto, ON", prov: "ON", directBill: false, modalities: "Mat, Clinical / Rehab, Group", billed: "Physio / Chiro", price: "Confirm with clinic", db: "Confirm with clinic" },
  { name: "JDA Physio & Rehabilitation Centre", city: "Richmond Hill", loc: "Richmond Hill, ON", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab, Prenatal", billed: "Physiotherapy / Chiropractic", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://www.jdaphysio.ca", email: "jdaphysio@gmail.com" },
  { name: "Apple Creek Sports Medicine Centre", city: "Markham", loc: "Markham, ON", prov: "ON", directBill: false, modalities: "Clinical / Rehab, Group", billed: "Physio / Chiro / Osteopathy", price: "Confirm with clinic", db: "Confirm with clinic" },
  { name: "My Physio Pilates (Fabia Gouvea Studio)", city: "Etobicoke", loc: "Etobicoke, ON", prov: "ON", directBill: false, modalities: "Reformer, Mat, Clinical / Rehab, Prenatal", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://myphysiopilates.com" },
  { name: "YOHU Wellness Clinic (Dr. Xuanli Monica Wang)", city: "Markham", loc: "Markham, ON", prov: "ON", directBill: false, modalities: "Reformer, Mat, Clinical / Rehab, Group", billed: "Chiropractic", price: "Confirm with clinic", db: "Confirm with clinic" },
  { name: "Alliance Physio (Kareem Hassanein, RPT)", city: "Mississauga", loc: "Mississauga, ON (Winston Churchill Blvd)", prov: "ON", directBill: false, modalities: "Reformer/Mat, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://www.kinetikarephysio.com" },
  { name: "Trafalgar Physiotherapy — pt Health", city: "Oakville", loc: "Oakville, ON", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab, Prenatal/Postpartum", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://www.pthealth.ca" },
  { name: "Physiolab — Olympic Village", city: "Vancouver", loc: "Vancouver, BC (Olympic Village)", prov: "BC", directBill: true, modalities: "Reformer, Mat, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Yes", web: "https://thephysiolab.ca", email: "info@thephysiolab.ca" },
  { name: "Physiolab — Hastings", city: "Vancouver", loc: "Vancouver, BC (Hastings)", prov: "BC", directBill: true, modalities: "Reformer, Mat, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Yes", web: "https://thephysiolab.ca", email: "hastings@thephysiolab.ca" },
  { name: "Focus Physio + Wellness", city: "Vancouver", loc: "Vancouver, BC (Olympic Village)", prov: "BC", directBill: false, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "$130 / 45min assessment", db: "Confirm with clinic", web: "https://focusphysio.ca", email: "info@focusphysio.ca" },
  { name: "Treloar Physiotherapy — Cambie", city: "Vancouver", loc: "Vancouver, BC (Cambie)", prov: "BC", directBill: true, modalities: "Reformer, Mat, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Yes", web: "https://treloarphysio.com", email: "reception@treloarphysio.com" },
  { name: "Treloar Physiotherapy — Kerrisdale", city: "Vancouver", loc: "Vancouver, BC (Kerrisdale)", prov: "BC", directBill: true, modalities: "Reformer, Mat, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Yes", web: "https://treloarphysio.com", email: "tpk@treloarphysio.com" },
  { name: "Envision Physiotherapy — South Granville", city: "Vancouver", loc: "Vancouver, BC (South Granville)", prov: "BC", directBill: true, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Yes", web: "https://envisionphysio.com" },
  { name: "Envision Physiotherapy — False Creek", city: "Vancouver", loc: "Vancouver, BC (False Creek)", prov: "BC", directBill: true, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Yes", web: "https://envisionphysio.com" },
  { name: "Haven Wellness Collective", city: "Vancouver", loc: "Vancouver, BC (Kitsilano)", prov: "BC", directBill: true, modalities: "Reformer, Mat, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Yes", web: "https://havencollective.ca", email: "info@havencollective.ca" },
  { name: "Seven Summits Rehab and Health", city: "Vancouver", loc: "Vancouver, BC (Kitsilano)", prov: "BC", directBill: false, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://sevensummitsrehab.ca", email: "info@sevensummitsrehab.ca" },
  { name: "Launch Rehab — North Burnaby", city: "Burnaby", loc: "Burnaby, BC (North Burnaby)", prov: "BC", directBill: true, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Yes (ICBC / MSP / WorkSafeBC)", web: "https://launchrehab.ca", email: "northburnaby@launchrehab.ca" },
];

const PILATES_CHIPS = ["Reformer", "Mat", "Direct billing", "Physiotherapy", "Chiropractor"];

/* ============================================================
   NATUROPATH CLINICS (61)
   tags: microneedling | cosmetic-acupuncture | iv-therapy |
         vitamin-injections | naturopathic-medicine
   ============================================================ */
const NATURO_CLINICS = [
  { name: "Well BYND", city: "Toronto", loc: "Toronto — 500-460 Richmond St W, M5V 1Y1", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling, Cosmetic Acupuncture, IV Therapy, Vitamin Injections", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.wellbynd.com", tags: ["microneedling","cosmetic-acupuncture","iv-therapy","vitamin-injections"] },
  { name: "Dr. Jen Newell ND", city: "Toronto", loc: "Toronto — 331 Queen St E, M5A 1S9", prov: "ON", db: "No", modalities: "Microneedling, Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://newellnd.ca", tags: ["microneedling","cosmetic-acupuncture"] },
  { name: "Dr. Matthew Pace ND", city: "Toronto", loc: "Toronto — 320 Danforth Ave, M4K 1N8", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture, Aesthetic Naturopathy", billed: "Naturopathy", price: "Confirm with clinic", web: "https://matthewpacend.com", email: "matthew.paceND@gmail.com", tags: ["cosmetic-acupuncture"] },
  { name: "Dr. Saiyemah Khalil ND", city: "Toronto", loc: "Toronto — 17 Atlantic Ave Unit 2, M6K 3E7", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.drkhalilnd.com", email: "saiyemahkhalil@gmail.com", tags: ["cosmetic-acupuncture"] },
  { name: "Integra Health Centre", city: "Toronto", loc: "Toronto — 130 King St W 13th Fl (Exchange Tower), M5X 1C8", prov: "ON", db: "Confirm w/ clinic", modalities: "Naturopathic Medicine", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.integrahealth.ca", tags: ["naturopathic-medicine"] },
  { name: "Dr. Pamela Frank ND", city: "Toronto", loc: "Toronto — 568 St Clair Ave W, M6C 1A5 (Health Haven Clinic)", prov: "ON", db: "Confirm w/ clinic", modalities: "Naturopathic Medicine", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.naturopathtoronto.ca", email: "PFrankND@ForcesofNature.ca", tags: ["naturopathic-medicine"] },
  { name: "Annex Naturopathic Clinic", city: "Toronto", loc: "Toronto — 301-800 Bathurst St, M5R 3M8", prov: "ON", db: "Confirm w/ clinic", modalities: "Vitamin Injections", billed: "Naturopathy", price: "Confirm with clinic", web: "https://citynaturopathic.ca", email: "info@annexnaturopathic.com", tags: ["vitamin-injections"] },
  { name: "Advanced Women's Health (Toronto West)", city: "Toronto", loc: "Toronto — 832 College St", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture, Vitamin Injections", billed: "Naturopathy", price: "$225 initial / $185 follow-up", web: "https://www.advancedwomenshealth.ca", tags: ["cosmetic-acupuncture","vitamin-injections"] },
  { name: "Timeless Health Clinic", city: "Toronto", loc: "Toronto, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Vitamin Therapy", billed: "Naturopathy", price: "Confirm with clinic", tags: ["iv-therapy"] },
  { name: "Dr. Denise Cheung ND (Markham)", city: "Markham", loc: "Markham, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling, Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.drdenisecheung.com", tags: ["microneedling","cosmetic-acupuncture"] },
  { name: "Dr. Denise Cheung ND (Scarborough)", city: "Scarborough", loc: "Scarborough — 2425 Eglinton Ave E #11, M1K 5G8", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling, Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.drdenisecheung.com", tags: ["microneedling","cosmetic-acupuncture"] },
  { name: "Danesh Aesthetics", city: "Richmond Hill", loc: "Richmond Hill — 11160 Yonge St Unit 7, L4S 1K9", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling", billed: "Naturopathy / Dermatology", price: "Confirm with clinic", web: "https://www.daneshaesthetics.com", tags: ["microneedling"] },
  { name: "NatCan Integrative Medical & Wellness Centre", city: "Vaughan", loc: "Vaughan — 3905 Major Mackenzie Dr W Unit 102, L4H 4J9", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Therapy, Naturopathic Medicine", billed: "Naturopathy", price: "Confirm with clinic", web: "https://natcanintegrative.com", tags: ["iv-therapy","naturopathic-medicine"] },
  { name: "NatCan Weight Loss & Skin Clinic", city: "Woodbridge", loc: "Woodbridge — 281 Woodbridge Ave Suite 22, L4L 0C6", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling", billed: "Naturopathy / Medical Aesthetics", price: "Confirm with clinic", web: "https://natcanintegrative.com", tags: ["microneedling"] },
  { name: "pureBalance Wellness", city: "Mississauga", loc: "Mississauga — 219 Lakeshore Rd E, L5G 1G5 (Port Credit)", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Therapy, Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.mypurebalance.ca", tags: ["iv-therapy","cosmetic-acupuncture"] },
  { name: "Aurora Massage & Chiropractic Wellness Centre", city: "Aurora", loc: "Aurora, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy / Acupuncture", price: "Confirm with clinic", tags: ["cosmetic-acupuncture"] },
  { name: "Newmarket Naturopathic Clinic (Dr. Michael Morsillo)", city: "Newmarket", loc: "Newmarket — 16655 Yonge St", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Therapy, Biopuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://drmorsillo.com", tags: ["iv-therapy"] },
  { name: "NewM Clinic (Newmarket)", city: "Newmarket", loc: "Newmarket, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Therapy, Skin Lesion Removal", billed: "Medical Aesthetics", price: "Confirm with clinic", web: "https://newmclinic.com", tags: ["iv-therapy"] },
  { name: "NewM Clinic (Brampton)", city: "Brampton", loc: "Brampton, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Therapy, Skin Lesion Removal", billed: "Medical Aesthetics", price: "Confirm with clinic", web: "https://newmclinic.com", tags: ["iv-therapy"] },
  { name: "NewM Clinic (Scarborough)", city: "Scarborough", loc: "Scarborough, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Therapy, Skin Lesion Removal", billed: "Medical Aesthetics", price: "Confirm with clinic", web: "https://newmclinic.com", tags: ["iv-therapy"] },
  { name: "Oakville Naturopathic Wellness Centre", city: "Oakville", loc: "Oakville, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Therapy, Vitamin Injections", billed: "Naturopathy", price: "Confirm with clinic", web: "https://onwc.ca", tags: ["iv-therapy","vitamin-injections"] },
  { name: "Oakville Naturopathic Doctor", city: "Oakville", loc: "Oakville — 243 North Service Rd W #106E, L6M 3E5", prov: "ON", db: "Confirm w/ clinic", modalities: "Naturopathic Medicine", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.oakvillenaturopathicdoctor.com", tags: ["naturopathic-medicine"] },
  { name: "Sage Naturopathic Clinic (Oakville)", city: "Oakville", loc: "Oakville, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling, Cosmetic Acupuncture, IV Therapy", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.thesageclinic.com", tags: ["microneedling","cosmetic-acupuncture","iv-therapy"] },
  { name: "Mint Integrative Health", city: "Vancouver", loc: "Vancouver — South Granville / Broadway", prov: "BC", db: "Confirm w/ clinic", modalities: "Microneedling (PRF), IV Therapy, Iron Infusions, Cosmetic Acupuncture", billed: "Naturopathy / Medical Aesthetics", price: "Confirm with clinic", web: "https://mintintegrative.com", tags: ["microneedling","iv-therapy","cosmetic-acupuncture"] },
  { name: "Edgemont Naturopathic Clinic", city: "North Vancouver", loc: "North Vancouver — 105-3246 Connaught Crescent", prov: "BC", db: "Yes", modalities: "IV Therapy, Vitamin Injections", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.edgemontnaturopathic.com", tags: ["iv-therapy","vitamin-injections"] },
  { name: "Vancouver Integrated Health Centre", city: "Vancouver", loc: "Vancouver, BC", prov: "BC", db: "Yes", modalities: "IV Therapy, Medical Aesthetics", billed: "Naturopathy", price: "Confirm with clinic", web: "https://vancouverintegratedhealthcentre.com", tags: ["iv-therapy"] },
  { name: "Yaletown Integrative Clinic", city: "Vancouver", loc: "Vancouver — Yaletown", prov: "BC", db: "Confirm w/ clinic", modalities: "Microneedling, Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.yaletownintegrative.com", tags: ["microneedling","cosmetic-acupuncture"] },
  { name: "Qi Integrated Health", city: "Vancouver", loc: "Vancouver — Kitsilano", prov: "BC", db: "Confirm w/ clinic", modalities: "Microneedling, Cosmetic Acupuncture", billed: "Naturopathy / Acupuncture", price: "Confirm with clinic", web: "https://www.qiintegratedhealth.com", tags: ["microneedling","cosmetic-acupuncture"] },
  { name: "Everwell ND", city: "Vancouver", loc: "Vancouver, BC", prov: "BC", db: "Confirm w/ clinic", modalities: "Microneedling (RF), IV Therapy, Vitamin Injections, Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://everwellnd.com", tags: ["microneedling","iv-therapy","vitamin-injections","cosmetic-acupuncture"] },
  { name: "Panda Clinic", city: "Vancouver", loc: "Vancouver, BC", prov: "BC", db: "Yes", modalities: "Microneedling, Cosmetic Injections", billed: "Naturopathy", price: "Confirm with clinic", web: "https://pandaclinic.ca", tags: ["microneedling"] },
  { name: "Local Health Integrative Clinic", city: "Vancouver", loc: "Vancouver, BC", prov: "BC", db: "Confirm w/ clinic", modalities: "Microneedling, PRP Microneedling", billed: "Naturopathy / Acupuncture", price: "Confirm with clinic", web: "https://localhealthclinic.ca", tags: ["microneedling"] },
  { name: "Essence Wellness Clinic (Marda Loop)", city: "Calgary", loc: "Calgary, AB", prov: "AB", db: "Yes", modalities: "Microneedling, IV Therapy, Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.essencewellness.ca", tags: ["microneedling","iv-therapy","cosmetic-acupuncture"] },
  { name: "Essence Wellness Clinic (Sage Hill)", city: "Calgary", loc: "Calgary, AB", prov: "AB", db: "Yes", modalities: "Microneedling, IV Therapy, Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.essencewellness.ca", tags: ["microneedling","iv-therapy","cosmetic-acupuncture"] },
  { name: "Essence Wellness Clinic (Willow Park)", city: "Calgary", loc: "Calgary, AB", prov: "AB", db: "Yes", modalities: "Microneedling, IV Therapy, Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.essencewellness.ca", tags: ["microneedling","iv-therapy","cosmetic-acupuncture"] },
  { name: "Essence Wellness Clinic (Mahogany)", city: "Calgary", loc: "Calgary, AB", prov: "AB", db: "Yes", modalities: "Microneedling, IV Therapy, Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.essencewellness.ca", tags: ["microneedling","iv-therapy","cosmetic-acupuncture"] },
  { name: "Wellness On 1st", city: "Calgary", loc: "Calgary — NW Calgary", prov: "AB", db: "Yes", modalities: "Microneedling, Cosmetic Acupuncture", billed: "Naturopathy / Acupuncture", price: "Confirm with clinic", web: "https://www.wellnesson1st.com", tags: ["microneedling","cosmetic-acupuncture"] },
  { name: "Grassroots Naturopathic Medicine", city: "Calgary", loc: "Calgary, AB", prov: "AB", db: "Confirm w/ clinic", modalities: "Microneedling, IV Therapy, Mesotherapy", billed: "Naturopathy", price: "Confirm with clinic", web: "https://grassrootsnaturopathic.com", tags: ["microneedling","iv-therapy"] },
  { name: "calgarymicroneedling.com (Dr. Trudy Strasser ND RAc)", city: "Calgary", loc: "Calgary, AB", prov: "AB", db: "Yes", modalities: "Microneedling, Cosmetic Acupuncture, IV Therapy", billed: "Naturopathy / Acupuncture", price: "Confirm with clinic", web: "http://calgarymicroneedling.com", tags: ["microneedling","cosmetic-acupuncture","iv-therapy"] },
  { name: "Wholesome Well (Dr. Julia Gill ND)", city: "Calgary", loc: "Calgary, AB", prov: "AB", db: "Yes", modalities: "Naturopathic Medicine", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.wholesomewell.com", tags: ["naturopathic-medicine"] },
  { name: "Sage Naturopathic Clinic (Kitchener)", city: "Kitchener", loc: "Kitchener, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling, Cosmetic Acupuncture, IV Therapy", billed: "Naturopathy", price: "Confirm with clinic", web: "https://thesageclinic.com", tags: ["microneedling","cosmetic-acupuncture","iv-therapy"] },
  { name: "Wellness Place", city: "Newmarket", loc: "Newmarket, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling, Cosmetic Acupuncture, Vitamin Injections, Glutathione Injections", billed: "Naturopathy", price: "Confirm with clinic", tags: ["microneedling","cosmetic-acupuncture","vitamin-injections"] },
  { name: "Bayview Village Wellness Centre", city: "North York", loc: "North York, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Naturopathic Medicine", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.bayviewwellness.com", tags: ["naturopathic-medicine"] },
  { name: "Motion Care Clinic", city: "North York", loc: "North York, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy / Physiotherapy Clinic", price: "Confirm with clinic", web: "https://www.motioncareclinic.com", tags: ["cosmetic-acupuncture"] },
  { name: "Dr. Vishaala Singh ND", city: "Brampton", loc: "Brampton, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.vsinghnd.com", tags: ["cosmetic-acupuncture"] },
  { name: "Etobicoke Naturopath Osteopath Clinic", city: "Etobicoke", loc: "Etobicoke, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://naturopathosteopathclinic.com/etobicoke/", tags: ["cosmetic-acupuncture"] },
  { name: "Sage Naturopathic Clinic (Etobicoke)", city: "Etobicoke", loc: "Etobicoke, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling, Cosmetic Acupuncture, IV Therapy", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.thesageclinic.com", tags: ["microneedling","cosmetic-acupuncture","iv-therapy"] },
  { name: "Natural Health Clinic of Halton (Brampton)", city: "Brampton", loc: "Brampton, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.nhchalton.com", tags: ["cosmetic-acupuncture"] },
  { name: "Brampton Naturopath Osteopath Clinic", city: "Brampton", loc: "Brampton, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://naturopathosteopathclinic.com/brampton/", tags: ["cosmetic-acupuncture"] },
  { name: "Naturopathic Essentials Health Centre", city: "Mississauga", loc: "Mississauga — 1891 Rathburn Rd E, L4W 3Z3", prov: "ON", db: "Confirm w/ clinic", modalities: "Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.naturopathicessentials.com", tags: ["cosmetic-acupuncture"] },
  { name: "Dr. Natalie Cheng-Kai-On ND", city: "Maple", loc: "Maple, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.natdoctor.com", tags: ["cosmetic-acupuncture"] },
  { name: "Be Well Medical Clinic", city: "Thornhill", loc: "Thornhill, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy / Medical Clinic", price: "Confirm with clinic", web: "https://www.bewellmedicalclinic.com", tags: ["cosmetic-acupuncture"] },
  { name: "METALAB", city: "Markham", loc: "Markham, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Drips, NAD IV Therapy, PRP", billed: "Naturopathy / Regenerative Medicine", price: "Confirm with clinic", web: "https://www.metatherapylab.com", tags: ["iv-therapy"] },
  { name: "Richmond Hill Naturopathic Clinic (RHNC)", city: "Richmond Hill", loc: "Richmond Hill, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Naturopathic Medicine", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.richmondhillclinic.com", tags: ["naturopathic-medicine"] },
  { name: "Dr. Brian Yeung ND", city: "Markham", loc: "Markham — 3085 Hwy 7, L3R 0J5", prov: "ON", db: "Confirm w/ clinic", modalities: "Naturopathic Medicine", billed: "Naturopathy", price: "Confirm with clinic", tags: ["naturopathic-medicine"] },
  { name: "Health Globe Wellness Clinic", city: "Mississauga", loc: "Mississauga, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling (RF), Cosmetic Acupuncture, IM/IV Vitamin Therapy", billed: "Naturopathy / Medical Aesthetics", price: "Confirm with clinic", web: "https://healthglobe.ca", tags: ["microneedling","cosmetic-acupuncture","iv-therapy"] },
  { name: "Mississauga Naturopathic Clinic", city: "Mississauga", loc: "Mississauga, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.doctorlore.com", tags: ["cosmetic-acupuncture"] },
  { name: "Mississauga Naturopath Osteopath Clinic", city: "Mississauga", loc: "Mississauga — near Southdown Rd & Lakeshore Rd W", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://naturopathosteopathclinic.com/mississauga/", tags: ["cosmetic-acupuncture"] },
  { name: "Natural Health Clinic of Halton (Mississauga)", city: "Mississauga", loc: "Mississauga, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.nhchalton.com", tags: ["cosmetic-acupuncture"] },
  { name: "Healthier Living Clinic", city: "Mississauga", loc: "Mississauga, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy / TCM", price: "Confirm with clinic", web: "https://hl3.ca", tags: ["cosmetic-acupuncture"] },
  { name: "Richmond Hill Health & Wellness", city: "Richmond Hill", loc: "Richmond Hill, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Naturopathic Medicine, Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://richmondhillhealth.com", tags: ["naturopathic-medicine","cosmetic-acupuncture"] },
  { name: "Pain Ease Naturopathic Clinic", city: "Milton", loc: "Milton, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture, IV Therapy", billed: "Naturopathy", price: "Confirm with clinic", web: "https://painease.ca", tags: ["cosmetic-acupuncture","iv-therapy"] },
];

const NATURO_CHIPS = [
  { id: "microneedling", label: "Microneedling" },
  { id: "cosmetic-acupuncture", label: "Cosmetic Acupuncture" },
  { id: "iv-therapy", label: "IV Therapy" },
  { id: "vitamin-injections", label: "Vitamin Injections" },
  { id: "naturopathic-medicine", label: "Naturopathic Medicine" },
];

/* ============================================================
   GOLF CLINICS (37) — TPI assessments
   ============================================================ */
const GOLF_CLINICS = [
  { name: "Athletify", disc: "Physio", tpi: "TPI Medical 3", loc: "16715 Yonge St, Unit 22, Newmarket, ON L3X 1X4", city: "Newmarket", region: "York", note: "Golf net + simulator", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://athletify.ca/", email: "team@athletify.ca", book: "https://athletify.janeapp.com/" },
  { name: "MOTI Physio", disc: "Physio", tpi: "TPI Medical 3", loc: "16945 Leslie St, Unit 20A, Newmarket, ON L3Y 9A2", city: "Newmarket", region: "York", note: "Golf Rehab", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.motiphysio.ca/tpi-golf-rehab", email: "jonli@motiphysio.ca", book: "https://motiphysio.janeapp.com/locations/moti-physiotherapy-sports-rehab-inc/book" },
  { name: "In Balance Chiropractic + Acupuncture", disc: "Chiro", tpi: "TPI", loc: "2715 Bur Oak Ave, Unit #2, Markham, ON L6B 1K7", city: "Markham", region: "York", note: "Golf Fitness", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.inbalancechiropractic.ca/about-golf-fitness/", email: "info@inbalancechiropractic.ca" },
  { name: "HealthyToDos — Markham Health & Rehab", disc: "Chiro", tpi: "TPI Level 1", loc: "4581 Highway 7 Unit 102, Markham, ON", city: "Markham", region: "York", note: "Dr. Andrew Li · 60–90 min screen", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://healthytodos.com/services/tpi-golf-assessment", email: "info@healthytodos.com", book: "https://healthytodos.janeapp.com/#/tpi-golf-assessment" },
  { name: "Movement Sports Medicine + Physiotherapy", disc: "Physio", tpi: null, loc: "31 Disera Dr, Unit 210, Thornhill, ON L4J 0A7", city: "Thornhill", region: "York", note: "Confirm golf program", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://movementsportsmedicine.com/", email: "Hello@MovementSportsMed.com" },
  { name: "Physiomed — Thornhill", disc: "Physio", tpi: null, loc: "130 Racco Pkwy, Thornhill, ON L4J 4G3", city: "Thornhill", region: "York", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/", email: "thornhill@physiomed.ca" },
  { name: "Physiomed — Vaughan", disc: "Physio", tpi: null, loc: "28 Roytec Rd, #5, Vaughan, ON L4L 8E4", city: "Vaughan", region: "York", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/", book: "https://myclinic.physiomed.ca/?clinicId=3013&lang=en-CA" },
  { name: "The Rehab Grid — Stouffville", disc: "Physio", tpi: "TPI", loc: "Stouffville, ON", city: "Stouffville", region: "York", note: "Golf Physiotherapy", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.therehabgrid.com/north-york-toronto/golf-physiotherapy" },
  { name: "Anchor Health and Performance Clinic", disc: "Chiro", tpi: "TPI Level 1", loc: "5770 Timberlea Blvd, Unit 107, Mississauga, ON L4W 4W7", city: "Mississauga", region: "Peel", note: "Dr. Brett Herlehy", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.anchorhp.ca/tpi-golf-assessment-mississauga", email: "info@anchorhp.com", book: "https://anchorhp.janeapp.com/#/tpi-golf-assessment" },
  { name: "OAK Physio & Wellness", disc: "Physio / Chiro", tpi: "TPI", loc: "1 City Centre Dr, Mississauga, ON", city: "Mississauga", region: "Peel", note: "Adrian, PT — TPI certified", db: "Yes", price: "Confirm with clinic", web: "https://oakphysiowellness.ca/mississauga/team/", email: "mississauga@oakphysiowellness.ca", book: "https://oakphysiowellness.janeapp.com/locations/oak-physio-and-wellness-mississauga/book" },
  { name: "FIT Clinic — ChiroGolf Program", disc: "Chiro", tpi: "TPI", loc: "2250 Bovaird Dr E, Suite 601, Brampton, ON L6R 0W3", city: "Brampton", region: "Peel", note: "Dr. Rashaad Nauth-Ali", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://fitclinic.ca/services/chirogolf-performance-program/", email: "info@fitclinic.ca", book: "https://fitclinic.janeapp.com/" },
  { name: "Sheddon Physiotherapy — Oakville", disc: "Physio", tpi: "TPI Level 1", loc: "1300 Cornwall Rd #103, Oakville, ON", city: "Oakville", region: "Halton", note: "Erin Shapcott · Dartfish video swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.sheddonphysio.com/fit-fore-golf/", email: "erin@sheddonphysio.com" },
  { name: "Sheddon Physiotherapy — Burlington", disc: "Physio", tpi: "TPI Level 1", loc: "695 Plains Rd E, #3 & #4, Burlington, ON L7T 2E8", city: "Burlington", region: "Halton", note: "Erin Shapcott & Liam Munshi · Dartfish swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.sheddonphysio-burlington.com/fit-fore-golf-burlington-clinic/", email: "liam@sheddonphysio.com" },
  { name: "Dynamic Health & Performance", disc: "Chiro", tpi: "TPI", loc: "1660 North Service Rd E, Unit 112, Oakville, ON L6H 7G3", city: "Oakville", region: "Halton", note: "Dr. Jeff Weekes", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.dynamichealthandperformance.ca/site/golf-teams", email: "info@dynamichealthandperformance.ca" },
  { name: "Medical Grade Physiotherapy & Wellness", disc: "Physio / Chiro", tpi: null, loc: "Burlington, ON", city: "Burlington", region: "Halton", note: "Golfers' care", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://medicalgradephysio.ca/blog/physiotherapy-chiropractic-care-for-golfers" },
  { name: "PhysioLinks Rehab Clinic", disc: "Physio", tpi: null, loc: "Burlington, ON", city: "Burlington", region: "Halton", note: "Mandeep Virk · Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiolinksrehab.com/golf-rehab-treatment-burlington" },
  { name: "Burlington Sports Therapy", disc: "Physio / Chiro", tpi: null, loc: "Burlington, ON", city: "Burlington", region: "Halton", note: "Confirm golf program", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://burlingtonsportstherapy.com/" },
  { name: "OMNI Health and Rehab", disc: "Physio", tpi: null, loc: "Milton, ON", city: "Milton", region: "Halton", note: "Confirm golf program", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://omniclinic.ca/programs/physiotherapy" },
  { name: "IMPACT Chiropractic", disc: "Chiro / Physio", tpi: null, loc: "Milton, ON", city: "Milton", region: "Halton", note: "Confirm golf program", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://impactchiropractic.com/physiotherapy/" },
  { name: "Bodywise Health & Rehab", disc: "Chiro", tpi: "TPI Level 1", loc: "385 Wilson St E, Suite 102, Ancaster, ON L9G 2C1", city: "Ancaster", region: "Hamilton", note: "Dr. Andrea Dorman", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.bodywiseancaster.ca/tpi-golf-assessment.html", book: "https://bodywisehealthandrehab.janeapp.com/" },
  { name: "VF Mobility Labs", disc: "Physio", tpi: "TPI Level 1", loc: "Toronto, ON", city: "Toronto", region: "Toronto", note: "Vanessa Foucher", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.vfmobilitylabs.ca/", email: "vanessa@vfmobilitylabs.ca", book: "https://vfmobilitylabs.janeapp.com" },
  { name: "Studio Athletica / Push Pounds Sports Medicine", disc: "Physio", tpi: "TPI", loc: "Toronto, ON", city: "Toronto", region: "Toronto", note: "Video swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.studioathletica.com/titleist-performance-institute-tpi/" },
  { name: "The Rehab Grid — North York", disc: "Physio", tpi: "TPI", loc: "North York, Toronto, ON", city: "Toronto", region: "Toronto", note: "Golf Physiotherapy", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.therehabgrid.com/north-york-toronto/golf-physiotherapy" },
  { name: "Ready Room Health", disc: "Physio", tpi: "TPI", loc: "Toronto, ON", city: "Toronto", region: "Toronto", note: "Manni Wong", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.readyroomhealth.com/blog/article/TPI-golf-screen" },
  { name: "Art of Mobility", disc: "Physio", tpi: "TPI", loc: "Trinity Bellwoods, Toronto, ON", city: "Toronto", region: "Toronto", note: "Justin Mah", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://artofmobility.com/toronto/tpi-golf-physiotherapy/", email: "team@artofmobility.com", book: "https://artofmobility.janeapp.com/" },
  { name: "Ohana Wellness Clinic", disc: "Chiro", tpi: "TPI", loc: "Bloor West Village, Toronto, ON", city: "Toronto", region: "Toronto", note: "Dr. Julian Colantonio", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://ohanawellnessclinic.com/golf-swing-assessment/", email: "info@ohanawellnessclinic.com", book: "https://ohanawellness.janeapp.com/#/discipline/25/treatment/332" },
  { name: "SHAPE Toronto Health & Wellness", disc: "Physio", tpi: "TPI", loc: "Toronto, ON", city: "Toronto", region: "Toronto", note: "Dr. Sender Deutsch · Golf PARformance", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.shapetoronto.com/training/302-golf-parformance-fitness-program" },
  { name: "Foundation Physiotherapy and Wellness", disc: "Physio", tpi: null, loc: "Cityplace, Toronto, ON", city: "Toronto", region: "Toronto", note: "\"Golf Better\" program", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://foundationphysio.com/physiotherapy-services/athletic-conditions-athletes/golf-swing-assessments/" },
  { name: "Swing Lab – Performance & Therapy", disc: "Athletic Therapy*", tpi: null, loc: "Toronto, ON", city: "Toronto", region: "Toronto", note: "3D motion capture · GTA-wide golf therapy facility", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.swinglabtheory.com/" },
  { name: "Physiomed — Danforth", disc: "Physio", tpi: null, loc: "3331 Danforth Ave, Units C & D, Toronto, ON", city: "Toronto", region: "Toronto", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/", book: "https://myclinic.physiomed.ca/?clinicId=3002&lang=en-CA" },
  { name: "Physiomed — Leaside", disc: "Physio", tpi: null, loc: "86 Laird Dr (Rear), Toronto, ON M4G 3V1", city: "Toronto", region: "Toronto", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/", email: "DrEngineer@physiomed.ca" },
  { name: "Physiomed — Rogers Road", disc: "Physio", tpi: null, loc: "321 Rogers Rd, Toronto, ON", city: "Toronto", region: "Toronto", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/", book: "https://myclinic.physiomed.ca/?clinicId=2764&lang=en-CA" },
  { name: "Physiomed — St. Clair", disc: "Physio", tpi: null, loc: "1176 St. Clair Ave W, Toronto, ON", city: "Toronto", region: "Toronto", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/", book: "https://myclinic.physiomed.ca/?clinicId=1001&lang=en-CA" },
  { name: "Physiomed — Yonge & Bloor", disc: "Physio", tpi: null, loc: "7 Isabella St, Toronto, ON", city: "Toronto", region: "Toronto", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/", book: "https://myclinic.physiomed.ca/?clinicId=3000&lang=en-CA" },
  { name: "Physiomed — Bellamy", disc: "Physio", tpi: null, loc: "1920 Ellesmere Rd, Unit 106, Scarborough, ON M1H 2V5", city: "Scarborough", region: "Scarborough", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/" },
  { name: "Physiomed — Kennedy", disc: "Physio", tpi: null, loc: "1399 Kennedy Rd, Suite 11A, Scarborough, ON M1P 2L6", city: "Scarborough", region: "Scarborough", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/" },
  { name: "Physiomed — Whitby, Thickson", disc: "Physio", tpi: null, loc: "1614 Dundas St E, Suite 110, Whitby, ON L1N 8Y8", city: "Whitby", region: "Durham", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/" },
];

const GOLF_REGIONS = ["York", "Peel", "Halton", "Hamilton", "Toronto", "Scarborough", "Durham"];
