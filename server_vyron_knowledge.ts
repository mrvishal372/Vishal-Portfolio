/**
 * server_vyron_knowledge.ts
 * 
 * Comprehensive VYRON App Knowledge Base & Role-Based Response System
 * Created for Vyron AI (by Vishal Yadav)
 * 
 * Features:
 * 1. Comprehensive knowledge of all tabs, modules, games, buttons, tools, and navigation.
 * 2. Strict Role Gating:
 *    - Admin: Full codebase intelligence, exact file paths, line numbers, bug diagnostics, code diffs.
 *    - Normal User: Accurate app feature guides & general programming education, but ZERO internal source code,
 *      no internal file paths, no line numbers, and strict Special Founder Response for proprietary code requests.
 * 3. Exact Special Founder Response in user's language (English, Hindi, Hinglish).
 * 4. Bhagavad Gita, IT Interview, and Indian Food Recipe modes integration.
 */

export const SPECIAL_FOUNDER_RESPONSES = {
  en: "This app's development and internal coding details are handled by its founder, Vishal Yadav. He will be able to answer this question.",
  hi: "इस ऐप के डेवलपमेंट और इंटरनल कोडिंग की जानकारी इसके फाउंडर विशाल यादव (Vishal Yadav) द्वारा संभाली जाती है। वे इस सवाल का बेहतर जवाब दे सकेंगे।",
  hinglish: "Is app ke development aur internal coding details iske founder, Vishal Yadav handle karte hain. Woh is sawal ka behtar jawab de sakenge.",
};

export const VYRON_APP_KNOWLEDGE_BASE = `
=== OFFICIAL VYRON APPLICATION KNOWLEDGE BASE ===

[APP IDENTITY & OVERVIEW]
- App Name: VYRON (also known as BharatJugaad)
- Creator & Founder: Vishal Yadav (BCA Student, Patna, Bihar; Social ID: @mr_vishal372; Born 16 July 2006)
- Core Purpose: A comprehensive all-in-one AI platform and digital super-app designed for students, job seekers, freshers, everyday household utilities, and offline-first problem solving.
- Platform Stack: React 19, TypeScript, Tailwind CSS, Node.js/Express, Google Gemini API, Web Audio API, Three.js, Service Worker / PWA offline engine.

[GLOBAL HEADER & CONTROLS]
1. Header Voice Button (#header-voice-btn):
   - Location: Top navigation bar, right side.
   - Purpose: Activates Vyron AI Voice Interaction (Speech-to-Text). Users can speak their questions hands-free in Hindi, English, or Hinglish.
2. Global Search Button (#header-search-btn):
   - Location: Top navigation bar.
   - Purpose: Opens the fast Global Search modal to quickly find any of the 8 modules, 10+ games, typing lessons, study notes, or tools.
3. Quick Menu / Settings Button (#header-quick-menu-btn):
   - Location: Top navigation bar.
   - Purpose: Opens quick settings for language selection (English/Hindi), dark/light theme, ambient glow effects, sound effects, and voice speech rate.
4. Admin Access Badge / Login Modal:
   - Location: Top header & profile drawer.
   - Purpose: Allows authorized administrator login with secure server-side session authentication.
5. Offline Status Banner:
   - Location: Top floating banner.
   - Purpose: Automatically notifies the user when they lose internet connectivity, assuring them that cached notes, games, and offline tools continue working.

[BOTTOM NAVIGATION DOCK (4 MAIN TABS)]
1. 🏠 Home Tab ('home'):
   - Hero welcome header with animated greeting and quick AI prompt bar.
   - Quick launch cards for trending modules (Last Night Padhai, Aaj Kya Banaoo, Sasti Dawai, Money Manager).
   - "Continue Where You Left Off" section showing recent activities, saved items, and typing scores.
   - Featured Daily Quote / Motivation and quick shortcuts to all app sections.
2. 🧭 Explore Tab ('explore'):
   - Master hub containing all app modules, games, developer tools, and YouTube video playlists.
   - Filterable categories: All, Utilities, Games, Education & Coding, Health & Finance.
   - Direct access to:
     * 8 Utility Modules (Money Manager, Sasti Dawai, Jugaad Fix, Form Alert, Meri Yojna, Aaj Kya Banaoo, Last Night Padhai, CIMAGE BCA Logo Maker).
     * Games Arcade (10+ browser games).
     * Typing Master Platform.
     * Coding Lab (multi-language online compiler).
     * App Code (two-way code manager & IDE).
     * Educational YouTube video courses.
3. 🔔 Notifications Tab ('notifications'):
   - Real-time updates and notification feed.
   - Tracks exam form deadlines, admit card releases, medicine dose reminders, scholarship alerts, and new features.
   - Filter by: All, Reminders, Alerts, Updates, with mark-as-read and clear all actions.
4. 👤 Profile Tab ('profile'):
   - User Profile management: edit display name, profile photo crop/zoom, cover photo, bio, college, and course details.
   - Saved Bookmarks: quick access to bookmarked recipes, medicines, government schemes, and study notes.
   - Resume & Bio generator: generates professional resume drafts.
   - Founder Showcase & Portfolio: interactive section showcasing founder Vishal Yadav's educational journey, BCA projects, skills, and vision.

[8 CORE UTILITY MODULES]
1. Money Manager ('money'):
   - Purpose: Smart personal budgeting, expense logging, and financial advice.
   - Features: Monthly income/expense tracker, category breakdown (Kirana, Rent, Food, Utilities), 50-30-20 rule budget analysis, cost-cutting hacks, emergency fund calculator.
2. Sasti Dawai ('medicine'):
   - Purpose: Healthcare cost reduction through generic medicine education.
   - Features: Search branded medicines to find Jan Aushadhi generic equivalents (saves 50-85%), salt composition explanation, daily dose reminder schedules.
3. Jugaad Fix ('jugaad'):
   - Purpose: Home repair and emergency maintenance solutions.
   - Features: Step-by-step DIY guides for plumbing leaks, electrical safety, appliance troubleshooting, furniture repair, using safe household materials.
4. Form Alert ('forms'):
   - Purpose: Government exams, recruitment drives, and academic entrance tracking.
   - Features: Real-time alerts for SSC, UPSC, Railway, Banking, State PCS, CUET, eligibility checker, age limits, syllabus summaries, direct application links.
5. Meri Yojna ('yojna'):
   - Purpose: Central and State Government welfare scheme finder.
   - Features: Filter schemes by user age, occupation, gender, state, and income; provides step-by-step application procedures and required document checklists.
6. Aaj Kya Banaoo ('recipe'):
   - Purpose: Smart Indian home recipe generator and leftover food makeover.
   - Features: Ingredient-based recipe finder (enter ingredients you already have), 1-pan hostel cooking for students, meal planner, step-by-step cooking steps with flame levels.
7. Last Night Padhai ('study'):
   - Purpose: AI-powered exam preparation, revision notes, and tutoring for students.
   - Features: 5-minute crash revision, formula sheets, mnemonics, important university exam questions, 5-question quick quizzes for BCA/B.Tech/school courses.
8. CIMAGE BCA Logo Maker ('logo'):
   - Purpose: Professional college and tech logo design suite.
   - Features: Custom badge styles, modern typography, geometric shapes, gradient accents, SVG & high-resolution PNG export.

[GAMES ARCADE (10+ GAMES)]
1. Snake Game: Classic snake navigation, speed boosts, food multipliers, high score tracking.
2. 2048: Sliding tile numerical puzzle combining powers of 2 up to 2048.
3. Tic Tac Toe: Interactive 3x3 grid with single-player (vs AI) and two-player local pass-and-play.
4. Flappy Bird: Arcade gravity jumping game dodging pipes with score tracking.
5. Memory Game: Card-matching concentration game testing visual recall.
6. Ping Pong: Retro 2D paddle table tennis vs responsive AI opponent.
7. Tetris: Classic falling tetromino block puzzle with line clears and acceleration.
8. Space Shooter: Cosmic starship arcade game with laser shooting, asteroid hazards, and boss levels.
9. Battle Royale 3D: High-performance 3D survival game with bot opponents, loot collection, and safe zone shrinking.
10. Brain Games Hub: Sudoku, Logic Grid, Sequence Memory, Color Trap (Stroop effect), Difference Finder, Word Recall, Odd One Out, Pattern Master.

[CODING & DEVELOPER PLATFORM]
1. Typing Master ('typing'):
   - Complete keyboarding suite with animated Panda mascot, speed tests (WPM/accuracy), typing lessons, code quotes mode, exam mode, and sound effects.
2. Coding Lab ('coding'):
   - Multi-language online coding environment supporting Python, JavaScript, C, C++, Java, PHP, and SQL with instant execution and output breakdown.
3. App Code ('appcode'):
   - Advanced code management and IDE integrated with two-way sync, file tree navigation, live code preview, Git commit support, and AI Code Assistant.

[VYRON AI CAPABILITIES & MODES]
- Model Support: Gemini 3.1 Flash Lite (ultra-fast), Gemini 3.8 Flash (balanced), Gemini 3.1 Pro Preview (high thinking).
- Response Modes:
  * ⚡ FAST (2 Marks Mode): Ultra-crisp 2-4 lines answer for rapid 2-minute revisions.
  * 🍃 LITE (4-6 Marks Mode): Balanced medium notes with definition, syntax, 2-3 points, and example.
  * 🧠 PRO (12-16 Marks Mode): University topper answer with comprehensive explanations, flowchart diagrams (\`\`\`flowchart), comparison tables, and full code.
- 3 Dedicated Working Modes:
  1. Learn Mode: Step-by-step programming education (HTML, CSS, JS, React, Java, Python, SQL, DSA).
  2. Analyze Mode: Deep code analysis for Admin; functional feature breakdown for Normal Users.
  3. Developer Mode: Bug fixes & code proposals for Admin; general software development guidance for Normal Users.
`;

