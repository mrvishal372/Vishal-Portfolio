// Official Avatars for BharatJugaad & Vyron AI
// High-fidelity, modern 3D vector-rendered avatars and presets.

// 1. Primary Default Avatar: 3D Smart Tech Creator / Innovator
export const DEFAULT_AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgGlow" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="45%" stop-color="#1D4ED8" />
      <stop offset="85%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>
    
    <!-- Tricolor Ring Gradient -->
    <linearGradient id="flagRing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF9933" />
      <stop offset="50%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#138808" />
    </linearGradient>

    <!-- 3D Skin Tones -->
    <radialGradient id="faceGrad" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#FED7AA" />
      <stop offset="65%" stop-color="#FDBA74" />
      <stop offset="100%" stop-color="#FB923C" />
    </radialGradient>

    <radialGradient id="neckGrad" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#FDBA74" />
      <stop offset="100%" stop-color="#EA580C" />
    </radialGradient>

    <!-- Hair 3D Gradient -->
    <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155" />
      <stop offset="40%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>

    <!-- Hoodie / Jacket Gradient -->
    <linearGradient id="hoodieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="50%" stop-color="#3730A3" />
      <stop offset="100%" stop-color="#1E1B4B" />
    </linearGradient>

    <!-- Glasses Glass Gradient -->
    <linearGradient id="glassLens" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.5" />
      <stop offset="50%" stop-color="#0284C7" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#0369A1" stop-opacity="0.4" />
    </linearGradient>

    <!-- Glow Filter -->
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- 1. Background Rounded Canvas -->
  <rect width="256" height="256" fill="url(#bgGlow)" rx="128" />

  <!-- 2. Decorative Ambient Tech Rings -->
  <circle cx="128" cy="128" r="122" fill="none" stroke="url(#flagRing)" stroke-width="2.5" stroke-dasharray="6 4" opacity="0.75" />
  <circle cx="128" cy="128" r="116" fill="none" stroke="#60A5FA" stroke-width="1" opacity="0.3" />

  <!-- 3. Ambient Backlight Glow behind Head -->
  <circle cx="128" cy="110" r="68" fill="#60A5FA" opacity="0.28" filter="url(#softGlow)" />
  <circle cx="128" cy="160" r="50" fill="#34D399" opacity="0.18" filter="url(#softGlow)" />

  <!-- 4. Body / Stylish Tech Hoodie -->
  <g id="body">
    <!-- Shoulder base -->
    <path d="M42 240 C42 188, 76 168, 128 168 C180 168, 214 188, 214 240 Z" fill="url(#hoodieGrad)" />
    <!-- Hoodie Shadow Trim -->
    <path d="M42 240 C52 205, 80 188, 128 188 C176 188, 204 205, 214 240 Z" fill="#1E1B4B" opacity="0.45" />

    <!-- Modern T-Shirt V-Neck / Zipper -->
    <path d="M106 170 L128 206 L150 170 L140 168 L128 186 L116 168 Z" fill="#F8FAFC" />
    <line x1="128" y1="206" x2="128" y2="242" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round" />

    <!-- Bharat Saffron-White-Green Badge Pin on Chest -->
    <g transform="translate(162, 198)">
      <rect width="24" height="4" rx="2" fill="#FF9933" />
      <rect y="4" width="24" height="4" fill="#FFFFFF" />
      <rect y="8" width="24" height="4" rx="2" fill="#138808" />
      <circle cx="12" cy="6" r="1.5" fill="#000080" />
    </g>
  </g>

  <!-- 5. Neck with realistic shadow -->
  <g id="neck">
    <path d="M110 142 L110 174 C110 180, 146 180, 146 174 L146 142 Z" fill="url(#neckGrad)" />
    <!-- Shadow under chin -->
    <ellipse cx="128" cy="144" rx="22" ry="6" fill="#C2410C" opacity="0.45" />
  </g>

  <!-- 6. Face & Head 3D Shape -->
  <g id="head">
    <!-- Main Face -->
    <path d="M86 104 C86 58, 170 58, 170 104 C170 146, 148 158, 128 158 C108 158, 86 146, 86 104 Z" fill="url(#faceGrad)" />

    <!-- Cheeks Rosy Glow -->
    <circle cx="98" cy="120" r="10" fill="#F97316" opacity="0.25" filter="url(#softGlow)" />
    <circle cx="158" cy="120" r="10" fill="#F97316" opacity="0.25" filter="url(#softGlow)" />

    <!-- Left & Right Ears -->
    <ellipse cx="84" cy="108" rx="8" ry="12" fill="#FDBA74" />
    <ellipse cx="84" cy="108" rx="4" ry="6" fill="#EA580C" opacity="0.6" />

    <ellipse cx="172" cy="108" rx="8" ry="12" fill="#FDBA74" />
    <ellipse cx="172" cy="108" rx="4" ry="6" fill="#EA580C" opacity="0.6" />
  </g>

  <!-- 7. Stylish Quiff / Modern Voluminous Hair -->
  <g id="hair">
    <!-- Back Hair volume -->
    <path d="M82 92 C78 48, 102 32, 128 30 C154 32, 178 48, 174 92 C168 66, 154 52, 128 52 C102 52, 88 66, 82 92 Z" fill="url(#hairGrad)" />
    <!-- Front Hair Tufts with highlight -->
    <path d="M80 82 C82 46, 114 30, 134 32 C156 34, 176 50, 172 78 C160 56, 144 48, 122 48 C102 48, 88 62, 80 82 Z" fill="#1E293B" />
    <path d="M96 46 C112 36, 146 36, 160 48 C146 42, 116 42, 96 46 Z" fill="#475569" opacity="0.6" />
  </g>

  <!-- 8. Eyebrows (Smart & Sharp) -->
  <g id="eyebrows">
    <path d="M96 88 Q110 82 118 86" stroke="#0F172A" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M138 86 Q146 82 160 88" stroke="#0F172A" stroke-width="3.5" stroke-linecap="round" fill="none" />
  </g>

  <!-- 9. Eyes (Warm, Lively, Realistic Catchlights) -->
  <g id="eyes">
    <!-- Left Eye -->
    <ellipse cx="107" cy="98" rx="5" ry="6.5" fill="#0F172A" />
    <circle cx="109" cy="96" r="2" fill="#FFFFFF" />
    <circle cx="105" cy="100" r="1" fill="#FFFFFF" opacity="0.8" />

    <!-- Right Eye -->
    <ellipse cx="149" cy="98" rx="5" ry="6.5" fill="#0F172A" />
    <circle cx="151" cy="96" r="2" fill="#FFFFFF" />
    <circle cx="147" cy="100" r="1" fill="#FFFFFF" opacity="0.8" />
  </g>

  <!-- 10. Smart Designer Glasses with Blue Light Filter Reflect -->
  <g id="glasses">
    <!-- Left Frame -->
    <rect x="92" y="86" width="30" height="24" rx="8" fill="url(#glassLens)" stroke="#0F172A" stroke-width="2.8" />
    <!-- Right Frame -->
    <rect x="134" y="86" width="30" height="24" rx="8" fill="url(#glassLens)" stroke="#0F172A" stroke-width="2.8" />
    <!-- Bridge -->
    <path d="M122 95 Q128 92 134 95" stroke="#0F172A" stroke-width="2.8" fill="none" stroke-linecap="round" />
    
    <!-- Diagonal Glass Highlights -->
    <path d="M96 90 L108 90" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.75" />
    <path d="M138 90 L150 90" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.75" />
    <circle cx="118" cy="104" r="2" fill="#38BDF8" opacity="0.8" />
    <circle cx="160" cy="104" r="2" fill="#38BDF8" opacity="0.8" />
  </g>

  <!-- 11. 3D Shaded Nose -->
  <path d="M128 98 L124 116 Q128 119 132 116 Z" fill="#EA580C" opacity="0.8" />

  <!-- 12. Confident Friendly Smile -->
  <g id="mouth">
    <path d="M114 128 Q128 140 142 128" stroke="#9A3412" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M118 130 Q128 138 138 130" fill="#FFFFFF" opacity="0.95" />
    <!-- Dimples -->
    <circle cx="112" cy="127" r="1.5" fill="#C2410C" opacity="0.6" />
    <circle cx="144" cy="127" r="1.5" fill="#C2410C" opacity="0.6" />
  </g>

  <!-- 13. Sparkles & Innovation Aura -->
  <g transform="translate(192, 60) scale(0.85)">
    <path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" fill="#FBBF24" />
  </g>
  <g transform="translate(40, 75) scale(0.65)">
    <path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" fill="#38BDF8" />
  </g>
