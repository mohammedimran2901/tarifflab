// VERIFIED dataset — compiled directly from official publications:
// 🇺🇸 US: CMS FY2026 IPPS Final Rule (CMS-1833-F), Table 5 (MS-DRG weights &
//    mean LOS) + Tables 1A/1D (national standardized amounts). Payment =
//    weight × ($6,752.61 operating + $524.15 capital) = weight × $7,276.76.
//    National average, before wage index/IME/DSH geographic adjustment.
// 🇬🇧 UK: NHS Payment Scheme 2025/26, Annex A prices workbook (pay-award
//    edition, published 27 June 2025). Elective unit prices in GBP, before
//    Market Forces Factor. Complexity tiers = CC (charlson-related) score bands.
// Sources & download dates: see SOURCES.md
const SOURCES = {
  us: "CMS FY2026 IPPS Final Rule (CMS-1833-F), Tables 1A/1D & 5",
  uk: "NHS Payment Scheme 2025/26 Annex A (pay award, 27 Jun 2025)",
  ae: "DoH Abu Dhabi IR-DRG relative weights (v2012-Q2 era, DoH-published weight update file)",
  de: "InEK Fallpauschalen-Katalog 2025 (aG-DRG-Version 2025, published 14 Oct 2024)",
  ukAct: "NHS National Cost Collection 2024/25, Admitted Patient Care (real FCE activity)",
  au: "IHACPA National Efficient Price Determination 2025-26, Appendix H (AR-DRG V11.0 price weights)"
};

// 🇦🇪 UAE: Abu Dhabi Department of Health IR-DRG system.
// Payment = relative weight × facility-specific negotiated base rate (AED),
// so DoH publishes WEIGHTS, not prices. Current weights require free Shafafiya
// registration; the weights below are from the DoH-published weight update
// file (v2012-Q2 era) — vintage labelled in SOURCES.md.
const AE = {
  "Primary hip replacement (elective)": { family: "IR-DRG 81041–81043 (Major Lower Extremity Joint)", tiers: [
    { code: "81041", tier: "severity 1", weight: 1.984 },
    { code: "81042", tier: "severity 2 (w/CC)", weight: 2.165 },
    { code: "81043", tier: "severity 3 (w/MCC)", weight: 3.183 } ] },
  "Primary knee replacement (elective)": { family: "IR-DRG 81041–81043 (Major Lower Extremity Joint)", tiers: [
    { code: "81041", tier: "severity 1", weight: 1.984 },
    { code: "81042", tier: "severity 2 (w/CC)", weight: 2.165 },
    { code: "81043", tier: "severity 3 (w/MCC)", weight: 3.183 } ] },
  "Shoulder replacement (elective)": { family: "IR-DRG 81051–81053 (Major Upper Extremity Joint)", tiers: [
    { code: "81051", tier: "severity 1", weight: 1.693 },
    { code: "81052", tier: "severity 2 (w/CC)", weight: 1.957 },
    { code: "81053", tier: "severity 3 (w/MCC)", weight: 3.333 } ] },
  "Elbow replacement (elective)": { family: "IR-DRG 81051–81053 (Major Upper Extremity Joint)", tiers: [
    { code: "81051", tier: "severity 1", weight: 1.693 },
    { code: "81052", tier: "severity 2 (w/CC)", weight: 1.957 },
    { code: "81053", tier: "severity 3 (w/MCC)", weight: 3.333 } ] },
  "Knee arthroscopy (e.g. meniscectomy)": { family: "IR-DRG 81701–81703 (Knee & Lower Leg)", tiers: [
    { code: "81701", tier: "severity 1", weight: 1.107 },
    { code: "81702", tier: "severity 2 (w/CC)", weight: 1.62 },
    { code: "81703", tier: "severity 3 (w/MCC)", weight: 3.076 } ] },
  "ACL / major knee ligament reconstruction": { family: "IR-DRG 81701–81703 (Knee & Lower Leg)", tiers: [
    { code: "81701", tier: "severity 1", weight: 1.107 },
    { code: "81702", tier: "severity 2 (w/CC)", weight: 1.62 },
    { code: "81703", tier: "severity 3 (w/MCC)", weight: 3.076 } ] },
  "Lumbar spinal fusion, single level (elective)": { family: "IR-DRG 81071–81073 (Spinal Fusion)", tiers: [
    { code: "81071", tier: "severity 1", weight: 2.339 },
    { code: "81072", tier: "severity 2 (w/CC)", weight: 3.134 },
    { code: "81073", tier: "severity 3 (w/MCC)", weight: 6.384 } ] },
  "Multi-level lumbar spinal fusion": { family: "IR-DRG 81071–81073 (Spinal Fusion)", tiers: [
    { code: "81071", tier: "severity 1", weight: 2.339 },
    { code: "81072", tier: "severity 2 (w/CC)", weight: 3.134 },
    { code: "81073", tier: "severity 3 (w/MCC)", weight: 6.384 } ] },
  "Cervical spinal fusion (elective)": { family: "IR-DRG 81071–81073 (Spinal Fusion)", tiers: [
    { code: "81071", tier: "severity 1", weight: 2.339 },
    { code: "81072", tier: "severity 2 (w/CC)", weight: 3.134 },
    { code: "81073", tier: "severity 3 (w/MCC)", weight: 6.384 } ] },
  "Complex spinal deformity correction": { family: "IR-DRG 81061–81063 (Spinal Fusion for Curvature)", tiers: [
    { code: "81061", tier: "severity 1", weight: 4.427 },
    { code: "81062", tier: "severity 2 (w/CC)", weight: 5.317 },
    { code: "81063", tier: "severity 3 (w/MCC)", weight: 7.885 } ] },
  "Major foot / ankle reconstruction (elective)": { family: "IR-DRG 81301–81303 (Foot Procedures)", tiers: [
    { code: "81301", tier: "severity 1", weight: 0.969 },
    { code: "81302", tier: "severity 2 (w/CC)", weight: 1.428 },
    { code: "81303", tier: "severity 3 (w/MCC)", weight: 2.131 } ] },
  "Bunion correction / minor foot surgery": { family: "IR-DRG 81301–81303 (Foot Procedures)", tiers: [
    { code: "81301", tier: "severity 1", weight: 0.969 },
    { code: "81302", tier: "severity 2 (w/CC)", weight: 1.428 },
    { code: "81303", tier: "severity 3 (w/MCC)", weight: 2.131 } ] },
  "Carpal tunnel release / minor hand surgery": { family: "IR-DRG 81801–81803 (Upper Extremity Procedures)", tiers: [
    { code: "81801", tier: "severity 1", weight: 0.904 },
    { code: "81802", tier: "severity 2 (w/CC)", weight: 1.369 },
    { code: "81803", tier: "severity 3 (w/MCC)", weight: 2.622 } ] },
  "Major hand surgery (e.g. Dupuytren's contracture)": { family: "IR-DRG 81801–81803 (Upper Extremity Procedures)", tiers: [
    { code: "81801", tier: "severity 1", weight: 0.904 },
    { code: "81802", tier: "severity 2 (w/CC)", weight: 1.369 },
    { code: "81803", tier: "severity 3 (w/MCC)", weight: 2.622 } ] },
  "Shoulder arthroscopy / intermediate shoulder surgery": { family: "IR-DRG 81801–81803 (Upper Extremity Procedures)", tiers: [
    { code: "81801", tier: "severity 1", weight: 0.904 },
    { code: "81802", tier: "severity 2 (w/CC)", weight: 1.369 },
    { code: "81803", tier: "severity 3 (w/MCC)", weight: 2.622 } ] },
  "Other hip surgery, non-joint (elective)": { family: "IR-DRG 81201–81203 (Hip & Femur Except Major Joint)", tiers: [
    { code: "81201", tier: "severity 1", weight: 1.362 },
    { code: "81202", tier: "severity 2 (w/CC)", weight: 1.753 },
    { code: "81203", tier: "severity 3 (w/MCC)", weight: 3.028 } ] },
  "Soft tissue / tendon procedures (musculoskeletal)": { family: "IR-DRG 81501–81503 (Soft Tissue Procedures)", tiers: [
    { code: "81501", tier: "severity 1", weight: 0.846 },
    { code: "81502", tier: "severity 2 (w/CC)", weight: 1.416 },
    { code: "81503", tier: "severity 3 (w/MCC)", weight: 3.091 } ] },
};

