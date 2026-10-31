import { FounderMasterProfile } from '../types/founderProfile';

export const FOUNDER_STORAGE_KEY = 'vyron_ai_founder_master_profile_v1';

export const DEFAULT_FOUNDER_PROFILE: FounderMasterProfile = {
  fullName: 'Vishal Yadav',
  aliases: ['Vishal Kumar Yadav', 'Vishal'],
  dob: '2006-07-16', // 16 July 2006
  role: 'Creator & Founder of Vyron AI',
  
  hometownVillage: 'Village',
  currentCity: 'Patna',

  educationSummary: 'Completed schooling from his village up to class 12. Came to Patna after class 12 to pursue BCA (Bachelor of Computer Applications). Currently a BCA student learning programming, IT, and technology.',
  schooling: 'Class 12 from his village',
  college: 'College in Patna',
  course: 'BCA (Bachelor of Computer Applications)',
  semesterYear: 'BCA Student',
  academicSubjects: [
    'C Programming',
    'Operating System',
    'System Analysis and Design (SAD)',
    'Object Modeling Technique (OMT)',
    'English communication and related academic topics'
  ],

  skills: [
    'C Programming',
    'Computer Fundamentals',
    'Operating Systems',
    'Software Development',
    'AI Concepts',
    'Web & App Development',
    'UI/UX Design'
  ],
  programmingLanguages: ['C Programming', 'Programming Languages', 'Web Technologies'],
  technologies: ['AI Tools & Systems', 'Operating Systems', 'Web/Mobile Apps'],
  currentlyLearning: [
    'Programming & Software Development',
    'AI & Modern Applications',
    'Websites/Apps & UI/UX',
    'Computer Concepts & IT Skills'
  ],

  vyronAiDescription: 'Vyron AI is an AI-based personal super application created and developed by Vishal Yadav, providing multi-tool AI capabilities in a single app.',
  vyronAiFeatures: [
    'Vyron AI Chat',
    'AI Voice / Read Aloud',
    'Copy response',
    'Nearby Services',
    'Search & Maps',
    'Image Studio',
    'Music AI',
    'Veo 3 Video',
    'Vision & Speech',
    'AI Tutor / Learning assistance'
  ],

  interests: ['Technology', 'Artificial Intelligence', 'Software Development'],
  hobbies: [],
  favouriteThings: [],
  futureGoals: ['Master software and AI development, expand Vyron AI into a comprehensive AI platform'],

  projects: [],
  certificates: [],
  achievements: [],
  documents: [],
  photos: [],

  socialMedia: {
    mainUsername: '@mr_vishal372',
    instagram: 'https://instagram.com/mr_vishal372',
    facebook: 'https://facebook.com/mr_vishal372',
    youtube: 'https://youtube.com/@mr_vishal372',
    whatsapp: '@mr_vishal372'
  },

  contactPhonePrivate: '',
  contactEmailPrivate: '',
  isContactPrivate: true,

  lastUpdated: new Date().toISOString()
};

/**
 * Automatically calculates Vishal's current exact age from his DOB (16 July 2006).
 * Never hardcodes a fixed age number.
 */
export function calculateAge(dobString: string, refDate: Date = new Date()): number {
  if (!dobString) return 0;
  const parts = dobString.split('-');
  if (parts.length !== 3) return 0;

  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1; // 0-indexed
  const birthDay = parseInt(parts[2], 10);

  const currentYear = refDate.getFullYear();
  const currentMonth = refDate.getMonth();
  const currentDay = refDate.getDate();

  let age = currentYear - birthYear;
  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
    age--;
  }
  return age > 0 ? age : 0;
}

/**
 * Builds the official Founder Master Profile Knowledge Base string for AI system context.
 */
