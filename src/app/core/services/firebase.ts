import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, limit, onSnapshot, writeBatch } from '@angular/fire/firestore';
import { Observable, from, map, catchError, of } from 'rxjs';

export interface FirebaseDocument {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class Firebase {
  private readonly firestore = inject(Firestore);

  /**
   * Create a new document in a collection
   */
  create<T extends FirebaseDocument>(collectionName: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Observable<string> {
    const collectionRef = collection(this.firestore, collectionName);
    const now = new Date();
    
    const documentData = {
      ...data,
      createdAt: now,
      updatedAt: now
    };

    return from(addDoc(collectionRef, documentData)).pipe(
      map(docRef => docRef.id),
      catchError(error => {
        console.error(`Error creating document in ${collectionName}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get a document by ID
   */
  getById<T extends FirebaseDocument>(collectionName: string, id: string): Observable<T | null> {
    const docRef = doc(this.firestore, collectionName, id);
    
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as T;
        }
        return null;
      }),
      catchError(error => {
        console.error(`Error getting document ${id} from ${collectionName}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Get all documents from a collection
   */
  getAll<T extends FirebaseDocument>(collectionName: string): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName);
    
    return from(getDocs(collectionRef)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as T))
      ),
      catchError(error => {
        console.error(`Error getting documents from ${collectionName}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Get documents with a query
   */
  getWhere<T extends FirebaseDocument>(
    collectionName: string, 
    field: string, 
    operator: any, 
    value: any
  ): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName);
    const q = query(collectionRef, where(field, operator, value));
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as T))
      ),
      catchError(error => {
        console.error(`Error querying documents from ${collectionName}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Get documents with ordering and limit
   */
  getWithQuery<T extends FirebaseDocument>(
    collectionName: string,
    orderByField?: string,
    direction: 'asc' | 'desc' = 'desc',
    limitCount?: number
  ): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName);
    let q = query(collectionRef);

    if (orderByField) {
      q = query(q, orderBy(orderByField, direction));
    }

    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as T))
      ),
      catchError(error => {
        console.error(`Error querying documents from ${collectionName}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Update a document
   */
  update<T extends FirebaseDocument>(
    collectionName: string, 
    id: string, 
    data: Partial<Omit<T, 'id' | 'createdAt'>>
  ): Observable<void> {
    const docRef = doc(this.firestore, collectionName, id);
    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    return from(updateDoc(docRef, updateData)).pipe(
      catchError(error => {
        console.error(`Error updating document ${id} in ${collectionName}:`, error);
        throw error;
      })
    );
  }

  /**
   * Delete a document
   */
  delete(collectionName: string, id: string): Observable<void> {
    const docRef = doc(this.firestore, collectionName, id);
    
    return from(deleteDoc(docRef)).pipe(
      catchError(error => {
        console.error(`Error deleting document ${id} from ${collectionName}:`, error);
        throw error;
      })
    );
  }

  /**
   * Listen to real-time updates on a collection
   */
  listen<T extends FirebaseDocument>(collectionName: string): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName);
    
    return new Observable(observer => {
      const unsubscribe = onSnapshot(collectionRef, {
        next: (querySnapshot) => {
          const documents = querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          } as T));
          observer.next(documents);
        },
        error: (error) => {
          console.error(`Error listening to ${collectionName}:`, error);
          observer.error(error);
        }
      });

      return () => unsubscribe();
    });
  }

  /**
   * Listen to real-time updates on a specific document
   */
  listenToDocument<T extends FirebaseDocument>(collectionName: string, id: string): Observable<T | null> {
    const docRef = doc(this.firestore, collectionName, id);
    
    return new Observable(observer => {
      const unsubscribe = onSnapshot(docRef, {
        next: (docSnap) => {
          if (docSnap.exists()) {
            observer.next({ id: docSnap.id, ...docSnap.data() } as T);
          } else {
            observer.next(null);
          }
        },
        error: (error) => {
          console.error(`Error listening to document ${id} in ${collectionName}:`, error);
          observer.error(error);
        }
      });

      return () => unsubscribe();
    });
  }

  /**
   * Batch write operations
   */
  batchWrite(operations: Array<{
    type: 'create' | 'update' | 'delete';
    collection: string;
    id?: string;
    data?: any;
  }>): Observable<void> {
    const batch = writeBatch(this.firestore);
    const now = new Date();

    operations.forEach(operation => {
      switch (operation.type) {
        case 'create':
          if (operation.data) {
            const docRef = doc(collection(this.firestore, operation.collection));
            batch.set(docRef, {
              ...operation.data,
              createdAt: now,
              updatedAt: now
            });
          }
          break;
        
        case 'update':
          if (operation.id && operation.data) {
            const docRef = doc(this.firestore, operation.collection, operation.id);
            batch.update(docRef, {
              ...operation.data,
              updatedAt: now
            });
          }
          break;
        
        case 'delete':
          if (operation.id) {
            const docRef = doc(this.firestore, operation.collection, operation.id);
            batch.delete(docRef);
          }
          break;
      }
    });

    return from(batch.commit()).pipe(
      catchError(error => {
        console.error('Error executing batch write:', error);
        throw error;
      })
    );
  }

  /**
   * Check if a document exists
   */
  exists(collectionName: string, id: string): Observable<boolean> {
    const docRef = doc(this.firestore, collectionName, id);
    
    return from(getDoc(docRef)).pipe(
      map(docSnap => docSnap.exists()),
      catchError(error => {
        console.error(`Error checking document existence ${id} in ${collectionName}:`, error);
        return of(false);
      })
    );
  }

  /**
   * Count documents in a collection
   */
  count(collectionName: string): Observable<number> {
    const collectionRef = collection(this.firestore, collectionName);
    
    return from(getDocs(collectionRef)).pipe(
      map(querySnapshot => querySnapshot.size),
      catchError(error => {
        console.error(`Error counting documents in ${collectionName}:`, error);
        return of(0);
      })
    );
  }
}