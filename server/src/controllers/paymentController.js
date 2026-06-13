import prisma from '../../config/prisma.js';

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
