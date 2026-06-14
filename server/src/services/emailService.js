import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  } else {
    console.log('No SMTP configuration found in environment variables. Attempting to set up Ethereal SMTP...');
    // Ethereal SMTP test account creation can fail if their API is offline (e.g. 502 Bad Gateway)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
  return transporter;
};

export const sendReceiptEmail = async (order, recipientEmail) => {
  try {
    const activeTransporter = await getTransporter();

    // Format order date
    const orderDate = new Date(order.createdAt).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    // Build items HTML
    const itemsHtml = (order.orderItems || []).map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0e9e4; color: #4a3e3d; font-size: 14px;">
          <strong style="color: #231510;">${item.quantity}x</strong> ${item.product?.name || 'Unknown Item'}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0e9e4; text-align: right; color: #231510; font-size: 14px; font-weight: bold;">
          ₹${parseFloat(item.total).toFixed(2)}
        </td>
      </tr>
    `).join('');

    // Payment methods breakdown
    const paymentsHtml = (order.payments || []).map(p => `
      <div style="font-size: 13px; color: #6b5a51; margin-top: 4px;">
        <strong>Method:</strong> ${p.method} ${p.transactionReference ? `(Ref: ${p.transactionReference})` : ''}
      </div>
    `).join('');

    const discountRow = parseFloat(order.discount) > 0 ? `
      <tr>
        <td style="padding: 6px 0; color: #10b981; font-weight: bold;">Discount</td>
        <td style="padding: 6px 0; text-align: right; color: #10b981; font-weight: bold;">-₹${parseFloat(order.discount).toFixed(2)}</td>
      </tr>
    ` : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Receipt - Caffine Cafe</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #faf8f6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 540px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(35, 21, 16, 0.05);
            border: 1px solid #f0e9e4;
          }
          .header {
            background-color: #231510;
            padding: 32px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 1px;
          }
          .header p {
            color: #d9c3b0;
            margin: 4px 0 0 0;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .body {
            padding: 32px;
          }
          .receipt-info {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px dashed #f0e9e4;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .info-col {
            flex: 1;
          }
          .info-col.right {
            text-align: right;
          }
          .info-label {
            font-size: 10px;
            font-weight: bold;
            color: #a0887d;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
          }
          .info-value {
            font-size: 14px;
            color: #231510;
            font-weight: bold;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .totals-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            border-top: 2px solid #231510;
            padding-top: 20px;
          }
          .grand-total-row td {
            padding: 16px 0 0 0;
            color: #8a583c;
            font-size: 18px;
            font-weight: 900;
          }
          .footer {
            background-color: #faf8f6;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #f0e9e4;
          }
          .footer p {
            color: #8b7368;
            font-size: 12px;
            margin: 0 0 8px 0;
            font-weight: 600;
          }
          .footer span {
            color: #a0887d;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CAFFINE CAFE</h1>
            <p>Downtown Branch</p>
          </div>
          <div class="body">
            <div class="receipt-info" style="display: table; width: 100%;">
              <div style="display: table-cell; width: 50%;">
                <div class="info-label">Invoice To</div>
                <div class="info-value">${order.customer?.name || 'Walk-in Customer'}</div>
                ${order.customer?.phone ? `<div style="font-size: 12px; color: #8b7368; margin-top: 2px;">${order.customer.phone}</div>` : ''}
              </div>
              <div style="display: table-cell; width: 50%; text-align: right;">
                <div class="info-label">Receipt Code</div>
                <div class="info-value">${order.orderNumber}</div>
                <div style="font-size: 11px; color: #8b7368; margin-top: 2px;">${orderDate}</div>
                <div style="font-size: 11px; color: #8a583c; font-weight: bold; margin-top: 2px;">Table ${order.table?.tableNumber || 'Takeaway'} (${order.table?.floor?.name || ''})</div>
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr style="border-bottom: 2px solid #f0e9e4;">
                  <th style="text-align: left; padding-bottom: 10px; color: #a0887d; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Item</th>
                  <th style="text-align: right; padding-bottom: 10px; color: #a0887d; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <table class="totals-table">
              <tbody>
                <tr>
                  <td style="padding: 6px 0; color: #6b5a51; font-size: 13px; font-weight: 500;">Subtotal</td>
                  <td style="padding: 6px 0; text-align: right; color: #231510; font-size: 13px; font-weight: bold;">₹${parseFloat(order.subtotal).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b5a51; font-size: 13px; font-weight: 500;">GST Tax (5%)</td>
                  <td style="padding: 6px 0; text-align: right; color: #231510; font-size: 13px; font-weight: bold;">₹${parseFloat(order.tax).toFixed(2)}</td>
                </tr>
                ${discountRow}
                <tr class="grand-total-row">
                  <td style="padding-top: 14px; font-weight: 900; font-size: 16px; color: #231510; border-top: 1px solid #f0e9e4;">Total Paid</td>
                  <td style="padding-top: 14px; text-align: right; font-weight: 900; font-size: 18px; color: #8a583c; border-top: 1px solid #f0e9e4;">₹${parseFloat(order.grandTotal).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f0e9e4;">
              <div class="info-label" style="margin-bottom: 6px;">Payment Summary</div>
              ${paymentsHtml}
            </div>
          </div>
          <div class="footer">
            <p>Thank you for dining with us!</p>
            <span>If you have questions about this bill, please contact support@caffinecafe.com</span>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Caffine Cafe" <${process.env.SMTP_USER || 'no-reply@caffinecafe.com'}>`,
      to: recipientEmail,
      subject: `Your Receipt from Caffine Cafe - ${order.orderNumber}`,
      html: htmlContent
    };

    const info = await activeTransporter.sendMail(mailOptions);
    
    let previewUrl = null;
    if (!process.env.SMTP_HOST) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`Email sent successfully! Ethereal Preview URL: ${previewUrl}`);
    }

    return {
      messageId: info.messageId,
      previewUrl,
      simulated: false
    };
  } catch (error) {
    console.error('Failed to send receipt email via SMTP/Ethereal:', error);
    
    // Log simulation details clearly to terminal console
    console.log(`\n================ [SIMULATED EMAIL RECEIPT] ================`);
    console.log(`TO:       ${recipientEmail}`);
    console.log(`SUBJECT:  Your Receipt from Caffine Cafe - ${order.orderNumber}`);
    console.log(`ORDER ID: ${order.orderNumber}`);
    console.log(`ITEMS:`);
    (order.orderItems || []).forEach(item => {
      console.log(`  - ${item.quantity}x ${item.product?.name || 'Unknown Item'} (₹${parseFloat(item.total).toFixed(2)})`);
    });
    console.log(`TOTAL PAID: ₹${parseFloat(order.grandTotal).toFixed(2)}`);
    console.log(`===========================================================\n`);

    return {
      messageId: `simulated-${Date.now()}`,
      previewUrl: null,
      simulated: true
    };
  }
};
