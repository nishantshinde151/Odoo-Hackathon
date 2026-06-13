import prisma from '../../config/prisma.js';

export const getAllTables = async (req, res, next) => {
  try {
    const tables = await prisma.table.findMany({
      include: {
        floor: true,
        orders: {
          where: {
            status: {
              in: ['DRAFT', 'KITCHEN', 'PREPARING', 'COMPLETED']
            }
          },
          include: {
            customer: true
          }
        }
      }
    });
    res.status(200).json(tables);
  } catch (error) {
    next(error);
  }
};

export const createTable = async (req, res, next) => {
  try {
    const { tableNumber, floorId, seatsCount } = req.body;
    
    if (!tableNumber) {
      return res.status(400).json({ error: 'Table number is required' });
    }
    if (!floorId) {
      return res.status(400).json({ error: 'Floor ID is required' });
    }

    const table = await prisma.table.create({
      data: {
        tableNumber,
        floorId: parseInt(floorId),
        seatsCount: parseInt(seatsCount || 4),
        active: true
      },
      include: { floor: true }
    });
    res.status(201).json(table);
  } catch (error) {
    next(error);
  }
};

export const updateTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tableNumber, floorId, seatsCount, active } = req.body;

    const table = await prisma.table.update({
      where: { id: parseInt(id) },
      data: {
        tableNumber,
        floorId: floorId ? parseInt(floorId) : undefined,
        seatsCount: seatsCount !== undefined ? parseInt(seatsCount) : undefined,
        active: active !== undefined ? active : undefined
      },
      include: { floor: true }
    });
    res.status(200).json(table);
  } catch (error) {
    next(error);
  }
};

export const deleteTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.table.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
