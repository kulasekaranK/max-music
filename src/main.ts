import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { initializeApp } from 'firebase/app';
import { environment } from './environments/environment';
import { provideFirestore } from '@angular/fire/firestore';
import { getFirestore } from 'firebase/firestore';
import { provideStorage } from '@angular/fire/storage';
import { getStorage } from 'firebase/storage';
// import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import {provideDatabase} from '@angular/fire/database'
import { provideHttpClient } from '@angular/common/http';
import { getDatabase } from 'firebase/database';
import { AuthGuard } from './app/guards/auth.guard';



// defineCustomElements(window);


const firebaseApp =  initializeApp({
  apiKey: "AIzaSyAOzJLEoMIBLiYsEWFbI_OYuyux5bH2kgI",

  authDomain: "max-tube-official.firebaseapp.com",

  projectId: "max-tube-official",

  storageBucket: "max-tube-official.firebasestorage.app",

  messagingSenderId: "622086667091",

  appId: "1:622086667091:web:71fdfea798fd82cc0bbfa6",

  measurementId: "G-S1FHZMXP3Z"

});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    AuthGuard,
    provideFirebaseApp(() => firebaseApp),
    provideAuth(() => getAuth(firebaseApp)),
    provideFirestore(() => getFirestore(firebaseApp)),
    provideStorage(() => getStorage(firebaseApp)),
    provideMessaging(()=>getMessaging()),
    provideHttpClient(),
    provideDatabase(()=>getDatabase())
  ],
});