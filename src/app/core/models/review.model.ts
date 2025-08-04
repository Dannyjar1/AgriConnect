export interface Review {
    id: string;
    orderId: string;
    buyerId: string;
    producerId: string;
    productId: string;
    ratings: {
        productQuality: number;
        deliveryTime: number;
        packaging: number;
    };
    comment?: string;
    isPublic: boolean;
    createdAt: any; // Firestore timestamp
}
