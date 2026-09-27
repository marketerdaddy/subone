import crypto from 'crypto';

export interface PaymentIntent {
  orderId: string;
  amount: number;
  currency: string;
  productId: string;
  productName: string;
  clientSecret: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  createdAt: string;
}

export interface PaymentProvider {
  createOrder(productId: string, productName: string, amount: number, currency: string, customerId: string): Promise<PaymentIntent>;
  verifyPayment(orderId: string, paymentToken: string, idempotencyKey: string): Promise<{ verified: boolean; transactionId: string; error?: string }>;
}

export class SecurePaymentProvider implements PaymentProvider {
  private transactions: Map<string, PaymentIntent> = new Map();
  private processedIdempotencyKeys: Set<string> = new Set();

  public async createOrder(
    productId: string,
    productName: string,
    amount: number,
    currency: string = 'INR',
    customerId: string
  ): Promise<PaymentIntent> {
    const orderId = 'ORD_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const clientSecret = crypto.createHmac('sha256', 'NEXUS_RUN_SECRET_KEY').update(`${orderId}:${amount}:${customerId}`).digest('hex');

    const intent: PaymentIntent = {
      orderId,
      amount,
      currency,
      productId,
      productName,
      clientSecret,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.transactions.set(orderId, intent);
    return intent;
  }

  public async verifyPayment(
    orderId: string,
    paymentToken: string,
    idempotencyKey: string
  ): Promise<{ verified: boolean; transactionId: string; error?: string }> {
    if (this.processedIdempotencyKeys.has(idempotencyKey)) {
      const existing = this.transactions.get(orderId);
      if (existing && existing.status === 'VERIFIED') {
        return { verified: true, transactionId: `TX_${orderId}_IDEMPOTENT` };
      }
      return { verified: false, transactionId: '', error: 'Duplicate transaction request detected.' };
    }

    const order = this.transactions.get(orderId);
    if (!order) {
      return { verified: false, transactionId: '', error: 'Invalid order reference.' };
    }

    if (order.status === 'VERIFIED') {
      return { verified: true, transactionId: `TX_${orderId}` };
    }

    if (!paymentToken || paymentToken.length < 4) {
      order.status = 'FAILED';
      return { verified: false, transactionId: '', error: 'Payment authorization token invalid.' };
    }

    order.status = 'VERIFIED';
    this.processedIdempotencyKeys.add(idempotencyKey);
    const transactionId = 'TXN_' + crypto.randomBytes(6).toString('hex').toUpperCase();

    return { verified: true, transactionId };
  }

  public getOrder(orderId: string): PaymentIntent | undefined {
    return this.transactions.get(orderId);
  }

  public getAllOrders(): PaymentIntent[] {
    return Array.from(this.transactions.values());
  }
}

export const paymentProvider = new SecurePaymentProvider();
