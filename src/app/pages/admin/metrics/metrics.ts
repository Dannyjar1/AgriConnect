import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

interface MetricCard {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
  color: string;
  description: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics.html',
  styleUrl: './metrics.scss'
})
export class Metrics implements OnInit {
  private authService = inject(AuthService);

  // Signals para el estado
  readonly isLoading = signal<boolean>(false);
  readonly selectedPeriod = signal<string>('7d');
  readonly metrics = signal<MetricCard[]>([]);

  // Opciones de período
  readonly periodOptions = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 3 meses' },
    { value: '1y', label: 'Último año' }
  ];

  ngOnInit(): void {
    this.loadMetrics();
  }

  /**
   * Cargar métricas
   */
  private async loadMetrics(): Promise<void> {
    this.isLoading.set(true);
    try {
      // TODO: Implementar servicio para obtener métricas reales
      // Datos de ejemplo
      const mockMetrics: MetricCard[] = [
        {
          title: 'Usuarios Totales',
          value: 1247,
          change: 12.5,
          changeType: 'increase',
          icon: 'fas fa-users',
          color: 'blue',
          description: 'Usuarios registrados en la plataforma'
        },
        {
          title: 'Ventas del Mes',
          value: 89650,
          change: 8.2,
          changeType: 'increase',
          icon: 'fas fa-dollar-sign',
          color: 'green',
          description: 'Ingresos totales del mes actual'
        },
        {
          title: 'Productos Activos',
          value: 342,
          change: -2.1,
          changeType: 'decrease',
          icon: 'fas fa-box',
          color: 'purple',
          description: 'Productos disponibles en el marketplace'
        },
        {
          title: 'Pedidos Completados',
          value: 156,
          change: 15.8,
          changeType: 'increase',
          icon: 'fas fa-check-circle',
          color: 'emerald',
          description: 'Pedidos entregados exitosamente'
        },
        {
          title: 'Productores Activos',
          value: 28,
          change: 3.7,
          changeType: 'increase',
          icon: 'fas fa-seedling',
          color: 'amber',
          description: 'Productores con productos activos'
        },
        {
          title: 'Tasa de Conversión',
          value: 3.2,
          change: 0.8,
          changeType: 'increase',
          icon: 'fas fa-chart-line',
          color: 'indigo',
          description: 'Porcentaje de visitantes que compran'
        }
      ];
      
      this.metrics.set(mockMetrics);
    } catch (error) {
      console.error('Error cargando métricas:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Cambiar período de métricas
   */
  changePeriod(period: string): void {
    this.selectedPeriod.set(period);
    this.loadMetrics();
  }

  /**
   * Obtener clase de color para la métrica
   */
  getColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      emerald: 'from-emerald-500 to-emerald-600',
      amber: 'from-amber-500 to-amber-600',
      indigo: 'from-indigo-500 to-indigo-600',
      red: 'from-red-500 to-red-600'
    };
    return colorMap[color] || 'from-gray-500 to-gray-600';
  }

  /**
   * Formatear número
   */
  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }

  /**
   * Formatear porcentaje de cambio
   */
  formatChange(change: number): string {
    return Math.abs(change).toFixed(1) + '%';
  }

  /**
   * Obtener valor absoluto
   */
  abs(value: number): number {
    return Math.abs(value);
  }
}
