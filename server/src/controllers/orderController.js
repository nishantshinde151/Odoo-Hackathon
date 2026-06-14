import prisma from '../../config/prisma.js';
import { getIO } from '../../config/socket.js';

export const getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { 
        orderItems: { include: { product: true } }, 
        table: { include: { floor: true } },
        customer: true,
        orderCoupons: { include: { coupon: true } }
      }
    });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { sessionId, tableId, customerId, orderNumber, subtotal, tax, discount, grandTotal, items, couponId } = req.body;
    
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
        return res.status(400).json({ error: 'No active open session found. Please open a session first.' });
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
        },
        orderCoupons: couponId ? {
          create: [{ couponId: parseInt(couponId) }]
        } : undefined
      },
      include: { 
        orderItems: { include: { product: true } }, 
        table: { include: { floor: true } },
        customer: true,
        orderCoupons: { include: { coupon: true } }
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
    const { customerId, subtotal, tax, discount, grandTotal, items, status, couponId } = req.body;

    // Restrict cooking status modifications to ADMIN or KITCHEN roles
    if (status && ['PREPARING', 'COMPLETED'].includes(status) && req.user?.role !== 'ADMIN' && req.user?.role !== 'KITCHEN') {
      return res.status(403).json({ error: 'Access denied: staff cannot modify cooking status.' });
    }

    // Delete existing line items first
    await prisma.orderItem.deleteMany({
      where: { orderId: parseInt(id) }
    });

    // Delete existing coupon mappings first
    await prisma.orderCoupon.deleteMany({
      where: { orderId: parseInt(id) }
    });

    // Update order with new properties, line items, and coupon
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
        },
        orderCoupons: couponId ? {
          create: [{ couponId: parseInt(couponId) }]
        } : undefined
      },
      include: { 
        orderItems: { include: { product: true } }, 
        table: { include: { floor: true } },
        customer: true,
        orderCoupons: { include: { coupon: true } }
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
    
    // Restrict cooking status modifications to ADMIN or KITCHEN roles
    if (status && ['PREPARING', 'COMPLETED'].includes(status) && req.user?.role !== 'ADMIN' && req.user?.role !== 'KITCHEN') {
      return res.status(403).json({ error: 'Access denied: staff cannot modify cooking status.' });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { 
        orderItems: { include: { product: true } }, 
        table: { include: { floor: true } },
        customer: true,
        orderCoupons: { include: { coupon: true } }
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

export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.status !== 'DRAFT' && order.status !== 'CANCELLED') {
      return res.status(400).json({ error: 'Only draft or cancelled orders can be deleted to maintain audit integrity.' });
    }

    // Delete associated line items first
    await prisma.orderItem.deleteMany({
      where: { orderId }
    });

    // Delete associated coupon mappings
    await prisma.orderCoupon.deleteMany({
      where: { orderId }
    });

    // Delete the order itself
    await prisma.order.delete({
      where: { id: orderId }
    });

    // Broadcast update so floor layout resets immediately
    try {
      const io = getIO();
      io.emit('pos:order_status_update', { id: orderId, status: 'DELETED', tableId: order.tableId });
    } catch (wsError) {
      console.warn('WebSocket notification failed during delete:', wsError.message);
    }

    res.status(200).json({ message: 'Order deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: { include: { product: true } },
        table: { include: { floor: true } },
        customer: true,
        orderCoupons: { include: { coupon: true } }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};
