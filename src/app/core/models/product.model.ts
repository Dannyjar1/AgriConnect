export interface Product {
    id: string;
    producerId: string; // ID del productor
    name: string;
    category: string;
    description: string;
    images: string[];
    price: {
        perUnit: number;
        unit: string; // Unidad de medida: 'lb', 'kg', 'unidad', 'paquete', etc.
        minOrder?: number;
        maxOrder?: number;
    };
    availability: number; // Cantidad disponible
    province: string; // Provincia de origen del producto
    certifications: string[];
    traceability?: {
        batch?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
        harvestMethod?: string;
    };
    registeredBy: string; // UID del superadmin que registró el producto
    createdAt: any; // Firestore timestamp
    updatedAt: any; // Firestore timestamp
    isActive: boolean;
}

// Modelo para el inventario (entradas de productos)
export interface InventoryEntry {
    id: string;
    productId: string;
    producerId: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    totalValue: number;
    deliveryDate: any; // Firestore timestamp
    expirationDate?: any; // Firestore timestamp
    batch?: string;
    quality: 'A' | 'B' | 'C'; // Calidad del producto
    notes?: string;
    registeredBy: string; // UID del superadmin
    registeredAt: any; // Firestore timestamp
    status: 'received' | 'in_stock' | 'sold' | 'expired';
}
