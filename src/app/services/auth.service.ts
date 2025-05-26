import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User, getAuth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user: User | null = null;
  private authReady: Promise<User | null>;

  constructor(private auth: Auth) {
    this.authReady = new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        this.user = user;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          localStorage.removeItem('user');
        }
        resolve(user); // Resolve once auth state is known
      });
    });
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      return result.user;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  logout() {
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
