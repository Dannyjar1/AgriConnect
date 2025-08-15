import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, BehaviorSubject, from, combineLatest, forkJoin } from 'rxjs';
import { map, switchMap, mergeMap } from 'rxjs/operators';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, getDoc } from '@angular/fire/firestore';
import { Product, InventoryEntry } from '../models/product.model';
import { Producer } from '../models/user.model';
import { AuthService } from './auth.service';
import { InventoryService } from './inventory.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private inventoryService = inject(InventoryService);
  
  // Signal para productos reactivos
  readonly products = signal<Product[]>([]);
  
  // BehaviorSubject para compatibilidad con observables
  private readonly productsSubject = new BehaviorSubject<Product[]>([]);

  constructor() {
    this.loadProducts();
  }

  /**
   * Cargar productos desde Firebase
   */
  private loadProducts(): void {
    this.getProducts().subscribe(products => {
      this.products.set(products);
      this.productsSubject.next(products);
    });
  }

  /**
   * Crear un nuevo producto (solo superadmin)
   */
  createProduct(productData: Omit<Product, 'id' | 'registeredBy' | 'createdAt' | 'updatedAt' | 'isActive'>): Observable<string> {
    return from(this.authService.currentUser$).pipe(
      switchMap(user => {
        if (!user || user.userType !== 'superadmin') {
          throw new Error('Solo los superadmin pueden crear productos');
        }

        const product: Omit<Product, 'id'> = {
          ...productData,
          registeredBy: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        };

        return from(addDoc(collection(this.firestore, 'products'), product)).pipe(
          map(docRef => {
            this.loadProducts(); // Recargar productos
            return docRef.id;
          })
        );
      })
    );
  }

  /**
   * Actualizar un producto (solo superadmin)
   */
  updateProduct(productId: string, updates: Partial<Product>): Observable<void> {
    return from(this.authService.currentUser$).pipe(
      switchMap(user => {
        if (!user || user.userType !== 'superadmin') {
          throw new Error('Solo los superadmin pueden actualizar productos');
        }

        const productRef = doc(this.firestore, 'products', productId);
        const updateData = {
          ...updates,
          updatedAt: new Date()
        };

        return from(updateDoc(productRef, updateData)).pipe(
          map(() => {
            this.loadProducts(); // Recargar productos
          })
        );
      })
    );
  }

  /**
   * Obtener todos los productos activos con información del productor
   */
  getProducts(): Observable<Product[]> {
    const q = query(
      collection(this.firestore, 'products'),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    return from(getDocs(q)).pipe(
      switchMap(snapshot => {
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));

        // Si no hay productos, devolver array vacío
        if (products.length === 0) {
          return of([]);
        }

        // Obtener información de productores para cada producto
        const producersPromises = products.map(product => {
          if (!product.producerId) {
            return of({ ...product, producerName: 'Productor no especificado' });
          }
          
          return from(getDoc(doc(this.firestore, 'producers', product.producerId))).pipe(
            map(producerDoc => {
              const producerData = producerDoc.exists() ? producerDoc.data() as Producer : null;
              return {
                ...product,
                producerName: producerData?.name || producerData?.displayName || 'Productor no encontrado'
              };
            })
          );
        });

        return forkJoin(producersPromises);
      })
    );
  }

  getProductsSignal() {
    return this.products;
  }

  /**
   * Obtener producto por ID
   */
  getProductById(id: string): Observable<Product | undefined> {
    const productRef = doc(this.firestore, 'products', id);
    return from(getDoc(productRef)).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          return {
            id: docSnapshot.id,
            ...docSnapshot.data()
          } as Product;
        }
        return undefined;
      })
    );
  }

  /**
   * Buscar productos
   */
  searchProducts(searchTerm: string): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => 
        products.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.province.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }

  /**
   * Filtrar por categoría
   */
  filterByCategory(category: string): Observable<Product[]> {
    const q = query(
      collection(this.firestore, 'products'),
      where('isActive', '==', true),
      where('category', '==', category),
      orderBy('name', 'asc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product))
      )
    );
  }

  /**
   * Obtener productos agrupados por categoría
   */
  getProductsByCategory(): Observable<{category: string, products: Product[]}[]> {
    return this.getProducts().pipe(
      map(products => {
        const categoriesMap = new Map<string, Product[]>();
        
        products.forEach(product => {
          const category = product.category;
          if (!categoriesMap.has(category)) {
            categoriesMap.set(category, []);
          }
          categoriesMap.get(category)!.push(product);
        });

        const categorizedProducts = Array.from(categoriesMap.entries()).map(([category, products]) => ({
          category,
          products: products.sort((a, b) => a.name.localeCompare(b.name))
        }));

        // Ordenar las categorías
        categorizedProducts.sort((a, b) => a.category.localeCompare(b.category));

        return categorizedProducts;
      })
    );
  }

  /**
   * Obtener productos por productor
   */
  getProductsByProducer(producerId: string): Observable<Product[]> {
    const q = query(
      collection(this.firestore, 'products'),
      where('producerId', '==', producerId),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product))
      )
    );
  }

  /**
   * Desactivar producto (solo superadmin)
   */
  deactivateProduct(productId: string): Observable<void> {
    return this.updateProduct(productId, { isActive: false });
  }

  /**
   * Activar producto (solo superadmin)
   */
  activateProduct(productId: string): Observable<void> {
    return this.updateProduct(productId, { isActive: true });
  }

  /**
   * Obtener categorías únicas
   */
  getCategories(): Observable<string[]> {
    return this.getProducts().pipe(
      map(products => {
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        return uniqueCategories.sort();
      })
    );
  }

  /**
   * Obtener stock disponible de un producto
   */
  getProductAvailability(productId: string): Observable<number> {
    return this.inventoryService.getAvailableStock(productId);
  }

  /**
   * Actualizar disponibilidad del producto basado en inventario
   */
  updateProductAvailability(productId: string): Observable<void> {
    return this.getProductAvailability(productId).pipe(
      switchMap(availability => 
        this.updateProduct(productId, { availability })
      )
    );
  }

  /**
   * Obtener productos con bajo stock
   */
  getLowStockProducts(threshold: number = 10): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => 
        products.filter(product => product.availability <= threshold)
      )
    );
  }

  /**
   * Obtener productos activos (alias para getProducts para compatibilidad)
   */
  getActiveProducts(): Observable<Product[]> {
    return this.getProducts();
  }
}