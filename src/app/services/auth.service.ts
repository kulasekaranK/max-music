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

  public async loginWithGoogle(): Promise<User | null> {
    try {
      if (!Capacitor.isNativePlatform()) {
        throw new Error('Native Google Sign-In only works on device');
      }
  
      const result = await FirebaseAuthentication.signInWithGoogle({
        customParameters: [{ key: 'prompt', value: 'select_account' }]
      });
  
      const credential = GoogleAuthProvider.credential(result.credential?.idToken);
      const userCredential = await signInWithCredential(this.auth, credential);
  
      this.user = userCredential.user;
      localStorage.setItem('user', JSON.stringify(userCredential.user));
  
      return userCredential.user;
    } catch (error) {
      console.error('Google login error:', error);
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
