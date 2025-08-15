import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { AdminHeaderComponent } from '../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminHeaderComponent],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class Users implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  // Signals para el estado
  readonly users = signal<User[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly showModal = signal<boolean>(false);
  readonly editingUser = signal<User | null>(null);
  readonly searchTerm = signal<string>('');

  // Formulario
  userForm: FormGroup;

  // Opciones de filtro
  readonly userTypeOptions = [
    { value: 'all', label: 'Todos los usuarios' },
    { value: 'buyer', label: 'Compradores' },
    { value: 'superadmin', label: 'Administradores' }
  ];

  readonly selectedFilter = signal<string>('all');

  constructor() {
    this.userForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      userType: ['buyer', [Validators.required]],
      phone: [''],
      isVerified: [false]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Cargar lista de usuarios
   */
  private async loadUsers(): Promise<void> {
    this.isLoading.set(true);
    try {
      // TODO: Implementar servicio para obtener usuarios
      // const users = await this.authService.getAllUsers();
      // this.users.set(users);
      
      // Datos de ejemplo mientras se implementa el servicio
      const mockUsers: User[] = [
        {
          uid: '1',
          email: 'admin@agriconnect.com',
          displayName: 'Administrador Principal',
          userType: 'superadmin',
          isVerified: true,
          createdAt: new Date('2024-01-15'),
          lastLogin: new Date()
        },
        {
          uid: '2',
          email: 'comprador1@example.com',
          displayName: 'María González',
          userType: 'buyer',
          phone: '0991234567',
          isVerified: true,
          createdAt: new Date('2024-02-10'),
          lastLogin: new Date()
        },
        {
          uid: '3',
          email: 'comprador2@example.com',
          displayName: 'Juan Pérez',
          userType: 'buyer',
          phone: '0987654321',
          isVerified: false,
          createdAt: new Date('2024-03-05'),
          lastLogin: new Date()
        }
      ];
      this.users.set(mockUsers);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Usuarios filtrados
   */
  get filteredUsers(): User[] {
    let filtered = this.users();
    
    // Filtrar por tipo de usuario
    if (this.selectedFilter() !== 'all') {
      filtered = filtered.filter(user => user.userType === this.selectedFilter());
    }
    
    // Filtrar por término de búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.phone?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }

  /**
   * Abrir modal para crear usuario
   */
  openCreateModal(): void {
    this.editingUser.set(null);
    this.userForm.reset({
      userType: 'buyer',
      isVerified: false
    });
    this.showModal.set(true);
  }

  /**
   * Abrir modal para editar usuario
   */
  openEditModal(user: User): void {
    this.editingUser.set(user);
    this.userForm.patchValue({
      displayName: user.displayName,
      email: user.email,
      userType: user.userType,
      phone: user.phone || '',
      isVerified: user.isVerified
    });
    this.showModal.set(true);
  }

  /**
   * Cerrar modal
   */
  closeModal(): void {
    this.showModal.set(false);
    this.editingUser.set(null);
    this.userForm.reset();
  }

  /**
   * Guardar usuario
   */
  async saveUser(): Promise<void> {
    if (this.userForm.invalid) return;

    this.isLoading.set(true);
    try {
      const formData = this.userForm.value;
      
      if (this.editingUser()) {
        // Actualizar usuario existente
        console.log('Actualizando usuario:', formData);
        // TODO: Implementar actualización
      } else {
        // Crear nuevo usuario
        console.log('Creando usuario:', formData);
        // TODO: Implementar creación
      }
      
      this.closeModal();
      await this.loadUsers();
    } catch (error) {
      console.error('Error guardando usuario:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Eliminar usuario
   */
  async deleteUser(user: User): Promise<void> {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${user.displayName}?`)) {
      return;
    }

    this.isLoading.set(true);
    try {
      console.log('Eliminando usuario:', user.uid);
      // TODO: Implementar eliminación
      await this.loadUsers();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Cambiar verificación de usuario
   */
  async toggleUserVerification(user: User): Promise<void> {
    this.isLoading.set(true);
    try {
      console.log('Cambiando verificación de usuario:', user.uid);
      // TODO: Implementar cambio de verificación
      await this.loadUsers();
    } catch (error) {
      console.error('Error cambiando verificación:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Actualizar filtro
   */
  updateFilter(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedFilter.set(target.value);
  }

  /**
   * Actualizar término de búsqueda
   */
  updateSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  /**
   * Obtener badge de tipo de usuario
   */
  getUserTypeBadge(userType: string): { class: string; label: string } {
    switch (userType) {
      case 'superadmin':
        return { class: 'bg-purple-100 text-purple-800', label: 'Administrador' };
      case 'buyer':
        return { class: 'bg-blue-100 text-blue-800', label: 'Comprador' };
      default:
        return { class: 'bg-gray-100 text-gray-800', label: 'Usuario' };
    }
  }

  /**
   * Formatear fecha
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Obtener total de usuarios
   */
  get totalUsers(): number {
    return this.users().length;
  }

  /**
   * Obtener usuarios verificados
   */
  get verifiedUsers(): number {
    return this.users().filter(u => u.isVerified).length;
  }

  /**
   * Obtener total de administradores
   */
  get totalAdmins(): number {
    return this.users().filter(u => u.userType === 'superadmin').length;
  }
}
