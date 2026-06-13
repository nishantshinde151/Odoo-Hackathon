import prisma from '../../config/prisma.js';

export const getSalesReport = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'PAID' }
    });

    const totalRevenue = orders.reduce((acc, curr) => acc + parseFloat(curr.grandTotal), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.status(200).json({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      sales: orders.map(ord => ({
        orderNo: ord.orderNumber,
        amount: ord.grandTotal,
        date: ord.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};
