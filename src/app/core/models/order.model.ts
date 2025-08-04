export interface Order {
    id: string;
    buyerId: string;
    producerId: string;
    productId: string;
    quantity: number;
    price: number;
    specialRequirements: string;
    assignmentInfo: {
        assignedAt: any; // Firestore timestamp
        assignedBy: string;
    };
    status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered';
    statusHistory: {
        status: string;
        timestamp: any; // Firestore timestamp
    }[];
    deliveryInfo: {
        address: string;
        preferredDate: any; // Firestore timestamp
        method: string;
    };
    paymentInfo: {
        method: string;
        status: 'pending' | 'paid' | 'failed';
        transactionId: string;
    };
}
