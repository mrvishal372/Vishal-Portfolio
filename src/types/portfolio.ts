export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  description: string;
  detailedNotes?: string;
  technologies: string[];
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  pdfDocumentUrl?: string;
  pdfFileName?: string;
  featured?: boolean;
  date: string;
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
  fileUrl?: string;
  fileType: 'image' | 'pdf';
  description?: string;
  skills?: string[];
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'resume' | 'marksheet' | 'project' | 'study' | 'certificate' | 'notes' | 'other';
  fileType: 'pdf' | 'image' | 'text';
  format: 'pdf' | 'jpg' | 'jpeg' | 'png' | 'webp' | 'txt' | string;
  fileName: string;
  fileDataUrl: string;
  textContent?: string;
  fileSize?: string;
  uploadDate: string;
  description?: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  universityOrBoard: string;
  duration: string;
  status: 'Currently Pursuing' | 'Completed';
  grade?: string;
  location: string;
  highlights: string[];
}

export interface LearningMilestone {
  id: string;
  phase: string;
  title: string;
  period: string;
  description: string;
  topicsCovered: string[];
  isCurrent?: boolean;
}

export interface SkillItem {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tag?: string;
}

export interface SkillCategory {
  categoryName: string;
  iconName: string;
  skills: SkillItem[];
}

export interface PersonalPortfolioData {
  fullName: string;
  headline: string;
  tagline: string;
  shortBio: string;
  aboutMe: string;
  avatarUrl?: string;
  coverBannerUrl?: string;
  coverBannerPosY?: number;
  coverBannerPosX?: number;
  coverBannerZoom?: number;
  degree: string;
  college: string;
  currentStatus: string;
  location: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  portfolio: string;
  username?: string;
  roleBadge?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  whatsapp?: string;
  interests: string[];
  careerGoals: string[];
  education: EducationItem[];
  learningJourney: LearningMilestone[];
  skillCategories: SkillCategory[];
  projects: ProjectItem[];
  certificates: CertificateItem[];
  documents: DocumentItem[];
  resumeFileName: string;
  resumePdfUrl: string;
  resumeLastUpdated: string;
  customNotes?: string;
  updatedAt?: number;
}
