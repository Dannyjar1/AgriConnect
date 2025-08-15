import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { Observable } from 'rxjs';
import { ProductCard } from '../../../shared/components/product-card/product-card';

@Component({
  standalone: true,
  imports: [CommonModule, ProductCard],
  selector: 'app-product-catalog',
  templateUrl: './product-catalog.html',
  styleUrls: ['./product-catalog.scss']
})
export class ProductCatalog implements OnInit {
  private productService = inject(ProductService);
  
  products$!: Observable<Product[]>;

  ngOnInit() {
    this.products$ = this.productService.getProducts();
  }
}
