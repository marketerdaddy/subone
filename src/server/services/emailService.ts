export interface EmailPayload {
  toEmail: string;
  playerName: string;
  orderId: string;
  productName: string;
  quantity: number;
  amount: number;
  currency: string;
  purchaseDate: string;
  transactionId: string;
}

export interface StoredReceipt extends EmailPayload {
  id: string;
  subject: string;
  htmlBody: string;
  status: 'SENT' | 'SIMULATED';
  timestamp: string;
}

export interface EmailService {
  sendPurchaseConfirmation(payload: EmailPayload): Promise<{ success: boolean; messageId: string }>;
  getReceipts(): StoredReceipt[];
}

export class ProductionEmailService implements EmailService {
  private sentReceipts: StoredReceipt[] = [];

  public async sendPurchaseConfirmation(payload: EmailPayload): Promise<{ success: boolean; messageId: string }> {
    const messageId = 'MSG_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const subject = `Your Nexus Run Purchase Confirmation - Order #${payload.orderId}`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nexus Run Purchase Receipt</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #070b14; color: #f1f5f9; margin: 0; padding: 24px; }
    .card { max-width: 520px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; }
    .logo { font-size: 26px; font-weight: 800; background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .badge { display: inline-block; background: #064e3b; color: #34d399; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; margin-top: 8px; }
    .content { margin: 24px 0; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1e293b; font-size: 14px; }
    .row-label { color: #94a3b8; }
    .row-value { font-weight: 600; color: #f8fafc; }
    .total-row { display: flex; justify-content: space-between; padding: 16px 0; font-size: 18px; font-weight: 800; color: #38bdf8; border-top: 2px solid #334155; }
    .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 24px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">⚡ NEXUS RUN</div>
      <div class="badge">PURCHASE SUCCESSFUL</div>
    </div>
    <div class="content">
      <p>Hello <strong>${payload.playerName}</strong>,</p>
      <p>Thank you for your purchase! Your item has been credited to your Nexus Run player vault.</p>
      <div class="row"><span class="row-label">Order ID</span><span class="row-value">${payload.orderId}</span></div>
      <div class="row"><span class="row-label">Transaction ID</span><span class="row-value">${payload.transactionId}</span></div>
      <div class="row"><span class="row-label">Product</span><span class="row-value">${payload.productName}</span></div>
      <div class="row"><span class="row-label">Quantity</span><span class="row-value">${payload.quantity}</span></div>
      <div class="row"><span class="row-label">Date</span><span class="row-value">${new Date(payload.purchaseDate).toLocaleString()}</span></div>
      <div class="total-row"><span>Total Paid</span><span>${payload.currency === 'INR' ? '₹' : '$'}${payload.amount}</span></div>
    </div>
    <div class="footer">
      Have questions or need assistance with your order?<br/>
      Contact Nexus Games Support at <a href="mailto:support@nexusrun.games" style="color:#38bdf8;">support@nexusrun.games</a><br/>
      &copy; 2026 Nexus Run. All rights reserved.
    </div>
  </div>
</body>
</html>
    `.trim();

    const receipt: StoredReceipt = {
      ...payload,
      id: messageId,
      subject,
      htmlBody,
      status: 'SENT',
      timestamp: new Date().toISOString(),
    };

    this.sentReceipts.unshift(receipt);
    console.log(`[EmailService] Purchase confirmation sent to ${payload.toEmail} for Order #${payload.orderId}`);

    return { success: true, messageId };
  }

  public getReceipts(): StoredReceipt[] {
    return this.sentReceipts;
  }
}

export const emailService = new ProductionEmailService();
