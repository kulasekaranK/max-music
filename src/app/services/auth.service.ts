import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from '@angular/fire/auth';
import { Platform } from '@ionic/angular';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private platform = inject(Platform);
  user: User | null = null;
  private authReady: Promise<User | null>;

  constructor() {
    // Initialize Google Auth plugin for native apps
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize();
    }

    // Detect auth state changes
    this.authReady = new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        this.user = user;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          localStorage.removeItem('user');
        }
        resolve(user);
      });
    });
  }

  async loginWithGoogle(): Promise<User | null> {
    const provider = new GoogleAuthProvider();
    try {
      if (this.platform.is('capacitor')) {
        // Native mobile flow
        const googleUser = await GoogleAuth.signIn();
        const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
        const result = await signInWithCredential(this.auth, credential);
        this.user = result.user;
        localStorage.setItem('user', JSON.stringify(result.user));
        return result.user;
      } else {
        // Web flow
        const result = await signInWithPopup(this.auth, provider);
        this.user = result.user;
        localStorage.setItem('user', JSON.stringify(result.user));
        return result.user;
      }
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.platform.is('capacitor')) {
        await GoogleAuth.signOut();
      }
      await signOut(this.auth);
      this.user = null;
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.user) return this.user;
    return this.authReady;
  }

  isLoggedIn(): boolean {
    return !!this.auth.currentUser || !!localStorage.getItem('user');
  }
}