const PROCEDURES = [
  {
    name: "Primary hip replacement (elective)",
    us: { family: "MS-DRG 469 / 470", tiers: [
      { code: "470", tier: "w CC", price: 14036, alos: 2.2 },
      { code: "469", tier: "w MCC", price: 22072, alos: 4.4 } ] },
    uk: { family: "HRG HN12A–F (Very Major Hip)", tiers: [
      { code: "HN12F", tier: "CC 0–1", price: 7251 },
      { code: "HN12E", tier: "CC 2–3", price: 7489 },
      { code: "HN12D", tier: "CC 4–5", price: 8260 },
      { code: "HN12C", tier: "CC 6–7", price: 9839 },
      { code: "HN12B", tier: "CC 8–9", price: 11644 },
      { code: "HN12A", tier: "CC 10+", price: 13900 } ] }
  },
  {
    name: "Primary knee replacement (elective)",
    us: { family: "MS-DRG 469 / 470", tiers: [
      { code: "470", tier: "w CC", price: 14036, alos: 2.2 },
      { code: "469", tier: "w MCC", price: 22072, alos: 4.4 } ] },
    uk: { family: "HRG HN22A–E (Very Major Knee)", tiers: [
      { code: "HN22E", tier: "CC 0–1", price: 7222 },
      { code: "HN22D", tier: "CC 2–3", price: 7578 },
      { code: "HN22C", tier: "CC 4–5", price: 8054 },
      { code: "HN22B", tier: "CC 6–7", price: 10149 },
      { code: "HN22A", tier: "CC 8+", price: 10826 } ] }
  },
  {
    name: "Revision of hip or knee replacement",
    us: { family: "MS-DRG 466 / 467 / 468", tiers: [
      { code: "468", tier: "w/o CC/MCC", price: 19997, alos: 1.8 },
      { code: "467", tier: "w CC", price: 25662, alos: 4.1 },
      { code: "466", tier: "w MCC", price: 37878, alos: 9.1 } ] },
    uk: { family: "HRG HN80 / HN81 (Complex Hip or Knee)", tiers: [
      { code: "HN81E", tier: "Complex, CC 0–1", price: 9817 },
      { code: "HN81D", tier: "Complex, CC 2–3", price: 10446 },
      { code: "HN81C", tier: "Complex, CC 4–5", price: 11075 },
      { code: "HN81B", tier: "Complex, CC 6–8", price: 13068 },
      { code: "HN81A", tier: "Complex, CC 9+", price: 20086 },
      { code: "HN80D", tier: "Very complex, CC 0–2", price: 11907 },
      { code: "HN80C", tier: "Very complex, CC 3–5", price: 15156 },
      { code: "HN80B", tier: "Very complex, CC 6–8", price: 19605 },
      { code: "HN80A", tier: "Very complex, CC 9+", price: 27752 } ] }
  },
  {
    name: "Shoulder replacement (elective)",
    us: { family: "MS-DRG 507 / 508", tiers: [
      { code: "508", tier: "w/o CC/MCC", price: 11020, alos: 3.8 },
      { code: "507", tier: "w CC/MCC", price: 13145, alos: 6.4 } ] },
    uk: { family: "HRG HN52A–C (Very Major Shoulder)", tiers: [
      { code: "HN52C", tier: "CC 0–1", price: 6323 },
      { code: "HN52B", tier: "CC 2–3", price: 6760 },
      { code: "HN52A", tier: "CC 4+", price: 7413 } ] }
  },
  {
    name: "Knee arthroscopy (e.g. meniscectomy)",
    us: { family: "MS-DRG 488 / 489", tiers: [
      { code: "489", tier: "w/o CC/MCC", price: 8127, alos: 1.4 },
      { code: "488", tier: "w CC/MCC", price: 11087, alos: 3.1 } ] },
    uk: { family: "HRG HN24A–C (Intermediate Knee)", tiers: [
      { code: "HN24C", tier: "CC 0–1", price: 2143 },
      { code: "HN24B", tier: "CC 2–3", price: 2369 },
      { code: "HN24A", tier: "CC 4+", price: 3271 } ] }
  },
  {
    name: "ACL / major knee ligament reconstruction",
    us: { family: "MS-DRG 488 / 489", tiers: [
      { code: "489", tier: "w/o CC/MCC", price: 8127, alos: 1.4 },
      { code: "488", tier: "w CC/MCC", price: 11087, alos: 3.1 } ] },
    uk: { family: "HRG HN23A–C (Major Knee)", tiers: [
      { code: "HN23C", tier: "CC 0–1", price: 4399 },
      { code: "HN23B", tier: "CC 2–3", price: 4737 },
      { code: "HN23A", tier: "CC 4+", price: 5076 } ] }
  },
  {
    name: "Lumbar spinal fusion, single level (elective)",
    us: { family: "MS-DRG 450 / 451", tiers: [
      { code: "451", tier: "w/o MCC", price: 23507, alos: 3.1 },
      { code: "450", tier: "w MCC", price: 38782, alos: 8.1 } ] },
    uk: { family: "HRG HC54A–C (Major Spinal Reconstructive)", tiers: [
      { code: "HC54C", tier: "CC 0–1", price: 9616 },
      { code: "HC54B", tier: "CC 2–3", price: 10550 },
      { code: "HC54A", tier: "CC 4+", price: 14556 } ] }
  },
  {
    name: "Cervical spinal fusion (elective)",
    us: { family: "MS-DRG 471 / 472 / 473", tiers: [
      { code: "473", tier: "w/o CC/MCC", price: 17765, alos: 2.0 },
      { code: "472", tier: "w CC", price: 21438, alos: 3.5 },
      { code: "471", tier: "w MCC", price: 35137, alos: 9.4 } ] },
    uk: { family: "HRG HC63A–C (Major Extradural Spinal)", tiers: [
      { code: "HC63C", tier: "CC 0–1", price: 4895 },
      { code: "HC63B", tier: "CC 2–3", price: 5724 },
      { code: "HC63A", tier: "CC 4+", price: 7247 } ] }
  },
  {
    name: "Lumbar discectomy / decompression",
    us: { family: "MS-DRG 518 / 519 / 520", tiers: [
      { code: "520", tier: "w/o CC/MCC", price: 10871, alos: 2.6 },
      { code: "519", tier: "w CC", price: 14555, alos: 4.2 },
      { code: "518", tier: "w MCC", price: 27195, alos: 7.6 } ] },
    uk: { family: "HRG HC64A–C (Intermediate Extradural Spinal)", tiers: [
      { code: "HC64C", tier: "CC 0–1", price: 3911 },
      { code: "HC64B", tier: "CC 2–3", price: 4435 },
      { code: "HC64A", tier: "CC 4+", price: 5987 } ] }
  },
  {
    name: "Elbow replacement (elective)",
    us: { family: "MS-DRG 507 / 508", tiers: [
      { code: "508", tier: "w/o CC/MCC", price: 11020, alos: 3.8 },
      { code: "507", tier: "w CC/MCC", price: 13145, alos: 6.4 } ] },
    uk: { family: "HRG HN62A–B (Very Major Elbow)", tiers: [
      { code: "HN62B", tier: "CC 0–1", price: 6323 },
      { code: "HN62A", tier: "CC 2+", price: 6771 } ] }
  },
  {
    name: "Complex spinal deformity correction",
    us: { family: "MS-DRG 456 / 457 / 458", tiers: [
      { code: "458", tier: "w/o CC/MCC", price: 30363, alos: 2.8 },
      { code: "457", tier: "w CC", price: 43392, alos: 5.9 },
      { code: "456", tier: "w MCC", price: 61150, alos: 11.5 } ] },
    uk: { family: "HRG HC50 / HC51 (Instrumented Correction of Spinal Deformity)", tiers: [
      { code: "HC51C", tier: "Complex, CC 0–2", price: 29742 },
      { code: "HC51B", tier: "Complex, CC 3–5", price: 31601 },
      { code: "HC51A", tier: "Complex, CC 6+", price: 42012 },
      { code: "HC50A", tier: "Very complex, 19+", price: 39403 } ] }
  },
  {
    name: "Multi-level lumbar spinal fusion",
    us: { family: "MS-DRG 447 / 448", tiers: [
      { code: "448", tier: "w/o MCC", price: 30859, alos: 4.1 },
      { code: "447", tier: "w MCC", price: 48620, alos: 9.7 } ] },
    uk: { family: "HRG HC53A–C (Very Major Spinal Reconstructive)", tiers: [
      { code: "HC53C", tier: "CC 0–1", price: 9704 },
      { code: "HC53B", tier: "CC 2–3", price: 11649 },
      { code: "HC53A", tier: "CC 4+", price: 15075 } ] }
  },
  {
    name: "Major foot / ankle reconstruction (elective)",
    us: { family: "MS-DRG 503 / 504 / 505", tiers: [
      { code: "505", tier: "w/o CC/MCC", price: 13046, alos: 3.2 },
      { code: "504", tier: "w CC", price: 13602, alos: 5.5 },
      { code: "503", tier: "w MCC", price: 20310, alos: 8.9 } ] },
    uk: { family: "HRG HN32A–C (Very Major Foot)", tiers: [
      { code: "HN32C", tier: "CC 0–1", price: 6317 },
      { code: "HN32B", tier: "CC 2–3", price: 6767 },
      { code: "HN32A", tier: "CC 4+", price: 7670 } ] }
  },
  {
    name: "Bunion correction / minor foot surgery",
    us: { family: "MS-DRG 504 / 505", tiers: [
      { code: "505", tier: "w/o CC/MCC", price: 13046, alos: 3.2 },
      { code: "504", tier: "w CC", price: 13602, alos: 5.5 } ] },
    uk: { family: "HRG HN35A (Minor Foot)", tiers: [
      { code: "HN35A", tier: "19+ years", price: 1304 } ] }
  },
  {
    name: "Carpal tunnel release / minor hand surgery",
    us: { family: "MS-DRG 501 / 502", tiers: [
      { code: "502", tier: "w/o CC/MCC", price: 9794, alos: 3.0 },
      { code: "501", tier: "w CC", price: 12721, alos: 5.2 } ] },
    uk: { family: "HRG HN45A (Minor Hand)", tiers: [
      { code: "HN45A", tier: "19+ years", price: 1304 } ] }
  },
  {
    name: "Major hand surgery (e.g. Dupuytren's contracture)",
    us: { family: "MS-DRG 513 / 514", tiers: [
      { code: "514", tier: "w/o CC/MCC", price: 7439, alos: 2.6 },
      { code: "513", tier: "w CC/MCC", price: 11456, alos: 5.2 } ] },
    uk: { family: "HRG HN43A–B (Major Hand)", tiers: [
      { code: "HN43B", tier: "CC 0–1", price: 3384 },
      { code: "HN43A", tier: "CC 2+", price: 3835 } ] }
  },
  {
    name: "Shoulder arthroscopy / intermediate shoulder surgery",
    us: { family: "MS-DRG 510 / 511 / 512", tiers: [
      { code: "512", tier: "w/o CC/MCC", price: 12046, alos: 2.7 },
      { code: "511", tier: "w CC", price: 15131, alos: 4.4 },
      { code: "510", tier: "w MCC", price: 21979, alos: 6.9 } ] },
    uk: { family: "HRG HN54A–C (Intermediate Shoulder)", tiers: [
      { code: "HN54C", tier: "CC 0–1", price: 2731 },
      { code: "HN54B", tier: "CC 2–3", price: 2820 },
      { code: "HN54A", tier: "CC 4+", price: 3158 } ] }
  },
  {
    name: "Other hip surgery, non-joint (elective)",
    us: { family: "MS-DRG 481 / 482", tiers: [
      { code: "482", tier: "w/o CC/MCC", price: 11868, alos: 3.5 },
      { code: "481", tier: "w CC", price: 15241, alos: 4.8 } ] },
    uk: { family: "HRG HN14A–E (Intermediate Hip)", tiers: [
      { code: "HN14E", tier: "CC 0–1", price: 2375 },
      { code: "HN14D", tier: "CC 2–3", price: 3383 },
      { code: "HN14C", tier: "CC 4–5", price: 4060 },
      { code: "HN14B", tier: "CC 6–7", price: 5639 },
      { code: "HN14A", tier: "CC 8+", price: 7896 } ] }
  },
  {
    name: "Soft tissue / tendon procedures (musculoskeletal)",
    us: { family: "MS-DRG 500 / 501 / 502", tiers: [
      { code: "502", tier: "w/o CC/MCC", price: 9794, alos: 3.0 },
      { code: "501", tier: "w CC", price: 12721, alos: 5.2 },
      { code: "500", tier: "w MCC", price: 23029, alos: 9.9 } ] },
    uk: { family: "HRG HN93Z (Other Muscle/Tendon/Fascia/Ligament)", tiers: [
      { code: "HN93Z", tier: "All", price: 1718 } ] }
  },
];

