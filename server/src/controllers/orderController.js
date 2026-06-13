import prisma from '../../config/prisma.js';
import { getIO } from '../../config/socket.js';

export const getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { orderItems: { include: { product: true } }, table: true }
    });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { sessionId, tableId, customerId, orderNumber, subtotal, tax, discount, grandTotal, items } = req.body;
    
    const order = await prisma.order.create({
      data: {
        sessionId: parseInt(sessionId),
        tableId: parseInt(tableId),
        customerId: customerId ? parseInt(customerId) : null,
        orderNumber,
        subtotal: parseFloat(subtotal),
        tax: parseFloat(tax),
        discount: parseFloat(discount || 0),
        grandTotal: parseFloat(grandTotal),
        orderItems: {
          create: items.map(item => ({
            productId: parseInt(item.productId),
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            taxAmount: parseFloat(item.taxAmount || 0),
            discountAmount: parseFloat(item.discountAmount || 0),
            total: parseFloat(item.total)
          }))
        }
      },
      include: { orderItems: true, table: true }
    });

    // Notify kitchen screens via Socket.io broadcast
    try {
      const io = getIO();
      io.emit('kds:new_order', order);
    } catch (wsError) {
      console.warn('WebSocket notification failed, but order was saved:', wsError.message);
    }

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "KITCHEN" | "PREPARING" | "COMPLETED" | "PAID"
    
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { table: true }
    });

    // Broadcast update
    try {
      const io = getIO();
      io.emit('pos:order_status_update', order);
    } catch (wsError) {
      console.warn('WebSocket status update failed:', wsError.message);
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};
