/**
 * Helcim Payment Integration
 * Payment link generation and processing
 */
export interface HelcimPaymentRequest {
    amount: number;
    currency: string;
    description: string;
    customerEmail?: string;
    customerName?: string;
    metadata?: Record<string, string>;
}
export interface HelcimPaymentLink {
    id: string;
    url: string;
    amount: number;
    status: 'pending' | 'paid' | 'failed' | 'cancelled';
    expiresAt: string;
}
export declare function createPaymentLink(request: HelcimPaymentRequest): Promise<HelcimPaymentLink>;
export declare function getPaymentStatus(paymentId: string): Promise<HelcimPaymentLink>;
export declare function handleHelcimWebhook(payload: any): {
    eventType: string;
    paymentId: string;
    status: string;
};
//# sourceMappingURL=helcim.d.ts.map