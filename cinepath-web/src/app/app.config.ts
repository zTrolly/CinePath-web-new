import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(), provideAnimationsAsync(), provideFirebaseApp(() => initializeApp({"projectId":"cinepath-all","appId":"1:550242604743:web:8fdd775090cfe56baad0e2","storageBucket":"cinepath-all.appspot.com","apiKey":"AIzaSyCnQU2whS-dJVh39TAJQ6J4nDtFF7YVYR0","authDomain":"cinepath-all.firebaseapp.com","messagingSenderId":"550242604743","measurementId":"G-DRQPXR00R5"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
