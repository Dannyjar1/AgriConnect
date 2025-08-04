import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-product-card',
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.scss']
})
export class ProductCard {
  @Input() product: Product;
}
