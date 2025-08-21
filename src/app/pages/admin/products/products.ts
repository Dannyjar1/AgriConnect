import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { ProducerService } from '../../../core/services/producer.service';
import { Product } from '../../../core/models/product.model';
import { Producer } from '../../../core/models/user.model';
import { RegisterProductModal } from '../../../shared/components/register-product-modal/register-product-modal';
import { AdminHeaderComponent } from '../../../shared/components/admin-header/admin-header.component';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RegisterProductModal, AdminHeaderComponent],
    templateUrl: './products.html',
    styleUrl: './products.scss'
})
export class Products implements OnInit {
    private productService = inject(ProductService);
    private producerService = inject(ProducerService);

    // Signals para el estado
    readonly products = signal<Product[]>([]);
    readonly producers = signal<Producer[]>([]);
    readonly isLoading = signal<boolean>(false);
    readonly showModal = signal<boolean>(false);
    readonly editingProduct = signal<Product | null>(null);
    readonly searchTerm = signal<string>('');

    // Filtros
    readonly categoryOptions = [
        { value: 'all', label: 'Todas las categorías' },
        { value: 'frutas', label: 'Frutas' },
        { value: 'verduras', label: 'Verduras' },
        { value: 'hortalizas', label: 'Hortalizas' },
        { value: 'granos', label: 'Granos' },
        { value: 'lacteos', label: 'Lácteos' },
        { value: 'otros', label: 'Otros' }
    ];

    readonly statusOptions = [
        { value: 'all', label: 'Todos los productos' },
        { value: 'active', label: 'Activos' },
        { value: 'inactive', label: 'Inactivos' }
    ];

    readonly selectedCategory = signal<string>('all');
    readonly selectedStatus = signal<string>('all');

    ngOnInit(): void {
        this.loadData();
    }

    /**
     * Cargar datos iniciales
     */
    private async loadData(): Promise<void> {
        await Promise.all([
            this.loadProducts(),
            this.loadProducers()
        ]);
    }

    /**
     * Cargar lista de productos
     */
    private async loadProducts(): Promise<void> {
        this.isLoading.set(true);
        try {
            const products$ = this.productService.getProducts();
            const products = await firstValueFrom(products$);
            this.products.set(products || []);
        } catch (error) {
            console.error('Error cargando productos:', error);
        } finally {
            this.isLoading.set(false);
        }
    }

    /**
     * Cargar lista de productores
     */
    private async loadProducers(): Promise<void> {
        try {
            const producers$ = this.producerService.getProducers();
            const producers = await firstValueFrom(producers$);
            this.producers.set(producers || []);
        } catch (error) {
            console.error('Error cargando productores:', error);
        }
    }

    /**
     * Productos filtrados
     */
    get filteredProducts(): Product[] {
        let filtered = this.products();

        // Filtrar por categoría
        if (this.selectedCategory() !== 'all') {
            filtered = filtered.filter(product => product.category === this.selectedCategory());
        }

        // Filtrar por estado
        if (this.selectedStatus() !== 'all') {
            const isActive = this.selectedStatus() === 'active';
            filtered = filtered.filter(product => product.isActive === isActive);
        }

        // Filtrar por término de búsqueda
        const search = this.searchTerm().toLowerCase();
        if (search) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(search) ||
                product.description?.toLowerCase().includes(search) ||
                product.category.toLowerCase().includes(search)
            );
        }

        return filtered;
    }

    /**
     * Abrir modal para crear producto
     */
    openCreateModal(): void {
        this.editingProduct.set(null);
        this.showModal.set(true);
    }

    /**
     * Abrir modal para editar producto
     */
    openEditModal(product: Product): void {
        this.editingProduct.set(product);
        this.showModal.set(true);
    }

    /**
     * Cerrar modal
     */
    closeModal(): void {
        this.showModal.set(false);
        this.editingProduct.set(null);
    }

    /**
     * Manejar registro de producto
     */
    async onProductRegistered(product: Product): Promise<void> {
        this.closeModal();
        await this.loadProducts();
    }

    /**
     * Alternar estado del producto
     */
    async toggleProductStatus(product: Product): Promise<void> {
        this.isLoading.set(true);
        try {
            await this.productService.updateProduct(product.id, {
                ...product,
                isActive: !product.isActive
            });
            await this.loadProducts();
        } catch (error) {
            console.error('Error actualizando estado del producto:', error);
        } finally {
            this.isLoading.set(false);
        }
    }

    /**
     * Eliminar producto
     */
    async deleteProduct(product: Product): Promise<void> {
        if (!confirm(`¿Estás seguro de que quieres eliminar ${product.name}?`)) {
            return;
        }

        this.isLoading.set(true);
        try {
            // TODO: Implementar método deleteProduct en ProductService
            console.log('Eliminando producto:', product.id);
            await this.loadProducts();
        } catch (error) {
            console.error('Error eliminando producto:', error);
        } finally {
            this.isLoading.set(false);
        }
    }

    /**
     * Obtener nombre del productor
     */
    getProducerName(producerId: string): string {
        const producer = this.producers().find(p => p.id === producerId);
        return producer?.name || 'Productor desconocido';
    }

    /**
     * Actualizar filtro de categoría
     */
    updateCategoryFilter(event: Event): void {
        const target = event.target as HTMLSelectElement;
        this.selectedCategory.set(target.value);
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
     * Formatear precio simple
     */
    formatPrice(price: number): string {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    /**
     * Formatear precio de producto con unidad
     */
    formatProductPrice(product: Product): string {
        const price = this.formatPrice(product.price.perUnit);
        return `${price}/${product.price.unit}`;
    }

    /**
     * Obtener estadísticas
     */
    get totalProducts(): number {
        return this.products().length;
    }

    get activeProducts(): number {
        return this.products().filter(p => p.isActive).length;
    }

    get inactiveProducts(): number {
        return this.products().filter(p => !p.isActive).length;
    }

    get averagePrice(): number {
        const products = this.products().filter(p => p.isActive);
        if (products.length === 0) return 0;
        const total = products.reduce((sum, p) => sum + p.price.perUnit, 0);
        return total / products.length;
    }
}