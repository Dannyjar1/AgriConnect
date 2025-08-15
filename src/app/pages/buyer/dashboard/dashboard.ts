import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedHeaderComponent } from '../../../shared/components/shared-header/shared-header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SharedHeaderComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  protected readonly router = inject(Router);

  protected navigateToMarketplace(): void {
    this.router.navigate(['/marketplace']);
  }

  protected navigateToOrders(): void {
    this.router.navigate(['/buyer/orders']);
  }

  protected navigateToProductores(): void {
    this.router.navigate(['/productores']);
  }

  protected navigateToFavorites(): void {
    this.router.navigate(['/buyer/favorites']);
  }
}
