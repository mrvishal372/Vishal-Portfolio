import React, { useState, useMemo } from 'react';
import { UserProfile, SchemeItem } from '../../types';
import { 
  Building2, Sparkles, ExternalLink, CheckCircle2, ShieldCheck, 
  FileText, Loader2, Search, Mic, MicOff, Filter, Bookmark, 
  ChevronRight, ArrowRight, X, AlertCircle, Award, Calendar, 
  GraduationCap, Briefcase, IndianRupee, HeartHandshake, Sun, 
  Home, Users, Zap, Check, Share2
} from 'lucide-react';
import { VoiceListener } from '../../lib/voice';

interface MeriYojnaProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  initialQuery?: string;
}

export interface SarkariResultItem {
  id: string;
  title: string;
  titleHindi: string;
  board: string;
  type: 'job' | 'result' | 'admit' | 'answerkey' | 'admission';
  qualification: string;
  totalPosts?: string;
  lastDate?: string;
  status: 'Active' | 'Result Live' | 'Admit Card Out' | 'Answer Key Out' | 'Closing Soon';
  officialUrl: string;
  fee?: string;
  salary?: string;
  ageLimit?: string;
  state: string;
  details: string;
  steps: string[];
}

export interface EnhancedSchemeItem extends SchemeItem {
  category: 'farmer' | 'health' | 'youth' | 'women' | 'housing' | 'worker' | 'business';
  benefitPill: string;
  eligibilityShort: string;
  keyHighlights: string[];
  applicationMode: 'Online' | 'CSC / Seva Kendra' | 'Both';
}

