import prisma from '../../config/prisma.js';
import { getIO } from '../../config/socket.js';

export const getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { 
        orderItems: { include: { product: true } }, 
        table: { include: { floor: true } },
        customer: true
      }
    });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { sessionId, tableId, customerId, orderNumber, subtotal, tax, discount, grandTotal, items } = req.body;
    
    // Resolve session automatically if not provided
    let resolvedSessionId = sessionId;
    if (!resolvedSessionId) {
      // Find an open session for the current user (req.user is set by authMiddleware)
      const userId = req.user?.userId || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User context is missing' });
      }
      
      let activeSession = await prisma.session.findFirst({
        where: {
          userId: parseInt(userId),
          status: 'OPEN'
        }
      });
      
      if (!activeSession) {
        // Find any user first just in case
        activeSession = await prisma.session.create({
          data: {
            userId: parseInt(userId),
            openingBalance: 1000.00,
            status: 'OPEN'
          }
        });
      }
      resolvedSessionId = activeSession.id;
    }

    const uniqueOrderNumber = orderNumber || `ORD-${Date.now()}`;

    const order = await prisma.order.create({
      data: {
        sessionId: parseInt(resolvedSessionId),
        tableId: parseInt(tableId),
        customerId: customerId ? parseInt(customerId) : null,
        orderNumber: uniqueOrderNumber,
        subtotal: parseFloat(subtotal || 0),
        tax: parseFloat(tax || 0),
        discount: parseFloat(discount || 0),
        grandTotal: parseFloat(grandTotal || 0),
        status: 'DRAFT',
        orderItems: {
          create: (items || []).map(item => ({
            productId: parseInt(item.productId),
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            taxAmount: parseFloat(item.taxAmount || 0),
            discountAmount: parseFloat(item.discountAmount || 0),
            total: parseFloat(item.total)
          }))
        }
      },
      include: { 
        orderItems: { include: { product: true } }, 
        table: { include: { floor: true } },
        customer: true
      }
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

export const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customerId, subtotal, tax, discount, grandTotal, items, status } = req.body;

    // Delete existing line items first
    await prisma.orderItem.deleteMany({
      where: { orderId: parseInt(id) }
    });

    // Update order with new properties and line items
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        customerId: customerId ? parseInt(customerId) : null,
        subtotal: parseFloat(subtotal || 0),
        tax: parseFloat(tax || 0),
        discount: parseFloat(discount || 0),
        grandTotal: parseFloat(grandTotal || 0),
        status: status || undefined,
        orderItems: {
          create: (items || []).map(item => ({
            productId: parseInt(item.productId),
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            taxAmount: parseFloat(item.taxAmount || 0),
            discountAmount: parseFloat(item.discountAmount || 0),
            total: parseFloat(item.total)
          }))
        }
      },
      include: { 
        orderItems: { include: { product: true } }, 
        table: { include: { floor: true } },
        customer: true
      }
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

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "KITCHEN" | "PREPARING" | "COMPLETED" | "PAID" | "CANCELLED"
    
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { 
        orderItems: { include: { product: true } }, 
        table: { include: { floor: true } },
        customer: true
      }
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
