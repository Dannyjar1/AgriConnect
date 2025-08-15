import { Component, signal, computed, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../core/models/user.model';
import { Product } from '../../core/models/product.model';
import { SharedHeaderComponent } from '../../shared/components/shared-header/shared-header.component';
import { AuthService } from '../../core/services/auth.service';
import { OrderService, OrderStatus } from '../../core/services/order';
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
  private readonly orderService = inject(OrderService);
  private readonly firestore = inject(Firestore);
  private readonly destroy$ = new Subject<void>();

  // Señales reactivas para el estado del componente
  readonly isLoading = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly isUploadingAvatar = signal<boolean>(false);
  readonly currentUser = signal<User | null>(null);
  readonly userProducts = signal<Product[]>([]);
  readonly userOrders = signal<OrderStatus[]>([]);
  readonly isLoadingOrders = signal<boolean>(false);
  readonly selectedOrder = signal<OrderStatus | null>(null);
  readonly isOrderDetailsOpen = signal<boolean>(false);
  readonly isLoadingOrderDetails = signal<boolean>(false);
  readonly profileStats = signal<ProfileStats>({
    productsListed: 0,
    totalSales: 0,
    purchasesMade: 0,
    averageRating: 0
  });

  // Control de pestañas - dinámico según rol
  readonly activeTab = signal<string>('personal');
  readonly profileTabs = computed<ProfileTab[]>(() => {
    const user = this.currentUser();
    if (!user) return [];

    const baseTabs = [
      { id: 'personal', label: 'Información Personal', icon: 'person', active: this.activeTab() === 'personal' }
    ];

    if (user.userType === 'superadmin') {
      return [
        ...baseTabs,
        { id: 'admin', label: 'Panel Administrativo', icon: 'admin_panel_settings', active: this.activeTab() === 'admin' },
        { id: 'producers', label: 'Gestión de Productores', icon: 'group', active: this.activeTab() === 'producers' },
        { id: 'inventory', label: 'Gestión de Inventario', icon: 'inventory', active: this.activeTab() === 'inventory' },
        { id: 'settings', label: 'Configuración', icon: 'settings', active: this.activeTab() === 'settings' }
      ];
    } else {
      // buyer
      return [
        ...baseTabs,
        { id: 'purchases', label: 'Historial de Compras', icon: 'shopping_bag', active: this.activeTab() === 'purchases' },
        { id: 'favorites', label: 'Favoritos', icon: 'favorite', active: this.activeTab() === 'favorites' },
        { id: 'settings', label: 'Configuración', icon: 'settings', active: this.activeTab() === 'settings' }
      ];
    }
  });

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
      case 'superadmin': return 'Administrador (Bodegero)';
      case 'buyer': return 'Comprador';
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
    this.loadUserOrders();
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
                isVerified: firebaseUser.emailVerified || false,
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
            userData.isVerified = firebaseUser.emailVerified || false;
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
              isVerified: firebaseUser.emailVerified || false,
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
    // Update stats based on actual user orders
    const orders = this.userOrders();
    const purchasesMade = orders.length;
    const totalSpent = orders.reduce((sum, order) => {
      // Extract total from order ID for simulation (in production, this would be stored)
      return sum + 45.50; // Average order value for demonstration
    }, 0);

    const stats: ProfileStats = {
      productsListed: 12, // Mock data - would come from user's listed products
      totalSales: 1850, // Mock data - would come from user's sales if they're a producer
      purchasesMade: purchasesMade,
      averageRating: 4.8 // Mock data - would come from user's reviews
    };

    this.profileStats.set(stats);
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

  navigateToAdminDashboard(): void {
    const user = this.currentUser();
    if (user?.userType === 'superadmin') {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  navigateToOrderHistory(): void {
    const user = this.currentUser();
    if (user?.userType === 'buyer') {
      this.router.navigate(['/buyer/orders']);
    } else if (user?.userType === 'superadmin') {
      this.router.navigate(['/admin/orders']);
    }
  }

  navigateToFavorites(): void {
    const user = this.currentUser();
    if (user?.userType === 'buyer') {
      this.router.navigate(['/buyer/favorites']);
    }
  }

  navigateToProducerManagement(): void {
    const user = this.currentUser();
    if (user?.userType === 'superadmin') {
      this.router.navigate(['/admin/producers']);
    }
  }

  navigateToProductManagement(): void {
    const user = this.currentUser();
    if (user?.userType === 'superadmin') {
      this.router.navigate(['/admin/products']);
    } else if (user?.userType === 'buyer') {
      this.router.navigate(['/marketplace']);
    }
  }

  navigateToInventoryManagement(): void {
    const user = this.currentUser();
    if (user?.userType === 'superadmin') {
      this.router.navigate(['/admin/inventory']);
    }
  }

  /**
   * Load user's order history
   */
  private loadUserOrders(): void {
    this.isLoadingOrders.set(true);
    
    this.orderService.getUserOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          console.log('Loaded user orders:', orders);
          this.userOrders.set(orders);
          this.loadUserStats(); // Update stats after loading orders
          this.isLoadingOrders.set(false);
        },
        error: (error) => {
          console.error('Error loading user orders:', error);
          this.userOrders.set([]);
          this.isLoadingOrders.set(false);
        }
      });
  }

  /**
   * Get status badge class for order status
   */
  getStatusBadgeClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-yellow-100 text-yellow-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'pending': 'bg-gray-100 text-gray-800'
    };
    
    return statusClasses[status] || statusClasses['pending'];
  }

  /**
   * Get status icon for order status
   */
  getStatusIcon(status: string): string {
    const statusIcons: Record<string, string> = {
      'confirmed': 'check_circle',
      'preparing': 'schedule',
      'shipped': 'local_shipping',
      'delivered': 'done_all',
      'cancelled': 'cancel',
      'pending': 'hourglass_empty'
    };
    
    return statusIcons[status] || statusIcons['pending'];
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'No disponible';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Track order (navigate to tracking page)
   */
  trackOrder(orderId: string): void {
    this.orderService.navigateToOrderTracking(orderId);
  }

  /**
   * Navigate to shopping cart
   */
  navigateToShopping(): void {
    this.router.navigate(['/carrito']);
  }

  /**
   * Show order details modal
   */
  showOrderDetails(orderId: string): void {
    this.isLoadingOrderDetails.set(true);
    this.isOrderDetailsOpen.set(true);

    this.orderService.getOrderDetails(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          if (order) {
            this.selectedOrder.set(order);
            console.log('📦 Order details loaded:', order);
          } else {
            console.warn('❌ Order not found:', orderId);
            this.closeOrderDetails();
          }
          this.isLoadingOrderDetails.set(false);
        },
        error: (error) => {
          console.error('Error loading order details:', error);
          this.isLoadingOrderDetails.set(false);
          this.closeOrderDetails();
        }
      });
  }

  /**
   * Close order details modal
   */
  closeOrderDetails(): void {
    this.isOrderDetailsOpen.set(false);
    this.selectedOrder.set(null);
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