// Comprehensive National & State Government Schemes Database
const ALL_INDIA_SCHEMES: EnhancedSchemeItem[] = [
  {
    id: 'pm-kisan',
    title: 'PM Kisan Samman Nidhi Yojana',
    titleHindi: 'पीएम किसान सम्मान निधि',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'farmer',
    benefitPill: '₹6,000 / वर्ष DBT बैंक खाते में',
    benefits: '₹6,000 प्रति वर्ष, ₹2,000 की 3 समान किस्तों में सीधे किसान के बैंक खाते में DBT द्वारा।',
    targetAudience: 'Small & marginal landholding farmers',
    eligibilityShort: 'सभी भूमिधारक किसान परिवार (खेती योग्य भूमि)',
    keyHighlights: ['Direct Bank Transfer (DBT)', 'e-KYC अनिवार्य', 'किसान क्रेडिट कार्ड से जुड़ा'],
    documents: ['आधार कार्ड', 'जमीन का खसरा/खतौनी', 'बैंक पासबुक'],
    officialUrl: 'https://pmkisan.gov.in',
    state: 'All India',
    applicationMode: 'Online'
  },
  {
    id: 'ayushman-pmjay',
    title: 'Ayushman Bharat (PM-JAY)',
    titleHindi: 'आयुष्मान भारत — जन आरोग्य योजना',
    ministry: 'Ministry of Health & Family Welfare',
    category: 'health',
    benefitPill: '₹5,00,000 तक मुफ्त इलाज / वर्ष',
    benefits: 'प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस और पेपरलेस अस्पताल इलाज (सरकारी व निजी संबद्ध अस्पताल)।',
    targetAudience: 'SECC सूचिबद्ध परिवार व 70+ वरिष्ठ नागरिक',
    eligibilityShort: 'बीपीएल, आर्थिक रूप से कमजोर व 70+ वर्ष के सभी वरिष्ठ नागरिक',
    keyHighlights: ['कैशलेस इलाज', '27,000+ अस्पताल लिस्टेड', '70+ वर्ष के लिए विशेष कवरेज'],
    documents: ['आधार कार्ड', 'राशन कार्ड', 'मोबाइल नंबर'],
    officialUrl: 'https://pmjay.gov.in',
    state: 'All India',
    applicationMode: 'Both'
  },
  {
    id: 'pm-vishwakarma',
    title: 'PM Vishwakarma Kaushal Samman',
    titleHindi: 'पीएम विश्वकर्मा योजना',
    ministry: 'Ministry of MSME',
    category: 'worker',
    benefitPill: '₹3 Lakh लोन @ 5% + ₹15,000 टूलकिट',
    benefits: 'बिना गारंटी ₹3 लाख तक का उद्यम ऋण मात्र 5% ब्याज पर + ₹15,000 टूलकिट ग्रांट + 5 दिन की बेसिक ट्रेनिंग ₹500/दिन स्टाइपेंड।',
    targetAudience: '18 पारंपरिक दस्तकार व कारीगर (बढ़ई, लोहार, कुम्हार, दर्जी, मोची आदि)',
    eligibilityShort: 'पारंपरिक हाथों व औजारों से काम करने वाले 18 ट्रेड्स के कारीगर',
    keyHighlights: ['₹15,000 ई-वाउचर टूलकिट', 'पीएम विश्वकर्मा प्रमाणपत्र व आईडी', 'सस्ती कार्यशील पूंजी'],
    documents: ['आधार कार्ड', 'बैंक खाता', 'कारीगर ट्रेड सत्यापन'],
    officialUrl: 'https://pmvishwakarma.gov.in',
    state: 'All India',
    applicationMode: 'Online'
  },
  {
    id: 'pm-surya-ghar',
    title: 'PM Surya Ghar: Muft Bijli Yojana',
    titleHindi: 'पीएम सूर्य घर मुफ्त बिजली योजना',
    ministry: 'Ministry of New & Renewable Energy',
    category: 'housing',
    benefitPill: '₹78,000 तक सोलर सब्सिडी + 300 यूनिट मुफ्त',
    benefits: 'रूफटॉप सोलर पैनल लगाने पर ₹78,000 तक की प्रत्यक्ष सरकारी सब्सिडी और प्रति माह 300 यूनिट तक मुफ्त बिजली।',
    targetAudience: 'भारतीय आवासीय उपभोक्ता व परिवार',
    eligibilityShort: 'अपनी छत वाले वैध बिजली कनेक्शन धारक',
    keyHighlights: ['300 यूनिट मुफ्त बिजली', 'अतिरिक्त बिजली डिस्कॉम को बेचें', 'सस्ता बैंक लोन'],
    documents: ['बिजली बिल', 'आधार कार्ड', 'छत की फोटो', 'बैंक पासबुक'],
    officialUrl: 'https://pmsuryaghar.gov.in',
    state: 'All India',
    applicationMode: 'Online'
  },
  {
    id: 'pm-awas-yojana',
    title: 'Pradhan Mantri Awas Yojana (PMAY-G/U)',
    titleHindi: 'पीएम आवास योजना (ग्रामीण व शहरी)',
    ministry: 'Ministry of Housing & Urban Affairs / Rural Development',
    category: 'housing',
    benefitPill: '₹1.20 - ₹2.50 Lakh पक्के मकान हेतु',
    benefits: 'मैदानी क्षेत्रों में ₹1.20 लाख और पहाड़ी क्षेत्रों में ₹1.30 लाख + स्वच्छ भारत मिशन तहत शौचालय निर्माण के ₹12,000 अतिरिक्त।',
    targetAudience: 'बेघर व कच्चे मकान में रहने वाले गरीब परिवार',
    eligibilityShort: 'SECC 2011 लिस्टेड कच्चे मकान वाले परिवार',
    keyHighlights: ['पक्का मकान निर्माण सहायता', 'सीधे बैंक खाते में किस्तें', 'महिला स्वामित्व को प्राथमिकता'],
    documents: ['आधार कार्ड', 'जॉब कार्ड (मनरेगा)', 'बैंक पासबुक', 'जमीन स्वामित्व प्रमाण'],
    officialUrl: 'https://pmaymis.gov.in',
    state: 'All India',
    applicationMode: 'Both'
  },
  {
    id: 'sukanya-samriddhi',
    title: 'Sukanya Samriddhi Yojana (SSY)',
    titleHindi: 'सुकन्या समृद्धि योजना (बेटी बचाओ)',
    ministry: 'Ministry of Finance / Dept of Posts',
    category: 'women',
    benefitPill: '8.2% उच्चतम ब्याज + 100% टैक्स फ्री',
    benefits: 'बेटियों के भविष्य और पढ़ाई के लिए 8.2% की सर्वाधिक सरकारी ब्याज दर और सेक्शन 80C तहत संपूर्ण टैक्स छूट।',
    targetAudience: '10 वर्ष से कम आयु की बालिकाओं के अभिभावक',
    eligibilityShort: '10 वर्ष तक की बेटी के नाम पर माता-पिता द्वारा खाता',
    keyHighlights: ['न्यूनतम ₹250 से शुरुआत', '18 वर्ष पर उच्च शिक्षा हेतु 50% निकासी', '21 वर्ष पर पूर्ण परिपक्वता'],
    documents: ['बेटी का जन्म प्रमाण पत्र', 'माता-पिता का आधार व पैन', 'निवास प्रमाण पत्र'],
    officialUrl: 'https://www.indiapost.gov.in',
    state: 'All India',
    applicationMode: 'Both'
  },
  {
    id: 'pm-mudra-yojana',
    title: 'PM Mudra Yojana (PMMY)',
    titleHindi: 'प्रधानमंत्री मुद्रा योजना (स्वरोजगार लोन)',
    ministry: 'Ministry of Finance',
    category: 'business',
    benefitPill: '₹50,000 से ₹20 Lakh तक बिना गारंटी लोन',
    benefits: 'छोटे व्यवसाय, दुकान, निर्माण व सेवा क्षेत्र के लिए बिना किसी संपत्ति को गिरवी रखे (Collateral-Free) बैंक लोन।',
    targetAudience: 'युवा उद्यमी, दुकानदार, स्टार्टअप व लघु व्यापारी',
    eligibilityShort: '18+ वर्ष के भारतीय नागरिक जो नया या मौजूदा व्यवसाय बढ़ाना चाहते हैं',
    keyHighlights: ['शिशु (₹50K), किशोर (₹5L), तरुण (₹10L-20L)', 'बिना गारंटी लोन', 'मुद्रा कार्ड सुविधा'],
    documents: ['आधार कार्ड', 'पैन कार्ड', 'व्यवसाय प्रोजेक्ट रिपोर्ट', '6 महीने का बैंक स्टेटमेंट'],
    officialUrl: 'https://www.mudra.org.in',
    state: 'All India',
    applicationMode: 'Both'
  },
  {
    id: 'pm-fasal-bima',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    titleHindi: 'पीएम फसल बीमा योजना',
    ministry: 'Ministry of Agriculture',
    category: 'farmer',
    benefitPill: 'फसल नुकसान पर 100% बीमा क्लेम',
    benefits: 'बाढ़, सूखा, कीट हमले या ओलावृष्टि से फसल नष्ट होने पर खरीफ फसल पर मात्र 2% और रबी पर 1.5% प्रीमियम पर पूर्ण मुआवजा।',
    targetAudience: 'सभी अधिसूचित फसलों के किसान (बटाईदार भी)',
    eligibilityShort: 'अधिसूचित क्षेत्र में अधिसूचित फसल उगाने वाले किसान',
    keyHighlights: ['न्यूनतम प्रीमियम दरें', 'पोस्ट-हार्वेस्ट नुकसान भी कवर', 'सीधे बैंक खाते में बीमा भुगतान'],
    documents: ['खसरा/खतौनी', 'बुवाई प्रमाण पत्र', 'आधार कार्ड', 'बैंक पासबुक'],
    officialUrl: 'https://pmfby.gov.in',
    state: 'All India',
    applicationMode: 'Online'
  },
  {
    id: 'nsp-yasasvi',
    title: 'National Scholarship Portal & PM Yasasvi',
    titleHindi: 'राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) व यशस्वी',
    ministry: 'Ministry of Social Justice & Empowerment',
    category: 'youth',
    benefitPill: '₹75,000 - ₹1,25,000 / वर्ष छात्रवृत्ति',
    benefits: '9वीं से लेकर उच्च शिक्षा (Graduation, B.Tech, BCA, Medical) तक के मेधावी व जरूरतमंद छात्रों को प्रत्यक्ष ट्यूशन फीस व रखरखाव अनुदान।',
    targetAudience: 'OBC, SC, ST, EBC और अल्पसंख्यक छात्र',
    eligibilityShort: 'पारिवारिक वार्षिक आय ₹2.5 लाख से कम और पिछले वर्ष 55%+ अंक',
    keyHighlights: ['वन-नेशन वन-स्कॉलरशिप', 'डायरेक्ट बैंक ट्रांसफर', 'टॉप क्लास कॉलेज अप्रूव्ड'],
    documents: ['अंकतालिका', 'आय प्रमाण पत्र', 'जाति प्रमाण पत्र', 'फीस रसीद', 'आधार'],
    officialUrl: 'https://scholarships.gov.in',
    state: 'All India',
    applicationMode: 'Online'
  },
  {
    id: 'pm-svanidhi',
    title: 'PM SVANidhi Scheme for Street Vendors',
    titleHindi: 'पीएम स्वनिधि योजना (स्ट्रीट वेंडर लोन)',
    ministry: 'Ministry of Housing & Urban Affairs',
    category: 'worker',
    benefitPill: '₹10,000 - ₹50,000 कार्यशील लोन @ 7% सब्सिडी',
    benefits: 'रेहड़ी, पटरी, ठेला व खोमचे वालों के लिए ₹10,000 की पहली किस्त, समय पर चुकाने पर ₹20,000 व ₹50,000 की अगली किस्तें 7% ब्याज सब्सिडी सहित।',
    targetAudience: 'शहरी व अर्ध-शहरी क्षेत्रों के स्ट्रीट वेंडर्स',
    eligibilityShort: 'शहरी निकायों द्वारा जारी वेंडिंग सर्टिफिकेट या पहचान पत्र धारक',
    keyHighlights: ['कैशबैक डिजिटल इंसेंटिव (₹1,200/yr)', 'बिना किसी गारंटी लोन', 'तेज अप्रूवल'],
    documents: ['आधार कार्ड', 'वेंडिंग पहचान पत्र / LOR', 'बैंक खाता विवरण'],
    officialUrl: 'https://pmsvanidhi.mohua.gov.in',
    state: 'All India',
    applicationMode: 'Online'
  },
  {
    id: 'atal-pension',
    title: 'Atal Pension Yojana (APY)',
    titleHindi: 'अटल पेंशन योजना',
    ministry: 'Pension Fund Regulatory & Development Authority (PFRDA)',
    category: 'worker',
    benefitPill: '₹1,000 - ₹5,000 / माह आजीवन सरकारी पेंशन',
    benefits: '60 वर्ष की आयु के बाद जीवन भर निश्चित मासिक पेंशन (₹1,000 से ₹5,000) तथा ग्राहक की मृत्यु के बाद जीवनसाथी को समान पेंशन।',
    targetAudience: '18 से 40 वर्ष के असंगठित क्षेत्र के नागरिक',
    eligibilityShort: '18-40 वर्ष आयु वर्ग के बैंक बचत खाता धारक',
    keyHighlights: ['सरकारी गारंटीयुक्त रिटर्न', 'ऑटो डेबिट सुविधा', 'नॉमिनी को पूरा कॉर्पस'],
    documents: ['आधार कार्ड', 'बैंक बचत खाता', 'सक्रिय मोबाइल नंबर'],
    officialUrl: 'https://enps.nsdl.com',
    state: 'All India',
    applicationMode: 'Both'
  },
  {
    id: 'bihar-udyami',
    title: 'Bihar Mukhyamantri Udyami Yojana',
    titleHindi: 'बिहार मुख्यमंत्री उद्यमी योजना (10 लाख)',
    ministry: 'Department of Industries, Govt of Bihar',
    category: 'business',
    benefitPill: '₹10 लाख (₹5L मुफ्त अनुदान + ₹5L मात्र 1% ऋण)',
    benefits: 'बिहार के युवाओं व महिलाओं को नया उद्योग लगाने हेतु ₹10 लाख: जिसमें ₹5 लाख पूर्णतः माफ (अनुदान) और ₹5 लाख पर सिर्फ 1% ब्याज (महिलाओं के लिए 0%)।',
    targetAudience: 'बिहार के 10+2 / ITI / डिप्लोमा / ग्रेजुएट युवा व महिलाएं',
    eligibilityShort: 'बिहार का मूल निवासी, 18-50 वर्ष आयु, इंटरमीडिएट या समकक्ष उत्तीर्ण',
    keyHighlights: ['₹5,00,000 का सीधा अनुदान', 'महिलाओं के लिए ब्याजमुक्त (0%)', '7 वर्षों में आसान 84 किस्तें'],
    documents: ['निवास प्रमाण पत्र', '12वीं/ग्रेजुएशन मार्कशीट', 'जाति प्रमाण पत्र', 'पैन कार्ड'],
    officialUrl: 'https://udyami.bihar.gov.in',
    state: 'Bihar',
    applicationMode: 'Online'
  },
  {
    id: 'bihar-kanya-utthan',
    title: 'Mukhyamantri Kanya Utthan Yojana (Bihar)',
    titleHindi: 'मुख्यमंत्री कन्या उत्थान योजना (बिहार)',
    ministry: 'Education & Social Welfare Dept, Bihar',
    category: 'women',
    benefitPill: 'ग्रेजुएशन पर ₹50,000 + 12वीं पर ₹25,000',
    benefits: 'बिहार की बालिकाओं को जन्म से स्नातक तक वित्तीय सहायता: 12वीं पास करने पर ₹25,000 और ग्रेजुएशन पूरा करने पर एकमुश्त ₹50,000 सीधे खाते में।',
    targetAudience: 'बिहार की छात्राएं व बेटियां',
    eligibilityShort: 'बिहार के मान्यता प्राप्त कॉलेज से स्नातक पास छात्राएं',
    keyHighlights: ['मेधासॉफ्ट पोर्टल पर सीधी ट्रैकिंग', 'अविवाहित छात्राओं को प्राथमिकता', 'डीबीटी से भुगतान'],
    documents: ['ग्रेजुएशन मार्कशीट', 'आधार कार्ड', 'बैंक पासबुक (छात्रा के नाम)', 'निवास प्रमाण पत्र'],
    officialUrl: 'https://medhasoft.bih.nic.in',
    state: 'Bihar',
    applicationMode: 'Online'
  },
  {
    id: 'up-kanya-sumangala',
    title: 'Mukhyamantri Kanya Sumangala Yojana (UP)',
    titleHindi: 'मुख्यमंत्री कन्या सुमंगला योजना (उत्तर प्रदेश)',
    ministry: 'Women and Child Development, Uttar Pradesh',
    category: 'women',
    benefitPill: '₹25,000 की 6 चरणों में वित्तीय सहायता',
    benefits: 'बालिका के जन्म, टीकाकरण, कक्षा 1, 6, 9 और 12वीं/डिग्री में प्रवेश पर कुल ₹25,000 की चरणबद्ध आर्थिक मदद।',
    targetAudience: 'उत्तर प्रदेश के परिवार (वार्षिक आय ₹3 लाख तक)',
    eligibilityShort: 'यूपी का स्थायी निवासी, अधिकतम 2 बालिकाओं वाले परिवार',
    keyHighlights: ['जन्म से लेकर डिग्री तक सुरक्षा', 'ऑनलाइन पोर्टल आवेदन', 'महिला सशक्तिकरण'],
    documents: ['बालिका का जन्म प्रमाण पत्र', 'माता-पिता का आधार', 'आय प्रमाण पत्र (₹3L तक)'],
    officialUrl: 'https://mksy.up.gov.in',
    state: 'Uttar Pradesh',
    applicationMode: 'Online'
  },
  {
    id: 'mp-ladli-behna',
    title: 'Mukhyamantri Ladli Behna Yojana (MP)',
    titleHindi: 'मुख्यमंत्री लाड़ली बहना योजना (मध्य प्रदेश)',
    ministry: 'Women & Child Development, Madhya Pradesh',
    category: 'women',
    benefitPill: '₹1,250 / माह सीधे बैंक खाते में (₹15,000/वर्ष)',
    benefits: 'मध्य प्रदेश की 21 से 60 वर्ष की विवाहित, विधवा, परित्यक्ता बहनों को हर महीने की 10 तारीख को ₹1,250 की सीधी आर्थिक सहायता।',
    targetAudience: 'मध्य प्रदेश की पात्र महिलाएं व बहनें',
    eligibilityShort: '21-60 वर्ष विवाहित महिला, परिवार की आय ₹2.5 लाख से कम',
    keyHighlights: ['हर महीने निश्चित सहायता', 'डीबीटी सक्षम बैंक खाते में ट्रांसफर', 'ग्राम पंचायत स्तर पर कैंप'],
    documents: ['समग्र आईडी', 'आधार कार्ड', 'डीबीटी सक्रिय बैंक खाता'],
    officialUrl: 'https://cmladlibehna.mp.gov.in',
    state: 'Madhya Pradesh',
    applicationMode: 'Both'
  }
];

