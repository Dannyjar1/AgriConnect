export interface Product {
    id: string;
    producerId: string;
    name: string;
    category: string;
    description: string;
    images: string[];
    price: {
        perUnit: number;
        minOrder: number;
        maxOrder: number;
    };
    availability: number;
    certifications: string[];
    traceability: {
        batch: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
        harvestMethod: string;
    };
    createdAt: any; // Firestore timestamp
    updatedAt: any; // Firestore timestamp
}
