export type Language = 'en' | 'hi';
export type ThemeMode = 'light' | 'dark';

export * from './types/video';

export type ModuleId = 
  | 'money' 
  | 'jugaad' 
  | 'form' 
  | 'medicine' 
  | 'recipe' 
  | 'study' 
  | 'yojna'
  | 'cimage-logo';

export type NavTab = 'typing' | 'home' | 'tools' | 'explore' | 'notifications' | 'profile';

export interface UserProfile {
  name: string;
  email: string;
  mobile?: string;
  state: string;
  district?: string;
  aboutMe?: string;
  avatarUrl?: string;
  occupation: string;
  incomeCategory: string;
  age: number;
  gender: string;
  language: Language;
  theme: ThemeMode;
  notificationsEnabled: boolean;
  reducedMotion?: boolean;
  savedRecipes: RecipeItem[];
  savedMedicines: MedicineItem[];
  savedReminders: MedicineReminder[];
  studyProgress: StudyProgress[];
  savedSchemes: SchemeItem[];
  bookmarks: JugaadItem[];
  expenses: MoneyRecord[];
  history: HistoryItem[];
  favoriteModules?: ModuleId[];
}

export interface MoneyRecord {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export interface MedicineItem {
  id: string;
  brandName: string;
  saltName: string;
  genericAlternative: string;
  priceBrand: number;
  priceGeneric: number;
  savingsPercentage: number;
  useCase: string;
}

export interface MedicineReminder {
  id: string;
  medicineName: string;
  dosage: string;
  time: string;
  days: string[];
  active: boolean;
}

export interface RecipeItem {
  id: string;
  title: string;
  titleHindi?: string;
  prepTime: string;
  servings: string;
  diet: 'veg' | 'jain' | 'nonveg';
  ingredients: string[];
  instructions: string[];
  jugaadTip: string;
}

export interface JugaadItem {
  id: string;
  title: string;
  titleHindi?: string;
  category: string;
  summary: string;
  materials: string[];
  steps: string[];
  safetyNote?: string;
  proTip?: string;
  likes: number;
}

export interface FormAlertItem {
  id: string;
  title: string;
  organization: string;
  qualification: string;
  lastDate: string;
  state: string;
  category: 'job' | 'exam' | 'scholarship';
  applyUrl: string;
  fee: string;
}

export interface StudyNoteItem {
  id: string;
  topic: string;
  summary: string;
  keyFormulas: string[];
  expectedQuestions: { question: string; answerHint: string }[];
  quiz: { question: string; options: string[]; correctIndex: number }[];
}

export interface StudyProgress {
  id: string;
  topic: string;
  completedPercent: number;
  quizScore: number;
  lastStudied: string;
}

export interface SchemeItem {
  id: string;
  title: string;
  titleHindi?: string;
  ministry: string;
  benefits: string;
  targetAudience: string;
  documents: string[];
  officialUrl: string;
  state: string;
}

export interface HistoryItem {
  id: string;
  module: ModuleId | 'global';
  query: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'alert' | 'reminder' | 'tip' | 'scheme';
  read: boolean;
}
