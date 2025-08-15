import { Component, signal, computed, ChangeDetectionStrategy, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedHeaderComponent } from '../../shared/components/shared-header/shared-header.component';

interface Producer {
  id: string;
  companyName?: string;
  producerName: string;
  logoUrl?: string;
  productName: string;
  province: string;
  type: 'productor local' | 'exportador' | 'asociación' | 'cooperativa' | 'empresa agrícola';
  category: 'frutas' | 'lácteos' | 'hortalizas' | 'carnes' | 'granos' | 'orgánicos';
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
}

@Component({
  selector: 'app-productores',
  standalone: true,
  imports: [CommonModule, SharedHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './productores.html',
  styleUrls: ['./productores.scss']
})
export class ProductoresComponent implements OnDestroy {
  
  // Router injection for navigation
  private readonly router = inject(Router);
  
  // Multifrutas image path for visual enhancements
  protected readonly multifrutasImagePath = 'assets/images/multifrutas.webp';
  
  // Mock data de productores ecuatorianos
  private readonly allProducers = signal<Producer[]>([
    // Frutas
    {
      id: '1',
      companyName: 'Frutas del Pichincha S.A.',
      producerName: 'Carlos Mendoza',
      logoUrl: '/assets/images/producers/frutas-pichincha-logo.svg',
      productName: 'Banano Orgánico',
      province: 'Pichincha',
      type: 'empresa agrícola',
      category: 'frutas',
      contactInfo: {
        phone: '+593 2 234-5678',
        email: 'contacto@frutaspichincha.ec',
        address: 'Km 15 Vía Calacalí'
      }
    },
    {
      id: '2',
      producerName: 'María González',
      productName: 'Maracuyá Premium',
      province: 'Guayas',
      type: 'productor local',
      category: 'frutas',
      contactInfo: {
        phone: '+593 4 567-8901',
        email: 'maria.gonzalez@gmail.com'
      }
    },
    {
      id: '3',
      companyName: 'Cítricos Andinos',
      producerName: 'Roberto Silva',
      productName: 'Naranja Valencia',
      province: 'Azuay',
      type: 'cooperativa',
      category: 'frutas',
      contactInfo: {
        phone: '+593 7 234-5679'
      }
    },

    // Lácteos
    {
      id: '4',
      companyName: 'Lácteos Sierra Norte',
      producerName: 'Ana Patricia Ruiz',
      logoUrl: '/assets/images/producers/lacteos-sierra-logo.svg',
      productName: 'Queso Fresco Artesanal',
      province: 'Imbabura',
      type: 'empresa agrícola',
      category: 'lácteos',
      contactInfo: {
        phone: '+593 6 298-7654',
        email: 'info@lacteossierranorte.ec',
        address: 'Sector La Esperanza'
      }
    },
    {
      id: '5',
      producerName: 'Jorge Albán',
      productName: 'Yogurt Natural',
      province: 'Cotopaxi',
      type: 'productor local',
      category: 'lácteos',
      contactInfo: {
        phone: '+593 3 278-9012'
      }
    },

    // Hortalizas
    {
      id: '6',
      companyName: 'Hortalizas Frescas del Valle',
      producerName: 'Luis Fernando Morales',
      productName: 'Brócoli Premium',
      province: 'Chimborazo',
      type: 'asociación',
      category: 'hortalizas',
      contactInfo: {
        phone: '+593 3 296-4321',
        email: 'ventas@hortalizasvalle.ec'
      }
    },
    {
      id: '7',
      producerName: 'Carmen Hidalgo',
      productName: 'Acelga Hidropónica',
      province: 'Tungurahua',
      type: 'productor local',
      category: 'hortalizas',
      contactInfo: {
        phone: '+593 3 245-6789'
      }
    },

    // Carnes
    {
      id: '8',
      companyName: 'Ganadería Sostenible El Oro',
      producerName: 'Miguel Ángel Castro',
      logoUrl: '/assets/images/producers/ganaderia-eloro-logo.svg',
      productName: 'Carne de Res Premium',
      province: 'El Oro',
      type: 'empresa agrícola',
      category: 'carnes',
      contactInfo: {
        phone: '+593 7 293-4567',
        email: 'gerencia@ganaderiaeloro.ec',
        address: 'Pasaje, Km 8 Vía Machala'
      }
    },

    // Granos
    {
      id: '9',
      companyName: 'Quinua Andina Export',
      producerName: 'Dolores Quispe',
      productName: 'Quinua Real',
      province: 'Cañar',
      type: 'exportador',
      category: 'granos',
      contactInfo: {
        phone: '+593 7 244-8901',
        email: 'export@quinuaandina.ec'
      }
    },
    {
      id: '10',
      producerName: 'Francisco Toapanta',
      productName: 'Maíz Amarillo Duro',
      province: 'Los Ríos',
      type: 'productor local',
      category: 'granos',
      contactInfo: {
        phone: '+593 5 234-5678'
      }
    },

    // Orgánicos
    {
      id: '11',
      companyName: 'Orgánicos Pachamama',
      producerName: 'Isabella Vargas',
      logoUrl: '/assets/images/producers/organicos-pachamama-logo.svg',
      productName: 'Vegetales Orgánicos Mixtos',
      province: 'Pichincha',
      type: 'asociación',
      category: 'orgánicos',
      contactInfo: {
        phone: '+593 2 345-6789',
        email: 'contacto@organicospachamama.ec',
        address: 'Valle de Tumbaco'
      }
    },
    {
      id: '12',
      producerName: 'Pedro Yamberla',
      productName: 'Hierbas Aromáticas Orgánicas',
      province: 'Imbabura',
      type: 'productor local',
      category: 'orgánicos',
      contactInfo: {
        phone: '+593 6 278-9012'
      }
    }
  ]);

  // Categorías disponibles
  protected readonly categories = signal([
    { key: 'frutas', name: 'Frutas', icon: '🍎', count: 0 },
    { key: 'lácteos', name: 'Lácteos', icon: '🥛', count: 0 },
    { key: 'hortalizas', name: 'Hortalizas', icon: '🥬', count: 0 },
    { key: 'carnes', name: 'Carnes', icon: '🥩', count: 0 },
    { key: 'granos', name: 'Granos y Cereales', icon: '🌾', count: 0 },
    { key: 'orgánicos', name: 'Productos Orgánicos', icon: '🌿', count: 0 }
  ]);

  // Filtro de categoría seleccionada
  protected readonly selectedCategory = signal<string>('');

  // Productores filtrados por categoría
  protected readonly filteredProducers = computed(() => {
    const selected = this.selectedCategory();
    if (!selected) return this.allProducers();
    
    return this.allProducers().filter(producer => producer.category === selected);
  });

  // Productores organizados por categoría
  protected readonly producersByCategory = computed(() => {
    const producers = this.allProducers();
    const categories = this.categories();
    
    return categories.map(category => {
      const categoryProducers = producers.filter(p => p.category === category.key);
      return {
        ...category,
        count: categoryProducers.length,
        producers: categoryProducers
      };
    });
  });

  // Estado de flip card
  protected readonly flippedCards = signal<Set<string>>(new Set());
  
  // Auto-return timers for flipped cards
  private cardTimers = new Map<string, number>();
  private readonly AUTO_RETURN_DELAY = 15000; // 15 seconds
  
  // Optional: Track cards with active timers for visual indicators
  protected readonly cardsWithActiveTimers = signal<Set<string>>(new Set());

  /**
   * Toggle flip state of a card with auto-return functionality
   */
  protected toggleCard(producerId: string): void {
    const flipped = this.flippedCards();
    const newFlipped = new Set(flipped);
    
    // Clear existing timer for this card
    this.clearCardTimer(producerId);
    
    if (newFlipped.has(producerId)) {
      // Card is currently flipped, return to front
      newFlipped.delete(producerId);
    } else {
      // Card is currently front, flip to back and set auto-return timer
      newFlipped.add(producerId);
      this.setAutoReturnTimer(producerId);
    }
    
    this.flippedCards.set(newFlipped);
  }

  /**
   * Check if card is flipped
   */
  protected isCardFlipped(producerId: string): boolean {
    return this.flippedCards().has(producerId);
  }

  /**
   * Set auto-return timer for a card
   */
  private setAutoReturnTimer(producerId: string): void {
    const timerId = window.setTimeout(() => {
      this.returnCardToFront(producerId);
    }, this.AUTO_RETURN_DELAY);
    
    this.cardTimers.set(producerId, timerId);
    
    // Add to active timers set for visual indicators
    const activeTimers = this.cardsWithActiveTimers();
    const newActiveTimers = new Set(activeTimers);
    newActiveTimers.add(producerId);
    this.cardsWithActiveTimers.set(newActiveTimers);
  }

  /**
   * Clear timer for a specific card
   */
  private clearCardTimer(producerId: string): void {
    const timerId = this.cardTimers.get(producerId);
    if (timerId) {
      window.clearTimeout(timerId);
      this.cardTimers.delete(producerId);
    }
    
    // Remove from active timers set
    const activeTimers = this.cardsWithActiveTimers();
    const newActiveTimers = new Set(activeTimers);
    newActiveTimers.delete(producerId);
    this.cardsWithActiveTimers.set(newActiveTimers);
  }

  /**
   * Return a card to front position (used by auto-return timer)
   */
  private returnCardToFront(producerId: string): void {
    const flipped = this.flippedCards();
    const newFlipped = new Set(flipped);
    
    if (newFlipped.has(producerId)) {
      newFlipped.delete(producerId);
      this.flippedCards.set(newFlipped);
    }
    
    // Clean up the timer reference
    this.cardTimers.delete(producerId);
    
    // Remove from active timers set
    const activeTimers = this.cardsWithActiveTimers();
    const newActiveTimers = new Set(activeTimers);
    newActiveTimers.delete(producerId);
    this.cardsWithActiveTimers.set(newActiveTimers);
  }

  /**
   * Clear all card timers
   */
  private clearAllCardTimers(): void {
    this.cardTimers.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    this.cardTimers.clear();
    this.cardsWithActiveTimers.set(new Set());
  }

  /**
   * Set category filter
   */
  protected setCategory(category: string): void {
    this.selectedCategory.set(category === this.selectedCategory() ? '' : category);
  }

  /**
   * Get display name for producer (priority: company > producer name)
   */
  protected getDisplayName(producer: Producer): string {
    return producer.companyName || producer.producerName;
  }

  /**
   * Get accessible aria-label for card with auto-return information
   */
  protected getCardAriaLabel(producer: Producer): string {
    const name = this.getDisplayName(producer);
    const isFlipped = this.isCardFlipped(producer.id);
    
    if (isFlipped) {
      return `Tarjeta de ${name}. Mostrando información de contacto. Se volteará automáticamente en 15 segundos o haz clic para voltear manualmente.`;
    } else {
      return `Tarjeta de ${name}. Haz clic para ver información de contacto. Se volteará automáticamente después de 15 segundos.`;
    }
  }

  /**
   * Check if a card has an active auto-return timer
   */
  protected hasActiveTimer(producerId: string): boolean {
    return this.cardsWithActiveTimers().has(producerId);
  }

  /**
   * Get producer type in Spanish
   */
  protected getProducerTypeLabel(type: Producer['type']): string {
    const labels = {
      'productor local': 'Productor Local',
      'exportador': 'Exportador',
      'asociación': 'Asociación',
      'cooperativa': 'Cooperativa',
      'empresa agrícola': 'Empresa Agrícola'
    };
    return labels[type];
  }

  /**
   * Get inline style for multifrutas background pattern on front card
   */
  protected getFrontCardStyle(): string {
    return `background-image: 
      linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.9) 100%),
      url('${this.multifrutasImagePath}');
      background-size: 120px 120px, cover;
      background-position: center, center;
      background-repeat: no-repeat, no-repeat;
      background-blend-mode: overlay;`;
  }

  /**
   * Get inline style for multifrutas background pattern on back card
   */
  protected getBackCardStyle(): string {
    return `background-image: 
      linear-gradient(135deg, rgba(187, 247, 208, 0.85) 0%, rgba(134, 239, 172, 0.85) 50%, rgba(74, 222, 128, 0.85) 100%),
      url('${this.multifrutasImagePath}');
      background-size: 80px 80px, cover;
      background-position: right bottom, center;
      background-repeat: no-repeat, no-repeat;
      background-blend-mode: soft-light;`;
  }

  /**
   * Component cleanup - clear all timers
   */
  ngOnDestroy(): void {
    this.clearAllCardTimers();
  }
}