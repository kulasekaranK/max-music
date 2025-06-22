import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User
} from '@angular/fire/auth';
import { Platform } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private platform = inject(Platform);
  user: User | null = null;
  private authReady: Promise<User | null>;

  constructor() {
    // Detect login state
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

    // Handle redirect result only on mobile
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

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();

    try {
      if (this.platform.is('capacitor')) {
        // 🔁 Use redirect login on mobile
        await signInWithRedirect(this.auth, provider);
      } else {
        // 🖥️ Use popup on web
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

  logout() {
    localStorage.removeItem('user');
    return signOut(this.auth);
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.user) return this.user;
    return this.authReady;
  }

  isLoggedIn(): boolean {
    return !!this.auth.currentUser || !!localStorage.getItem('user');
  }
}
