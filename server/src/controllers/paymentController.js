import prisma from '../../config/prisma.js';
import { sendReceiptEmail } from '../services/emailService.js';

export const processPayment = async (req, res, next) => {
  try {
    const { orderId, method, amount, transactionReference } = req.body;
    
    // Create payment entry
    const payment = await prisma.payment.create({
      data: {
        orderId: parseInt(orderId),
        method,
        amount: parseFloat(amount),
        transactionReference
      }
    });

    // Mark Order as Paid
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: 'PAID' }
    });

    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

export const getPaymentMethods = async (req, res, next) => {
  try {
    // Return configure-enabled payment methods (Cash, Card, UPI)
    res.status(200).json([
      { method: 'CASH', label: 'Cash Payment', active: true },
      { method: 'CARD', label: 'Debit/Credit Card', active: true },
      { method: 'UPI', label: 'UPI QR Codes', active: true }
    ]);
  } catch (error) {
    next(error);
  }
};

export const sendEmailReceipt = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { email } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        orderItems: { include: { product: true } },
        table: { include: { floor: true } },
        customer: true,
        payments: true,
        orderCoupons: { include: { coupon: true } }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const recipientEmail = email || order.customer?.email;
    if (!recipientEmail) {
      return res.status(400).json({ error: 'No recipient email address found. Please specify an email.' });
    }

    const result = await sendReceiptEmail(order, recipientEmail);

    res.status(200).json({
      message: 'Email receipt sent successfully.',
      recipient: recipientEmail,
      previewUrl: result.previewUrl
    });
  } catch (error) {
    next(error);
  }
};
// Reload SMTP config