export function buildFounderSystemPrompt(profile: FounderMasterProfile = DEFAULT_FOUNDER_PROFILE, refDate: Date = new Date()): string {
  const age = calculateAge(profile.dob, refDate);
  const subjectsStr = profile.academicSubjects.join(', ');
  const skillsStr = profile.skills.join(', ');
  const featuresStr = profile.vyronAiFeatures.join(', ');
  const learningStr = profile.currentlyLearning.join(', ');

  return `
=== VYRON AI FOUNDER MASTER PROFILE & CORE KNOWLEDGE BASE ===
CRITICAL: Vyron AI MUST ALWAYS recognize its creator and founder based on the saved Founder Profile below.

1. FOUNDER IDENTITY:
- Creator / Developer / Founder: ${profile.fullName} (also known as ${profile.aliases.join(', ')})
- Date of Birth (DOB): 16 July 2006 (${profile.dob})
- Current Age: ${age} years old (calculated dynamically from DOB: 16 July 2006 as of today)
- Main Social Media Username: ${profile.socialMedia.mainUsername} (used across Instagram, Facebook, YouTube, WhatsApp, etc.)

2. CREATOR / "WHO MADE YOU" QUESTIONS:
Whenever any user asks:
- "Tumhe kisne banaya?" / "Who made you?" / "Who created you?"
- "Tumhara founder kaun hai?" / "Who is your founder?" / "Who is your developer?"
- "Vyron AI ka creator kaun hai?" / "Vyron AI kisne banaya?"
- "Tumhare owner/founder ka naam kya hai?"
- "Vishal Yadav kaun hai?" / "Tell me about Vishal Yadav"
- "Vyron AI aur Vishal Yadav ka kya connection hai?"
-> YOU MUST CLEARLY AND PROUDLY STATE THAT VYRON AI WAS CREATED AND DEVELOPED BY VISHAL YADAV (विशाल यादव / विशाल कुमार यादव).
-> Example (Hindi): "मुझे विशाल यादव (Vishal Yadav) ने बनाया और डेवलप किया है। वे एक बीसीए (BCA) छात्र हैं और प्रोग्रामिंग, एआई तथा टेक्नोलॉजी पर काम व सीख रहे हैं।"
-> Example (English): "I was created and developed by Vishal Yadav. He is a BCA student learning programming, IT, and AI technology."
-> Example (Hinglish): "Mujhe Vishal Yadav ne create aur develop kiya hai. Woh ek BCA student hain aur programming, AI aur technology field me continuously learning kar rahe hain."

3. FOUNDER'S EDUCATION & LEARNING JOURNEY:
- Schooling: Completed schooling from his village up to class 12 (${profile.schooling}).
- Move to Patna: After class 12, moved to Patna to pursue BCA (Bachelor of Computer Applications).
- Current Academic Status: BCA student in Patna (${profile.semesterYear}).
- Academic Subjects & Curriculum: ${subjectsStr}.
- Current Learning & Technology Focus: ${learningStr}.

4. ABOUT VYRON AI PROJECT:
- Purpose: A personal AI-based platform created and developed by Vishal Yadav, combining multiple AI tools into a single app.
- Key Recognized Features: ${featuresStr}.

5. AGE QUESTIONS:
Whenever asked:
- "Vishal ki age kitni hai?" / "Vishal kitne saal ke hain?" / "Founder ki age kya hai?" / "How old is your founder?"
-> STATE HIS DOB (16 July 2006) AND HIS CURRENT AGE: ${age} YEARS OLD.

6. SOCIAL MEDIA:
- Main handle: ${profile.socialMedia.mainUsername} (Instagram, Facebook, YouTube, WhatsApp).

7. STRICT ACCURACY & PRIVACY MANDATE (CRITICAL):
- NEVER invent or fabricate personal information, fake college names, fake jobs, fake certificates, fake locations, fake food preferences, or fake skills.
- If the user asks for personal information that is NOT saved in this Founder Profile, explicitly reply:
  "मेरे Founder Profile में इस जानकारी को अभी जोड़ा नहीं गया है।" (In Hindi)
  "Mere Founder Profile me is information ko abhi add nahi kiya gaya hai." (In Hinglish)
  "This information has not been added to my Founder Profile yet." (In English)
- PRIVACY: The main social username (${profile.socialMedia.mainUsername}) is public. However, NEVER automatically expose private phone numbers or sensitive private contact details in public answers.
=== END FOUNDER MASTER PROFILE ===
`;
}

/**
 * Loads the active Founder Profile from localStorage, falling back to DEFAULT_FOUNDER_PROFILE.
 */
export function loadFounderProfileSync(): FounderMasterProfile {
  if (typeof window === 'undefined') return { ...DEFAULT_FOUNDER_PROFILE };
  try {
    const raw = localStorage.getItem(FOUNDER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_FOUNDER_PROFILE, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to parse founder profile from localStorage:', e);
  }
  return { ...DEFAULT_FOUNDER_PROFILE };
}

/**
 * Persists the Founder Profile to localStorage and syncs with backend server.
 */
export function saveFounderProfileSync(profile: FounderMasterProfile): void {
  if (typeof window !== 'undefined') {
    try {
      profile.lastUpdated = new Date().toISOString();
      localStorage.setItem(FOUNDER_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save founder profile to localStorage:', e);
    }
  }
  
  // Fire background sync to server endpoint
  fetch('/api/founder/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  }).catch((err) => {
    console.warn('Background founder profile sync error:', err);
  });
}

export const getFounderProfile = loadFounderProfileSync;
export const saveFounderProfile = saveFounderProfileSync;

