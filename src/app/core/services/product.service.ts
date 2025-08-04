import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private products: Product[] = [
    {
      id: '1',
      producerId: 'prod-abc',
      name: 'Manzanas Frescas',
      category: 'Frutas',
      description: 'Cosechadas localmente, perfectas para cualquier ocasión.',
      images: ['assets/images/manzanas.jpg'],
      price: {
        perUnit: 2.5,
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
      category: 'Vegetales',
      description: 'Cultivadas sin pesticidas, llenas de sabor y nutrientes.',
      images: ['assets/images/zanahorias.jpg'],
      price: {
        perUnit: 1.8,
        minOrder: 2,
        maxOrder: 20
      },
      availability: 150,
      certifications: ['Orgánico', 'Comercio Justo'],
      traceability: {
        batch: 'B-456',
        coordinates: { latitude: 34.0522, longitude: -118.2437 },
        harvestMethod: 'Mecanizado'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      producerId: 'prod-ghi',
      name: 'Leche Fresca de Granja',
      category: 'Lácteos',
      description: 'Directamente de la granja a tu mesa.',
      images: ['assets/images/leche.jpg'],
      price: {
        perUnit: 3.0,
        minOrder: 1,
        maxOrder: 5
      },
      availability: 50,
      certifications: [],
      traceability: {
        batch: 'B-789',
        coordinates: { latitude: 41.8781, longitude: -87.6298 },
        harvestMethod: 'Automático'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      producerId: 'prod-jkl',
      name: 'Pan Artesanal de Masa Madre',
      category: 'Panadería',
      description: 'Horneado diariamente con ingredientes naturales.',
      images: ['assets/images/pan.jpg'],
      price: {
        perUnit: 4.0,
        minOrder: 1,
        maxOrder: 3
      },
      availability: 30,
      certifications: ['Artesanal'],
      traceability: {
        batch: 'B-101',
        coordinates: { latitude: 39.9526, longitude: -75.1652 },
        harvestMethod: 'Manual'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  getProducts(): Observable<Product[]> {
    return of(this.products);
  }

}
