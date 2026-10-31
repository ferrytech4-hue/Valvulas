/**
 * Servicio de Autenticación de Google Workspace (Firebase Auth)
 * Sistema de Control de Calidad PGP 2026
 * 
 * Conexión segura con Google Drive usando alcance mínimo:
 * https://www.googleapis.com/auth/drive.file
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { googleDriveService } from './googleDriveService';

// Reutilizar o inicializar la instancia de Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Alcance mínimo solicitado: únicamente archivos creados o abiertos por la app
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let currentUser: User | null = null;

// Escuchar cambios de estado de autenticación
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    currentUser = user;
    if (user && cachedAccessToken) {
      googleDriveService.setAccessToken(cachedAccessToken, user.email || undefined, user.displayName || undefined);
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

/**
 * Inicia el flujo de autenticación popup con Google
 */
export const signInWithGoogleDrive = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('No fue posible obtener el token de acceso de Google Drive.');
    }

    cachedAccessToken = credential.accessToken;
    currentUser = result.user;

    // Sincronizar token en memoria con el servicio de Google Drive
    googleDriveService.setAccessToken(
      cachedAccessToken, 
      result.user.email || undefined, 
      result.user.displayName || undefined
    );

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGoogleAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getCurrentGoogleUser = (): User | null => {
  return currentUser;
};

export const signOutGoogleDrive = async (): Promise<void> => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
    currentUser = null;
    googleDriveService.disconnect();
  } catch (e) {
    console.error('Error cerrando sesión de Google:', e);
  }
};