// Example code-only lookup entries (so users searching raw codes get hits too)
const CODE_ALIASES = {
  "IN020K": 0, "IJ414": 0, "HNZ11": 0, "HNZ20": 1, "I47C": 0, "I47B": 1,
};

// 🇩🇪 Germany: G-DRG (aG-DRG 2025) relative weights (Bewertungsrelation) with
// official mean LOS (mittlere Verweildauer). Payment = weight × Landesbasis-
// fallwert (state base rate, negotiated ~€4,000–4,600 for 2025).
const DE = {
  "Primary hip replacement (elective)": { family: "G-DRG I47B–C", tiers: [
    { code: "I47C", tier: "ohne kompliz. Faktoren", weight: 1.389, alos: 6.5 },
    { code: "I47B", tier: "mit kompl. Faktoren", weight: 1.769, alos: 9.5 } ] },
  "Primary knee replacement (elective)": { family: "G-DRG I44B–E", tiers: [
    { code: "I44E", tier: "andere EP-Eingriffe", weight: 1.209, alos: 6.3 },
    { code: "I44D", tier: "oder Einbringen EP-Spacer", weight: 1.447, alos: 5.7 },
    { code: "I44C", tier: "ohne äußerst schwere CC (b)", weight: 1.584, alos: 6.9 },
    { code: "I44B", tier: "ohne äußerst schwere CC (a)", weight: 2.229, alos: 10.6 } ] },
  "Revision of hip or knee replacement": { family: "G-DRG I46A–C (Prothesenwechsel Hüfte)", tiers: [
    { code: "I46C", tier: "ohne äußerst schwere CC (b)", weight: 2.303, alos: 10.1 },
    { code: "I46B", tier: "ohne äußerst schwere CC (a)", weight: 3.167, alos: 16.9 },
    { code: "I46A", tier: "mit äußerst schweren CC", weight: 4.143, alos: 24.2 } ] },
  "Shoulder replacement (elective)": { family: "G-DRG I05B–C", tiers: [
    { code: "I05C", tier: "anderer großer Gelenkersatz", weight: 1.679, alos: 5.5 },
    { code: "I05B", tier: "inverse Endoprothese Schulter", weight: 2.01, alos: 6.9 } ] },
  "Elbow replacement (elective)": { family: "G-DRG I43A–B (EP Knie/Ellbogen)", tiers: [
    { code: "I43B", tier: "ohne äußerst schwere CC", weight: 2.367, alos: 8.3 },
    { code: "I43A", tier: "mit äußerst schweren CC", weight: 5.402, alos: 31.3 } ] },
  "Knee arthroscopy (e.g. meniscectomy)": { family: "G-DRG I24A–B (Arthroskopie)", tiers: [
    { code: "I24B", tier: "ohne kompl. Faktoren (b)", weight: 0.576, alos: 2.4 },
    { code: "I24A", tier: "mit kompl. Faktoren (a)", weight: 0.645, alos: 2.8 } ] },
  "ACL / major knee ligament reconstruction": { family: "G-DRG I30A–C (Komplexe Eingriffe Knie)", tiers: [
    { code: "I30C", tier: "ohne best. komplexe Eingriffe", weight: 0.772, alos: 2.9 },
    { code: "I30B", tier: "Alter > 15 / best. kompl. Eingr.", weight: 0.973, alos: 2.7 },
    { code: "I30A", tier: "komplexe Eingriffe, < 16 J.", weight: 1.276, alos: 4.8 } ] },
  "Lumbar spinal fusion, single level (elective)": { family: "G-DRG I09G–I (Eingriffe WS)", tiers: [
    { code: "I09I", tier: "ohne komplizierende Faktoren", weight: 1.358, alos: 7.8 },
    { code: "I09H", tier: "mit anderen kompliz. Faktoren", weight: 1.581, alos: 6.6 },
    { code: "I09G", tier: "mit bestimmten anderen kompl.", weight: 2.298, alos: 8.0 } ] },
  "Multi-level lumbar spinal fusion": { family: "G-DRG I09C–E (Eingriffe WS)", tiers: [
    { code: "I09E", tier: "mit best. kompl. Faktoren (c)", weight: 3.267, alos: 13.3 },
    { code: "I09D", tier: "mit best. kompl. Faktoren (b)", weight: 4.395, alos: 20.8 },
    { code: "I09C", tier: "mit best. kompl. Faktoren + Fixierung", weight: 4.669, alos: 18.2 } ] },
  "Cervical spinal fusion (elective)": { family: "G-DRG I09E–G (Eingriffe WS)", tiers: [
    { code: "I09G", tier: "mit bestimmten anderen kompl.", weight: 2.298, alos: 8.0 },
    { code: "I09F", tier: "best. kompl. Faktoren od. Alter", weight: 2.601, alos: 11.1 },
    { code: "I09E", tier: "mit best. kompl. Faktoren (c)", weight: 3.267, alos: 13.3 } ] },
  "Complex spinal deformity correction": { family: "G-DRG I06A–C (komplexe WS-Korrektur)", tiers: [
    { code: "I06C", tier: "ohne hochkomplexen Eingriff, > 18 J.", weight: 3.844, alos: 12.7 },
    { code: "I06B", tier: "mit sehr komplexem Eingriff", weight: 4.394, alos: 11.0 },
    { code: "I06A", tier: "mit hochkomplexem Korrektureingriff", weight: 6.959, alos: 26.2 } ] },
  "Lumbar discectomy / decompression": { family: "G-DRG I10F–H (andere Eingriffe WS)", tiers: [
    { code: "I10H", tier: "ohne mäßig komplexen Eingriff (c)", weight: 0.61, alos: 2.6 },
    { code: "I10G", tier: "ohne mäßig komplexen Eingriff (b)", weight: 0.726, alos: 4.8 },
    { code: "I10F", tier: "ohne mäßig komplexen Eingriff (a)", weight: 0.938, alos: 4.6 } ] },
  "Major foot / ankle reconstruction (elective)": { family: "G-DRG I20A–C (Eingriffe am Fuß)", tiers: [
    { code: "I20C", tier: "ohne mehrere komplexe Eingriffe", weight: 1.126, alos: 5.8 },
    { code: "I20B", tier: "mit mehreren komplexen Eingriffen", weight: 1.581, alos: 7.8 },
    { code: "I20A", tier: "mit mehreren hochkomplexen Eingriffen", weight: 1.972, alos: 9.3 } ] },
  "Bunion correction / minor foot surgery": { family: "G-DRG I20E–F (Eingriffe am Fuß)", tiers: [
    { code: "I20F", tier: "ohne komplexe Eingriffe", weight: 0.681, alos: 2.7 },
    { code: "I20E", tier: "andere Eingr. / Rheuma / Diabetes", weight: 0.835, alos: 3.0 } ] },
  "Carpal tunnel release / minor hand surgery": { family: "G-DRG I32E–F (Handgelenk/Hand)", tiers: [
    { code: "I32F", tier: "ohne komplexe Eingriffe", weight: 0.615, alos: 2.6 },
    { code: "I32E", tier: "mäßigig komplexe Eingriffe", weight: 0.787, alos: 3.1 } ] },
  "Major hand surgery (e.g. Dupuytren's contracture)": { family: "G-DRG I32B/D (Handgelenk/Hand)", tiers: [
    { code: "I32D", tier: "komplexer Eingriff ohne komplexe Diag.", weight: 0.992, alos: 2.9 },
    { code: "I32B", tier: "mit komplexem Eingriff", weight: 1.074, alos: 3.1 } ] },
  "Shoulder arthroscopy / intermediate shoulder surgery": { family: "G-DRG I16A–C (Eingriffe Schulter)", tiers: [
    { code: "I16C", tier: "obere Extremität (c)", weight: 0.692, alos: 2.4 },
    { code: "I16B", tier: "obere Extremität (b)", weight: 0.793, alos: 2.7 },
    { code: "I16A", tier: "obere Extremität (a)", weight: 0.836, alos: 2.3 } ] },
  "Other hip surgery, non-joint (elective)": { family: "G-DRG I08E–H (Hüfte/Femur)", tiers: [
    { code: "I08H", tier: "ein Belegungstag (b)", weight: 0.868, alos: 3.0 },
    { code: "I08G", tier: "ein Belegungstag (a)", weight: 1.117, alos: 4.8 },
    { code: "I08F", tier: "ohne komplexe Diagnose (b)", weight: 1.514, alos: 8.7 },
    { code: "I08E", tier: "ohne komplexe Diagnose (a)", weight: 2.138, alos: 10.8 } ] },
  "Soft tissue / tendon procedures (musculoskeletal)": { family: "G-DRG I23A–C (kleine Eingriffe)", tiers: [
    { code: "I23C", tier: "ohne bestimmte kleine Eingriffe", weight: 0.587, alos: 2.8 },
    { code: "I23B", tier: "mit bestimmten kleinen Eingriffen (b)", weight: 0.782, alos: 2.7 },
    { code: "I23A", tier: "mit bestimmten kleinen Eingriffen (a)", weight: 0.927, alos: 3.5 } ] },
};

