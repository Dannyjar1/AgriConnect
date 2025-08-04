export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    userType: 'producer' | 'buyer' | 'institutional';
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