// Comprehensive Sarkari Result Live Jobs, Results, Admit Cards & Keys
const SARKARI_RESULTS_DATA: SarkariResultItem[] = [
  {
    id: 'ssc-gd-2026',
    title: 'SSC GD Constable in BSF, CISF, CRPF, SSB, ITBP 2026',
    titleHindi: 'एसएससी जीडी कांस्टेबल भर्ती 2026',
    board: 'Staff Selection Commission (SSC)',
    type: 'job',
    qualification: '10th Class (High School) Pass',
    totalPosts: '39,481 Posts',
    lastDate: '2026-11-20',
    status: 'Active',
    officialUrl: 'https://ssc.gov.in',
    fee: '₹100 (SC/ST/Female: Free)',
    salary: 'Pay Level-3 (₹21,700 - ₹69,100)',
    ageLimit: '18 - 23 Years (Age relaxation applicable)',
    state: 'All India',
    details: 'BSF, CISF, CRPF, ITBP, SSB, SSF और असम राइफल्स में 39,481 पदों पर सबसे बड़ी कांस्टेबल भर्ती। कंप्यूटर आधारित परीक्षा (CBE) द्वारा चयन।',
    steps: ['ssc.gov.in पर वन टाइम रजिस्ट्रेशन (OTR) करें', 'GD Constable लिंक पर फॉर्म भरें', 'ऑनलाइन फीस ₹100 जमा करें', 'एप्लीकेशन फॉर्म प्रिंट करें']
  },
  {
    id: 'rrb-ntpc-2026',
    title: 'Railway RRB NTPC Graduate & Undergraduate CEN 05/2026',
    titleHindi: 'रेलवे आरआरबी एनटीपीसी भर्ती 2026',
    board: 'Railway Recruitment Boards (RRB)',
    type: 'job',
    qualification: '12th Pass / Any Bachelor Degree',
    totalPosts: '11,558 Posts',
    lastDate: '2026-11-15',
    status: 'Closing Soon',
    officialUrl: 'https://rrbapply.gov.in',
    fee: '₹500 (₹400 Refundable on CBT-1 attendance)',
    salary: 'Level 2 to Level 6 (₹19,900 - ₹35,400+)',
    ageLimit: '18 - 36 Years (3 Years COVID relaxation)',
    state: 'All India',
    details: 'Goods Train Manager, Station Master, Senior Clerk, Junior Clerk और Commercial Apprentice पदों के लिए बहुप्रतीक्षित भर्ती।',
    steps: ['rrbapply.gov.in पर जाएं', 'अपनी पसंदीदा आरआरबी जोन चुनें', 'योग्यता विवरण व फोटो अपलोड करें', 'फाइनल सबमिट करें']
  },
  {
    id: 'upsc-cse-2026',
    title: 'UPSC Civil Services Examination (IAS / IPS / IFS) 2026',
    titleHindi: 'संघ लोक सेवा आयोग सिविल सेवा (आईएएस/आईपीएस)',
    board: 'Union Public Service Commission (UPSC)',
    type: 'job',
    qualification: 'Graduation in Any Discipline (BCA / B.Tech / BA / B.Sc)',
    totalPosts: '1,056 Posts',
    lastDate: '2026-12-05',
    status: 'Active',
    officialUrl: 'https://upsc.gov.in',
    fee: '₹100 (SC/ST/PwBD/Female: Free)',
    salary: 'Pay Level 10 (₹56,100 - ₹2,50,000)',
    ageLimit: '21 - 32 Years',
    state: 'All India',
    details: 'देश की सर्वोच्च प्रशासनिक सेवा (IAS, IPS, IFS, IRS) में चयन हेतु राष्ट्रीय स्तर की परीक्षा।',
    steps: ['upsconline.nic.in पर OTR प्रोफाइल बनाएं', 'CSE Prelims फॉर्म भरें', 'परीक्षा केंद्र चुनें', 'सबमिट करें']
  },
  {
    id: 'bpsc-70th-cce',
    title: 'BPSC 70th Integrated Combined Competitive Examination (CCE)',
    titleHindi: 'बीपीएससी 70वीं संयुक्त प्रारंभिक प्रतियोगिता परीक्षा',
    board: 'Bihar Public Service Commission (BPSC)',
    type: 'job',
    qualification: 'Bachelor Degree in Any Stream',
    totalPosts: '1,957 Posts',
    lastDate: '2026-11-04',
    status: 'Active',
    officialUrl: 'https://bpsc.bih.nic.in',
    fee: '₹600 (Bihar SC/ST/Female: ₹150)',
    salary: 'Level 7 to Level 9 (SDM, DSP, BDO, CO)',
    ageLimit: '20/21/22 to 37 Years (Female: 40, OBC: 40)',
    state: 'Bihar',
    details: 'बिहार प्रशासनिक सेवा, पुलिस उपाधीक्षक, अनुमंडल पदाधिकारी और प्रखंड विकास पदाधिकारी के रिकॉर्ड 1,957 पदों की भर्ती।',
    steps: ['onlinebpsc.bihar.gov.in पर जाएं', 'नया रजिस्ट्रेशन करें', 'दस्तावेज अपलोड करें', 'शुल्क भुगतान करें']
  },
  {
    id: 'ibps-po-2026',
    title: 'IBPS Probationary Officer / Management Trainee XVI',
    titleHindi: 'आईबीपीएस बैंक पीओ भर्ती 2026',
    board: 'Institute of Banking Personnel Selection',
    type: 'job',
    qualification: 'Any Degree (BCA, B.Tech, B.Com, B.Sc)',
    totalPosts: '4,455 Posts',
    lastDate: '2026-11-25',
    status: 'Active',
    officialUrl: 'https://ibps.in',
    fee: '₹850 (SC/ST/PWD: ₹175)',
    salary: 'Basic Pay ₹36,000+ (Gross ₹52,000+)',
    ageLimit: '20 - 30 Years',
    state: 'All India',
    details: 'पीएनबी, बैंक ऑफ बड़ौदा, केनरा बैंक, यूबीआई समेत 11 राष्ट्रीयकृत बैंकों में प्रोबेशनरी ऑफिसर पदों पर नियुक्ति।',
    steps: ['ibps.in पर PO/MT लिंक खोलें', 'ऑनलाइन फॉर्म भरें व फोटो-साइन लगाएं', 'फीस जमा करें']
  },
  {
    id: 'ssc-cgl-result',
    title: 'SSC CGL 2026 Tier-1 Computer Based Examination Result',
    titleHindi: 'एसएससी सीजीएल टियर-1 परीक्षा परिणाम व कट-ऑफ जारी',
    board: 'Staff Selection Commission (SSC)',
    type: 'result',
    qualification: 'Graduate Level',
    status: 'Result Live',
    officialUrl: 'https://ssc.gov.in',
    state: 'All India',
    details: 'एसएससी द्वारा सीजीएल टियर-1 परीक्षा का आधिकारिक परिणाम और श्रेणीवार कट-ऑफ पीडीएफ जारी कर दिया गया है।',
    steps: ['ssc.gov.in पोर्टल पर जाएं', 'Result सेक्शन में CGL टैब चुनें', 'रोल नंबर से पीडीएफ में नाम सर्च करें']
  },
  {
    id: 'bpsc-tre-result',
    title: 'BPSC School Teacher TRE 3.0 Scorecard & Merit List',
    titleHindi: 'बीपीएससी अध्यापक नियुक्ति परीक्षा TRE 3.0 रिजल्ट',
    board: 'Bihar Public Service Commission',
    type: 'result',
    qualification: 'B.Ed / D.El.Ed / CTET / STET',
    status: 'Result Live',
    officialUrl: 'https://bpsc.bih.nic.in',
    state: 'Bihar',
    details: 'कक्षा 1 से 5, 6 से 8, 9-10 और 11-12 के विद्यालय अध्यापकों का विषयवार फाइनल रिजल्ट और जिला आवंटन सूची जारी।',
    steps: ['bpsc.bih.nic.in पर जाएं', 'अपने विषय का रिजल्ट पीडीएफ डाउनलोड करें', 'कट-ऑफ अंक देखें']
  },
  {
    id: 'ssc-gd-admit',
    title: 'SSC GD Constable Tier-1 Admit Card & Exam City Slip',
    titleHindi: 'एसएससी जीडी कांस्टेबल एडमिट कार्ड व एग्जाम सिटी स्लिप',
    board: 'Staff Selection Commission (SSC)',
    type: 'admit',
    qualification: '10th Pass',
    status: 'Admit Card Out',
    officialUrl: 'https://ssc.gov.in',
    state: 'All India',
    details: 'एसएससी जीडी परीक्षा 2026 के लिए सभी क्षेत्रों (CR, NR, ER, WR, SR) का एडमिट कार्ड और परीक्षा शहर स्लिप लाइव है।',
    steps: ['अपने संबंधित रीजनल पोर्टल (जैसे ssc-cr.org) पर जाएं', 'रजिस्ट्रेशन नंबर व जन्मतिथि दर्ज करें', 'एडमिट कार्ड डाउनलोड करें']
  },
  {
    id: 'cuet-ug-admission',
    title: 'NTA CUET UG 2026 Central University Entrance Form',
    titleHindi: 'सीयूईटी यूजी 2026 केंद्रीय विश्वविद्यालय प्रवेश परीक्षा',
    board: 'National Testing Agency (NTA)',
    type: 'admission',
    qualification: '12th Appearing or Passed',
    status: 'Active',
    officialUrl: 'https://cuetug.ntaonline.in',
    state: 'All India',
    details: 'डीयू, जेएनयू, बीएचयू, इलाहाबाद यूनिवर्सिटी समेत देश की सभी सेंट्रल यूनिवर्सिटीज में स्नातक दाखिले हेतु सिंगल विंडो टेस्ट।',
    steps: ['cuetug.ntaonline.in पर ऑनलाइन आवेदन करें', 'विश्वविद्यालय व कोर्स का चयन करें', 'डोमेन टेस्ट विषय चुनें']
  }
];