// 🇬🇧 Real activity shares: NHS National Cost Collection 2024/25 — actual FCE
// counts per HRG code (all sectors combined).
const UK_ACTIVITY = {
  "HN12": { "HN12A": 1693, "HN12B": 1996, "HN12C": 4144, "HN12D": 8338, "HN12E": 17617, "HN12F": 20782 },
  "HN22": { "HN22A": 2674, "HN22B": 4520, "HN22C": 10766, "HN22D": 24412, "HN22E": 25811 },
  "HN81": { "HN81A": 1401, "HN81B": 1648, "HN81C": 2261, "HN81D": 3695, "HN81E": 3608 },
  "HN80": { "HN80A": 419, "HN80B": 456, "HN80C": 737, "HN80D": 472 },
  "HN52": { "HN52A": 2016, "HN52B": 3248, "HN52C": 4944 },
  "HN62": { "HN62A": 389, "HN62B": 541 },
  "HN24": { "HN24A": 1550, "HN24B": 3331, "HN24C": 13255, "HN24D": 558, "HN24E": 2242, "HN24F": 180 },
  "HN23": { "HN23A": 2055, "HN23B": 2425, "HN23C": 11223, "HN23D": 547, "HN23E": 1983 },
  "HC54": { "HC54A": 671, "HC54B": 597, "HC54C": 751 },
  "HC63": { "HC63A": 2593, "HC63B": 3169, "HC63C": 3755 },
  "HC64": { "HC64A": 1930, "HC64B": 3212, "HC64C": 5525 },
  "HC51": { "HC51A": 36, "HC51B": 78, "HC51C": 235, "HC51D": 346, "HC51E": 1280 },
  "HC50": { "HC50A": 39, "HC50B": 60 },
  "HC53": { "HC53A": 423, "HC53B": 267, "HC53C": 334 },
  "HN32": { "HN32A": 1150, "HN32B": 2462, "HN32C": 6647 },
  "HN35": { "HN35A": 6506, "HN35B": 810 },
  "HN45": { "HN45A": 38823, "HN45B": 828, "HN45C": 495 },
  "HN43": { "HN43A": 4422, "HN43B": 8645, "HN43C": 1077 },
  "HN54": { "HN54A": 712, "HN54B": 1235, "HN54C": 3635, "HN54D": 297 }
};
const UK_ACT_FAMILY = {
  "Primary hip replacement (elective)": "HN12",
  "Primary knee replacement (elective)": "HN22",
  "Revision of hip or knee replacement": "HN81",
  "Shoulder replacement (elective)": "HN52",
  "Elbow replacement (elective)": "HN62",
  "Knee arthroscopy (e.g. meniscectomy)": "HN24",
  "ACL / major knee ligament reconstruction": "HN23",
  "Lumbar spinal fusion, single level (elective)": "HC54",
  "Multi-level lumbar spinal fusion": "HC53",
  "Cervical spinal fusion (elective)": "HC63",
  "Complex spinal deformity correction": "HC51",
  "Lumbar discectomy / decompression": "HC64",
  "Major foot / ankle reconstruction (elective)": "HN32",
  "Bunion correction / minor foot surgery": "HN35",
  "Carpal tunnel release / minor hand surgery": "HN45",
  "Major hand surgery (e.g. Dupuytren's contracture)": "HN43",
  "Shoulder arthroscopy / intermediate shoulder surgery": "HN54"
};

