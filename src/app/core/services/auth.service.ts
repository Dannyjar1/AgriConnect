import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, authState, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { from, of, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  authState$ = authState(this.auth);

  register(email: string, password: string): any {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(({ user }) => {
        const userDoc: User = {
          uid: user.uid,
          email: user.email!,
          userType: 'buyer', // Default to buyer
          createdAt: new Date(),
          lastLogin: new Date()
        };
        return from(setDoc(doc(this.firestore, 'users', user.uid), userDoc));
      }),
      catchError(error => {
        console.error('Firebase registration error:', error);
        return throwError(() => error);
      })
    );
  }

  login(email: string, password: string): any {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      catchError(error => {
        console.error('Firebase login error:', error);
        return throwError(() => error);
      })
    );
  }

  loginWithGoogle(): any {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider)).pipe(
      switchMap(({ user }) => {
        const userDoc: User = {
          uid: user.uid,
          email: user.email!,
          userType: 'buyer', // Default to buyer
          createdAt: new Date(),
          lastLogin: new Date()
        };
        return from(setDoc(doc(this.firestore, 'users', user.uid), userDoc));
      }),
      catchError(error => {
        console.error('Firebase Google sign-in error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): any {
    return from(signOut(this.auth)).pipe(
      catchError(error => {
        console.error('Firebase logout error:', error);
        return throwError(() => error);
      })
    );
  }

  sendPasswordResetEmail(email: string): any {
    return from(sendPasswordResetEmail(this.auth, email)).pipe(
      catchError(error => {
        console.error('Firebase password reset error:', error);
        return throwError(() => error);
      })
    );
  }
}