/**
 * Checks if a user's prompt is inquiring about proprietary app source code or internal development
 */
export function isAppSourceCodeQuery(prompt: string): boolean {
  const p = (prompt || "").toLowerCase();
  
  // Specific questions mentioned in the prompt requirements:
  // - "How was this tab developed?"
  // - "How was this feature coded?"
  // - "Which code creates this page?"
  // - "How can I modify this app's internal functionality?"
  // - "Show me the source code of this app."
  const patterns = [
    /how\s+was\s+this\s+(tab|feature|page|app|module)\s+(developed|coded|made|built|programmed)/i,
    /how\s+(is|was)\s+this\s+(tab|feature|page|app|module)\s+coded/i,
    /which\s+code\s+(creates|builds|runs|powers)\s+this/i,
    /how\s+can\s+i\s+modify\s+this\s+app('s|\s+internal)\s+functionality/i,
    /show\s+(me\s+)?(the\s+)?source\s*code(\s+of\s+this\s+app|\s+of\s+app)?/i,
    /give\s+(me\s+)?(the\s+)?(source\s*code|github\s+code|backend\s+code)/i,
    /show\s+(me\s+)?the\s+code\s+(for|behind)\s+this\s+(app|tab|page|feature|vyron)/i,
    /is\s+app\s+ka\s+code\s+(dikhao|bhejo|do|kaise\s+likha)/i,
    /ye\s+(tab|page|feature)\s+kaise\s+(code|develop|banaya\s+gaya)/i,
    /app\s+ka\s+source\s*code(\s+kya\s+hai|\s+kaise\s+milega|\s+dikhao)?/i,
    /internal\s+(implementation|files|source\s*code)\s+of\s+vyron/i,
    /show\s+me\s+(the\s+)?file\s+structure\s+and\s+source\s+code/i,
    /source\s*code.*(app|vyron|project|tab|page)/i,
    /(app|vyron|project|tab|page).*source\s*code/i,
    // Hindi Devanagari patterns:
    /सोर्स\s*कोड/i,
    /(ऐप|एप|टैब|पेज|फीचर)\s*(का|के)\s*(सोर्स\s*कोड|कोड)/i,
    /कोड\s*(दिखाओ|दिखाइए|दीजिए|दो|भेजो)/i,
    /(टैब|पेज|फीचर)\s*कैसे\s*(बनाया|कोड|डेवलप)/i,
    /आंतरिक\s*(कोडिंग|कोड|फंक्शन)/i,
    /कैसे\s*(डेवलप|कोड)\s*किया/i,
  ];

  return patterns.some(pattern => pattern.test(p));
}

/**
 * Detects user language: 'hi' (Devanagari), 'hinglish' (Roman Hindi), or 'en' (English)
 */
export function detectUserLanguage(text: string): "hi" | "hinglish" | "en" {
  if (/[\u0900-\u097F]/.test(text)) {
    return "hi";
  }
  const t = (text || "").toLowerCase();
  const hinglishWords = [
    "kaise", "kya", "batao", "mujhe", "karo", "kaha", "hai", "hain", "karna", "hoti", "hote",
    "banao", "dikhao", "sikhao", "kaun", "kisi", "mere", "mera", "meri", "hum", "aap", "tum"
  ];
  const hits = hinglishWords.filter(w => t.includes(` ${w} `) || t.startsWith(`${w} `) || t.endsWith(` ${w}`));
  if (hits.length >= 1) {
    return "hinglish";
  }
  return "en";
}

/**
 * Returns the exact Special Founder Response in matching language
 */
export function getSpecialFounderResponse(userText: string): string {
  const lang = detectUserLanguage(userText);
  return SPECIAL_FOUNDER_RESPONSES[lang] || SPECIAL_FOUNDER_RESPONSES.en;
}

/**
 * Checks if the prompt asks about VYRON app features, tabs, buttons, or navigation
 */
export function isAppKnowledgeQuery(prompt: string): boolean {
  const p = (prompt || "").toLowerCase();
  const keywords = [
    "vyron", "bharatjugaad", "this app", "ye app", "app me kya", "what is this app",
    "tab", "explore tab", "home tab", "profile tab", "notifications tab",
    "money manager", "sasti dawai", "jugaad fix", "form alert", "meri yojna", "aaj kya banaoo",
    "last night padhai", "logo maker", "games hub", "typing master", "coding lab", "app code",
    "header-voice-btn", "voice button", "voice btn", "mic button", "search button", "quick menu",
    "settings tab", "features are available", "what does this button do", "how can i use this feature",
    "purpose of this tab", "kisme kya hota hai", "kaha pr kya hai", "kaise use kare",
    // Hindi Devanagari keywords
    "एक्सप्लोर", "होम", "प्रोफाइल", "नोटिफिकेशन", "टैब", "बटन", "फीचर", "ऐप में क्या", "इस ऐप", "आवाज़", "माइक", "सर्च"
  ];
  return keywords.some(k => p.includes(k));
}

/**
 * Generates an instant, direct app knowledge answer for normal users and fallbacks
 */
export function getDirectAppKnowledgeAnswer(prompt: string, language?: string): string {
  const p = (prompt || "").toLowerCase();
  const isHi = language === "hi" || /[\u0900-\u097F]/.test(prompt);

  // 1. Voice button (#header-voice-btn)
  if (p.includes("voice") || p.includes("mic") || p.includes("आवाज़") || p.includes("header-voice-btn")) {
    return isHi
      ? `🎙️ **हेडर वॉयस बटन (#header-voice-btn) की जानकारी**:
- **स्थान**: ऐप के ऊपरी हेडर (Top Bar) में दाईं ओर।
- **उद्देश्य**: यह वॉयस असिस्टेंट को सक्रिय करता है जिससे आप बिना टाइप किए बोलकर (Speech-to-Text) हिंदी, इंग्लिश या हिंग्लिश में कोई भी सवाल पूछ सकते हैं।
- **उपयोग कैसे करें**: बटन पर क्लिक करें, माइक की अनुमति दें, अपना सवाल बोलें और Vyron AI तुरंत जवाब देगा।`
      : `🎙️ **Header Voice Button (#header-voice-btn)**:
- **Location**: Top navigation header on the right side.
- **Purpose**: Activates hands-free Voice Interaction (Speech-to-Text). You can ask questions by speaking in English, Hindi, or Hinglish.
- **How to Use**: Click the microphone icon, allow microphone access, speak your query, and Vyron AI will respond instantly.`;
  }

  // 2. Explore Tab
  if (p.includes("explore") || p.includes("एक्सप्लोर")) {
    return isHi
      ? `🧭 **Explore (एक्सप्लोर) टैब की जानकारी**:
- **उद्देश्य**: यह ऐप का मुख्य कैटलॉग हब है जहाँ VYRON के सभी 8 यूटिलिटी टूल्स, 10+ गेम्स, कोडिंग लैब और लर्निंग रिसोर्सेस एक ही जगह मिलते हैं।
- **उपलब्ध फीचर्स**:
  1. 🛠️ **8 मुख्य यूटिलिटी टूल्स**: Money Manager (बजट), Sasti Dawai (जेनेरिक दवाएं), Jugaad Fix (घरेलू समाधान), Form Alert (सरकारी नौकरी व फॉर्म), Meri Yojna (सरकारी योजनाएं), Aaj Kya Banaoo (रेसिपी), Last Night Padhai (स्टडी नोट्स), CIMAGE BCA Logo Maker (लोगो मेकर)।
  2. 🎮 **गेम्स आर्केड**: स्नेक, 2048, टिक-टैक-टो, फ्लैपी बर्ड, मेमोरी, पिंग-पॉन्ग, टेट्रिस, स्पेस शूटर, 3D बैटल रॉयल व ब्रेन गेम्स।
  3. 💻 **डेवलपर टूल्स**: Typing Master, Coding Lab (Python, C, C++, Java, JS ऑनलाइन कंपाइलर), App Code (कोड एडिटर)।
  4. 📚 **एजुकेशनल वीडियो कोर्सेज**: कंप्यूटर साइंस और प्रोग्रामिंग ट्यूटोरियल्स।`
      : `🧭 **Explore Tab Overview**:
- **Purpose**: The central discovery hub containing all 8 utility modules, 10+ arcade games, coding labs, and study resources.
- **Available Features**:
  1. 🛠️ **8 Core Modules**: Money Manager (budgeting), Sasti Dawai (generic medicines), Jugaad Fix (DIY home repairs), Form Alert (job/exam dates), Meri Yojna (welfare schemes), Aaj Kya Banaoo (recipe finder), Last Night Padhai (quick revision), CIMAGE BCA Logo Maker (graphic design).
  2. 🎮 **Games Arcade**: Snake, 2048, Tic Tac Toe, Flappy Bird, Memory, Ping Pong, Tetris, Space Shooter, Battle Royale 3D, and Brain Games Hub.
  3. 💻 **Developer Hub**: Typing Master, Coding Lab (online compiler for Python, C, C++, Java, JS), and App Code editor.
  4. 📚 **Learning Playlists**: Structured computer science & BCA tutorials.`;
  }

  // 3. Home Tab
  if (p.includes("home") || p.includes("होम") || p.includes("what is this app") || p.includes("ye app kya hai")) {
    return isHi
      ? `🏠 **VYRON ऐप और Home टैब की जानकारी**:
- **ऐप का परिचय**: VYRON (भारत जुगाड़) छात्रों, युवाओं और परिवारों के लिए बनाया गया एक ऑल-इन-वन सुपर AI प्लेटफॉर्म है जिसे **विशाल यादव (Vishal Yadav)** ने विकसित किया है।
- **होम टैब के फीचर्स**:
  1. ⚡ **त्वरित AI प्रॉम्प्ट लॉन्चर**: सीधे मुख्य स्क्रीन से कोई भी सवाल पूछें।
  2. 🌟 **डेली फीचर्ड मॉड्यूल्स**: Last Night Padhai, Aaj Kya Banaoo, और Sasti Dawai के क्विक कार्ड्स।
  3. ⏱️ **हाल की गतिविधियाँ**: आपके हालिया टाइपिंग स्कोर, सहेजे गए नोट्स और उपयोगी टूल्स तक तुरंत पहुंच।
  4. 💡 **डेली मोटिवेशनल कोट्स व शॉर्टकट्स**: सभी फीचर्स तक एक क्लिक में नेविगेट करने की सुविधा।`
      : `🏠 **About VYRON App & Home Tab**:
- **About the App**: VYRON is an all-in-one smart AI platform and daily utility suite created by **Vishal Yadav** for students, job applicants, and everyday households.
- **Home Tab Highlights**:
  1. ⚡ **Quick AI Prompt Launcher**: Ask any question directly from the front screen.
  2. 🌟 **Featured Utility Cards**: Instant access to Last Night Padhai, Aaj Kya Banaoo, and Sasti Dawai.
  3. ⏱️ **Recent Activity Feed**: Resumes your typing practice, saved notes, and bookmarked guides.
  4. 💡 **Daily Insights & Fast Navigation**: Clean shortcuts to all sections of the application.`;
  }

  // 4. Notifications Tab
  if (p.includes("notification") || p.includes("नोटिफिकेशन")) {
    return isHi
      ? `🔔 **Notifications (नोटिफिकेशन्स) टैब की जानकारी**:
- **उद्देश्य**: आपको महत्वपूर्ण समय-सीमाओं, सरकारी फॉर्मों, और व्यक्तिगत रिमाइंडर्स से हमेशा अपडेट रखना।
- **क्या-क्या मिलता है**:
  - सरकारी फॉर्म, प्रवेश परीक्षा और एडमिट कार्ड की महत्वपूर्ण तारीखें।
  - आपकी दवाइयों के समय पर लेने के रिमाइंडर्स (Dose Reminders)।
  - नई सरकारी योजनाओं और ऐप फीचर्स के अलर्ट्स।
  - पढ़े गए और अनपढ़े नोटिफिकेशन को फ़िल्टर व क्लियर करने की सुविधा।`
      : `🔔 **Notifications Tab Overview**:
- **Purpose**: Keeps you updated on important deadlines, government alerts, and personal reminders.
- **What is available**:
  - Government job & entrance exam registration dates and admit card alerts.
  - Timely medicine schedule dosage reminders.
  - New welfare scheme updates and app enhancements.
  - Filter by category, mark-as-read, and one-click clear.`;
  }

  // 5. Profile Tab
  if (p.includes("profile") || p.includes("प्रोफाइल")) {
    return isHi
      ? `👤 **Profile (प्रोफाइल) टैब की जानकारी**:
- **उद्देश्य**: आपकी व्यक्तिगत सेटिंग्स, सहेजे गए डेटा और फाउंडर प्रोफाइल को प्रबंधित करना।
- **उपलब्ध फीचर्स**:
  - **प्रोफाइल एडिटर**: नाम, कॉलेज (BCA), कोर्स, बायो और प्रोफाइल फोटो क्रॉप/ज़ूम सेटिंग।
  - **सहेजे गए बुकमार्क्स**: आपकी सेव की गई रेसिपी, जन औषधि दवाइयां, और स्टडी नोट्स।
  - **रेज्युमे व बायो जेनरेटर**: जॉब और इंटर्नशिप के लिए पेशेवर बायो तैयार करना।
  - **फाउंडर विशाल यादव पोर्टफोलियो**: संस्थापक विशाल यादव का सफर, शिक्षा और विज़न देखना।`
      : `👤 **Profile Tab Overview**:
- **Purpose**: Manages your personal preferences, bookmarked content, and founder portfolio.
- **Available Features**:
  - **Profile Management**: Update your name, course (BCA), bio, and profile photo with crop/zoom tools.
  - **Saved Bookmarks**: Quick access to saved recipes, generic medicine alternatives, and study notes.
  - **Resume & Bio Generator**: Creates polished profiles for academic and professional applications.
  - **Founder Portfolio Section**: Explore Vishal Yadav's educational journey, BCA projects, and mission.`;
  }

  // General App Overview
  return isHi
    ? `✨ **VYRON ऐप का संपूर्ण परिचय**:
VYRON एक ऑल-इन-वन स्मार्ट डिजिटल प्लेटफॉर्म है जिसे **विशाल यादव (Vishal Yadav)** ने विकसित किया है।
- **नीचे दिए गए 4 टैब्स**:
  1. 🏠 **Home**: मुख्य डैशबोर्ड और AI प्रॉम्प्ट लॉन्चर।
  2. 🧭 **Explore**: सभी 8 यूटिलिटी मॉड्यूल्स, 10+ गेम्स, टाइपिंग मास्टर व कोडिंग लैब।
  3. 🔔 **Notifications**: सरकारी फॉर्म्स और मेडिसिन डोज रिमाइंडर्स।
  4. 👤 **Profile**: यूजर प्रोफाइल, सेव किए गए बुकमार्क्स और फाउंडर पोर्टफोलियो।
- **ऊपरी हेडर टूल्स**:
  - 🎙️ वॉयस बटन (#header-voice-btn) से बोलकर सवाल पूछें।
  - 🔍 सर्च बटन (#header-search-btn) से कोई भी टूल तुरंत खोजें।
  - ⚙️ सेटिंग्स से डार्क/लाइट थीम व भाषा बदलें।`
    : `✨ **VYRON Application Overview**:
VYRON is a comprehensive all-in-one AI platform and digital utility suite created by **Vishal Yadav**.
- **Bottom Navigation Dock (4 Tabs)**:
  1. 🏠 **Home**: Central dashboard and quick AI interaction launcher.
  2. 🧭 **Explore**: Complete directory of 8 utility modules, 10+ games, Typing Master, and Coding Lab.
  3. 🔔 **Notifications**: Real-time alerts for government exams, deadlines, and medicine reminders.
  4. 👤 **Profile**: User settings, saved bookmarks, resume builder, and founder portfolio.
- **Header Controls**:
  - 🎙️ Voice button (#header-voice-btn) for hands-free speech queries.
  - 🔍 Search button (#header-search-btn) for fast universal search.
  - ⚙️ Quick menu for language, theme, and audio options.`;
}

/**
 * Direct Programming Education Engine for Learn Mode and Fallbacks
 */
export function getDirectProgrammingEducationAnswer(prompt: string, language?: string): string | null {
  const p = (prompt || "").toLowerCase();
  const isHi = language === "hi" || /[\u0900-\u097F]/.test(prompt);

  if (p.includes("usestate")) {
    return isHi
      ? `### 📌 React \`useState\` हुक क्या है?
- **परिभाषा**: \`useState\` रिएक्ट का एक बिल्ट-इन हुक है जो फंक्शनल कंपोनेंट्स में स्टेट (डेटा या मान) को स्टोर और अपडेट करने की सुविधा देता है।
- **सिंटैक्स**:
\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`
- **मुख्य बिंदु**:
  1. \`count\`: वर्तमान स्टेट वैल्यू।
  2. \`setCount\`: स्टेट को अपडेट करने वाला फंक्शन।
  3. \`0\`: इनिशियल (शुरुआती) स्टेट वैल्यू।
- 💡 **टिप**: जब भी स्टेट अपडेट होती है, रिएक्ट कंपोनेंट को स्वचालित रूप से दोबारा रेंडर (Re-render) करता है।`
      : `### 📌 What is React \`useState\` Hook?
- **Definition**: \`useState\` is a built-in React hook that enables functional components to store and update dynamic state values.
- **Syntax**:
\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`
- **Key Elements**:
  1. \`count\`: Current state value.
  2. \`setCount\`: State updater function.
  3. \`0\`: Initial state value.
- 💡 **Key Takeaway**: Calling the setter function automatically triggers a re-render of the component with the new state.`;
  }

  if (p.includes("flexbox") || p.includes("flex")) {
    return isHi
      ? `### 📌 CSS Flexbox क्या है?
- **परिभाषा**: Flexbox (Flexible Box Layout) CSS3 का 1-डायमेंशनल लेआउट मॉडल है जो तत्वों को एक पंक्ति (Row) या कॉलम (Column) में आसानी से संरेखित (align) और व्यवस्थित करने में मदद करता है।
- **सिंटैक्स**:
\`\`\`css
.container {
  display: flex;
  justify-content: center; /* मुख्य अक्ष पर संरेखण */
  align-items: center;     /* लंबवत संरेखण */
}
\`\`\`
- 💡 **मुख्य गुण**: \`flex-direction\`, \`justify-content\`, \`align-items\`, \`gap\`।`
      : `### 📌 What is CSS Flexbox?
- **Definition**: Flexbox (Flexible Box Module) is a 1-dimensional CSS layout model designed to distribute space along a row or column and align items effortlessly.
- **Syntax**:
\`\`\`css
.container {
  display: flex;
  justify-content: center; /* Main axis alignment */
  align-items: center;     /* Cross axis alignment */
}
\`\`\`
- 💡 **Core Properties**: \`flex-direction\`, \`justify-content\`, \`align-items\`, \`gap\`.`;
  }

  if (p.includes("sql join") || (p.includes("join") && p.includes("sql"))) {
    return isHi
      ? `### 📌 SQL JOIN क्या है?
- **परिभाषा**: SQL JOIN का उपयोग दो या दो से अधिक तालिकाओं (Tables) के डेटा को किसी संबंधित कॉलम (Common Column) के आधार पर मिलाकर परिणाम प्राप्त करने के लिए किया जाता है।
- **मुख्य प्रकार**:
  1. **INNER JOIN**: दोनों तालिकाओं के केवल मैचिंग रिकॉर्ड्स देता है।
  2. **LEFT JOIN**: बाईं तालिका के सभी रिकॉर्ड्स और दाईं तालिका के मैचिंग रिकॉर्ड्स देता है।
  3. **RIGHT JOIN**: दाईं तालिका के सभी रिकॉर्ड्स और बाईं के मैचिंग।
  4. **FULL OUTER JOIN**: दोनों तालिकाओं के सभी रिकॉर्ड्स।`
      : `### 📌 What is an SQL JOIN?
- **Definition**: An SQL JOIN clause combines rows from two or more tables based on a related common key column.
- **Primary Types**:
  1. **INNER JOIN**: Returns records with matching values in both tables.
  2. **LEFT JOIN**: Returns all records from the left table and matching from the right.
  3. **RIGHT JOIN**: Returns all records from the right table and matching from the left.
  4. **FULL OUTER JOIN**: Returns all records when there is a match in either table.`;
  }

  return null;
}

/**
 * Common technical typos and abbreviations mapping
 */
const COMMON_TYPOS: Record<string, string> = {
  htnl: "html",
  htm: "html",
  divv: "div",
  spn: "span",
  apii: "api",
  inhritance: "inheritance",
  inheretance: "inheritance",
  inheretence: "inheritance",
  firebse: "firebase",
  firbase: "firebase",
  firbasee: "firebase",
  jva: "java",
  javva: "java",
  pythn: "python",
  pytn: "python",
  pithon: "python",
  recat: "react",
  raect: "react",
  usestat: "usestate",
  useffct: "useeffect",
  useeffectt: "useeffect",
  sqll: "sql",
  gitt: "git",
  githb: "github",
  dockr: "docker",
  dockar: "docker",
  thred: "thread",
  deadlok: "deadlock",
  flx: "flexbox",
  flexbx: "flexbox",
  functin: "function",
  fuction: "function",
  arry: "array",
  arary: "array",
  poicter: "pointer",
  pointr: "pointer",
  algoritm: "algorithm",
  algotithm: "algorithm",
  recursn: "recursion",
  "c++": "cpp",
  "c#": "csharp",
};

/**
 * Normalizes user prompt: trims punctuation, standardizes casing, fixes common typos
 */
export function normalizeTechnicalTerm(raw: string): string {
  if (!raw) return "";
  let clean = raw.trim().toLowerCase();
  // Strip common leading questions words: "what is", "what is a", "what is an", "kya hai", "kya hota hai", "meaning of", "explain"
  clean = clean.replace(/^(what\s+is\s+(an?\s+)?|explain\s+|define\s+|meaning\s+of\s+|tell\s+me\s+about\s+)/i, "");
  clean = clean.replace(/(\s+kya\s+hai|\s+kya\s+hota\s+hai|\s+ka\s+matlab|\s+meaning|\s+definition|\s+in\s+hindi|\s+in\s+english)$/i, "");
  // Strip trailing punctuation
  clean = clean.replace(/[?!.,;:"'#]+$/, "").replace(/^[?!.,;:"'#]+/, "").trim();
  
  if (COMMON_TYPOS[clean]) {
    return COMMON_TYPOS[clean];
  }
  return clean;
}

/**
 * Comprehensive One-Word Question Understanding Repository
 * Provides fast, instant definitions and explanations with zero boilerplate
 */
export const ONE_WORD_DICTIONARY: Record<string, {
  term: string;
  en: string;
  hi: string;
  syntaxOrExample?: string;
  keyTakeaway?: string;
}> = {
  html: {
    term: "HTML (HyperText Markup Language)",
    en: "HTML is the standard markup language used to structure web pages and web applications.",
    hi: "HTML (HyperText Markup Language) वेब पेजों को बनाने और उनकी संरचना (structure) तैयार करने की मानक मार्कअप भाषा है।",
    syntaxOrExample: `<!DOCTYPE html>\n<html>\n  <head><title>My Page</title></head>\n  <body>\n    <h1>Hello World</h1>\n    <p>This is structured with HTML.</p>\n  </body>\n</html>`,
    keyTakeaway: "HTML provides the skeleton and semantic layout of every website."
  },
  div: {
    term: "DIV (<div> Tag)",
    en: "DIV is an HTML container element used to group and organize other elements.",
    hi: "DIV (`<div>`) एक HTML कंटेनर एलिमेंट है जिसका उपयोग अन्य तत्वों को समूहित (group) और व्यवस्थित (organize) करने के लिए किया जाता है।",
    syntaxOrExample: `<div class="profile-card">\n  <h2>Vishal Yadav</h2>\n  <p>BCA Student & Vyron AI Creator</p>\n</div>`,
    keyTakeaway: "It is a block-level container commonly used with CSS flexbox or grid for page layout."
  },
  span: {
    term: "SPAN (<span> Tag)",
    en: "SPAN is an inline HTML container used to style or manipulate a specific piece of text or content without starting a new line.",
    hi: "SPAN (`<span>`) एक इनलाइन HTML कंटेनर है जिसका उपयोग नई लाइन शुरू किए बिना टेक्स्ट के किसी खास हिस्से को स्टाइल करने के लिए किया जाता है।",
    syntaxOrExample: `<p>Vyron AI is <span style="color: blue; font-weight: bold;">super fast</span> and smart.</p>`,
    keyTakeaway: "Unlike <div> which is block-level, <span> only takes up as much width as its text content."
  },
  api: {
    term: "API (Application Programming Interface)",
    en: "API allows two software applications to communicate and exchange data with each other.",
    hi: "API (Application Programming Interface) दो अलग-अलग सॉफ्टवेयर एप्लिकेशन्स को आपस में डेटा साझा करने और संवाद करने की अनुमति देता है।",
    syntaxOrExample: `// Fetching data from a REST API\nconst response = await fetch('/api/weather?city=Patna');\nconst data = await response.json();`,
    keyTakeaway: "Think of an API as a waiter in a restaurant taking orders from the customer to the kitchen and bringing back the food."
  },
  inheritance: {
    term: "Inheritance (OOP Concept)",
    en: "Inheritance is an OOP concept in which one class can acquire properties and methods from another class.",
    hi: "Inheritance (उत्तराधिकार) ऑब्जेक्ट-ओरिएंटेड प्रोग्रामिंग (OOP) का एक सिद्धांत है जिसमें एक चाइल्ड क्लास (Child Class) पैरेंट क्लास (Parent Class) के गुणों और विधियों को प्राप्त करती है।",
    syntaxOrExample: `// Java Example\nclass Animal {\n  void eat() { System.out.println("Eating..."); }\n}\nclass Dog extends Animal {\n  void bark() { System.out.println("Barking..."); }\n}`,
    keyTakeaway: "Enables code reusability and creates hierarchical relationships between classes."
  },
  firebase: {
    term: "Firebase",
    en: "Firebase is Google's development platform that provides services such as authentication, databases, and storage.",
    hi: "Firebase गूगल का एक क्लाउड डेवलपमेंट प्लेटफॉर्म है जो ऑथेंटिकेशन, डेटाबेस (Firestore), स्टोरेज और होस्टिंग जैसी सेवाएं प्रदान करता है।",
    syntaxOrExample: `import { initializeApp } from 'firebase/app';\nimport { getFirestore, doc, setDoc } from 'firebase/firestore';`,
    keyTakeaway: "Allows developers to build full-stack web and mobile apps quickly without managing physical backend servers."
  },
  css: {
    term: "CSS (Cascading Style Sheets)",
    en: "CSS is the stylesheet language used to style, design, and lay out web pages (colors, fonts, animations, responsiveness).",
    hi: "CSS (Cascading Style Sheets) वेब पेजों को डिज़ाइन, रंग, फॉन्ट, लेआउट और रिस्पॉन्सिव स्टाइल देने वाली भाषा है।",
    syntaxOrExample: `body {\n  font-family: Arial, sans-serif;\n  background-color: #0f172a;\n  color: #ffffff;\n}`,
    keyTakeaway: "If HTML is the human skeleton, CSS is the skin, clothes, and appearance."
  },
  javascript: {
    term: "JavaScript (JS)",
    en: "JavaScript is a lightweight, cross-platform scripting language used to create dynamic, interactive web pages and backend applications.",
    hi: "JavaScript एक शक्तिशाली प्रोग्रामिंग भाषा है जिसका उपयोग वेब पेजों को इंटरएक्टिव (क्लिक इवेंट्स, फॉर्म वैलिडेशन, एनिमेशन) और गतिशील बनाने के लिए किया जाता है।",
    syntaxOrExample: `const greetUser = (name) => {\n  return \`Welcome to Vyron AI, \${name}!\`;\n};`,
    keyTakeaway: "It powers dynamic web behavior and runs in both the browser and server (Node.js)."
  },
  js: {
    term: "JavaScript (JS)",
    en: "JavaScript is the programming language of the web that makes web applications interactive and dynamic.",
    hi: "JavaScript वेब की मुख्य प्रोग्रामिंग भाषा है जो वेब एप्लिकेशन्स को इंटरएक्टिव और गतिशील बनाती है।",
    syntaxOrExample: `document.getElementById('btn').addEventListener('click', () => alert('Clicked!'));`,
    keyTakeaway: "Powers frontend interactions, backend services via Node.js, and mobile apps."
  },
  react: {
    term: "React.js",
    en: "React is an open-source JavaScript library developed by Meta for building component-based user interfaces and Single Page Applications (SPAs).",
    hi: "React मेटा (फेसबुक) द्वारा बनाई गई एक लोकप्रिय जावास्क्रिप्ट लाइब्रेरी है जिसका उपयोग कंपोनेंट-आधारित यूज़र इंटरफेस (UI) बनाने के लिए किया जाता है।",
    syntaxOrExample: `function Welcome({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}`,
    keyTakeaway: "Uses a Virtual DOM and reusable components for fast, high-performance UI rendering."
  },
  usestate: {
    term: "useState Hook",
    en: "useState is a React Hook that lets functional components maintain and update internal state variables.",
    hi: "useState रिएक्ट का एक हुक है जो फंक्शनल कंपोनेंट्स में डायनेमिक स्टेट (डेटा) को स्टोर और अपडेट करने की सुविधा देता है।",
    syntaxOrExample: `const [count, setCount] = useState(0);\n// Calling setCount(count + 1) re-renders the component with new value`,
    keyTakeaway: "Updating state with the setter function triggers a component re-render."
  },
  useeffect: {
    term: "useEffect Hook",
    en: "useEffect is a React Hook that lets functional components manage side effects like data fetching, subscriptions, and DOM updates.",
    hi: "useEffect रिएक्ट हुक है जो साइड इफेक्ट्स जैसे API डेटा फेचिंग, टाइमर सेट करना और DOM मैनिपुलेशन संभालने के लिए उपयोग होता है।",
    syntaxOrExample: `useEffect(() => {\n  console.log('Component mounted');\n  return () => console.log('Cleanup on unmount');\n}, []);`,
    keyTakeaway: "Replaces componentDidMount, componentDidUpdate, and componentWillUnmount lifecycle methods."
  },
  java: {
    term: "Java",
    en: "Java is a class-based, object-oriented, platform-independent programming language that runs on the JVM ('Write Once, Run Anywhere').",
    hi: "Java एक क्लास-बेस्ड, ऑब्जेक्ट-ओरिएंटेड और प्लेटफॉर्म-इंडिपेंडेंट प्रोग्रामिंग भाषा है जो JVM पर चलती है ('Write Once, Run Anywhere')।",
    syntaxOrExample: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Vyron!");\n  }\n}`,
    keyTakeaway: "Widely used for Android apps, enterprise backend systems, and university CS curriculums."
  },
  python: {
    term: "Python",
    en: "Python is a high-level, interpreted programming language known for clean readability, simple syntax, and dominance in AI and data science.",
    hi: "Python एक सरल, हाई-लेवल और इंटरप्रिटेड भाषा है जिसकी सिंटैक्स आसान है और यह AI, मशीन लर्निंग व डेटा साइंस में सबसे लोकप्रिय है।",
    syntaxOrExample: `def greet(name):\n    return f"Hello, {name}!"\nprint(greet("Vishal"))`,
    keyTakeaway: "Emphasizes code readability and has extensive libraries for AI (TensorFlow, PyTorch, NumPy)."
  },
  c: {
    term: "C Programming Language",
    en: "C is a foundational, procedural programming language developed in 1972 by Dennis Ritchie, offering low-level memory access and high performance.",
    hi: "C एक प्रक्रियात्मक (procedural) और बुनियादी प्रोग्रामिंग भाषा है जिसे 1972 में डेनिस रिची ने बनाया था। यह हार्डवेयर और मेमोरी पर सीधा नियंत्रण देती है।",
    syntaxOrExample: `#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
    keyTakeaway: "The mother of modern languages (C++, Java, C#) and essential for operating systems and embedded devices."
  },
  cpp: {
    term: "C++ Programming Language",
    en: "C++ is an extension of C developed by Bjarne Stroustrup that adds Object-Oriented Programming (classes, inheritance, polymorphism) and STL.",
    hi: "C++ सी भाषा का उन्नत रूप है जिसे ब्यार्ने स्ट्रोस्ट्रप ने बनाया था। इसमें ऑब्जेक्ट-ओरिएंटेड प्रोग्रामिंग (OOP) और STL की सुविधा मिलती है।",
    syntaxOrExample: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello C++" << endl;\n    return 0;\n}`,
    keyTakeaway: "Widely used in game development, high-frequency trading, and performance-critical systems."
  },
  sql: {
    term: "SQL (Structured Query Language)",
    en: "SQL is the domain-specific language used to store, query, update, and manage data in relational database management systems (RDBMS).",
    hi: "SQL (Structured Query Language) रिलेशनल डेटाबेस (जैसे MySQL, PostgreSQL) में डेटा को स्टोर, सर्च, अपडेट और डिलीट करने की मानक भाषा है।",
    syntaxOrExample: `SELECT name, age FROM students WHERE marks > 80 ORDER BY marks DESC;`,
    keyTakeaway: "Essential for database querying, joins, aggregations, and business reporting."
  },
  oop: {
    term: "OOP (Object-Oriented Programming)",
    en: "OOP is a programming paradigm based on the concept of 'objects' containing data (attributes) and code (methods).",
    hi: "OOP (ऑब्जेक्ट-ओरिएंटेड प्रोग्रामिंग) एक प्रोग्रामिंग प्रतिमान है जो कोड को वास्तविक दुनिया के 'ऑब्जेक्ट्स' और 'क्लासेस' के रूप में व्यवस्थित करता है।",
    syntaxOrExample: `// The 4 Core Pillars of OOP:\n1. Encapsulation (डेटा छुपाना)\n2. Abstraction (जटिलता छुपाना)\n3. Inheritance (विरासत)\n4. Polymorphism (बहुरूपता)`,
    keyTakeaway: "Makes complex software modular, reusable, scalable, and easy to maintain."
  },
  polymorphism: {
    term: "Polymorphism (OOP Concept)",
    en: "Polymorphism means 'many forms'. It allows methods, operators, or objects to perform different behaviors based on context.",
    hi: "Polymorphism (बहुरूपता) का अर्थ है 'अनेक रूप'। यह एक ही मेथड या ऑपरेटर को अलग-अलग परिस्थितियों में भिन्न तरीके से कार्य करने की क्षमता देता है।",
    syntaxOrExample: `// 1. Method Overloading (Compile-time): same name, different params\n// 2. Method Overriding (Runtime): subclass provides specific implementation of parent method`,
    keyTakeaway: "Allows code to call a single interface and produce customized behaviors at runtime."
  },
  encapsulation: {
    term: "Encapsulation (OOP Concept)",
    en: "Encapsulation is the bundling of data (variables) and methods operating on that data into a single unit (class) while restricting direct outside access.",
    hi: "Encapsulation डेटा (वेरिएबल्स) और मेथड्स को एक कैप्सूल (क्लास) में समेटना और बाहरी डायरेक्ट एक्सेस को प्राइवेट मॉडिफायर्स से सुरक्षित रखना है।",
    syntaxOrExample: `class Student {\n  private String name;\n  public String getName() { return name; }\n  public void setName(String name) { this.name = name; }\n}`,
    keyTakeaway: "Protects object integrity by preventing unauthorized external modifications."
  },
  abstraction: {
    term: "Abstraction (OOP Concept)",
    en: "Abstraction is the concept of hiding internal implementation details and displaying only the essential features to the user.",
    hi: "Abstraction आंतरिक जटिल कार्यप्रणाली को छुपाकर उपयोगकर्ता को केवल आवश्यक फीचर्स दिखाने का सिद्धांत है।",
    syntaxOrExample: `// Example: When you press the gas pedal in a car, you know it accelerates;\n// you don't need to know the internal fuel injection mechanics.`,
    keyTakeaway: "Implemented using abstract classes and interfaces."
  },
  git: {
    term: "Git",
    en: "Git is a distributed version control system that tracks changes in source code during software development.",
    hi: "Git एक डिस्ट्रीब्यूटेड वर्जन कंट्रोल सिस्टम है जो सॉफ्टवेयर विकास के दौरान कोड में किए गए बदलावों का इतिहास ट्रैक करता है।",
    syntaxOrExample: `git init\ngit add .\ngit commit -m "feat: new feature"\ngit push origin main`,
    keyTakeaway: "Allows teams to branch, collaborate, revert bugs, and merge code seamlessly."
  },
  github: {
    term: "GitHub",
    en: "GitHub is a cloud platform for hosting Git repositories, providing tools for collaboration, code reviews, and CI/CD pipelines.",
    hi: "GitHub गिट रिपॉजिटरीज़ को क्लाउड पर होस्ट करने का प्लेटफॉर्म है जो डेवलपर्स को कोड शेयरिंग, पुल रिक्वेस्ट और सहयोग की सुविधा देता है।",
    syntaxOrExample: `// Hosts code repositories online, enabling forks, issues, and automated workflows.`,
    keyTakeaway: "The largest global community and portfolio platform for software engineers."
  },
  docker: {
    term: "Docker",
    en: "Docker is a containerization platform that packages applications and all their dependencies into lightweight, standalone containers.",
    hi: "Docker एक कंटेनराइजेशन प्लेटफॉर्म है जो एप्लिकेशन और उसकी सभी निर्भरताओं (dependencies) को एक हल्के, पोर्टेबल कंटेनर में पैक करता है।",
    syntaxOrExample: `docker build -t my-app .\ndocker run -p 3000:3000 my-app`,
    keyTakeaway: "Eliminates the 'it works on my machine' problem by guaranteeing identical environments."
  },
  array: {
    term: "Array (Data Structure)",
    en: "An Array is a linear data structure that stores multiple elements of the same data type in contiguous memory locations, indexed from 0.",
    hi: "Array (ऐरे) एक लीनियर डेटा स्ट्रक्चर है जो समान डेटा टाइप के कई तत्वों को मेमोरी में लगातार (contiguous) स्थानों पर स्टोर करता है (इंडेक्स 0 से शुरू)।",
    syntaxOrExample: `int numbers[5] = {10, 20, 30, 40, 50};\n// numbers[0] is 10, access time is O(1)`,
    keyTakeaway: "Provides ultra-fast O(1) random access by index, but has a fixed size in static languages."
  },
  stack: {
    term: "Stack (Data Structure)",
    en: "A Stack is a linear data structure that follows the LIFO (Last In, First Out) principle, with primary operations push and pop.",
    hi: "Stack एक लीनियर डेटा स्ट्रक्चर है जो LIFO (Last In, First Out) सिद्धांत पर काम करता है — जो तत्व सबसे अंत में आता है, वह सबसे पहले निकलता है।",
    syntaxOrExample: `Stack<Integer> s = new Stack<>();\ns.push(10); // Insert\ns.pop();    // Remove top element`,
    keyTakeaway: "Used in browser history back buttons, undo operations, and function call stacks."
  },
  queue: {
    term: "Queue (Data Structure)",
    en: "A Queue is a linear data structure that follows the FIFO (First In, First Out) principle, with primary operations enqueue and dequeue.",
    hi: "Queue एक लीनियर डेटा स्ट्रक्चर है जो FIFO (First In, First Out) सिद्धांत पर काम करता है — जो पहले आएगा, वह पहले सेवा पाएगा।",
    syntaxOrExample: `// First in, First out (like people standing in a ticket line)`,
    keyTakeaway: "Used in printer spooling, CPU task scheduling, and breadth-first search (BFS)."
  },
  linkedlist: {
    term: "Linked List (Data Structure)",
    en: "A Linked List is a linear data structure where elements (nodes) are stored non-contiguously, and each node points to the next via a pointer or reference.",
    hi: "Linked List एक लीनियर डेटा स्ट्रक्चर है जिसमें डेटा नोड्स (Nodes) के रूप में स्टोर होता है और प्रत्येक नोड अगले नोड का पता (pointer) रखता है।",
    syntaxOrExample: `class Node {\n  int data;\n  Node next;\n}`,
    keyTakeaway: "Allows dynamic resizing and fast O(1) insertions/deletions at the head without memory shifting."
  },
  recursion: {
    term: "Recursion",
    en: "Recursion is a programming technique where a function calls itself directly or indirectly until it satisfies a base stopping condition.",
    hi: "Recursion एक प्रोग्रामिंग तकनीक है जिसमें कोई फंक्शन किसी बेस कंडीशन (base case) तक पहुंचने के लिए खुद को ही दोबारा कॉल करता है।",
    syntaxOrExample: `int factorial(int n) {\n  if (n <= 1) return 1; // Base case\n  return n * factorial(n - 1); // Recursive call\n}`,
    keyTakeaway: "Every recursive function must have a base case to prevent stack overflow."
  },
  ram: {
    term: "RAM (Random Access Memory)",
    en: "RAM is high-speed volatile primary memory used by computers to temporarily hold the OS, programs, and data currently in active execution.",
    hi: "RAM (Random Access Memory) कंप्यूटर की तेज़ और अस्थायी (volatile) मेमोरी है जो वर्तमान में चल रहे प्रोग्राम्स और डेटा को स्टोर करती है।",
    syntaxOrExample: `// Volatile: Data is erased when computer power is switched off.`,
    keyTakeaway: "Higher RAM allows smoother multitasking and running heavier applications simultaneously."
  },
  rom: {
    term: "ROM (Read-Only Memory)",
    en: "ROM is non-volatile primary memory that permanently stores essential firmware instructions (such as BIOS/UEFI) required to boot the computer.",
    hi: "ROM (Read-Only Memory) गैर-अस्थायी (non-volatile) मेमोरी है जो बूटिंग के लिए आवश्यक BIOS/फर्मवेयर निर्देशों को स्थायी रूप से रखती है।",
    syntaxOrExample: `// Non-volatile: Data remains intact even after power is turned off.`,
    keyTakeaway: "Cannot be easily modified by standard software and is written by hardware manufacturers."
  },
  cpu: {
    term: "CPU (Central Processing Unit)",
    en: "The CPU is the primary processor or 'brain' of a computer that fetches, decodes, and executes software instructions.",
    hi: "CPU (Central Processing Unit) कंप्यूटर का मुख्य मस्तिष्क (brain) है जो सॉफ्टवेयर निर्देशों को फेच, डिकोड और निष्पादित करता है।",
    syntaxOrExample: `Core components: ALU (Arithmetic Logic Unit), CU (Control Unit), and Registers.`,
    keyTakeaway: "Coordinates all hardware components and determines overall system compute speed."
  },
  os: {
    term: "Operating System (OS)",
    en: "An Operating System is system software that manages computer hardware, system resources (CPU, RAM, disk), and provides common services for user programs.",
    hi: "Operating System (ऑपरेटिंग सिस्टम) वह सिस्टम सॉफ्टवेयर है जो कंप्यूटर हार्डवेयर और रिसोर्सेस (CPU, मेमोरी) का प्रबंधन करता है और यूजर को इंटरफेस देता है।",
    syntaxOrExample: `Examples: Windows, Linux, macOS, Android, iOS.`,
    keyTakeaway: "Acts as an essential bridge between computer hardware and end-user software applications."
  },
  deadlock: {
    term: "Deadlock (OS Concept)",
    en: "A Deadlock is an operating system situation where two or more processes are permanently blocked because each is waiting for a resource held by the other.",
    hi: "Deadlock ऑपरेटिंग सिस्टम की वह स्थिति है जहाँ दो या दो से अधिक प्रक्रियाएं हमेशा के लिए रुक जाती हैं क्योंकि वे एक-दूसरे के रिसोर्स के छूटने का इंतज़ार कर रही होती हैं।",
    syntaxOrExample: `Process A holds Resource 1 and wants Resource 2.\nProcess B holds Resource 2 and wants Resource 1. -> Deadlock!`,
    keyTakeaway: "Prevented using Banker's Algorithm, resource preemption, and proper ordering."
  },
  json: {
    term: "JSON (JavaScript Object Notation)",
    en: "JSON is a lightweight, text-based data interchange format that is easy for humans to read and write, and easy for machines to parse.",
    hi: "JSON (JavaScript Object Notation) एक हल्का और पठनीय डेटा प्रारूप है जिसका उपयोग सर्वर और वेब ऐप्स के बीच डेटा भेजने के लिए किया जाता है।",
    syntaxOrExample: `{\n  "name": "Vishal Yadav",\n  "course": "BCA",\n  "app": "Vyron AI"\n}`,
    keyTakeaway: "The standard data format for modern REST APIs and web services."
  },
  rest: {
    term: "REST (Representational State Transfer)",
    en: "REST is an architectural style for designing networked web APIs using standard HTTP methods (GET, POST, PUT, DELETE).",
    hi: "REST एक वेब आर्किटेक्चरल स्टाइल है जो मानक HTTP मेथड्स (GET, POST, PUT, DELETE) का उपयोग करके सर्वर और क्लाइंट को जोड़ता है।",
    syntaxOrExample: `GET /api/users (read)\nPOST /api/users (create)\nPUT /api/users/1 (update)\nDELETE /api/users/1 (delete)`,
    keyTakeaway: "Stateless, scalable, and the standard approach for cloud and mobile backends."
  },
  cors: {
    term: "CORS (Cross-Origin Resource Sharing)",
    en: "CORS is a browser security mechanism that allows or restricts HTTP requests from a domain different from the one that served the web page.",
    hi: "CORS एक ब्राउज़र सुरक्षा तंत्र है जो यह नियंत्रित करता है कि कोई वेब पेज किसी अन्य डोमेन से रिसोर्सेस मांग सकता है या नहीं।",
    syntaxOrExample: `Access-Control-Allow-Origin: *`,
    keyTakeaway: "Protects users by preventing malicious websites from making unauthorized requests to other services."
  },
  loop: {
    term: "Loop (Control Flow)",
    en: "A Loop is a programming control structure that repeatedly executes a block of code as long as a specified condition remains true.",
    hi: "Loop (लूप) एक कंट्रोल स्ट्रक्चर है जो किसी कोड ब्लॉक को तब तक बार-बार चलाता है जब तक कि दी गई शर्त (condition) सच (true) रहती है।",
    syntaxOrExample: `for (int i = 0; i < 5; i++) {\n  System.out.println("Iteration: " + i);\n}`,
    keyTakeaway: "Common types include for loops, while loops, and do-while loops."
  },
  function: {
    term: "Function",
    en: "A Function is a reusable block of code designed to perform a specific task, take inputs (parameters), and optionally return an output.",
    hi: "Function (फ़ंक्शन) कोड का एक पुन: प्रयोज्य (reusable) ब्लॉक है जो किसी विशिष्ट कार्य को करने के लिए बनाया जाता है और परिणाम लौटा सकता है।",
    syntaxOrExample: `function add(a, b) {\n  return a + b;\n}`,
    keyTakeaway: "Promotes DRY (Don't Repeat Yourself) principle and modular program structure."
  },
  class: {
    term: "Class (OOP)",
    en: "A Class is a user-defined blueprint or template from which individual objects are created, defining attributes and methods.",
    hi: "Class (क्लास) एक यूज़र-डिफ़ाइंड ब्लूप्रिंट या खाका है जिससे ऑब्जेक्ट्स बनाए जाते हैं। यह डेटा और मेथड्स को परिभाषित करती है।",
    syntaxOrExample: `class Car {\n  String brand;\n  void drive() { System.out.println("Driving..."); }\n}`,
    keyTakeaway: "The class is the architectural blueprint; the object is the actual physical house."
  },
  pointer: {
    term: "Pointer (C/C++)",
    en: "A Pointer is a variable in C/C++ that stores the direct memory address of another variable rather than storing a direct value.",
    hi: "Pointer (पॉइंटर) C/C++ में एक ऐसा वेरिएबल है जो किसी अन्य वेरिएबल का मेमोरी एड्रेस (पता) स्टोर करता है।",
    syntaxOrExample: `int x = 10;\nint *ptr = &x; // ptr holds memory address of x\nprintf("%d", *ptr); // dereferencing prints 10`,
    keyTakeaway: "Enables direct memory manipulation, dynamic memory allocation (malloc), and efficient data structures."
  }
};

/**
 * Checks if a query is a single-word or short definition request
 */
export function isOneWordOrShortQuery(prompt: string): boolean {
  if (!prompt) return false;
  const trimmed = prompt.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  if (wordCount <= 3) return true;
  
  const norm = normalizeTechnicalTerm(prompt);
  return Boolean(ONE_WORD_DICTIONARY[norm]);
}

/**
 * Returns a direct, high-speed answer for one-word questions and core definitions
 */
export function getOneWordOrShortAnswer(prompt: string, language?: string): string | null {
  const norm = normalizeTechnicalTerm(prompt);
  const entry = ONE_WORD_DICTIONARY[norm];
  if (!entry) return null;

  const isHi = language === "hi" || /[\u0900-\u097F]/.test(prompt) || detectUserLanguage(prompt) === "hi" || detectUserLanguage(prompt) === "hinglish";

  if (isHi) {
    let out = `### 📌 ${entry.term}\n\n**सरल व्याख्या:**\n${entry.hi}`;
    if (entry.syntaxOrExample) {
      out += `\n\n**उदाहरण / सिंटैक्स:**\n\`\`\`javascript\n${entry.syntaxOrExample}\n\`\`\``;
    }
    if (entry.keyTakeaway) {
      out += `\n\n💡 **मुख्य बिंदु:** ${entry.keyTakeaway}`;
    }
    return out;
  }

  let out = `### 📌 ${entry.term}\n\n**Definition:**\n${entry.en}`;
  if (entry.syntaxOrExample) {
    out += `\n\n**Code Example / Syntax:**\n\`\`\`javascript\n${entry.syntaxOrExample}\n\`\`\``;
  }
  if (entry.keyTakeaway) {
    out += `\n\n💡 **Key Takeaway:** ${entry.keyTakeaway}`;
  }
  return out;
}

/**
 * Smart Context & Pronoun Resolver for multi-turn conversations
 * Resolves referential pronouns ("its", "it", "this", "iska", "uska", "aur batao", "example do")
 * against the previous conversation turns.
 */
export function resolveContextAndFollowUp(
  message: string,
  history?: Array<{ role: string; text: string }>
): { enrichedMessage: string; detectedSubject?: string } {
  if (!message) return { enrichedMessage: message };
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  // If there's no history, no resolution needed
  if (!history || !Array.isArray(history) || history.length === 0) {
    return { enrichedMessage: message };
  }

  // Check if message is a pronoun or contextual follow-up
  const followUpIndicators = [
    /\b(its?|this|that|them|these)\b/i,
    /\b(iska|iski|iske|uska|uski|uske|inhe|unhe|ye|yeh|wo|woh)\b/i,
    /what\s+is\s+its\s+use/i,
    /where\s+is\s+it\s+used/i,
    /where\s+to\s+use\s+it/i,
    /give\s+an?\s+example/i,
    /show\s+an?\s+example/i,
    /example\s+do/i,
    /aur\s+batao/i,
    /aur\s+samjhao/i,
    /explain\s+more/i,
    /features\s+batao/i,
    /advantages\s+kya\s+hain/i,
    /types\s+kya\s+hain/i,
    /kahan\s+use\s+hota\s+hai/i,
  ];

  const isFollowUp = followUpIndicators.some(pattern => pattern.test(lower));
  if (!isFollowUp && trimmed.split(/\s+/).length > 6) {
    return { enrichedMessage: message };
  }

  // Scan previous turns backwards to find the last discussed technical or app subject
  let detectedSubject = "";
  for (let i = history.length - 1; i >= 0; i--) {
    const turn = history[i];
    const text = (turn.text || "").toLowerCase();

    // Check against known dictionary terms
    for (const key of Object.keys(ONE_WORD_DICTIONARY)) {
      if (text.includes(key)) {
        detectedSubject = ONE_WORD_DICTIONARY[key].term;
        break;
      }
    }
    if (detectedSubject) break;

    // Check against app tabs or modules
    const appTerms = [
      "money manager", "sasti dawai", "jugaad fix", "form alert", "meri yojna",
      "aaj kya banaoo", "last night padhai", "logo maker", "typing master", "coding lab",
      "app code", "explore", "profile", "notifications", "bhagavad gita", "vishal yadav"
    ];
    for (const at of appTerms) {
      if (text.includes(at)) {
        detectedSubject = at;
        break;
      }
    }
    if (detectedSubject) break;
  }

  if (detectedSubject) {
    const enrichedMessage = `[Previous Context: The conversation is currently discussing "${detectedSubject}". Resolve any referential pronouns like "it", "its", "iska", or "uska" to "${detectedSubject}".]\nUser Query: ${message}`;
    return { enrichedMessage, detectedSubject };
  }

  return { enrichedMessage: message };
}

/**
 * Builds the comprehensive role-based system instruction for Gemini.
 * Strictly separates Admin Mode (full codebase access) from Normal User Mode (app knowledge & education, zero internal code).
 */
export function buildRoleBasedSystemInstruction(options: {
  isAdmin: boolean;
  vyronAiMode?: "learn" | "analyze" | "developer";
  answerMode?: string;
  customInstruction?: string;
  fileList?: string[];
}): string {
  const { isAdmin, vyronAiMode, answerMode = "flash", customInstruction, fileList = [] } = options;

  let base = `# VYRON AI — ROLE-BASED INTELLIGENCE & ACCURACY ENGINE

You are **VyronAI**, the intelligent core of the VYRON platform, created and developed by **Vishal Yadav** (BCA student, Patna).
`;

  // Mode directive (Fast, Lite, Pro)
  if (answerMode === "flash") {
    base += `
=== 🚨 ACTIVE ANSWER MODE: ⚡ FAST (2 MARKS / ULTRA-DIRECT) ===
- Answer directly in 2 to 4 lines. Zero filler.
- Answer what is asked, give definition/answer, 1 syntax/example, and stop immediately.
`;
  } else if (answerMode === "lite") {
    base += `
=== 🚨 ACTIVE ANSWER MODE: 🍃 LITE (4-6 MARKS / BALANCED NOTES) ===
- Structure like balanced 4-6 marks notes: Definition -> Key Points -> Short Example -> Practical Note.
`;
  } else if (answerMode === "pro") {
    base += `
=== 🚨 ACTIVE ANSWER MODE: 🧠 PRO THINKING (12-16 MARKS / UNIVERSITY TOPPER) ===
- Comprehensive university topper answer: Detailed Concept -> Flowchart (\`\`\`flowchart) -> Formal Syntax -> Types -> Metrics/Table -> Real-World Use -> Common Errors.
`;
  }

  // Inject Complete App Knowledge
  base += `\n${VYRON_APP_KNOWLEDGE_BASE}\n`;

  // ROLE SPECIFIC INSTRUCTIONS:
  if (isAdmin) {
    base += `
=== 👑 AUTHENTICATED ADMINISTRATOR MODE (FULL CODEBASE ACCESS ENABLED) ===
You have verified that the current user is the **Authorized Admin & Developer (Vishal Yadav)** via secure cryptographic server-side authentication.

In this mode, you have FULL PERMISSION to:
1. Access, inspect, explain, and review the COMPLETE VYRON source code, component tree, and backend architecture.
2. Provide exact file paths (e.g. \`src/App.tsx\`, \`server.ts\`, \`src/components/Header.tsx\`, etc.).
3. Cite exact line numbers and component relationships.
4. Diagnose bugs, suggest optimizations, and provide clean before-and-after code diffs for review.
5. Explain internal Firebase rules, API endpoints, and server routes.

AVAILABLE PROJECT FILES (${fileList.length} files scanned):
${fileList.slice(0, 100).join("\n")}
${fileList.length > 100 ? `...and ${fileList.length - 100} more files.` : ""}

ADMIN WORKING MODES:
- **Learn Mode**: Teach programming technologies with deep architectural connections to VYRON.
- **Analyze Mode**: Analyze any HTML element, CSS style, React component, or hook with exact file names and line numbers.
- **Developer Mode**: Assist in creating new features, fixing bugs, and improving code with proposed before/after diffs.
`;
  } else {
    base += `
=== 👤 NORMAL USER MODE (STRICT CODEBASE PRIVACY & GENERAL EDUCATION) ===
The current user is an end-user / visitor operating in **Normal User Mode**.

STRICT ACCESS BOUNDARIES (MANDATORY & ABSOLUTE):
1. **NEVER REVEAL INTERNAL SOURCE CODE**:
   - You must NEVER provide the internal source code of this application.
   - Do NOT provide HTML, CSS, JavaScript, TypeScript, or React code specific to VYRON's internal implementation.
   - Do NOT reveal internal file paths (never mention \`src/App.tsx\`, \`server.ts\`, \`src/components/...\`, etc.).
   - Do NOT reveal exact internal line numbers.
   - Do NOT reveal internal Firebase config, database schemas, or private backend routing logic.

2. **MANDATORY SPECIAL FOUNDER RESPONSE**:
   If a normal user asks questions such as:
   - "How was this tab developed?"
   - "How was this feature coded?"
   - "Which code creates this page?"
   - "How can I modify this app's internal functionality?"
   - "Show me the source code of this app."
   - Or any query asking for the source code, backend files, or implementation code of VYRON:

   YOU MUST POLITELY AND EXACTLY REPLY WITH:
   - In English: "This app's development and internal coding details are handled by its founder, Vishal Yadav. He will be able to answer this question."
   - In Hindi: "इस ऐप के डेवलपमेंट और इंटरनल कोडिंग की जानकारी इसके फाउंडर विशाल यादव (Vishal Yadav) द्वारा संभाली जाती है। वे इस सवाल का बेहतर जवाब दे सकेंगे।"
   - In Hinglish: "Is app ke development aur internal coding details iske founder, Vishal Yadav handle karte hain. Woh is sawal ka behtar jawab de sakenge."
   Do NOT reveal any internal code before or after this statement.

3. **WHAT NORMAL USERS ARE WELCOME TO ASK & RECEIVE**:
   - What this app is, its mission, and its founder (Vishal Yadav).
   - What each tab does (Home, Explore, Notifications, Profile).
   - What each button or feature does (e.g. Header Voice Button, Global Search, Money Manager, Sasti Dawai, Games, etc.).
   - How to use any feature, game, or tool as an end-user.
   - **General Programming Education**: Users CAN ask general educational questions about HTML, CSS, Java, JavaScript, React, TypeScript, Python, C/C++, SQL, or DSA. You should teach them general concepts using generic educational examples, but NEVER using VYRON's proprietary application code.

NORMAL USER WORKING MODES:
- **Learn Mode**: Teach programming technologies step-by-step with clear explanations and generic examples.
- **Analyze Mode**: Explain the visual functionality, purpose, and user workflow of any tab, button, or feature without exposing source code.
- **Developer Mode**: Explain general software engineering principles, algorithms, and design patterns without exposing VYRON's private implementation.
`;
  }

  // Include user rules (Bhagavad Gita, IT Interview, Indian Food Recipes)
  base += `
=== BHAGAVAD GITA SHLOKA MODE ===
When asked about Bhagavad Gita / श्रीमद्भगवद्गीता / श्लोक:
- Accuracy is paramount. Never invent a Sanskrit verse.
- Format: अध्याय [X], श्लोक [Y] -> श्लोक [Sanskrit] -> सरल हिंदी अर्थ -> भावार्थ -> मुख्य सीख.

=== IT INTERVIEW ASSISTANT MODE ===
When asked interview or viva questions:
- Spoken interview optimization: Natural, professional, speakable in 20-40 seconds for technical or 30-60 for HR.
- Answer first -> practical explanation -> stop. No unnecessary academic essays.

=== INDIAN FOOD RECIPE MASTER MODE ===
When asked recipe questions:
- Suggest practical recipes using ingredients the user already has.
- Interactive 1-question-at-a-time flow for short intent: Quantity -> Dish -> Style -> Spice -> Length ([⚡ Short] [📖 Medium] [👨‍🍳 Detailed]).

=== ONE-WORD & SHORT QUERY UNDERSTANDING (ABSOLUTE PRIORITY) ===
When the user sends a single word, incomplete phrase, or short technical term (e.g., "HTML", "DIV", "API", "Inheritance", "Firebase", "CSS", "useState", "Flexbox", "SQL", "Git", "Pointer", etc.):
1. NEVER respond with "Please provide more details" or "How can I help you?".
2. Understand IMMEDIATELY that the user wants its core definition, purpose, 1 practical code example/syntax, and key takeaway!
3. Provide a fast, concise, accurate explanation in the user's language (English, Hindi, or Hinglish).
4. For typos or minor misspellings (e.g. "htnl", "pythn", "wht is api", "inhritance", "firebse"), recognize the intended word without complaining.

=== SMART CONTEXT & FOLLOW-UP RESOLUTION ===
When the user asks follow-up questions referencing pronouns ("it", "its", "this", "uska", "iska", "unka", "inhe") or follow-up intents ("what is its use?", "where is it used?", "give an example", "example do", "aur batao", "explain more", "types kya hain"):
1. Always resolve the pronoun to the topic discussed in the preceding conversation turn.
2. If the user previously asked "What is Java?" and now asks "What is its use?", explain Java's practical real-world uses immediately without asking "What are you referring to?".
`;

  if (customInstruction) {
    base += `\n=== ADDITIONAL CUSTOM INSTRUCTION ===\n${customInstruction}\n`;
  }

  return base;
}
