import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ThemeMode, Language } from '../../types';
import { 
  User, Settings, Bookmark, Utensils, Pill, GraduationCap, Building2, 
  Wallet, History, Moon, Sun, Globe, HardDrive, ShieldCheck, Check, 
  Edit2, Save, Trash2, Camera, Phone, MapPin, Info, X, Image as ImageIcon,
  Cloud, CloudOff, AlertCircle, Sparkles, Lock, ZoomIn, Zap, LogOut, CheckCircle2,
  LogIn, UserX
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

import { ProfilePhotoCropModal } from '../ProfilePhotoCropModal';
import { ProfileHeaderAnimation } from '../TabHeroAnimations';
import { AvatarPickerModal } from '../AvatarPickerModal';
import { getEffectiveAvatarUrl, DEFAULT_AVATAR_DATA_URI } from '../../lib/defaultAvatar';
import { VishalPortfolioSection } from '../profile/VishalPortfolioSection';
import { ProfilePhotoZoomModal } from '../profile/ProfilePhotoZoomModal';
import { SwipeToDeleteItem } from '../common/SwipeToDeleteItem';
import { loadVishalProfile, saveVishalProfile } from '../../lib/vishalProfileData';
import { adminSaveProfile, hasAdminSession } from '../../lib/adminAuth';
import { ScrollReveal } from '../common/ScrollReveal';

export type ProfileSubTab = 'portfolio' | 'info' | 'bookmarks' | 'recipes' | 'medicines' | 'study' | 'schemes' | 'settings';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  initialSubTab?: ProfileSubTab;
  currentUser?: FirebaseUser | null;
  onProfileSynced?: (synced: UserProfile) => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
  onOpenLogin?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = React.memo(({ 
  profile, 
  onUpdateProfile, 
  initialSubTab = 'portfolio',
  currentUser,
  onProfileSynced,
  isLoggedIn,
  isAdmin = false,
  onLogout,
  onOpenLogin
}) => {
  // Check if user is truly logged in as admin or authorized owner
  const isUserAuthenticated = Boolean(
    isAdmin || 
    (typeof window !== 'undefined' && hasAdminSession())
  );

  const [activeTab, setActiveTab] = useState<ProfileSubTab>(() => {
    if (!isUserAuthenticated) return 'portfolio';
    return initialSubTab === 'settings' ? 'settings' : 'portfolio';
  });
  const [isEditing, setIsEditing] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isPhotoZoomOpen, setIsPhotoZoomOpen] = useState(false);
  const [savedFilter, setSavedFilter] = useState<'all' | 'bookmarks' | 'recipes' | 'medicines' | 'schemes'>(() => {
    if (initialSubTab === 'bookmarks' || initialSubTab === 'recipes' || initialSubTab === 'medicines' || initialSubTab === 'schemes') {
      return initialSubTab;
    }
    return 'all';
  });
  const isHi = profile.language === 'hi';
  
  // Sync status simulation
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending'>('synced');
  const subTabsNavRef = useRef<HTMLDivElement | null>(null);

  const handleSubTabWheel = (e: React.WheelEvent) => {
    if (subTabsNavRef.current && Math.abs(e.deltaY) > 0) {
      subTabsNavRef.current.scrollLeft += e.deltaY * 1.5;
    }
  };

  useEffect(() => {
    let timer: any = null;
    const handleStorageChange = () => {
      setSyncStatus('pending');
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setSyncStatus('synced'), 2000);
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!isUserAuthenticated) {
      setActiveTab('portfolio');
      return;
    }
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab, isUserAuthenticated]);

  // Lock background scroll and hide header/bottom nav when editing modal is open on mobile
  useEffect(() => {
    if (isEditing) {
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
  }, [isEditing]);

  // Editable form state
  const [name, setName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [mobile, setMobile] = useState(profile.mobile || '');
  const [state, setState] = useState(profile.state || '');
  const [district, setDistrict] = useState(profile.district || '');
  const [occupation, setOccupation] = useState(profile.occupation || '');
  const [aboutMe, setAboutMe] = useState(profile.aboutMe || '');
  const [language, setLanguage] = useState<Language>(profile.language || 'en');
  const [theme, setTheme] = useState<ThemeMode>(profile.theme || 'light');
  const [reducedMotion, setReducedMotion] = useState<boolean>(profile.reducedMotion === true);

  // Synchronize form fields if profile changes (e.g. on logout or login)
  useEffect(() => {
    setName(profile.name || '');
    setEmail(profile.email || '');
    setMobile(profile.mobile || '');
    setState(profile.state || '');
    setDistrict(profile.district || '');
    setOccupation(profile.occupation || '');
    setAboutMe(profile.aboutMe || '');
    setLanguage(profile.language || 'en');
    setTheme(profile.theme || 'light');
    setReducedMotion(profile.reducedMotion === true);
  }, [profile.name, profile.mobile, profile.email, profile.language, profile.theme, profile.reducedMotion]);

  // Trigger file picker
  const handleOpenPhotoPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle image selected from gallery/file manager
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('Please select a valid image file (JPG, JPEG, PNG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawImageSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);

    // reset input so same file can be re-selected if needed
    e.target.value = '';
  };

  // Save cropped photo globally across the app
  const handleSaveCroppedPhoto = async (croppedBase64: string) => {
    let finalUrl = croppedBase64;
    
    // Try to upload to Firebase Storage if logged in
    try {
      const { auth } = await import('../../lib/firebaseSync');
      if (auth.currentUser) {
        const { uploadFileToCloud } = await import('../../lib/storageSync');
        // Convert Base64 to Blob
        const res = await fetch(croppedBase64);
        const blob = await res.blob();
        
        // Generate a random path
        const path = `avatars/${Date.now()}_avatar.jpg`;
        const cloudUrl = await uploadFileToCloud(auth.currentUser.uid, path, new File([blob], 'avatar.jpg', { type: blob.type }));
        finalUrl = cloudUrl;
      }
    } catch (err) {
      console.warn('Failed to upload avatar to cloud, falling back to base64', err);
    }

    onUpdateProfile({ avatarUrl: finalUrl });
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('vyron_admin_custom_avatar_permanent', finalUrl);
        localStorage.setItem('vyron_admin_custom_avatar', finalUrl);
      }
      const p = loadVishalProfile();
      const updatedPortfolio = { ...p, avatarUrl: finalUrl };
      saveVishalProfile(updatedPortfolio);
      adminSaveProfile({ ...profile, avatarUrl: finalUrl }).catch(() => {});
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('portfolio_photo_updated', { detail: { avatarUrl: finalUrl } }));
        window.dispatchEvent(new CustomEvent('profile_info_updated', { detail: { avatarUrl: finalUrl, name: profile.name } }));
      }
    } catch (err) {
      console.warn('Global photo sync error:', err);
    }
    setRawImageSrc(null);
  };

  // Reset Photo to default globally across the app
  const handleResetToDefaultPhoto = () => {
    const confirmMsg = profile.language === 'hi' 
      ? 'क्या आप अपनी पोर्टफोलियो और प्रोफ़ाइल DP को डिफ़ॉल्ट पर रीसेट करना चाहते हैं?' 
      : 'Are you sure you want to reset your portfolio and profile DP to default?';
    if (confirm(confirmMsg)) {
      const defUrl = '/profile.png.jpeg';
      onUpdateProfile({ avatarUrl: defUrl });
      try {
        const p = loadVishalProfile();
        const updatedPortfolio = { ...p, avatarUrl: defUrl };
        saveVishalProfile(updatedPortfolio);
        adminSaveProfile({ ...profile, avatarUrl: defUrl }).catch(() => {});
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('portfolio_photo_updated', { detail: { avatarUrl: defUrl } }));
          window.dispatchEvent(new CustomEvent('profile_info_updated', { detail: { avatarUrl: defUrl, name: profile.name } }));
        }
      } catch (err) {
        console.warn('Global photo reset error:', err);
      }
    }
  };

  // Remove Photo
  const handleRemovePhoto = () => {
    handleResetToDefaultPhoto();
  };

  const handleSaveProfileInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      name,
      email,
      mobile,
      state,
      district,
      occupation,
      aboutMe,
      language,
      theme,
      reducedMotion,
    };
    onUpdateProfile(updated);
    try {
      const p = loadVishalProfile();
      const updatedPortfolio = {
        ...p,
        fullName: name || p.fullName,
        email: email || p.email,
        phone: mobile || p.phone,
        aboutMe: aboutMe || p.aboutMe
      };
      saveVishalProfile(updatedPortfolio);
    } catch {}
    adminSaveProfile({ ...profile, ...updated }).catch(() => {});
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('profile_info_updated', { detail: { name, avatarUrl: profile.avatarUrl } }));
    }
    setIsEditing(false);
  };

  const handleCancelEditing = () => {
    setName(profile.name || '');
    setEmail(profile.email || '');
    setMobile(profile.mobile || '');
    setState(profile.state || '');
    setDistrict(profile.district || '');
    setOccupation(profile.occupation || '');
    setAboutMe(profile.aboutMe || '');
    setLanguage(profile.language || 'en');
    setTheme(profile.theme || 'light');
    setReducedMotion(profile.reducedMotion === true);
    setIsEditing(false);
  };

  const handleClearCache = () => {
    if (!isUserAuthenticated) {
      alert(isHi ? 'अनुमति अस्वीकृत: केवल व्यवस्थापक कैश साफ़ कर सकते हैं।' : 'Access Denied: Only administrator can clear cache.');
      return;
    }
    if (confirm(isHi ? 'क्या आप लोकल ऐप स्टोरेज कैश साफ़ करना चाहते हैं? डिफ़ॉल्ट डेटा रीस्टोर हो जाएगा।' : 'Clear local app storage cache? Saved data will be restored to default.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 w-full pb-28 sm:pb-32">
      {/* Hidden File Input for Gallery / Camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Avatar & Emoji Picker Modal */}
      {isAvatarPickerOpen && (
        <AvatarPickerModal
          currentAvatarUrl={profile.avatarUrl}
          onSelectAvatar={(dataUri) => {
            onUpdateProfile({ avatarUrl: dataUri });
            try {
              const p = loadVishalProfile();
              saveVishalProfile({ ...p, avatarUrl: dataUri });
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('portfolio_photo_updated', { detail: { avatarUrl: dataUri } }));
              }
            } catch (err) {
              console.warn('Global avatar sync error:', err);
            }
            setIsAvatarPickerOpen(false);
          }}
          onOpenUpload={() => {
            setIsAvatarPickerOpen(false);
            handleOpenPhotoPicker();
          }}
          onClose={() => setIsAvatarPickerOpen(false)}
        />
      )}

      {/* Crop Modal when image selected */}
      {rawImageSrc && (
        <ProfilePhotoCropModal
          imageSrc={rawImageSrc}
          onSave={handleSaveCroppedPhoto}
          onCancel={() => setRawImageSrc(null)}
        />
      )}

      {/* Profile Photo Zoom & Lightbox Modal */}
      <ProfilePhotoZoomModal
        isOpen={isPhotoZoomOpen}
        avatarUrl={profile.avatarUrl}
        userName={profile.name}
        onClose={() => setIsPhotoZoomOpen(false)}
      />

      {/* Main Tab Content */}
      {activeTab === 'portfolio' ? (
        <VishalPortfolioSection
          avatarUrl={profile.avatarUrl}
          onOpenAvatarPicker={() => setIsAvatarPickerOpen(true)}
          language={profile.language}
          isUserAuthenticated={isUserAuthenticated}
          isAdmin={isAdmin}
          onUpdateProfile={onUpdateProfile}
          profileTheme={profile.theme}
          reducedMotion={profile.reducedMotion}
        />
      ) : (
        <>
          {/* Back to Profile Button when viewing settings */}
          <div className="pb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab('portfolio')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-[#000080] dark:text-amber-400 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-750 transition-all cursor-pointer"
            >
              <span>←</span>
              <span>{profile.language === 'hi' ? 'प्रोफ़ाइल व पोर्टफोलियो पर वापस जाएं' : 'Back to Profile & Portfolio'}</span>
            </button>
          </div>

          {/* Profile Header Card - Modern Instagram & LinkedIn Hybrid */}
          <div className="p-5 sm:p-7 rounded-3xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-lg text-slate-900 dark:text-white relative overflow-hidden transition-all">
            <ProfileHeaderAnimation />
            
            <div className="relative z-10 flex flex-row items-start gap-3.5 sm:gap-6">
              {/* Profile Circular Image Container on the LEFT (Click to Zoom) */}
              <div className="relative shrink-0 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setIsPhotoZoomOpen(true)}
                  className="p-1 sm:p-1.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 shadow-xl relative group cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400/40 transition-transform active:scale-95 block"
                  title="Click to view and zoom profile picture"
                  aria-label="Click to view and zoom profile picture"
                >
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden aspect-square bg-slate-900 ring-2 sm:ring-4 ring-white dark:ring-slate-900 relative">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={profile.avatarUrl || 'default'}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        src={getEffectiveAvatarUrl(profile.avatarUrl)}
                        alt={profile.name || 'Profile'}
                        className="w-full h-full object-cover object-center absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                      />
                    </AnimatePresence>

                    {/* Quick Zoom Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] sm:text-xs font-bold gap-1 pointer-events-none">
                      <ZoomIn className="w-5 h-5 text-amber-300" />
                      <span>Zoom</span>
                    </div>
                  </div>
                  {/* Online Presence Indicator */}
                  <span className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center shadow-sm" />
                </button>

                {isUserAuthenticated && (
                  <button
                    type="button"
                    onClick={handleOpenPhotoPicker}
                    className="mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Change Photo"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Change DP</span>
                  </button>
                )}
              </div>

              {/* Info & Badges on the RIGHT (UP AT THE TOP next to avatar!) */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight truncate flex items-center gap-1.5">
                    <span>{profile.name || (isHi ? 'विशाल यादव' : 'Vishal Yadav')}</span>
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0A66C2] text-white shrink-0 shadow-xs" title="Verified Profile">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 text-[10px] sm:text-xs font-bold border border-amber-500/30 inline-block shrink-0">
                    Vyron AI Creator
                  </span>
                  {isUserAuthenticated && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] sm:text-xs font-bold border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{isHi ? 'प्रोफ़ाइल एडिट' : 'Edit Profile'}</span>
                    </button>
                  )}
                </div>

                {/* Zero-Pill Contact details */}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {profile.email && <span>{profile.email}</span>}
                  {profile.mobile && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span>{profile.mobile}</span>
                    </>
                  )}
                  {profile.state && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span>{profile.district ? `${profile.district}, ` : ''}{profile.state}</span>
                    </>
                  )}
                </div>

                <p className="text-xs font-semibold text-blue-700 dark:text-amber-300">
                  Occupation: {profile.occupation || 'Software & AI Developer'}
                </p>

                {profile.aboutMe && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic max-w-xl line-clamp-2">
                    "{profile.aboutMe}"
                  </p>
                )}

                {/* Sync Status Indicator */}
                <div className="pt-1 flex flex-wrap items-center gap-2.5">
                  {syncStatus === 'synced' ? (
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      <Cloud className="w-3 h-3" />
                      <span>Data Synced</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      <CloudOff className="w-3 h-3 animate-pulse" />
                      <span>Backup Pending...</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

      {/* Edit Form Modal (Portaled to Body, Full-screen on mobile, Hides header & bottom nav) */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isEditing && (
            <motion.div
              key="edit-profile-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] flex flex-col justify-center items-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md overscroll-none select-none"
              style={{ touchAction: 'none' }}
              onTouchMove={(e) => {
                if (e.target === e.currentTarget) {
                  e.preventDefault();
                }
              }}
            >
              <motion.div
                key="edit-profile-modal-content"
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full h-[100dvh] max-h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl flex flex-col rounded-none sm:rounded-3xl bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white overflow-hidden select-text"
              >
                {/* Header with Mobile Safe Area Support */}
                <div className="flex items-center justify-between px-5 sm:px-6 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] sm:pt-5 pb-3.5 sm:pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10 select-none">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-amber-400/10 text-[#000080] dark:text-amber-400 flex items-center justify-center border border-blue-500/20 dark:border-amber-400/20 shrink-0">
                      <Edit2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight truncate">
                        {isHi ? 'प्रोफ़ाइल एडिट करें' : 'Edit Profile Information'}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {isHi ? 'अपनी व्यक्तिगत जानकारी अपडेट करें' : 'Update your personal details & settings'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleOpenPhotoPicker}
                      className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center gap-1 border border-amber-300 dark:border-amber-700 transition-colors cursor-pointer"
                      title={isHi ? 'प्रोफ़ाइल फोटो बदलें' : 'Change Profile Photo'}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">{isHi ? 'फोटो बदलें' : 'Change Photo'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditing}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Close"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Form Body */}
                <form onSubmit={handleSaveProfileInfo} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                  <div 
                    className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 text-xs touch-pan-y allow-modal-scroll"
                    style={{
                      WebkitOverflowScrolling: 'touch',
                      overscrollBehavior: 'contain',
                    }}
                    onTouchMove={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#000080]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#000080]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300">Mobile Number</label>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#000080]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300">Occupation</label>
                        <input
                          type="text"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#000080]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300">District</label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="e.g. Indore"
                          className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#000080]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300">State / Region</label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#000080]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300">Preferred Language</label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value as Language)}
                          className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                        >
                          <option value="en">English (🇬🇧)</option>
                          <option value="hi">हिंदी (🇮🇳)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300">Theme Mode</label>
                        <select
                          value={theme}
                          onChange={(e) => setTheme(e.target.value as ThemeMode)}
                          className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                        >
                          <option value="light">☀️ Light Theme</option>
                          <option value="dark">🌙 Dark Theme</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          {profile.language === 'hi' ? 'एनिमेशन व परफॉर्मेंस' : 'Animation & Performance'}
                        </label>
                        <select
                          value={reducedMotion ? 'reduced' : 'normal'}
                          onChange={(e) => setReducedMotion(e.target.value === 'reduced')}
                          className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                        >
                          <option value="reduced">{profile.language === 'hi' ? '⚡ स्मूथ और तेज़ (कम एनिमेशन)' : '⚡ Smooth & Fast (Reduced Motion)'}</option>
                          <option value="normal">{profile.language === 'hi' ? '🎨 पूर्ण एनिमेशन' : '🎨 Full Animations'}</option>
                        </select>
                      </div>

                      <div className="col-span-1 sm:col-span-2">
                        <label className="font-bold text-slate-700 dark:text-slate-300">About Me</label>
                        <textarea
                          value={aboutMe}
                          onChange={(e) => setAboutMe(e.target.value)}
                          rows={2}
                          placeholder="Brief summary about yourself..."
                          className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#000080]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sticky Action Footer */}
                  <div className="p-3.5 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.875rem)] sm:pb-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex items-center justify-end gap-3 shrink-0 z-10 select-none">
                    <button
                      type="button"
                      onClick={handleCancelEditing}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      {isHi ? 'रद्द करें' : 'Cancel Changes'}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#000080] hover:bg-blue-900 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isHi ? 'बदलाव सहेजें' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Sub-Tab Contents with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="space-y-4"
        >
          <div className="space-y-6">
              {/* Verified Mobile Account Badge Card */}
              {isUserAuthenticated && (
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white dark:from-slate-900/60 dark:to-slate-800/40 border border-blue-200/80 dark:border-blue-900/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#000080] text-white flex items-center justify-center shadow-md shadow-[#000080]/20 flex-shrink-0">
                      <Phone className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {profile.mobile}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isHi ? 'सत्यापित व्यवस्थापक' : 'Verified Admin'}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">
                        You are logged in as the owner.
                      </p>
                    </div>
                  </div>
                  {onLogout && (
                    <button
                      type="button"
                      id="account-card-logout-btn"
                      onClick={onLogout}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isHi ? 'लॉग आउट' : 'Log Out'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* 📸 Dedicated Setting Option: Change Your Portfolio DP */}
              {isUserAuthenticated && (
                <div 
                  id="setting-change-portfolio-dp"
                className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white via-amber-50/20 to-blue-50/20 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md space-y-4 relative overflow-hidden"
              >
                {/* Decorative glow ambient */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* DP Preview Avatar badge */}
                    <div className="relative group shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-[#000080] via-amber-400 to-[#138808] shadow-lg shadow-amber-500/20 overflow-hidden">
                        <img
                          key={profile.avatarUrl || 'settings-dp-preview'}
                          src={getEffectiveAvatarUrl(profile.avatarUrl)}
                          alt={profile.name || 'Portfolio DP'}
                          className="w-full h-full object-cover rounded-full bg-slate-100 dark:bg-slate-800"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenPhotoPicker}
                        className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-transform active:scale-90 cursor-pointer"
                        title={isHi ? 'फ़ोटो बदलें' : 'Change Photo'}
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                          {isHi ? 'Change Your Portfolio DP' : 'Change Your Portfolio DP'}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-400/20 text-amber-900 dark:text-amber-300 border border-amber-400/40 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>{isHi ? 'ग्लोबल DP' : 'Global DP'}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 max-w-md leading-relaxed">
                        {isHi
                          ? 'यहाँ नई फ़ोटो अपलोड करते ही पूरे ऐप में हेडर लोगो, फुटर, प्रोफ़ाइल बटन और पोर्टफोलियो बैनर में यही DP तुरंत लग जाएगी।'
                          : 'Uploading a photo here instantly updates your DP everywhere: Header Logo, Footer branding, Profile button & Portfolio banner.'}
                      </p>
                      {/* Active locations indicator tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-2xs">
                          <Check className="w-3 h-3 text-emerald-500" /> Header Profile & Logo
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-2xs">
                          <Check className="w-3 h-3 text-emerald-500" /> Portfolio Showcase
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-2xs">
                          <Check className="w-3 h-3 text-emerald-500" /> Footer Branding
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-wrap sm:flex-col items-stretch gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      type="button"
                      id="upload-portfolio-dp-btn"
                      onClick={handleOpenPhotoPicker}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#000080] to-blue-800 hover:from-blue-900 hover:to-blue-950 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>{isHi ? 'गैलरी / फ़ाइल से फ़ोटो अपलोड करें' : 'Upload New Photo'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAvatarPickerOpen(true)}
                      className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isHi ? '3D अवतार / प्रीसेट चुनें' : 'Choose 3D Avatar'}</span>
                    </button>

                    {profile.avatarUrl && profile.avatarUrl !== '/profile.png.jpeg' && (
                      <button
                        type="button"
                        onClick={handleResetToDefaultPhoto}
                        className="px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{isHi ? 'डिफ़ॉल्ट फ़ोटो पर रीसेट करें' : 'Reset to Default'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              )}

              {/* Saved Data Library Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-slate-50/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{isHi ? 'सेव किया गया डेटा व लाइब्रेरी' : 'Saved Data Library'}</span>
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {profile.bookmarks.length + profile.savedRecipes.length + profile.savedMedicines.length + profile.savedSchemes.length}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        {isHi ? 'आपके बुकमार्क किए गए जुगाड़, रेसिपी, दवाइयां और योजनाएं' : 'Your bookmarked hacks, recipes, medicines and govt schemes'}
                      </p>
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'all', label: isHi ? 'सभी' : 'All', count: profile.bookmarks.length + profile.savedRecipes.length + profile.savedMedicines.length + profile.savedSchemes.length },
                      { id: 'bookmarks', label: isHi ? 'जुगाड़' : 'Hacks', count: profile.bookmarks.length },
                      { id: 'recipes', label: isHi ? 'रेसिपी' : 'Recipes', count: profile.savedRecipes.length },
                      { id: 'medicines', label: isHi ? 'दवाई' : 'Meds', count: profile.savedMedicines.length },
                      { id: 'schemes', label: isHi ? 'योजना' : 'Schemes', count: profile.savedSchemes.length },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSavedFilter(f.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          savedFilter === f.id
                            ? 'bg-[#000080] text-white dark:bg-amber-400 dark:text-slate-950 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{f.label}</span>
                        {f.count > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            savedFilter === f.id
                              ? 'bg-white/20 text-white dark:text-slate-950 font-black'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {f.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {(savedFilter === 'all' || savedFilter === 'bookmarks') && profile.bookmarks.map((bm) => (
                    <SwipeToDeleteItem
                      key={`bm-${bm.id}`}
                      id={bm.id}
                      onDelete={(id) => onUpdateProfile({ bookmarks: profile.bookmarks.filter((b) => b.id !== id) })}
                      language={profile.language}
                      confirmTitle={isHi ? 'बुकमार्क हटाएं?' : 'Remove Bookmark?'}
                      confirmMessage={isHi ? `क्या आप "${bm.title}" को हटाना चाहते हैं?` : `Remove "${bm.title}"?`}
                    >
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-white/90 via-amber-50/40 to-slate-50/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border border-amber-400/50 dark:border-slate-700/80 space-y-1.5 h-full pr-8">
                        <div className="flex items-center gap-1.5">
                          <Bookmark className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">{bm.category}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{bm.title}</h4>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">{bm.summary}</p>
                      </div>
                    </SwipeToDeleteItem>
                  ))}

                  {(savedFilter === 'all' || savedFilter === 'recipes') && profile.savedRecipes.map((rec) => (
                    <SwipeToDeleteItem
                      key={`rec-${rec.id}`}
                      id={rec.id}
                      onDelete={(id) => onUpdateProfile({ savedRecipes: profile.savedRecipes.filter((r) => r.id !== id) })}
                      language={profile.language}
                      confirmTitle={isHi ? 'रेसिपी हटाएं?' : 'Remove Recipe?'}
                      confirmMessage={isHi ? `क्या आप "${rec.title}" रेसिपी को हटाना चाहते हैं?` : `Remove "${rec.title}"?`}
                    >
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-white/90 via-amber-50/40 to-slate-50/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border border-amber-400/50 dark:border-slate-700/80 space-y-1.5 h-full pr-8">
                        <div className="flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">{rec.prepTime} • {rec.diet}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{rec.title}</h4>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">{rec.instructions.join(' ')}</p>
                      </div>
                    </SwipeToDeleteItem>
                  ))}

                  {(savedFilter === 'all' || savedFilter === 'medicines') && profile.savedMedicines.map((m) => (
                    <SwipeToDeleteItem
                      key={`med-${m.id}`}
                      id={m.id}
                      onDelete={(id) => onUpdateProfile({ savedMedicines: profile.savedMedicines.filter((med) => med.id !== id) })}
                      language={profile.language}
                      confirmTitle={isHi ? 'दवाई हटाएं?' : 'Remove Medicine?'}
                      confirmMessage={isHi ? `क्या आप "${m.brandName}" को हटाना चाहते हैं?` : `Remove "${m.brandName}"?`}
                    >
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-white/90 via-amber-50/40 to-slate-50/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border border-amber-400/50 dark:border-slate-700/80 space-y-1.5 h-full pr-8">
                        <div className="flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Save {m.savingsPercentage}%</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{m.brandName}</h4>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{m.genericAlternative}</p>
                      </div>
                    </SwipeToDeleteItem>
                  ))}

                  {(savedFilter === 'all' || savedFilter === 'schemes') && profile.savedSchemes.map((s) => (
                    <SwipeToDeleteItem
                      key={`sch-${s.id}`}
                      id={s.id}
                      onDelete={(id) => onUpdateProfile({ savedSchemes: profile.savedSchemes.filter((sch) => sch.id !== id) })}
                      language={profile.language}
                      confirmTitle={isHi ? 'योजना हटाएं?' : 'Remove Scheme?'}
                      confirmMessage={isHi ? `क्या आप "${s.title}" को हटाना चाहते हैं?` : `Remove "${s.title}"?`}
                    >
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-white/90 via-amber-50/40 to-slate-50/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border border-amber-400/50 dark:border-slate-700/80 space-y-1.5 h-full pr-8">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{isHi ? 'सरकारी योजना' : 'Govt Scheme'}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{s.title}</h4>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">{s.benefits}</p>
                      </div>
                    </SwipeToDeleteItem>
                  ))}

                  {(profile.bookmarks.length + profile.savedRecipes.length + profile.savedMedicines.length + profile.savedSchemes.length === 0) && (
                    <div className="col-span-full py-8 text-center space-y-1.5">
                      <Bookmark className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isHi ? 'कोई सेव किया गया आइटम नहीं है' : 'No Saved Items Yet'}
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        {isHi 
                          ? 'ऐप में एक्सप्लोर करते समय जुगाड़, रेसिपी या दवाई को बुकमार्क करें, वो यहाँ तुरंत दिखाई देंगे।' 
                          : 'Items you bookmark across the app will appear neatly organized here.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-slate-50/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md space-y-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-[#FF9933]" />
                  <span>Recent Activity & History</span>
                </h3>
                <div className="space-y-2">
                  {profile.history.map((h) => (
                    <div key={h.id} className="p-2.5 rounded-xl bg-gradient-to-br from-white/90 via-amber-50/40 to-slate-50/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl text-xs flex justify-between items-center">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">"{h.query}"</span>
                      <span className="text-[10px] text-slate-400">{h.timestamp}</span>
                    </div>
                  ))}
                  {profile.history.length === 0 && (
                    <p className="text-xs text-slate-700 dark:text-slate-300 py-4 text-center">No recent search activity logged.</p>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-slate-50/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md space-y-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#138808]" />
                  <span>Exam & Study Stats</span>
                </h3>
                <div className="space-y-2">
                  {profile.studyProgress.map((sp) => (
                    <div key={sp.id} className="p-3 rounded-xl bg-gradient-to-br from-white/90 via-amber-50/40 to-slate-50/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl text-xs space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-800 dark:text-white">{sp.topic}</span>
                        <span className="text-[#138808]">{sp.completedPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-[#138808]" style={{ width: `${sp.completedPercent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

              {/* Profile & App Preferences Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-slate-50/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md space-y-6">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {isHi ? 'ऐप व प्रोफ़ाइल सेटिंग्स' : 'Profile & App Preferences'}
                </h3>

                <div className="space-y-4 text-xs">
                  {/* Theme switch */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{isHi ? 'थीम मोड' : 'Appearance Theme'}</p>
                      <p className="text-slate-700 dark:text-slate-300">{isHi ? 'लाइट और डार्क मोड के बीच बदलें' : 'Switch between Light and Dark mode'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateProfile({ theme: profile.theme === 'light' ? 'dark' : 'light' })}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      {profile.theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-sky-400" />}
                      <span>{profile.theme === 'light' ? (isHi ? 'लाइट मोड' : 'Light Mode') : (isHi ? 'डार्क मोड' : 'Dark Mode')}</span>
                    </button>
                  </div>

                  {/* Language switch */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{isHi ? 'भाषा पसंद' : 'Language Preference'}</p>
                      <p className="text-slate-700 dark:text-slate-300">{isHi ? 'AI प्रतिक्रिया और ऐप की भाषा' : 'Default AI response language'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateProfile({ language: profile.language === 'en' ? 'hi' : 'en' })}
                      className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#138808] dark:text-emerald-400 font-bold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition-all active:scale-95 cursor-pointer"
                    >
                      <Globe className="w-4 h-4" />
                      <span>{profile.language === 'en' ? 'English (EN)' : 'हिंदी (HI)'}</span>
                    </button>
                  </div>

                  {/* 3D Animations & Performance switch */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{isHi ? '3D व रिच एनिमेशन' : '3D & Rich Animations'}</p>
                      <p className="text-slate-700 dark:text-slate-300">
                        {!profile.reducedMotion 
                          ? (isHi ? 'चालू (3D सोलर सिस्टम व रिच स्पेस FX)' : 'Active (3D Space & Rich FX)') 
                          : (isHi ? 'हल्का मोड (कम एनिमेशन / फास्ट मोड)' : 'Lite Mode (Reduced Motion & Faster)')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateProfile({ reducedMotion: !profile.reducedMotion })}
                      className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 border transition-all active:scale-95 cursor-pointer ${
                        !profile.reducedMotion
                          ? 'bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-400/40'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{!profile.reducedMotion ? (isHi ? 'चालू' : 'Enabled') : (isHi ? 'हल्का मोड' : 'Lite Mode')}</span>
                    </button>
                  </div>

                  {/* Cache clear (Admin Only) */}
                  {isUserAuthenticated && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{isHi ? 'लोकल स्टोरेज व कैश' : 'Local Storage & Cache'}</p>
                        <p className="text-slate-700 dark:text-slate-300">{isHi ? 'इस डिवाइस पर सेव डेटा साफ़ करें' : 'Manage saved data on this browser'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearCache}
                        className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 transition-all active:scale-95 cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/50"
                      >
                        <HardDrive className="w-4 h-4" />
                        <span>{isHi ? 'कैश साफ़ करें' : 'Clear Cache'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Auth Card: Only shown inside Admin Session */}
      {isUserAuthenticated && (
        <div className="mt-8 p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left w-full sm:w-auto">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isHi ? 'व्यवस्थापक सत्र समाप्त (Log Out)' : 'Admin Session (Log Out)'}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  {profile.mobile || '7320913451'}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                {isHi 
                  ? 'लॉग आउट करने पर एडमिन सत्र समाप्त हो जाएगा और /admin फिर से लॉगिन माँगेगा।' 
                  : 'Logging out will end the admin session and require credentials to access again.'}
              </p>
            </div>
          </div>
          {onLogout && (
            <button
              type="button"
              id="bottom-logout-btn"
              onClick={onLogout}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition-all cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>{isHi ? 'लॉग आउट करें' : 'Log Out Admin'}</span>
            </button>
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
});
