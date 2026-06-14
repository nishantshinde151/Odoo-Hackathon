import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Clean existing data
  await prisma.orderCoupon.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.table.deleteMany({});
  await prisma.floor.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.promotion.deleteMany({});

  // 2. Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const employeePassword = await bcrypt.hash('employee123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@cafe.com',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const employee = await prisma.user.create({
    data: {
      email: 'employee@cafe.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
    },
  });

  console.log('Created Users:', { admin: admin.email, employee: employee.email });

  // 3. Create Categories
  const categoryBeverages = await prisma.category.create({
    data: { name: 'Beverages', color: '#3b82f6' },
  });

  const categorySnacks = await prisma.category.create({
    data: { name: 'Snacks', color: '#f59e0b' },
  });

  const categoryDesserts = await prisma.category.create({
    data: { name: 'Desserts', color: '#ec4899' },
  });

  console.log('Created Categories');

  // 4. Create Products
  const products = [
    { name: 'Espresso', price: 3.50, categoryId: categoryBeverages.id, description: 'Rich double shot of espresso' },
    { name: 'Cappuccino', price: 4.50, categoryId: categoryBeverages.id, description: 'Espresso with steamed milk foam' },
    { name: 'Latte', price: 4.75, categoryId: categoryBeverages.id, description: 'Espresso with steamed milk' },
    { name: 'Iced Coffee', price: 4.00, categoryId: categoryBeverages.id, description: 'Chilled coffee served over ice' },
    { name: 'Croissant', price: 3.00, categoryId: categorySnacks.id, description: 'Buttery flaky French pastry' },
    { name: 'Blueberry Muffin', price: 3.50, categoryId: categorySnacks.id, description: 'Soft muffin packed with fresh blueberries' },
    { name: 'Club Sandwich', price: 7.50, categoryId: categorySnacks.id, description: 'Toasted sandwich with chicken and bacon' },
    { name: 'Chocolate Cake Slice', price: 5.50, categoryId: categoryDesserts.id, description: 'Rich double chocolate layer cake' },
    { name: 'New York Cheesecake', price: 6.00, categoryId: categoryDesserts.id, description: 'Creamy cheesecake on graham cracker crust' },
  ];

  for (const prod of products) {
    await prisma.product.create({
      data: {
        name: prod.name,
        categoryId: prod.categoryId,
        price: prod.price,
        taxPercentage: 5.0,
        uom: 'Unit',
        description: prod.description,
        active: true,
      },
    });
  }

  console.log('Created Products');

  // 5. Create Floors and Tables
  const groundFloor = await prisma.floor.create({
    data: { name: 'Ground Floor' },
  });

  const rooftop = await prisma.floor.create({
    data: { name: 'Rooftop' },
  });

  const tables = [
    { floorId: groundFloor.id, tableNumber: 'T1', seatsCount: 4 },
    { floorId: groundFloor.id, tableNumber: 'T2', seatsCount: 2 },
    { floorId: groundFloor.id, tableNumber: 'T3', seatsCount: 6 },
    { floorId: rooftop.id, tableNumber: 'R1', seatsCount: 4 },
    { floorId: rooftop.id, tableNumber: 'R2', seatsCount: 4 },
  ];

  for (const tbl of tables) {
    await prisma.table.create({
      data: {
        floorId: tbl.floorId,
        tableNumber: tbl.tableNumber,
        seatsCount: tbl.seatsCount,
        active: true,
      },
    });
  }

  console.log('Created Floors & Tables');

  // 6. Create Coupons
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10.00,
      expirationDate: nextMonth,
      active: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'FLAT50',
      discountType: 'FIXED',
      discountValue: 50.00,
      expirationDate: nextMonth,
      active: true,
    },
  });

  console.log('Created Coupons');
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
