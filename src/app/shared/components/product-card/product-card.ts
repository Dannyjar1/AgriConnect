import { Component, Input, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, DecimalPipe, CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block',
    'role': 'article',
    '[attr.aria-label]': 'productAriaLabel()'
  }
})
export class ProductCard {
  // Angular 20 signal-based input property
  @Input() product!: Product;

  // URL de una imagen por defecto si el producto no tiene imágenes
  readonly defaultImageUrl = 'assets/images/placeholder.png';
  
  // URL de la imagen multifrutas para uso programático si es necesario
  readonly multifruitasImageUrl = 'assets/images/multifrutas.webp';

  // Signal-based computed properties for enhanced reactivity
  productAriaLabel = computed(() => {
    if (!this.product) return '';
    
    const name = this.product.name || 'Producto sin nombre';
    const price = this.product.price?.perUnit || 0;
    const location = this.getLocationString();
    
    return `${name}, precio ${price} USD${location ? `, ubicado en ${location}` : ''}`;
  });

  // Helper method para obtener la ubicación como string
  private getLocationString(): string {
    const coords = this.product?.traceability?.coordinates;
    if (!coords?.latitude || !coords?.longitude) return '';
    
    return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
  }

  // Signal para manejar el estado de hover (opcional para funcionalidades futuras)
  isHovered = signal(false);

  // Computed para clases dinámicas (extensible para futuras funcionalidades)
  cardClasses = computed(() => ({
    'hovered': this.isHovered(),
    'has-location': !!this.product?.traceability?.coordinates,
    'has-image': !!(this.product?.images && this.product.images.length > 0)
  }));

  // Método para manejar errores de carga de imagen
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = this.defaultImageUrl;
    }
  }

  // Método para manejar eventos de hover (para funcionalidades futuras)
  onHover(isHovering: boolean): void {
    this.isHovered.set(isHovering);
  }
}