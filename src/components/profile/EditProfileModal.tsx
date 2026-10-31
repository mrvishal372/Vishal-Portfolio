import { createPortal } from 'react-dom';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Save, RotateCcw, Plus, Trash2, FileText, Upload, User, 
  GraduationCap, Briefcase, Award, Link as LinkIcon, Check, Sparkles,
  Camera, Image as ImageIcon, Code, Type
} from 'lucide-react';
import { 
  PersonalPortfolioData, 
  ProjectItem, 
  CertificateItem, 
  DocumentItem, 
  EducationItem, 
  SkillCategory 
} from '../../types/portfolio';
import { resetVishalProfile } from '../../lib/vishalProfileData';
import { hasAdminSession, adminUploadFile } from '../../lib/adminAuth';
import { saveToIndexedDB } from '../../lib/portfolioStorage';
import { CoverPhotoRearrangeModal } from './CoverPhotoRearrangeModal';

interface EditProfileModalProps {
  portfolio: PersonalPortfolioData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: PersonalPortfolioData) => void;
  initialTab?: EditTab;
  isAdmin?: boolean;
}

export type EditTab = 'basic' | 'education' | 'skills' | 'projects' | 'certificates' | 'documents' | 'links';

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  portfolio,
  isOpen,
  onClose,
  onSave,
  initialTab = 'basic',
  isAdmin = false
}) => {
  const isRealAdmin = Boolean(isAdmin || (typeof window !== 'undefined' && hasAdminSession()));
  const [activeTab, setActiveTab] = useState<EditTab>(initialTab);
  const [formData, setFormData] = useState<PersonalPortfolioData>(() => JSON.parse(JSON.stringify(portfolio)));
  const [saveSuccess, setSaveSuccess] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingDocName, setUploadingDocName] = useState<string | null>(null);
  const [uploadProgressPercent, setUploadProgressPercent] = useState<number>(0);
  const [isCoverRearrangeOpen, setIsCoverRearrangeOpen] = useState(false);

  // Body scroll lock & hide header/bottom nav on mobile
  useEffect(() => {
    if (isOpen && document.body) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalDocOverflow = document.documentElement.style.overflow;
      const originalBodyTouch = document.body.style.touchAction;
      const mainEl = document.querySelector('main');
      const originalMainOverflow = mainEl ? mainEl.style.overflow : '';
      const originalMainTouch = mainEl ? mainEl.style.touchAction : '';

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      if (mainEl) {
        mainEl.style.overflow = 'hidden';
        mainEl.style.touchAction = 'none';
      }
      document.body.classList.add('modal-fullscreen-open');
      window.dispatchEvent(new CustomEvent('vyron_modal_opened'));

      // Non-passive touchmove listener to completely prevent mobile background scrolling
      const handleTouchMove = (e: TouchEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target || !target.closest('.allow-modal-scroll')) {
          if (e.cancelable) {
            e.preventDefault();
          }
        }
      };

      document.addEventListener('touchmove', handleTouchMove, { passive: false });

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalDocOverflow;
        document.body.style.touchAction = originalBodyTouch;
        if (mainEl) {
          mainEl.style.overflow = originalMainOverflow;
          mainEl.style.touchAction = originalMainTouch;
        }
        document.body.classList.remove('modal-fullscreen-open');
        window.dispatchEvent(new CustomEvent('vyron_modal_closed'));
        document.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [isOpen]);

  // Sync active tab if passed from outside
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // New Education item state
  const [newEdu, setNewEdu] = useState<Partial<EducationItem>>({
    degree: '',
    institution: '',
    universityOrBoard: '',
    duration: '',
    status: 'Currently Pursuing',
    grade: '',
    location: '',
    highlights: []
  });
  const [eduHighlightInput, setEduHighlightInput] = useState('');

  // New Skill state
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  // New Project state
  const [newProject, setNewProject] = useState<Partial<ProjectItem>>({
    title: '',
    category: 'Web Application',
    description: '',
    technologies: [],
    githubUrl: '',
    liveUrl: '',
    date: new Date().getFullYear().toString()
  });
  const [techInput, setTechInput] = useState('');

  // New Certificate state
  const [newCert, setNewCert] = useState<Partial<CertificateItem>>({
    title: '',
    issuer: '',
    issueDate: '',
    credentialUrl: '',
    fileType: 'pdf'
  });

  // New Custom Text Document state
  const [textDocTitle, setTextDocTitle] = useState('');
  const [textDocCategory, setTextDocCategory] = useState<'resume' | 'marksheet' | 'project' | 'study' | 'certificate' | 'notes' | 'other'>('notes');
  const [textDocContent, setTextDocContent] = useState('');

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      if (formData.avatarUrl && formData.avatarUrl !== '/profile.png.jpeg' && formData.avatarUrl !== '/logo.png') {
        localStorage.setItem('vyron_admin_custom_avatar_permanent', formData.avatarUrl);
        localStorage.setItem('vyron_admin_custom_avatar', formData.avatarUrl);
      }
      if (formData.documents && formData.documents.length > 0) {
        try {
          localStorage.setItem('vyron_admin_saved_documents', JSON.stringify(formData.documents));
        } catch {}
      }
    }
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear your profile content to completely blank?')) {
      const def = resetVishalProfile();
      setFormData(def);
      onSave(def);
    }
  };

  // Avatar / Profile photo upload (JPG, PNG, WebP) with client canvas compression & server upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('Please select a JPG, JPEG, PNG, or WebP image file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('Photo is larger than 25MB. Please select a smaller or compressed image.');
      return;
    }

    // 1. Instant client-side compression (max 512x512, 0.82 quality) so it fits in Firestore & localStorage without lag
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const rawDataUri = event.target.result as string;
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const maxDim = 512;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          let compressedUrl = rawDataUri;
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            compressedUrl = canvas.toDataURL('image/jpeg', 0.82);
          }
          
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('vyron_admin_custom_avatar_permanent', compressedUrl);
              localStorage.setItem('vyron_admin_custom_avatar', compressedUrl);
            } catch {}
          }
          setFormData(prev => ({ ...prev, avatarUrl: compressedUrl }));
        };
        img.src = rawDataUri;
      }
    };
    reader.readAsDataURL(file);

    // 2. Upload to server storage in background for permanent URL
    adminUploadFile(file).then((res) => {
      if (res.success && res.fileUrl) {
        setFormData(prev => ({ ...prev, avatarUrl: res.fileUrl }));
      }
    }).catch(() => {});

    e.target.value = '';
  };

  // Add Education
  const handleAddEducation = () => {
    if (!newEdu.degree || !newEdu.institution) {
      alert('Please enter at least Degree and Institution / College name.');
      return;
    }
    const item: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: newEdu.degree || '',
      institution: newEdu.institution || '',
      universityOrBoard: newEdu.universityOrBoard || '',
      duration: newEdu.duration || '',
      status: (newEdu.status as any) || 'Completed',
      grade: newEdu.grade || '',
      location: newEdu.location || '',
      highlights: newEdu.highlights || []
    };
    setFormData(prev => ({
      ...prev,
      education: [item, ...prev.education]
    }));
    setNewEdu({
      degree: '',
      institution: '',
      universityOrBoard: '',
      duration: '',
      status: 'Currently Pursuing',
      grade: '',
      location: '',
      highlights: []
    });
    setEduHighlightInput('');
  };

  const handleDeleteEducation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id)
    }));
  };

  // Add Skill
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const catName = newSkillCategory.trim() || 'General Skills';
    
    setFormData(prev => {
      const existingCatIdx = prev.skillCategories.findIndex(
        c => c.categoryName.toLowerCase() === catName.toLowerCase()
      );
      if (existingCatIdx >= 0) {
        const updated = [...prev.skillCategories];
        updated[existingCatIdx] = {
          ...updated[existingCatIdx],
          skills: [
            ...updated[existingCatIdx].skills,
            { name: newSkillName.trim(), level: newSkillLevel }
          ]
        };
        return { ...prev, skillCategories: updated };
      } else {
        const newCat: SkillCategory = {
          categoryName: catName,
          iconName: 'Code',
          skills: [{ name: newSkillName.trim(), level: newSkillLevel }]
        };
        return { ...prev, skillCategories: [...prev.skillCategories, newCat] };
      }
    });

    setNewSkillName('');
  };

  const handleDeleteSkill = (catIdx: number, skillIdx: number) => {
    setFormData(prev => {
      const updated = [...prev.skillCategories];
      updated[catIdx].skills.splice(skillIdx, 1);
      if (updated[catIdx].skills.length === 0) {
        updated.splice(catIdx, 1);
      }
      return { ...prev, skillCategories: updated };
    });
  };

  // Add Project
  const handleAddProject = () => {
    if (!newProject.title || !newProject.description) {
      alert('Please provide at least a project title and description.');
      return;
    }
    const item: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: newProject.title || '',
      category: newProject.category || 'Web Application',
      description: newProject.description || '',
      detailedNotes: newProject.detailedNotes || '',
      technologies: newProject.technologies?.length ? newProject.technologies : ['General'],
      githubUrl: newProject.githubUrl || '',
      liveUrl: newProject.liveUrl || '',
      date: newProject.date || new Date().getFullYear().toString(),
      featured: true
    };
    setFormData(prev => ({
      ...prev,
      projects: [item, ...prev.projects]
    }));
    setNewProject({
      title: '',
      category: 'Web Application',
      description: '',
      technologies: [],
      githubUrl: '',
      liveUrl: '',
      date: new Date().getFullYear().toString()
    });
    setTechInput('');
  };

  const handleDeleteProject = (id: string) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  // Add Certificate
  const handleAddCertificate = () => {
    if (!newCert.title || !newCert.issuer) {
      alert('Please provide at least certificate title and issuing organization.');
      return;
    }
    const item: CertificateItem = {
      id: `cert-${Date.now()}`,
      title: newCert.title || '',
      issuer: newCert.issuer || '',
      issueDate: newCert.issueDate || new Date().getFullYear().toString(),
      credentialUrl: newCert.credentialUrl || '',
      fileType: newCert.fileType || 'pdf',
      description: newCert.description || ''
    };
    setFormData(prev => ({
      ...prev,
      certificates: [item, ...prev.certificates]
    }));
    setNewCert({
      title: '',
      issuer: '',
      issueDate: '',
      credentialUrl: '',
      fileType: 'pdf'
    });
  };

  const handleDeleteCertificate = (id: string) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter(c => c.id !== id)
    }));
  };

  // File Upload Handler (Supports up to 100MB per file: PDF, Word, Excel, Images, Text, etc.)
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    asResume: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert(`File is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed capacity is 100MB per file.`);
      return;
    }

    const fileNameLower = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || fileNameLower.endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || fileNameLower.match(/\.(jpg|jpeg|png|webp|gif|svg)$/);
    const isTxt = file.type.startsWith('text/') || fileNameLower.endsWith('.txt');

    const fileType: 'pdf' | 'image' | 'text' = isPdf ? 'pdf' : isImage ? 'image' : 'text';
    const format = fileNameLower.split('.').pop() || (isPdf ? 'pdf' : isImage ? 'jpg' : 'txt');

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setUploadingDocName(file.name);
    setUploadProgressPercent(0);

    try {
      let dataUrl = '';
      let textContent = '';

      if (isTxt && file.size < 2 * 1024 * 1024) {
        try {
          textContent = await file.text();
        } catch {}
      }

      // 1. Upload directly to 100MB server engine
      const uploadRes = await adminUploadFile(file, (percent) => {
        setUploadProgressPercent(percent);
      });

      if (uploadRes.success && uploadRes.fileUrl) {
        dataUrl = uploadRes.fileUrl;
      } else {
        // Fallback for smaller files (< 5MB) if server upload failed
        if (file.size < 5 * 1024 * 1024) {
          if (isTxt && textContent) {
            dataUrl = `data:text/plain;base64,${btoa(unescape(encodeURIComponent(textContent)))}`;
          } else {
            dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });
          }
        } else {
          alert(uploadRes.error || 'Failed to upload large file to server.');
          return;
        }
      }

      const docId = `doc-${Date.now()}`;
      const newDocItem: DocumentItem = {
        id: docId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        category: asResume ? 'resume' : 'other',
        fileType,
        format,
        fileName: file.name,
        fileDataUrl: dataUrl,
        textContent: isTxt ? textContent : undefined,
        fileSize: sizeStr,
        uploadDate: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: asResume ? 'Primary Resume (100MB max)' : 'Uploaded document (100MB max)'
      };

      // Save blob to IndexedDB
      try {
        await saveToIndexedDB(`blob_${docId}`, file);
      } catch {}

      setFormData(prev => {
        const updatedDocs = [newDocItem, ...prev.documents];
        if (asResume && isPdf) {
          return {
            ...prev,
            resumeFileName: file.name,
            resumePdfUrl: dataUrl,
            resumeLastUpdated: 'Today',
            documents: updatedDocs
          };
        }
        return { ...prev, documents: updatedDocs };
      });

      e.target.value = '';
      alert(`"${file.name}" (${sizeStr}) uploaded and queued for instant sync!`);
    } catch (err: any) {
      console.error('File upload error in modal:', err);
      alert(`Upload error: ${err?.message || 'Failed to upload file'}`);
    } finally {
      setUploadingDocName(null);
      setUploadProgressPercent(0);
    }
  };

  // Add Custom Text Document / Note
  const handleAddTextDocument = () => {
    if (!textDocTitle.trim() || !textDocContent.trim()) {
      alert('Please provide a document title and text content.');
      return;
    }

    const newDocItem: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: textDocTitle.trim(),
      category: textDocCategory,
      fileType: 'text',
      format: 'txt',
      fileName: `${textDocTitle.trim().toLowerCase().replace(/\s+/g, '_')}.txt`,
      fileDataUrl: `data:text/plain;base64,${btoa(unescape(encodeURIComponent(textDocContent)))}`,
      textContent: textDocContent,
      fileSize: `${Math.round(new Blob([textDocContent]).size / 1024) || 1} KB`,
      uploadDate: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: 'Custom text note'
    };

    setFormData(prev => ({
      ...prev,
      documents: [newDocItem, ...prev.documents]
    }));

    setTextDocTitle('');
    setTextDocContent('');
    alert('Text document added successfully!');
  };

  const handleDeleteDocument = (id: string) => {
    if (!isRealAdmin) {
      alert('Access Denied: Only administrator can delete files.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id),
      resumeFileName: prev.documents.find(d => d.id === id)?.category === 'resume' ? '' : prev.resumeFileName,
      resumePdfUrl: prev.documents.find(d => d.id === id)?.category === 'resume' ? '' : prev.resumePdfUrl
    }));
  };

  const handleSetPrimaryResume = (doc: DocumentItem) => {
    setFormData(prev => ({
      ...prev,
      resumeFileName: doc.fileName,
      resumePdfUrl: doc.fileDataUrl,
      resumeLastUpdated: 'Today',
      documents: prev.documents.map(d => ({
        ...d,
        category: d.id === doc.id ? 'resume' : d.category === 'resume' ? 'other' : d.category
      }))
    }));
    alert(`"${doc.fileName}" set as primary resume!`);
  };

  if (typeof window === 'undefined' || typeof window.document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {isOpen && (
      <motion.div 
        key="edit-profile-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none overscroll-none"
        style={{ touchAction: 'none' }}
        onTouchMove={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
          }
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl h-[100dvh] sm:h-[92vh] bg-white dark:bg-slate-900 rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="px-5 sm:px-6 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] sm:pt-4 pb-4 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-400/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Customize Profile &amp; Manage Files
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Add details, upload PDFs, images, text, and keep everything permanently synced.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1 transition-colors"
                title="Clear all profile content to blank"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear to Blank</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation - Compact, Glitch-free, 0 scroll required */}
          <div className="px-2.5 sm:px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 shrink-0">
            <div className="flex sm:grid sm:grid-cols-7 gap-1.5 w-full overflow-x-auto no-scrollbar snap-x snap-mandatory">
              {[
                { id: 'basic' as EditTab, label: 'Basic', fullLabel: 'Basic & Photo', icon: User },
                { id: 'education' as EditTab, label: 'Edu', fullLabel: 'Education', icon: GraduationCap, count: formData.education.length },
                { id: 'skills' as EditTab, label: 'Skills', fullLabel: 'Skills', icon: Code, count: formData.skillCategories.reduce((acc, c) => acc + c.skills.length, 0) },
                { id: 'projects' as EditTab, label: 'Projects', fullLabel: 'Projects', icon: Briefcase, count: formData.projects.length },
                { id: 'certificates' as EditTab, label: 'Certs', fullLabel: 'Certificates', icon: Award, count: formData.certificates.length },
                { id: 'documents' as EditTab, label: 'Files', fullLabel: 'Files & Resume', icon: FileText, count: formData.documents.length },
                { id: 'links' as EditTab, label: 'Links', fullLabel: 'Social & Links', icon: LinkIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    title={tab.fullLabel}
                    aria-label={`Switch to ${tab.fullLabel}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`min-h-[36px] sm:min-h-[40px] px-3 sm:px-2 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-colors touch-manipulation cursor-pointer select-none active:scale-[0.98] whitespace-nowrap shrink-0 snap-start ${
                      isActive
                        ? 'bg-[#000080] dark:bg-amber-400 text-white dark:text-slate-950 shadow-xs font-black'
                        : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                    {typeof tab.count === 'number' && tab.count > 0 && (
                      <span className={`px-1 sm:px-1.5 py-0.2 rounded-full text-[9px] font-black shrink-0 ${
                        isActive
                          ? 'bg-white/25 text-white dark:text-slate-950'
                          : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Form Contents */}
          <div 
            className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6 touch-pan-y allow-modal-scroll"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
            }}
          >
            {/* 1. BASIC & PHOTO */}
            {activeTab === 'basic' && (
              <div className="space-y-5 max-w-2xl">
                {/* Photo Upload Section */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 border-2 border-amber-400 flex items-center justify-center shrink-0 shadow-md relative group">
                    {formData.avatarUrl ? (
                      <img 
                        src={formData.avatarUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover object-center" 
                      />
                    ) : (
                      <User className="w-9 h-9 text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left flex-1">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Profile Photo</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      Upload your picture (JPG, JPEG, PNG, WebP) to display on your profile.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                      <input 
                        ref={photoInputRef}
                        type="file" 
                        accept="image/jpeg,image/png,image/webp,image/jpg" 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-[#000080] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>

                      {formData.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, avatarUrl: '' }))}
                          className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
                          title="Delete profile picture"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Photo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cover Banner Photo Section */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-28 h-16 rounded-xl overflow-hidden bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-md relative group">
                    {formData.coverBannerUrl ? (
                      <img 
                        src={formData.coverBannerUrl} 
                        alt="Cover Banner" 
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: `${formData.coverBannerPosX ?? 50}% ${formData.coverBannerPosY ?? 50}%`,
                          transform: `scale(${formData.coverBannerZoom ?? 1})`
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-[#000080] via-[#1e1b4b] to-[#0f172a] flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-amber-400 opacity-80" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left flex-1">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Background Cover Photo</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      Upload and drag to rearrange your profile header background banner.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => setIsCoverRearrangeOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#000080] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                        <span>{formData.coverBannerUrl ? 'Rearrange / Change Cover' : 'Set Cover Photo'}</span>
                      </button>

                      {formData.coverBannerUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            coverBannerUrl: '',
                            coverBannerPosY: 50,
                            coverBannerPosX: 50,
                            coverBannerZoom: 1 
                          }))}
                          className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
                          title="Delete background cover photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Cover Photo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Headline / Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BCA Student • Software Developer"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tagline (One-sentence intro)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Passionate about building web apps and learning new technologies."
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Short Bio
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief 2-3 sentence introduction about you..."
                    value={formData.shortBio}
                    onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    About Me (Detailed)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Write detailed background, technical journey, what you love building..."
                    value={formData.aboutMe}
                    onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Current Degree / Education
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BCA 2nd Year"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      College / Institution
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CIMAGE College"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Current Status
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Student / Job Seeker / Developer"
                      value={formData.currentStatus}
                      onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Patna, Bihar, India"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. EDUCATION */}
            {activeTab === 'education' && (
              <div className="space-y-6">
                {/* Form to Add Education */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-500" />
                    <span>Add Education Record</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Degree / Course (e.g. BCA, 12th PCM)"
                      value={newEdu.degree}
                      onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="College / Institution"
                      value={newEdu.institution}
                      onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Duration / Years (e.g. 2023 - 2026)"
                      value={newEdu.duration}
                      onChange={(e) => setNewEdu({ ...newEdu, duration: e.target.value })}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Grade / Percentage / CGPA"
                      value={newEdu.grade}
                      onChange={(e) => setNewEdu({ ...newEdu, grade: e.target.value })}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#000080] hover:bg-blue-900 text-white flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Education List</span>
                  </button>
                </div>

                {/* Existing Education List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Your Education ({formData.education.length})
                  </h4>

                  {formData.education.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                      No education records added yet. Fill the form above to add one.
                    </div>
                  ) : (
                    formData.education.map((edu) => (
                      <div
                        key={edu.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div>
                          <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">{edu.degree}</h5>
                          <p className="text-xs text-slate-700 dark:text-slate-300">{edu.institution} &bull; {edu.duration} {edu.grade && `&bull; ${edu.grade}`}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteEducation(edu.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. SKILLS */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                {/* Form to Add Skill */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-500" />
                    <span>Add Technical or Soft Skill</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Category (e.g. Frontend, Backend, Tools)"
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Skill Name (e.g. React, Python, C++)"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <select
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(e.target.value as any)}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#000080] hover:bg-blue-900 text-white flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Skill Tag</span>
                  </button>
                </div>

                {/* Existing Skills List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Your Skill Categories ({formData.skillCategories.length})
                  </h4>

                  {formData.skillCategories.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                      No skills added yet. Fill the form above to add your first skills.
                    </div>
                  ) : (
                    formData.skillCategories.map((cat, catIdx) => (
                      <div
                        key={cat.categoryName + catIdx}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2.5"
                      >
                        <h5 className="font-extrabold text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          {cat.categoryName}
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {cat.skills.map((skill, skillIdx) => (
                            <span
                              key={skill.name + skillIdx}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                            >
                              <span>{skill.name}</span>
                              <span className="text-[10px] text-slate-400">({skill.level})</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteSkill(catIdx, skillIdx)}
                                className="text-slate-400 hover:text-red-500 ml-1"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 4. PROJECTS */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                {/* Form to Add Project */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-500" />
                    <span>Add New Project</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Category (e.g. Web App, AI Tool, Mobile)"
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Project description and key features..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none"
                  />

                  {/* Tech stack input */}
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add technology (e.g. React, Node.js)"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && techInput.trim()) {
                            e.preventDefault();
                            setNewProject(prev => ({
                              ...prev,
                              technologies: [...(prev.technologies || []), techInput.trim()]
                            }));
                            setTechInput('');
                          }
                        }}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (techInput.trim()) {
                            setNewProject(prev => ({
                              ...prev,
                              technologies: [...(prev.technologies || []), techInput.trim()]
                            }));
                            setTechInput('');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold"
                      >
                        Add Tech
                      </button>
                    </div>

                    {newProject.technologies && newProject.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {newProject.technologies.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-1">
                            <span>{t}</span>
                            <button
                              type="button"
                              onClick={() => setNewProject(prev => ({
                                ...prev,
                                technologies: prev.technologies?.filter((_, i) => i !== idx)
                              }))}
                              className="text-blue-500 hover:text-red-500"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="url"
                      placeholder="GitHub Link (optional)"
                      value={newProject.githubUrl}
                      onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="url"
                      placeholder="Live Demo Link (optional)"
                      value={newProject.liveUrl}
                      onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#000080] hover:bg-blue-900 text-white flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Project</span>
                  </button>
                </div>

                {/* Existing Projects List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Your Projects ({formData.projects.length})
                  </h4>

                  {formData.projects.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                      No projects added yet. Fill the form above to add your projects.
                    </div>
                  ) : (
                    formData.projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-start justify-between gap-3 shadow-xs"
                      >
                        <div className="space-y-1">
                          <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">{proj.title}</h5>
                          <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">{proj.description}</p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.technologies.map((t, idx) => (
                              <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-[10px] text-slate-700 dark:text-slate-300">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 5. CERTIFICATES */}
            {activeTab === 'certificates' && (
              <div className="space-y-6">
                {/* Form to Add Certificate */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-500" />
                    <span>Add Certificate</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Certificate Name (e.g. Web Development Certificate)"
                      value={newCert.title}
                      onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Issuing Organization (e.g. Coursera, Meta, IIT)"
                      value={newCert.issuer}
                      onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Issue Date / Year (e.g. 2024)"
                      value={newCert.issueDate}
                      onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="url"
                      placeholder="Credential Verification URL (optional)"
                      value={newCert.credentialUrl}
                      onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCertificate}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#000080] hover:bg-blue-900 text-white flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Certificate</span>
                  </button>
                </div>

                {/* Existing Certificates List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Your Certificates ({formData.certificates.length})
                  </h4>

                  {formData.certificates.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                      No certificates added yet. Fill the form above to add your certifications.
                    </div>
                  ) : (
                    formData.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div>
                          <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">{cert.title}</h5>
                          <p className="text-xs text-slate-700 dark:text-slate-300">{cert.issuer} &bull; {cert.issueDate}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCertificate(cert.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 6. DOCUMENTS & RESUME */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                {/* Upload Box (PDF, JPG, PNG, WEBP, TXT) */}
                <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border-2 border-dashed border-blue-300 dark:border-blue-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Upload Document, Resume, or Any File
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 max-w-md mx-auto mt-1">
                      Supports <strong className="text-slate-700 dark:text-slate-300">PDF, Word, Excel, PPT, TXT, Images, ZIP &amp; all formats</strong>.
                      Saved permanently and synced within seconds across all public profiles.
                    </p>
                  </div>

                  <input 
                    ref={documentInputRef}
                    type="file" 
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.zip,.rar,.7z,.tar,.gz,.png,.jpg,.jpeg,.webp,.svg,application/*,image/*,text/*"
                    onChange={(e) => handleFileUpload(e, false)}
                    className="hidden" 
                  />

                  {uploadingDocName && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-400 text-left space-y-1.5 animate-pulse">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-amber-200">
                        <span className="truncate">Uploading "{uploadingDocName}"</span>
                        <span>{uploadProgressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-[#000080] dark:to-amber-300 h-full transition-all duration-150" 
                          style={{ width: `${Math.max(uploadProgressPercent, 5)}%` }} 
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">Broadcasting in seconds to all public profiles.</p>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={!!uploadingDocName}
                      onClick={() => documentInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#000080] hover:bg-blue-900 disabled:opacity-50 text-white flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploadingDocName ? 'Uploading...' : 'Choose File from Device'}</span>
                    </button>
                  </div>
                </div>

                {/* Add Custom Text Note / Document */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-blue-500" />
                    <span>Or Create Custom Text Document / Note</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Document Title (e.g. My Cover Letter, Project Notes)"
                      value={textDocTitle}
                      onChange={(e) => setTextDocTitle(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <select
                      value={textDocCategory}
                      onChange={(e) => setTextDocCategory(e.target.value as any)}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="notes">Notes / Text Document</option>
                      <option value="resume">Resume Text</option>
                      <option value="project">Project Synopsis</option>
                      <option value="marksheet">Marksheet / Academics</option>
                      <option value="certificate">Certificate Text</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Type or paste your text content here..."
                    value={textDocContent}
                    onChange={(e) => setTextDocContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 resize-y font-mono"
                  />

                  <button
                    type="button"
                    onClick={handleAddTextDocument}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#000080] hover:bg-blue-900 text-white flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save Text Document</span>
                  </button>
                </div>

                {/* Uploaded Documents List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Uploaded Files &amp; Documents ({formData.documents.length})
                  </h4>

                  {formData.documents.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                      No files uploaded yet. Choose a file or write a text note above.
                    </div>
                  ) : (
                    formData.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                              {doc.title || doc.fileName}
                            </span>
                            <span className="px-1.5 py-0.2 rounded uppercase text-[9px] font-black bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                              {doc.format || doc.fileType}
                            </span>
                            {doc.category === 'resume' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                                Primary Resume
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {doc.fileName} &bull; {doc.fileSize || 'N/A'} &bull; {doc.uploadDate}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {doc.fileType === 'pdf' && doc.category !== 'resume' && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryResume(doc)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-200"
                              title="Set as Main Resume"
                            >
                              Set as Resume
                            </button>
                          )}

                          {isRealAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 7. SOCIAL & LINKS */}
            {activeTab === 'links' && (
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. yourname@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://github.com/yourhandle"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://linkedin.com/in/yourhandle"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Portfolio / Personal Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://yourdomain.com"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Save Actions */}
          <div className="px-5 sm:px-6 py-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] sm:pb-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Auto-syncs to cloud storage &amp; offline storage</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSaveAll()}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#000080] hover:bg-blue-900 text-white flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
      )}

      {/* Cover Photo Rearrange Modal */}
      <CoverPhotoRearrangeModal
        isOpen={isCoverRearrangeOpen}
        onClose={() => setIsCoverRearrangeOpen(false)}
        currentBannerUrl={formData.coverBannerUrl}
        currentPosY={formData.coverBannerPosY}
        currentPosX={formData.coverBannerPosX}
        currentZoom={formData.coverBannerZoom}
        avatarUrl={formData.avatarUrl || '/profile.png.jpeg'}
        onSave={(bannerData) => {
          setFormData(prev => ({
            ...prev,
            coverBannerUrl: bannerData.bannerUrl,
            coverBannerPosY: bannerData.posY,
            coverBannerPosX: bannerData.posX,
            coverBannerZoom: bannerData.zoom
          }));
        }}
        onRemove={() => {
          setFormData(prev => ({
            ...prev,
            coverBannerUrl: '',
            coverBannerPosY: 50,
            coverBannerPosX: 50,
            coverBannerZoom: 1
          }));
        }}
      />
    </AnimatePresence>,
    window.document.body
  );
};
