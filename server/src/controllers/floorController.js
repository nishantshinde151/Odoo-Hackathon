import prisma from '../../config/prisma.js';

export const getAllFloors = async (req, res, next) => {
  try {
    const floors = await prisma.floor.findMany({
      include: {
        tables: {
          include: {
            orders: {
              where: {
                status: {
                  in: ['DRAFT', 'KITCHEN', 'PREPARING', 'COMPLETED']
                }
              },
              include: {
                customer: true,
                orderItems: { include: { product: true } },
                orderCoupons: { include: { coupon: true } }
              }
            }
          }
        }
      }
    });
    res.status(200).json(floors);
  } catch (error) {
    next(error);
  }
};

export const createFloor = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Floor name is required' });
    }
    const floor = await prisma.floor.create({
      data: { name, active: true }
    });
    res.status(201).json(floor);
  } catch (error) {
    next(error);
  }
};

export const updateFloor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;
    
    const floor = await prisma.floor.update({
      where: { id: parseInt(id) },
      data: {
        name,
        active: active !== undefined ? active : undefined
      }
    });
    res.status(200).json(floor);
  } catch (error) {
    next(error);
  }
};

export const deleteFloor = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // First, delete tables associated with this floor.
    await prisma.table.deleteMany({
      where: { floorId: parseInt(id) }
    });
    
    await prisma.floor.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
