import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  // Signal para productos reactivos
  readonly products = signal<Product[]>([]);
  
  // BehaviorSubject para compatibilidad con observables
  private readonly productsSubject = new BehaviorSubject<Product[]>([]);
  
  // Productos simulados para desarrollo
  private readonly mockProducts: Product[] = [
    {
      id: '1',
      producerId: 'prod-abc',
      name: 'Manzanas Frescas',
      category: 'Frutas',
      description: 'Cosechadas localmente, perfectas para cualquier ocasión.',
      images: ['assets/images/manzanas.jpg'],
      price: {
        perUnit: 2.5,
        unit: 'unidad',
        minOrder: 1,
        maxOrder: 10
      },
      availability: 100,
      certifications: ['Orgánico'],
      traceability: {
        batch: 'B-123',
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
        harvestMethod: 'Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      producerId: 'prod-def',
      name: 'Zanahorias Orgánicas',
      category: 'Verduras',
      description: 'Cultivadas sin pesticidas, ricas en betacaroteno.',
      images: ['assets/images/zanahorias.jpg'],
      price: {
        perUnit: 1.8,
        unit: 'lb',
        minOrder: 1,
        maxOrder: 20
      },
      availability: 150,
      certifications: ['Orgánico', 'Comercio Justo'],
      traceability: {
        batch: 'Z-456',
        coordinates: { latitude: 41.2033, longitude: -77.1945 },
        harvestMethod: 'Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      producerId: 'prod-ghi',
      name: 'Leche Fresca de Granja',
      category: 'Lácteos',
      description: 'Leche fresca de vacas alimentadas con pasto natural.',
      images: ['assets/images/leche.jpg'],
      price: {
        perUnit: 3.2,
        unit: 'litro',
        minOrder: 1,
        maxOrder: 12
      },
      availability: 80,
      certifications: ['Pastoreo Libre'],
      traceability: {
        batch: 'L-789',
        coordinates: { latitude: 39.7392, longitude: -104.9903 },
        harvestMethod: 'Ordeño Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      producerId: 'prod-jkl',
      name: 'Pan Artesanal de Masa Madre',
      category: 'Panadería',
      description: 'Pan horneado con masa madre tradicional de 48 horas de fermentación.',
      images: ['assets/images/pan.jpg'],
      price: {
        perUnit: 4.5,
        unit: 'hogaza',
        minOrder: 1,
        maxOrder: 6
      },
      availability: 25,
      certifications: ['Artesanal'],
      traceability: {
        batch: 'P-012',
        coordinates: { latitude: 40.7589, longitude: -73.9851 },
        harvestMethod: 'Horneado Tradicional'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor() {
    this.initializeProducts();
  }

  private initializeProducts(): void {
    // Inicializar con productos simulados
    this.products.set(this.mockProducts);
    this.productsSubject.next(this.mockProducts);
  }

  getProducts(): Observable<Product[]> {
    return this.productsSubject.asObservable();
  }

  getProductsSignal() {
    return this.products;
  }

  getProductById(id: string): Observable<Product | undefined> {
    // TODO: Reemplazar con llamada a API/Base de Datos
    const currentProducts = this.products();
    const product = currentProducts.find(p => p.id === id);
    return of(product);
  }

  searchProducts(searchTerm: string): Observable<Product[]> {
    // TODO: Reemplazar con llamada a API/Base de Datos
    const currentProducts = this.products();
    const filtered = currentProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return of(filtered);
  }

  filterByCategory(category: string): Observable<Product[]> {
    // TODO: Reemplazar con llamada a API/Base de Datos
    const currentProducts = this.products();
    const filtered = currentProducts.filter(product =>
      product.category.toLowerCase() === category.toLowerCase()
    );
    return of(filtered);
  }

  // Método para cargar productos desde API (listo para implementar)
  loadProductsFromAPI(): Observable<Product[]> {
    // TODO: Implementar llamada HTTP a la API
    // return this.http.get<Product[]>('/api/products');
    return of([]);
  }

  // Método para actualizar productos dinámicamente
  updateProducts(products: Product[]): void {
    this.products.set(products);
    this.productsSubject.next(products);
  }

}
