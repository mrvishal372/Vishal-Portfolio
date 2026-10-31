export interface FounderSocialMedia {
  mainUsername: string; // '@mr_vishal372'
  instagram?: string;
  facebook?: string;
  youtube?: string;
  whatsapp?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
}

export interface FounderProject {
  title: string;
  description: string;
  technologies?: string[];
  link?: string;
}

export interface FounderCertificate {
  title: string;
  issuer?: string;
  date?: string;
}

export interface FounderDocument {
  title: string;
  category: string;
  fileName: string;
  fileDataUrl?: string;
}

export interface FounderMasterProfile {
  // 1. Basic Info
  fullName: string;
  aliases: string[]; // e.g. ["Vishal Kumar Yadav", "Vishal"]
  dob: string; // '2006-07-16' (16 July 2006)
  role: string;
  
  // 2. Locations
  hometownVillage: string;
  currentCity: string;

  // 3. Education
  educationSummary: string;
  schooling: string;
  college: string;
  course: string;
  semesterYear: string;
  academicSubjects: string[];

  // 4. Skills & Learning
  skills: string[];
  programmingLanguages: string[];
  technologies: string[];
  currentlyLearning: string[];

  // 5. Vyron AI Project
  vyronAiDescription: string;
  vyronAiFeatures: string[];

  // 6. Personal Interests & Goals
  interests: string[];
  hobbies: string[];
  favouriteThings: string[];
  futureGoals: string[];

  // 7. Extra achievements & credentials (empty by default unless added)
  projects: FounderProject[];
  certificates: FounderCertificate[];
  achievements: string[];
  documents: FounderDocument[];
  photos: string[];

  // 8. Socials
  socialMedia: FounderSocialMedia;

  // 9. Contact & Privacy
  contactPhonePrivate: string;
  contactEmailPrivate: string;
  isContactPrivate: boolean; // default: true - never expose private phone or contact automatically

  lastUpdated: string;
}
