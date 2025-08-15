export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    userType: 'buyer' | 'superadmin';
    phone?: string;
    address?: string;
    isVerified?: boolean;
    preferences?: {
        notifications: boolean;
        language: string;
        currency: string;
    };
    createdAt: any; // Firestore timestamp
    lastLogin: any; // Firestore timestamp
}

// Modelo para productores (manejados por superadmin)
export interface Producer {
    id: string;
    name: string;
    displayName?: string;
    email?: string;
    phone?: string;
    address: string;
    province: string;
    logoUrl?: string;
    companyName?: string;
    productName?: string;
    type?: string;
    contactInfo?: {
        phone?: string;
        email?: string;
        address?: string;
    };
    certifications: string[];
    registeredBy: string; // UID del superadmin que lo registró
    registeredAt: any; // Firestore timestamp
    isActive: boolean;
    products?: string[]; // IDs de productos
}
