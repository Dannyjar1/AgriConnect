import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProducerService } from '../../../core/services/producer.service';
import { Producer } from '../../../core/models/user.model';
import { RegisterProducerModal } from '../../../shared/components/register-producer-modal/register-producer-modal';

@Component({
  selector: 'app-producers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RegisterProducerModal],
  templateUrl: './producers.html',
  styleUrl: './producers.scss'
})
export class Producers implements OnInit {
  private producerService = inject(ProducerService);
  private fb = inject(FormBuilder);

  // Signals para el estado
  readonly producers = signal<Producer[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly showModal = signal<boolean>(false);
  readonly editingProducer = signal<Producer | null>(null);
  readonly searchTerm = signal<string>('');

  // Filtros
  readonly statusOptions = [
    { value: 'all', label: 'Todos los productores' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' }
  ];

  readonly selectedStatus = signal<string>('all');

  ngOnInit(): void {
    this.loadProducers();
  }

  /**
   * Cargar lista de productores
   */
  private async loadProducers(): Promise<void> {
    this.isLoading.set(true);
    try {
      const producers$ = this.producerService.getProducers();
      const producers = await producers$.toPromise();
      this.producers.set(producers || []);
    } catch (error) {
      console.error('Error cargando productores:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Productores filtrados
   */
  get filteredProducers(): Producer[] {
    let filtered = this.producers();

    // Filtrar por estado
    if (this.selectedStatus() !== 'all') {
      const isActive = this.selectedStatus() === 'active';
      filtered = filtered.filter(producer => producer.isActive === isActive);
    }

    // Filtrar por término de búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(producer =>
        producer.name.toLowerCase().includes(search) ||
        producer.email?.toLowerCase().includes(search) ||
        producer.phone?.toLowerCase().includes(search) ||
        producer.address.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  /**
   * Abrir modal para crear productor
   */
  openCreateModal(): void {
    this.editingProducer.set(null);
    this.showModal.set(true);
  }

  /**
   * Abrir modal para editar productor
   */
  openEditModal(producer: Producer): void {
    this.editingProducer.set(producer);
    this.showModal.set(true);
  }

  /**
   * Cerrar modal
   */
  closeModal(): void {
    this.showModal.set(false);
    this.editingProducer.set(null);
  }

  /**
   * Manejar registro de productor
   */
  async onProducerRegistered(producer: Producer): Promise<void> {
    this.closeModal();
    await this.loadProducers();
  }

  /**
   * Alternar estado del productor
   */
  async toggleProducerStatus(producer: Producer): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.producerService.updateProducer(producer.id, {
        ...producer,
        isActive: !producer.isActive
      });
      await this.loadProducers();
    } catch (error) {
      console.error('Error actualizando estado del productor:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Eliminar productor
   */
  async deleteProducer(producer: Producer): Promise<void> {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${producer.name}?`)) {
      return;
    }

    this.isLoading.set(true);
    try {
      await this.producerService.deleteProducer(producer.id);
      await this.loadProducers();
    } catch (error) {
      console.error('Error eliminando productor:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Actualizar filtro de estado
   */
  updateStatusFilter(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus.set(target.value);
  }

  /**
   * Actualizar término de búsqueda
   */
  updateSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  /**
   * Formatear fecha
   */
  formatDate(date: any): string {
    // Manejar tanto Date como Firestore timestamp
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  }

  /**
   * Obtener estadísticas
   */
  get totalProducers(): number {
    return this.producers().length;
  }

  get activeProducers(): number {
    return this.producers().filter(p => p.isActive).length;
  }

  get inactiveProducers(): number {
    return this.producers().filter(p => !p.isActive).length;
  }
}