</svg>`;

export const DEFAULT_AVATAR_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(DEFAULT_AVATAR_SVG)}`;

// Preset Avatars for Instant Selection
export interface PresetAvatar {
  id: string;
  name: string;
  emoji: string;
  category: 'Tech' | 'Emoji' | 'Indian' | 'Pro';
  dataUri: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'avatar-creator-3d',
    name: 'Smart Tech Creator',
    emoji: '👨‍💻',
    category: 'Tech',
    dataUri: DEFAULT_AVATAR_DATA_URI,
  },
  {
    id: 'avatar-3d-innovator',
    name: 'Cyber Innovator',
    emoji: '🚀',
    category: 'Tech',
    dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <radialGradient id="bgA" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#8B5CF6" />
      <stop offset="50%" stop-color="#4C1D95" />
      <stop offset="100%" stop-color="#09090B" />
    </radialGradient>
  </defs>
  <rect width="256" height="256" fill="url(#bgA)" rx="128" />
  <circle cx="128" cy="128" r="118" fill="none" stroke="#A78BFA" stroke-width="3" stroke-dasharray="8 4" opacity="0.6"/>
  <text x="128" y="160" font-size="110" text-anchor="middle" dominant-baseline="central">🚀</text>
</svg>
`)}`,
  },
  {
    id: 'avatar-3d-ai-pro',
    name: 'AI Genius Boy',
    emoji: '🤖',
    category: 'Tech',
    dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <radialGradient id="bgB" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#06B6D4" />
      <stop offset="50%" stop-color="#0E7490" />
      <stop offset="100%" stop-color="#082F49" />
    </radialGradient>
  </defs>
  <rect width="256" height="256" fill="url(#bgB)" rx="128" />
  <circle cx="128" cy="128" r="118" fill="none" stroke="#38BDF8" stroke-width="3" opacity="0.7"/>
  <text x="128" y="155" font-size="115" text-anchor="middle" dominant-baseline="central">⚡</text>
</svg>
`)}`,
  },
  {
    id: 'avatar-bharat-jugaad',
    name: 'Bharat Leader',
    emoji: '🇮🇳',
    category: 'Indian',
    dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <linearGradient id="triBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF9933" />
      <stop offset="50%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#138808" />
    </linearGradient>
  </defs>
  <rect width="256" height="256" fill="url(#triBg)" rx="128" />
  <circle cx="128" cy="128" r="120" fill="none" stroke="#000080" stroke-width="4" />
  <text x="128" y="152" font-size="105" text-anchor="middle" dominant-baseline="central">👑</text>
</svg>
`)}`,
  },
  {
    id: 'avatar-cool-emoji',
    name: 'Cool Sunglasses',
    emoji: '😎',
    category: 'Emoji',
    dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <radialGradient id="bgCool" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="60%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#78350F" />
    </radialGradient>
  </defs>
  <rect width="256" height="256" fill="url(#bgCool)" rx="128" />
  <circle cx="128" cy="128" r="118" fill="none" stroke="#FDE68A" stroke-width="3" opacity="0.6"/>
  <text x="128" y="155" font-size="120" text-anchor="middle" dominant-baseline="central">😎</text>
</svg>
`)}`,
  },
  {
    id: 'avatar-fire-creator',
    name: 'Jugaad Master',
    emoji: '🔥',
    category: 'Emoji',
    dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <radialGradient id="bgFire" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#EF4444" />
      <stop offset="50%" stop-color="#B91C1C" />
      <stop offset="100%" stop-color="#450A0A" />
    </radialGradient>
  </defs>
  <rect width="256" height="256" fill="url(#bgFire)" rx="128" />
  <circle cx="128" cy="128" r="118" fill="none" stroke="#FCA5A5" stroke-width="3" opacity="0.6"/>
  <text x="128" y="155" font-size="120" text-anchor="middle" dominant-baseline="central">🔥</text>
</svg>
`)}`,
  },
  {
    id: 'avatar-namaste',
    name: 'Namaste Pro',
    emoji: '🙏',
    category: 'Indian',
    dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <radialGradient id="bgNam" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="50%" stop-color="#047857" />
      <stop offset="100%" stop-color="#064E3B" />
    </radialGradient>
  </defs>
  <rect width="256" height="256" fill="url(#bgNam)" rx="128" />
  <circle cx="128" cy="128" r="118" fill="none" stroke="#A7F3D0" stroke-width="3" opacity="0.6"/>
  <text x="128" y="155" font-size="120" text-anchor="middle" dominant-baseline="central">🙏</text>
</svg>
`)}`,
  },
  {
    id: 'avatar-tech-coder',
    name: 'Full Stack Coder',
    emoji: '💻',
    category: 'Tech',
    dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <radialGradient id="bgCode" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="50%" stop-color="#1D4ED8" />
      <stop offset="100%" stop-color="#0F172A" />
    </radialGradient>
  </defs>
  <rect width="256" height="256" fill="url(#bgCode)" rx="128" />
  <circle cx="128" cy="128" r="118" fill="none" stroke="#93C5FD" stroke-width="3" opacity="0.6"/>
  <text x="128" y="155" font-size="120" text-anchor="middle" dominant-baseline="central">💻</text>
</svg>
`)}`,
  },
];

