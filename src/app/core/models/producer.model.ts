import { User } from "./user.model";

export interface Producer extends User {
    businessName: string;
    farmSize: number;
    location: {
        latitude: number;
        longitude: number;
    };
    certifications: string[];
    performanceMetrics: {
        totalSales: number;
        completedOrders: number;
        rating: number;
    };
    bankInfo: {
        accountNumber: string;
        bankName: string;
    };
    rotationScore: number;
    isActive: boolean;
}
