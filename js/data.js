/* ============================================================
   WellFinder data
   All clinic listings are scraped from public sources in the
   original project. Confirm pricing, billing and coverage with
   each clinic before booking.
   ============================================================ */

/* ---------- Treatments (home directory) ---------- */
const TREATMENTS = [
  { group: "Move Better", name: "Clinical Pilates", billed: "Physio / Chiro",
    categories: ["Physiotherapy", "Chiropractic"], link: "/pilates",
    desc: "One-on-one reformer or movement sessions guided by a physiotherapist or rehab professional. A workout experience with a clinical twist — great for posture, strength, mobility, and injury prevention.",
    detail: "Because the session is delivered by a regulated physiotherapist or chiropractor, it's billed as physiotherapy or chiropractic rather than as a fitness class — which is why it often lands inside your extended health benefits." },

  { group: "Move Better", name: "Facial Manual Therapy", billed: "Osteopathy",
    categories: ["Osteopathy"], link: null,
    desc: "Gentle facial and jaw-focused bodywork using techniques like craniosacral and myofascial release. Facial relaxation meets whole-body alignment — cleanse, massage, and finish with a mask.",
    detail: "Delivered by an osteopathic practitioner, so it's typically claimed under an osteopathy benefit. Confirm your osteopathy allowance and whether your plan recognizes your provider's designation." },

  { group: "Move Better", name: "Golf Swing Assessment", billed: "Physio / Chiro",
    categories: ["Physiotherapy", "Chiropractic"], link: "/golf",
    desc: "A TPI movement screen for golfers — mobility, stability, and rotation — run by a TPI-certified physiotherapist or chiropractor, not a golf pro.",
    detail: "Because it's a physical screen delivered by a physio or chiro, it's billed like any other physio/chiro visit — worth checking your benefits before assuming it's an out-of-pocket golf lesson." },

  { group: "Look & Feel Better", name: "Cosmetic Acupuncture", billed: "Acupuncture / Naturo",
    categories: ["Acupuncture", "Naturopathy"], link: "/naturopath",
    desc: "Fine needle treatments focused on skin tone, circulation, and a natural glow.",
    detail: "Often provided by a naturopathic doctor or registered acupuncturist, so it can be claimed under naturopathy or acupuncture depending on the provider's credentials and your plan." },

  { group: "Look & Feel Better", name: "Microneedling", billed: "Naturopathy*",
    categories: ["Naturopathy"], link: "/naturopath",
    desc: "Collagen-focused skin treatment often paired with a naturopathic skin consultation. *Coverage varies by provider.",
    detail: "When performed within a naturopathic visit, part of the appointment may be claimable under naturopathy. Coverage varies widely — always confirm with the clinic and your insurer first." },

  { group: "Look & Feel Better", name: "IM Vitamin Therapy", billed: "Naturopathy",
    categories: ["Naturopathy"], link: "/naturopath",
    desc: "Vitamin B12 and glutathione shots given as quick intramuscular injections, often explored for energy and skin wellness goals.",
    detail: "Administered during a naturopathic appointment and typically billed under naturopathy. Ask whether the injectable itself and the visit are billed separately." },

  { group: "Look & Feel Better", name: "IV Vitamin Therapy", billed: "Naturopathy",
    categories: ["Naturopathy"], link: "/naturopath",
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

  { group: "Look & Feel Better", name: "Red Light Therapy", billed: "Physio / Chiro",
    categories: ["Physiotherapy", "Chiropractic"], link: null,
    desc: "Panels of red and near infrared light aimed at skin health, muscle recovery, and joint comfort. Offered at physio and chiro clinics as part of rehab, and at wellness studios for skin.",
    detail: "When delivered as part of a physiotherapy or chiropractic treatment plan, red light sessions are often billed under that visit rather than as a standalone wellness service." },

  { group: "Perform Better", name: "Cryotherapy", billed: "Physiotherapy",
    categories: ["Physiotherapy"], link: null,
    desc: "Brief exposure to extreme cold, through whole body chambers or targeted applicators, used for muscle recovery, inflammation, and soreness after training.",
    detail: "Sports physio clinics that offer cryo as part of recovery programming typically bill the visit as physiotherapy. Standalone cryo studios without regulated practitioners usually cannot be claimed." },

  { group: "Look & Feel Better", name: "Head Spa", billed: "Massage Therapy",
    categories: ["Massage Therapy"], link: null,
    desc: "The viral scalp treatment: deep cleanse, exfoliation, massage, and steam. Reimagined as therapy when performed by a registered massage therapist.",
    detail: "A head spa performed by an RMT can be billed as massage therapy. The same treatment at a salon without a registered practitioner cannot be claimed." },

  { group: "Perform Better", name: "Hyperbaric Oxygen Therapy", billed: "Medical",
    categories: ["Medical"], link: null,
    desc: "Breathing pure oxygen inside a pressurized chamber, used for recovery, energy, and tissue healing. In Ontario this is offered at physician led clinics.",
    detail: "Ontario hyperbaric clinics are physician led rather than naturopathic, so sessions fall under medical care. Availability in the GTA is limited, so confirm the clinic and the billing before booking." },

  { group: "Look & Feel Better", name: "Medical Botox", billed: "Dental / Medical",
    categories: ["Dental", "Medical"], link: null,
    desc: "Therapeutic botox for jaw clenching, TMJ pain, and chronic migraines. This is medical treatment, not the cosmetic kind.",
    detail: "When prescribed for TMJ dysfunction or chronic migraine, botox is a medical or dental treatment rather than a cosmetic one, which changes how it can be claimed. Confirm with your provider and your plan first." },

  { group: "Brain & Mind", name: "Sleep Coaching", billed: "Psychology",
    categories: ["Psychology"], link: null,
    desc: "Structured programs for insomnia and poor sleep, often based on CBT for insomnia, delivered by psychologists or sleep therapists.",
    detail: "CBT for insomnia is an evidence based psychological treatment. When delivered by a registered psychologist, sessions typically fall under psychology benefits." },

  { group: "Move Better", name: "Pelvic Floor Physiotherapy", billed: "Physiotherapy",
    categories: ["Physiotherapy"], link: null,
    desc: "Assessment and treatment of the pelvic floor muscles for incontinence, postpartum recovery, pelvic pain, and core strength.",
    detail: "Delivered by physiotherapists with pelvic health training, so it bills as physiotherapy like any other physio visit. Many people pay out of pocket without realizing it is covered." },

  { group: "Perform Better", name: "Bike Fitting", billed: "Physiotherapy",
    categories: ["Physiotherapy"], link: null,
    desc: "A professional bike fit assessing your position, movement, and comfort on the bike, run by a physiotherapist instead of a bike shop.",
    detail: "When a physiotherapist performs the fit as a musculoskeletal assessment, it can be billed as physiotherapy. A retail bike shop fit cannot be claimed." },

  { group: "Perform Better", name: "Running Gait Analysis", billed: "Physiotherapy",
    categories: ["Physiotherapy"], link: null,
    desc: "Video and movement analysis of your running form to address pain, improve efficiency, and prevent injury.",
    detail: "Offered at physiotherapy clinics as part of an assessment, so it typically bills as physiotherapy rather than as a coaching service." },

  { group: "Move Better", name: "Shockwave Therapy", billed: "Physio / Chiro",
    categories: ["Physiotherapy", "Chiropractic"], link: null,
    desc: "Acoustic wave treatment for stubborn tendon issues like plantar fasciitis and tennis elbow, offered at physio and chiro clinics.",
    detail: "Delivered as part of a physiotherapy or chiropractic treatment plan, so it is usually billed under that visit." },

  { group: "Move Better", name: "TMJ Massage", billed: "Massage Therapy",
    categories: ["Massage Therapy"], link: null,
    desc: "Targeted jaw, neck, and head massage for teeth grinding, clenching, and jaw pain, including intra oral techniques.",
    detail: "Performed by a registered massage therapist, it bills as massage therapy. Many people live with jaw pain without knowing this option exists in their benefits." },

  { group: "Move Better", name: "Lymphatic Drainage", billed: "Massage Therapy",
    categories: ["Massage Therapy"], link: null,
    desc: "Gentle rhythmic massage that supports lymph flow, often used after surgery or for swelling and fluid retention.",
    detail: "When performed by an RMT as part of recovery care, it bills as massage therapy." },

  { group: "Brain & Mind", name: "Couples Therapy", billed: "Psychology",
    categories: ["Psychology", "Psychotherapy"], link: null,
    desc: "Structured relationship counselling with a psychologist or registered psychotherapist, including approaches like the Gottman method.",
    detail: "Many people assume couples therapy is never covered, but sessions with a registered provider typically fall under psychology or psychotherapy benefits." },

  { group: "Brain & Mind", name: "Mental Performance Coaching", billed: "Psychology",
    categories: ["Psychology"], link: null,
    desc: "Mindset coaching for athletes, performers, and executives: focus, confidence, and pressure management with a sports psychologist.",
    detail: "Delivered by a registered psychologist, performance coaching is a psychological service rather than generic life coaching, which is why it can fall under psychology benefits." },

  { group: "Perform Better", name: "Accent Modification", billed: "Speech Therapy",
    categories: ["Speech Therapy"], link: null,
    desc: "Speech therapy for clearer communication: pronunciation, rhythm, and confidence for professionals speaking English as an additional language.",
    detail: "Delivered by a speech language pathologist, so it bills as speech therapy like any other speech service." },

  { group: "Perform Better", name: "Myofunctional Therapy", billed: "Speech Therapy",
    categories: ["Speech Therapy"], link: null,
    desc: "Exercises for tongue posture, breathing, and swallowing patterns, used for mouth breathing, orthodontic relapse, and sleep quality.",
    detail: "Offered by speech language pathologists and some dental clinics, it bills as speech therapy when delivered by a registered provider." },

  { group: "Look & Feel Better", name: "Facial Gua Sha", billed: "Acupuncture",
    categories: ["Acupuncture"], link: null,
    desc: "Traditional Chinese medicine facial technique using smooth stone tools for circulation, tension, and glow, performed at acupuncture clinics.",
    detail: "When performed by a registered acupuncturist as part of TCM treatment, it typically bills under acupuncture benefits." },

  { group: "Perform Better", name: "Sports Nutrition", billed: "Dietitian",
    categories: ["Dietitian"], link: null,
    desc: "Meal planning and fueling strategies from a registered dietitian for training, performance, and recovery.",
    detail: "Registered dietitian is a covered category in many extended health plans, yet most people never check. Sessions bill as dietitian services." },
];


const TREATMENT_GROUPS = ["Move Better", "Look & Feel Better", "Perform Better", "Brain & Mind"];
const TREATMENT_TABS = ["All", "Physiotherapy", "Chiropractic", "Osteopathy", "Naturopathy", "Acupuncture", "Speech Therapy", "Psychotherapy"];

/* ---------- Treatment cover art (one per group) ---------- */
const TREATMENT_ART = {
  "Move Better": "/assets/treat-move.jpg",
  "Look & Feel Better": "/assets/treat-look.jpg",
  "Perform Better": "/assets/treat-perform.jpg",
  "Brain & Mind": "/assets/treat-mind.jpg",
};

/* ---------- New treatment clinic datasets (phase 2) ---------- */
const REDLIGHT_CLINICS = [
  { name: "RMT Movement", city: "Brampton", web: "https://www.rmtmovement.ca/med-spa-brampton/red-light-therapy", billed: "Physiotherapy", note: "Sessions $40-$100; direct billing; clinic offers physiotherapy", prov: "ON" },
  { name: "PhysioActive", city: "Thornhill", web: "https://www.physioactive.ca/our-services/technology/", billed: "Physiotherapy", note: "Full-size red/infrared light unit used within physiotherapy care plans", prov: "ON" },
  { name: "Performance Recovery Therapy", city: "Toronto", web: "https://prtherapyinc.com/services/recovery-room.html", billed: "Physiotherapy/Chiropractic", note: "Recovery Room red light: $15 drop-in or $40-$50/mo membership; FAQ says insurance doesn't cover Recovery Room sessions directly", prov: "ON" },
  { name: "Pillars of Wellness", city: "Burlington", web: "https://pillarsofwellness.ca/service/book-red-light-therapy-in-burlington/", billed: "Physiotherapy", note: "Intro $25 (reg $39); billable as physiotherapy add-on or under physio supervision", prov: "ON" },
  { name: "Northstone Chiropractic", city: "Greater Sudbury", web: "https://www.northstonechiropractic.ca/bioflex-laser-therapy", billed: "Chiropractic", note: "BioFlex photobiomodulation (red/near-infrared light); complements chiropractic plans", prov: "ON" },
  { name: "Active Chiropractic", city: "Paris", web: "https://activechiro.ca/cold-laser-therapy/", billed: "Chiropractic", note: "Theralase cold laser (660nm red light photobiomodulation); covered by chiropractic plans", prov: "ON" },
  { name: "Athlete's Care", city: "Toronto", web: "https://www.athletescare.com/content/index.php?pid=15&id=299", billed: "Physiotherapy/Chiropractic", note: "Deep-tissue laser (red/infrared photobiomodulation) by physiotherapist or chiropractor; covered as physio/chiro adjunct", prov: "ON" },
  { name: "Core Wellness Centre", city: "Toronto", web: "https://corewellnesscentre.ca/shockwave-therapy-toronto", billed: "Physiotherapy/Chiropractic", note: "Cold laser therapy assessed by physiotherapist or chiropractor; St Clair West", prov: "ON" }
];

const CRYO_CLINICS = [
  { name: "York Rehab Clinic", city: "Richmond Hill", web: "https://www.yorkrehabclinic.ca/blog/cryotherapy-in-richmond-hill-targeted-cold-therapy-with-our-new-btl-cryotherapy-system/", billed: "Physiotherapy", note: "BTL localized cryotherapy (-35C cold air) built into a physiotherapy plan; clinician-guided", prov: "ON" },
  { name: "Lakeside Health and Sport", city: "Oakville", web: "https://lakesidehealthandsport.com/", billed: "Physiotherapy", note: "Cryotherapy listed among physiotherapy session modalities; direct billing", prov: "ON" }
];

const SHOCKWAVE_CLINICS = [
  { name: "Rosedale Wellness Centre", city: "Toronto", web: "https://www.rosedalewellness.com/shockwave", billed: "Physiotherapy", note: "Physiotherapists deliver radial shockwave; 120 Bloor St E", prov: "ON" },
  { name: "Core Wellness Centre", city: "Toronto", web: "https://corewellnesscentre.ca/shockwave-therapy-toronto", billed: "Physiotherapy/Chiropractic", note: "First visit assessed by physiotherapist or chiropractor; St Clair West", prov: "ON" },
  { name: "Integra Health", city: "Toronto", web: "https://www.integrahealth.ca/shockwave-therapy", billed: "Physiotherapy/Chiropractic", note: "Chiro + physio team; downtown 130 King St W; extended-benefit billing", prov: "ON" },
  { name: "Yorkville Sports Medicine", city: "Toronto", web: "https://www.yorkvillesportsmed.com/shockwave-therapy-toronto", billed: "Physiotherapy/Chiropractic", note: "$105 per 30-min visit; billed under chiropractic or physiotherapy at patient's choice", prov: "ON" },
  { name: "Athlete's Care", city: "Toronto", web: "https://www.athletescare.com/content/index.php?pid=15&id=297", billed: "Physiotherapy/Chiropractic", note: "Registered physiotherapists and chiropractors; covered by many Ontario extended plans", prov: "ON" },
  { name: "Leaside Sports Medicine", city: "Toronto", web: "https://www.leasidesportsmedicine.com/services/shockwave-therapy/", billed: "Physiotherapy/Chiropractic", note: "$60-$100 per session; direct billing; 1929 Bayview Ave", prov: "ON" },
  { name: "Toronto Chiropractic Services", city: "Toronto", web: "https://torontochiropracticservices.com/services/", billed: "Chiropractic", note: "Radial shockwave by Dr. Adrian Cohen; 206 Dupont St", prov: "ON" },
  { name: "Kent Chiro-Med Wellness Clinic", city: "Ottawa", web: "https://www.kentchiromed.com/shockwave-therapy-ottawa/", billed: "Physiotherapy/Chiropractic", note: "Shockwave $30 add-on to physio/chiro visit; 563 Gladstone Ave", prov: "ON" },
  { name: "Dynamic Physiotherapy", city: "Mississauga", web: "https://www.dynamicphysiotherapy.ca/", billed: "Physiotherapy", note: "Physio clinic since 1996; direct billing; shockwave for tendon pain", prov: "ON" },
  { name: "Pro-Active Physiotherapy Clinic", city: "Mississauga", web: "https://www.proactiveclinic.ca/shockwave-therapy/", billed: "Physiotherapy", note: "Shockwave by skilled physiotherapists; direct billing", prov: "ON" },
  { name: "Delta Physiotherapy & Rehab", city: "Mississauga", web: "https://www.deltaphysiotherapy.ca/shockwave-therapy", billed: "Physiotherapy", note: "Licensed therapists; Storz shockwave device; covered by most private insurance", prov: "ON" },
  { name: "Hamilton Physio & Rehab", city: "Hamilton", web: "https://www.hamiltonphysiorehab.ca/Services/Shockwave-Therapy", billed: "Physiotherapy", note: "Direct billing to extended benefits; 200 James St S", prov: "ON" },
  { name: "Proremedy Physiotherapy", city: "Mississauga", web: "https://proremedyphysio.com/shockwave-therapy/", billed: "Physiotherapy", note: "Registered physiotherapists; direct billing; Streetsville location", prov: "ON" },
  { name: "Activa Physiotherapy", city: "Ottawa", web: "https://activa.com/services/", billed: "Physiotherapy", note: "Shockwave modality; covered by most insurance providers", prov: "ON" }
];

const HEADSPA_CLINICS = [
  { name: "Da Estrela Wellness", city: "Guelph", web: "https://www.daestrelawellness.ca/blog/discover-the-japanese-head-spa-experience-in-guelph-at-da-estrela-wellness", billed: "Massage Therapy", note: "Japanese head spa performed by RMTs", prov: "ON" },
  { name: "Tonic Physiotherapy & Rehabilitation Centre", city: "Milton", web: "https://tonicphysio.com/registered-massage-therapy/indie-head-massage/", billed: "Massage Therapy", note: "Indian head massage by registered massage therapists", prov: "ON" },
  { name: "Savannah Massage Therapy & Wellness Clinic", city: "Kitchener-Waterloo", web: "https://savannahmassage.ca/", billed: "Massage Therapy", note: "Indie head massage by RMT team, direct billing", prov: "ON" }
];

const TMJMASSAGE_CLINICS = [
  { name: "Liam O'Reilly RMT", city: "Toronto", web: "https://www.liamrmt.com/tmj-massage-toronto", billed: "Massage Therapy", note: "TMJ massage incl. intra-oral by RMT; 600 Sherbourne St", prov: "ON" },
  { name: "The Holistic Move", city: "Toronto", web: "https://theholisticmove.com/tmj-massage-toronto/", billed: "Massage Therapy", note: "Tim Wong RMT, CMTO-licensed; Yorkville", prov: "ON" },
  { name: "Rebalance Sports Medicine", city: "Toronto", web: "https://rebalancetoronto.com/blog/how-massage-therapy-can-help-with-jaw-pain-and-tmj-dysfunction/", billed: "Massage Therapy", note: "Desiree Caceres Ramirez RMT; University & King", prov: "ON" },
  { name: "Frame Fidelity", city: "Toronto", web: "https://www.framefidelity.com/post/tmj-massage-a-natural-and-effective-remedy-for-jaw-pain", billed: "Massage Therapy", note: "Michael Ioannou RMT; 505 Eglinton Ave W", prov: "ON" },
  { name: "Restoracare Health", city: "Toronto", web: "https://restoracarehealth.com/buccal-massage-toronto", billed: "Massage Therapy", note: "Buccal massage for TMJ by RMTs; Sugar Beach", prov: "ON" },
  { name: "Bravella Health", city: "Ottawa", web: "https://ottawa.bravellahealth.com/massage-therapy-ottawa/", billed: "Massage Therapy", note: "Abby Delarge RMT (CMTO); TMJ massage therapy listed", prov: "ON" },
  { name: "Trish Scott RMT", city: "London", web: "https://trishscottrmt.ca/buccal", billed: "Massage Therapy", note: "Buccal intraoral massage for TMJ dysfunction", prov: "ON" },
  { name: "Oliver RMT", city: "Waterloo", web: "https://www.oliver-rmt.com/landing/somatic-massage-body-awareness-waterloo.html", billed: "Massage Therapy", note: "Oliver Bee Dasey-Springer RMT; treats TMJ", prov: "ON" },
  { name: "Savannah Massage Therapy & Wellness Clinic", city: "Kitchener-Waterloo", web: "https://savannahmassage.ca/", billed: "Massage Therapy", note: "Therapeutic massage for TMJ by RMT team, direct billing", prov: "ON" }
];

const LYMPH_CLINICS = [
  { name: "Integra Health", city: "Toronto", web: "https://www.integrahealth.ca/skinlab-services/lymphatic-drainage-massage", billed: "Massage Therapy", note: "Full body MLD by RMT; Financial District; benefits-eligible", prov: "ON" },
  { name: "Body & Mind Osteopathic Clinic", city: "Toronto", web: "https://www.bodyandmind.clinic/manual-lymphatic-drainage/", billed: "Massage Therapy", note: "Vadzim Siniauski RMT; North York; RMT receipts issued", prov: "ON" },
  { name: "RMT Movement", city: "Brampton", web: "https://www.rmtmovement.ca/massage-therapy-mississauga/lymphatic-drainage", billed: "Massage Therapy", note: "$130/60min; RMTs trained in lymphatic massage, direct billing", prov: "ON" },
  { name: "Triada Health Ottawa", city: "Ottawa", web: "https://triadahealthottawa.com/manual-lymphatic-drainage-ottawa/", billed: "Massage Therapy", note: "Carly Smith RMT MLD-C; Nepean; direct billing", prov: "ON" },
  { name: "Ottawa Cancer and Lymphatics Centre", city: "Ottawa", web: "https://breastrehab.ca/massage-therapy/", billed: "Massage Therapy", note: "RMTs with 300+ hrs lymphatic training", prov: "ON" },
  { name: "Tannis Maciel RMT", city: "Kitchener-Waterloo", web: "https://tannismacielrmt.com/", billed: "Massage Therapy", note: "RMT lymphatic specialist; invoices under RMT benefits", prov: "ON" },
  { name: "Mulberry Wellness", city: "Hamilton", web: "https://www.mulberrywellness.ca/lymphatic-drainage-massage", billed: "Massage Therapy", note: "RMT team incl. Vodder MLD Level 1; 166 Bay St N", prov: "ON" },
  { name: "Swelling Solutions Lymphatic Health Centre", city: "Waterloo", web: "https://www.lymphkr.com/", billed: "Massage Therapy", note: "Catharine Burt BScN RMT CDT; oncology lymphedema therapist", prov: "ON" },
  { name: "Savannah Massage Therapy & Wellness Clinic", city: "Kitchener-Waterloo", web: "https://savannahmassage.ca/", billed: "Massage Therapy", note: "Manual lymph drainage primary treatment; RMT team, direct billing", prov: "ON" }
];

const PELVIC_CLINICS = [
  { name: "Proactive Pelvic Health Centre", city: "Toronto", web: "https://www.proactiveph.com/contact-toronto-west", billed: "Physiotherapy", note: "Little Italy clinic; one-on-one private treatment rooms", prov: "ON" },
  { name: "Maja Degen Physiotherapy & Pelvic Floor Physiotherapy", city: "Toronto", web: "https://www.majadegenphysiotherapist.com/", billed: "Physiotherapy", note: "Beaches; orthopaedic and pelvic health physiotherapist", prov: "ON" },
  { name: "Men's Pelvic Floor Physiotherapy Clinic", city: "Vaughan", web: "https://www.menspelvicfloorphysiotherapy.ca/", billed: "Physiotherapy", note: "Male pelvic floor specialist PT; free phone consultation", prov: "ON" },
  { name: "RCP Health", city: "Oakville", web: "https://rcphealth.ca/service/physiotherapy/pelvic-floor-physiotherapy-oakville/", billed: "Physiotherapy", note: "Registered PTs; direct billing; no referral needed", prov: "ON" },
  { name: "Palermo Physiotherapy & Wellness Centre", city: "Oakville", web: "https://palermophysio.ca/category/physiotherapy/pelvic-floor-physiotherapy/", billed: "Physiotherapy", note: "Level 3 certified pelvic floor PT (CPO member)", prov: "ON" },
  { name: "Athlete's Care Sports Medicine Centres", city: "Toronto", web: "http://www.athletescare.com/sports-medicine-services/pelvic-health-physiotherapy~3~324.html", billed: "Physiotherapy", note: "GTA-wide locations; consult $159, follow-up $109", prov: "ON" },
  { name: "PhysioZen Physiotherapy Clinic", city: "Scarborough", web: "http://physiozen.ca/pelvic-physiotherapy", billed: "Physiotherapy", note: "Certified pelvic health PT; Lawrence Warden Medical Centre", prov: "ON" },
  { name: "Axis Therapy and Performance", city: "Mississauga", web: "https://axistherapy.com/pelvic-floor-physiotherapy-mississauga/", billed: "Physiotherapy", note: "6 GTA locations; integrated physio clinic", prov: "ON" },
  { name: "PhysioDNA", city: "Toronto", web: "https://physiodna.com/pelvic-health-physiotherapy/", billed: "Physiotherapy", note: "Bloor West Village; post-grad certified pelvic health PTs", prov: "ON" },
  { name: "Delta Physiotherapy & Rehab", city: "Mississauga", web: "https://www.deltaphysiotherapy.ca/pregnancy-chiropractic-care", billed: "Physiotherapy", note: "Erin Mills location only; licensed Ontario PTs", prov: "ON" },
  { name: "Rebirth Wellness Centre", city: "London", web: "https://www.rebirthwellness.ca/pelvic-floor-physiotherapy", billed: "Physiotherapy", note: "Assessment $165; follow-ups $90-$165", prov: "ON" }
];

const BIKEFIT_CLINICS = [
  { name: "Revive Health", city: "Hamilton", web: "https://hamontphysio.ca/services/physio-bike-fitter/", billed: "Physiotherapy", note: "Physiotherapist-led bike fittings; Kirkendall neighbourhood", prov: "ON" },
  { name: "Back Works Physiotherapy", city: "Waterloo", web: "https://www.backworksphysiotherapy.ca/our-services", billed: "Physiotherapy", note: "Custom bike fit by a registered physiotherapist; serving KW since 1993", prov: "ON" },
  { name: "Peak To Shore Physiotherapy & Sports Medicine", city: "Collingwood", web: "https://peaktoshorephysiotherapy.com/newsletter/pedal-smarter-how-our-physiotherapists-can-support-your-cycling-goals/", billed: "Physiotherapy", note: "Comprehensive bike-fitting services by physiotherapists; also Stayner/Wasaga Beach", prov: "ON" },
  { name: "Active Health Institute", city: "Ottawa", web: "https://activehealthinstitute.janeapp.com/", billed: "Physiotherapy", note: "Physiotherapist + bike fitter (Alyssa); 1,500+ bike fits completed", prov: "ON" }
];

const GAIT_CLINICS = [
  { name: "The Running Physio", city: "Toronto", web: "https://therunningphysio.ca/physical-therapy-treatments/running-assessments/", billed: "Physiotherapy", note: "Running gait analysis (treadmill + slow-motion video); Queen West", prov: "ON" },
  { name: "PhysioPlus Health Group", city: "Toronto", web: "https://physioplushealth.com/orthotics/running-assessment/", billed: "Physiotherapy", note: "Slow-motion frame-by-frame video gait analysis by PT; Bloor West Village", prov: "ON" },
  { name: "The Runner's Academy", city: "Toronto", web: "https://www.therunnersacademy.com/running-gait-analysis-1", billed: "Physiotherapy", note: "Running gait analysis with registered PT team; covered by most extended plans", prov: "ON" },
  { name: "Foundation Physiotherapy & Wellness", city: "Toronto", web: "https://foundationphysio.com/services/specialized-program-based-services/runningprogram/", billed: "Physiotherapy", note: "90-min PT running assessment + treadmill video; assessment $198", prov: "ON" },
  { name: "Back Works Physiotherapy", city: "Waterloo", web: "https://www.backworksphysiotherapy.ca/our-services", billed: "Physiotherapy", note: "Running assessment by registered PT with gait analysis experience", prov: "ON" },
  { name: "Grand River Sports Medicine Centre", city: "Kitchener", web: "https://www.grsm.ca/services/physiotherapy/", billed: "Physiotherapy", note: "Video analysis of running gait by registered physiotherapist; initial $145", prov: "ON" },
  { name: "Live Active Sport Med", city: "Toronto", web: "https://liveactivesportmed.com/running-clinic-toronto/", billed: "Physiotherapy", note: "Run gait analysis + retraining; Beaches & Etobicoke locations", prov: "ON" },
  { name: "Athlete's Care Ottawa", city: "Ottawa", web: "https://www.athletescareottawa.ca/physiotherapy-services/video-analysis-ottawa.html", billed: "Physiotherapy", note: "Video analysis incl. running technique by sports med team with physiotherapists", prov: "ON" }
];

const SLEEP_CLINICS = [
  { name: "Lotus Wellness Psychology Clinic", city: "Richmond Hill", web: "https://lotuswellnessclinic.ca", billed: "Psychology", note: "Dr. Nancy Bahl C.Psych; sleep challenges/insomnia area of focus", prov: "ON" },
  { name: "Harmonia Counselling & Psychotherapy", city: "Toronto", web: "https://www.harmoniacounselling.com", billed: "Psychotherapy", note: "CBT-I insomnia specialist; Mariam Daneshgar MSW RSW psychotherapist; virtual", prov: "ON" },
  { name: "Uprise Psychology & Wellness", city: "Ottawa", web: "https://uprisepsychology.com/sleep-and-insomnia-therapy-in-ottawa/", billed: "Psychology", note: "CBT-I insomnia program; psychologists and registered psychotherapists", prov: "ON" }
];

const COUPLES_CLINICS = [
  { name: "The Cohen Clinic", city: "Toronto", web: "https://thecohenclinic.com/", billed: "Psychology", note: "clinical psychologists and RPs; couples counselling; 1407 Yonge St", prov: "ON" },
  { name: "Couples Counselling Centre", city: "Toronto", web: "https://couplescounsellingcentre.com/", billed: "Psychotherapy", note: "$135-180/session; EFT + Gottman; Toronto downtown + Hamilton", prov: "ON" },
  { name: "Clear Path Solutions", city: "Toronto", web: "https://www.clearpathsolutions.ca/", billed: "Psychology", note: "Dr. Douglas Saunders C.Psych; EFT-based couples therapy; 123 Edward St", prov: "ON" },
  { name: "Horizon Therapy", city: "Toronto", web: "http://www.horizontherapy.ca/", billed: "Psychotherapy", note: "RP/RSW/psychologist team; couples counselling; 455 Avenue Rd", prov: "ON" },
  { name: "Toronto Psychology Clinic", city: "Toronto", web: "https://torontopsychology.com/", billed: "Psychology", note: "registered clinical psychologists; individual and couple therapy; 2 Carlton St", prov: "ON" },
  { name: "Lotus Wellness Psychology Clinic", city: "Richmond Hill", web: "https://lotuswellnessclinic.ca", billed: "Psychology", note: "Dr. Nancy Bahl C.Psych; couples therapy; in-person and virtual", prov: "ON" },
  { name: "CBT Psychology", city: "Thornhill", web: "https://cbtpsychology.com/", billed: "Psychology", note: "PhD clinical psychologists team; includes couples psychologists; 7626 Yonge St", prov: "ON" },
  { name: "Cornerstone Family Counselling", city: "Mississauga", web: "https://cornerstonefamilycounselling.com/who-we-help/couples-therapy/", billed: "Psychotherapy", note: "CRPO-registered RPs; $170/session; EFT + RMFT training", prov: "ON" },
  { name: "Collaborative Therapy", city: "Mississauga", web: "https://www.collaborativetherapist.ca/couples-therapy", billed: "Psychotherapy", note: "RP clinic near Square One; couples sessions $190; EFT + Gottman", prov: "ON" },
  { name: "Anchored Therapy Centre", city: "Mississauga", web: "https://anchoredtherapycentre.com/", billed: "Psychotherapy", note: "registered psychotherapists; couples therapy $160/50 min; also Georgetown", prov: "ON" },
  { name: "Real Life Counselling", city: "Mississauga", web: "https://www.reallifecounselling.com/mississauga-counselling/", billed: "Psychotherapy", note: "all therapists registered RPs; EFT marriage counselling; virtual across Ontario", prov: "ON" },
  { name: "Local Psychotherapy", city: "Toronto", web: "https://www.localpsychotherapy.ca/", billed: "Psychotherapy", note: "RP (Qualifying) CRPO #19262; queer-affirming couples work; 111 Queen St E", prov: "ON" }
];

const MENTALPERF_CLINICS = [
  { name: "The Mental Game Clinic", city: "Toronto", web: "https://www.thementalgame.me/", billed: "Psychology", note: "registered clinical psychologist + Certified Mental Performance Consultant; 1150 Yonge St", prov: "ON" },
  { name: "Heads Up Mental Game Coaching", city: "Toronto", web: "https://www.mentalgamecoaching.ca/", billed: "Psychotherapy", note: "RP-run Mind Gym; mental coaching and sports performance counselling", prov: "ON" },
  { name: "Friesen Sport and Performance Psychology", city: "Grimsby", web: "http://friesenperformance.com/", billed: "Psychology", note: "Dr. Chris Friesen PhD clinical psychologist; peak performance 1:1 sessions", prov: "ON" },
  { name: "The Therapy Collective", city: "Milton", web: "https://thetherapycollective.ca/sports-psychology/", billed: "Psychotherapy", note: "sports mindset training by registered psychotherapist; Milton + virtual Ontario", prov: "ON" },
  { name: "Mindful With You Psychotherapy & Counselling", city: "Ontario", web: "https://www.mindfulwithyou.com/", billed: "Psychotherapy", note: "sports performance therapy by RP; virtual across Ontario", prov: "ON" }
];

const ACCENT_CLINICS = [
  { name: "SpeechScience", city: "Toronto", web: "https://speechscience.com/", billed: "Speech Therapy", note: "Accent modification by SLP Bonnie Gross, First Canadian Place downtown", prov: "ON" },
  { name: "The Speech Associates", city: "Toronto", web: "https://www.speechassociates.ca/", billed: "Speech Therapy", note: "Accent modification by CASLPO-registered SLPs, virtual and in-home", prov: "ON" },
  { name: "HealthCasa", city: "Toronto", web: "https://www.healthcasa.com/slp-ontario", billed: "Speech Therapy", note: "Virtual accent modification by CASLPO-registered SLPs across Ontario", prov: "ON" },
  { name: "SpeechAim", city: "Toronto", web: "http://www.speechaim.com/", billed: "Speech Therapy", note: "Accent work among adult treatment goals, CASLPO-registered SLPs, $130-$160", prov: "ON" },
  { name: "Speak Squad", city: "Burlington", web: "https://www.speaksquad.ca/about-us", billed: "Speech Therapy", note: "Accent modification by Reg. CASLPO SLP Peter Medeiros", prov: "ON" },
  { name: "Kingston Integrated Healthcare (KIHC)", city: "Kingston", web: "https://kihc.ca", billed: "Speech Therapy", note: "Accent modification by CASLPO SLP Adrienne Nobbe", prov: "ON" }
];

const MYOFUNC_CLINICS = [
  { name: "The Speech Associates", city: "Toronto", web: "https://www.speechassociates.ca/", billed: "Speech Therapy", note: "Orofacial Myofunctional Therapy by AOMT-certified SLP, York Region and virtual", prov: "ON" },
  { name: "playTOK", city: "Markham", web: "https://www.playtok.com/Services", billed: "Speech Therapy", note: "OMT assessment $250 by OMT-trained registered SLP", prov: "ON" },
  { name: "Family Speech Clinic", city: "Newmarket", web: "https://familyspeechclinic.com/", billed: "Speech Therapy", note: "OMT-certified Reg. CASLPO SLP Juliana Hifawi", prov: "ON" },
  { name: "Ascent Clinical Services", city: "Brooklin", web: "https://www.ascentclinicalservices.ca/", billed: "Speech Therapy", note: "OMT-certified CASLPO SLP Juliana Hifawi, Whitby/Brooklin clinic", prov: "ON" },
  { name: "Speak Squad", city: "Burlington", web: "https://www.speaksquad.ca/about-us", billed: "Speech Therapy", note: "Myofunctional therapy by SLP Telma Santos, Reg. CASLPO clinic", prov: "ON" },
  { name: "SPOT Speech & OMT", city: "Northwestern Ontario (virtual)", web: "https://spotspeech.com/", billed: "Speech Therapy", note: "CASLPO-registered SLP trained in OMT, virtual Ontario services; clinic in Winnipeg", prov: "ON" }
];

const GUASHA_CLINICS = [
  { name: "MyoCare RMT + Wellness", city: "Toronto", web: "http://www.myocarermt.com/cosmetic-acupuncture-and-facial-rejuvenation/", billed: "Acupuncture", note: "Sculpting Gua Sha Facial by R.ac Scott Koza, $95-$175, Bathurst St", prov: "ON" },
  { name: "Yellow Gazebo Natural Health Care", city: "Toronto", web: "https://yellowgazeboclinic.com/our-services/1016316-2/", billed: "Acupuncture", note: "Jade/rose quartz Gua Sha in cosmetic acupuncture by RAc, $160 per 60min", prov: "ON" },
  { name: "Continuum Wellness", city: "Toronto", web: "https://www.continuumwellness.ca/acupuncture-traditional-chinese-medicine-toronto", billed: "Acupuncture", note: "Facial Gua Sha in cosmetic acupuncture by R.TCMP/R.Ac Liya Derong Li, Yonge & Lawrence", prov: "ON" },
  { name: "NatCan Integrative Health and Wellness Centre", city: "Woodbridge", web: "https://natcanintegrative.com/pages/our-team", billed: "Acupuncture", note: "Gua Sha Lymphatic Drainage Facial by R.Ac Alisa Cesselli", prov: "ON" },
  { name: "Rebalance Sports Medicine", city: "Toronto", web: "https://rebalancetoronto.com/sports-medicine-services/cosmetic-acupuncture-downtown-toronto/", billed: "Acupuncture", note: "Cosmetic acupuncture incl. Gua Sha by TCM registered acupuncturists, direct billing", prov: "ON" }
];

const HBOT_CLINICS = [
  { name: "Ontario HBOT", city: "Toronto", web: "https://www.ontariohbot.ca", billed: "Medical (OHIP)", note: "physician-led; OHIP covers 14 conditions", prov: "ON" },
  { name: "MO2R Medical Oxygen Repair", city: "Mississauga", web: "https://mo2r.ca", billed: "Medical", note: "physician-led; Dr. Wayne Evans, hyperbaric medicine certified", prov: "ON" },
  { name: "Champagne Hyperbarics", city: "Toronto", web: "https://champagnehbot.ca", billed: "Medical (OHIP)", note: "OHIP-covered indications; open 7 days a week", prov: "ON" },
  { name: "Modern Medical Hyperbaric Clinic", city: "Thunder Bay", web: "http://modernmedicalclinic.ca", billed: "Medical (OHIP)", note: "physician-led; all 14 OHIP indications", prov: "ON" }
];

const BOTOX_CLINICS = [
  { name: "Dr. Yolanda Cruz Dentistry On The Path", city: "Toronto", web: "https://torontodentistry.info/tmj/botox-for-tmj-bruxism/", billed: "Dental", note: "therapeutic Botox for TMD/bruxism; not cosmetic", prov: "ON" },
  { name: "North Star Dentistry", city: "Mississauga", web: "https://northstardentistry.ca/services/general-dentistry/therapeutic-botox-mississauga", billed: "Dental", note: "Dr. Mays Al-Saffar; TMD-certified therapeutic Botox", prov: "ON" },
  { name: "Birchmount Dental Group", city: "Scarborough", web: "https://www.birchmountdentalgroup.com/site/botox-scarborough", billed: "Dental", note: "Botox in dental plan for bruxism/TMJ", prov: "ON" },
  { name: "Dundas Dental Group", city: "Toronto", web: "https://dundasdentalgroup.com/index.php/tmj-botox/", billed: "Dental", note: "Dr. Sina Fay; TMJ Botox in The Junction", prov: "ON" },
  { name: "Rejuvenus Clinic", city: "Toronto", web: "https://www.rejuvenusclinic.ca/service-page/botox-for-bruxism-teeth-grinding", billed: "Medical", note: "physician-delivered Botox for bruxism; from $50 deposit", prov: "ON" },
  { name: "HMC Headache Migraine and Concussion Centre", city: "Ajax", web: "https://hmccentre.com/health-services/botox-treatment-for-migraine/", billed: "Medical", note: "Botox for chronic migraine; PREEMPT protocol; OHIP-covered consult", prov: "ON" },
  { name: "Copeland MD", city: "Whitby", web: "https://mdaesthetics.ca/pages/chronic-migraines", billed: "Medical", note: "BOTOX for chronic migraine; OHIP-covered consult; $250 procedure fee", prov: "ON" },
  { name: "Beauty Within", city: "London", web: "https://beautywithin.ca/cosmetic-skin-treatments/chronic-migraine-treatment-with-botox-therapeutic", billed: "Medical", note: "Dr. Tetelbaum; therapeutic Botox for chronic migraine; $200+tax injection fee", prov: "ON" }
];

const NUTRITION_CLINICS = [
  { name: "JM Nutrition", city: "Toronto", web: "https://www.julienutrition.com/dietnutri/pamela-mitri-registered-dietitian/", billed: "Dietitian", note: "Pamela Mitri MSc RD; sports nutrition specialty", prov: "ON" },
  { name: "Studio Athletica", city: "Toronto", web: "https://www.studioathletica.com/recovery/nutrition/registered-dietician/", billed: "Dietitian", note: "registered dietitian consults; sports nutrition counselling", prov: "ON" },
  { name: "ASCEND Rehabilitation", city: "Mississauga", web: "https://ascendrehabilitation.ca/portfolio-item/dietetics-and-nutrition/", billed: "Dietitian", note: "Ben Sit Dietitian; sports nutrition for athletic performance", prov: "ON" },
  { name: "Capital Nutrition Group", city: "Ottawa", web: "https://www.nutritionistottawa.com/", billed: "Dietitian", note: "RD team; sports & performance nutrition; $150-220 initial", prov: "ON" },
  { name: "Sport Nutrition North", city: "Ottawa", web: "https://www.sportnutritionnorth.ca/", billed: "Dietitian", note: "Veronique RD; initial consult $140", prov: "ON" },
  { name: "DRRD Nutrition", city: "Ottawa", web: "http://www.drrdnutrition.com/specialties/sports-nutrition", billed: "Dietitian", note: "RD team; dedicated sports nutrition service", prov: "ON" },
  { name: "Nepean Sports Medicine & Physiotherapy Centre", city: "Nepean", web: "https://www.nepeansportsmedicine.ca/site/dietitian-nutrition-nepean-ottawa", billed: "Dietitian", note: "RD team; sports nutrition section", prov: "ON" },
  { name: "Peak Nutrition", city: "Toronto", web: "https://csnutrition.ca", billed: "Dietitian", note: "Terence Boateng MHSc RD CSEP-CE; performance nutrition", prov: "ON" },
  { name: "The Spot Rehab Performance & Recovery", city: "Markham", web: "https://www.thespotrehab.com/", billed: "Dietitian", note: "Erica Kao RD; sports nutrition focus", prov: "ON" }
];

/* ---------- Per-treatment provider photos (with credit) ---------- */
const TREATMENT_IMAGES = {
  "Clinical Pilates": { src: "/assets/treatments/clinical-pilates.jpg", credit: "Mindful Movement Centre, Toronto", url: "http://www.mindfulmovementcentre.com/" },
  "Facial Manual Therapy": { src: "/assets/treatments/facial-manual-therapy.jpg", credit: "Coast Therapy, Vancouver", url: "https://coasttherapy.ca/physiotherapy/tmj-tmd-treatment/" },
  "Golf Swing Assessment": { src: "/assets/treatments/golf-swing-assessment.jpg", credit: "Seven Summits Rehab and Health, Vancouver", url: "https://sevensummitsrehab.ca/services-booking/tpi-golf-assessment/" },
  "Cosmetic Acupuncture": { src: "/assets/treatments/cosmetic-acupuncture.jpg", credit: "Tracy's Acupuncture Clinic, Vancouver", url: "https://acupunctureclinicvancouver.com/class/facial-cupuncture/" },
  "Microneedling": { src: "/assets/treatments/microneedling.jpg", credit: "Vertex Aesthetics, Toronto", url: "https://vertexaesthetics.ca/microneedling-in-toronto-on/" },
  "IM Vitamin Therapy": { src: "/assets/treatments/vitamin-b-injections.jpg", credit: "Toronto Functional Medicine Centre, Toronto", url: "http://www.theivlounge.ca/" },
  "IV Vitamin Therapy": { src: "/assets/treatments/iv-vitamin-therapy.jpg", credit: "REJUUV IV Drip Toronto", url: "https://ivdriptoronto.ca/" },
  "Interview Preparation": { src: "/assets/treatments/interview-preparation.jpg", credit: "Coaching with Mona, Toronto", url: "https://coachingwithmona.com/" },
  "Singing Voice Therapy": { src: "/assets/treatments/singing-voice-therapy.jpg", credit: "Melanie Tapson Voice Care, Toronto", url: "https://melanietapson.com/" },
  "Neurofeedback": { src: "/assets/treatments/neurofeedback.jpg", credit: "Elevare, Toronto", url: "https://elevaretrauma.com/neurofeedback/" },
};

/* ---------- Goal pills -> billing categories ----------
   Powers the "Popular categories" pills so they genuinely filter the
   treatment directory instead of being dead anchors. */
const GOAL_MAP = {
  "Pain Relief":   ["Physiotherapy", "Chiropractic", "Osteopathy", "Acupuncture"],
  "Sports Injury": ["Physiotherapy", "Chiropractic"],
  "Mental Health": ["Psychotherapy"],
  "Women's Health":["Naturopathy", "Acupuncture"],
  "Mobility":      ["Physiotherapy", "Chiropractic", "Osteopathy"],
  "Fertility":     ["Naturopathy", "Acupuncture"],
  "Chronic Pain":  ["Physiotherapy", "Acupuncture", "Psychotherapy"],
  "Stress":        ["Psychotherapy", "Naturopathy"],
  "Post Surgery":  ["Physiotherapy"],
  "Children":      ["Speech Therapy"],
  "Seniors":       ["Physiotherapy", "Osteopathy"],
  "Office Workers":["Physiotherapy", "Chiropractic"],
};

/* ---------- Resources ---------- */
const RESOURCES = [
  { tag: "Treatment guide", title: "What is Clinical Pilates?", desc: "How it differs from a studio Pilates class, and why it's billed through physiotherapy.", url: "/blog-clinical-pilates" },
  { tag: "Treatment guide", title: "Clinical Pilates vs Group Pilates: Which Do You Need?", desc: "The differences, who each is for, how benefits may apply, and how to combine both in your week.", url: "/blog-clinical-vs-group-pilates" },
  { tag: "Treatment guide", title: "What Is a TPI Golf Swing Assessment?", desc: "How a TPI assessment looks at the body behind your swing, and how benefits may apply.", url: "/blog-tpi-golf-assessment" },
  { tag: "Treatment guide", title: "TPI vs PGA Golf Assessment: What Is the Difference?", desc: "How clinical TPI and golf instruction differ, and how to combine both.", url: "/blog-tpi-vs-pga-golf-assessment" },
  { tag: "Insurance guide", title: "Can Physiotherapy bill insurance directly?", desc: "What direct billing means, and how to ask a clinic before your first visit." },
  { tag: "Treatment guide", title: "Chiropractor vs. Osteopath — what's the difference?", desc: "Two commonly confused, commonly covered paramedical disciplines, compared." },
];

/* ---------- Insurers ---------- */
const INSURERS = [
  { name: "Sun Life", logo: "/assets/logos/sun-life.svg" },
  { name: "Manulife", logo: "/assets/logos/manulife.svg" },
  { name: "Canada Life", logo: "/assets/logos/canada-life.svg" },
  { name: "GreenShield", logo: "/assets/logos/green-shield.svg" },
  { name: "Blue Cross", logo: "/assets/logos/blue-cross.png" },
  { name: "Desjardins", logo: "/assets/logos/desjardins.svg" },
  { name: "ClaimSecure", logo: "/assets/logos/claimsecure.png" },
  { name: "Equitable Life", logo: "/assets/logos/equitable-life.png" },
  { name: "Beneva", logo: "/assets/logos/beneva.png" },
  { name: "Empire Life", logo: "/assets/logos/empire-life.svg" },
  { name: "People Corporation", logo: "/assets/logos/people-corp.svg" },
  { name: "RWAM", logo: "/assets/logos/rwam.png" },
  { name: "Medavie Blue Cross", logo: "/assets/logos/medavie.svg" },
];

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
    unlocks: ["Microneedling", "Cosmetic Acupuncture", "IV Vitamin Therapy", "IM Vitamin Therapy"] },
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
   FACIAL MANUAL THERAPY CLINICS (16)
   ============================================================ */
