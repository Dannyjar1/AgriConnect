import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface AlgorithmSetting {
  id: string;
  name: string;
  description: string;
  value: number | string | boolean;
  type: 'number' | 'text' | 'boolean' | 'select';
  options?: { value: any; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  category: string;
}

@Component({
  selector: 'app-algorithm-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './algorithm-config.html',
  styleUrl: './algorithm-config.scss'
})
export class AlgorithmConfig implements OnInit {
  private fb = inject(FormBuilder);

  // Signals para el estado
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly settings = signal<AlgorithmSetting[]>([]);
  readonly selectedCategory = signal<string>('all');

  // Formulario
  configForm: FormGroup;

  // Categorías
  readonly categories = [
    { value: 'all', label: 'Todas las configuraciones' },
    { value: 'recommendation', label: 'Sistema de Recomendaciones' },
    { value: 'pricing', label: 'Algoritmos de Precios' },
    { value: 'inventory', label: 'Gestión de Inventario' },
    { value: 'matching', label: 'Emparejamiento' },
    { value: 'quality', label: 'Control de Calidad' }
  ];

  constructor() {
    this.configForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  /**
   * Cargar configuraciones
   */
  private async loadSettings(): Promise<void> {
    this.isLoading.set(true);
    try {
      // TODO: Implementar servicio para obtener configuraciones reales
      const mockSettings: AlgorithmSetting[] = [
        // Sistema de Recomendaciones
        {
          id: 'rec_weight_rating',
          name: 'Peso de Calificaciones',
          description: 'Importancia de las calificaciones de productos en las recomendaciones',
          value: 0.4,
          type: 'number',
          min: 0,
          max: 1,
          step: 0.1,
          category: 'recommendation'
        },
        {
          id: 'rec_weight_popularity',
          name: 'Peso de Popularidad',
          description: 'Importancia de la popularidad del producto',
          value: 0.3,
          type: 'number',
          min: 0,
          max: 1,
          step: 0.1,
          category: 'recommendation'
        },
        {
          id: 'rec_weight_freshness',
          name: 'Peso de Frescura',
          description: 'Importancia de la fecha de cosecha/producción',
          value: 0.3,
          type: 'number',
          min: 0,
          max: 1,
          step: 0.1,
          category: 'recommendation'
        },
        {
          id: 'rec_max_results',
          name: 'Máximo de Recomendaciones',
          description: 'Número máximo de productos recomendados por usuario',
          value: 10,
          type: 'number',
          min: 1,
          max: 50,
          step: 1,
          category: 'recommendation'
        },

        // Algoritmos de Precios
        {
          id: 'price_dynamic_enabled',
          name: 'Precios Dinámicos',
          description: 'Habilitar ajuste automático de precios basado en demanda',
          value: true,
          type: 'boolean',
          category: 'pricing'
        },
        {
          id: 'price_demand_factor',
          name: 'Factor de Demanda',
          description: 'Multiplicador para ajuste de precios por alta demanda',
          value: 1.2,
          type: 'number',
          min: 1,
          max: 2,
          step: 0.1,
          category: 'pricing'
        },
        {
          id: 'price_season_adjustment',
          name: 'Ajuste Estacional',
          description: 'Tipo de ajuste de precios por temporada',
          value: 'moderate',
          type: 'select',
          options: [
            { value: 'none', label: 'Sin ajuste' },
            { value: 'light', label: 'Ligero (±5%)' },
            { value: 'moderate', label: 'Moderado (±15%)' },
            { value: 'aggressive', label: 'Agresivo (±30%)' }
          ],
          category: 'pricing'
        },

        // Gestión de Inventario
        {
          id: 'inv_reorder_threshold',
          name: 'Umbral de Reorden',
          description: 'Porcentaje de stock mínimo para alertas de reposición',
          value: 20,
          type: 'number',
          min: 5,
          max: 50,
          step: 5,
          category: 'inventory'
        },
        {
          id: 'inv_expiry_alert_days',
          name: 'Días de Alerta de Vencimiento',
          description: 'Días antes del vencimiento para mostrar alertas',
          value: 3,
          type: 'number',
          min: 1,
          max: 14,
          step: 1,
          category: 'inventory'
        },
        {
          id: 'inv_auto_discount',
          name: 'Descuento Automático',
          description: 'Aplicar descuentos automáticos a productos próximos a vencer',
          value: true,
          type: 'boolean',
          category: 'inventory'
        },

        // Emparejamiento
        {
          id: 'match_distance_weight',
          name: 'Peso de Distancia',
          description: 'Importancia de la proximidad geográfica en el emparejamiento',
          value: 0.6,
          type: 'number',
          min: 0,
          max: 1,
          step: 0.1,
          category: 'matching'
        },
        {
          id: 'match_max_distance',
          name: 'Distancia Máxima (km)',
          description: 'Distancia máxima para emparejamiento productor-comprador',
          value: 50,
          type: 'number',
          min: 5,
          max: 200,
          step: 5,
          category: 'matching'
        },

        // Control de Calidad
        {
          id: 'quality_min_rating',
          name: 'Calificación Mínima',
          description: 'Calificación mínima para mostrar productos',
          value: 3.0,
          type: 'number',
          min: 1,
          max: 5,
          step: 0.1,
          category: 'quality'
        },
        {
          id: 'quality_auto_hide',
          name: 'Ocultar Automáticamente',
          description: 'Ocultar productos con calificaciones muy bajas',
          value: true,
          type: 'boolean',
          category: 'quality'
        }
      ];

      this.settings.set(mockSettings);
      this.buildForm();
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Construir formulario dinámico
   */
  private buildForm(): void {
    const formControls: { [key: string]: any } = {};
    
    this.settings().forEach(setting => {
      const validators = [];
      if (setting.type === 'number' && setting.min !== undefined) {
        validators.push(Validators.min(setting.min));
      }
      if (setting.type === 'number' && setting.max !== undefined) {
        validators.push(Validators.max(setting.max));
      }
      
      formControls[setting.id] = [setting.value, validators];
    });

    this.configForm = this.fb.group(formControls);
  }

  /**
   * Configuraciones filtradas
   */
  get filteredSettings(): AlgorithmSetting[] {
    const settings = this.settings();
    if (this.selectedCategory() === 'all') {
      return settings;
    }
    return settings.filter(setting => setting.category === this.selectedCategory());
  }

  /**
   * Cambiar categoría
   */
  changeCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  /**
   * Guardar configuraciones
   */
  async saveSettings(): Promise<void> {
    if (this.configForm.invalid) return;

    this.isSaving.set(true);
    try {
      const formData = this.configForm.value;
      console.log('Guardando configuraciones:', formData);
      
      // TODO: Implementar servicio para guardar configuraciones
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mostrar mensaje de éxito
      alert('Configuraciones guardadas exitosamente');
    } catch (error) {
      console.error('Error guardando configuraciones:', error);
      alert('Error al guardar las configuraciones');
    } finally {
      this.isSaving.set(false);
    }
  }

  /**
   * Resetear a valores por defecto
   */
  resetToDefaults(): void {
    if (!confirm('¿Estás seguro de que quieres resetear todas las configuraciones a sus valores por defecto?')) {
      return;
    }

    // Resetear formulario a valores originales
    this.settings().forEach(setting => {
      this.configForm.get(setting.id)?.setValue(setting.value);
    });
  }

  /**
   * Obtener icono para categoría
   */
  getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      recommendation: 'fas fa-star',
      pricing: 'fas fa-dollar-sign',
      inventory: 'fas fa-boxes',
      matching: 'fas fa-link',
      quality: 'fas fa-shield-alt'
    };
    return iconMap[category] || 'fas fa-cog';
  }

  /**
   * Obtener color para categoría
   */
  getCategoryColor(category: string): string {
    const colorMap: { [key: string]: string } = {
      recommendation: 'blue',
      pricing: 'green',
      inventory: 'purple',
      matching: 'amber',
      quality: 'red'
    };
    return colorMap[category] || 'gray';
  }
}
