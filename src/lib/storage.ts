import { UserProfile, MoneyRecord, MedicineReminder, RecipeItem, JugaadItem, SchemeItem, HistoryItem, NotificationItem } from '../types';
import { DEFAULT_AVATAR_DATA_URI } from './defaultAvatar';
import { hasAdminSession } from './adminAuth';

const STORAGE_KEY = 'bharatjugaad_user_profile_v1';
const NOTIF_KEY = 'bharatjugaad_notifications_v1';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: '',
  email: '',
  mobile: '',
  state: 'Madhya Pradesh',
  district: 'Indore',
  aboutMe: 'Passionate about AI solutions for everyday Indian challenges and local empowerment.',
  avatarUrl: DEFAULT_AVATAR_DATA_URI,
  occupation: 'Student / Freelancer',
  incomeCategory: '1L - 3L / Year',
  age: 23,
  gender: 'Male',
  language: 'en',
  theme: 'light',
  notificationsEnabled: true,
  reducedMotion: false,
  savedRecipes: [
    {
      id: 'r1',
      title: 'Quick Leftover Roti Chivda',
      titleHindi: 'बची हुई रोटी का चटपटा चिवड़ा',
      prepTime: '10 mins',
      servings: '2',
      diet: 'veg',
      ingredients: ['3 leftover Rotis', '1 Onion', 'Mustard seeds', 'Curry leaves', 'Chili powder', 'Lemon'],
      instructions: [
        'Tear leftover rotis into small bite-sized pieces.',
        'Heat oil in a pan, pop mustard seeds, green chilies & curry leaves.',
        'Sauté sliced onions until golden brown.',
        'Add roti pieces, salt, turmeric, and chili powder. Toss for 3 minutes.',
        'Finish with fresh lemon juice and coriander!'
      ],
      jugaadTip: 'Sprinkle 1 tsp curd or water while tossing so stale roti becomes super soft!'
    }
  ],
  savedMedicines: [
    {
      id: 'm1',
      brandName: 'Dolo 650 / Crocin',
      saltName: 'Paracetamol 650mg',
      genericAlternative: 'Jan Aushadhi Paracetamol 650mg',
      priceBrand: 32,
      priceGeneric: 6,
      savingsPercentage: 81,
      useCase: 'Fever and Mild Pain Relief'
    }
  ],
  savedReminders: [
    {
      id: 'rem1',
      medicineName: 'Multivitamin / B-Complex',
      dosage: '1 Tablet after Breakfast',
      time: '09:00',
      days: ['Mon', 'Wed', 'Fri'],
      active: true
    }
  ],
  studyProgress: [
    {
      id: 'sp1',
      topic: 'Indian Constitution - Fundamental Rights',
      completedPercent: 85,
      quizScore: 90,
      lastStudied: 'Today, 2:30 PM'
    }
  ],
  savedSchemes: [
    {
      id: 's1',
      title: 'PM Kisan Samman Nidhi',
      titleHindi: 'पीएम किसान सम्मान निधि',
      ministry: 'Ministry of Agriculture',
      benefits: '₹6,000 / Year direct bank transfer in 3 installments',
      targetAudience: 'Small & marginal farmers',
      documents: ['Aadhaar Card', 'Land Record (Khata/Khasra)', 'Bank Account'],
      officialUrl: 'https://pmkisan.gov.in',
      state: 'All India'
    }
  ],
  bookmarks: [
    {
      id: 'j1',
      title: 'Fix Leaky Plastic Bucket or Pipe with Hot Spoon & Bottle Cap',
      titleHindi: 'प्लास्टिक बाल्टी या पाइप का छेद गरम चम्मच और ढक्कन से बंद करें',
      category: 'Household Repair',
      summary: 'Melt a scrap piece of HDPE plastic bottle cap over the leak using a warm metal spoon to create a watertight seal.',
      materials: ['Scrap bottle cap', 'Old metal spoon', 'Lighter or candle'],
      steps: [
        'Clean and dry the leaking area thoroughly.',
        'Warm the back of an old spoon over a flame.',
        'Press a tiny slice of plastic bottle cap onto the leak.',
        'Smooth out the melted plastic with the warm spoon until sealed.'
      ],
      safetyNote: 'Do in a ventilated space and keep flame away from flammable items.',
      proTip: 'Dab cold water immediately after smoothing for instant hardening!',
      likes: 428
    }
  ],
  expenses: [],
  history: [
    { id: 'h1', module: 'jugaad', query: 'How to clean fan without dust falling', timestamp: '2026-07-31 10:15 AM' },
    { id: 'h2', module: 'recipe', query: 'Leftover boiled potatoes snack', timestamp: '2026-07-30 08:45 PM' }
  ]
};

