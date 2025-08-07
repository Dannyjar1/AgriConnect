export interface Product {
    id: string;
    producerId?: string;
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
    province?: string; // Provincia de origen del producto
    certifications: string[];
    traceability?: {
        batch?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
        harvestMethod?: string;
    };
    createdAt?: any; // Firestore timestamp
    updatedAt?: any; // Firestore timestamp
}
