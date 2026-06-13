import prisma from '../../config/prisma.js';

export const getCustomers = async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany();
    res.status(200).json(customers);
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const customer = await prisma.customer.create({
      data: { name, email, phone }
    });
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: { name, email, phone }
    });
    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.customer.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
