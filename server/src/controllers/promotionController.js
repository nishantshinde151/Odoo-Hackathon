import prisma from '../../config/prisma.js';

export const getActivePromotions = async (req, res, next) => {
  try {
    const promotions = await prisma.promotion.findMany({
      where: { active: true }
    });

    const formatted = promotions.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      triggerQty: p.triggerQty,
      triggerValue: p.triggerValue ? parseFloat(p.triggerValue) : null,
      discountValue: parseFloat(p.discountValue),
      active: p.active
    }));

    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};
