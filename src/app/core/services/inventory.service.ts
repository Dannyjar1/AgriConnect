import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map, combineLatest, switchMap } from 'rxjs';
import { InventoryEntry } from '../models/product.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  /**
   * Registrar entrada de producto al inventario (solo superadmin)
   */
  registerInventoryEntry(entryData: Omit<InventoryEntry, 'id' | 'registeredBy' | 'registeredAt' | 'status'>): Observable<string> {
    return from(this.authService.currentUser$).pipe(
      switchMap(user => {
        if (!user || user.userType !== 'superadmin') {
          throw new Error('Solo los superadmin pueden registrar entradas de inventario');
        }

        const entry: Omit<InventoryEntry, 'id'> = {
          ...entryData,
          registeredBy: user.uid,
          registeredAt: new Date(),
          status: 'received'
        };

        return from(addDoc(collection(this.firestore, 'inventory'), entry)).pipe(
          map(docRef => docRef.id)
        );
      })
    );
  }

  /**
   * Obtener todas las entradas de inventario
   */
  getInventoryEntries(): Observable<InventoryEntry[]> {
    const q = query(
      collection(this.firestore, 'inventory'),
      orderBy('registeredAt', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as InventoryEntry))
      )
    );
  }

  /**
   * Obtener entradas de inventario por producto
   */
  getInventoryByProduct(productId: string): Observable<InventoryEntry[]> {
    const q = query(
      collection(this.firestore, 'inventory'),
      where('productId', '==', productId),
      orderBy('registeredAt', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as InventoryEntry))
      )
    );
  }

  /**
   * Obtener entradas de inventario por productor
   */
  getInventoryByProducer(producerId: string): Observable<InventoryEntry[]> {
    const q = query(
      collection(this.firestore, 'inventory'),
      where('producerId', '==', producerId),
      orderBy('registeredAt', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as InventoryEntry))
      )
    );
  }

  /**
   * Obtener stock disponible por producto
   */
  getAvailableStock(productId: string): Observable<number> {
    const q = query(
      collection(this.firestore, 'inventory'),
      where('productId', '==', productId),
      where('status', 'in', ['received', 'in_stock'])
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        let totalStock = 0;
        snapshot.docs.forEach(doc => {
          const entry = doc.data() as InventoryEntry;
          totalStock += entry.quantity;
        });
        return totalStock;
      })
    );
  }

  /**
   * Actualizar estado de entrada de inventario (solo superadmin)
   */
  updateInventoryStatus(entryId: string, status: InventoryEntry['status']): Observable<void> {
    return from(this.authService.currentUser$).pipe(
      switchMap(user => {
        if (!user || user.userType !== 'superadmin') {
          throw new Error('Solo los superadmin pueden actualizar el inventario');
        }

        const entryRef = doc(this.firestore, 'inventory', entryId);
        return from(updateDoc(entryRef, { status }));
      })
    );
  }

  /**
   * Actualizar cantidad en inventario (para ventas)
   */
  updateInventoryQuantity(entryId: string, newQuantity: number): Observable<void> {
    return from(this.authService.currentUser$).pipe(
      switchMap(user => {
        if (!user || user.userType !== 'superadmin') {
          throw new Error('Solo los superadmin pueden actualizar cantidades');
        }

        const entryRef = doc(this.firestore, 'inventory', entryId);
        return from(updateDoc(entryRef, { quantity: newQuantity }));
      })
    );
  }

  /**
   * Obtener resumen de inventario por categoría
   */
  getInventorySummaryByCategory(): Observable<{category: string, totalQuantity: number, totalValue: number}[]> {
    return from(getDocs(collection(this.firestore, 'inventory'))).pipe(
      map(snapshot => {
        const categoryMap = new Map<string, {quantity: number, value: number}>();
        
        snapshot.docs.forEach(doc => {
          const entry = doc.data() as InventoryEntry;
          if (entry.status === 'received' || entry.status === 'in_stock') {
            // Necesitaríamos obtener la categoría del producto aquí
            // Por simplicidad, usaremos una categoría genérica
            const category = 'General'; // TODO: obtener de producto
            
            if (!categoryMap.has(category)) {
              categoryMap.set(category, {quantity: 0, value: 0});
            }
            
            const current = categoryMap.get(category)!;
            current.quantity += entry.quantity;
            current.value += entry.totalValue;
          }
        });

        return Array.from(categoryMap.entries()).map(([category, data]) => ({
          category,
          totalQuantity: data.quantity,
          totalValue: data.value
        }));
      })
    );
  }

  /**
   * Obtener entradas próximas a vencer
   */
  getExpiringEntries(daysAhead: number = 7): Observable<InventoryEntry[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return from(getDocs(collection(this.firestore, 'inventory'))).pipe(
      map(snapshot => 
        snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as InventoryEntry))
          .filter(entry => {
            if (!entry.expirationDate || entry.status !== 'in_stock') return false;
            
            const expirationDate = entry.expirationDate.toDate ? 
              entry.expirationDate.toDate() : 
              new Date(entry.expirationDate);
            
            return expirationDate <= futureDate;
          })
          .sort((a, b) => {
            const dateA = a.expirationDate.toDate ? a.expirationDate.toDate() : new Date(a.expirationDate);
            const dateB = b.expirationDate.toDate ? b.expirationDate.toDate() : new Date(b.expirationDate);
            return dateA.getTime() - dateB.getTime();
          })
      )
    );
  }
}