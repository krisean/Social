/**
 * Stripe Integration
 * Subscription management and webhook handling
 */

import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripeClient) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('Missing Stripe API key');
    }
    stripeClient = new Stripe(apiKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return stripeClient;
}

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

export async function createSubscription(
  request: CreateSubscriptionRequest,
): Promise<SubscriptionResult> {
  const stripe = getStripeClient();

  // Create or get customer
  const customers = await stripe.customers.list({
    email: request.customerEmail,
    limit: 1,
  });

  let customer: Stripe.Customer;
  if (customers.data.length > 0) {
    customer = customers.data[0];
  } else {
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

  const invoice = subscription.latest_invoice as Stripe.Invoice;
  const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

  return {
    subscriptionId: subscription.id,
    clientSecret: paymentIntent.client_secret!,
    status: subscription.status,
  };
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const stripe = getStripeClient();
  await stripe.subscriptions.cancel(subscriptionId);
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripe = getStripeClient();
  return await stripe.subscriptions.retrieve(subscriptionId);
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string,
): Stripe.Event {
  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export function handleStripeWebhook(event: Stripe.Event): {
  eventType: string;
  customerId?: string;
  subscriptionId?: string;
  status?: string;
} {
  const { type, data } = event;

  switch (type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = data.object as Stripe.Subscription;
      return {
        eventType: type,
        customerId: subscription.customer as string,
        subscriptionId: subscription.id,
        status: subscription.status,
      };
    }
    case 'invoice.payment_succeeded':
    case 'invoice.payment_failed': {
      const invoice = data.object as Stripe.Invoice;
      return {
        eventType: type,
        customerId: invoice.customer as string,
        subscriptionId: invoice.subscription as string,
        status: invoice.status || undefined,
      };
    }
    default:
      return { eventType: type };
  }
}

