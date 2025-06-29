import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from '@angular/fire/auth';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { BehaviorSubject, Observable } from 'rxjs';

interface GoogleLoginResponse {
  idToken?: string;
  accessToken?: string;
  email?: string;
  name?: string;
  familyName?: string;
  givenName?: string;
  imageUrl?: string;
}

interface SocialLoginResult {
  provider: string;
  result: GoogleLoginResponse;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);

  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isLoading: true,
    isInitialized: false
  });

  public authState$: Observable<AuthState> = this.authStateSubject.asObservable();
  private initializationPromise: Promise<void>;

  constructor() {
    this.initializationPromise = this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await this.initializeSocialLogin();
      }

      onAuthStateChanged(this.auth, (user) => {
        this.updateAuthState(user, false, true);
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.updateAuthState(null, false, true);
    }
  }

  private async initializeSocialLogin(): Promise<void> {
    try {
      await SocialLogin.initialize({
        google: {
          webClientId: '622086667091-17ll1ms8rljekhn354dhct059khr1r6h.apps.googleusercontent.com',
        },
      });
    } catch (error) {
      console.error('SocialLogin initialization error:', error);
      throw error;
    }
  }

  private updateAuthState(user: User | null, isLoading: boolean = false, isInitialized: boolean = false): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      user,
      isLoading,
      isInitialized: isInitialized || currentState.isInitialized
    });
  }

  public async loginWithGoogle(): Promise<User | null> {
    await this.initializationPromise;
    this.updateAuthState(null, true);

    try {
      const user = Capacitor.isNativePlatform()
        ? await this.handleNativeGoogleLogin()
        : await this.handleWebGoogleLogin();

      this.updateAuthState(user, false);
      return user;
    } catch (error) {
      console.error('Google login error:', error);
      this.updateAuthState(null, false);
      throw error;
    }
  }

  private async handleNativeGoogleLogin(): Promise<User | null> {
    const result = await SocialLogin.login({
      provider: 'google',
      options: { scopes: ['email', 'profile'] },
    }) as SocialLoginResult;

    const idToken = result.result?.idToken;
    if (!idToken) {
      throw new Error('No ID token received from Google login.');
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(this.auth, credential);
    return userCredential.user;
  }

  private async handleWebGoogleLogin(): Promise<User | null> {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });

    const userCredential = await signInWithPopup(this.auth, provider);
    return userCredential.user;
  }

  public async logout(): Promise<void> {
    this.updateAuthState(null, true);
    await signOut(this.auth);
    this.updateAuthState(null, false);
  }

  public async getCurrentUser(): Promise<User | null> {
    await this.initializationPromise;
    return this.authStateSubject.value.user;
  }

  public get currentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  public isLoggedIn(): boolean {
    return !!this.authStateSubject.value.user;
  }

  public async waitForAuthReady(): Promise<void> {
    await this.initializationPromise;

    return new Promise((resolve) => {
      if (this.authStateSubject.value.isInitialized) {
        resolve();
      } else {
        const sub = this.authState$.subscribe((state: any) => {
          if (state.isInitialized) {
            sub.unsubscribe();
            resolve();
          }
        });
      }
    });
  }

  public getUserDisplayInfo(): { name: string; email: string; photoURL: string } | null {
    const user = this.currentUser;
    if (!user) return null;

    return {
      name: user.displayName || 'Unknown User',
      email: user.email || '',
      photoURL: user.photoURL || ''
    };
  }

  public isEmailVerified(): boolean {
    return this.currentUser?.emailVerified || false;
  }
}
