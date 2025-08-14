import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, authState, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { from, of, throwError, Observable, combineLatest } from 'rxjs';
import { switchMap, catchError, map, shareReplay } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  authState$ = authState(this.auth);

  // Observable que combina datos de Firebase Auth con Firestore
  currentUser$ = this.authState$.pipe(
    switchMap(firebaseUser => {
      if (!firebaseUser) {
        return of(null);
      }
      return this.getUserFromFirestore(firebaseUser.uid);
    }),
    shareReplay(1)
  );

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

  registerWithUserData(email: string, password: string, userData: { displayName?: string; phone?: string; userType?: string }): any {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(async ({ user }) => {
        // Update Firebase Auth profile if displayName is provided
        if (userData.displayName) {
          await updateProfile(user, { displayName: userData.displayName });
        }
        
        // Create user document in Firestore with additional data
        const userDoc: User = {
          uid: user.uid,
          email: user.email!,
          displayName: userData.displayName || '',
          phone: userData.phone || '',
          userType: (userData.userType as 'producer' | 'buyer' | 'institutional') || 'buyer',
          createdAt: new Date(),
          lastLogin: new Date()
        };
        
        return setDoc(doc(this.firestore, 'users', user.uid), userDoc);
      }),
      catchError(error => {
        console.error('Firebase registration with user data error:', error);
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
      switchMap(async ({ user }) => {
        // Check if user document exists, if not create it
        const userDoc: User = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          userType: 'buyer', // Default to buyer
          isVerified: user.emailVerified,
          createdAt: new Date(),
          lastLogin: new Date()
        };
        
        // Use merge: true to not overwrite existing data
        return setDoc(doc(this.firestore, 'users', user.uid), userDoc, { merge: true });
      }),
      catchError(error => {
        console.error('Firebase Google sign-in error:', error);
        return throwError(() => error);
      })
    );
  }

  registerWithGoogle(): any {
    // Same as loginWithGoogle since Google auth doesn't distinguish between login/register
    return this.loginWithGoogle();
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

  /**
   * Obtiene datos del usuario desde Firestore
   */
  private getUserFromFirestore(uid: string): Observable<User | null> {
    return from(getDoc(doc(this.firestore, 'users', uid))).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          return docSnapshot.data() as User;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error getting user from Firestore:', error);
        return of(null);
      })
    );
  }

  /**
   * Verifica si el usuario actual tiene un rol específico
   */
  hasRole(role: 'producer' | 'buyer' | 'institutional'): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user?.userType === role)
    );
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getUserRole(): Observable<'producer' | 'buyer' | 'institutional' | null> {
    return this.currentUser$.pipe(
      map(user => user?.userType || null)
    );
  }
}

