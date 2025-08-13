import { Component, signal, computed, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../core/models/user.model';
import { Product } from '../../core/models/product.model';
import { SharedHeaderComponent } from '../../shared/components/shared-header/shared-header.component';
import { AuthService } from '../../core/services/auth.service';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface ProfileStats {
  productsListed: number;
  totalSales: number;
  purchasesMade: number;
  averageRating: number;
}

interface ProfileTab {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedHeaderComponent
  ],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly firestore = inject(Firestore);
  private readonly destroy$ = new Subject<void>();

  // Señales reactivas para el estado del componente
  readonly isLoading = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly isUploadingAvatar = signal<boolean>(false);
  readonly currentUser = signal<User | null>(null);
  readonly userProducts = signal<Product[]>([]);
  readonly profileStats = signal<ProfileStats>({
    productsListed: 0,
    totalSales: 0,
    purchasesMade: 0,
    averageRating: 0
  });

  // Control de pestañas
  readonly activeTab = signal<string>('personal');
  readonly profileTabs = signal<ProfileTab[]>([
    { id: 'personal', label: 'Información Personal', icon: 'person', active: true },
    { id: 'products', label: 'Mis Productos', icon: 'inventory', active: false },
    { id: 'history', label: 'Historial de Compras', icon: 'history', active: false },
    { id: 'settings', label: 'Configuración', icon: 'settings', active: false }
  ]);

  // Formulario reactivo para información personal
  readonly profileForm: FormGroup = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^\+?[\d\s-()]+$/)]],
    address: [''],
    userType: ['', Validators.required]
  });

  // Formulario para preferencias
  readonly preferencesForm: FormGroup = this.fb.group({
    notifications: [true],
    language: ['es'],
    currency: ['USD']
  });

  // Computed values
  readonly userTypeDisplay = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    
    switch (user.userType) {
      case 'producer': return 'Productor';
      case 'buyer': return 'Comprador';
      case 'institutional': return 'Cliente Institucional';
      default: return 'Usuario';
    }
  });

  readonly profileCompleteness = computed(() => {
    const user = this.currentUser();
    if (!user) return 0;
    
    let completedFields = 0;
    const totalFields = 6;
    
    if (user.displayName) completedFields++;
    if (user.email) completedFields++;
    if (user.phone) completedFields++;
    if (user.address) completedFields++;
    if (user.photoURL) completedFields++;
    if (user.isVerified) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  });

  readonly formattedJoinDate = computed(() => {
    const user = this.currentUser();
    if (!user || !user.createdAt) return '';
    
    // Simular formato de fecha
    return 'Enero 2024';
  });

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadUserStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserProfile(): void {
    this.isLoading.set(true);
    
    // Obtener el usuario actual autenticado
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Obtener datos adicionales del usuario desde Firestore
            const userDocRef = doc(this.firestore, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            let userData: User;
            
            if (userDocSnap.exists()) {
              // Usuario existe en Firestore, usar esos datos
              userData = userDocSnap.data() as User;
            } else {
              // Usuario no existe en Firestore, crear perfil básico
              userData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
                userType: 'buyer', // Default
                phone: firebaseUser.phoneNumber || '',
                isVerified: firebaseUser.emailVerified,
                preferences: {
                  notifications: true,
                  language: 'es',
                  currency: 'USD'
                },
                createdAt: new Date(),
                lastLogin: new Date()
              };
            }
            
            // Actualizar con datos más recientes de Firebase Auth
            userData.displayName = firebaseUser.displayName || userData.displayName;
            userData.photoURL = firebaseUser.photoURL || userData.photoURL;
            userData.isVerified = firebaseUser.emailVerified;
            userData.lastLogin = new Date();
            
            this.currentUser.set(userData);
            this.populateForm(userData);
            
          } catch (error) {
            console.error('Error loading user profile:', error);
            // Fallback a datos básicos de Firebase Auth
            const basicUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              userType: 'buyer',
              isVerified: firebaseUser.emailVerified,
              preferences: {
                notifications: true,
                language: 'es',
                currency: 'USD'
              },
              createdAt: new Date(),
              lastLogin: new Date()
            };
            
            this.currentUser.set(basicUser);
            this.populateForm(basicUser);
          }
        } else {
          // Usuario no autenticado, redirigir al login
          this.router.navigate(['/auth/login']);
        }
        
        this.isLoading.set(false);
      });
  }

  private loadUserStats(): void {
    // Simulación de estadísticas del usuario
    const mockStats: ProfileStats = {
      productsListed: 12,
      totalSales: 1850,
      purchasesMade: 23,
      averageRating: 4.8
    };

    this.profileStats.set(mockStats);
  }

  private populateForm(user: User): void {
    this.profileForm.patchValue({
      displayName: user.displayName || '',
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      userType: user.userType
    });

    this.preferencesForm.patchValue({
      notifications: user.preferences?.notifications ?? true,
      language: user.preferences?.language ?? 'es',
      currency: user.preferences?.currency ?? 'USD'
    });
  }

  onTabSelect(tabId: string): void {
    this.activeTab.set(tabId);
    
    // Actualizar estado activo de las pestañas
    const updatedTabs = this.profileTabs().map(tab => ({
      ...tab,
      active: tab.id === tabId
    }));
    this.profileTabs.set(updatedTabs);
  }

  onEditProfile(): void {
    this.isEditing.set(true);
  }

  onCancelEdit(): void {
    this.isEditing.set(false);
    const user = this.currentUser();
    if (user) {
      this.populateForm(user);
    }
  }

  onSaveProfile(): void {
    if (this.profileForm.valid) {
      this.isLoading.set(true);
      
      // Simulación de guardado
      setTimeout(() => {
        const formValue = this.profileForm.value;
        const currentUser = this.currentUser();
        
        if (currentUser) {
          const updatedUser: User = {
            ...currentUser,
            displayName: formValue.displayName,
            phone: formValue.phone,
            address: formValue.address,
            userType: formValue.userType
          };
          
          this.currentUser.set(updatedUser);
        }
        
        this.isEditing.set(false);
        this.isLoading.set(false);
      }, 1500);
    }
  }

  onSavePreferences(): void {
    if (this.preferencesForm.valid) {
      this.isLoading.set(true);
      
      setTimeout(() => {
        const prefsValue = this.preferencesForm.value;
        const currentUser = this.currentUser();
        
        if (currentUser) {
          const updatedUser: User = {
            ...currentUser,
            preferences: {
              notifications: prefsValue.notifications,
              language: prefsValue.language,
              currency: prefsValue.currency
            }
          };
          
          this.currentUser.set(updatedUser);
        }
        
        this.isLoading.set(false);
      }, 1000);
    }
  }

  onAvatarUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido.');
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. El tamaño máximo es 5MB.');
      return;
    }
    
    // Por ahora solo mostrar el archivo seleccionado
    console.log('Archivo seleccionado para avatar:', file.name);
    alert('Funcionalidad de subida de avatar será implementada próximamente.');
    
    // Limpiar input
    input.value = '';
  }

  navigateToProductManagement(): void {
    this.router.navigate(['/producer/products']);
  }

  navigateToOrderHistory(): void {
    this.router.navigate(['/buyer/orders']);
  }

  /**
   * Handle logout functionality
   */
  async onLogout(): Promise<void> {
    try {
      this.isLoading.set(true);
      await this.authService.logout().toPromise();
      
      // Navigate to home page
      this.router.navigate(['/']);
      
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, redirect to home
      this.router.navigate(['/']);
    } finally {
      this.isLoading.set(false);
    }
  }

}