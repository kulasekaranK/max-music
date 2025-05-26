import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonApp, IonIcon, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonButton, IonApp, IonContent, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  loading = false;

  constructor(private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loading = true;
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
    this.loading = false;
  }

  
  async googleLogin() {
    const user = await this.authService.loginWithGoogle();
    if (user) {
      this.router.navigate(['/home'], { replaceUrl: true });
    }
  }
  

}
