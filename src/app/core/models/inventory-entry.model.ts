export interface InventoryEntry {
  id: string;
  productId: string;
  productName: string;
  producerId: string;
  producerName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalValue: number;
  expirationDate?: Date;
  deliveryDate?: Date;
  batchNumber?: string;
  location?: string;
  status: 'available' | 'reserved' | 'sold' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryMovement {
  id: string;
  entryId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  performedBy: string;
  timestamp: Date;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  expiringSoonItems: number;
}