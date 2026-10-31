import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { AISolutionSkeleton } from '../skeletons/ModuleSkeleton';
import { SmartNotesRenderer } from '../SmartNotesRenderer';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Loader2,
  Search,
  CheckCircle2,
  Mic,
  Brain,
  Timer,
  Award,
  FileText,
  Target,
  Clock,
  Layers,
  ChevronDown,
  Volume2,
  ArrowRight
} from 'lucide-react';

interface LastNightPadhaiProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  initialQuery?: string;
}

export const LastNightPadhai: React.FC<LastNightPadhaiProps> = React.memo(({ profile, onUpdateProfile, initialQuery = '' }) => {
  const isHindi = profile.language === 'hi';

  // Step 1: Target Goal Category
  const [targetCategory, setTargetCategory] = useState<'degree' | 'school' | 'exam' | 'tech'>('degree');

  // --- College / Degree Dependent States ---
  const [degree, setDegree] = useState<string>('BCA');
  const [semester, setSemester] = useState<string>('Semester 1');
  const [degreeSubject, setDegreeSubject] = useState<string>('Programming in C');
  const [degreeOutputType, setDegreeOutputType] = useState<string>('AI Notes & Mind Maps');

  // --- School Class 1-12 Dependent States ---
  const [schoolClass, setSchoolClass] = useState<string>('Class 10');
  const [stream, setStream] = useState<string>('General CBSE / State Board');
  const [schoolSubject, setSchoolSubject] = useState<string>('Science');
  const [schoolOutputType, setSchoolOutputType] = useState<string>('NCERT Summary & Notes');

  // --- Competitive Exam Dependent States ---
  const [examCategory, setExamCategory] = useState<string>('SSC Exams');
  const [specificExam, setSpecificExam] = useState<string>('SSC CGL');
  const [examSubjectSection, setExamSubjectSection] = useState<string>('Quantitative Aptitude & Maths');
  const [examOutputType, setExamOutputType] = useState<string>('Previous Year Questions (PYQs) & Solutions');

  // --- Programming & Tech Dependent States ---
  const [techTrack, setTechTrack] = useState<string>('Python');
  const [techTopicLevel, setTechTopicLevel] = useState<string>('Basics & Syntax');
  const [techOutputType, setTechOutputType] = useState<string>('AI Code Notes & Explanations');

  // Universal Options & Conclusion
  const [languageMode, setLanguageMode] = useState<string>(
    isHindi ? 'Hindi Mode (हिंदी + आसान भाषा)' : 'English Mode (Pure English)'
  );
  const [customTopic, setCustomTopic] = useState<string>(initialQuery);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [notesResult, setNotesResult] = useState('');

  // Keep output language mode synchronized with language setting
  useEffect(() => {
    if (isHindi) {
      setLanguageMode('Hindi Mode (हिंदी + आसान भाषा)');
    } else {
      setLanguageMode('English Mode (Pure English)');
    }
  }, [isHindi]);

  // 1. College Degrees
  const DEGREES = [
    'BCA', 'MCA', 'B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'B.Com', 'M.Com',
    'BBA', 'MBA', 'BA', 'MA', 'B.Ed', 'D.El.Ed', 'Polytechnic', 'ITI',
    'Diploma', 'Nursing', 'Pharmacy', 'Law (LLB)', 'MBBS', 'BDS',
    'Agriculture', 'Hotel Management', 'Fashion Designing', 'Journalism',
    'Animation & Graphic Design', 'Data Science', 'AI & ML', 'Cyber Security'
  ];

  // Semesters / Years
  const SEMESTERS = isHindi ? [
    'सेमेस्टर 1', 'सेमेस्टर 2', 'सेमेस्टर 3', 'सेमेस्टर 4',
    'सेमेस्टर 5', 'सेमेस्टर 6', 'सेमेस्टर 7', 'सेमेस्टर 8',
    'प्रथम वर्ष (1st Year)', 'द्वितीय वर्ष (2nd Year)', 'अंतिम वर्ष (Final Year)'
  ] : [
    'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
    'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8',
    '1st Year', '2nd Year', 'Final Year'
  ];

  // Helper for dynamic Degree subjects based on selected Degree
  const getDegreeSubjects = (c: string) => {
    if (['BCA', 'MCA', 'B.Tech', 'M.Tech', 'Data Science', 'AI & ML', 'Cyber Security'].includes(c)) {
      return isHindi ? [
        'C / C++ प्रोग्रामिंग',
        'जावा प्रोग्रामिंग व OOPs',
        'पायथन फॉर बिगिनर्स',
        'डेटा स्ट्रक्चर्स व एल्गोरिदम (DSA)',
        'डेटाबेस मैनेजमेंट सिस्टम (DBMS) व SQL',
        'ऑपरेटिंग सिस्टम (OS)',
        'कंप्यूटर नेटवर्क (CN)',
        'सॉफ्टवेयर इंजीनियरिंग',
        'वेब डेवलपमेंट (HTML/CSS/JS/React)',
        'डिस्क्रिट मैथमेटिक्स',
        'क्लाउड कंप्यूटिंग व साइबर सुरक्षा'
      ] : [
        'Programming in C / C++',
        'Java Programming & OOPs',
        'Python for Beginners',
        'Data Structures & Algorithms (DSA)',
        'Database Management System (DBMS) & SQL',
        'Operating Systems (OS)',
        'Computer Networks (CN)',
        'Software Engineering',
        'Web Development (HTML/CSS/JS/React)',
        'Discrete Mathematics',
        'Cloud Computing & Cyber Security'
      ];
    }
    if (['B.Sc', 'M.Sc'].includes(c)) {
      return isHindi ? [
        'भौतिकी (Physics)', 'रसायन विज्ञान (Chemistry)', 'गणित (Mathematics)', 'जंतु विज्ञान (Zoology)', 'वनस्पति विज्ञान (Botany)', 'बायोटेक्नोलॉजी', 'सांख्यिकी', 'इलेक्ट्रॉनिक्स'
      ] : [
        'Physics', 'Chemistry', 'Mathematics', 'Zoology', 'Botany', 'Biotechnology', 'Statistics', 'Electronics'
      ];
    }
    if (['B.Com', 'M.Com', 'BBA', 'MBA'].includes(c)) {
      return isHindi ? [
        'फाइनेंशियल अकाउंटिंग', 'कॉस्ट व मैनेजमेंट अकाउंटिंग', 'बिजनेस लॉ',
        'मार्केटिंग मैनेजमेंट', 'कॉरपोरेट फाइनेंस', 'अर्थशास्त्र (Economics)',
        'ह्यूमन रिसोर्स मैनेजमेंट (HRM)', 'बिजनेस स्टैटिस्टिक्स'
      ] : [
        'Financial Accounting', 'Cost & Management Accounting', 'Business Law',
        'Marketing Management', 'Corporate Finance', 'Economics (Micro & Macro)',
        'Human Resource Management (HRM)', 'Business Statistics'
      ];
    }
    if (['Law (LLB)'].includes(c)) {
      return isHindi ? [
        'संवैधानिक कानून', 'भारतीय दंड संहिता (IPC / BNS)', 'अनुबंध कानून', 'पारिवारिक कानून', 'दंड प्रक्रिया संहिता (CrPC)', 'विधि शास्त्र (Jurisprudence)'
      ] : [
        'Constitutional Law', 'Indian Penal Code (IPC)', 'Law of Contracts', 'Family Law', 'Code of Criminal Procedure (CrPC)', 'Jurisprudence'
      ];
    }
    if (['Nursing', 'Pharmacy', 'MBBS', 'BDS'].includes(c)) {
      return isHindi ? [
        'मानव शरीर रचना व क्रिया विज्ञान', 'फार्माकोलॉजी', 'पैथोलॉजी', 'बायोकैमिस्ट्री', 'मेडिकल माइक्रोबायोलॉजी', 'कम्युनिटी मेडिसिन'
      ] : [
        'Human Anatomy & Physiology', 'Pharmacology', 'Pathology', 'Biochemistry', 'Medical Microbiology', 'Community Medicine'
      ];
    }
    if (['BA', 'MA', 'B.Ed', 'D.El.Ed'].includes(c)) {
      return isHindi ? [
        'इतिहास', 'राजनीति विज्ञान', 'भूगोल', 'समाजशास्त्र', 'अर्थशास्त्र', 'बाल विकास व शिक्षाशास्त्र', 'हिंदी साहित्य', 'अंग्रेजी साहित्य'
      ] : [
        'History', 'Political Science', 'Geography', 'Sociology', 'Economics', 'Pedagogy & Child Development', 'Hindi Literature', 'English Literature'
      ];
    }
    return isHindi ? [
      'बेसिक इलेक्ट्रिकल इंजीनियरिंग', 'इंजीनियरिंग मैकेनिक्स', 'अनुप्रयुक्त गणित', 'ट्रेड थ्योरी', 'कंप्यूटर फंडामेंटल्स', 'वर्कशॉप'
    ] : [
      'Basic Electrical Engineering', 'Engineering Mechanics', 'Applied Mathematics', 'Trade Theory', 'Computer Fundamentals', 'General Workshop'
    ];
  };

  // 2. School Classes
  const SCHOOL_CLASSES = isHindi ? [
    'कक्षा 10', 'कक्षा 12', 'कक्षा 11', 'कक्षा 9', 'कक्षा 8',
    'कक्षा 7', 'कक्षा 6', 'कक्षा 5', 'कक्षा 4', 'कक्षा 3',
    'कक्षा 2', 'कक्षा 1', 'UKG', 'LKG', 'नर्सरी'
  ] : [
    'Class 10', 'Class 12', 'Class 11', 'Class 9', 'Class 8',
    'Class 7', 'Class 6', 'Class 5', 'Class 4', 'Class 3',
    'Class 2', 'Class 1', 'UKG', 'LKG', 'Nursery'
  ];

  const SCHOOL_STREAMS = isHindi ? [
    'सामान्य सीबीएसई / राज्य बोर्ड',
    'विज्ञान (PCM - भौतिकी, रसायन, गणित)',
    'विज्ञान (PCB - भौतिकी, रसायन, जीवविज्ञान)',
    'कॉमर्स (लेखाशास्त्र, व्यावसायिक अध्ययन, अर्थशास्त्र)',
    'कला / मानवीकी (इतिहास, राजनीति, भूगोल)'
  ] : [
    'General CBSE / State Board',
    'Science (PCM - Physics, Chemistry, Maths)',
    'Science (PCB - Physics, Chemistry, Biology)',
    'Commerce (Accountancy, BST, Economics)',
    'Arts / Humanities (History, Polity, Geog)'
  ];

  const getSchoolSubjects = (cls: string, strm: string) => {
    if (cls.includes('11') || cls.includes('12')) {
      if (strm.includes('PCM')) return isHindi ? ['भौतिकी (Physics)', 'रसायन (Chemistry)', 'गणित (Maths)', 'अंग्रेजी (English)', 'कंप्यूटर साइंस'] : ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science / IP'];
      if (strm.includes('PCB')) return isHindi ? ['भौतिकी (Physics)', 'रसायन (Chemistry)', 'जीवविज्ञान (Biology)', 'अंग्रेजी (English)', 'शारीरिक शिक्षा'] : ['Physics', 'Chemistry', 'Biology', 'English', 'Physical Education'];
      if (strm.includes('Commerce') || strm.includes('कॉमर्स')) return isHindi ? ['अकाउंटेंसी', 'बिजनेस स्टडीज', 'अर्थशास्त्र', 'गणित', 'अंग्रेजी'] : ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English'];
      if (strm.includes('Arts') || strm.includes('कला')) return isHindi ? ['इतिहास', 'राजनीति विज्ञान', 'भूगोल', 'अर्थशास्त्र', 'समाजशास्त्र', 'हिंदी', 'अंग्रेजी'] : ['History', 'Political Science', 'Geography', 'Economics', 'Sociology', 'Hindi', 'English'];
    }
    return isHindi ? [
      'गणित (Maths)', 'विज्ञान (Science)', 'सामाजिक विज्ञान (SST)', 'अंग्रेजी (English)', 'हिंदी (Hindi)', 'संस्कृत', 'कंप्यूटर'
    ] : [
      'Mathematics', 'Science', 'Social Science (SST)', 'English', 'Hindi', 'Sanskrit', 'Computer Science'
    ];
  };

  // 3. Competitive Exams Categories & Sub-Exams
  const EXAM_CATEGORIES = isHindi ? [
    'SSC परीक्षा (कर्मचारी चयन आयोग)',
    'UPSC व राज्य लोक सेवा आयोग (PCS)',
    'बैंकिंग व बीमा परीक्षा',
    'रेलवे भर्ती परीक्षा',
    'पुलिस व रक्षा बल परीक्षा',
    'शिक्षक भर्ती परीक्षा (CTET/TET)',
    'इंजीनियरिंग व मेडिकल प्रवेश (JEE/NEET)',
    'प्रबंधन व कानून प्रवेश (CAT/CLAT)'
  ] : [
    'SSC Exams',
    'UPSC & State PCS',
    'Banking & Insurance',
    'Railway Exams',
    'Police & Defence',
    'Teaching Exams',
    'Engineering & Medical Entrance (JEE/NEET)',
    'Management & Law Entrances (CAT/CLAT)'
  ];

  const getSpecificExams = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('ssc')) return ['SSC CGL', 'SSC CHSL', 'SSC GD Constable', 'SSC MTS', 'SSC CPO', 'SSC JE'];
    if (c.includes('upsc') || c.includes('लोक सेवा') || c.includes('pcs')) return ['UPSC CSE Prelims', 'UPSC CSE Mains', 'BPSC (Bihar)', 'UPPSC (UP)', 'MPPSC', 'RAS (Rajasthan)', 'State PCS'];
    if (c.includes('bank') || c.includes('बैंक') || c.includes('बीमा')) return ['SBI PO', 'SBI Clerk', 'IBPS PO', 'IBPS Clerk', 'RBI Grade B', 'LIC AAO'];
    if (c.includes('railway') || c.includes('रेलवे')) return ['RRB NTPC', 'Railway Group D', 'RRB ALP (Assistant Loco Pilot)', 'RRB JE'];
    if (c.includes('police') || c.includes('defence') || c.includes('पुलिस') || c.includes('सेना')) return ['Bihar Police Constable/SI', 'UP Police Constable/SI', 'Delhi Police', 'NDA', 'CDS', 'CAPF', 'AFCAT', 'Agniveer Army/Navy/Airforce'];
    if (c.includes('teach') || c.includes('शिक्षक')) return ['CTET Paper 1', 'CTET Paper 2', 'State TET', 'UGC NET Paper 1', 'UGC NET Paper 2', 'B.Ed Entrance'];
    if (c.includes('engineer') || c.includes('medical') || c.includes('इंजीनियरिंग') || c.includes('मेडिकल')) return ['JEE Main', 'JEE Advanced', 'NEET UG', 'CUET UG', 'CUET PG', 'GATE'];
    return ['CAT', 'MAT', 'XAT', 'CLAT (Law Entrance)', 'NIFT', 'NID'];
  };

  const getExamSections = () => isHindi ? [
    'गणित व अंकगणित (Quantitative Aptitude)',
    'तर्कशक्ति व मानसिक योग्यता (Logical Reasoning)',
    'सामान्य ज्ञान (General Knowledge & Static GK)',
    'भारतीय संविधान व राजव्यवस्था (Polity)',
    'भारतीय इतिहास व राष्ट्रीय आंदोलन (History)',
    'भूगोल व पर्यावरण (Geography & Environment)',
    'सामान्य विज्ञान (General Science)',
    'अंग्रेजी भाषा व समझ (English Language)',
    'समसामयिकी (Current Affairs)',
    'कंप्यूटर ज्ञान व आईटी (Computer Awareness)'
  ] : [
    'Quantitative Aptitude & Maths',
    'Logical Reasoning & Mental Ability',
    'General Knowledge & Static GK',
    'Indian Polity & Constitution',
    'Indian History & National Movement',
    'Geography & Environment',
    'General Science (Physics/Chem/Bio)',
    'English Language & Comprehension',
    'Current Affairs & Annual Roundup',
    'Computer Awareness & IT'
  ];

  // 4. Programming Tracks
  const TECH_TRACKS = [
    'Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'C', 'C#', 'SQL',
    'HTML & CSS', 'React', 'Node.js', 'Express', 'Next.js', 'Flutter',
    'AI & Machine Learning', 'Cyber Security', 'Data Science'
  ];

  const TECH_TOPICS = isHindi ? [
    'शुरुआती स्तर व सिंटैक्स (Basics & Syntax)',
    'ऑब्जेक्ट ओरिएंटेड प्रोग्रामिंग (OOPs)',
    'डेटा स्ट्रक्चर्स व एल्गोरिदम (DSA)',
    'डेटाबेस क्वेरी व SQL',
    'वेब डेवलपमेंट व API इंटीग्रेशन',
    'मिनी प्रोजेक्ट व कोड वॉकथ्रू',
    'शीर्ष इंटरव्यू प्रश्न व वाइवा'
  ] : [
    'Basics & Syntax',
    'Object Oriented Programming (OOPs)',
    'Data Structures & Algorithms (DSA)',
    'Database Queries & SQL',
    'Web Development & API Integration',
    'Mini Project & Code Walkthrough',
    'Top Interview Questions & Viva'
  ];

  // Common Output Types
  const DEGREE_OUTPUT_TYPES = isHindi ? [
    'एआई नोट्स व माइंड मैप',
    'सेमेस्टर के पिछले वर्षों के प्रश्न (PYQs)',
    'फॉर्मूला व त्वरित रिवीजन शीट',
    'एआई क्विज़ व MCQs',
    'शीर्ष 15 विश्वविद्यालय परीक्षा प्रश्न',
    'लैब व वाइवा प्रश्न-उत्तर'
  ] : [
    'AI Notes & Mind Maps',
    'Semester Previous Year Questions (PYQs)',
    'Formula & Quick Revision Sheet',
    'AI Quiz & MCQs with Explanations',
    'Top 15 University Exam Questions',
    'Lab & Viva Voice Q&A'
  ];

  const SCHOOL_OUTPUT_TYPES = isHindi ? [
    'NCERT सारांश व नोट्स',
    'महत्वपूर्ण बोर्ड परीक्षा प्रश्न',
    'अध्याय माइंड मैप व फ्लोचार्ट',
    'फॉर्मूला व समीकरण शीट',
    'कक्षा PYQs (पिछले वर्षों के प्रश्न)',
    '5-मिनट अभ्यास क्विज़'
  ] : [
    'NCERT Summary & Notes',
    'Important Board Exam Questions',
    'Chapter Mind Map & Flowchart',
    'Formula & Equation Sheet',
    'Class PYQs (Previous Year Questions)',
    '5-Minute Practice Quiz'
  ];

  const EXAM_OUTPUT_TYPES = isHindi ? [
    'पिछले वर्षों के प्रश्न (PYQs) व समाधान',
    'उच्च उपयोगिता वन-लाइनर नोट्स',
    'संक्षिप्त रिवीजन व माइंड मैप',
    'महत्वपूर्ण सूत्र व शॉर्टकट्स',
    'अभ्यास मॉक टेस्ट व क्विज़',
    'परीक्षा रणनीति व मुख्य विषय'
  ] : [
    'Previous Year Questions (PYQs) & Solutions',
    'High-Yield One-Liner Notes',
    'Short Revision & Mind Map',
    'Important Formulas & Shortcuts',
    'Practice Mock Test & Quiz',
    'Exam Strategy & High-Weightage Topics'
  ];

  const TECH_OUTPUT_TYPES = isHindi ? [
    'एआई कोड नोट्स व स्पष्टीकरण',
    'सिंटैक्स चीट शीट व माइंड मैप',
    'चरण-दर-चरण कोड उदाहरण',
    'शीर्ष 15 इंटरव्यू कोडिंग प्रश्न',
    'कोडिंग क्विज़ व MCQs'
  ] : [
    'AI Code Notes & Explanations',
    'Syntax Cheat Sheet & Mind Map',
    'Step-by-Step Code Examples',
    'Top 15 Interview Coding Questions',
    'Coding Quiz & MCQs'
  ];

  // Handler
  const handleGenerateStudy = async () => {
    setLoading(true);
    setNotesResult('');

    try {
      let payload: any = {
        language: profile.language || 'hi',
        customTopic: customTopic.trim() || globalSearch.trim() || ''
      };

      if (targetCategory === 'degree') {
        payload.course = degree;
        payload.selectedClass = semester;
        payload.subject = degreeSubject;
        payload.feature = degreeOutputType;
      } else if (targetCategory === 'school') {
        payload.selectedClass = schoolClass;
        payload.course = stream;
        payload.subject = schoolSubject;
        payload.feature = schoolOutputType;
      } else if (targetCategory === 'exam') {
        payload.exam = `${examCategory} - ${specificExam}`;
        payload.subject = examSubjectSection;
        payload.feature = examOutputType;
      } else if (targetCategory === 'tech') {
        payload.progLang = techTrack;
        payload.subject = techTopicLevel;
        payload.feature = techOutputType;
      }

      payload.voiceMode = languageMode;

      const res = await fetch('/api/ai/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.result) {
        setNotesResult(data.result);
      } else {
        setNotesResult(isHindi ? 'नोट्स उत्पन्न नहीं हो सके। कृपया दोबारा प्रयास करें।' : 'Could not generate notes. Please try again.');
      }
    } catch (err: any) {
      setNotesResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Button Label Helper
  const getButtonLabel = () => {
    return isHindi ? 'नोट्स बनाएं' : 'Generate Notes';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#000080] via-[#1e1b4b] to-[#312e81] text-white shadow-2xl relative overflow-hidden border border-amber-500/30">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-3 border border-amber-400/40">
          <GraduationCap className="w-4 h-4 text-amber-400" />
          <span>
            {isHindi 
              ? 'चरण-दर-चरण अध्ययन सहायक' 
              : 'Step-by-Step Study Assistant'}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {isHindi ? 'लास्ट नाइट पढ़ाई' : 'Last Night Padhai'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
          {isHindi
            ? 'डिग्री, स्कूल, प्रतियोगी परीक्षा या कोडिंग चुनें — चरण-दर-चरण सटीक विकल्प चुनकर नोट्स पाएँ!'
            : 'Select Degree, School, Competitive Exam or Coding — get customized step-by-step AI notes instantly!'}
        </p>

        {/* Global Quick Search */}
        <div className="mt-5 relative">
          <div className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 p-1.5 focus-within:ring-2 focus-within:ring-amber-400">
            <Search className="w-5 h-5 text-amber-300 ml-3 shrink-0" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder={
                isHindi
                  ? '🔍 डायरेक्ट सर्च: BCA Sem 2, कक्षा 10 भौतिकी, SSC CGL गणित, Python DSA...'
                  : '🔍 Direct Search: BCA Sem 2, Class 10 Physics, SSC CGL Maths, Python DSA...'
              }
              className="w-full bg-transparent text-white placeholder-slate-300 text-xs sm:text-sm px-3 py-2 focus:outline-none"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="text-xs text-amber-300 hover:text-white px-2 py-1 font-bold"
              >
                {isHindi ? 'हटाएँ' : 'Clear'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Step-by-Step Selection Container */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md space-y-6">

        {/* STEP 1: Main Category Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#000080] dark:text-amber-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-[#000080] dark:text-amber-300 inline-flex items-center justify-center text-xs font-extrabold">1</span>
              {isHindi ? 'चरण 1: अपनी पढ़ाई की श्रेणी चुनें' : 'Step 1: Select Education Goal'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 select-none">
            <button
              type="button"
              onClick={() => setTargetCategory('degree')}
              className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-1.5 border transition-all select-none touch-manipulation ${
                targetCategory === 'degree'
                  ? 'bg-[#000080] dark:bg-amber-400 text-white dark:text-slate-950 border-indigo-900 shadow-lg font-bold ring-2 ring-amber-400/50'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-lg">🎓</span>
              <span>{isHindi ? 'कॉलेज डिग्री' : 'College Degree'}</span>
            </button>

            <button
              type="button"
              onClick={() => setTargetCategory('school')}
              className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-1.5 border transition-all select-none touch-manipulation ${
                targetCategory === 'school'
                  ? 'bg-[#000080] dark:bg-amber-400 text-white dark:text-slate-950 border-indigo-900 shadow-lg font-bold ring-2 ring-amber-400/50'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-lg">🏫</span>
              <span>{isHindi ? 'स्कूल कक्षा' : 'School Class (1-12)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setTargetCategory('exam')}
              className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-1.5 border transition-all select-none touch-manipulation ${
                targetCategory === 'exam'
                  ? 'bg-[#000080] dark:bg-amber-400 text-white dark:text-slate-950 border-indigo-900 shadow-lg font-bold ring-2 ring-amber-400/50'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-lg">🏛️</span>
              <span>{isHindi ? 'प्रतियोगी परीक्षा' : 'Competitive Exams'}</span>
            </button>

            <button
              onClick={() => setTargetCategory('tech')}
              className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-1.5 border transition-all ${
                targetCategory === 'tech'
                  ? 'bg-[#000080] text-white border-indigo-900 shadow-lg scale-[1.02] ring-2 ring-amber-400/50'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-lg">💻</span>
              <span>{isHindi ? 'प्रोग्रामिंग व कोडिंग' : 'Programming & Tech'}</span>
            </button>
          </div>
        </div>

        {/* STEP 2 to 4: DYNAMIC DEPENDENT STEPS ACCORDING TO SELECTION */}

        {/* --- PATH A: COLLEGE DEGREE FLOW --- */}
        {targetCategory === 'degree' && (
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              {isHindi ? 'चरण 2-4: कॉलेज व डिग्री विकल्प' : 'Steps 2-4: College & Degree Details'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Step 2: Select Course */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isHindi ? '1. डिग्री कोर्स' : '1. Select Degree Course'}
                </label>
                <select
                  value={degree}
                  onChange={(e) => {
                    const newDeg = e.target.value;
                    setDegree(newDeg);
                    const subList = getDegreeSubjects(newDeg);
                    if (subList.length > 0) setDegreeSubject(subList[0]);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
                >
                  {DEGREES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Step 3: Select Semester */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isHindi ? '2. सेमेस्टर / वर्ष' : '2. Select Semester / Year'}
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>

              {/* Step 4: Contextual Subject for Degree */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isHindi ? `3. ${degree} का विषय` : `3. ${degree} Subject`}
                </label>
                <select
                  value={degreeSubject}
                  onChange={(e) => setDegreeSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
                >
                  {getDegreeSubjects(degree).map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Step 5: Required Output */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isHindi ? '4. क्या चाहिए?' : '4. Output Format'}
                </label>
                <select
                  value={degreeOutputType}
                  onChange={(e) => setDegreeOutputType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
                >
                  {DEGREE_OUTPUT_TYPES.map((out) => (
                    <option key={out} value={out}>{out}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* --- PATH B: SCHOOL CLASS 1-12 FLOW --- */}
        {targetCategory === 'school' && (
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              {isHindi ? 'चरण 2-4: स्कूल कक्षा विकल्प' : 'Steps 2-4: School Options'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Step 2: Select Class */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isHindi ? '1. कक्षा चुनें' : '1. Select Class'}
                </label>
                <select
                  value={schoolClass}
                  onChange={(e) => {
                    const newCls = e.target.value;
                    setSchoolClass(newCls);
                    const subList = getSchoolSubjects(newCls, stream);
                    if (subList.length > 0) setSchoolSubject(subList[0]);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
                >
                  {SCHOOL_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Step 3: Select Stream */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isHindi ? '2. बोर्ड / स्ट्रीम' : '2. Select Stream / Board'}
                </label>
                <select
                  value={stream}
                  onChange={(e) => {
                    const newStrm = e.target.value;
                    setStream(newStrm);
                    const subList = getSchoolSubjects(schoolClass, newStrm);
                    if (subList.length > 0) setSchoolSubject(subList[0]);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
                >
                  {SCHOOL_STREAMS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Step 4: Subject */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isHindi ? '3. मुख्य विषय' : '3. Select Subject'}
                </label>
                <select
                  value={schoolSubject}
                  onChange={(e) => setSchoolSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
                >
                  {getSchoolSubjects(schoolClass, stream).map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Step 5: Required Output */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isHindi ? '4. क्या चाहिए?' : '4. Output Format'}
                </label>
                <select
                  value={schoolOutputType}
                  onChange={(e) => setSchoolOutputType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
                >
                  {SCHOOL_OUTPUT_TYPES.map((out) => (
                    <option key={out} value={out}>{out}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* --- PATH C: COMPETITIVE EXAMS FLOW --- */}
        {targetCategory === 'exam' && (
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              {isHindi ? 'चरण 2-4: प्रतियोगी परीक्षा विकल्प' : 'Steps 2-4: Exam Options'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Step 2: Exam Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isHindi ? '1. परीक्षा श्रेणी' : '1. Exam Category'}
                </label>
                <select
                  value={examCategory}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setExamCategory(newCat);
                    const exList = getSpecificExams(newCat);
                    if (exList.length > 0) setSpecificExam(exList[0]);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
                >
                  {EXAM_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Step 3: Specific Exam */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isHindi ? '2. मुख्य परीक्षा' : '2. Specific Exam'}
                </label>
                <select
                  value={specificExam}
                  onChange={(e) => setSpecificExam(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
                >
                  {getSpecificExams(examCategory).map((ex) => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>

              {/* Step 4: Subject / Paper Section */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isHindi ? '3. पेपर / सेक्शन' : '3. Subject Section'}
                </label>
                <select
                  value={examSubjectSection}
                  onChange={(e) => setExamSubjectSection(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
                >
                  {getExamSections().map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              {/* Step 5: Required Output */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isHindi ? '4. क्या चाहिए?' : '4. Output Format'}
                </label>
                <select
                  value={examOutputType}
                  onChange={(e) => setExamOutputType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
                >
                  {EXAM_OUTPUT_TYPES.map((out) => (
                    <option key={out} value={out}>{out}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* --- PATH D: PROGRAMMING & TECH FLOW --- */}
        {targetCategory === 'tech' && (
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              {isHindi ? 'चरण 2-4: कोडिंग व टेक्नोलॉजी विकल्प' : 'Steps 2-4: Tech & Programming Options'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Step 2: Select Tech Track */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isHindi ? '1. प्रोग्रामिंग भाषा / तकनीक' : '1. Select Programming Track'}
                </label>
                <select
                  value={techTrack}
                  onChange={(e) => setTechTrack(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
                >
                  {TECH_TRACKS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Step 3: Topic / Level */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isHindi ? '2. स्तर व टॉपिक' : '2. Select Topic / Level'}
                </label>
                <select
                  value={techTopicLevel}
                  onChange={(e) => setTechTopicLevel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
                >
                  {TECH_TOPICS.map((top) => (
                    <option key={top} value={top}>{top}</option>
                  ))}
                </select>
              </div>

              {/* Step 4: Required Output */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isHindi ? '3. क्या चाहिए?' : '3. Output Format'}
                </label>
                <select
                  value={techOutputType}
                  onChange={(e) => setTechOutputType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
                >
                  {TECH_OUTPUT_TYPES.map((out) => (
                    <option key={out} value={out}>{out}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* UNIVERSAL STEP 5: LANGUAGE MODE & OPTIONAL CONCLUSION TOPIC */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                {isHindi ? '🗣️ आउटपुट भाषा मोड' : '🗣️ Output Language Mode'}
              </label>
              <select
                value={languageMode}
                onChange={(e) => setLanguageMode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
              >
                <option value="Hindi Mode (हिंदी + आसान भाषा)">
                  {isHindi ? '🇮🇳 हिंदी / सरल भाषा' : '🇮🇳 Hindi / Hinglish'}
                </option>
                <option value="English Mode (Pure English)">
                  {isHindi ? '🇬🇧 शुद्ध अंग्रेजी' : '🇬🇧 Pure English'}
                </option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block flex items-center justify-between">
                <span>
                  {isHindi ? '📝 विशेष विषय / चैप्टर (ऐच्छिक)' : '📝 Specific Chapter / Topic (Optional)'}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {isHindi ? 'खाली छोड़ सकते हैं' : 'Can leave blank'}
                </span>
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder={
                  isHindi
                    ? 'उदा. Linked List Insertion, Article 21, Newton 3rd Law...'
                    : 'e.g. Linked List Insertion, Article 21, Newton 3rd Law...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* GENERATE BUTTON */}
          <div>
            <button
              onClick={handleGenerateStudy}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF9933] via-amber-400 to-[#FF9933] hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-98 transition-all duration-200 disabled:opacity-50 border border-amber-300/50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {isHindi ? 'Vyron AI अध्ययन नोट्स तैयार कर रहा है...' : 'Vyron AI is generating study notes...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 fill-slate-950" />
                  <span>{getButtonLabel()}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Generated Result Sheet */}
      {loading ? (
        <AISolutionSkeleton />
      ) : notesResult ? (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md space-y-4 animate-slide-up">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-[#000080] dark:text-amber-300 font-bold text-base">
              <BookOpen className="w-5 h-5 text-[#FF9933]" />
              <span>{isHindi ? 'Vyron AI लास्ट नाइट पढ़ाई शीट' : 'Vyron AI Last Night Study Sheet'}</span>
            </div>
            <span className="text-xs bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-300/50">
              {targetCategory.toUpperCase()}
            </span>
          </div>

          <div className="w-full">
            <SmartNotesRenderer content={notesResult} />
          </div>
        </div>
      ) : null}
    </div>
  );
});


