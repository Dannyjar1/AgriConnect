import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule], // CommonModule para ngIf, ngFor, y pipes como 'currency'
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.scss']
})
export class ProductCard {
  // El operador '!' resuelve el error TS2564, asegurando a TypeScript
  // que la propiedad 'product' será asignada desde el exterior a través de @Input.
  @Input() product!: Product;

  // URL de una imagen por defecto si el producto no tiene imágenes.
  readonly defaultImageUrl = 'assets/images/placeholder.png';
}