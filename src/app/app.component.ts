import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { StatusBar, Style } from '@capacitor/status-bar';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor() {
    this.initializeApp();
    this.setAppTheme();
  }

  ngOnInit() {
    const observer = new MutationObserver(() => {
      this.setStatusBarTheme();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  async initializeApp() {
    this.setStatusBarTheme();
  }

  async setStatusBarTheme() {
    const isDark =
      document.documentElement.classList.contains('ion-palette-dark');
    if (isDark) {
      await StatusBar.setBackgroundColor({ color: '#0e101d' });
      await StatusBar.setStyle({ style: Style.Dark });
    } else {
      await StatusBar.setBackgroundColor({ color: '#f3f4ff' });
      await StatusBar.setStyle({ style: Style.Light });
    }
  }
  setAppTheme() {
    document.documentElement.classList.toggle('ion-palette-dark');
  }
}