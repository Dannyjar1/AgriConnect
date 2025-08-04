import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBar } from '../components/search-bar/search-bar';
import { CategoryFilterComponent } from '../components/category-filter/category-filter';
import { NeedsFormComponent } from '../components/needs-form/needs-form';
import { ProductCard } from '../../../shared/components/product-card/product-card';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [
    CommonModule,
    SearchBar,
    CategoryFilterComponent,
    NeedsFormComponent,
    ProductCard
  ],
  templateUrl: './marketplace.html',
  styleUrl: './marketplace.scss'
})
export class Marketplace {

}
