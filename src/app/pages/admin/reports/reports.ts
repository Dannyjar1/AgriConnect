import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AdminHeaderComponent } from '../../../shared/components/admin-header/admin-header.component';

interface ReportData {
  title: string;
  description: string;
  icon: string;
  color: string;
  data: any[];
  type: 'table' | 'chart' | 'summary';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminHeaderComponent],
  templateUrl: './reports.html'
})
export class Reports implements OnInit {
  private fb = inject(FormBuilder);

  // Signals para el estado
  readonly isLoading = signal<boolean>(false);
  readonly selectedReport = signal<string>('sales');
  readonly reportData = signal<ReportData | null>(null);

  // Formulario de filtros
  filterForm: FormGroup;

  // Tipos de reportes disponibles
  readonly reportTypes = [
    {
      id: 'sales',
      title: 'Reporte de Ventas',
      description: 'Análisis de ventas por período',
      icon: 'fas fa-chart-line',
      color: 'blue'
    },
    {
      id: 'products',
      title: 'Reporte de Productos',
      description: 'Estadísticas de productos más vendidos',
      icon: 'fas fa-box',
      color: 'green'
    },
    {
      id: 'producers',
      title: 'Reporte de Productores',
      description: 'Rendimiento de productores',
      icon: 'fas fa-users',
      color: 'purple'
    },
    {
      id: 'inventory',
      title: 'Reporte de Inventario',
      description: 'Estado actual del inventario',
      icon: 'fas fa-warehouse',
      color: 'amber'
    },
    {
      id: 'financial',
      title: 'Reporte Financiero',
      description: 'Análisis financiero y rentabilidad',
      icon: 'fas fa-dollar-sign',
      color: 'emerald'
    }
  ];

  // Períodos disponibles
  readonly periods = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 3 meses' },
    { value: '1y', label: 'Último año' },
    { value: 'custom', label: 'Período personalizado' }
  ];

  constructor() {
    this.filterForm = this.fb.group({
      period: ['30d'],
      startDate: [''],
      endDate: [''],
      category: ['all'],
      producer: ['all']
    });
  }

  ngOnInit(): void {
    this.loadReport();
  }

  /**
   * Cargar reporte seleccionado
   */
  private async loadReport(): Promise<void> {
    this.isLoading.set(true);
    try {
      const reportType = this.selectedReport();
      const filters = this.filterForm.value;

      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData = this.generateMockData(reportType, filters);
      this.reportData.set(mockData);
    } catch (error) {
      console.error('Error cargando reporte:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Generar datos mock para el reporte
   */
  private generateMockData(reportType: string, filters: any): ReportData {
    switch (reportType) {
      case 'sales':
        return {
          title: 'Reporte de Ventas',
          description: `Análisis de ventas para ${this.getPeriodLabel(filters.period)}`,
          icon: 'fas fa-chart-line',
          color: 'blue',
          type: 'table',
          data: [
            { date: '2024-03-01', sales: 1250.50, orders: 15, avgOrder: 83.37 },
            { date: '2024-03-02', sales: 980.25, orders: 12, avgOrder: 81.69 },
            { date: '2024-03-03', sales: 1450.75, orders: 18, avgOrder: 80.60 },
            { date: '2024-03-04', sales: 1120.00, orders: 14, avgOrder: 80.00 },
            { date: '2024-03-05', sales: 1680.30, orders: 21, avgOrder: 80.01 }
          ]
        };

      case 'products':
        return {
          title: 'Reporte de Productos',
          description: 'Productos más vendidos del período',
          icon: 'fas fa-box',
          color: 'green',
          type: 'table',
          data: [
            { product: 'Tomates Cherry', sales: 156, revenue: 2340.00, growth: 12.5 },
            { product: 'Lechuga Hidropónica', sales: 134, revenue: 1876.00, growth: 8.3 },
            { product: 'Zanahorias Baby', sales: 98, revenue: 1456.00, growth: -2.1 },
            { product: 'Espinaca Fresca', sales: 87, revenue: 1234.00, growth: 15.7 },
            { product: 'Brócoli Orgánico', sales: 76, revenue: 1098.00, growth: 5.4 }
          ]
        };

      case 'producers':
        return {
          title: 'Reporte de Productores',
          description: 'Rendimiento de productores registrados',
          icon: 'fas fa-users',
          color: 'purple',
          type: 'table',
          data: [
            { producer: 'Juan Pérez', products: 12, sales: 3450.00, rating: 4.8 },
            { producer: 'María González', products: 8, sales: 2890.00, rating: 4.6 },
            { producer: 'Carlos Rodríguez', products: 15, sales: 4120.00, rating: 4.9 },
            { producer: 'Ana Martínez', products: 6, sales: 1980.00, rating: 4.5 },
            { producer: 'Luis Herrera', products: 10, sales: 2760.00, rating: 4.7 }
          ]
        };

      default:
        return {
          title: 'Reporte',
          description: 'Datos del reporte',
          icon: 'fas fa-chart-bar',
          color: 'gray',
          type: 'summary',
          data: []
        };
    }
  }

  /**
   * Obtener etiqueta del período
   */
  private getPeriodLabel(period: string): string {
    const periodOption = this.periods.find(p => p.value === period);
    return periodOption?.label || 'Período seleccionado';
  }

  /**
   * Cambiar tipo de reporte
   */
  selectReport(reportId: string): void {
    this.selectedReport.set(reportId);
    this.loadReport();
  }

  /**
   * Aplicar filtros
   */
  applyFilters(): void {
    this.loadReport();
  }

  /**
   * Exportar reporte
   */
  exportReport(format: 'pdf' | 'excel' | 'csv'): void {
    console.log(`Exportando reporte en formato ${format}`);
    // TODO: Implementar exportación
  }

  /**
   * Obtener reporte seleccionado
   */
  get selectedReportInfo() {
    return this.reportTypes.find(r => r.id === this.selectedReport());
  }

  /**
   * Formatear precio
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  }

  /**
   * Obtener clase de color
   */
  getColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      amber: 'from-amber-500 to-amber-600',
      emerald: 'from-emerald-500 to-emerald-600'
    };
    return colorMap[color] || 'from-gray-500 to-gray-600';
  }
}