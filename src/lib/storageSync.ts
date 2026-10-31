import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export async function uploadFileToCloud(userId: string, path: string, file: File): Promise<string> {
  const storageRef = ref(storage, `users/${userId}/${path}`);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

export async function deleteFileFromCloud(userId: string, path: string): Promise<void> {
  try {
    const storageRef = ref(storage, `users/${userId}/${path}`);
    await deleteObject(storageRef);
  } catch (err) {
    console.error('Failed to delete file from cloud:', err);
  }
}
