import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  User
} from '@angular/fire/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
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
  }

  public async loginWithGoogle(): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) {
        throw new Error('Native Google Sign-In only works on device');
      }

      // Step 1: Native Google Sign-In
      const result = await FirebaseAuthentication.signInWithGoogle({
        customParameters: [{
          key: 'prompt',
          value: 'select_account'
        }]
      });

      // Step 2: Web Firebase Auth sign-in
      const credential = GoogleAuthProvider.credential(result.credential?.idToken);
      await signInWithCredential(this.auth, credential);
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
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
