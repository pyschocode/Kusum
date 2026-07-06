import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import { logEvent } from './logEvent';

type ChatbotProps = {
  language: 'hi' | 'en';
};

type Message = {
  id: number;
  from: 'user' | 'bot';
  text: string;
};

// Helper - case-insensitive substring match across a list of keywords
const matchesAny = (text: string, keywords: string[]) => {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
};

const Chatbot: React.FC<ChatbotProps> = ({ language }) => {
  const isHindi = language === 'hi';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      from: 'bot',
      text: isHindi
        ? 'नमस्ते किसान मित्र! कुसुम योजना के बारे में क्या जानना चाहते हैं?        आप पूछने के लिए वॉयस असिस्टेंट का भी उपयोग कर सकते हैं |!'
        : 'Hello farmer friend! What would you like to know about the KUSUM scheme?       you can use voice assistant also to ask . !',
    },
  ]);

  const [input, setInput] = useState('');
  const [muted, setMuted] = useState(false);
  const [listening, setListening] = useState(false);

  const isInputEmpty = input.trim().length === 0;
  const chatRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any | null>(null); // store active recognition instance (if any)

  useEffect(() => {
    logEvent('page_view', { page: 'chat', language });
  }, [language]);

  // Update browser tab title (optional)
  useEffect(() => {
    document.title = isHindi ? 'कुसुम सारथी' : 'KUSUM Sarthi';
  }, [isHindi]);

  // auto-scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const finalizeMessage = (userMsg: Message, botText: string) => {
    const botMsg: Message = { id: Date.now() + 1, from: 'bot', text: botText };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  // Speech: speak a text (respecting muted flag and language)
  const speak = (text: string) => {
    if (muted) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = isHindi ? 'hi-IN' : 'en-US';
      u.rate = 0.95;
      u.pitch = 1;
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  };

  // single place to process any user text (typed or spoken)
  const processUserText = (rawText: string) => {
    const trimmedRaw = rawText.trim();
    if (!trimmedRaw) return;

    // Normalize for matching
    const normalized = trimmedRaw.replace(/\s+/g, ' ').replace(/[?!.]+$/g, '').trim();
    logEvent('chat_send', { language, textLength: normalized.length });

    const userMsg: Message = { id: Date.now(), from: 'user', text: trimmedRaw };
    let botText = '';
    const lower = normalized.toLowerCase();

      // ---- 5-KM Substation Guidance (Hindi + English) ----
    const substationWordsHi = [
      '5 km',
      '5km',
      '5 किमी',
      '5 किलोमीटर',
      'sub station',
      'sub-station',
      'substation',
      'निकटतम सब',
      'सब स्टेशन कितना दूर ',
      'सब स्टेशन कितनी दूर?',
      'सब स्टेशन',
      'नजदीक सब',
      'सबस्टेशन',
      '5km ke andar',
      '5km radius',
      '5km door',
      '5km se',
    ];

    // ================= KITNA / HOW-MUCH ENGINE (FIRST) =================
    if (isHindi) {
      const agroKitnaKeywords = [
        'एग्रोवोल्ट',
        'agrovoltaic',
        'agrovoltiac',
        'agro voltaic',
        'agrivoltaic',
        'agro',
        'agro solar',
        'agro pv',
        'agripv',
        'solar kheti',
        'panel ke neeche',
        'pannel ke niche',
        'छाया फसल',
        'छाया वाली फसल',
      ];

      const kitnaWords = [
        'kitna',
        'kitni',
        'kitne',
        'कितना',
        'कितनी',
        'कितने',
        'ktna',
        'kna',
        'kitne din',
      ];

      if (matchesAny(normalized, kitnaWords) && matchesAny(normalized, agroKitnaKeywords)) {
        botText =
          'एग्रोवोल्टाइक में सोलर पैनल और खेती साथ-साथ की जाती है। पैनलों के नीचे आमतौर पर छाया सहन करने वाली सब्जियाँ, जड़ी-बूटियाँ या चारा उगाया जा सकता है, यह पैनल की ऊँचाई और पानी की उपलब्धता पर निर्भर करता है।';
        finalizeMessage(userMsg, botText);
        speak(botText);
        return;
      }

      if (matchesAny(normalized, kitnaWords)) {
        const roiNext = [
          'saal',
          'sal',
          'year',
          'साल',
          'वापस',
          'वापसी',
          'payback',
          'return',
          'din',
          'दिन',
          'day',
          'days',
          'mahina',
          'महीना',
          'month',
          'months',
          'hafta',
          'हफ्ता',
          'week',
          'weeks',
        ];
        const costNext = ['paisa', 'paise', 'खर्च', 'खर्चा', 'kharcha', 'cost', 'लगेगा', 'लागत', 'price', 'kharc'];
        const sunNext = [
          'dhoop',
          'dhup',
          'sun',
          'sunlight',
          'psh',
          'peak sun',
          'धूप',
          'dhup chahiye',
          'dhoop chahiye',
          'kitni dhoop',
          'kitni dhup',
        ];
        const landNext = [
          'zameen',
          'zamin',
          'land',
          'acre',
          'एकड़',
          'एकड़',
          'जमीन',
          'khet',
          'minimum land',
          'कितनी जमीन',
          'कितनी भूमि',
          'minimum area',
          'min land',
          'जमीन चाहिए',
          'जमीन की आवश्यकता',
          'land required',
          'land needed',
          'कितनी जमीन चाहिए',
          'कितनी जमीन की आवश्यकता',
        ];
        const hourNext = ['ghante', 'ghnta', 'hour', 'hours', 'घंटे', 'bijli', 'कितने घंटे बिजली', 'कितनी देर बिजली', 'कितनी बिजली'];

        // --- EMI inside Hindi KITNA engine (for "kitni EMI", etc.) ---
        const emiHintHi = [
          'emi',
          'ईएमआई',
          'इएमआई',
          'ई एम आई',
          'इ एम आई',
          'ई.एम.आई',
          'इ.एम.आई',
          'ई एमआइ',
          'इ एमआइ',
          'loan',
          'लोन',
          'bank loan',
          'bank se loan',
          'बैंक लोन',
          'बैंक से लोन',
          'bank loan milega',
          'बैंक लोन मिलेगा',
          'bank se paise',
          'बैंक से पैसे',
        ];
        if (matchesAny(lower, emiHintHi)) {
          botText =
            'सब्सिडी के बाद कई मॉडलों में लगभग 5% की रियायती ब्याज पर बैंक लोन मिलता है।\n' +
            'छोटे सिस्टम के लिए EMI आम तौर पर लगभग ₹2–3 हज़ार प्रति माह हो सकती है (राज्य और बैंक के अनुसार बदल सकती है)।\n' +
            'आमतौर पर लोन स्वीकृति में लगभग 7–10 दिन लगते हैं।';
          finalizeMessage(userMsg, botText);
          speak(botText);
          return; // ✅ stop here so it doesn't fall through
        }
        // -------------------------------------------------------------

        if (matchesAny(normalized, roiNext)) {
          botText =
            'निवेश पर वापसी (पेबैक) सिस्टम की लागत, सब्सिडी और ऊर्जा बचत पर निर्भर करती है। छोटे सोलर पंप सिस्टम के लिए पैबैक आमतौर पर लगभग 4–8 साल के बीच माना जाता है।';
        } else if (matchesAny(normalized, sunNext)) {
          botText =
            'सोलर उत्पादन “पीक सन-घंटों” पर निर्भर करता है। कई जगहों पर आम तौर पर लगभग 4–6 पीक सन घंटे/दिन माने जाते हैं; जितने ज़्यादा पीक सन घंटे, उतनी ज़्यादा बिजली और पंप चलने का समय।';
        } else if (matchesAny(normalized, costNext)) {
          botText =
            'कई राज्यों में लगभग 60% सब्सिडी, लगभग 30% बैंक लोन और करीब 10% किसान अंशदान होता है। कुसुम योजना में सहायता के बाद रूफटॉप सोलर फोटोवोल्टिक सिस्टम लगवाने में लगभग ₹42,000 से ₹49,000 तक का खर्च किसान को करना पड़ सकता है | कुछ राज्यों में PM-KUSUM के तहत फीडर सोलराइजेशन के लिए लगभग 1.5 करोड़ प्रति मेगावाट की सहायता मिलती है  :– लगभग 1.05 करोड़ केंद्र सरकार और करीब 45 लाख राज्य सरकार से। (राज्य व क्षमता के अनुसार राशि बदल सकती है)।';
        } else if (matchesAny(normalized, landNext)) {
          botText =
            'आमतौर पर 1 मेगावाट सौर क्षमता के लिए करीब 4–5 एकड़ ( या 7.251 बीघा/145 कट्ठा) जमीन की आवश्यकता मानी जाती है। यह आंकड़ा प्रोजेक्ट डिजाइन और स्थान के हिसाब से थोड़ा बदल सकता है। ';
        } else if (matchesAny(normalized, hourNext)) {
          botText =
            'योजना का उद्देश्य है कि कृषि पंपों को दिन के समय कम से कम लगभग 7 घंटे तक भरोसेमंद बिजली मिले, ताकि किसान आराम से सिंचाई कर सकें और बार-बार कटौती का डर कम हो।';
        } else {
          botText =
            'आप किस बारे में पूछ रहे हैं — लागत (कितना पैसा), धूप घंटे (कितनी धूप), जमीन (कितनी जमीन), पेबैक (कितने साल), या पंप घंटे (कितने घंटे बिजली)?';
        }

        finalizeMessage(userMsg, botText);
        speak(botText);
        return;
      }
    } else {
      const agroKitnaKeywords = [
        'agrovoltaic',
        'agrovoltiac',
        'agrivoltaic',
        'agro voltaic',
        'agro voltaics',
        'agro',
        'agro solar',
        'agro pv',
        'agri pv',
        'solar farming',
        'crop under panel',
        'shade crop',
      ];

      const howWords = [
        'how much',
        'how many',
        'kitna',
        'kitni',
        'kitne',
        'how long',
        'what is the minimum',
        'minimum land',
        'land required',
        'land needed',
      ];

      if (matchesAny(normalized, howWords) && matchesAny(normalized, agroKitnaKeywords)) {
        botText =
          'Agrovoltaics (PV + farming) means using the same land for solar panels and crops. Shade-tolerant crops or fodder can be grown under the panels depending on panel height, spacing and water availability.';
        finalizeMessage(userMsg, botText);
        speak(botText);
        return;
      }

      if (matchesAny(normalized, howWords)) {
        const roiNext = ['years', 'year', 'payback', 'return', 'roi', 'days', 'day', 'months', 'month', 'weeks', 'week'];
        const costNext = ['money', 'cost', 'pay', 'amount', 'price'];
        const sunNext = ['sun', 'sunlight', 'sun hours', 'psh', 'insolation'];
        const landNext = [
          'land',
          'acre',
          'how much land',
          'land requirement',
          'minimum land',
          'land required',
          'land needed',
          'minimum area',
          'area required',
          'min land',
          'min area',
        ];
        const hourNext = ['hours', 'power'];

        // --- EMI inside English how-much engine ("emi how much") ---
        const emiHintEn = ['emi', 'emi amount', 'emi how much', 'loan', 'bank loan'];
        if (matchesAny(lower, emiHintEn)) {
          botText =
            'After subsidy, loans are often available at concessional rates (around 5% in many models).\n' +
            'Typical EMIs for small systems can be in the range of about ₹2–3k per month, but this varies by bank and state.\n' +
            'Loan approval often takes around 7–10 days.';
          finalizeMessage(userMsg, botText);
          speak(botText);
          return; // ✅ stop here
        }
        // ---------------------------------------------------------

        if (matchesAny(normalized, roiNext)) {
          botText =
            'Payback / ROI depends on system cost, subsidy and energy savings. For small solar pump systems, payback is often in the range of about 4–8 years, but it varies by site and tariffs.';
        } else if (matchesAny(normalized, sunNext)) {
          botText =
            'Solar output depends on peak sun hours (PSH). Many locations see roughly 4–6 PSH per day; more peak sun hours mean more energy and longer pump runtime.';
        } else if (matchesAny(normalized, costNext)) {
          botText =
            'In many cases you see around 60% subsidy, about 30% bank loan and roughly 10% farmer contribution.Installing a rooftop solar photovoltaic system under the KUSUM Scheme can cost a farmer around ₹42,000 to ₹49,000. Some states give about ₹1.5 crore per MW support for feeder solarisation under PM-KUSUM : - around ₹1.05 crore from central government and about ₹45 lakh from state government ( the final amount paid by the farmer depends on state and system size.)';
        } else if (matchesAny(normalized, landNext)) {
          botText =
            'For about 1 megawatt of solar capacity, roughly 4–5 acres ( Or 7.251 bigha / 145 Kattha) of land are typically required, though the exact figure can vary with design and site conditions. ';
        } else if (matchesAny(normalized, hourNext)) {
          botText =
            'One of the key objectives is to provide at least around 7 hours of reliable daytime power for irrigation pumps, so farmers can irrigate without frequent cuts.';
        } else {
          botText = 'What do you want to ask — cost, sunlight, land, payback, or pump hours?';
        }

        finalizeMessage(userMsg, botText);
        speak(botText);
        return;
      }
    }

  

    const substationWordsEn = [
      '5 km',
      '5km',
      '5 kilometer',
      'five km',
      'sub station',
      'sub-station',
      'substation',
      'nearest sub',
      '5km radius',
      'within 5km',
      'distance from substation',
    ];

    if (
      (isHindi && matchesAny(normalized, substationWordsHi)) ||
      (!isHindi && matchesAny(normalized, substationWordsEn))
    ) {
      botText = isHindi
        ? 'कुसुम योजना के तहत **सबस्टेशन 5 किमी के दायरे** में होना चाहिए।\n\n' +
          '✔ यदि आपका सबस्टेशन **5 किमी से दूर** है:\n' +
          '  • ग्रिड कनेक्शन की **लागत बढ़ सकती है**\n' +
          '  • वेंडर/एजेंसी को **अतिरिक्त सर्वे** करना पड़ेगा\n' +
          '  • कुछ मामलों में **वैकल्पिक समाधान** संभव है\n\n' +
          '✔ समाधान:\n' +
          '  1. Google Maps से **नजदीकी सबस्टेशन चेक करें**\n' +
          '  2. स्थानीय DISCOM से **दूरी की पुष्टि करें**\n' +
          '  3. आवेदन से पहले **साइट सर्वे** कराएं'
        : 'PM-KUSUM requires the proposed site to be **within 5 km radius of the nearest substation**.\n\n' +
          '✔ If your substation is **more than 5 km away**:\n' +
          '  • Grid connection **cost increases**\n' +
          '  • Vendor/agency will need **additional survey**\n' +
          '  • **Alternative arrangements** may be possible\n\n' +
          '✔ Solutions:\n' +
          '  1. Check **nearest substation** using Google Maps\n' +
          '  2. Confirm the distance with your **local DISCOM**\n' +
          '  3. Get a **site survey** before applying';

      finalizeMessage(userMsg, botText);
      speak(botText);
      return;
    }

    // ================ REST OF INTENTS (small-farmer BEFORE benefits) ================
    if (isHindi) {
      const agroTextKeywords = [
        'एग्रोवोल्ट',
        'agrovoltaic',
        'agrovoltiac',
        'agro voltaic',
        'agrivoltaic',
        'agro',
        'agro solar',
        'agro pv',
        'agripv',
        'solar kheti',
        'panel ke neeche',
        'pannel ke niche',
        'छाया फसल',
        'पैनल के नीचे',
      ];

      const intensityTextKeywords = [
        'धूप कितनी',
        'धूप घंटे',
        'dhoop kitni',
        'kitni dhup',
        'kitni dhoop',
        'kitna dhup',
        'sun hour',
        'sun hours',
        'psh',
        'peak sun',
        'kitni dhoop chahiye',
        'kitni dhup chahiye',
      ];

      const roiTextKeywords = [
        'पेबैक',
        'payback',
        'कितने साल में पैसा वापस',
        'निवेश वापसी',
        'nivesh vapsi',
        'kitne saal',
        'return on investment',
        'roi',
      ];

      const documentWords = [
        'दस्तावेज',
        'डॉक्यू',
        'कागज',
        'कागज़',
        'kaagaz',
        'kagaz',
        'kagaj',
        'document',
        'dastavej',
        'dastawej',
        'documents',
        'requirements',
        'paper',
        'papers',
        'doc',
        'pan card',
        'पैन कार्ड',
        'digital signature',
        'डिजिटल सिग्नेचर',
        'dsc',
        'e sign',
        'ई-साइन',
        'email',
        'ईमेल',
        'telephone',
        'फोन नंबर',
        'mobile number',
        'emudhra',
        'emudhra.com',
      ];

      const smallFarmerWords = [
        'छोटे किसान',
        'chhote kisan',
        'chhote kisaan',
        'chote kisan',
        'chote kisaan',
        'small farmer',
        'small farmers',
        'small land',
        'little land',
        'smallholder',
        'small holder',
        'कम जमीन',
        'kam zameen',
        'little zameen',
        'group apply',
        'samuh',
        'community',
        'milkar apply',
        'fpo apply',
        'chhote kisan v',
        'chhote kisaan v',
        'kya chhote kisan',
        'kya chhote kisaan',
        'chhote kisan bhi',
      ];

      const benefitWords = ['लाभ', 'फायदा', 'फायदे', 'faida', 'fayde', 'laabh', 'labh', 'benefit', 'profit'];
      const eligibilityWords = ['पात्रता', 'कौन', 'eligible', 'eligibility', 'apply', 'कौन apply', 'kon kon', 'kon kon apply'];
      const subsidyWords = ['सब्सिडी', 'subsidy', 'kitna dena', 'paisa', 'payment', 'cost', 'kharcha','पैसा'];
      const maintenanceWords = ['रखरखाव', 'साफ़ सफाई', 'साफ सफाई', 'maintenance', 'rakh rakhav', 'cleaning', 'saaf safai', 'solar kitne saal chalega'];
      const landWords = [
        'कितनी जमीन',
        'जमीन',
        'भूमि',
        'acre',
        'एकड़',
        '1 मेगावाट',
        '1mw',
        '1 mw',
        'कितनी जमीन चाहिए',
        'जमीन चाहिए',
        'जमीन की आवश्यकता',
        'minimum land',
        'न्यूनतम जमीन',
        'मिनिमम एरिया',
        'कितनी भूमि',
      ];
      const feederWords = ['फीडर', 'फीडर स्तर', 'feeder level', 'solarisation', 'solarization'];
      const hoursWords = ['घंटे', 'ghnte', 'ghante', 'bijli', 'kitni der bijli', '7 घंटे', 'बिजली कब', 'कितनी देर बिजली', 'kitne ghante'];
      const implementationWords = ['कौन चलाता', 'kon chalata', 'konsi agency', 'क्रियान्वयन', 'mnre', 'कौन सी एजेंसी', 'agency'];
      const workingWords = ['कैसे काम', 'किस तरह काम', 'काम करती', 'kaise kaam', 'kis tarah kaam', 'kaam', 'working', 'work how' ,'कम्पोनेंट सी','कंपोनेंट सी','कुसुम सी','पीएम कुसुम सी','pm kusum c','component c', 'pm kusum yojna',' yojna','पीएम कुसुम योजना।',];

      // NEW: farming / crop impact keywords (Hindi + texting)
      const farmingEffectWords = [
        'kheti par kya asar',
        'kheti pe kya asar prega',
        'kheti par asar',
        'fasal par asar',
        'fasal par kya asar',
        'solar lagane se kheti',
        'solar lagane se fasal',
        'solar lagane par kheti',
        'panel ke niche fasal',
        'panel ke neeche fasal',
        'kya kheti band',
        'kheti band ho jayegi',
        'कृषि पर असर',
        'खेती पर असर',
        'खेती पर क्या असर',
        'फसल पर असर',
        'फसल पर क्या असर',
        'सोलर लगाने से खेती',
        'सोलर लगाने से फसल',
        'क्या खेती बंद',
      ];

      // NEW: Do's & Don'ts / safety / precautions keywords (Hindi + texting)
      const dosDontWords = [
        "do and don't",
        'dos and donts',
        "dos and don'ts",
        'kya dhyan rakhe',
        'kya dhyaan rakhe',
        'kya dhyan rakhna',
        'kya savdhani',
        'kya savdhaani',
        'guideline',
        'guidelines',
        'safety',
        'suraksha',
        'सुरक्षा',
        'सावधानी',
        'क्या ध्यान रखें',
        'क्या-क्या ध्यान रखें',
        'क्या सावधानी',
        'क्या-क्या सावधानी',
        'क्या करें और क्या न करें',
        'क्या करे और क्या न करे',
        "do aur don't",
      ];
            // NEW: time from installation to generation (Hindi + texting)
      const installTimeWords = [
        'installation se generation',
        'install se generation',
        'lagne me time',
        'lagne me samay',
        'kitna time lagega',
        'kitna samay lagega',
        'kitne din me chalu',
        'kitne din me start',
        'kab se bijli milegi',
        'kab se power milegi',
        'kitne din me generation',
        'install hone me ',
  
        'स्थापना से बिजली',
        'स्थापना से उत्पादन',
  
        'कब से चलना शुरू',
        'कब से जनरेशन',
      ];

      // NEW: tender / charges / EMD keywords (Hindi + texting)
      const tenderWords = [
        'tender',
        'टेंडर',
        'tender charge',
        'tender charges',
        'tender fee',
        'tender fees',


    
        'bidding charge',
        'bid charge',
        'bidding fee',
        'emd',
        'earnest money',
        'earnest money deposit',
        'emd amount',
        'जमानत राशि',
        'ईएमडी',
        'टेंडर फीस',
        'टेंडर शुल्क',
      ];

      // loan / EMI queries (without kitna)
      const loanWords = [
        'bank loan milega',
        'emi kitni',
        'emi kitna',
        'bank paise dega',
        'bank se loan',
        'loan kab milega',
        'bank mana karega',
        'har mahine kitna',
        'loan kaise milega',
        'kitni emi deni',
        'kitni EMI deni',
        'emi',
        'ईएमआइ',
        'bank loan',
        'बैंक लोन',
        'loan',
        'लोन',
        'कितना ईएमआइ',
        'कितनी ईएमआइ',
      ];

      const smallFarmerDetected =
        matchesAny(normalized, smallFarmerWords) ||
        (lower.includes('chhote') && (lower.includes('kisan') || lower.includes('kisaan'))) ||
        (lower.includes('chote') && (lower.includes('kisan') || lower.includes('kisaan')));

      if (smallFarmerDetected) {
        botText =
          'קुसुम योजना सिर्फ बड़े किसानों के लिए नहीं है। छोटे किसान भी आवेदन कर सकते हैं। \n\n' +
          '✔ अगर जमीन कम है तो किसान **समूह (FPO, सहकारी समिति, पंचायत समूह)** बनाकर 1 मेगावाट प्लांट के लिए सामूहिक रूप से आवेदन कर सकते हैं। \n' +
          '✔ व्यक्तिगत किसान अपनी आवश्यकता के अनुसार **1HP–10HP सोलर पंप** के लिए भी आवेदन कर सकते हैं— इसमें अधिक जमीन की आवश्यकता नहीं होती। \n\n' +
          'इसलिए छोटे किसान सीधे, या समूह बनाकर, दोनों तरीकों से योजना का लाभ ले सकते हैं।';
        finalizeMessage(userMsg, botText);
        speak(botText);
        return;
      }

      if (matchesAny(normalized, documentWords)) {
        botText =
          'आवेदन के लिए आमतौर पर निम्न दस्तावेज़ों की जरूरत होती है:\n\n' +
          '✔ आधार कार्ड\n' +
          '✔ बैंक पासबुक\n' +
          '✔ भूमि के कागज़ (खसरा/खतौनी/रजिस्ट्री)\n' +
          '✔ बिजली कनेक्शन/बिल की कॉपी\n' +
          '✔ पैन कार्ड\n' +
          '✔ मोबाइल नंबर / टेलीफोन नंबर\n' +
          '✔ ईमेल आईडी\n' +
          '✔ डिजिटल सिग्नेचर (DSC) — eMudhra जैसी सेवाओं से बनवाया जा सकता है\n\n' +
          'ध्यान दें: कुछ राज्यों में अतिरिक्त दस्तावेज़ या सत्यापन की आवश्यकता हो सकती है।';
        finalizeMessage(userMsg, botText);
        speak(botText);
        return;
      }

      if (matchesAny(normalized, agroTextKeywords)) {
        // NEW: richer agrovoltaics / farming effect reply (Hindi)
        botText =
          'एग्रोवोल्टाइक में सोलर पैनल और खेती साथ-साथ की जाती है। पैनलों के नीचे आमतौर पर छाया सहन करने वाली सब्जियाँ, जड़ी-बूटियाँ या चारा उगाया जा सकता है, यह पैनल की ऊँचाई और पानी की उपलब्धता पर निर्भर करता है।';
        finalizeMessage(userMsg, botText);
        speak(botText);
        return;
      }

      if (matchesAny(normalized, intensityTextKeywords)) {
        botText =
          'सोलर उत्पादन “पीक सन-घंटों” पर निर्भर करता है। कई जगहों पर आम तौर पर लगभग 4–6 पीक सन घंटे/दिन माने जाते हैं; जितने ज़्यादा पीक सन घंटे, उतनी ज़्यादा बिजली और पंप चलने का समय।';
      } else if (matchesAny(normalized, roiTextKeywords)) {
        botText =
          'निवेश पर वापसी (पेबैक) सिस्टम की लागत, सब्सिडी और ऊर्जा बचत पर निर्भर करती है। छोटे सोलर पंप सिस्टम के लिए पैबैक आमतौर पर लगभग 4–8 साल के बीच माना जाता है।';
      } else if (matchesAny(normalized, installTimeWords)) { // NEW: install → generation
        botText =
          'स्थापना से बिजली उत्पादन शुरू होने तक का सामान्य समय लगभग इस प्रकार हो सकता है:\n\n' +
          '• साइट सर्वे और वेंडर आवंटन: 7–15 दिन\n' +
          '• इंस्टॉलेशन: 15–25 दिन\n' +
          '• परीक्षण और अनुमोदन: 5–7 दिन\n\n' +
          'कुल मिलाकर आम तौर पर लगभग 1–2 महीने लग सकते हैं (राज्य, वेंडर और साइट की स्थिति पर निर्भर).';
      } else if (matchesAny(normalized, benefitWords)) {
        botText =
          'कुसुम योजना से आपको सस्ती बिजली, डीज़ल की बचत और अतिरिक्त आमदनी (सोलर से बेची गई बिजली) मिल सकती है। किसानों की आय में वृद्धि, ऊर्जा लागत में कमी और पर्यावरण प्रदूषण भी घटता है।';
      }else if (matchesAny(normalized, eligibilityWords)) {
  botText =
    'आमतौर पर सभी किसान (व्यक्ति या समूह), सहकारी समितियाँ, पंचायतें और किसान उत्पादक संगठन कुसुम योजना में शामिल हो सकते हैं। अंतिम नियम राज्य की गाइडलाइन पर निर्भर करते हैं। ' +
    'किसान अपनी आवश्यकता के अनुसार 1 एचपी से 10 एचपी तक के सोलर वाटर पंप के लिए ऑनलाइन आवेदन कर सकते हैं, ' +
    'और जिन किसानों के पास खुद की जमीन है या पट्टे पर जमीन है, वे भी आवेदन कर सकते हैं।\n\n' +
    ' आवेदन प्रक्रिया में कई राज्यों में **डिजिटल सिग्नेचर (DSC)** की आवश्यकता होती है, ' +
    'जो **eMudhra** जैसी अधिकृत वेबसाइट से बनवाया जा सकता है:\n' +
    'https://www.emudhra.com';
}
 else if (matchesAny(normalized, subsidyWords)) {
        botText =
          'कई राज्यों में लगभग 60% सब्सिडी, लगभग 30% बैंक लोन और करीब 10% किसान अंशदान होता है। कुछ राज्यों में PM-KUSUM के तहत फीडर सोलराइजेशन के लिए लगभग 1.5 करोड़ प्रति मेगावाट की सहायता मिलती है  :– लगभग 1.05 करोड़ केंद्र सरकार और करीब 45 लाख राज्य सरकार से। वास्तविक राशि आपके राज्य की  नीति और टेंडर पर निर्भर करती है।';
      } else if (matchesAny(normalized, tenderWords)) { // NEW: tender / charges
        botText =
          'टेंडर या शुल्क (संकेतात्मक उदाहरण):\n\n' +
          '• रेफरेंस डॉक्यूमेंट चार्ज: लगभग ₹590\n' +
          '• बिडिंग या भागीदारी शुल्क: लगभग ₹23,600\n' +
          '• EMD (Earnest Money Deposit) या जमानत राशि: लगभग ₹1,00,000\n\n' +
          'वास्तविक राशि राज्य, DISCOM और विशेष टेंडर दस्तावेज़ पर निर्भर करती है, इसलिए हमेशा नवीनतम आधिकारिक टेंडर नोटिस देखें।';
      } else if (matchesAny(normalized, maintenanceWords)) {
        botText =
          'सोलर पैनल आम तौर पर 20–25 साल तक चल सकते हैं, और इनका रखरखाव बहुत कम होता है। बस समय-समय पर सफाई और हल्की जाँच करते रहना होता है।';
      } else if (matchesAny(normalized, landWords)) {
        botText =
          'आमतौर पर 1 मेगावाट सौर क्षमता के लिए करीब 4–5 एकड़ जमीन की आवश्यकता मानी जाती है। यह आंकड़ा प्रोजेक्ट डिजाइन और स्थान के हिसाब से थोड़ा बदल सकता है।';
      } else if (matchesAny(normalized, feederWords)) {
        botText =
          'फीडर स्तर सौरिकीकरण में कृषि फीडर के पास एक बड़ा सोलर प्लांट लगाया जाता है, जो पूरे फीडर को दिन में सौर बिजली देता है। दूसरा तरीका यह है कि हर किसान के पंप पर अलग-अलग सोलर सिस्टम लगाया जाए, जिससे वह अपनी सिंचाई खुद की सौर बिजली से कर सके।';
      } else if (matchesAny(normalized, hoursWords)) {
        botText =
          'योजना का उद्देश्य है कि कृषि पंपों को दिन के समय कम से कम लगभग 7 घंटे तक भरोसेमंद बिजली मिले, ताकि किसान आराम से सिंचाई कर सकें और बार-बार कटौती का डर कम हो।';
      } else if (matchesAny(normalized, implementationWords)) {
        botText =
          'पीएम-कुसुम योजना नवीन और नवीकरणीय ऊर्जा मंत्रालय (MNRE) द्वारा चलाई जाती है। इसके क्रियान्वयन में राज्य की एजेंसियाँ और बिजली वितरण कंपनियाँ (DISCOM) मिलकर काम करती हैं।';
      } else if (matchesAny(normalized, workingWords)) {
        botText =
          'PM-KUSUM का Component-C मुख्य रूप से ग्रिड-कनेक्टेड कृषि पंपों को सौर ऊर्जा से चलाने  के लिए है | इस योजना में किसानों के ग्रिड-कनेक्टेड पंपों पर सोलर सिस्टम लगाए जाते हैं। इससे पंप चलाने के लिए खुद की सौर बिजली बनती है, ग्रिड पर निर्भरता और बिल दोनों कम होते हैं और स्वच्छ ऊर्जा उत्पादन बढ़ता है और अतिरिक्त बिजली ग्रिड को बेचकर कमाई भी कर सकते हैं,।';
      } else if (matchesAny(normalized, farmingEffectWords)) {
        // NEW: explicit farming effect question (Hindi)
        botText =
          'सोलर लगने से खेती बंद नहीं होती, बल्कि सही डिज़ाइन पर दोनों साथ-साथ चल सकते हैं:\n\n' +
          ' फायदे:\n' +
          '• पैनल की छाया से कुछ फसलें तेज़ गर्मी और लू से बच जाती हैं।\n' +
          '• मिट्टी की नमी कुछ समय तक बनी रह सकती है, जिससे सिंचाई की जरूरत थोड़ा कम हो सकती है।\n' +
          '• चारा, सब्ज़ियाँ, और कुछ दालें जैसी छाया सहन करने वाली फसलें पैनल के नीचे अच्छी चल सकती हैं।\n\n' +
          ' ध्यान रखने वाली बातें:\n' +
          '• जो फसलें पूरी धूप मांगती हैं, उन्हें पैनल के नीचे लगाने से उत्पादन कम हो सकता है।\n' +
          '• ट्रैक्टर और मशीनरी के लिए पैनलों की ऊँचाई और लाइन के बीच दूरी सही रखना जरूरी है।\n' +
          '• अक्सर ड्रिप सिंचाई या पाइप लाइन बेहतर रहती है, ताकि पानी से इलेक्ट्रिकल पार्ट्स गीले न हों।\n\n' +
          'सही फसल-चयन और लेआउट से किसान बिजली और फसल दोनों का फायदा ले सकते हैं।';
      } else if (matchesAny(normalized, dosDontWords)) {
        // NEW: Do's & Don'ts reply (Hindi)
        botText =
          ' क्या करें (DOs):\n' +
          '• पैनलों के बीच पर्याप्त रास्ता रखें, ताकि किसान और ट्रैक्टर/बैलगाड़ी आसानी से आ-जा सकें।\n' +
          '• पैनल और तारों की नियमित सफाई और जांच कराते रहें।\n' +
          '• सभी कनेक्शन और वायरिंग हमेशा क्वालिफाइड इलेक्ट्रीशियन से ही कराएँ।\n' +
          '• पैनलों के नीचे नीची या मध्यम ऊँचाई वाली फसलें चुनें, जो छाया सहन कर सकें।\n' +
          '• तेज़ आंधी, ओलावृष्टि या भारी बरसात के बाद स्ट्रक्चर और फाउंडेशन की जांच करें।\n\n' +
          " क्या न करें (DON'Ts):\n" +
          '• बहुत ऊँचे पेड़ या फसल पैनलों के बिलकुल पास न लगाएँ, जिससे छाया और पत्तों की गंदगी बढ़े।\n' +
          '• पैनलों के नीचे या पास में खुले तार या ढीले कनेक्शन न छोड़ें।\n' +
          '• स्ट्रक्चर पर अनावश्यक अतिरिक्त वजन (अन्य सामान, अस्थायी छत आदि) न रखें।\n' +
          '• बिना सुरक्षा के खुद से इलेक्ट्रिकल पैनल खोलने की कोशिश न करें।\n\n' +
          'इन बातों का ध्यान रखकर आप सिस्टम की उम्र बढ़ा सकते हैं, खेती सुरक्षित रख सकते हैं और खराबी की संभावना कम कर सकते हैं।';
      } else if (matchesAny(normalized, loanWords)) {
        botText =
          'सब्सिडी के बाद लोन लगभग 5% ब्याज पर मिलता है। EMI लगभग ₹2–3 हज़ार/माह हो सकती है और आमतौर पर 7–10 दिनों में स्वीकृति मिल जाती है (राज्य व बैंक के अनुसार बदल सकता है)।';
      } else {
        botText =
          'आप लाभ, पात्रता, दस्तावेज़, सब्सिडी, रखरखाव, 1 मेगावाट के लिए जमीन, फीडर स्तर सौरिकीकरण, सोलर खेती, धूप घंटे, पेबैक या योजना कैसे काम करती है – इन सब के बारे में पूछ सकते हैं।';
      }
    } else {
      // ENGLISH branch (rest)
      const agroTextKeywords = [
        'agrovoltaic',
        'agrovoltiac',
        'agrivoltaic',
        'agro voltaic',
        'agro voltaics',
        'agri pv',
        'agro pv',
        'agro solar',
        'solar farming',
        'crop under panel',
        'under panel crop',
        'shade crop',
      ];

      const intensityTextKeywords = [
        'sun hours',
        'sun hour',
        'peak sun',
        'peak-sun',
        'psh',
        'solar radiation',
        'insolation',
        'how much sun',
        'how many sun hours',
      ];

      const roiTextKeywords = [
        'payback',
        'payback period',
        'roi',
        'return on investment',
        'how long to recover',
        'how many years to recover',
        'how many days',
        'days to recover',
      ];

      const documentWords = [
        'document',
        'documents',
        'paper',
        'papers',
        'doc',
        'pan card',
        'digital signature',
        'dsc',
        'e sign',
        'email',
        'telephone',
        'mobile number',
        'emudhra',
        'emudhra.com',
      ];

      const smallFarmerWords = [
        'small farmer',
        'small farmers',
        'small land',
        'little land',
        'smallholder',
        'small holder',
        'group apply',
        'community apply',
        'can small farmers apply',
        'is it not for small farmers',
        'fpo apply',
        'farmer group',
      ];

      const benefitWords = ['benefit', 'benefits', 'profit', 'advantage'];
      const eligibilityWords = ['eligible', 'eligibility', 'who can apply', 'who is eligible', 'who all can apply'];
      const subsidyWords = ['subsidy', 'grant', 'how much pay', 'farmer share', 'cost', 'payment'];
      const maintenanceWords = ['maintenance', 'cleaning', 'lifetime of solar panel', 'service requirements'];
      const landWords = [
        'how much land',
        'land requirement',
        '1 mw',
        '1mw',
        '1 megawatt',
        'acre',
        'acres',
        'land required',
        'land needed',
        'minimum land',
        'minimum area',
        'area required',
        'min land',
        'min area',
      ];
      const feederWords = ['feeder level', 'feeder solarisation', 'feeder solarization', 'solarisation of feeder', 'individual pump', 'pump solarisation', 'pump solarization'];
      const hoursWords = ['hours', '7 hours', 'daytime power', 'how many hours power'];
      const implementationWords = ['who implements', 'implementation', 'mnre', 'which agency'];
      const workingWords = ['how it works', 'working', 'work how', 'scheme work', 'component c','kusum c','pm kusum c','pm-kusum c','component-c', 'pm kusum yojna','PM-KUSUM scheme', 'PM KUSUM','PM KUSUM scheme'];
  
      
      // NEW: farming / crop impact keywords (English + light texting)
      const farmingEffectWords = [
        'farming effect',
        'affect farming',
        'impact on farming',
        'impact on crops',
        'crop impact',
        'will crops be affected',
        'will crop be affected',
        'effect on crop',
        'farming under panels',
        'farming under solar',
        'effect on yield',
        'yield effect',
        'does it reduce yield',
        'will yield reduce',
      ];

      // NEW: Do's & Don'ts / safety / precautions keywords (English)
      const dosDontWords = [
        'dos and donts',
        "dos and don'ts",
        'do and dont',
        "do and don't",
        "do's and don'ts",
        'what should i be careful',
        'what should we be careful',
        'what to be careful',
        'precautions',
        'precaution',
        'safety tips',
        'safety guideline',
        'safety guidelines',
      ];
            // NEW: time from installation to generation (English)
      const installTimeWords = [
        'time from installation',
        'time from install',
        'installation to generation',
        'from installation to generation',
        'till generation',
        'when will generation start',
        'generation',
        'time to start generation',
      ];

      // NEW: tender / charges / EMD keywords (English)
      const tenderWords = [
        'tender',
        'tender charges',
        'tender charge',
        'tender fee',
        'tender fees',
        'document fee',
        'document charge',
        'reference document charge',
        'bidding charge',
        'bid charge',
        'bidder charge',
        'bidding fee',
        'emd',
        'earnest money',
        'earnest money deposit',
        'emd amount',
      ];

      const loanWords = [
        'bank loan get',
        'emi how much',
        'emi',
        'emi amount',
        'bank give money',
        'bank loan',
        'loan when',
        'bank refuse',
      ];

      if (matchesAny(normalized, smallFarmerWords) || (lower.includes('small') && lower.includes('farmer'))) {
        botText =
          'KUSUM is not only for large farmers. Small farmers can apply as well.\n\n' +
          '✔ If land area is small, farmers can apply as a group (FPO, cooperatives, panchayat groups) for a 1 MW project.\n' +
          '✔ Small individual farmers can also apply for 1HP–10HP solar pumps, which require little land.\n\n' +
          'So small farmers can benefit individually or through a community model.';
        finalizeMessage(userMsg, botText);
        speak(botText);
        return;
      }

      if (matchesAny(normalized, documentWords)) {
        botText =
          'Documents usually required for PM-KUSUM include:\n\n' +
          ' Aadhaar card\n' +
          'Bank passbook\n' +
          'Land records (khasra/khatauni/registry)\n' +
          'Electricity bill / connection details\n' +
          'PAN card\n' +
          'Mobile number / telephone number\n' +
          'Email ID\n' +
          'Digital Signature Certificate (DSC) — can be obtained via services like eMudhra\n\n' +
          'Some states may ask for additional documents.';
        finalizeMessage(userMsg, botText);
        speak(botText);
        return;
      }

      if (matchesAny(normalized, agroTextKeywords)) {
        // NEW: richer agrovoltaics / farming effect reply (English)
        botText =
          'Agrovoltaics (PV + farming) means using the same land for solar panels and crops. Shade-tolerant crops or fodder can be grown under the panels depending on panel height, spacing and water availability.';
        finalizeMessage(userMsg, botText);
        speak(botText);
        return;
      }

      if (matchesAny(normalized, intensityTextKeywords)) {
        botText =
          'Solar output depends on peak sun hours (PSH). Many locations see roughly 4–6 PSH per day; more peak sun hours mean more energy and longer pump runtime.';
      } else if (matchesAny(normalized, roiTextKeywords)) {
        botText =
          'Payback / ROI depends on system cost, subsidy and energy savings. For small solar pump systems, payback is often in the range of about 4–8 years, but it varies by site and tariffs.';
      } else if (matchesAny(normalized, installTimeWords)) { // NEW: install → generation
        botText =
          'Typical time from installation to power generation:\n\n' +
          '• Site survey and vendor allocation: about 7–15 days\n' +
          '• Installation: about 15–25 days\n' +
          '• Testing and approval: about 5–7 days\n\n' +
          'So overall, it usually takes roughly 1–2 months from initial survey to actual generation, depending on state, vendor and site conditions.';
      } else if (matchesAny(normalized, benefitWords)) {
        botText =
          'KUSUM helps you get cheaper power, save diesel and earn extra income by selling solar power. It can increase farmer income by cutting energy costs and adding solar revenue while also reducing pollution.';
      } else if (matchesAny(normalized, eligibilityWords)) {
  botText =
    'Generally individual farmers, groups, cooperatives, panchayats and FPOs can participate. ' +
    'Exact rules depend on your state guidelines. Farmers can apply online for solar water pumps ' +
    'from 1 HP to 10 HP, and both owners and leased-land farmers are usually eligible.\n\n' +
    'For Digital Signature Certificate (DSC), you can visit: https://www.emudhra.com';
}
 else if (matchesAny(normalized, subsidyWords)) {
        botText =
          'In many cases you see around 60% subsidy, about 30% bank loan and roughly 10% farmer contribution. Some states give about ₹1.5 crore per MW support for feeder solarisation under PM-KUSUM : - around ₹1.05 crore from central government and about ₹45 lakh from state government. Exact subsidy depends on your state’s policy and tender.”';
      } else if (matchesAny(normalized, tenderWords)) { // NEW: tender / charges
        botText =
          'Indicative tender / participation charges (these can vary by state and DISCOM):\n\n' +
          '• Reference document charge: around ₹590\n' +
          '• Bidding / participation charge: around ₹23,600\n' +
          '• EMD (Earnest Money Deposit): around ₹1,00,000\n\n' +
          'Always confirm the exact amounts from the latest official tender document before applying.';
      } else if (matchesAny(normalized, maintenanceWords)) {
        botText =
          'Solar panels can last for around 20–25 years and need very low maintenance. Mostly periodic cleaning and basic checking are enough.';
      } else if (matchesAny(normalized, landWords)) {
        botText =
          'For about 1 megawatt of solar capacity, roughly 4–5 acres of land are typically required, though the exact figure can vary with design and site conditions.';
      } else if (matchesAny(normalized, feederWords)) {
        botText =
          "Under feeder-level solarisation, a common solar plant is installed near the agriculture feeder so that the whole feeder gets daytime solar power. In the individual pump model, a separate solar system is installed on each farmer's pump so they can run irrigation directly from their own solar power.";
      } else if (matchesAny(normalized, hoursWords)) {
        botText =
          'One of the key objectives is to provide at least around 7 hours of reliable daytime power for irrigation pumps, so farmers can irrigate without frequent cuts.';
      } else if (matchesAny(normalized, implementationWords)) {
        botText =
          'PM-KUSUM is implemented by the Ministry of New and Renewable Energy (MNRE) together with state nodal agencies and electricity distribution companies (DISCOMs).';
      } else if (matchesAny(normalized, workingWords)) {
        botText =
          'Component-C of PM-KUSUM primarily aims to power grid-connected agricultural pumps with solar energy .In this scheme, grid-connected pumps are solarised so that the farmer generates power on-site to run the pump. This reduces dependence on the grid and electricity bills while increasing clean solar generation nd also earn income by selling surplus power to the grid.';
      } else if (matchesAny(normalized, farmingEffectWords)) {
        // NEW: explicit farming effect question (English)
        botText =
          'Solar does not mean you must stop farming – with proper design both can work together:\n\n' +
          ' Positives:\n' +
          '• Panel shade can protect some crops from extreme heat and hot winds.\n' +
          '• Soil moisture can stay longer, so in some cases irrigation frequency reduces slightly.\n' +
          '• Shade-tolerant crops (fodder, some vegetables, some pulses) can do well under panels.\n\n' +
          ' Points to watch:\n' +
          '• Crops that need full, strong sun may give lower yield directly under panels.\n' +
          '• You must keep enough height and spacing for tractor and machinery to pass.\n' +
          '• Prefer drip irrigation or controlled water flow, so electrical parts do not get wet.\n\n' +
          'With the right crop mix and layout, farmers can benefit from both solar power and crops on the same land.';
      } else if (matchesAny(normalized, dosDontWords)) {
        // NEW: Do's & Don'ts reply (English)
        botText =
          ' DOs:\n' +
          '• Keep enough pathway between panel rows for people and machinery.\n' +
          '• Do regular cleaning and basic visual inspection of panels and cables.\n' +
          '• Use a qualified electrician for wiring and connections.\n' +
          '• Prefer low/medium height crops under panels that can handle partial shade.\n' +
          '• After strong storms, hail or heavy rain, inspect the structure and foundations.\n\n' +
                    " DON'Ts:\n" +
          "• Don't plant very tall trees or crops right next to panels – this increases shading and dirt.\n" +
          "• Don't leave loose or exposed wires near where people or animals move.\n" +
          "• Don't put extra heavy loads on the solar structure.\n" +
          "• Don't open electrical boxes yourself without proper tools and safety.\n\n" +
          'Following these simple tips helps keep your system safe, long-lasting and farmer-friendly.';
      } else if (matchesAny(normalized, loanWords)) {
        botText =
          'After subsidy, loans are often available at concessional rates (around 5% in many models). Typical EMIs can be in the range of ₹2–3k per month for small systems, with approval often within about 7–10 days (varies by bank and state).';
      } else {
        botText =
          'You can ask about benefits, eligibility, required documents, subsidy, maintenance, land needed for 1 MW, feeder-level vs individual pump solarisation, agrovoltaics, sun hours, payback, implementation agencies, or how the scheme works in simple steps.';
      }
    }

    finalizeMessage(userMsg, botText);
    speak(botText);
  };

  // original handleSend now delegates to processUserText
  const handleSend = () => {
    processUserText(input);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Start recognition for voice input
  const startVoice = () => {
    const SpeechRecognition: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Voice not supported in this browser.');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    const rec = new SpeechRecognition();
    recognitionRef.current = rec;
    rec.lang = isHindi ? 'hi-IN' : 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);
    rec.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    rec.onerror = (ev: any) => {
      console.warn('Speech recognition error', ev);
      setListening(false);
      recognitionRef.current = null;
    };

    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      processUserText(text);
    };

    try {
      rec.start();
    } catch (e) {
      console.warn('Could not start recognition', e);
    }
  };

  // small manual stop if needed
  const stopVoice = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
      setListening(false);
    }
  };

  const placeholder = isHindi
    ? 'अपना सवाल यहाँ लिखें... (जैसे: लाभ, कागज़, सब्सिडी, सोलर खेती, धूप घंटे)'
    : 'Type your question here... (e.g., benefits, documents, subsidy, sun hours)';

  const heading = isHindi ? 'कुसुम सारथी' : 'KUSUM Sarthi';

  return (
    <div className="chatbot-container">
      <div className="chatbot-box">
        <h2 className="chatbot-heading">{heading}</h2>

        <div className="chat-window" ref={chatRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={msg.from === 'user' ? 'chat-bubble user-bubble' : 'chat-bubble bot-bubble'}
            >
             <span
  dangerouslySetInnerHTML={{
    __html: msg.text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#38bdf8;text-decoration:underline;">$1</a>'
    ),
  }}
/>

            </div>
          ))}
        </div>

        <div className="chat-input-row">
          <button
            className={`chat-voice-button ${listening ? 'listening' : ''}`}
            onClick={() => {
              if (listening) stopVoice();
              else startVoice();
            }}
            title={
              listening
                ? isHindi
                  ? 'रिकॉर्डिंग बंद करें'
                  : 'Stop recording'
                : isHindi
                ? 'वॉयस शुरू करें'
                : 'Start voice'
            }
          >
            {listening ? '🎤 …' : '🎤'}
          </button>

          <input
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
          />

          <button className="chat-send-button" onClick={handleSend} disabled={isInputEmpty}>
            {isHindi ? 'भेजें' : 'Send'}
          </button>

          <button
            className="chat-mute-button"
            onClick={() => setMuted((m) => !m)}
            title={muted ? (isHindi ? 'ध्वनि बंद' : 'Muted') : (isHindi ? 'ध्वनि चालू' : 'Unmuted')}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