// 🇦🇺 Australia: AR-DRG V11.0 price weights (NWAU) from IHACPA NEP 2025-26
// Appendix H, with official mean ALOS. Payment = price weight × National
// Efficient Price (A$; NEP 2024-25 = $6,465/NWAU).
const AU = {
  "Primary hip replacement (elective)": { family: "AR-DRG I33A/B (Hip Replacement, Non-Trauma)", tiers: [
    { code: "I33B", tier: "Minor Complexity", weight: 3.3985, alos: 3.4 },
    { code: "I33A", tier: "Major Complexity", weight: 4.7586, alos: 7.5 } ] },
  "Primary knee replacement (elective)": { family: "AR-DRG I04A/B (Knee Replacement)", tiers: [
    { code: "I04B", tier: "Minor Complexity", weight: 3.3738, alos: 3.7 },
    { code: "I04A", tier: "Major Complexity", weight: 4.3261, alos: 6.5 } ] },
  "Revision of hip or knee replacement": { family: "AR-DRG I31/I32 (Revision Hip/Knee)", tiers: [
    { code: "I31C", tier: "Revision hip, Minor", weight: 4.6229, alos: 7.0 },
    { code: "I31B", tier: "Revision hip, Intermediate", weight: 6.4049, alos: 11.4 },
    { code: "I31A", tier: "Revision hip, Major", weight: 9.8229, alos: 20.9 },
    { code: "I32B", tier: "Revision knee, Minor", weight: 5.1067, alos: 8.9 },
    { code: "I32A", tier: "Revision knee, Major", weight: 8.5196, alos: 19.0 } ] },
  "Shoulder replacement (elective)": { family: "AR-DRG I05A/B (Other Joint Replacement)", tiers: [
    { code: "I05B", tier: "Minor Complexity", weight: 3.4944, alos: 2.6 },
    { code: "I05A", tier: "Major Complexity", weight: 5.8361, alos: 9.6 } ] },
  "Elbow replacement (elective)": { family: "AR-DRG I05A/B (Other Joint Replacement)", tiers: [
    { code: "I05B", tier: "Minor Complexity", weight: 3.4944, alos: 2.6 },
    { code: "I05A", tier: "Major Complexity", weight: 5.8361, alos: 9.6 } ] },
  "Knee arthroscopy (e.g. meniscectomy)": { family: "AR-DRG I18B (Other Knee, Minor)", tiers: [
    { code: "I18B", tier: "Minor Complexity", weight: 1.316, alos: 1.1 } ] },
  "ACL / major knee ligament reconstruction": { family: "AR-DRG I29Z (Knee Reconstructions)", tiers: [
    { code: "I29Z", tier: "All", weight: 1.8182, alos: 1.3 } ] },
  "Lumbar spinal fusion, single level (elective)": { family: "AR-DRG I09B/C (Spinal Fusion)", tiers: [
    { code: "I09C", tier: "Minor Complexity", weight: 4.2266, alos: 3.9 },
    { code: "I09B", tier: "Intermediate Complexity", weight: 6.1886, alos: 7.4 } ] },
  "Multi-level lumbar spinal fusion": { family: "AR-DRG I09A/B (Spinal Fusion)", tiers: [
    { code: "I09B", tier: "Intermediate Complexity", weight: 6.1886, alos: 7.4 },
    { code: "I09A", tier: "Major Complexity", weight: 10.9984, alos: 18.6 } ] },
  "Cervical spinal fusion (elective)": { family: "AR-DRG I09B/C (Spinal Fusion)", tiers: [
    { code: "I09C", tier: "Minor Complexity", weight: 4.2266, alos: 3.9 },
    { code: "I09B", tier: "Intermediate Complexity", weight: 6.1886, alos: 7.4 } ] },
  "Complex spinal deformity correction": { family: "AR-DRG I06Z (Spinal Fusion for Deformity)", tiers: [
    { code: "I06Z", tier: "All", weight: 10.3493, alos: 7.1 } ] },
  "Lumbar discectomy / decompression": { family: "AR-DRG I10A/B (Other Back & Neck)", tiers: [
    { code: "I10B", tier: "Minor Complexity", weight: 2.1496, alos: 2.6 },
    { code: "I10A", tier: "Major Complexity", weight: 4.8425, alos: 10.0 } ] },
  "Major foot / ankle reconstruction (elective)": { family: "AR-DRG I20A/B (Other Foot)", tiers: [
    { code: "I20B", tier: "Minor Complexity", weight: 1.316, alos: 1.5 },
    { code: "I20A", tier: "Major Complexity", weight: 2.722, alos: 6.1 } ] },
  "Bunion correction / minor foot surgery": { family: "AR-DRG I20B (Other Foot, Minor)", tiers: [
    { code: "I20B", tier: "Minor Complexity", weight: 1.316, alos: 1.5 } ] },
  "Carpal tunnel release / minor hand surgery": { family: "AR-DRG I30Z (Hand Interventions)", tiers: [
    { code: "I30Z", tier: "All", weight: 0.8529, alos: 1.2 } ] },
  "Major hand surgery (e.g. Dupuytren's contracture)": { family: "AR-DRG I30Z (Hand Interventions)", tiers: [
    { code: "I30Z", tier: "All", weight: 0.8529, alos: 1.2 } ] },
  "Shoulder arthroscopy / intermediate shoulder surgery": { family: "AR-DRG I16Z (Other Shoulder)", tiers: [
    { code: "I16Z", tier: "All", weight: 1.655, alos: 1.3 } ] },
  "Other hip surgery, non-joint (elective)": { family: "AR-DRG I08A–C (Hip & Femur)", tiers: [
    { code: "I08C", tier: "Minor Complexity", weight: 2.9049, alos: 6.0 },
    { code: "I08B", tier: "Intermediate Complexity", weight: 4.0197, alos: 8.9 },
    { code: "I08A", tier: "Major Complexity", weight: 6.2959, alos: 15.0 } ] },
  "Soft tissue / tendon procedures (musculoskeletal)": { family: "AR-DRG I27A/B (Soft Tissue)", tiers: [
    { code: "I27B", tier: "Minor Complexity", weight: 1.4282, alos: 2.6 },
    { code: "I27A", tier: "Major Complexity", weight: 4.7208, alos: 11.6 } ] },
};