const FACIAL_CLINICS = [
  { name: "TMJ Osteopathy and Concussion Care", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Osteopathy", note: "TMJ/jaw-focused osteopathy", web: "https://www.tmjosteopathy.com/",about:"Currently accepting new patients."},
  { name: "Say Word Osteopathy", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Osteopathy", note: "TMJ and jaw issues", web: "https://www.saywordosteopathy.ca/",about:"Treatments designed specifically for you and your body's individual issues"},
  { name: "Body & Mind Osteopathic Clinic", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Osteopathy", note: "cranial osteopathy; Toronto and Vaughan", web: "https://www.bodyandmind.clinic/",about:"Body & Mind Osteopathic Clinic in Toronto & Vaughan provides osteopathy treatments and registered massage therapy to restore your health"},
  { name: "Erica Pearson Osteopathy", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Osteopathy", note: "cranial sacral osteopathy", web: "https://www.ericaosteopathy.com/",about:"Top Rated experienced Osteopath in Toronto. Gentle care, Advanced & Specialized, Complete Family Osteopathy. Relieve Pain & Treat the Root Cause. Book Now!"},
  { name: "Toronto Naturopath Osteopath Clinic", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Osteopathy", note: "cranial sacral therapy", web: "https://naturopathosteopathclinic.com/",about:"Streamlined wellness: practical steps toward better health"},
  { name: "Mississauga Naturopath Osteopath Clinic", city: "Mississauga", loc: "Mississauga, ON", prov: "ON", billed: "Osteopathy", note: "craniosacral therapy; Mississauga location", web: "https://naturopathosteopathclinic.com/",about:"Streamlined wellness: practical steps toward better health"},
  { name: "Continuum Wellness", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Osteopathy", note: "cranial osteopathy; treats TMJ dysfunction", web: "https://www.continuumwellness.ca/",about:"Our life's work is helping you feel your best. Visit the ABOUT US tab to find out what drives us to do what we love."},
  { name: "Mike Fuhr Osteopathy + Massage", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Osteopathy", note: "CranioSacral cornerstone; TMJ massage", web: "https://osteomike.com/",about:"My practice will temporarily be closed to new patients as of September 17, 2026"},
  { name: "Royal York Massage Therapy & Osteopathy", city: "Etobicoke", loc: "Etobicoke, ON", prov: "ON", billed: "Osteopathy", note: "cranial osteopathy; direct billing", web: "https://rymt.ca/",about:"Registered massage therapy, osteopathy, and acupuncture in Etobicoke since 2002. Direct billing. Easy online booking. 4887 Dundas St W."},
  { name: "Toronto Osteopathy & Wellness", city: "North York", loc: "North York, ON", prov: "ON", billed: "Osteopathy", note: "cranial osteopathy; TMJ issues", web: "https://osteowellto.com/",about:"Toronto Osteopathy & Wellness offers expert osteopathic manual treatment, massage therapy, and craniosacral therapy. Relieve chronic pain, improve mobility, and restore wellness."},
  { name: "Roncesvalles Osteopathy & Wellness", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Osteopathy", note: "craniosacral therapy", web: "https://www.roncyosteo.com/",about:"Osteopathy personalized to you. Whether your goal is pain relief or proactive health care, osteopathy can help you to understand your body so you can thrive. Learn More Book Online How can we help?"},
  { name: "Patchouli7drops", city: "Richmond Hill", loc: "Richmond Hill, ON", prov: "ON", billed: "Osteopathy", note: "craniosacral and nervous system care", web: "https://patchouli7drops.com/",about:"Gentle osteopathic treatment in Richmond Hill for neck and shoulder tension, headaches, jaw tension, stress and poor sleep. Registered Osteopathic Manual Practitioner. Extended health receipts"},
  { name: "Q. Osteo-Med Clinic", city: "Richmond Hill", loc: "Richmond Hill, ON", prov: "ON", billed: "Osteopathy", note: "cranial therapy; TMJ disorder focus", web: "https://q-osteomed.com/",about:"Experience holistic health at Q-Osteo Med with expert osteopathy and manual therapy to enhance well-being and alleviate pain."},
  { name: "Natural Health Clinic of Halton", city: "Oakville", loc: "Oakville, ON", prov: "ON", billed: "Osteopathy", note: "craniosacral therapy", web: "https://www.nhchalton.com/",about:"Welcome to Natural Health Clinic of Halton - Oakville your one-stop for Naturopath, Osteopath, Massage Therapy, Acupuncture, Cosmetics, Orthotics, Psychotherapy and more... Natural Health Clinic of"},
  { name: "Osteopathy First", city: "Burlington", loc: "Burlington, ON", prov: "ON", billed: "Osteopathy", note: "craniosacral therapy; DOMP-led", web: "https://www.osteopathyfirst.ca/",about:"Discover Osteopathy First in Burlington. Relieve pain, improve health, and book a free consultation today."},
  { name: "Rehab ARK", city: "Markham", loc: "Markham, ON", prov: "ON", billed: "Osteopathy", note: "craniosacral therapy; manual osteopathy", web: "https://www.rehabark.com/",about:"Physiotherapy, Massage, Osteopathy, Chiropractic, Acupuncture, and more — all under one roof! Experience integrative care for faster recovery –Book today!"},
];

/* ============================================================
   INTERVIEW PREPARATION PROVIDERS (15)
   ============================================================ */
const INTERVIEW_CLINICS = [
  { name: "Careers by Design", city: "Mississauga", loc: "Mississauga, ON", prov: "ON", billed: "Psychotherapy", note: "RP registered; interview coaching focus", web: "https://www.careersbydesign.ca",about:"Feeling Lost In Your Career? Canadian Coaches 20+ Yrs Experience Offer Hope, Expert Guidance & Resumes That Shine. Free Consult + PDF Guide. Act Now!"},
  { name: "Career Success Now", city: "Mississauga", loc: "Mississauga, ON", prov: "ON", billed: "Counselling", note: "interview prep and mock interviews", web: "https://careersuccessnow.com",about:"We help you build a powerful resume, cover-letter and LinkedIn profile so you can land more interviews + make more money!"},
  { name: "CareerJoy", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Counselling", note: "career coaching focus; interview prep", web: "https://www.careerjoy.com" },
  { name: "JB Career Solutions", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Counselling", note: "career coaching focus", web: "https://jbcareersolutions.com",about:"Strategic resume writing, LinkedIn optimization, interview coaching, and career strategy for professionals ready to move up, pivot, or compete for better opportunities."},
  { name: "MindfulCareer", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Counselling", note: "career coach", web: "https://mindfulcareer.ca",about:"Award-winning career counselling & career coaching in Canada. Discover your ideal career with our psychologists & career strategists. Book you free intro call."},
  { name: "CareerNiche", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Counselling", note: "career counselling focus", web: "http://www.careerniche.ca",about:"Successful Resume Writing & Career Marketing Agency with Proven Results that will Make You Stand Out from Your Competitors in Today’s Job Search Marketplace!"},
  { name: "Career Compass Canada", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Counselling", note: "career coaching focus", web: "https://www.careercompasscanada.com",about:"Outplacement and Human Resources firm specializing in leadership coaching, talent management, recruitment, team engagement."},
  { name: "Kevin William Grant", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Psychotherapy", note: "RP registered; interview skills coaching", web: "https://www.kevinwgrant.com",about:"One of my biggest passions in life is being able to support others while they are going through a difficult time."},
  { name: "Amanda Tobe and Associates", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Psychotherapy", note: "psychologist-led; mock interviews; insurance-covered", web: "https://www.amandatobe.com",about:"Amanda Tobe is a Toronto-based psychologist passionate about helping professionals build purposeful careers with less fear. Her services focus on building self-confidence, public speaking confidence"},
  { name: "Possibilities Clinic", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Psychotherapy", note: "RP registered; career coaching and therapy", web: "https://possibilitiesclinic.com",about:"Possibilities Clinic is a trusted Neurodiversity Clinic Toronto supporting ADHD, Autism, and learning needs with expert assessments and compassionate care."},
  { name: "Canada Career Counselling", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Psychotherapy", note: "RP/RPsych team; career counselling", web: "https://canadacareercounselling.com",about:"Feeling stuck or unsure about your next career move? Our Registered Psychologists offer career counselling, coaching, and job search support in Calgary, Toronto, Halifax, Vancouver, and online across"},
  { name: "Barbara Fish", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Psychotherapy", note: "RP registered; career counselling", web: "https://barbarafish.com",about:"Barbara Fish is a registered psychotherapist in Toronto offering online appointments for psychotherapy, life coaching & career counselling."},
  { name: "Lights Consulting & Coaching", city: "Markham", loc: "Markham, ON", prov: "ON", billed: "Counselling", note: "career coaching focus", web: "https://www.lightsconsulting.ca",about:"Empowering multicultural professionals in Canada with career coaching, leadership training, and English communication skills for professional growth."},
  { name: "FOCUS inspired", city: "Markham", loc: "Markham, ON", prov: "ON", billed: "Counselling", note: "career coaching focus", web: "http://www.focusinspired.com",about:"We found our purpose helping you find yours!"},
  { name: "The McFadden Group Career Coaching", city: "Burlington", loc: "Burlington, ON", prov: "ON", billed: "Counselling", note: "career coaching focus", web: "http://www.tmgcareercoaching.com",about:"Discover premium, borderless career coaching services designed to maximize your potential, eliminate burnout, and navigate industry pivots."},
];

/* ============================================================
   SINGING VOICE THERAPY CLINICS (10)
   ============================================================ */
const VOICE_CLINICS = [
  { name: "Melanie Tapson Voice Care", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Speech Therapy", note: "clinical singing voice therapist (PAVA-RV)", web: "https://melanietapson.com/",about:"With 30+ years of experience as a professional singer, Singing Voice Specialist & registered speech pathologist, Melanie takes a holistic approach to voice optimization, investigating what’s"},
  { name: "SpeechAppeal", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Speech Therapy", note: "dedicated Singing Voice Therapy service", web: "https://www.speechappeal.ca/",about:"Award-winning speech therapy clinic for adults in Toronto and online across Ontario. Personalized voice and speech therapy for clarity, confidence, and communication. 5-star rated and trusted by"},
  { name: "The Voice Clinic", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Speech Therapy", note: "singer and speaker voice treatment + repair", web: "http://www.thevoiceclinic.com/",about:"Diagnostic and evaluations to heal and recover your ear, nose or throat."},
  { name: "St. Michael's Hospital Outpatient Voice and Swallowing Clinic", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Speech Therapy", note: "hospital voice clinic; stroboscopy + OHIP-covered voice therapy", web: "https://unityhealth.to/areas-of-care/programs-and-clinics/ear-nose-throat-and-voice-department-of-otolaryngology-head-and-neck-surgery/" },
  { name: "Toronto Adult Speech Clinic", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Speech Therapy", note: "adult voice therapy", web: "http://www.torontoadultspeechclinic.com/",about:"We provide award-winning voice and communication services for adults. Voice therapy, speech therapy, stuttering therapy, accent work, gender affirming voice training, and workplace communication"},
  { name: "SpeechAim", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Speech Therapy", note: "voice therapy incl. singers and vocal nodules", web: "https://www.speechaim.com/",about:"Toronto's trusted speech therapy clinic for adults and children. Licensed SLPs deliver online & in-person therapy for accent modification, stuttering, articulation & voice. Book your free",price:"$130-$160"},
  { name: "Speech Specialists", city: "Scarborough", loc: "Scarborough, ON", prov: "ON", billed: "Speech Therapy", note: "adult voice therapy; vocal nodules and vocal strain", web: "https://speechspecialists.ca/",about:"Choose Speech Specialists for expert speech therapy services in Toronto, Ontario. Flexible appointments, & personalized care for children and adults. Call Now."},
  { name: "Speech Therapy Toronto", city: "North York", loc: "North York, ON", prov: "ON", billed: "Speech Therapy", note: "adult voice problems incl. vocal nodules", web: "https://speechtherapytoronto.com/",about:"” “Having worked in many clinical settings for over 30 years, my goal for Speech Therapy Toronto was to create a clinic with a warm and personal environment - one where our clients are known by name"},
  { name: "Beyond Words Speech-Language Pathology", city: "Whitby", loc: "Whitby, ON", prov: "ON", billed: "Speech Therapy", note: "adult voice disorders; serves Durham Region", web: "http://www.beyondslp.ca/",about:"In Home Speech Therapy in Durham Region & Southern Ontario with experienced, qualified and licensed speech-language pathologists"},
  { name: "B. Ryan Speech-Language Pathology", city: "Pickering", loc: "Pickering, ON", prov: "ON", billed: "Speech Therapy", note: "voice disorders clinic", web: "http://ryanspeechtherapy.com/",about:"At locally owned B. Ryan Speech-Language Pathology in Pickering, ON, we understand how difficult living with communication and swallowing deficits can be. When you choose our licensed and insured spee"},
];

/* ============================================================
   NEUROFEEDBACK CLINICS (15)
   ============================================================ */
const NEUROFEEDBACK_CLINICS = [
  { name: "Now + Next Psychotherapy & Neurofeedback", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Psychotherapy", note: "LENS neurofeedback for calm and focus", web: "https://nowandnextpsychotherapy.ca/" },
  { name: "The ADD Centre & The Biofeedback Institute of Toronto", city: "Mississauga", loc: "Mississauga, ON", prov: "ON", billed: "Psychology", note: "qEEG brain mapping and ADHD brain training", web: "https://www.addcentre.com",about:"At the ADD Centre, you get personalized, effective brain training program that helps you regulate attention, emotions and stress. Available in Toronto & Mississauga"},
  { name: "Neuropotential Clinics", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Psychology", note: "BCIA board-certified neurofeedback for anxiety ADHD trauma", web: "https://neuropotentialclinics.com/",about:"Toronto Neurofeedback Therapy Clinic & Assessments Discover Your Brain’s Potential Using evidence-based neurofeedback therapies, we train your brain to self-regulate, reducing the symptoms of anxiety,"},
  { name: "VieClinic", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Psychology", note: "qEEG brain mapping and ADHD treatment", web: "https://vieclinic.com" },
  { name: "The Insight Clinic", city: "Whitby", loc: "Whitby, ON", prov: "ON", billed: "Psychotherapy", note: "neurofeedback paired with talk therapy", web: "https://theinsightclinic.ca/",about:"Discover advanced mental health & developmental care at The Insight Clinic with evidence-based holistic treatments in the Greater Toronto Area. Book your online session today."},
  { name: "Vaughan Psychotherapy", city: "Vaughan", loc: "Vaughan, ON", prov: "ON", billed: "Psychotherapy", note: "10-week neurofeedback and psychotherapy program", web: "https://www.vaughanpsychotherapist.com/",about:"If you’re looking for compassionate and professional therapy in Vaughan, Toronto, or Mississauga, you’ve found the right place. Vaughan Counselling and Psychotherapy provides services for individuals,"},
  { name: "The Wise Self Psychotherapy Clinic", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Psychotherapy", note: "LENS neurofeedback in Etobicoke", web: "https://www.thewiseself.ca/",about:"The Wise Self Psychotherapy Clinic is committed to delivering quality care to those who seek professional help to better cope with their emotional distress, enhance their recovery and ensure the maint"},
  { name: "A Time To Heal Psychotherapy", city: "Vaughan", loc: "Vaughan, ON", prov: "ON", billed: "Psychotherapy", note: "neurofeedback and biofeedback for anxiety ADHD", web: "https://www.atimetohealpsychotherapy.com/",about:"Integrative therapies to support you in overcoming anxiety, depression, trauma and relationship issues. Whether you are looking for in person counseling, online psychotherapy or flexible hybrid therap"},
  { name: "Toronto Neurofeedback and Psychotherapy Centre", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Psychotherapy", note: "brain-based healing plus psychotherapy", web: "https://nuvistamentalhealth.com/locations/toronto/",about:"Browse our services to find what fits your needs, or book an assessment to get personalized recommendations from our clinicians."},
  { name: "Heal Psychotherapy", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Psychotherapy", note: "LENS and ILF neurofeedback for trauma", web: "https://www.healpsychotherapy.ca/",about:"Heal Psychotherapy is a trauma-focused clinic that offers evidence-based, neuroscientific approaches to treating trauma, helping clients reconnect with their authentic selves, and restore emotional we"},
  { name: "Rachael Frankford Psychotherapy and Neurofeedback", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Psychotherapy", note: "trauma-focused neurofeedback practice", web: "http://www.rachaelfrankford.com/",about:"Rachael Frankford is a Toronto based psychotherapist specializing in anxiety, depression and trauma."},
  { name: "New Pathways Therapy Center", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Psychotherapy", note: "neurofeedback for trauma recovery", web: "https://www.newpathwaystherapy.com/",about:"Through neurofeedback, somatic psychotherapy and EMDR, unlock your healing capabilities to overcome stress, anxiety and trauma with New Pathways Therapy."},
  { name: "ACE Clinics", city: "Toronto", loc: "Toronto, ON", prov: "ON", billed: "Psychology", note: "EEG assessment and neurofeedback for ADHD", web: "https://aceclinics.com/",about:"At ACE Clinics, we provide drug-free solutions and neuro-cognitive treatments for ADD, ADHD, Asperger's, adult attention deficit disorder, memory impairments, and more."},
  { name: "Critical Trauma Therapy", city: "Oakville", loc: "Oakville, ON", prov: "ON", billed: "Psychiatry", note: "neurofeedback with qEEG-guided TMS", web: "https://criticaltraumatherapy.com/",about:"Trauma therapy, counselling, physiotherapy and dietitian care after a car accident. Four Ontario clinics, in-home and virtual. Free intake call, 24/7."},
  { name: "Natural Health Clinic of Halton", city: "Milton", loc: "Milton, ON", prov: "ON", billed: "Naturopath", note: "neurofeedback and biofeedback clinic", web: "https://www.nhchalton.com/",about:"Welcome to Natural Health Clinic of Halton - Oakville your one-stop for Naturopath, Osteopath, Massage Therapy, Acupuncture, Cosmetics, Orthotics, Psychotherapy and more... Natural Health Clinic of"},
];

/* ============================================================
   PILATES CLINICS (41)
   ============================================================ */
const PILATES_CLINICS = [
  { name: "Aurora North Medical Centre", city: "Aurora", loc: "Aurora, ON", prov: "ON", directBill: false, modalities: "Reformer, Mat, Clinical / Rehab", billed: "Physio / Chiro", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://share.google/qvf5UVRrbQMZfx8h5" },
  { name: "BODY MAISON", city: "Toronto", loc: "Toronto, ON (Yonge & Bloor)", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "$125-150", db: "No", web: "https://bodymaison.com",about:"BODY MAISON, located at Yonge and Bloor, is a physiotherapy clinic treating neck and shoulder pain, chronic back pain, scoliosis, and rehabilitation. We offer Shockwave Therapy, Pilates, and movement"},
  { name: "JC Clinic", city: "North York", loc: "North York, ON", prov: "ON", directBill: false, modalities: "Clinical / Rehab", billed: "Physio / Chiro / Naturo", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://jcclinic.ca", email: "jcclinicto@gmail.com" },
  { name: "Reconnect Wellness", city: "Newmarket", loc: "Newmarket, ON", prov: "ON", directBill: true, modalities: "Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Yes", web: "https://reconphysio.ca", email: "forum@reconphysio.ca",about:"Choose physiotherapy in Newmarket for injury recovery, pain relief, and improved mobility with personalized treatment at Reconnect Physiotherapy."},
  { name: "Bijoy's Physio & Pilates", city: "Aurora", loc: "Aurora, ON", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://www.bijoysphysioandpilates.com",about:"Personalized physiotherapy and Pilates services in Aurora, ON. Improve mobility, recover from injury, and promote long-term health with expert-led programs."},
  { name: "MVMT Physiotherapy", city: "Vaughan", loc: "Vaughan, ON (Maple)", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "No", web: "https://mvmtphysio.com", email: "feelbetter@mvmtphysio.com",about:"We help you prioritize your health, master your movement, and eliminate pain so you can live your best life."},
  { name: "Rehab Plus Pilates Studio", city: "Richmond Hill", loc: "Richmond Hill, ON", prov: "ON", directBill: false, modalities: "Reformer, Mat, Clinical / Rehab, Prenatal, Group", billed: "Pilates (physio-led)", price: "From $85 (private)", db: "Confirm with clinic", web: "https://www.rehabpluspilates.com", email: "info@rehabpluspilates.com",about:"Pilates studio in Richmond Hill offering clinical, group, private, and semi-private sessions. Build strength, mobility, and mind-body awareness through expert-guided movement."},
  { name: "Neurocore Physiotherapy & Pilates Centre", city: "Richmond Hill", loc: "Richmond Hill, ON", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab, Group", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://neurocore.ca", email: "info@neurocore.ca",about:"Encompassing & Compassionate One-to-One Care Neuro Physiotherapy Chiropractic Concussion Rehab Schroth Scoliosis Fascial Stretch Therapy Ortho Physiotherapy Massage Therapy Pilates Rehab Vestibular Re"},
  { name: "Revival Physio", city: "East York", loc: "East York, ON (Leaside)", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price:"$140", db: "Confirm with clinic", web: "https://www.revivalphysio.ca", email: "ellie@revivalphysio.ca",about:"Physiotherapy services including general physiotherapy, pelvic floor physiotherapy, physio pilates, TMJ & scar care in Leaside, Toronto. Expert registered physiotherapists build a treatment plan for m"},
  { name: "Personal Best Physiotherapy, Pilates, Rehabilitation", city: "Toronto", loc: "Toronto, ON (Davisville Village)", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "http://pbphysio.com", email: "personalbestphysio@gmail.com" },
  { name: "Fairlawn Physiotherapy & Rehabilitation Centre", city: "Toronto", loc: "Toronto, ON (Yonge & Lawrence)", prov: "ON", directBill: false, modalities: "Group, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://fairlawnphysiotherapy.com", email: "fairlawnphysiotherapy@rogers.com",about:"Fairlawn Physiotherapy is committed to providing the highest quality patient centered care in a warm and nurturing environment."},
  { name: "Kinective Health & Performance", city: "Toronto", loc: "Toronto, ON (Forest Hill)", prov: "ON", directBill: false, modalities: "Reformer, Mat, Clinical / Rehab", billed: "Physio / Chiro", price: "Confirm with clinic", db: "No", web: "https://www.kinectivehealth.com", email: "info@kinectivehealth.com",about:"Expert physiotherapy, chiropractic, naturopath, massage therapy, pilates, and wellness care in Midtown Toronto. Personalized treatments in our Forest Hill wellness studio. Book online today."},
  { name: "Kaizen Physiotherapy Group / Kaizen Pilates", city: "Etobicoke", loc: "Etobicoke, ON", prov: "ON", directBill: false, modalities: "Clinical / Rehab, Mat", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://kaizenphysiotherapygroup.ca", email: "info@kaizenphysiogroup.ca",about:"Physiotherapy and reformer Pilates in Etobicoke's Islington Village, plus RMT massage. Kaizen Physiotherapy Group – book online today."},
  { name: "Pilates4Physio", city: "Toronto", loc: "Toronto, ON (Downtown/Esplanade)", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price:"$150", db: "Confirm with clinic", web: "https://pilates4physio.ca", email: "info@pilates4physio.ca",about:"Are you dealing with an injury or joint pain? We combine the science of physiotherapy with pilates to rehabilitate the spine and peripheral joints:"},
  { name: "Toronto Physiotherapy (Danforth & Chester)", city: "Toronto", loc: "Toronto, ON (Danforth)", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab", billed: "Physiotherapy", price: "$120 (Physio Pilates)", db: "Confirm with clinic", web: "https://torontophysiotherapy.ca/services/physio-pilates/", email: "info@torontophysiotherapy.ca",about:"Private Physio Pilates for fitness and rehab with a Certified Instructor / Registered Physiotherapist. Tax-free and billed as physiotherapy."},
  { name: "Beachealth", city: "Toronto", loc: "Toronto, ON (East Toronto / Beaches / Danforth / Scarborough)", prov: "ON", directBill: false, modalities: "Reformer, Mat, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://beachealth.com/services/physio-pilates/",about:"Improve strength, flexibility, and recovery with Physio Pilates at Beachealth. Serving East Toronto, Scarborough, Beaches, and Danforth with expert care."},
  { name: "Myo (Myodetox) — Leslieville", city: "Toronto", loc: "Toronto, ON (Leslieville)", prov: "ON", directBill: true, modalities: "Reformer, Clinical / Rehab, Chiro, Massage", billed: "Physio / Chiro / Massage", price:"$160", db: "Yes", web: "https://www.myodetox.com/ca/locations/leslieville",about:"Discover quality physiotherapy at our Leslieville clinic on Queen Street East in Toronto, conveniently near local cafes with ample Green P parking."},
  { name: "Myo (Myodetox) — Yorkville", city: "Toronto", loc: "Toronto, ON (Yorkville)", prov: "ON", directBill: true, modalities: "Reformer, Clinical / Rehab, Chiro, Massage", billed: "Physio / Chiro / Massage", price:"$160", db: "Yes", web: "https://www.myodetox.com/ca/locations/yorkville",about:"Located inside Yorkville Village Mall on Avenue Road, our Toronto physiotherapy clinic provides easy access with convenient underground parking"},
  { name: "Myo (Myodetox) — CityPlace", city: "Toronto", loc: "Toronto, ON (CityPlace)", prov: "ON", directBill: true, modalities: "Reformer, Clinical / Rehab, Chiro, Massage", billed: "Physio / Chiro / Massage", price:"$160", db: "Yes", web: "https://www.myodetox.com/ca/locations/cityplace",about:"Conveniently located near Canoe Landing Community Centre, our CityPlace physiotherapy clinic in downtown Toronto offers easy street-level access."},
  { name: "Myo (Myodetox) — Liberty Village", city: "Toronto", loc: "Toronto, ON (Liberty Village)", prov: "ON", directBill: true, modalities: "Reformer, Clinical / Rehab, Chiro, Massage", billed: "Physio / Chiro / Massage", price:"$160", db: "Yes", web: "https://www.myodetox.com/locations/liberty-village",about:"Our Liberty Village physiotherapy clinic on Atlantic Avenue, Toronto, is centrally located near Universal Music, offering accessible parking options."},
  { name: "Myo (Myodetox) — PATH Exchange Tower", city: "Toronto", loc: "Toronto, ON (Financial District/PATH)", prov: "ON", directBill: true, modalities: "Reformer, Clinical / Rehab, Chiro, Massage", billed: "Physio / Chiro / Massage", price:"$160", db: "Yes", web: "https://www.myodetox.com/ca/locations/path-exchange-tower",about:"Conveniently located in Toronto's underground PATH network near King & York Streets, our clinic provides easy access and nearby parking at The Exchange Tower."},
  { name: "Myo (Myodetox) — Richmond Hill", city: "Richmond Hill", loc: "Richmond Hill, ON", prov: "ON", directBill: true, modalities: "Reformer, Clinical / Rehab, Chiro, Massage", billed: "Physio / Chiro / Massage", price:"$150", db: "Yes", web: "https://www.myodetox.com/ca/locations/richmond-hill",about:"Our Richmond Hill physiotherapy clinic at Leslie & Elgin Mills offers ample free plaza parking near Pi Co and Orangetheory Fitness"},
  { name: "Myo (Myodetox) — Markham", city: "Markham", loc: "Markham, ON", prov: "ON", directBill: true, modalities: "Reformer, Clinical / Rehab, Chiro, Massage", billed: "Physio / Chiro / Massage", price:"$150", db: "Yes", web: "https://www.myodetox.com/ca/locations/markham",about:"Visit our Markham physiotherapy clinic at Birchmount & Hwy 7, easily accessible with ample free parking, near Royal Bank and Whole Foods."},
  { name: "Resilience Physiotherapy — Toronto Annex", city: "Toronto", loc: "Toronto, ON (Annex)", prov: "ON", directBill: false, modalities: "Reformer, Mat, Clinical / Rehab", billed: "Physiotherapy", price:"$170", db: "Confirm with clinic", web: "https://www.resiliencephysiotherapy.com", email: "info@resiliencephysiotherapy.com",about:"Resilience Physiotherapy in Toronto Annex offers physiotherapy, clinical pilates and chiropractic to improve strength, mobility & recovery!"},
  { name: "New Life Rehab Clinic", city: "North York", loc: "North York / East Toronto, ON", prov: "ON", directBill: false, modalities: "Mat, Clinical / Rehab, Group", billed: "Physio / Chiro", price: "Confirm with clinic", db: "Confirm with clinic" },
  { name: "JDA Physio & Rehabilitation Centre", city: "Richmond Hill", loc: "Richmond Hill, ON", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab, Prenatal", billed: "Physiotherapy / Chiropractic", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://www.jdaphysio.ca", email: "jdaphysio@gmail.com",about:"Richmond Hill/Markham Pelvic Floor Physiotherapy, 1 on 1 Manual Physiotherapy, Sports Injury Rehabilitation at JDA Physio. Call to Book Today!"},
  { name: "Apple Creek Sports Medicine Centre", city: "Markham", loc: "Markham, ON", prov: "ON", directBill: false, modalities: "Clinical / Rehab, Group", billed: "Physio / Chiro / Osteopathy", price: "Confirm with clinic", db: "Confirm with clinic" },
  { name: "My Physio Pilates (Fabia Gouvea Studio)", city: "Etobicoke", loc: "Etobicoke, ON", prov: "ON", directBill: false, modalities: "Reformer, Mat, Clinical / Rehab, Prenatal", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://myphysiopilates.com",about:"We accept Canadian health insurance for our Pilates-based physiotherapy sessions. Discover your path to wellness with us today!"},
  { name: "YOHU Wellness Clinic (Dr. Xuanli Monica Wang)", city: "Markham", loc: "Markham, ON", prov: "ON", directBill: false, modalities: "Reformer, Mat, Clinical / Rehab, Group", billed: "Chiropractic", price: "Confirm with clinic", db: "Confirm with clinic" },
  { name: "Alliance Physio (Kareem Hassanein, RPT)", city: "Mississauga", loc: "Mississauga, ON (Winston Churchill Blvd)", prov: "ON", directBill: false, modalities: "Reformer/Mat, Clinical / Rehab", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://www.kinetikarephysio.com" },
  { name: "Trafalgar Physiotherapy — pt Health", city: "Oakville", loc: "Oakville, ON", prov: "ON", directBill: false, modalities: "Reformer, Clinical / Rehab, Prenatal/Postpartum", billed: "Physiotherapy", price: "Confirm with clinic", db: "Confirm with clinic", web: "https://www.pthealth.ca",about:"Canada's most trusted physiotherapy clinic network. pt Health specializes in physiotherapy, massage therapy, acupuncture, and chiropractic treatments."},
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
  { name: "Well BYND", city: "Toronto", loc: "Toronto — 500-460 Richmond St W, M5V 1Y1", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling, Cosmetic Acupuncture, IV Therapy, Vitamin Injections", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.wellbynd.com", tags: ["microneedling","cosmetic-acupuncture","iv-therapy","vitamin-injections"],about:"Well BYND is a wellness clinic in Toronto that specializes in naturopathic medicine, holistic nutrition, natural skin care & more."},
  { name: "Dr. Jen Newell ND", city: "Toronto", loc: "Toronto — 331 Queen St E, M5A 1S9", prov: "ON", db: "No", modalities: "Microneedling, Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://newellnd.ca", tags: ["microneedling","cosmetic-acupuncture"] },
  { name: "Dr. Matthew Pace ND", city: "Toronto", loc: "Toronto — 320 Danforth Ave, M4K 1N8", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture, Aesthetic Naturopathy", billed: "Naturopathy", price: "Confirm with clinic", web: "https://matthewpacend.com", email: "matthew.paceND@gmail.com", tags: ["cosmetic-acupuncture"],about:"Dr. Matthew Pace, ND is located in Toronto’s beautiful East End. He is looking forward to working with locals from his community reach their health goals!"},
  { name: "Dr. Saiyemah Khalil ND", city: "Toronto", loc: "Toronto — 17 Atlantic Ave Unit 2, M6K 3E7", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.drkhalilnd.com", email: "saiyemahkhalil@gmail.com", tags: ["cosmetic-acupuncture"],about:"Meet Dr. Saiyemah Khalil, your licensed Naturopathic doctor in Toronto. Specializing in Hormonal Health, Women's Beauty Care, Digestive Health, Acupuncture, and Traditional Chinese Medicine (TCM)...."},
  { name: "Integra Health Centre", city: "Toronto", loc: "Toronto — 130 King St W 13th Fl (Exchange Tower), M5X 1C8", prov: "ON", db: "Confirm w/ clinic", modalities: "Naturopathic Medicine", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.integrahealth.ca", tags: ["naturopathic-medicine"],about:"Changing the way healthcare is delivered, Integra Health provides comprehensive, integrative health solutions for patients and corporate employer’s alike through our unique collaborative model of c..."},
  { name: "Dr. Pamela Frank ND", city: "Toronto", loc: "Toronto — 568 St Clair Ave W, M6C 1A5 (Health Haven Clinic)", prov: "ON", db: "Confirm w/ clinic", modalities: "Naturopathic Medicine", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.naturopathtoronto.ca", email: "PFrankND@ForcesofNature.ca", tags: ["naturopathic-medicine"],about:"Toronto Naturopath Dr. Pamela invites you to resolve IBS, balance hormones, fix hair loss, heal acne, conceive etc with root-cause natural medicine."},
  { name: "Annex Naturopathic Clinic", city: "Toronto", loc: "Toronto — 301-800 Bathurst St, M5R 3M8", prov: "ON", db: "Confirm w/ clinic", modalities: "Vitamin Injections", billed: "Naturopathy", price: "Confirm with clinic", web: "https://citynaturopathic.ca", email: "info@annexnaturopathic.com", tags: ["vitamin-injections"],about:"Consult experienced naturopathic doctors (naturopaths) and improve your health safely and effectively. 5-star rated clinic. Request a free consultation."},
  { name: "Advanced Women's Health (Toronto West)", city: "Toronto", loc: "Toronto — 832 College St", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture, Vitamin Injections", billed: "Naturopathy", price: "$225 initial / $185 follow-up", web: "https://www.advancedwomenshealth.ca", tags: ["cosmetic-acupuncture","vitamin-injections"] },
  { name: "Timeless Health Clinic", city: "Toronto", loc: "Toronto, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Vitamin Therapy", billed: "Naturopathy", price: "Confirm with clinic", tags: ["iv-therapy"] },
  { name: "Dr. Denise Cheung ND (Markham)", city: "Markham", loc: "Markham, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling, Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.drdenisecheung.com", tags: ["microneedling","cosmetic-acupuncture"],about:"Dr. Denise Cheung is a Naturopathic Doctor who focuses on men's and women's health, skin issues, fertility, diabetes and pain management through acupuncture, nutritional supplementation, botanical..."},
  { name: "Dr. Denise Cheung ND (Scarborough)", city: "Scarborough", loc: "Scarborough — 2425 Eglinton Ave E #11, M1K 5G8", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling, Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.drdenisecheung.com", tags: ["microneedling","cosmetic-acupuncture"],about:"Dr. Denise Cheung is a Naturopathic Doctor who focuses on men's and women's health, skin issues, fertility, diabetes and pain management through acupuncture, nutritional supplementation, botanical..."},
  { name: "Danesh Aesthetics", city: "Richmond Hill", loc: "Richmond Hill — 11160 Yonge St Unit 7, L4S 1K9", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling", billed: "Naturopathy / Dermatology", price: "Confirm with clinic", web: "https://www.daneshaesthetics.com", tags: ["microneedling"],about:"At Daneshaesthetics.com we use our 23 years of experience in medicine to help you achieve the best results for your Aesthetic concerns, Skincare, Skin rejuvenation, Skin tightening, Dermatology, Sk..."},
  { name: "NatCan Integrative Medical & Wellness Centre", city: "Vaughan", loc: "Vaughan — 3905 Major Mackenzie Dr W Unit 102, L4H 4J9", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Therapy, Naturopathic Medicine", billed: "Naturopathy", price:"from $45", web: "https://natcanintegrative.com", tags: ["iv-therapy","naturopathic-medicine"],about:"NatCan is your one-stop clinic in Vaughan, ON. Services include physiotherapy, chiropractic, registered massage, osteopathy, naturopathic medicine, intravenous vitamin therapy, dietetics, energy me..."},
  { name: "NatCan Weight Loss & Skin Clinic", city: "Woodbridge", loc: "Woodbridge — 281 Woodbridge Ave Suite 22, L4L 0C6", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling", billed: "Naturopathy / Medical Aesthetics", price:"from $45", web: "https://natcanintegrative.com", tags: ["microneedling"],about:"NatCan is your one-stop clinic in Vaughan, ON. Services include physiotherapy, chiropractic, registered massage, osteopathy, naturopathic medicine, intravenous vitamin therapy, dietetics, energy me..."},
  { name: "pureBalance Wellness", city: "Mississauga", loc: "Mississauga — 219 Lakeshore Rd E, L5G 1G5 (Port Credit)", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Therapy, Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.mypurebalance.ca", tags: ["iv-therapy","cosmetic-acupuncture"],about:"pureBalance Wellness services include: Naturopathic Medicine, Natural Cancer Support, IV Therapy, Massage Therapy, Colonics, Energy Medicine and more."},
  { name: "Aurora Massage & Chiropractic Wellness Centre", city: "Aurora", loc: "Aurora, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy / Acupuncture", price: "Confirm with clinic", tags: ["cosmetic-acupuncture"] },
  { name: "Newmarket Naturopathic Clinic (Dr. Michael Morsillo)", city: "Newmarket", loc: "Newmarket — 16655 Yonge St", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Therapy, Biopuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://drmorsillo.com", tags: ["iv-therapy"],about:"Call Now 905-898-1844 ext. 135. We are Newmarket\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"},
  { name: "NewM Clinic (Newmarket)", city: "Newmarket", loc: "Newmarket, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Therapy, Skin Lesion Removal", billed: "Medical Aesthetics", price: "Confirm with clinic", web: "https://newmclinic.com", tags: ["iv-therapy"],about:"Experience personalized IV drips, vitamin injections, and skin lesion removal by medical professionals focused on health, beauty & vitality."},
  { name: "NewM Clinic (Brampton)", city: "Brampton", loc: "Brampton, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Therapy, Skin Lesion Removal", billed: "Medical Aesthetics", price: "Confirm with clinic", web: "https://newmclinic.com", tags: ["iv-therapy"],about:"Experience personalized IV drips, vitamin injections, and skin lesion removal by medical professionals focused on health, beauty & vitality."},
  { name: "NewM Clinic (Scarborough)", city: "Scarborough", loc: "Scarborough, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Therapy, Skin Lesion Removal", billed: "Medical Aesthetics", price: "Confirm with clinic", web: "https://newmclinic.com", tags: ["iv-therapy"],about:"Experience personalized IV drips, vitamin injections, and skin lesion removal by medical professionals focused on health, beauty & vitality."},
  { name: "Oakville Naturopathic Wellness Centre", city: "Oakville", loc: "Oakville, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Therapy, Vitamin Injections", billed: "Naturopathy", price: "Confirm with clinic", web: "https://onwc.ca", tags: ["iv-therapy","vitamin-injections"] },
  { name: "Oakville Naturopathic Doctor", city: "Oakville", loc: "Oakville — 243 North Service Rd W #106E, L6M 3E5", prov: "ON", db: "Confirm w/ clinic", modalities: "Naturopathic Medicine", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.oakvillenaturopathicdoctor.com", tags: ["naturopathic-medicine"],about:"Oakville Naturopathic Doctor is an integrative clinic in Oakville, Ontario. Our licensed naturopaths in Oakville provide holistic care through natural and"},
  { name: "Sage Naturopathic Clinic (Oakville)", city: "Oakville", loc: "Oakville, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling, Cosmetic Acupuncture, IV Therapy", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.thesageclinic.com", tags: ["microneedling","cosmetic-acupuncture","iv-therapy"],about:"Providing healthcare from two convenient locations or from the comfort of your home!"},
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
  { name: "Sage Naturopathic Clinic (Kitchener)", city: "Kitchener", loc: "Kitchener, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling, Cosmetic Acupuncture, IV Therapy", billed: "Naturopathy", price: "Confirm with clinic", web: "https://thesageclinic.com", tags: ["microneedling","cosmetic-acupuncture","iv-therapy"],about:"Providing healthcare from two convenient locations or from the comfort of your home!"},
  { name: "Wellness Place", city: "Newmarket", loc: "Newmarket, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling, Cosmetic Acupuncture, Vitamin Injections, Glutathione Injections", billed: "Naturopathy", price: "Confirm with clinic", tags: ["microneedling","cosmetic-acupuncture","vitamin-injections"] },
  { name: "Bayview Village Wellness Centre", city: "North York", loc: "North York, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Naturopathic Medicine", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.bayviewwellness.com", tags: ["naturopathic-medicine"],about:"Bayview Village Wellness Centre offers chiropractic, physiotherapy, massage therapy, acupuncture, and personalized wellness care in North York. Book today!"},
  { name: "Motion Care Clinic", city: "North York", loc: "North York, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy / Physiotherapy Clinic", price: "Confirm with clinic", web: "https://www.motioncareclinic.com", tags: ["cosmetic-acupuncture"],about:"Open 7 days. Massage Therapy, Physio, Chiropractic, Acupuncture & Naturopathy services. Custom-Made Orthotics. Direct billing. Near Yonge/Sheppard station. Book Now!"},
  { name: "Dr. Vishaala Singh ND", city: "Brampton", loc: "Brampton, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.vsinghnd.com", tags: ["cosmetic-acupuncture"],about:"Focusing on women's health, hormone health, acne, prenatal and postpartum care, fertility, digestive health and autoimmune conditions."},
  { name: "Etobicoke Naturopath Osteopath Clinic", city: "Etobicoke", loc: "Etobicoke, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://naturopathosteopathclinic.com/etobicoke/", tags: ["cosmetic-acupuncture"],about:"Visit Etobicoke Naturopath Osteopath Clinic for expert naturopathic and osteopathic care. We offer personalized care for pain relief, hormonal balance, and overall wellness."},
  { name: "Sage Naturopathic Clinic (Etobicoke)", city: "Etobicoke", loc: "Etobicoke, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling, Cosmetic Acupuncture, IV Therapy", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.thesageclinic.com", tags: ["microneedling","cosmetic-acupuncture","iv-therapy"],about:"Providing healthcare from two convenient locations or from the comfort of your home!"},
  { name: "Natural Health Clinic of Halton (Brampton)", city: "Brampton", loc: "Brampton, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price:"$50-$200", web: "https://www.nhchalton.com", tags: ["cosmetic-acupuncture"],about:"Welcome to Natural Health Clinic of Halton - Oakville your one-stop for Naturopath, Osteopath, Massage Therapy, Acupuncture, Cosmetics, Orthotics, Psychotherapy and more... Natural Health Clinic of..."},
  { name: "Brampton Naturopath Osteopath Clinic", city: "Brampton", loc: "Brampton, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://naturopathosteopathclinic.com/brampton/", tags: ["cosmetic-acupuncture"],about:"Visit Brampton Naturopath Osteopath Clinic for expert naturopathic and osteopathic care. We offer personalized care for pain relief, hormonal balance, and overall wellness."},
  { name: "Naturopathic Essentials Health Centre", city: "Mississauga", loc: "Mississauga — 1891 Rathburn Rd E, L4W 3Z3", prov: "ON", db: "Confirm w/ clinic", modalities: "Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.naturopathicessentials.com", tags: ["cosmetic-acupuncture"],about:"Licensed Naturopathic Doctor (Naturopath) serving the residents of Mississauga and Etobicoke focusing on Eczema, Acne, Psoriasis and Acupuncture. Naturopathic Essentials Health Centre 1891 Rathburn..."},
  { name: "Dr. Natalie Cheng-Kai-On ND", city: "Maple", loc: "Maple, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.natdoctor.com", tags: ["cosmetic-acupuncture"],about:"Looking for a naturopathic doctor in Maple or Markham? Visit Dr. Natalie Cheng-Kai-On, ND & R.Ac for naturopathic medicine and acupuncture. Book online today."},
  { name: "Be Well Medical Clinic", city: "Thornhill", loc: "Thornhill, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy / Medical Clinic", price: "Confirm with clinic", web: "https://www.bewellmedicalclinic.com", tags: ["cosmetic-acupuncture"],about:"Be Well At Be Well wellness clinic, we fully believe that everyone should invest in their health and wellbeing. We take a holistic approach to wellness and living. Through our diverse health and we..."},
  { name: "METALAB", city: "Markham", loc: "Markham, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "IV Drips, NAD IV Therapy, PRP", billed: "Naturopathy / Regenerative Medicine", price: "Confirm with clinic", web: "https://www.metatherapylab.com", tags: ["iv-therapy"],about:"METALAB is a certified IV Therapy and Regenerative facility that offers a holistic and functional approach to health care and beauty. We offer IV Therapy, Naturopathic Medicine, Neuromodulator inje..."},
  { name: "Richmond Hill Naturopathic Clinic (RHNC)", city: "Richmond Hill", loc: "Richmond Hill, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Naturopathic Medicine", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.richmondhillclinic.com", tags: ["naturopathic-medicine"],about:"Naturopathic health clinic providing quality primary and preventative healthcare services in Richmond Hill, Vaughan, Thornhill, Aurora and Markham areas."},
  { name: "Dr. Brian Yeung ND", city: "Markham", loc: "Markham — 3085 Hwy 7, L3R 0J5", prov: "ON", db: "Confirm w/ clinic", modalities: "Naturopathic Medicine", billed: "Naturopathy", price: "Confirm with clinic", tags: ["naturopathic-medicine"] },
  { name: "Health Globe Wellness Clinic", city: "Mississauga", loc: "Mississauga, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Microneedling (RF), Cosmetic Acupuncture, IM/IV Vitamin Therapy", billed: "Naturopathy / Medical Aesthetics", price: "Confirm with clinic", web: "https://healthglobe.ca", tags: ["microneedling","cosmetic-acupuncture","iv-therapy"],about:"Get aesthetic treatments and naturopathic care at Health Globe Wellness Clinic in Mississauga. Improve your health and beauty today."},
  { name: "Mississauga Naturopathic Clinic", city: "Mississauga", loc: "Mississauga, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://www.doctorlore.com", tags: ["cosmetic-acupuncture"],about:"I believe that patients should feel heard, and they should fully understand their treatment options in order to play an active role in their health. As a Naturopathic Doctor, I strive to use my exp..."},
  { name: "Mississauga Naturopath Osteopath Clinic", city: "Mississauga", loc: "Mississauga — near Southdown Rd & Lakeshore Rd W", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://naturopathosteopathclinic.com/mississauga/", tags: ["cosmetic-acupuncture"],about:"Streamlined wellness: practical steps toward better health"},
  { name: "Natural Health Clinic of Halton (Mississauga)", city: "Mississauga", loc: "Mississauga, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy", price:"$50-$200", web: "https://www.nhchalton.com", tags: ["cosmetic-acupuncture"],about:"Welcome to Natural Health Clinic of Halton - Oakville your one-stop for Naturopath, Osteopath, Massage Therapy, Acupuncture, Cosmetics, Orthotics, Psychotherapy and more... Natural Health Clinic of..."},
  { name: "Healthier Living Clinic", city: "Mississauga", loc: "Mississauga, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture", billed: "Naturopathy / TCM", price: "Confirm with clinic", web: "https://hl3.ca", tags: ["cosmetic-acupuncture"],about:"Mississauga clinic offering osteopathy, naturopathy, physio, massage, acupuncture, psychotherapy & more to support your health and well-being."},
  { name: "Richmond Hill Health & Wellness", city: "Richmond Hill", loc: "Richmond Hill, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Naturopathic Medicine, Acupuncture", billed: "Naturopathy", price: "Confirm with clinic", web: "https://richmondhillhealth.com", tags: ["naturopathic-medicine","cosmetic-acupuncture"],about:"Live Pain-Free and Thrive Discover the Power Physical Therapy Discover the Power Physical Therapy Unleash the power of your body to heal itself and live a pain-free life with physical therapy! Book No"},
  { name: "Pain Ease Naturopathic Clinic", city: "Milton", loc: "Milton, ON", prov: "ON", db: "Confirm w/ clinic", modalities: "Cosmetic Acupuncture, IV Therapy", billed: "Naturopathy", price: "Confirm with clinic", web: "https://painease.ca", tags: ["cosmetic-acupuncture","iv-therapy"],about:"Serving the Milton community for over 20 years, our naturopath doctors bridge traditional medicine to bring you an experience rooted in science and personalization."},
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
  { name: "Athletify", disc: "Physio", tpi: "TPI Medical 3", loc: "16715 Yonge St, Unit 22, Newmarket, ON L3X 1X4", city: "Newmarket", region: "York", note: "Golf net + simulator", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://athletify.ca/", email: "team@athletify.ca", book: "https://athletify.janeapp.com/",about:"Get expert physiotherapy near you in Newmarket, Ontario. Personalized care to relieve pain and restore movement. Book your session today!"},
  { name: "MOTI Physio", disc: "Physio", tpi: "TPI Medical 3", loc: "16945 Leslie St, Unit 20A, Newmarket, ON L3Y 9A2", city: "Newmarket", region: "York", note: "Golf Rehab", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.motiphysio.ca/tpi-golf-rehab", email: "jonli@motiphysio.ca", book: "https://motiphysio.janeapp.com/locations/moti-physiotherapy-sports-rehab-inc/book",about:"Sports Rehab Golf Performance Vestibular Rehab Pelvic Floor Health OUR TEAM"},
  { name: "In Balance Chiropractic + Acupuncture", disc: "Chiro", tpi: "TPI", loc: "2715 Bur Oak Ave, Unit #2, Markham, ON L6B 1K7", city: "Markham", region: "York", note: "Golf Fitness", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.inbalancechiropractic.ca/about-golf-fitness/", email: "info@inbalancechiropractic.ca",about:"Dr. Kirsten Thomas is a golf fitness instructor that helps players improve their golf game at in balance chiropractic + acupuncture Clinic in Markham, Ontario."},
  { name: "HealthyToDos — Markham Health & Rehab", disc: "Chiro", tpi: "TPI Level 1", loc: "4581 Highway 7 Unit 102, Markham, ON", city: "Markham", region: "York", note: "Dr. Andrew Li · 60–90 min screen", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://healthytodos.com/services/tpi-golf-assessment", email: "info@healthytodos.com", book: "https://healthytodos.janeapp.com/#/tpi-golf-assessment",about:"HealthyToDos is a Health & Rehab clinic offering evidence-guided Chiropractic, Registered Massage Therapy, Naturopathic, IV therapy, sports injury & acupuncture services to the Markham area."},
  { name: "Movement Sports Medicine + Physiotherapy", disc: "Physio", tpi: null, loc: "31 Disera Dr, Unit 210, Thornhill, ON L4J 0A7", city: "Thornhill", region: "York", note: "Confirm golf program", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://movementsportsmedicine.com/", email: "Hello@MovementSportsMed.com" },
  { name: "Physiomed — Thornhill", disc: "Physio", tpi: null, loc: "130 Racco Pkwy, Thornhill, ON L4J 4G3", city: "Thornhill", region: "York", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/", email: "thornhill@physiomed.ca",about:"Golf physiotherapy can improve mobility, swing consistency, and injury prevention. Learn how better movement supports better golf."},
  { name: "Physiomed — Vaughan", disc: "Physio", tpi: null, loc: "28 Roytec Rd, #5, Vaughan, ON L4L 8E4", city: "Vaughan", region: "York", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/", book: "https://myclinic.physiomed.ca/?clinicId=3013&lang=en-CA",about:"Golf physiotherapy can improve mobility, swing consistency, and injury prevention. Learn how better movement supports better golf."},
  { name: "The Rehab Grid — Stouffville", disc: "Physio", tpi: "TPI", loc: "Stouffville, ON", city: "Stouffville", region: "York", note: "Golf Physiotherapy", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.therehabgrid.com/north-york-toronto/golf-physiotherapy",about:"Optimize your golf performance with golf physiotherapy in North York, Toronto. The Rehab Grid offers TPI golf assessments and treatment plans!"},
  { name: "Anchor Health and Performance Clinic", disc: "Chiro", tpi: "TPI Level 1", loc: "5770 Timberlea Blvd, Unit 107, Mississauga, ON L4W 4W7", city: "Mississauga", region: "Peel", note: "Dr. Brett Herlehy", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.anchorhp.ca/tpi-golf-assessment-mississauga", email: "info@anchorhp.com", book: "https://anchorhp.janeapp.com/#/tpi-golf-assessment",about:"Elevate Your Golf Game with a TPI Golf Assessment. The Titleist Performance Institute's specialized Golf Assessment program is effective for any golfer's game."},
  { name: "OAK Physio & Wellness", disc: "Physio / Chiro", tpi: "TPI", loc: "1 City Centre Dr, Mississauga, ON", city: "Mississauga", region: "Peel", note: "Adrian, PT — TPI certified", db: "Yes", price: "Confirm with clinic", web: "https://oakphysiowellness.ca/mississauga/team/", email: "mississauga@oakphysiowellness.ca", book: "https://oakphysiowellness.janeapp.com/locations/oak-physio-and-wellness-mississauga/book" },
  { name: "FIT Clinic — ChiroGolf Program", disc: "Chiro", tpi: "TPI", loc: "2250 Bovaird Dr E, Suite 601, Brampton, ON L6R 0W3", city: "Brampton", region: "Peel", note: "Dr. Rashaad Nauth-Ali", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://fitclinic.ca/services/chirogolf-performance-program/", email: "info@fitclinic.ca", book: "https://fitclinic.janeapp.com/",about:"Evidence-Based Health Care For Optimal Health & Functioning"},
  { name: "Sheddon Physiotherapy — Oakville", disc: "Physio", tpi: "TPI Level 1", loc: "1300 Cornwall Rd #103, Oakville, ON", city: "Oakville", region: "Halton", note: "Erin Shapcott · Dartfish video swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.sheddonphysio.com/fit-fore-golf/", email: "erin@sheddonphysio.com",about:"Your golf health, performance, injury management and rehabilitation can be educated at the Sheddon Physio Sports Clinics in Oakville Burlington"},
  { name: "Sheddon Physiotherapy — Burlington", disc: "Physio", tpi: "TPI Level 1", loc: "695 Plains Rd E, #3 & #4, Burlington, ON L7T 2E8", city: "Burlington", region: "Halton", note: "Erin Shapcott & Liam Munshi · Dartfish swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.sheddonphysio-burlington.com/fit-fore-golf-burlington-clinic/", email: "liam@sheddonphysio.com",about:"Your golf health, performance, injury management and rehabilitation can be educated at the Sheddon Physio Sports Clinics in Burlington"},
  { name: "Dynamic Health & Performance", disc: "Chiro", tpi: "TPI", loc: "1660 North Service Rd E, Unit 112, Oakville, ON L6H 7G3", city: "Oakville", region: "Halton", note: "Dr. Jeff Weekes", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.dynamichealthandperformance.ca/site/golf-teams", email: "info@dynamichealthandperformance.ca",about:"Our Oakville chiropractors, physiotherapists and massage therapists provide therapy to help you perfect your golf swing, prevent repetitive stress injuries and improve performance."},
  { name: "Medical Grade Physiotherapy & Wellness", disc: "Physio / Chiro", tpi: null, loc: "Burlington, ON", city: "Burlington", region: "Halton", note: "Golfers' care", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://medicalgradephysio.ca/blog/physiotherapy-chiropractic-care-for-golfers" },
  { name: "PhysioLinks Rehab Clinic", disc: "Physio", tpi: null, loc: "Burlington, ON", city: "Burlington", region: "Halton", note: "Mandeep Virk · Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiolinksrehab.com/golf-rehab-treatment-burlington",about:"Dealing with injuries while playing? Our golf rehab treatment helps bring you back to your game efficiently. Call us in Burlington!"},
  { name: "Burlington Sports Therapy", disc: "Physio / Chiro", tpi: null, loc: "Burlington, ON", city: "Burlington", region: "Halton", note: "Confirm golf program", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://burlingtonsportstherapy.com/" },
  { name: "OMNI Health and Rehab", disc: "Physio", tpi: null, loc: "Milton, ON", city: "Milton", region: "Halton", note: "Confirm golf program", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://omniclinic.ca/programs/physiotherapy",about:"Expert physiotherapy in Burlington for back pain, post-surgery rehab, sports injuries, and chronic pain. Direct billing, no referral required."},
  { name: "IMPACT Chiropractic", disc: "Chiro / Physio", tpi: null, loc: "Milton, ON", city: "Milton", region: "Halton", note: "Confirm golf program", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://impactchiropractic.com/physiotherapy/",about:"Find relief from pain and injury with Impact Chiropractic's experienced physiotherapist Milton professionals. Get back to your active life. Book now!"},
  { name: "Bodywise Health & Rehab", disc: "Chiro", tpi: "TPI Level 1", loc: "385 Wilson St E, Suite 102, Ancaster, ON L9G 2C1", city: "Ancaster", region: "Hamilton", note: "Dr. Andrea Dorman", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.bodywiseancaster.ca/tpi-golf-assessment.html", book: "https://bodywisehealthandrehab.janeapp.com/",about:"The TPI Certified Golf Assessment puts the golfer through a physical screen which is correlated to the players swing characteristics. The results and subsequent corrections will allow the player to sw"},
  { name: "VF Mobility Labs", disc: "Physio", tpi: "TPI Level 1", loc: "Toronto, ON", city: "Toronto", region: "Toronto", note: "Vanessa Foucher", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.vfmobilitylabs.ca/", email: "vanessa@vfmobilitylabs.ca", book: "https://vfmobilitylabs.janeapp.com",about:"VF Mobility Labs is Toronto"},
  { name: "Studio Athletica / Push Pounds Sports Medicine", disc: "Physio", tpi: "TPI", loc: "Toronto, ON", city: "Toronto", region: "Toronto", note: "Video swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.studioathletica.com/titleist-performance-institute-tpi/",about:"The Titleist Performance Institute (TPI) is the world’s leading educational organization dedicated to the study of how the human body functions in relation to the golf swing."},
  { name: "The Rehab Grid — North York", disc: "Physio", tpi: "TPI", loc: "North York, Toronto, ON", city: "Toronto", region: "Toronto", note: "Golf Physiotherapy", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.therehabgrid.com/north-york-toronto/golf-physiotherapy",about:"Optimize your golf performance with golf physiotherapy in North York, Toronto. The Rehab Grid offers TPI golf assessments and treatment plans!"},
  { name: "Ready Room Health", disc: "Physio", tpi: "TPI", loc: "Toronto, ON", city: "Toronto", region: "Toronto", note: "Manni Wong", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.readyroomhealth.com/blog/article/TPI-golf-screen",about:"Manni Wong, Toronto Physiotherapist, analyzes your body with TPI Golf Screen to help you improve at Golf."},
  { name: "Art of Mobility", disc: "Physio", tpi: "TPI", loc: "Trinity Bellwoods, Toronto, ON", city: "Toronto", region: "Toronto", note: "Justin Mah", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://artofmobility.com/toronto/tpi-golf-physiotherapy/", email: "team@artofmobility.com", book: "https://artofmobility.janeapp.com/",about:"Unlock more power and prevent injury with TPI golf physiotherapy in Toronto. Book now for a swing-specific movement assessment."},
  { name: "Ohana Wellness Clinic", disc: "Chiro", tpi: "TPI", loc: "Bloor West Village, Toronto, ON", city: "Toronto", region: "Toronto", note: "Dr. Julian Colantonio", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://ohanawellnessclinic.com/golf-swing-assessment/", email: "info@ohanawellnessclinic.com", book: "https://ohanawellness.janeapp.com/#/discipline/25/treatment/332",about:"Let's refine or enhance your golf swing with a golf assessment. Visit our Golf Chiropractor at Ohana Wellness Clinic in West Toronto."},
  { name: "SHAPE Toronto Health & Wellness", disc: "Physio", tpi: "TPI", loc: "Toronto, ON", city: "Toronto", region: "Toronto", note: "Dr. Sender Deutsch · Golf PARformance", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.shapetoronto.com/training/302-golf-parformance-fitness-program",about:"SHAPE Toronto health & fitness professionals providing physiotherapy, chiropractic, ART® Active Release Techniques, medical acupuncture, registered massage therapy, personal training gym & nutrition c"},
  { name: "Foundation Physiotherapy and Wellness", disc: "Physio", tpi: null, loc: "Cityplace, Toronto, ON", city: "Toronto", region: "Toronto", note: "\"Golf Better\" program", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://foundationphysio.com/physiotherapy-services/athletic-conditions-athletes/golf-swing-assessments/",about:"Are you looking to recover from or prevent injuries this golf season? Feeling pain after a round of golf? Or looking to improve your posture, stance, and swing? Or maybe you’re new to golf and just wa"},
  { name: "Swing Lab – Performance & Therapy", disc: "Athletic Therapy*", tpi: null, loc: "Toronto, ON", city: "Toronto", region: "Toronto", note: "3D motion capture · GTA-wide golf therapy facility", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.swinglabtheory.com/",about:"Move Well. Play Better. Swing Lab - Performance & Therapy is the leading golf performance and therapy facility in the Greater Toronto Area. We identify and eliminate pain our clients experience while"},
  { name: "Physiomed — Danforth", disc: "Physio", tpi: null, loc: "3331 Danforth Ave, Units C & D, Toronto, ON", city: "Toronto", region: "Toronto", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/", book: "https://myclinic.physiomed.ca/?clinicId=3002&lang=en-CA",about:"Golf physiotherapy can improve mobility, swing consistency, and injury prevention. Learn how better movement supports better golf."},
  { name: "Physiomed — Leaside", disc: "Physio", tpi: null, loc: "86 Laird Dr (Rear), Toronto, ON M4G 3V1", city: "Toronto", region: "Toronto", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/", email: "DrEngineer@physiomed.ca",about:"Golf physiotherapy can improve mobility, swing consistency, and injury prevention. Learn how better movement supports better golf."},
  { name: "Physiomed — Rogers Road", disc: "Physio", tpi: null, loc: "321 Rogers Rd, Toronto, ON", city: "Toronto", region: "Toronto", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/", book: "https://myclinic.physiomed.ca/?clinicId=2764&lang=en-CA",about:"Golf physiotherapy can improve mobility, swing consistency, and injury prevention. Learn how better movement supports better golf."},
  { name: "Physiomed — St. Clair", disc: "Physio", tpi: null, loc: "1176 St. Clair Ave W, Toronto, ON", city: "Toronto", region: "Toronto", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/", book: "https://myclinic.physiomed.ca/?clinicId=1001&lang=en-CA",about:"Golf physiotherapy can improve mobility, swing consistency, and injury prevention. Learn how better movement supports better golf."},
  { name: "Physiomed — Yonge & Bloor", disc: "Physio", tpi: null, loc: "7 Isabella St, Toronto, ON", city: "Toronto", region: "Toronto", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/", book: "https://myclinic.physiomed.ca/?clinicId=3000&lang=en-CA",about:"Golf physiotherapy can improve mobility, swing consistency, and injury prevention. Learn how better movement supports better golf."},
  { name: "Physiomed — Bellamy", disc: "Physio", tpi: null, loc: "1920 Ellesmere Rd, Unit 106, Scarborough, ON M1H 2V5", city: "Scarborough", region: "Scarborough", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/",about:"Golf physiotherapy can improve mobility, swing consistency, and injury prevention. Learn how better movement supports better golf."},
  { name: "Physiomed — Kennedy", disc: "Physio", tpi: null, loc: "1399 Kennedy Rd, Suite 11A, Scarborough, ON M1P 2L6", city: "Scarborough", region: "Scarborough", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/",about:"Golf physiotherapy can improve mobility, swing consistency, and injury prevention. Learn how better movement supports better golf."},
  { name: "Physiomed — Whitby, Thickson", disc: "Physio", tpi: null, loc: "1614 Dundas St E, Suite 110, Whitby, ON L1N 8Y8", city: "Whitby", region: "Durham", note: "Golf swing analysis", db: "Confirm w/ clinic", price: "Confirm with clinic", web: "https://www.physiomed.ca/golf-physiotherapy-improve-swing/",about:"Golf physiotherapy can improve mobility, swing consistency, and injury prevention. Learn how better movement supports better golf."},
];

const GOLF_REGIONS = ["York", "Peel", "Halton", "Hamilton", "Toronto", "Scarborough", "Durham"];
