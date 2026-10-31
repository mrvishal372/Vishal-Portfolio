import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updatePassword,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';

export { auth };

// Save user profile & saved items to Firestore
export async function saveProfileToFirestore(uid: string, profile: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, 'public_profiles', 'owner');
    const cleanData = JSON.parse(JSON.stringify(profile));
    await setDoc(userRef, {
      ...cleanData,
      ownerUid: uid,
      name: profile.name || cleanData.name || '',
      avatarUrl: profile.avatarUrl || cleanData.avatarUrl || '',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving profile to Firestore:', err);
  }
}

// Fetch user profile from Firestore
export async function fetchProfileFromFirestore(): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'public_profiles', 'owner');
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      const extracted: any = { ...data };
      if (data.personalPortfolio?.fullName) extracted.name = data.personalPortfolio.fullName;
      if (data.personalPortfolio?.avatarUrl) extracted.avatarUrl = data.personalPortfolio.avatarUrl;
      return extracted as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching profile from Firestore:', err);
    return null;
  }
}

// Subscribe to real-time changes for a user's cloud profile
export function subscribeToCloudProfile(onUpdate: (profile: Partial<UserProfile>) => void): () => void {
  const userRef = doc(db, 'public_profiles', 'owner');
  return onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const extracted: Partial<UserProfile> = { ...data };
      if (data.name) extracted.name = data.name;
      else if (data.personalPortfolio?.fullName) extracted.name = data.personalPortfolio.fullName;

      if (data.avatarUrl) extracted.avatarUrl = data.avatarUrl;
      else if (data.personalPortfolio?.avatarUrl) extracted.avatarUrl = data.personalPortfolio.avatarUrl;

      if (data.aboutMe) extracted.aboutMe = data.aboutMe;
      else if (data.personalPortfolio?.shortBio) extracted.aboutMe = data.personalPortfolio.shortBio;

      onUpdate(extracted);
    }
  }, (error) => {
    console.warn('Cloud profile snapshot note:', error);
  });
}

// Register a new user with Email and Password
export async function registerWithEmail(email: string, pass: string, currentProfile: UserProfile): Promise<{ user: FirebaseUser; profile: UserProfile }> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  
  const updatedProfile: UserProfile = {
    ...currentProfile,
    email: user.email || email,
  };

  await saveProfileToFirestore(user.uid, updatedProfile);
  return { user, profile: updatedProfile };
}

// Login user with Email and Password
export async function loginWithEmail(email: string, pass: string): Promise<{ user: FirebaseUser; profile: UserProfile | null }> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  const profile = await fetchProfileFromFirestore();
  return { user, profile };
}

// Logout user
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Reset Password Email
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// Change Password for currently logged in user
export async function changeUserPassword(newPass: string): Promise<void> {
  if (!auth.currentUser) throw new Error('No user currently logged in');
  await updatePassword(auth.currentUser, newPass);
}


export function diagnoseFirebaseConfig(): void {
  console.group('🔥 Firebase Configuration Diagnostics');
  try {
    const appOptions = auth.app.options;
    console.log('Currently Connected Project ID:', appOptions.projectId);
    console.log('Currently Connected Auth Domain:', appOptions.authDomain);
    console.log('Currently Connected API Key (first 10 chars):', appOptions.apiKey ? appOptions.apiKey.substring(0, 10) + '...' : 'Missing');
    
    if (appOptions.projectId === 'stately-pentameter-fds98') {
      console.warn('⚠️ WARNING: You are still connected to the default AI Studio project (stately-pentameter-fds98).');
      console.warn('⚠️ Phone Authentication will NOT work until you replace the configuration in firebase-applet-config.json with your "Vishal Portfolio" project details.');
    } else {
      console.log('✅ Custom project detected. Ensure this matches your "Vishal Portfolio" project settings.');
    }
  } catch (error) {
    console.error('Failed to read Firebase App options:', error);
  }
  console.groupEnd();
}