export const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: '🚨 SSC CGL Form Last Date Approaching',
    message: 'Last date to submit application is August 5, 2026. Complete your fee payment on time!',
    timestamp: '10 minutes ago',
    type: 'alert',
    read: false
  },
  {
    id: 'n2',
    title: '💊 Medicine Alarm Reminder',
    message: 'Time for your Multivitamin dosage (9:00 AM).',
    timestamp: '1 hour ago',
    type: 'reminder',
    read: false
  },
  {
    id: 'n3',
    title: '💡 Daily Vyron Jugaad Tip',
    message: 'Store green chilies without stems in a paper towel to keep them fresh for up to 3 weeks!',
    timestamp: '5 hours ago',
    type: 'tip',
    read: true
  },
  {
    id: 'n4',
    title: '🏛️ New Yojna Updated: PM Vishwakarma',
    message: 'Artisans & craftsmen can apply for ₹3 Lakh collateral-free loan at 5% interest.',
    timestamp: 'Yesterday',
    type: 'scheme',
    read: true
  }
];

export function loadProfile(): UserProfile {
  try {
    const isAdmin = hasAdminSession();
    const raw = localStorage.getItem(STORAGE_KEY);
    const permanentCustomAvatar = localStorage.getItem('vyron_admin_custom_avatar_permanent') || localStorage.getItem('vyron_admin_custom_avatar');
    
    // 1. If admin is active, admin ALWAYS opens in dark mode
    if (isAdmin) {
      if (!raw) {
        return { 
          ...INITIAL_USER_PROFILE, 
          theme: 'dark',
          avatarUrl: permanentCustomAvatar || INITIAL_USER_PROFILE.avatarUrl 
        };
      }
      const loaded = { ...INITIAL_USER_PROFILE, ...JSON.parse(raw), theme: 'dark' };
      if (permanentCustomAvatar) {
        loaded.avatarUrl = permanentCustomAvatar;
      } else if (!loaded.avatarUrl || loaded.avatarUrl === '/logo.png') {
        loaded.avatarUrl = DEFAULT_AVATAR_DATA_URI;
      }
      return loaded;
    }

    // 2. Public / first-time user:
    // "koi bhi pahila baar app open kare to use home page open ho or white mode background rahe"
    const hasVisited = localStorage.getItem('bharatjugaad_has_visited_v1');
    const savedVisitorTheme = localStorage.getItem('vyron_visitor_theme');
    
    // First time visitor or returning visitor without explicit dark toggle -> WHITE MODE ('light')
    const visitorTheme: 'light' | 'dark' = savedVisitorTheme === 'dark' ? 'dark' : 'light';

    if (!hasVisited || !raw) {
      try {
        localStorage.setItem('bharatjugaad_has_visited_v1', 'true');
      } catch {}
      const loaded = raw 
        ? { ...INITIAL_USER_PROFILE, ...JSON.parse(raw), theme: 'light' } 
        : { ...INITIAL_USER_PROFILE, theme: 'light' };
      if (permanentCustomAvatar) {
        loaded.avatarUrl = permanentCustomAvatar;
      } else if (!loaded.avatarUrl || loaded.avatarUrl === '/logo.png') {
        loaded.avatarUrl = DEFAULT_AVATAR_DATA_URI;
      }
      return loaded;
    }

    const loaded = { ...INITIAL_USER_PROFILE, ...JSON.parse(raw), theme: visitorTheme };
    if (loaded.reducedMotion === undefined || loaded.reducedMotion === true) {
      loaded.reducedMotion = false;
    }
    if (permanentCustomAvatar) {
      loaded.avatarUrl = permanentCustomAvatar;
    } else if (!loaded.avatarUrl || loaded.avatarUrl === '/logo.png') {
      // Check if custom portfolio has an avatarUrl
      try {
        const pRaw = localStorage.getItem('bharatjugaad_custom_user_portfolio_v3') || localStorage.getItem('vishal_personal_portfolio_v1');
        if (pRaw) {
          const parsedP = JSON.parse(pRaw);
          if (parsedP.avatarUrl) loaded.avatarUrl = parsedP.avatarUrl;
        }
      } catch {}
      if (!loaded.avatarUrl) {
        loaded.avatarUrl = DEFAULT_AVATAR_DATA_URI;
      }
    }
    if (loaded.expenses && loaded.expenses.some(e => ['ex1', 'ex2', 'ex3', 'ex4'].includes(e.id))) {
      loaded.expenses = loaded.expenses.filter(e => !['ex1', 'ex2', 'ex3', 'ex4'].includes(e.id));
      saveProfile(loaded);
    }
    return loaded;
  } catch (err) {
    console.error('Failed to load profile from localStorage:', err);
    return { ...INITIAL_USER_PROFILE, theme: hasAdminSession() ? 'dark' : 'light' };
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    
    // Store theme preference
    if (profile.theme) {
      localStorage.setItem('vyron_visitor_theme', profile.theme);
    }

    // If a custom uploaded avatar exists, back it up to permanent storage
    if (profile.avatarUrl && profile.avatarUrl.trim() !== '' && profile.avatarUrl !== '/logo.png' && profile.avatarUrl !== '/profile.png.jpeg') {
      try {
        localStorage.setItem('vyron_admin_custom_avatar_permanent', profile.avatarUrl);
        localStorage.setItem('vyron_admin_custom_avatar', profile.avatarUrl);
      } catch {}
    }
  } catch (err) {
    console.error('Failed to save profile to localStorage:', err);
  }
}

export function loadNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (!raw) return DEFAULT_NOTIFICATIONS;
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function saveNotifications(notifs: NotificationItem[]): void {
  try {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}