export const MeriYojna: React.FC<MeriYojnaProps> = React.memo(({ profile, onUpdateProfile, initialQuery = '' }) => {
  const isHi = profile.language === 'hi';

  // Master Section: 'schemes' (Yojana) vs 'sarkari' (Sarkari Result & Jobs)
  const [activeMainTab, setActiveMainTab] = useState<'schemes' | 'sarkari'>('schemes');

  // Scheme Filters
  const [schemeCategory, setSchemeCategory] = useState<string>('all');
  const [schemeState, setSchemeState] = useState<string>(profile.state || 'All India');
  const [schemeSearch, setSchemeSearch] = useState<string>('');

  // Sarkari Result Filters
  const [sarkariType, setSarkariType] = useState<'all' | 'job' | 'result' | 'admit' | 'admission'>('all');
  const [sarkariQual, setSarkariQual] = useState<string>('all');
  const [sarkariSearch, setSarkariSearch] = useState<string>('');

  // Embedded Vyron AI Assistant State
  const [aiInputPrompt, setAiInputPrompt] = useState<string>(initialQuery || '');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const voiceListenerRef = React.useRef<VoiceListener | null>(null);

  // Detail Modal State
  const [detailModalItem, setDetailModalItem] = useState<{ type: 'scheme' | 'sarkari'; item: any } | null>(null);

  // Trigger Embedded Vyron AI Search
  const handleAskVyronAi = async (customPrompt?: string) => {
    const queryToRun = (customPrompt || aiInputPrompt).trim();
    if (!queryToRun) return;

    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/yojna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToRun,
          state: schemeState,
          language: profile.language,
          mode: activeMainTab === 'sarkari' ? 'result' : 'scheme'
        })
      });

      const data = await res.json();
      if (data.result) {
        setAiResponse(data.result);
      } else {
        setAiResponse(isHi ? 'माफ़ करें, जानकारी प्राप्त नहीं हो सकी। कृपया दोबारा प्रयास करें।' : 'Could not fetch information at this time. Please try again.');
      }
    } catch (err: any) {
      setAiResponse(`Network error: ${err.message || 'Service busy'}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Voice Input Handler
  const handleToggleVoice = () => {
    if (isVoiceListening) {
      if (voiceListenerRef.current) voiceListenerRef.current.stop();
      setIsVoiceListening(false);
      return;
    }

    if (!voiceListenerRef.current) {
      voiceListenerRef.current = new VoiceListener();
    }

    voiceListenerRef.current.start(
      (transcript) => {
        setAiInputPrompt(transcript);
        setIsVoiceListening(false);
        handleAskVyronAi(transcript);
      },
      (err) => {
        console.warn('Voice recognition notice:', err);
        setIsVoiceListening(false);
      },
      profile.language === 'hi' ? 'hi' : 'en'
    );
    setIsVoiceListening(true);
  };

  // Bookmark Toggle
  const handleBookmark = (scheme: SchemeItem) => {
    const exists = profile.savedSchemes.some((s) => s.id === scheme.id);
    if (exists) {
      onUpdateProfile({ savedSchemes: profile.savedSchemes.filter((s) => s.id !== scheme.id) });
    } else {
      onUpdateProfile({ savedSchemes: [scheme, ...profile.savedSchemes] });
    }
  };

  // Filtered Schemes
  const filteredSchemes = useMemo(() => {
    return ALL_INDIA_SCHEMES.filter((sch) => {
      const matchCat = schemeCategory === 'all' || sch.category === schemeCategory;
      const matchState = schemeState === 'All India' || sch.state === 'All India' || sch.state.toLowerCase() === schemeState.toLowerCase();
      const matchSearch = !schemeSearch.trim() || 
        sch.title.toLowerCase().includes(schemeSearch.toLowerCase()) || 
        (sch.titleHindi && sch.titleHindi.includes(schemeSearch)) ||
        sch.ministry.toLowerCase().includes(schemeSearch.toLowerCase()) ||
        sch.benefits.toLowerCase().includes(schemeSearch.toLowerCase());
      return matchCat && matchState && matchSearch;
    });
  }, [schemeCategory, schemeState, schemeSearch]);

  // Filtered Sarkari Results
  const filteredSarkari = useMemo(() => {
    return SARKARI_RESULTS_DATA.filter((item) => {
      const matchType = sarkariType === 'all' || item.type === sarkariType;
      const matchQual = sarkariQual === 'all' || item.qualification.toLowerCase().includes(sarkariQual.toLowerCase());
      const matchSearch = !sarkariSearch.trim() ||
        item.title.toLowerCase().includes(sarkariSearch.toLowerCase()) ||
        (item.titleHindi && item.titleHindi.includes(sarkariSearch)) ||
        item.board.toLowerCase().includes(sarkariSearch.toLowerCase());
      return matchType && matchQual && matchSearch;
    });
  }, [sarkariType, sarkariQual, sarkariSearch]);

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* 1. COMPACT VISUAL HEADER BANNER */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#000080] via-[#3b1285] to-[#f97316] text-white shadow-xl relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2 backdrop-blur-md">
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              <span>{isHi ? 'भारत सरकार योजना व सरकारी रिजल्ट पोर्टल' : 'India Govt Schemes & Sarkari Result Portal'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-2">
              <span>{isHi ? 'मेरी योजना व सरकारी रिजल्ट' : 'Meri Yojna & Sarkari Result'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-100/90 mt-1 max-w-xl font-medium">
              {isHi
                ? 'सभी 28 राज्यों और केंद्र की 250+ योजनाएं, सब्सिडी, पीएम किसान, आयुष्मान तथा सरकारी नौकरी व रिजल्ट एक ही जगह।'
                : 'Verified Central & 28 States Welfare Schemes, Subsidies, PM Kisan, Ayushman & Official Sarkari Results.'}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 text-center">
              <div className="text-lg sm:text-xl font-black text-amber-300">250+</div>
              <div className="text-[10px] text-white/80 font-bold uppercase">{isHi ? 'योजनाएं' : 'Schemes'}</div>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 text-center">
              <div className="text-lg sm:text-xl font-black text-emerald-300">100%</div>
              <div className="text-[10px] text-white/80 font-bold uppercase">{isHi ? 'सत्यापित' : 'Verified'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EMBEDDED VYRON AI ASSISTANT WIDGET */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-purple-500/10 via-white to-blue-500/10 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-purple-950/40 backdrop-blur-xl border-2 border-purple-400/40 dark:border-purple-500/30 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-purple-900 dark:text-purple-300">
            <div className="p-1.5 rounded-xl bg-purple-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <span>{isHi ? 'Vyron AI योजना व रिजल्ट सहायक' : 'Vyron AI Yojna & Result Finder'}</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            {isHi ? 'तुरंत पूछें' : 'Instant AI Assist'}
          </span>
        </div>

        {/* AI Input Box with Voice & Send */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1 min-w-0 flex items-center bg-white dark:bg-slate-800/90 border border-purple-300 dark:border-purple-700/60 focus-within:ring-2 focus-within:ring-purple-500/40 rounded-2xl px-3.5 py-2 shadow-inner">
            <Search className="w-4 h-4 text-purple-500 shrink-0 mr-2" />
            <input
              type="text"
              value={aiInputPrompt}
              onChange={(e) => setAiInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAskVyronAi();
              }}
              placeholder={isHi 
                ? 'Vyron AI से पूछें: जैसे "12th पास के लिए सरकारी नौकरी" या "किसान सब्सिडी"..."'
                : 'Ask Vyron AI: e.g. "Latest Sarkari Jobs for 12th pass" or "Kisan loan subsidy"..."'
              }
              className="w-full bg-transparent border-0 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            title={isVoiceListening ? 'Stop mic' : 'Voice search'}
            className={`p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all border ${
              isVoiceListening
                ? 'bg-rose-600 text-white animate-pulse border-rose-400 shadow-md shadow-rose-500/40'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
            }`}
          >
            {isVoiceListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4 text-purple-600 dark:text-cyan-400" />}
          </button>

          {/* AI Submit Button */}
          <button
            type="button"
            onClick={() => handleAskVyronAi()}
            disabled={aiLoading || !aiInputPrompt.trim()}
            className="px-4 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span className="hidden sm:inline">{isHi ? 'पूछें' : 'Ask'}</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-[11px]">
          <span className="text-slate-400 font-bold shrink-0 text-[10px] uppercase">{isHi ? 'सुझाव:' : 'Quick:'}</span>
          {[
            { label: '⚡ 12th Pass Sarkari Jobs', query: '12th Pass ke liye current sarkari naukri aur form details batao' },
            { label: '🌾 Kisan ₹6,000 & Subsidy', query: 'Kisan Samman Nidhi aur kheti subsidy schemes details batao' },
            { label: '🏥 ₹5 Lakh Ayushman Card', query: 'Ayushman card eligibility aur hospital me free ilaj ka niyam kya hai' },
            { label: '👩 Sukanya & Mahila Yojna', query: 'Beti aur mahilaon ke liye top sarkari yojanaen batao' },
            { label: '🏠 PM Awas ₹1.2 Lakh', query: 'PM Awas Yojana me ghar banane ke liye paise kaise milte hain' },
            { label: '💻 BCA / Computer Jobs', query: 'BCA aur Computer Science students ke liye Government jobs list' },
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setAiInputPrompt(chip.query);
                handleAskVyronAi(chip.query);
              }}
              className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800/60 whitespace-nowrap cursor-pointer transition-colors font-medium shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* AI Direct Output Card */}
        {aiLoading && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 flex items-center gap-2 text-purple-600 dark:text-cyan-400 text-xs font-bold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Vyron AI सरकारी डेटा और पात्रता विश्लेषण कर रहा है...</span>
          </div>
        )}

        {aiResponse && !aiLoading && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700/80 shadow-md space-y-2.5 animate-fade-in relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isHi ? 'Vyron AI सत्यापित उत्तर' : 'Vyron AI Verified Result'}</span>
              </span>
              <button
                type="button"
                onClick={() => setAiResponse(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
              {aiResponse}
            </div>
          </div>
        )}
      </div>

      {/* 3. DUAL MASTER SWITCHER: 🏛️ SCHEMES vs 🎯 SARKARI RESULT */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setActiveMainTab('schemes')}
          className={`flex-1 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeMainTab === 'schemes'
              ? 'bg-gradient-to-r from-[#000080] to-blue-700 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{isHi ? '🏛️ सरकारी योजनाएं (Schemes)' : '🏛️ Govt Schemes'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('sarkari')}
          className={`flex-1 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeMainTab === 'sarkari'
              ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{isHi ? '🎯 सरकारी रिजल्ट व नौकरी' : '🎯 Sarkari Result & Jobs'}</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION A: 🏛️ GOVERNMENT SCHEMES DIRECTORY (LOW-TEXT CARDS) */}
      {/* ======================================================== */}
      {activeMainTab === 'schemes' && (
        <div className="space-y-4">
          {/* Quick Filters Bar (Category & State) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs">
              {[
                { id: 'all', label: isHi ? '🌟 सभी योजनाएं' : '🌟 All Schemes' },
                { id: 'farmer', label: isHi ? '🌾 किसान (Agriculture)' : '🌾 Farmers' },
                { id: 'youth', label: isHi ? '🎓 छात्र व युवा (Youth)' : '🎓 Students/Youth' },
                { id: 'women', label: isHi ? '👩 महिलाएं व बेटियां' : '👩 Women & Girls' },
                { id: 'health', label: isHi ? '🏥 स्वास्थ्य (Ayushman)' : '🏥 Health' },
                { id: 'housing', label: isHi ? '🏠 आवास व सोलर' : '🏠 Housing & Solar' },
                { id: 'worker', label: isHi ? '💼 श्रमिक व दस्तकार' : '💼 Workers/MSME' },
                { id: 'business', label: isHi ? '🏪 मुद्रा व व्यापार' : '🏪 Small Business' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSchemeCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all cursor-pointer ${
                    schemeCategory === cat.id
                      ? 'bg-[#000080] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* State Selector & Search */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={schemeSearch}
                  onChange={(e) => setSchemeSearch(e.target.value)}
                  placeholder={isHi ? 'योजना या मंत्रालय का नाम खोजें...' : 'Search scheme name or ministry...'}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={schemeState}
                onChange={(e) => setSchemeState(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="All India">🇮🇳 All India (केंद्र + सभी राज्य)</option>
                <option value="Bihar">Bihar (बिहार)</option>
                <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
                <option value="Rajasthan">Rajasthan (राजस्थान)</option>
                <option value="Delhi">Delhi (दिल्ली)</option>
                <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                <option value="West Bengal">West Bengal (पश्चिम बंगाल)</option>
                <option value="Haryana">Haryana (हरियाणा)</option>
                <option value="Punjab">Punjab (पंजाब)</option>
                <option value="Gujarat">Gujarat (गुजरात)</option>
                <option value="Jharkhand">Jharkhand (झारखंड)</option>
              </select>
            </div>
          </div>

          {/* Low-Text Visual Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredSchemes.map((sch) => {
              const isSaved = profile.savedSchemes.some((s) => s.id === sch.id);
              return (
                <div
                  key={sch.id}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-[#000080]/50 dark:hover:border-cyan-400/50 shadow-xs flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-2.5">
                    {/* Header tags: Ministry & Bookmark */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#000080] dark:text-sky-300 border border-blue-200 dark:border-blue-800/50 truncate max-w-[200px]">
                        {sch.state === 'All India' ? '🇮🇳 Central' : `📍 ${sch.state}`}
                      </span>

                      <button
                        onClick={() => handleBookmark(sch)}
                        title="Bookmark scheme"
                        className={`p-1.5 rounded-xl cursor-pointer transition-colors ${
                          isSaved ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    {/* Title */}
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug group-hover:text-[#000080] dark:group-hover:text-cyan-400 transition-colors">
                        {sch.title}
                      </h4>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        {sch.titleHindi}
                      </p>
                    </div>

                    {/* BIG BENEFIT HIGHLIGHT PILL (Visually dominant, low text) */}
                    <div className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-400/50 dark:border-emerald-500/30">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                        💰 {isHi ? 'लाभ / आर्थिक मदद:' : 'Primary Benefit:'}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-200 leading-tight block">
                        {sch.benefitPill}
                      </span>
                    </div>

                    {/* Target & Document tags */}
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        🎯 {sch.eligibilityShort.slice(0, 32)}...
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        📄 {sch.documents.slice(0, 2).join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailModalItem({ type: 'scheme', item: sch })}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isHi ? '📋 विवरण देखें' : '📋 Details'}
                    </button>

                    <a
                      href={sch.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#000080] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <span>{isHi ? 'पोर्टल खोलें' : 'Official Portal'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSchemes.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {isHi ? 'कोई योजना नहीं मिली' : 'No matching schemes found'}
              </p>
              <p className="text-xs text-slate-500">
                {isHi ? 'कृपया फ़िल्टर रीसेट करें या सर्च बदलें।' : 'Try resetting filters or changing search keywords.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION B: 🎯 SARKARI RESULT & JOBS DIRECTORY */}
      {/* ======================================================== */}
      {activeMainTab === 'sarkari' && (
        <div className="space-y-4">
          {/* Sarkari Result Sub-Tabs */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
            {/* Category selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs">
              {[
                { id: 'all', label: isHi ? '⚡ सभी अपडेट्स' : '⚡ All Updates' },
                { id: 'job', label: isHi ? '💼 Latest Jobs (नई भर्तियां)' : '💼 Latest Jobs' },
                { id: 'result', label: isHi ? '📜 Results (परिणाम)' : '📜 Results' },
                { id: 'admit', label: isHi ? '🎫 Admit Card (प्रवेश पत्र)' : '🎫 Admit Cards' },
                { id: 'admission', label: isHi ? '🎓 Admissions (प्रवेश परीक्षा)' : '🎓 Admissions' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSarkariType(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all cursor-pointer ${
                    sarkariType === tab.id
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Qualification filter & Search */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={sarkariSearch}
                  onChange={(e) => setSarkariSearch(e.target.value)}
                  placeholder={isHi ? 'नौकरी, बोर्ड या परीक्षा खोजें (जैसे SSC, Railway, BPSC)...' : 'Search job or exam (e.g. SSC, Railway, BPSC)...'}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={sarkariQual}
                onChange={(e) => setSarkariQual(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="all">🎓 All Qualifications (सभी योग्यताएं)</option>
                <option value="10th">10th Pass (मैट्रिक)</option>
                <option value="12th">12th Pass (इंटरमीडिएट)</option>
                <option value="Graduate">Graduation (स्नातक / BCA)</option>
                <option value="B.Tech">B.Tech / Engineering</option>
              </select>
            </div>
          </div>

          {/* Sarkari Result Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredSarkari.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-rose-400 shadow-xs flex flex-col justify-between transition-all group"
              >
                <div className="space-y-2.5">
                  {/* Status & Board Banner */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      {item.board}
                    </span>

                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      item.status.includes('Result') || item.status.includes('Live')
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : item.status.includes('Closing')
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    }`}>
                      ● {item.status}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.titleHindi}
                    </p>
                  </div>

                  {/* Highlights Grid (Vacancies, Qualification, Last Date) */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                    <div>
                      <span className="text-slate-400 block text-[10px]">{isHi ? 'योग्यता:' : 'Qualification:'}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{item.qualification}</span>
                    </div>

                    {item.totalPosts && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">{isHi ? 'कुल पद:' : 'Total Posts:'}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block">{item.totalPosts}</span>
                      </div>
                    )}

                    {item.lastDate && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">{isHi ? 'अंतिम तिथि:' : 'Last Date:'}</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400 block">{item.lastDate}</span>
                      </div>
                    )}

                    {item.fee && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">{isHi ? 'फीस:' : 'Fee:'}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{item.fee}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailModalItem({ type: 'sarkari', item })}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {isHi ? '📋 विवरण' : '📋 Details'}
                  </button>

                  <a
                    href={item.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>{isHi ? 'सरकारी पोर्टल' : 'Official Portal'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredSarkari.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {isHi ? 'कोई रिजल्ट या नौकरी नहीं मिली' : 'No jobs or results found'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. INTERACTIVE DETAILS POPUP MODAL */}
      {/* ======================================================== */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
                  {detailModalItem.type === 'scheme' ? '🏛️ Govt Welfare Scheme' : '🎯 Sarkari Result / Exam'}
                </span>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mt-0.5">
                  {detailModalItem.item.title}
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  {detailModalItem.item.titleHindi}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalItem(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content for Scheme */}
            {detailModalItem.type === 'scheme' && (
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                    💰 मुख्य लाभ / आर्थिक अनुदान:
                  </span>
                  <p className="text-slate-800 dark:text-slate-100 font-medium">
                    {detailModalItem.item.benefits}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">🎯 पात्रता (Who is Eligible):</span>
                  <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                    {detailModalItem.item.targetAudience}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300">📋 आवश्यक दस्तावेज़ (Documents):</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {detailModalItem.item.documents.map((doc: string, idx: number) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p>📍 <strong>मंत्रालय:</strong> {detailModalItem.item.ministry}</p>
                  <p>🏛️ <strong>लागू क्षेत्र:</strong> {detailModalItem.item.state}</p>
                </div>
              </div>
            )}

            {/* Modal Content for Sarkari Result */}
            {detailModalItem.type === 'sarkari' && (
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60">
                  <span className="font-bold text-rose-800 dark:text-rose-300 block mb-1">
                    📝 भर्ती व परीक्षा विवरण:
                  </span>
                  <p className="text-slate-800 dark:text-slate-100 font-medium">
                    {detailModalItem.item.details}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">योग्यता:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{detailModalItem.item.qualification}</span>
                  </div>
                  {detailModalItem.item.totalPosts && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">कुल पद:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{detailModalItem.item.totalPosts}</span>
                    </div>
                  )}
                  {detailModalItem.item.lastDate && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">अंतिम तिथि:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{detailModalItem.item.lastDate}</span>
                    </div>
                  )}
                  {detailModalItem.item.fee && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px]">आवेदन शुल्क:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{detailModalItem.item.fee}</span>
                    </div>
                  )}
                </div>

                {detailModalItem.item.steps && detailModalItem.item.steps.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300">🚀 आवेदन करने की प्रक्रिया (How to Apply):</span>
                    <div className="space-y-1">
                      {detailModalItem.item.steps.map((st: string, idx: number) => (
                        <div key={idx} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs">
                          <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <span>{st}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer Link */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <a
                href={detailModalItem.item.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#000080] to-blue-700 hover:from-blue-900 hover:to-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>आधिकारिक सरकारी पोर्टल पर जाएं</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
