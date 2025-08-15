import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { Firebase } from './firebase';

export interface Activity {
  id?: string;
  type: 'producer' | 'product' | 'inventory' | 'order' | 'user';
  icon: string;
  description: string;
  timestamp: Date;
  userId: string;
  entityId?: string;
  metadata?: { [key: string]: any };
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private readonly firebase = inject(Firebase);
  private readonly collectionName = 'activities';

  /**
   * Log a new activity
   */
  logActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Observable<string> {
    const activityData = {
      ...activity,
      timestamp: new Date()
    };

    return this.firebase.create<Activity>(this.collectionName, activityData);
  }

  /**
   * Get recent activities with limit
   */
  getRecentActivities(limit: number = 10): Observable<Activity[]> {
    return this.firebase.getWithQuery<Activity>(
      this.collectionName,
      'timestamp',
      'desc',
      limit
    );
  }

  /**
   * Get activities by type
   */
  getActivitiesByType(type: Activity['type'], limit: number = 50): Observable<Activity[]> {
    return this.firebase.getWhere<Activity>(
      this.collectionName,
      'type',
      '==',
      type
    ).pipe(
      map(activities => 
        activities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit)
      )
    );
  }

  /**
   * Get activities by user
   */
  getActivitiesByUser(userId: string, limit: number = 50): Observable<Activity[]> {
    return this.firebase.getWhere<Activity>(
      this.collectionName,
      'userId',
      '==',
      userId
    ).pipe(
      map(activities => 
        activities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit)
      )
    );
  }

  /**
   * Listen to real-time activity updates
   */
  listenToActivities(): Observable<Activity[]> {
    return this.firebase.listen<Activity>(this.collectionName).pipe(
      map(activities => 
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      )
    );
  }

  /**
   * Helper methods to log specific activities
   */
  logProducerRegistration(producerName: string, province: string, userId: string): Observable<string> {
    return this.logActivity({
      type: 'producer',
      icon: 'fas fa-user-plus',
      description: `Nuevo productor registrado: ${producerName} - ${province}`,
      userId,
      metadata: { producerName, province }
    });
  }

  logProductRegistration(productName: string, category: string, userId: string): Observable<string> {
    return this.logActivity({
      type: 'product',
      icon: 'fas fa-plus-circle',
      description: `Nuevo producto registrado: ${productName} (${category})`,
      userId,
      metadata: { productName, category }
    });
  }

  logInventoryEntry(productName: string, quantity: number, unit: string, userId: string): Observable<string> {
    return this.logActivity({
      type: 'inventory',
      icon: 'fas fa-truck',
      description: `Nueva entrega registrada: ${productName} - ${quantity} ${unit}`,
      userId,
      metadata: { productName, quantity, unit }
    });
  }

  logOrderCreated(orderId: string, totalAmount: number, userId: string): Observable<string> {
    return this.logActivity({
      type: 'order',
      icon: 'fas fa-shopping-cart',
      description: `Nueva orden creada por $${totalAmount.toFixed(2)}`,
      userId,
      entityId: orderId,
      metadata: { orderId, totalAmount }
    });
  }

  logUserAction(description: string, userId: string, metadata?: { [key: string]: any }): Observable<string> {
    return this.logActivity({
      type: 'user',
      icon: 'fas fa-user',
      description,
      userId,
      metadata
    });
  }

  /**
   * Get activity statistics
   */
  getActivityStats(days: number = 7): Observable<{
    total: number;
    byType: { [key: string]: number };
    dailyCount: { date: string; count: number }[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.firebase.getWhere<Activity>(
      this.collectionName,
      'timestamp',
      '>=',
      startDate
    ).pipe(
      map(activities => {
        const byType: { [key: string]: number } = {};
        const dailyCount: { [key: string]: number } = {};

        activities.forEach(activity => {
          // Count by type
          byType[activity.type] = (byType[activity.type] || 0) + 1;

          // Count by day
          const dateKey = new Date(activity.timestamp).toISOString().split('T')[0];
          dailyCount[dateKey] = (dailyCount[dateKey] || 0) + 1;
        });

        // Convert daily count to array
        const dailyCountArray = Object.entries(dailyCount)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));

        return {
          total: activities.length,
          byType,
          dailyCount: dailyCountArray
        };
      }),
      catchError(error => {
        console.error('Error getting activity stats:', error);
        return of({
          total: 0,
          byType: {},
          dailyCount: []
        });
      })
    );
  }

  /**
   * Clean old activities (older than specified days)
   */
  cleanOldActivities(olderThanDays: number = 90): Observable<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    return this.firebase.getWhere<Activity>(
      this.collectionName,
      'timestamp',
      '<',
      cutoffDate
    ).pipe(
      map(activities => {
        const deleteOperations = activities.map(activity => ({
          type: 'delete' as const,
          collection: this.collectionName,
          id: activity.id!
        }));

        if (deleteOperations.length > 0) {
          return this.firebase.batchWrite(deleteOperations);
        }
        return of(void 0);
      }),
      map(() => void 0),
      catchError(error => {
        console.error('Error cleaning old activities:', error);
        return of(void 0);
      })
    );
  }
}