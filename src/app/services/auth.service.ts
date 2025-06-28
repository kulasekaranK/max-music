import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  User,
  signInWithPopup
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
      let user: User | null = null;
  
      if (Capacitor.isNativePlatform()) {
        // ✅ Native Google Login
        const result = await FirebaseAuthentication.signInWithGoogle({
          customParameters: [{ key: 'prompt', value: 'select_account' }]
        });
  
        const credential = GoogleAuthProvider.credential(result.credential?.idToken);
        const userCredential = await signInWithCredential(this.auth, credential);
        user = userCredential.user;
      } else {
        // ✅ Web Google Login
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(this.auth, provider);
        user = userCredential.user;
      }
  
      if (user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
      }
  
      return user;
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
