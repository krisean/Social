/**
 * Stripe Integration
 * Subscription management and webhook handling
 */
import Stripe from 'stripe';
let stripeClient = null;
function getStripeClient() {
    if (!stripeClient) {
        const apiKey = process.env.STRIPE_SECRET_KEY;
        if (!apiKey) {
            throw new Error('Missing Stripe API key');
        }
        stripeClient = new Stripe(apiKey, {
            apiVersion: '2025-02-24.acacia',
        });
    }
    return stripeClient;
}
export async function createSubscription(request) {
    const stripe = getStripeClient();
    // Create or get customer
    const customers = await stripe.customers.list({
        email: request.customerEmail,
        limit: 1,
    });
    let customer;
    if (customers.data.length > 0) {
        customer = customers.data[0];
    }
    else {
        customer = await stripe.customers.create({
            email: request.customerEmail,
            metadata: request.metadata,
        });
    }
    // Create subscription
    const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: request.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
    });
    const invoice = subscription.latest_invoice;
    const paymentIntent = invoice.payment_intent;
    return {
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
        status: subscription.status,
    };
}
export async function cancelSubscription(subscriptionId) {
    const stripe = getStripeClient();
    await stripe.subscriptions.cancel(subscriptionId);
}
export async function getSubscription(subscriptionId) {
    const stripe = getStripeClient();
    return await stripe.subscriptions.retrieve(subscriptionId);
}
export function constructWebhookEvent(payload, signature, webhookSecret) {
    const stripe = getStripeClient();
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
export function handleStripeWebhook(event) {
    const { type, data } = event;
    switch (type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
            const subscription = data.object;
            return {
                eventType: type,
                customerId: subscription.customer,
                subscriptionId: subscription.id,
                status: subscription.status,
            };
        }
        case 'invoice.payment_succeeded':
        case 'invoice.payment_failed': {
            const invoice = data.object;
            return {
                eventType: type,
                customerId: invoice.customer,
                subscriptionId: invoice.subscription,
                status: invoice.status || undefined,
            };
        }
        default:
            return { eventType: type };
    }
}
//# sourceMappingURL=stripe.js.map