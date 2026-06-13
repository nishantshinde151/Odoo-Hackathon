import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing database...');
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderCoupon.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.table.deleteMany({});
  await prisma.floor.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.promotion.deleteMany({});

  console.log('Seeding default users...');
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

  console.log('Seeding categories...');
  const coffeeCat = await prisma.category.create({
    data: { name: 'Coffee', color: '#6F4E37' },
  });
  const snackCat = await prisma.category.create({
    data: { name: 'Snacks', color: '#D2B48C' },
  });
  const dessertCat = await prisma.category.create({
    data: { name: 'Desserts', color: '#FFB6C1' },
  });
  const drinkCat = await prisma.category.create({
    data: { name: 'Drinks', color: '#87CEEB' },
  });

  console.log('Seeding products...');
  await prisma.product.createMany({
    data: [
      { name: 'Espresso', price: 120.00, categoryId: coffeeCat.id, taxPercentage: 5.00, uom: 'Cup', description: 'Strong black coffee' },
      { name: 'Cappuccino', price: 150.00, categoryId: coffeeCat.id, taxPercentage: 5.00, uom: 'Cup', description: 'Espresso with steamed milk foam' },
      { name: 'Latte', price: 160.00, categoryId: coffeeCat.id, taxPercentage: 5.00, uom: 'Cup', description: 'Espresso with lots of steamed milk' },
      { name: 'Club Sandwich', price: 180.00, categoryId: snackCat.id, taxPercentage: 5.00, uom: 'Plate', description: 'Toasted sandwich with chicken and bacon' },
      { name: 'French Fries', price: 100.00, categoryId: snackCat.id, taxPercentage: 5.00, uom: 'Plate', description: 'Crispy golden potato fries' },
      { name: 'Chocolate Fudge', price: 220.00, categoryId: dessertCat.id, taxPercentage: 5.00, uom: 'Slice', description: 'Decadent chocolate cake slice' },
      { name: 'Apple Pie', price: 190.00, categoryId: dessertCat.id, taxPercentage: 5.00, uom: 'Slice', description: 'Warm apple pie' },
      { name: 'Iced Tea', price: 90.00, categoryId: drinkCat.id, taxPercentage: 5.00, uom: 'Glass', description: 'Chilled peach iced tea' },
      { name: 'Lemonade', price: 80.00, categoryId: drinkCat.id, taxPercentage: 5.00, uom: 'Glass', description: 'Freshly squeezed lemonade' },
    ],
  });

  console.log('Seeding floors and tables...');
  const mainFloor = await prisma.floor.create({
    data: { name: 'Main Floor' },
  });
  const terrace = await prisma.floor.create({
    data: { name: 'Terrace' },
  });

  await prisma.table.createMany({
    data: [
      { tableNumber: 'T01', seatsCount: 2, floorId: mainFloor.id },
      { tableNumber: 'T02', seatsCount: 4, floorId: mainFloor.id },
      { tableNumber: 'T03', seatsCount: 4, floorId: mainFloor.id },
      { tableNumber: 'T04', seatsCount: 6, floorId: mainFloor.id },
      { tableNumber: 'B01', seatsCount: 2, floorId: terrace.id },
      { tableNumber: 'B02', seatsCount: 4, floorId: terrace.id },
    ],
  });

  console.log('Seeding coupons...');
  await prisma.coupon.createMany({
    data: [
      { code: 'WELCOME10', discountType: 'PERCENTAGE', discountValue: 10.00, expirationDate: new Date('2027-12-31') },
      { code: 'FLAT50', discountType: 'FIXED', discountValue: 50.00, expirationDate: new Date('2027-12-31') },
    ],
  });

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
