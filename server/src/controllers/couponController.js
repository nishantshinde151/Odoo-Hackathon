import prisma from '../../config/prisma.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required.' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found.' });
    }

    if (!coupon.active) {
      return res.status(400).json({ error: 'This coupon is no longer active.' });
    }

    if (new Date(coupon.expirationDate) < new Date()) {
      return res.status(400).json({ error: 'This coupon has expired.' });
    }

    const sub = parseFloat(subtotal || 0);
    let discountAmount = 0;

    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = sub * (parseFloat(coupon.discountValue) / 100);
    } else if (coupon.discountType === 'FIXED') {
      discountAmount = parseFloat(coupon.discountValue);
    }

    // Discount cannot exceed the subtotal
    discountAmount = Math.min(discountAmount, sub);

    res.status(200).json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: parseFloat(coupon.discountValue)
      },
      discountAmount
    });
  } catch (error) {
    next(error);
  }
};
