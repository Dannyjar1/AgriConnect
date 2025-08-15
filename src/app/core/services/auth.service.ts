import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, updateProfile, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { from, of, throwError, Observable, BehaviorSubject } from 'rxjs';
import { switchMap, catchError, map, shareReplay, take, filter } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  // BehaviorSubject para mantener el estado de autenticación
  private authStateSubject = new BehaviorSubject<any>(null);
  authState$ = this.authStateSubject.asObservable();

  // Observable que combina datos de Firebase Auth con Firestore
  currentUser$ = this.authState$.pipe(
    switchMap(firebaseUser => {
      if (!firebaseUser) {
        console.log('No hay usuario de Firebase Auth');
        return of(null);
      }
      console.log('Obteniendo datos de Firestore para usuario:', firebaseUser.email);
      return this.getUserFromFirestore(firebaseUser.uid).pipe(
        map(userData => {
          if (userData) {
            console.log('✅ Datos de usuario obtenidos de Firestore:', userData);
            console.log('✅ UserType:', userData.userType);
            console.log('✅ Email:', userData.email);
            return userData;
          } else {
            console.log('❌ No se encontraron datos en Firestore para el usuario');
            return null;
          }
        })
      );
    }),
    shareReplay(1)
  );

  constructor() {
    this.initializeAuth();
  }

  /**
   * Inicializa la autenticación con persistencia
   * Implementa las mejores prácticas de la guía Firebase
   */
  private initializeAuth(): void {
    // Escuchar cambios en el estado de autenticación
    onAuthStateChanged(this.auth, (user) => {
      this.authStateSubject.next(user);
      if (user) {
        console.log('Usuario autenticado:', user.email);
        // Actualizar último login en Firestore
        this.updateLastLogin(user.uid);

        // Manejar redirección automática si estamos en login
        this.handleAutoRedirect();
      } else {
        console.log('Usuario no autenticado');
      }
    });
  }

  /**
   * Maneja la redirección automática después de la autenticación
   */
  private handleAutoRedirect(): void {
    // Solo redirigir si estamos en páginas de auth
    const currentUrl = window.location.pathname;
    if (currentUrl === '/auth/login' || currentUrl === '/auth/register' || currentUrl === '/') {
      console.log('🚀 Redirigiendo a componente de redirección automática');
      // Usar el componente de redirección automática
      setTimeout(() => {
        window.location.href = '/redirect';
      }, 1000);
    }
  }

  /**
   * Asegura que el documento del usuario existe y está completo en Firestore
   */
  private async ensureUserDocumentExists(): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return;

    console.log('Verificando documento de usuario para:', currentUser.email);

    try {
      const userDocRef = doc(this.firestore, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.log('Documento no existe, creando documento completo...');
        await this.createCompleteUserDocument(currentUser);
      } else {
        const existingData = userDoc.data();
        console.log('Documento existe, verificando completitud:', existingData);

        // Verificar si el documento tiene todos los campos requeridos
        if (!existingData?.['userType'] || !existingData?.['email']) {
          console.log('Documento incompleto, actualizando con campos faltantes...');
          await this.updateIncompleteUserDocument(currentUser, existingData);
        } else {
          console.log('Documento de usuario está completo');
        }
      }
    } catch (error) {
      console.error('Error verificando/creando documento de usuario:', error);
    }
  }

  /**
   * Crea un documento completo del usuario
   */
  private async createCompleteUserDocument(firebaseUser: any, userType: 'buyer' | 'superadmin' = 'buyer'): Promise<void> {
    const userData: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || '',
      userType: userType, // Usar el tipo proporcionado o por defecto
      isVerified: firebaseUser.emailVerified || false,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    await setDoc(doc(this.firestore, 'users', firebaseUser.uid), userData);
    console.log('Documento completo de usuario creado exitosamente con tipo:', userType);
  }

  /**
   * Actualiza un documento incompleto del usuario
   */
  private async updateIncompleteUserDocument(firebaseUser: any, existingData: any): Promise<void> {
    const updateData: Partial<User> = {
      // Mantener datos existentes y agregar campos faltantes
      ...existingData,
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || existingData['displayName'] || '',
      photoURL: firebaseUser.photoURL || existingData['photoURL'] || '',
      userType: existingData['userType'] || 'buyer', // Usar existente o por defecto
      isVerified: firebaseUser.emailVerified || false,
      lastLogin: new Date()
    };

    // Si no tiene createdAt, agregarlo
    if (!existingData['createdAt']) {
      updateData.createdAt = new Date();
    }

    await setDoc(doc(this.firestore, 'users', firebaseUser.uid), updateData, { merge: true });
    console.log('Documento de usuario actualizado exitosamente');
  }

  /**
   * Redirige al usuario a su dashboard basado en su rol (método legacy)
   * Ahora se usa el componente AutoRedirect
   */
  private redirectToUserDashboard(): void {
    console.log('🔄 Usando componente AutoRedirect para redirección');
    // El componente AutoRedirect maneja la redirección
  }

  /**
   * Obtiene la ruta basada en el rol del usuario
   */
  private getRoleBasedPath(userType: string): string {
    switch (userType) {
      case 'superadmin':
        console.log('👨‍💼 Redirigiendo a dashboard de administrador');
        return '/admin/dashboard';
      case 'buyer':
        console.log('🛒 Redirigiendo al marketplace para compradores');
        return '/marketplace';
      default:
        console.log('🏪 Redirigiendo a marketplace por defecto');
        return '/marketplace';
    }
  }

  /**
   * Actualiza el último login del usuario
   */
  private updateLastLogin(uid: string): void {
    const userDocRef = doc(this.firestore, 'users', uid);
    from(setDoc(userDocRef, {
      lastLogin: new Date()
    }, { merge: true })).pipe(
      catchError(error => {
        console.error('Error actualizando último login:', error);
        return of(null);
      })
    ).subscribe();
  }

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

  registerWithUserData(email: string, password: string, userData: { displayName?: string; phone?: string; userType?: string }): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(({ user }) => {
        // Create user document in Firestore with additional data
        const userDoc: User = {
          uid: user.uid,
          email: user.email!,
          displayName: userData.displayName || '',
          phone: userData.phone || '',
          userType: (userData.userType as 'buyer' | 'superadmin') || 'buyer',
          createdAt: new Date(),
          lastLogin: new Date()
        };

        // Update Firebase Auth profile if displayName is provided, then create Firestore document
        if (userData.displayName) {
          return from(updateProfile(user, { displayName: userData.displayName })).pipe(
            switchMap(() => from(setDoc(doc(this.firestore, 'users', user.uid), userDoc)))
          );
        } else {
          return from(setDoc(doc(this.firestore, 'users', user.uid), userDoc));
        }
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

  loginWithGoogle(): Observable<any> {
    const provider = new GoogleAuthProvider();
    // Configurar scopes adicionales
    provider.addScope('profile');
    provider.addScope('email');

    return from(signInWithPopup(this.auth, provider)).pipe(
      switchMap(({ user }) => {
        console.log('Google sign-in successful for user:', user.email);

        // Verificar si el usuario ya existe en Firestore
        return this.getUserFromFirestore(user.uid).pipe(
          map(existingUser => {
            if (existingUser) {
              console.log('Usuario existente encontrado en Firestore');
              // Usuario existente - onAuthStateChanged manejará la redirección
              return { isNewUser: false, user, userData: existingUser };
            } else {
              console.log('Nuevo usuario, requiere selección de rol');
              // Nuevo usuario - mostrar modal de selección de rol
              return { isNewUser: true, user };
            }
          })
        );
      }),
      catchError(error => {
        console.error('Firebase Google sign-in error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create user document in Firestore with selected role
   */
  createUserWithRole(firebaseUser: any, userType: 'buyer' | 'superadmin'): Observable<void> {
    console.log('Creando documento de usuario con rol:', userType, 'para:', firebaseUser.email);

    const userDoc: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || '',
      userType: userType,
      isVerified: firebaseUser.emailVerified || false,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    return from(setDoc(doc(this.firestore, 'users', firebaseUser.uid), userDoc)).pipe(
      map(() => {
        console.log('Documento de usuario creado exitosamente');
        return;
      }),
      catchError(error => {
        console.error('Error creando documento de usuario:', error);
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
    console.log('Buscando documento de usuario en Firestore para UID:', uid);

    return from(getDoc(doc(this.firestore, 'users', uid))).pipe(
      switchMap(docSnapshot => {
        console.log('Documento existe:', docSnapshot.exists());
        if (docSnapshot.exists()) {
          const rawData = docSnapshot.data();
          console.log('Datos crudos del documento:', rawData);

          // Verificar si tiene los campos requeridos
          if (!rawData || !rawData['userType'] || !rawData['email']) {
            console.log('Documento incompleto, reparando automáticamente...');

            // Reparar documento automáticamente
            return this.repairDocumentAndReturn(uid, rawData);
          }

          const userData = rawData as User;
          console.log('Datos del usuario válidos:', userData);
          return of(userData);
        } else {
          console.log('No se encontró documento para el usuario:', uid);
          return of(null);
        }
      }),
      catchError(error => {
        console.error('Error getting user from Firestore:', error);
        return of(null);
      })
    );
  }

  /**
   * Repara un documento incompleto y retorna los datos completos
   */
  private repairDocumentAndReturn(uid: string, existingData: any): Observable<User | null> {
    const currentUser = this.auth.currentUser;
    if (!currentUser || currentUser.uid !== uid) {
      console.log('No se puede reparar: usuario no coincide');
      return of(null);
    }

    console.log('Reparando documento incompleto para:', currentUser.email);
    console.log('Datos existentes a reparar:', existingData);

    // Determinar el tipo de usuario apropiado
    let userType: 'buyer' | 'superadmin' = 'buyer';
    
    // Si ya existe un userType válido, mantenerlo
    if (existingData?.['userType'] && ['buyer', 'superadmin'].includes(existingData['userType'])) {
      userType = existingData['userType'];
    } else {
      // Lista de emails que deberían ser superadmin por defecto (temporal)
      const superadminEmails = [
        'chcardenasto@uide.edu.ec',
        'admin@agriconnect.com',
        'administrador@agriconnect.com'
      ];
      
      if (currentUser.email && superadminEmails.includes(currentUser.email.toLowerCase())) {
        userType = 'superadmin';
        console.log('🔧 Usuario identificado como superadmin por email:', currentUser.email);
      }
    }

    const completeUserData: User = {
      uid: currentUser.uid,
      email: currentUser.email!,
      displayName: currentUser.displayName || existingData?.['displayName'] || '',
      photoURL: currentUser.photoURL || existingData?.['photoURL'] || '',
      userType: userType,
      isVerified: currentUser.emailVerified || false,
      createdAt: existingData?.['createdAt'] || new Date(),
      lastLogin: new Date()
    };

    console.log('Datos completos a guardar:', completeUserData);

    // Guardar documento reparado
    return from(setDoc(doc(this.firestore, 'users', uid), completeUserData, { merge: true })).pipe(
      map(() => {
        console.log('✅ Documento reparado exitosamente y retornando:', completeUserData);
        return completeUserData;
      }),
      catchError(error => {
        console.error('❌ Error reparando documento:', error);
        return of(null);
      })
    );
  }

  /**
   * Actualiza manualmente el tipo de usuario (útil para correcciones)
   */
  updateUserType(uid: string, userType: 'buyer' | 'superadmin'): Observable<void> {
    console.log('🔧 Actualizando tipo de usuario manualmente:', uid, 'a', userType);
    
    return from(setDoc(doc(this.firestore, 'users', uid), { 
      userType: userType,
      lastLogin: new Date()
    }, { merge: true })).pipe(
      map(() => {
        console.log('✅ Tipo de usuario actualizado exitosamente');
        // Forzar actualización del observable
        if (this.auth.currentUser?.uid === uid) {
          this.authStateSubject.next(this.auth.currentUser);
        }
      }),
      catchError(error => {
        console.error('❌ Error actualizando tipo de usuario:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica si el usuario actual tiene un rol específico
   */
  hasRole(role: 'buyer' | 'superadmin'): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user?.userType === role)
    );
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getUserRole(): Observable<'buyer' | 'superadmin' | null> {
    return this.currentUser$.pipe(
      map(user => {
        console.log('getUserRole - usuario actual:', user);
        return user?.userType || null;
      })
    );
  }

  /**
   * Método público para forzar redirección basada en rol
   */
  public async forceRedirectToUserDashboard(): Promise<void> {
    console.log('Forzando redirección manual...');
    await this.ensureUserDocumentExists();
    this.redirectToUserDashboard();
  }

  /**
   * Método público para verificar y crear documento de usuario si es necesario
   */
  public async checkAndCreateUserDocument(): Promise<void> {
    await this.ensureUserDocumentExists();
  }

  /**
   * Método público para reparar el documento del usuario actual
   */
  public async repairCurrentUserDocument(): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      console.log('No hay usuario autenticado para reparar');
      return;
    }

    console.log('Reparando documento del usuario:', currentUser.email);

    try {
      // Forzar actualización del documento
      await this.createCompleteUserDocument(currentUser);
      console.log('Documento reparado exitosamente');

      // Forzar actualización del observable
      this.authStateSubject.next(currentUser);
    } catch (error) {
      console.error('Error reparando documento:', error);
    }
  }

  /**
   * Método de debugging para verificar el estado actual
   */
  debugCurrentUser(): void {
    console.log('=== DEBUG AUTH STATE ===');
    this.authState$.pipe(take(1)).subscribe(authUser => {
      console.log('Firebase Auth User:', authUser?.email);
      console.log('Firebase Auth UID:', authUser?.uid);
    });

    this.currentUser$.pipe(take(1)).subscribe(user => {
      console.log('Current User from Firestore:', user);
    });

    // También verificar directamente en Firestore
    if (this.auth.currentUser) {
      this.getUserFromFirestore(this.auth.currentUser.uid).pipe(take(1)).subscribe(user => {
        console.log('Direct Firestore query result:', user);
      });
    }
    console.log('========================');
  }

  /**
   * Método para verificar manualmente el documento en Firestore
   */
  public async checkFirestoreDocument(): Promise<void> {
    if (!this.auth.currentUser) {
      console.log('No hay usuario autenticado');
      return;
    }

    const uid = this.auth.currentUser.uid;
    console.log('Verificando documento para UID:', uid);

    try {
      const docRef = doc(this.firestore, 'users', uid);
      const docSnap = await getDoc(docRef);

      console.log('Documento existe:', docSnap.exists());
      if (docSnap.exists()) {
        console.log('Datos del documento:', docSnap.data());
      } else {
        console.log('El documento no existe en Firestore');
      }
    } catch (error) {
      console.error('Error verificando documento:', error);
    }
  }

  /**
   * Método síncrono para obtener el usuario actual (para compatibilidad)
   */
  getCurrentUser(): User | null {
    let currentUser: User | null = null;
    this.currentUser$.pipe(take(1)).subscribe(user => {
      currentUser = user;
    });
    return currentUser;
  }
}

