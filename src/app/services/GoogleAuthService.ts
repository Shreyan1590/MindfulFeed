import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@southdevs/capacitor-google-auth';

import { apiUrl, GOOGLE_CLIENT_ID } from './api';

const GOOGLE_SCOPES = ['profile', 'email'];

let googleAuthInitialized = false;

type AuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
  };
};

export async function initializeGoogleAuth(): Promise<void> {
  if (googleAuthInitialized) {
    return;
  }

  await GoogleAuth.initialize({
    clientId: GOOGLE_CLIENT_ID,
    scopes: GOOGLE_SCOPES,
    grantOfflineAccess: false,
  });

  googleAuthInitialized = true;
}

export async function signInWithGoogle(): Promise<AuthResponse> {
  await initializeGoogleAuth();

  const googleUser = await GoogleAuth.signIn({
    clientId: GOOGLE_CLIENT_ID,
    serverClientId: GOOGLE_CLIENT_ID,
    scopes: GOOGLE_SCOPES,
    grantOfflineAccess: false,
  });

  const credential = googleUser.authentication?.idToken;
  if (!credential) {
    throw new Error('Google did not return a valid ID token. Please try again.');
  }

  const response = await fetch(apiUrl('/api/auth/google'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.user || !data.token) {
    throw new Error(data.error || 'Google sign in failed. Please try again.');
  }

  return data as AuthResponse;
}

export function getGoogleAuthErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Google sign in failed. Please try again.';
  }

  const message =
    'message' in error && typeof error.message === 'string' ? error.message : '';

  if (!message) {
    return 'Google sign in failed. Please try again.';
  }

  const normalizedMessage = message.toLowerCase();
  if (
    normalizedMessage.includes('cancel') ||
    normalizedMessage.includes('popup_closed') ||
    normalizedMessage.includes('popup closed')
  ) {
    return 'Google sign in was cancelled before it completed.';
  }

  if (normalizedMessage.includes('network')) {
    return 'Google sign in could not reach the server. Please check your connection and try again.';
  }

  if (Capacitor.isNativePlatform() && normalizedMessage.includes('12500')) {
    return 'Google sign in is not fully configured for this Android build yet. Please verify the package name and SHA-1 in Google Cloud.';
  }

  return message;
}