/**
 * Helper to check if an avatar URL is a real user-uploaded or customized photo (not a generic placeholder).
 */
export const isCustomAvatarUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return (
    trimmed !== '' &&
    trimmed !== '/logo.png' &&
    trimmed !== '/default-avatar.svg' &&
    trimmed !== '/profile.png.jpeg' &&
    trimmed !== 'undefined' &&
    trimmed !== 'null'
  );
};

/**
 * Returns the effective avatar URL for a profile:
 * If user has customized their avatar (base64 or custom URL), it returns that.
 * Otherwise, checks permanent admin custom avatar storage, then falls back to creator photo.
 */
export const getEffectiveAvatarUrl = (avatarUrl?: string): string => {
  // 1. Direct custom avatar provided
  if (isCustomAvatarUrl(avatarUrl)) {
    return avatarUrl!;
  }

  // 2. Check permanent local storage layers
  if (typeof window !== 'undefined') {
    try {
      // Check dedicated permanent custom avatar key
      const permanentCustom = localStorage.getItem('vyron_admin_custom_avatar_permanent') || localStorage.getItem('vyron_admin_custom_avatar');
      if (isCustomAvatarUrl(permanentCustom)) {
        return permanentCustom!;
      }

      const userProfileRaw = localStorage.getItem('bharatjugaad_user_profile_v1') || localStorage.getItem('bharatjugaad_user_profile');
      if (userProfileRaw) {
        const parsed = JSON.parse(userProfileRaw);
        if (isCustomAvatarUrl(parsed?.avatarUrl)) {
          return parsed.avatarUrl;
        }
      }

      const portfolioRaw = localStorage.getItem('bharatjugaad_custom_user_portfolio_v3') || localStorage.getItem('vishal_personal_portfolio_v1');
      if (portfolioRaw) {
        const parsedP = JSON.parse(portfolioRaw);
        if (isCustomAvatarUrl(parsedP?.avatarUrl)) {
          return parsedP.avatarUrl;
        }
      }
    } catch {
      // ignore parsing error and fallback
    }
  }

  return '/profile.png.jpeg';
};
