import { PersonalPortfolioData } from '../types/portfolio';
import { UserProfile } from '../types';

const ADMIN_TOKEN_KEY = 'vyron_admin_session_token';
const ADMIN_PHONE_KEY = 'vyron_admin_phone';

/**
 * Gets the current admin session token from localStorage/sessionStorage.
 * Note: The password itself is NEVER stored anywhere on the client.
 */
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Synchronously checks if an admin session token exists.
 */
export function hasAdminSession(): boolean {
  return Boolean(getAdminToken());
}

/**
 * Stores the admin session token in localStorage & sessionStorage.
 */
export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {
    // Ignore quota errors
  }
}

/**
 * Clears the admin session token and stored admin phone.
 */
export function clearAdminToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_PHONE_KEY);
    sessionStorage.removeItem(ADMIN_PHONE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Gets stored admin phone number
 */
export function getAdminPhone(): string {
  if (typeof window === 'undefined') return '7320913451';
  try {
    return localStorage.getItem(ADMIN_PHONE_KEY) || sessionStorage.getItem(ADMIN_PHONE_KEY) || '7320913451';
  } catch {
    return '7320913451';
  }
}

/**
 * Stores admin phone number
 */
export function setAdminPhone(phone: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_PHONE_KEY, phone);
    sessionStorage.setItem(ADMIN_PHONE_KEY, phone);
  } catch {
    // Ignore
  }
}

/**
 * Authenticates the owner with username or phone and password via secure backend endpoint.
 * Credentials are not hardcoded or saved on the client.
 */
export async function adminLogin(
  usernameOrPhone: string, 
  password: string
): Promise<{ success: boolean; error?: string; phone?: string; username?: string }> {
  try {
    const trimmedInput = usernameOrPhone.trim();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: trimmedInput,
        phone: trimmedInput, 
        password: password.trim() 
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      clearAdminToken();
      return { 
        success: false, 
        error: data.error || 'Access Denied: Invalid credentials' 
      };
    }

    if (data.sessionToken) {
      setAdminToken(data.sessionToken);
      if (data.phone) {
        setAdminPhone(data.phone);
      }
    }

    return { 
      success: true, 
      phone: data.phone,
      username: data.username 
    };
  } catch (err: any) {
    return { 
      success: false, 
      error: err.message || 'Authentication request failed. Please check your connection and try again.' 
    };
  }
}

/**
 * Verifies if current active admin session token is still valid.
 */
export async function verifyAdminSession(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/admin/session', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) {
      clearAdminToken();
      return false;
    }
    const data = await res.json();
    if (!data.authenticated) {
      clearAdminToken();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Logs out the admin, invalidates session on server, and removes local token.
 */
export async function adminLogout(): Promise<void> {
  const token = getAdminToken();
  if (token) {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch {
      // Ignore network errors during logout
    }
  }
  clearAdminToken();
}

/**
 * Persists portfolio data securely via the admin backend API.
 */
export async function adminSavePortfolio(portfolio: PersonalPortfolioData): Promise<{ success: boolean; error?: string; updatedAt?: number }> {
  const token = getAdminToken();
  if (!token) {
    return { success: false, error: 'Unauthorized: Admin login required to save' };
  }

  try {
    const res = await fetch('/api/admin/save-portfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ portfolio })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to save portfolio to server' };
    }

    return { success: true, updatedAt: data.updatedAt };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error saving portfolio' };
  }
}

/**
 * Persists user profile data securely via the admin backend API.
 */
export async function adminSaveProfile(profile: UserProfile): Promise<{ success: boolean; error?: string }> {
  const token = getAdminToken();
  if (!token) {
    return { success: false, error: 'Unauthorized: Admin login required to save' };
  }

  try {
    const res = await fetch('/api/admin/save-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ profile })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to save profile to server' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error saving profile' };
  }
}

export interface UploadFileResponse {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  storedFileName?: string;
  fileSize?: string;
  bytes?: number;
  mimeType?: string;
  fileType?: 'pdf' | 'image' | 'text' | 'doc';
  format?: string;
  error?: string;
}

/**
 * Uploads a document or resume up to 100MB directly to the server.
 * Uses XMLHttpRequest for precise upload progress tracking (0% -> 100%).
 */
export function adminUploadFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadFileResponse> {
  return new Promise((resolve) => {
    // 100 MB Limit check
    if (file.size > 100 * 1024 * 1024) {
      resolve({ 
        success: false, 
        error: `File is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed capacity is 100MB.` 
      });
      return;
    }

    const token = getAdminToken();
    if (!token) {
      resolve({ success: false, error: 'Unauthorized: Admin login required to upload' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/upload-file');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && res.success) {
          resolve(res);
        } else {
          resolve({ success: false, error: res.error || `Upload failed with status ${xhr.status}` });
        }
      } catch {
        resolve({ success: false, error: 'Failed to parse upload server response' });
      }
    };

    xhr.onerror = () => {
      resolve({ success: false, error: 'Network error during file upload' });
    };

    xhr.send(formData);
  });
}
