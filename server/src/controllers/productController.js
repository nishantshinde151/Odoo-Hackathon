import prisma from '../../config/prisma.js';

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({ include: { category: true } });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, categoryId, price, taxPercentage, uom, description } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        categoryId: parseInt(categoryId),
        price: parseFloat(price),
        taxPercentage: parseFloat(taxPercentage || 5.0),
        uom: uom || 'Unit',
        description
      }
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, categoryId, price, taxPercentage, uom, description, active } = req.body;
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        price: price ? parseFloat(price) : undefined,
        taxPercentage: taxPercentage ? parseFloat(taxPercentage) : undefined,
        uom,
        description,
        active
      }
    });
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
