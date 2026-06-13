import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const id = 8;
  const customerId = 4;
  const subtotal = 160;
  const tax = 8;
  const discount = 0;
  const grandTotal = 168;
  const items = [{ productId: 3, quantity: 1, unitPrice: 160, total: 160 }];
  const couponId = null;

  try {
    // Delete existing line items first
    await prisma.orderItem.deleteMany({
      where: { orderId: parseInt(id) }
    });

    // Delete existing coupon mappings first
    await prisma.orderCoupon.deleteMany({
      where: { orderId: parseInt(id) }
    });

    // Update order
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        customerId: customerId ? parseInt(customerId) : null,
        subtotal: parseFloat(subtotal || 0),
        tax: parseFloat(tax || 0),
        discount: parseFloat(discount || 0),
        grandTotal: parseFloat(grandTotal || 0),
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
      }
    });
    console.log('Order updated successfully:', order);
  } catch (error) {
    console.error('Error updating order:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
