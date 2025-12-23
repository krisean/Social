/**
 * Stripe Integration
 * Subscription management and webhook handling
 */
import Stripe from 'stripe';
export interface CreateSubscriptionRequest {
    customerEmail: string;
    priceId: string;
    metadata?: Record<string, string>;
}
export interface SubscriptionResult {
    subscriptionId: string;
    clientSecret: string;
    status: string;
}
export declare function createSubscription(request: CreateSubscriptionRequest): Promise<SubscriptionResult>;
export declare function cancelSubscription(subscriptionId: string): Promise<void>;
export declare function getSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
export declare function constructWebhookEvent(payload: string | Buffer, signature: string, webhookSecret: string): Stripe.Event;
export declare function handleStripeWebhook(event: Stripe.Event): {
    eventType: string;
    customerId?: string;
    subscriptionId?: string;
    status?: string;
};
//# sourceMappingURL=stripe.d.ts.map