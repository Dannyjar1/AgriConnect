import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable, from, map, switchMap } from 'rxjs';
import { Producer } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProducerService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  /**
   * Crear un nuevo productor (solo superadmin)
   */
  createProducer(producerData: Omit<Producer, 'id' | 'registeredBy' | 'registeredAt'>): Observable<string> {
    return from(this.authService.currentUser$).pipe(
      switchMap(user => {
        if (!user || user.userType !== 'superadmin') {
          throw new Error('Solo los superadmin pueden crear productores');
        }

        const producer: Omit<Producer, 'id'> = {
          ...producerData,
          registeredBy: user.uid,
          registeredAt: new Date()
        };

        return from(addDoc(collection(this.firestore, 'producers'), producer)).pipe(
          map(docRef => docRef.id)
        );
      })
    );
  }

  /**
   * Obtener todos los productores
   */
  getProducers(): Observable<Producer[]> {
    const q = query(
      collection(this.firestore, 'producers'),
      orderBy('name', 'asc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Producer))
      )
    );
  }

  /**
   * Obtener productores activos
   */
  getActiveProducers(): Observable<Producer[]> {
    const q = query(
      collection(this.firestore, 'producers'),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Producer))
      )
    );
  }

  /**
   * Actualizar un productor (solo superadmin)
   */
  updateProducer(producerId: string, updates: Partial<Producer>): Observable<void> {
    return from(this.authService.currentUser$).pipe(
      switchMap(user => {
        if (!user || user.userType !== 'superadmin') {
          throw new Error('Solo los superadmin pueden actualizar productores');
        }

        const producerRef = doc(this.firestore, 'producers', producerId);
        return from(updateDoc(producerRef, updates));
      })
    );
  }

  /**
   * Desactivar un productor (solo superadmin)
   */
  deactivateProducer(producerId: string): Observable<void> {
    return this.updateProducer(producerId, { isActive: false });
  }

  /**
   * Activar un productor (solo superadmin)
   */
  activateProducer(producerId: string): Observable<void> {
    return this.updateProducer(producerId, { isActive: true });
  }

  /**
   * Eliminar un productor (solo superadmin)
   */
  deleteProducer(producerId: string): Observable<void> {
    return from(this.authService.currentUser$).pipe(
      switchMap(user => {
        if (!user || user.userType !== 'superadmin') {
          throw new Error('Solo los superadmin pueden eliminar productores');
        }

        const producerRef = doc(this.firestore, 'producers', producerId);
        return from(deleteDoc(producerRef));
      })
    );
  }
}