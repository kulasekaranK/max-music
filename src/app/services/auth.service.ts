import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from '@angular/fire/auth';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private platform = inject(Platform);
  user: User | null = null;
  private authReady: Promise<User | null>;

  constructor() {
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

    // Handle redirect result for mobile
    if (this.platform.is('capacitor')) {
      getRedirectResult(this.auth).then((result) => {
        if (result?.user) {
          this.user = result.user;
          localStorage.setItem('user', JSON.stringify(result.user));
        }
      }).catch((err) => {
        console.error('Redirect error:', err);
      });
    }
  }

  async loginWithGoogle(): Promise<User | null> {
    const provider = new GoogleAuthProvider();
    try {
      if (this.platform.is('capacitor')) {
        // Mobile flow with redirect
        await signInWithRedirect(this.auth, provider);
        return null; // Will be handled by getRedirectResult
      } else {
        // Web flow with popup
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