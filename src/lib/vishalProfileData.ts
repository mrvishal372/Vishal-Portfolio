import { PersonalPortfolioData } from '../types/portfolio';
import { BLANK_PORTFOLIO, loadPortfolioSync, savePortfolioPermanently, STORAGE_KEY } from './portfolioStorage';

export { BLANK_PORTFOLIO, STORAGE_KEY };

/**
 * The initial profile state MUST be completely blank as explicitly requested by the user.
 * No personal info, name, certificate, project, link or sample content is pre-filled.
 */
export const INITIAL_VISHAL_PROFILE: PersonalPortfolioData = { ...BLANK_PORTFOLIO };

/**
 * Generates an SVG visual resume data URI dynamically when user enters details.
 */
export function generateResumePreviewDataUri(data: PersonalPortfolioData): string {
  const name = data.fullName || 'Your Name';
  const headline = data.headline || data.degree || 'Professional Profile';
  const email = data.email || 'email@example.com';
  const phone = data.phone || '+91 XXXXX XXXXX';
  const location = data.location || 'India';
  const bio = data.shortBio || data.aboutMe || 'Profile overview not yet added. Click Edit Profile to update.';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1130" width="100%" height="100%" style="background:#ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <defs>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#000080" />
        <stop offset="50%" stop-color="#1e1b4b" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
    </defs>

    <!-- Top Banner -->
    <rect x="0" y="0" width="800" height="130" fill="url(#headerGrad)" />

    <!-- Name & Title -->
    <text x="40" y="55" fill="#ffffff" font-size="28" font-weight="800" letter-spacing="0.5">${name}</text>
    <text x="40" y="85" fill="#facc15" font-size="15" font-weight="600">${headline}</text>
    <text x="40" y="110" fill="#e2e8f0" font-size="12">📧 ${email}   |   📱 ${phone}   |   📍 ${location}</text>

    <!-- Professional Summary -->
    <g transform="translate(40, 160)">
      <rect x="0" y="0" width="720" height="24" rx="4" fill="#f1f5f9" />
      <text x="10" y="17" fill="#0f172a" font-size="13" font-weight="700">PROFILE SUMMARY</text>
      <text x="0" y="45" fill="#334155" font-size="12">
        <tspan x="0" dy="0">${bio.slice(0, 110)}</tspan>
        ${bio.length > 110 ? `<tspan x="0" dy="18">${bio.slice(110, 220)}</tspan>` : ''}
      </text>
    </g>

    <!-- Projects Section -->
    <g transform="translate(40, 270)">
      <rect x="0" y="0" width="720" height="24" rx="4" fill="#f1f5f9" />
      <text x="10" y="17" fill="#0f172a" font-size="13" font-weight="700">PROJECTS &amp; ACHIEVEMENTS</text>
      ${data.projects.length === 0 
        ? '<text x="0" y="45" fill="#94a3b8" font-size="12">No projects added yet.</text>'
        : data.projects.slice(0, 3).map((p, idx) => `
            <g transform="translate(0, ${45 + idx * 75})">
              <text x="0" y="0" fill="#000080" font-size="13" font-weight="700">${idx + 1}. ${p.title}</text>
              <text x="0" y="18" fill="#475569" font-size="11">Tech: ${p.technologies.join(', ') || 'Various'}</text>
              <text x="0" y="34" fill="#334155" font-size="11">${p.description.slice(0, 95)}</text>
            </g>
          `).join('')}
    </g>

    <!-- Education Section -->
    <g transform="translate(40, 540)">
      <rect x="0" y="0" width="720" height="24" rx="4" fill="#f1f5f9" />
      <text x="10" y="17" fill="#0f172a" font-size="13" font-weight="700">EDUCATION</text>
      ${data.education.length === 0 
        ? '<text x="0" y="45" fill="#94a3b8" font-size="12">No education records added yet.</text>'
        : data.education.slice(0, 2).map((edu, idx) => `
            <g transform="translate(0, ${45 + idx * 65})">
              <text x="0" y="0" fill="#0f172a" font-size="13" font-weight="700">${edu.degree}</text>
              <text x="0" y="18" fill="#475569" font-size="11">${edu.institution} | ${edu.duration} | ${edu.status}</text>
            </g>
          `).join('')}
    </g>

    <!-- Skills Section -->
    <g transform="translate(40, 720)">
      <rect x="0" y="0" width="720" height="24" rx="4" fill="#f1f5f9" />
      <text x="10" y="17" fill="#0f172a" font-size="13" font-weight="700">KEY SKILLS</text>
      <text x="0" y="45" fill="#334155" font-size="12">
        ${data.skillCategories.flatMap(c => c.skills.map(s => s.name)).join(' • ') || 'No skills added yet.'}
      </text>
    </g>

    <!-- Footer Bar -->
    <rect x="0" y="1100" width="800" height="30" fill="#f8fafc" />
    <text x="400" y="1120" fill="#94a3b8" font-size="10" text-anchor="middle">Personal Digital Resume &bull; Verified Profile</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Loads the user's customized portfolio data from localStorage or returns clean blank state.
 */
export function loadVishalProfile(): PersonalPortfolioData {
  if (typeof window === 'undefined') return { ...BLANK_PORTFOLIO };
  return loadPortfolioSync();
}

/**
 * Persists customized portfolio data to localStorage, IndexedDB and Firebase Firestore.
 */
export function saveVishalProfile(data: PersonalPortfolioData): void {
  savePortfolioPermanently(data).catch((err) => {
    console.warn('Background permanent save error:', err);
  });
}

/**
 * Resets portfolio data to completely blank state.
 */
export function resetVishalProfile(): PersonalPortfolioData {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  const clean = { ...BLANK_PORTFOLIO };
  saveVishalProfile(clean);
  return clean;
}
