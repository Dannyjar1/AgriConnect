import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../core/models/user.model';
import { Product } from '../../core/models/product.model';

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
    ReactiveFormsModule
  ],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // Señales reactivas para el estado del componente
  readonly isLoading = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
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

  private loadUserProfile(): void {
    this.isLoading.set(true);
    
    // Simulación de carga de datos del usuario
    setTimeout(() => {
      const mockUser: User = {
        uid: 'user123',
        email: 'usuario@agriconnect.com',
        displayName: 'María García López',
        photoURL: '',
        userType: 'producer',
        phone: '+593 99 123 4567',
        address: 'Av. Principal 123, Quito, Pichincha',
        isVerified: true,
        preferences: {
          notifications: true,
          language: 'es',
          currency: 'USD'
        },
        createdAt: new Date(),
        lastLogin: new Date()
      };

      this.currentUser.set(mockUser);
      this.populateForm(mockUser);
      this.isLoading.set(false);
    }, 1000);
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
    if (input.files && input.files[0]) {
      // Simulación de subida de avatar
      console.log('Subiendo avatar:', input.files[0].name);
    }
  }

  navigateToProductManagement(): void {
    this.router.navigate(['/producer/products']);
  }

  navigateToOrderHistory(): void {
    this.router.navigate(['/buyer/orders']);
  }

  /**
   * Navigate back to marketplace
   */
  navigateToMarketplace(): void {
    this.router.navigate(['/marketplace']);
  }
}