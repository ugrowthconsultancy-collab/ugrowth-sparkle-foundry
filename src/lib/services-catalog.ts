// Single source of truth for all 9 Done-for-you services.
// Bilingual content (EN + HI) kept inline so service pages can render
// without round-tripping to i18n JSON files.

import {
  Receipt,
  FileBadge,
  Building2,
  Briefcase,
  ClipboardCheck,
  Users,
  Stamp,
  UtensilsCrossed,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";

export type ServiceLang = "en" | "hi";

export type ServiceFAQ = { q: string; a: string };

export type ServiceDef = {
  slug: string;
  // Maps to public.service_type enum
  serviceType:
    | "gst_registration"
    | "udyam"
    | "pvt_ltd_incorporation"
    | "llp_incorporation"
    | "roc_annual_filing"
    | "epf_setup"
    | "trademark_filing"
    | "fssai"
    | "compliance_subscription";
  icon: LucideIcon;
  priceInr: number;          // rupees (display)
  priceInrPaise: number;     // paise (DB)
  isSubscription?: boolean;  // 9th product
  billingCycle?: "monthly";
  // Timeline used to compute estimated delivery
  timelineDays: number;
  content: Record<
    ServiceLang,
    {
      cardName: string;
      cardDesc: string;
      title: string;
      heroSubtitle: string;
      timelineLabel: string;
      whatYouGet: string[];
      requirements: string[];
      trust: string[];
      faq: ServiceFAQ[];
    }
  >;
};

const baseTrust = {
  en: ["100% online", "Indian CA partner", "Money-back if we miss timeline + 7 days"],
  hi: ["100% ऑनलाइन", "भारतीय CA पार्टनर", "समय-सीमा + 7 दिन से देरी पर पैसा वापस"],
};

export const SERVICES: ServiceDef[] = [
  {
    slug: "gst-registration",
    serviceType: "gst_registration",
    icon: Receipt,
    priceInr: 1999,
    priceInrPaise: 199900,
    timelineDays: 7,
    content: {
      en: {
        cardName: "GST Registration",
        cardDesc: "Get your GSTIN in a week. Verified CA filing.",
        title: "GST Registration for your business",
        heroSubtitle: "Get your GST number in 7 working days.",
        timelineLabel: "7 working days standard, 7–15 days for officer-verified path",
        whatYouGet: [
          "Valid GSTIN certificate",
          "Application drafted and filed by a partner CA",
          "ARN tracking and follow-up with the GST officer",
          "Soft + hard copy of certificate by email/WhatsApp",
        ],
        requirements: [
          "PAN card of business / proprietor",
          "Aadhaar of authorised signatory",
          "Proof of business address (utility bill / rent agreement)",
          "Bank account details (cancelled cheque or statement)",
          "Passport-size photo of signatory",
        ],
        trust: baseTrust.en,
        faq: [
          { q: "Do I really need GST registration?", a: "If your turnover crosses ₹40 lakh (₹20 lakh for services) or you sell across states, yes. We confirm in a 5-min call before filing." },
          { q: "What if my address has changed recently?", a: "Use your current proof. We'll file an amendment after registration if needed — no extra fee in the first 30 days." },
          { q: "Can I do this myself?", a: "Yes, the GST portal is free. Most founders give up around the address-proof or officer-query step. We handle both." },
          { q: "What if the officer rejects my application?", a: "We respond to officer queries up to 2 rounds at no extra cost. Refund applies if not resolved." },
          { q: "Will my filings be handled later?", a: "Not in this package. Add our Monthly Compliance Subscription for ongoing GSTR-1 + 3B filings." },
        ],
      },
      hi: {
        cardName: "GST पंजीकरण",
        cardDesc: "एक सप्ताह में GSTIN पाएं। प्रमाणित CA द्वारा फाइलिंग।",
        title: "अपने व्यवसाय के लिए GST पंजीकरण",
        heroSubtitle: "7 कार्य दिवस में अपना GST नंबर पाएं।",
        timelineLabel: "7 कार्य दिवस मानक; अधिकारी सत्यापन में 7–15 दिन",
        whatYouGet: [
          "मान्य GSTIN प्रमाणपत्र",
          "पार्टनर CA द्वारा आवेदन तैयार और दाखिल",
          "ARN ट्रैकिंग और अधिकारी से फॉलोअप",
          "ईमेल/WhatsApp पर सॉफ्ट + हार्ड कॉपी",
        ],
        requirements: [
          "व्यवसाय/स्वामी का पैन कार्ड",
          "अधिकृत हस्ताक्षरकर्ता का आधार",
          "व्यवसाय पते का प्रमाण (बिजली बिल / किरायानामा)",
          "बैंक खाता विवरण (रद्द चेक या स्टेटमेंट)",
          "हस्ताक्षरकर्ता का पासपोर्ट साइज़ फोटो",
        ],
        trust: baseTrust.hi,
        faq: [
          { q: "क्या मुझे वाकई GST पंजीकरण चाहिए?", a: "टर्नओवर ₹40 लाख (सेवाओं के लिए ₹20 लाख) से अधिक हो या अंतर-राज्य बिक्री करते हों — तो हाँ। फाइलिंग से पहले 5 मिनट की कॉल में पुष्टि करते हैं।" },
          { q: "अगर मेरा पता हाल ही में बदला है?", a: "वर्तमान प्रमाण उपयोग करें। ज़रूरत पड़ी तो 30 दिनों में संशोधन निःशुल्क।" },
          { q: "क्या मैं स्वयं कर सकता हूँ?", a: "हाँ, पोर्टल मुफ़्त है। पते का प्रमाण और अधिकारी प्रश्न पर ज़्यादातर लोग रुक जाते हैं — वही हम संभालते हैं।" },
          { q: "अगर अधिकारी आवेदन अस्वीकार करे?", a: "2 राउंड तक अधिकारी प्रश्नों का उत्तर निःशुल्क। न होने पर रिफंड।" },
          { q: "क्या आगे की फाइलिंग शामिल है?", a: "इस पैकेज में नहीं। निरंतर GSTR-1 + 3B के लिए मासिक अनुपालन सब्सक्रिप्शन लें।" },
        ],
      },
    },
  },
  {
    slug: "udyam-registration",
    serviceType: "udyam",
    icon: FileBadge,
    priceInr: 999,
    priceInrPaise: 99900,
    timelineDays: 3,
    content: {
      en: {
        cardName: "Udyam (MSME) Registration",
        cardDesc: "Government-issued MSME certificate. Same week.",
        title: "Udyam / MSME Registration",
        heroSubtitle: "Get your MSME certificate this week.",
        timelineLabel: "Usually same week (1–3 working days)",
        whatYouGet: [
          "Udyam Registration Certificate (UAM)",
          "MSME classification (Micro / Small / Medium)",
          "Eligibility for MSME schemes, subsidised loans, and government tender preference",
        ],
        requirements: [
          "Aadhaar of proprietor / authorised signatory",
          "PAN of business",
          "Bank account details",
          "Self-declared turnover and investment figures",
        ],
        trust: baseTrust.en,
        faq: [
          { q: "What does Udyam unlock for me?", a: "Bank loans at lower interest, government tender preference, delayed-payment protection (45-day rule), and several state subsidies." },
          { q: "Is it free on the government site?", a: "Yes. We charge for accuracy of declarations, classification, and follow-up. Mis-classification can disqualify you from schemes." },
          { q: "Do I need a GST number first?", a: "Not mandatory if turnover is below threshold, but recommended." },
          { q: "Can a proprietorship apply?", a: "Yes — proprietorship, partnership, LLP, and Pvt Ltd are all eligible." },
          { q: "Does Udyam expire?", a: "It's lifetime-valid. You only need to update if turnover/investment changes brackets." },
        ],
      },
      hi: {
        cardName: "उद्यम (MSME) पंजीकरण",
        cardDesc: "सरकारी MSME प्रमाणपत्र। उसी सप्ताह।",
        title: "उद्यम / MSME पंजीकरण",
        heroSubtitle: "इसी सप्ताह अपना MSME प्रमाणपत्र पाएं।",
        timelineLabel: "आम तौर पर 1–3 कार्य दिवस",
        whatYouGet: [
          "उद्यम पंजीकरण प्रमाणपत्र",
          "MSME वर्गीकरण (माइक्रो/स्मॉल/मीडियम)",
          "MSME योजनाओं, सब्सिडी ऋण और सरकारी निविदा वरीयता हेतु पात्रता",
        ],
        requirements: [
          "स्वामी का आधार",
          "व्यवसाय का पैन",
          "बैंक खाता विवरण",
          "स्व-घोषित टर्नओवर और निवेश",
        ],
        trust: baseTrust.hi,
        faq: [
          { q: "उद्यम से क्या लाभ है?", a: "कम ब्याज पर ऋण, सरकारी टेंडर वरीयता, 45-दिन भुगतान सुरक्षा, और कई राज्य सब्सिडी।" },
          { q: "क्या सरकारी साइट पर मुफ़्त नहीं है?", a: "हाँ, मुफ़्त है। हम सही घोषणा और वर्गीकरण के लिए शुल्क लेते हैं।" },
          { q: "क्या GST पहले चाहिए?", a: "जरूरी नहीं, पर सुझाव दिया जाता है।" },
          { q: "क्या प्रोप्राइटरशिप आवेदन कर सकती है?", a: "हाँ — सभी रूप पात्र हैं।" },
          { q: "क्या उद्यम की समय-सीमा है?", a: "आजीवन वैध। केवल वर्ग बदलने पर अपडेट करना होता है।" },
        ],
      },
    },
  },
  {
    slug: "pvt-ltd",
    serviceType: "pvt_ltd_incorporation",
    icon: Building2,
    priceInr: 6999,
    priceInrPaise: 699900,
    timelineDays: 14,
    content: {
      en: {
        cardName: "Private Limited Company",
        cardDesc: "Full Pvt Ltd incorporation with DIN, DSC, MoA, AoA.",
        title: "Private Limited Company Incorporation",
        heroSubtitle: "Your Pvt Ltd company, incorporated in 10–14 working days.",
        timelineLabel: "10–14 working days end-to-end",
        whatYouGet: [
          "Certificate of Incorporation (COI) from MCA",
          "Company PAN + TAN",
          "Director Identification Number (DIN) for up to 2 directors",
          "Digital Signature Certificate (DSC) for 2 directors",
          "Memorandum (MoA) + Articles (AoA) drafted",
          "Bank account opening letter",
        ],
        requirements: [
          "PAN + Aadhaar of all directors and shareholders",
          "Passport-size photo of each director",
          "Address proof of registered office (rent agreement + NOC + utility bill)",
          "3 proposed company names in order of preference",
          "Initial authorised capital (default ₹1 lakh)",
        ],
        trust: baseTrust.en,
        faq: [
          { q: "How many directors do I need?", a: "Minimum 2 directors and 2 shareholders. Both can be the same people." },
          { q: "Can my home address be the registered office?", a: "Yes — utility bill in your name + NOC from owner is enough." },
          { q: "What about GST after incorporation?", a: "We can bundle GST registration at a discount. Most founders take it once they cross ₹20 lakh turnover." },
          { q: "Will I get the certificate by email?", a: "Yes — COI, PAN, TAN are emailed and also delivered as a printed packet by courier." },
          { q: "Stamp duty and government fees included?", a: "Yes — all government fees up to ₹1 lakh authorised capital are included. Higher capital is quoted separately." },
        ],
      },
      hi: {
        cardName: "प्राइवेट लिमिटेड कंपनी",
        cardDesc: "पूर्ण Pvt Ltd निगमन — DIN, DSC, MoA, AoA सहित।",
        title: "प्राइवेट लिमिटेड कंपनी निगमन",
        heroSubtitle: "10–14 कार्य दिवसों में आपकी Pvt Ltd कंपनी।",
        timelineLabel: "एंड-टू-एंड 10–14 कार्य दिवस",
        whatYouGet: [
          "MCA से निगमन प्रमाणपत्र (COI)",
          "कंपनी का PAN + TAN",
          "2 निदेशकों के लिए DIN",
          "2 निदेशकों के लिए डिजिटल हस्ताक्षर (DSC)",
          "MoA + AoA का प्रारूपण",
          "बैंक खाता खोलने का पत्र",
        ],
        requirements: [
          "सभी निदेशकों/शेयरधारकों का PAN + आधार",
          "प्रत्येक निदेशक का पासपोर्ट साइज़ फोटो",
          "पंजीकृत कार्यालय पते का प्रमाण (किरायानामा + NOC + बिल)",
          "वरीयता क्रम में 3 कंपनी नाम",
          "प्रारंभिक अधिकृत पूंजी (डिफ़ॉल्ट ₹1 लाख)",
        ],
        trust: baseTrust.hi,
        faq: [
          { q: "कितने निदेशक चाहिए?", a: "न्यूनतम 2 निदेशक और 2 शेयरधारक। दोनों एक ही व्यक्ति हो सकते हैं।" },
          { q: "क्या घर का पता पंजीकृत कार्यालय हो सकता है?", a: "हाँ — आपके नाम का बिल + मालिक का NOC पर्याप्त।" },
          { q: "निगमन के बाद GST?", a: "हम छूट के साथ GST बंडल कर सकते हैं।" },
          { q: "क्या प्रमाणपत्र ईमेल से मिलेगा?", a: "हाँ — COI, PAN, TAN ईमेल और कूरियर दोनों से।" },
          { q: "क्या स्टाम्प ड्यूटी शामिल है?", a: "हाँ — ₹1 लाख अधिकृत पूंजी तक सभी सरकारी शुल्क शामिल।" },
        ],
      },
    },
  },
  {
    slug: "llp",
    serviceType: "llp_incorporation",
    icon: Briefcase,
    priceInr: 4999,
    priceInrPaise: 499900,
    timelineDays: 14,
    content: {
      en: {
        cardName: "LLP Incorporation",
        cardDesc: "Limited Liability Partnership — lower cost than Pvt Ltd.",
        title: "LLP (Limited Liability Partnership) Incorporation",
        heroSubtitle: "Your LLP, incorporated in 10–14 working days.",
        timelineLabel: "10–14 working days end-to-end",
        whatYouGet: [
          "LLP Certificate of Incorporation",
          "LLP PAN + TAN",
          "DPIN for 2 designated partners",
          "DSC for 2 partners",
          "LLP Agreement drafted and filed",
        ],
        requirements: [
          "PAN + Aadhaar of all partners",
          "Passport-size photos",
          "Registered office address proof",
          "2 proposed LLP names",
          "Capital contribution split between partners",
        ],
        trust: baseTrust.en,
        faq: [
          { q: "LLP or Pvt Ltd — which should I pick?", a: "LLP is cheaper to run (no audit till ₹40L turnover). Pvt Ltd is better if you plan to raise equity." },
          { q: "Can I convert LLP to Pvt Ltd later?", a: "Yes, but it's a 30–45 day process. Easier to start as Pvt Ltd if equity is on the roadmap." },
          { q: "How many partners do I need?", a: "Minimum 2 designated partners. At least one must be resident in India." },
          { q: "Is audit mandatory?", a: "Only if turnover exceeds ₹40 lakh or contribution exceeds ₹25 lakh." },
          { q: "Annual compliance?", a: "Yes — Form 8 and Form 11 every year. Our Monthly Compliance Subscription covers this." },
        ],
      },
      hi: {
        cardName: "LLP निगमन",
        cardDesc: "लिमिटेड लायबिलिटी पार्टनरशिप — Pvt Ltd से सस्ता।",
        title: "LLP निगमन",
        heroSubtitle: "10–14 कार्य दिवस में आपका LLP।",
        timelineLabel: "10–14 कार्य दिवस",
        whatYouGet: [
          "LLP निगमन प्रमाणपत्र",
          "LLP का PAN + TAN",
          "2 नामित भागीदारों के लिए DPIN",
          "2 भागीदारों के लिए DSC",
          "LLP एग्रीमेंट का प्रारूप और फाइलिंग",
        ],
        requirements: [
          "सभी भागीदारों का PAN + आधार",
          "पासपोर्ट साइज़ फोटो",
          "पंजीकृत कार्यालय पते का प्रमाण",
          "2 प्रस्तावित LLP नाम",
          "भागीदारों के बीच पूंजी विभाजन",
        ],
        trust: baseTrust.hi,
        faq: [
          { q: "LLP या Pvt Ltd?", a: "LLP चलाना सस्ता; ₹40L तक ऑडिट नहीं। इक्विटी जुटानी हो तो Pvt Ltd।" },
          { q: "क्या बाद में Pvt Ltd में बदल सकते हैं?", a: "हाँ, 30–45 दिन की प्रक्रिया।" },
          { q: "कितने भागीदार?", a: "न्यूनतम 2 नामित भागीदार; कम से कम एक भारत निवासी।" },
          { q: "क्या ऑडिट अनिवार्य है?", a: "केवल ₹40L टर्नओवर या ₹25L योगदान से ऊपर।" },
          { q: "वार्षिक अनुपालन?", a: "हाँ — Form 8 और Form 11। हमारी सब्सक्रिप्शन में शामिल।" },
        ],
      },
    },
  },
  {
    slug: "roc-annual-filing",
    serviceType: "roc_annual_filing",
    icon: ClipboardCheck,
    priceInr: 6999,
    priceInrPaise: 699900,
    timelineDays: 21,
    content: {
      en: {
        cardName: "ROC Annual Filing",
        cardDesc: "AOC-4 + MGT-7 for your Pvt Ltd / OPC. Year-round.",
        title: "ROC Annual Filing (AOC-4 + MGT-7)",
        heroSubtitle: "Stay compliant. We file your annual returns with the Registrar of Companies.",
        timelineLabel: "Year-round — filed before MCA deadline (typically Oct–Nov)",
        whatYouGet: [
          "AOC-4 (Financial Statements) filing",
          "MGT-7 / MGT-7A (Annual Return) filing",
          "Director's report drafted",
          "Compliance certificate from partner CA",
          "Reminder alerts for next year",
        ],
        requirements: [
          "Audited financial statements (we can arrange if missing)",
          "List of shareholders and directors",
          "Board meeting minutes for the year",
          "Last year's filings (if any)",
        ],
        trust: baseTrust.en,
        faq: [
          { q: "What's the penalty for late filing?", a: "₹100 per day per form, no upper cap. Pvt Ltd directors can also be disqualified after 3 years of default." },
          { q: "Do I need an audit first?", a: "Yes — Pvt Ltd companies need a statutory audit every year regardless of turnover. We bundle audit at +₹3,500." },
          { q: "What if I haven't filed for previous years?", a: "We can file back-years too. Penalty is quoted upfront before you commit." },
          { q: "Is GST filing the same thing?", a: "No — GST and ROC are separate. ROC is once a year; GST is monthly/quarterly." },
          { q: "When is the deadline?", a: "AOC-4: 30 days from AGM. MGT-7: 60 days from AGM. AGM must happen by 30 Sep each year." },
        ],
      },
      hi: {
        cardName: "ROC वार्षिक फाइलिंग",
        cardDesc: "आपकी Pvt Ltd / OPC के लिए AOC-4 + MGT-7।",
        title: "ROC वार्षिक फाइलिंग (AOC-4 + MGT-7)",
        heroSubtitle: "अनुपालन में रहें। हम आपके वार्षिक रिटर्न दाखिल करते हैं।",
        timelineLabel: "वर्ष भर — MCA समय-सीमा (आम तौर पर अक्टूबर–नवंबर) से पहले",
        whatYouGet: [
          "AOC-4 (वित्तीय विवरण) फाइलिंग",
          "MGT-7 / MGT-7A (वार्षिक रिटर्न) फाइलिंग",
          "निदेशक रिपोर्ट का प्रारूपण",
          "पार्टनर CA द्वारा अनुपालन प्रमाणपत्र",
          "अगले वर्ष के लिए रिमाइंडर",
        ],
        requirements: [
          "ऑडिटेड वित्तीय विवरण",
          "शेयरधारक और निदेशक सूची",
          "बोर्ड बैठक के कार्यवृत्त",
          "पिछले वर्ष की फाइलिंग (यदि कोई)",
        ],
        trust: baseTrust.hi,
        faq: [
          { q: "विलंब का जुर्माना?", a: "₹100 प्रति दिन प्रति फॉर्म, बिना सीमा।" },
          { q: "क्या ऑडिट पहले चाहिए?", a: "हाँ — Pvt Ltd में हर साल वैधानिक ऑडिट। हम +₹3,500 में बंडल करते हैं।" },
          { q: "पिछले वर्षों की फाइलिंग न होने पर?", a: "बैक-ईयर फाइलिंग भी संभव। पहले से जुर्माना उद्धृत।" },
          { q: "क्या GST और ROC एक ही हैं?", a: "नहीं — ROC साल में एक बार; GST मासिक/त्रैमासिक।" },
          { q: "समय-सीमा?", a: "AOC-4: AGM से 30 दिन। MGT-7: AGM से 60 दिन। AGM 30 सितंबर तक।" },
        ],
      },
    },
  },
  {
    slug: "epf-setup",
    serviceType: "epf_setup",
    icon: Users,
    priceInr: 4999,
    priceInrPaise: 499900,
    timelineDays: 7,
    content: {
      en: {
        cardName: "EPF Setup",
        cardDesc: "Employee Provident Fund registration for your team.",
        title: "EPF / ESI Registration",
        heroSubtitle: "Set up Provident Fund for your team in 1 week.",
        timelineLabel: "Approximately 1 week",
        whatYouGet: [
          "EPFO establishment registration",
          "ESIC registration (if applicable)",
          "Employer code and PF establishment ID",
          "First-month contribution setup guidance",
          "Employee onboarding template",
        ],
        requirements: [
          "Company PAN + incorporation certificate",
          "List of employees with Aadhaar + PAN",
          "Salary structure",
          "Cancelled cheque of company bank account",
          "Digital Signature of authorised signatory",
        ],
        trust: baseTrust.en,
        faq: [
          { q: "When is EPF mandatory?", a: "When you have 20+ employees. Voluntary registration is allowed below that and many startups opt in to attract talent." },
          { q: "What's the employer cost?", a: "12% of basic salary (with cap on basic). We share a clean breakdown before you commit." },
          { q: "Does ESI apply to me?", a: "If you have employees earning ≤ ₹21,000/month gross. We assess in the intake call." },
          { q: "Will you manage monthly returns?", a: "Not in this package — add Monthly Compliance Subscription for ongoing PF + ESI returns." },
          { q: "Can a director be in EPF?", a: "Only if drawing salary as an employee. Pure equity-only directors are excluded." },
        ],
      },
      hi: {
        cardName: "EPF सेटअप",
        cardDesc: "अपनी टीम के लिए कर्मचारी भविष्य निधि।",
        title: "EPF / ESI पंजीकरण",
        heroSubtitle: "1 सप्ताह में टीम के लिए PF सेटअप।",
        timelineLabel: "लगभग 1 सप्ताह",
        whatYouGet: [
          "EPFO स्थापना पंजीकरण",
          "ESIC पंजीकरण (यदि लागू)",
          "नियोक्ता कोड और PF स्थापना ID",
          "पहले महीने के योगदान का मार्गदर्शन",
          "कर्मचारी ऑनबोर्डिंग टेम्पलेट",
        ],
        requirements: [
          "कंपनी का PAN + निगमन प्रमाणपत्र",
          "कर्मचारियों की सूची (आधार + PAN)",
          "वेतन संरचना",
          "कंपनी का रद्द चेक",
          "अधिकृत हस्ताक्षरकर्ता का DSC",
        ],
        trust: baseTrust.hi,
        faq: [
          { q: "EPF कब अनिवार्य?", a: "20+ कर्मचारियों पर। उससे कम पर स्वैच्छिक।" },
          { q: "नियोक्ता का खर्च?", a: "मूल वेतन का 12% (सीमा के साथ)।" },
          { q: "ESI मुझ पर लागू?", a: "यदि कर्मचारी का ग्रॉस ≤ ₹21,000/माह हो।" },
          { q: "मासिक रिटर्न शामिल?", a: "नहीं — सब्सक्रिप्शन में लें।" },
          { q: "क्या निदेशक EPF में हो सकते हैं?", a: "केवल यदि वेतन लेते हों।" },
        ],
      },
    },
  },
  {
    slug: "trademark-filing",
    serviceType: "trademark_filing",
    icon: Stamp,
    priceInr: 4999,
    priceInrPaise: 499900,
    timelineDays: 180,
    content: {
      en: {
        cardName: "Trademark Filing",
        cardDesc: "Protect your brand name. TM application + class search.",
        title: "Trademark Filing (TM Application)",
        heroSubtitle: "Lock down your brand name. ™ within 3 days, ® in ~6 months.",
        timelineLabel: "™ usage right within 3 days of filing. ® registration ~6 months (government timeline).",
        whatYouGet: [
          "Trademark class identification (Nice classification)",
          "Public search and conflict report",
          "Application drafting and filing (TM-A)",
          "Government receipt with TM application number",
          "Examination report response (1 round)",
        ],
        requirements: [
          "Brand name (and logo, if applicable)",
          "Description of goods/services",
          "Date of first use (if already in use)",
          "Applicant details (PAN + Aadhaar / company PAN)",
          "Power of Attorney (we draft and you sign)",
        ],
        trust: baseTrust.en,
        faq: [
          { q: "Can I use ™ before registration?", a: "Yes — the moment your application is filed, you can use ™. ® is only allowed after registration is granted." },
          { q: "What's the difference between ™ and ®?", a: "™ = applied for, ® = registered. ® gives stronger legal protection." },
          { q: "How many classes should I file in?", a: "One class is included. Each additional class is +₹4,500 (government fees included)." },
          { q: "What if there's an objection?", a: "We respond to one examination report at no extra cost. Hearing representation is quoted separately." },
          { q: "Is the trademark valid forever?", a: "Initial registration is 10 years, renewable indefinitely." },
        ],
      },
      hi: {
        cardName: "ट्रेडमार्क फाइलिंग",
        cardDesc: "अपने ब्रांड का नाम सुरक्षित करें।",
        title: "ट्रेडमार्क फाइलिंग (TM आवेदन)",
        heroSubtitle: "ब्रांड नाम सुरक्षित करें। 3 दिन में ™, ~6 महीने में ®।",
        timelineLabel: "फाइलिंग के 3 दिन में ™। ® पंजीकरण ~6 महीने।",
        whatYouGet: [
          "ट्रेडमार्क क्लास पहचान",
          "सार्वजनिक खोज और संघर्ष रिपोर्ट",
          "आवेदन प्रारूप और फाइलिंग (TM-A)",
          "सरकारी रसीद",
          "परीक्षा रिपोर्ट उत्तर (1 राउंड)",
        ],
        requirements: [
          "ब्रांड नाम (और लोगो, यदि हो)",
          "वस्तुओं/सेवाओं का विवरण",
          "पहले उपयोग की तिथि",
          "आवेदक विवरण",
          "पावर ऑफ अटॉर्नी",
        ],
        trust: baseTrust.hi,
        faq: [
          { q: "क्या पंजीकरण से पहले ™ उपयोग कर सकते हैं?", a: "हाँ, आवेदन के तुरंत बाद।" },
          { q: "™ और ® में अंतर?", a: "™ = आवेदित; ® = पंजीकृत।" },
          { q: "कितनी क्लास में फाइल करूँ?", a: "एक क्लास शामिल; प्रत्येक अतिरिक्त +₹4,500।" },
          { q: "आपत्ति हो तो?", a: "1 परीक्षा उत्तर निःशुल्क।" },
          { q: "क्या यह हमेशा वैध रहता है?", a: "10 वर्ष; नवीनीकरण योग्य।" },
        ],
      },
    },
  },
  {
    slug: "fssai-registration",
    serviceType: "fssai",
    icon: UtensilsCrossed,
    priceInr: 2499,
    priceInrPaise: 249900,
    timelineDays: 22,
    content: {
      en: {
        cardName: "FSSAI Registration",
        cardDesc: "Food licence — cloud kitchen, packaged food, restaurant.",
        title: "FSSAI Food Licence Registration",
        heroSubtitle: "Your food business licence in 15–30 days.",
        timelineLabel: "15–30 days depending on category (basic / state / central)",
        whatYouGet: [
          "Category assessment (basic / state / central)",
          "Application drafting and submission",
          "Document verification and follow-up",
          "FSSAI licence certificate",
          "Display-ready copy for your premises",
        ],
        requirements: [
          "PAN + Aadhaar of proprietor / authorised signatory",
          "Photo identity and proof of address",
          "Premises address proof (rent / utility bill)",
          "List of food categories handled",
          "Water test report (for higher categories)",
        ],
        trust: baseTrust.en,
        faq: [
          { q: "Which category do I need?", a: "Basic (turnover < ₹12L), State (₹12L–₹20Cr), Central (> ₹20Cr or interstate). We confirm in intake." },
          { q: "Is it really mandatory?", a: "Yes — any food business operator (FBO) in India needs it. Online food platforms reject sellers without FSSAI." },
          { q: "Does it apply to cloud kitchens?", a: "Yes — even home-run cloud kitchens need at least Basic registration." },
          { q: "How long is the licence valid?", a: "1 to 5 years (your choice at application). Renewal at least 30 days before expiry." },
          { q: "Will inspectors visit?", a: "For higher categories (state/central), yes. We prepare you for the inspection." },
        ],
      },
      hi: {
        cardName: "FSSAI पंजीकरण",
        cardDesc: "खाद्य लाइसेंस — क्लाउड किचन, पैकेज्ड फूड, रेस्तरां।",
        title: "FSSAI खाद्य लाइसेंस पंजीकरण",
        heroSubtitle: "15–30 दिनों में आपका खाद्य व्यवसाय लाइसेंस।",
        timelineLabel: "श्रेणी अनुसार 15–30 दिन",
        whatYouGet: [
          "श्रेणी मूल्यांकन",
          "आवेदन प्रारूप और सबमिशन",
          "दस्तावेज़ सत्यापन और फॉलोअप",
          "FSSAI लाइसेंस प्रमाणपत्र",
          "परिसर के लिए डिस्प्ले कॉपी",
        ],
        requirements: [
          "स्वामी का PAN + आधार",
          "फोटो ID और पते का प्रमाण",
          "परिसर के पते का प्रमाण",
          "खाद्य श्रेणियों की सूची",
          "जल परीक्षण रिपोर्ट (उच्च श्रेणी)",
        ],
        trust: baseTrust.hi,
        faq: [
          { q: "कौन-सी श्रेणी?", a: "बेसिक (< ₹12L), स्टेट (₹12L–₹20Cr), सेंट्रल (> ₹20Cr या अंतर्राज्यीय)।" },
          { q: "क्या अनिवार्य है?", a: "हाँ — हर FBO के लिए।" },
          { q: "क्लाउड किचन पर लागू?", a: "हाँ — कम से कम बेसिक।" },
          { q: "लाइसेंस कितने समय के लिए?", a: "1–5 वर्ष; नवीनीकरण समय-सीमा से 30 दिन पहले।" },
          { q: "क्या निरीक्षक आएंगे?", a: "उच्च श्रेणी में हाँ।" },
        ],
      },
    },
  },
  {
    slug: "compliance-subscription",
    serviceType: "compliance_subscription",
    icon: CalendarClock,
    priceInr: 2499,
    priceInrPaise: 249900,
    isSubscription: true,
    billingCycle: "monthly",
    timelineDays: 0,
    content: {
      en: {
        cardName: "Monthly Compliance Subscription",
        cardDesc: "GST + TDS + ROC + reminders. ₹2,499/month. Cancel anytime.",
        title: "Monthly Compliance Subscription",
        heroSubtitle: "Never miss a deadline. We file everything, every month.",
        timelineLabel: "Ongoing — filings before each statutory deadline",
        whatYouGet: [
          "Monthly GSTR-1 + GSTR-3B filing",
          "Quarterly TDS returns",
          "Annual ROC filing (AOC-4 + MGT-7)",
          "Deadline reminders on WhatsApp + email",
          "Dedicated CA + monthly compliance report",
          "Cancel anytime, no lock-in",
        ],
        requirements: [
          "GSTIN of business",
          "Last 3 months of invoices and purchase bills",
          "Bank statements",
          "Existing TDS challans (if any)",
        ],
        trust: [
          "100% online",
          "Indian CA partner",
          "Cancel anytime — no lock-in contract",
        ],
        faq: [
          { q: "What if I don't have GSTIN yet?", a: "Add our one-time GST Registration first. Subscription kicks in from the month after GSTIN is issued." },
          { q: "Is annual audit included?", a: "Filing of audited financials is included. The audit itself is +₹3,500 (annual) by the same CA." },
          { q: "What if I have no transactions in a month?", a: "We still file nil returns. Late nil-filing also attracts penalties — that's the point." },
          { q: "Can I cancel mid-year?", a: "Yes. No lock-in. Last filed month is final; nothing pro-rated back." },
          { q: "Do you handle income tax return?", a: "Personal ITR not included. Business ITR can be added at +₹2,500/year." },
        ],
      },
      hi: {
        cardName: "मासिक अनुपालन सब्सक्रिप्शन",
        cardDesc: "GST + TDS + ROC + रिमाइंडर। ₹2,499/माह।",
        title: "मासिक अनुपालन सब्सक्रिप्शन",
        heroSubtitle: "कोई समय-सीमा न चूकें। हर महीने सब कुछ फाइल।",
        timelineLabel: "निरंतर — हर वैधानिक समय-सीमा से पहले",
        whatYouGet: [
          "मासिक GSTR-1 + GSTR-3B",
          "त्रैमासिक TDS रिटर्न",
          "वार्षिक ROC (AOC-4 + MGT-7)",
          "WhatsApp + ईमेल पर रिमाइंडर",
          "समर्पित CA + मासिक रिपोर्ट",
          "कभी भी रद्द करें",
        ],
        requirements: [
          "व्यवसाय का GSTIN",
          "पिछले 3 महीने के बिल",
          "बैंक स्टेटमेंट",
          "मौजूदा TDS चालान",
        ],
        trust: ["100% ऑनलाइन", "भारतीय CA पार्टनर", "कभी भी रद्द करें — कोई लॉक-इन नहीं"],
        faq: [
          { q: "अगर GSTIN नहीं है?", a: "पहले एक बार का GST पंजीकरण लें।" },
          { q: "क्या वार्षिक ऑडिट शामिल है?", a: "फाइलिंग शामिल; ऑडिट स्वयं +₹3,500।" },
          { q: "कोई लेन-देन न हो तो?", a: "हम निल रिटर्न फाइल करते हैं।" },
          { q: "क्या मध्य-वर्ष रद्द कर सकते हैं?", a: "हाँ। कोई लॉक-इन नहीं।" },
          { q: "इनकम टैक्स रिटर्न?", a: "बिज़नेस ITR +₹2,500/वर्ष।" },
        ],
      },
    },
  },
];

export function getServiceBySlug(slug: string): ServiceDef | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function formatInr(rupees: number): string {
  return "₹" + new Intl.NumberFormat("en-IN").format(rupees);
}

export function estimatedDelivery(days: number, lang: ServiceLang): string {
  if (days === 0) return lang === "hi" ? "तुरंत शुरू" : "Starts immediately";
  const d = new Date();
  d.setDate(d.getDate() + days);
  return new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}
