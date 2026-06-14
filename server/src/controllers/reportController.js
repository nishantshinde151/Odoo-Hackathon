import prisma from '../../config/prisma.js';

export const getSalesReport = async (req, res, next) => {
  try {
    // 1. KPI Stats
    const paidOrders = await prisma.order.findMany({
      where: { status: 'PAID' }
    });
    const totalRevenue = paidOrders.reduce((acc, curr) => acc + parseFloat(curr.grandTotal), 0);
    const paidOrdersCount = paidOrders.length;
    const averageOrderValue = paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0;

    // Total non-cancelled orders for total orders metric
    const totalOrders = await prisma.order.count({
      where: { status: { not: 'CANCELLED' } }
    });

    // Active tables count
    const totalTablesCount = await prisma.table.count({ where: { active: true } });
    const occupiedTablesCount = await prisma.table.count({
      where: {
        active: true,
        orders: {
          some: {
            status: { in: ['DRAFT', 'KITCHEN', 'PREPARING', 'COMPLETED'] }
          }
        }
      }
    });
    const activeTables = `${occupiedTablesCount}/${totalTablesCount}`;
    const activeTablesPercent = totalTablesCount > 0 ? Math.round((occupiedTablesCount / totalTablesCount) * 100) : 0;

    // 2. Sales Trends (Daily sales totals based on range parameter)
    const range = req.query.range || '7days';
    
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    
    if (range === 'today') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'month') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    }
    
    const trendOrders = await prisma.order.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: startDate }
      },
      select: {
        grandTotal: true,
        createdAt: true
      }
    });

    let salesTrends = [];
    if (range === 'today') {
      const timeBlocks = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
      const salesByBlock = {};
      timeBlocks.forEach(b => salesByBlock[b] = 0);
      
      trendOrders.forEach(ord => {
        const hr = ord.createdAt.getHours();
        let block = '08:00';
        if (hr >= 22) block = '22:00';
        else if (hr >= 20) block = '20:00';
        else if (hr >= 18) block = '18:00';
        else if (hr >= 16) block = '16:00';
        else if (hr >= 14) block = '14:00';
        else if (hr >= 12) block = '12:00';
        else if (hr >= 10) block = '10:00';
        
        salesByBlock[block] += parseFloat(ord.grandTotal);
      });
      
      const maxSales = Math.max(...Object.values(salesByBlock), 1);
      salesTrends = Object.entries(salesByBlock).map(([day, val]) => {
        const heightPercent = Math.round((val / maxSales) * 100);
        return {
          day,
          height: `${Math.max(5, heightPercent)}%`,
          value: `₹${val.toFixed(2)}`
        };
      });
      
    } else if (range === 'month') {
      const weeks = [
        { label: 'Wk 1', start: new Date(startDate) },
        { label: 'Wk 2', start: new Date(startDate) },
        { label: 'Wk 3', start: new Date(startDate) },
        { label: 'Wk 4', start: new Date(startDate) }
      ];
      
      weeks[0].end = new Date(startDate);
      weeks[0].end.setDate(weeks[0].end.getDate() + 7);
      
      weeks[1].start.setDate(weeks[1].start.getDate() + 7);
      weeks[1].end = new Date(weeks[1].start);
      weeks[1].end.setDate(weeks[1].end.getDate() + 7);
      
      weeks[2].start.setDate(weeks[2].start.getDate() + 14);
      weeks[2].end = new Date(weeks[2].start);
      weeks[2].end.setDate(weeks[2].end.getDate() + 7);
      
      weeks[3].start.setDate(weeks[3].start.getDate() + 21);
      weeks[3].end = new Date();
      weeks[3].end.setHours(23, 59, 59, 999);
      
      const salesByWeek = { 'Wk 1': 0, 'Wk 2': 0, 'Wk 3': 0, 'Wk 4': 0 };
      
      trendOrders.forEach(ord => {
        const date = ord.createdAt;
        for (let i = 0; i < 4; i++) {
          if (date >= weeks[i].start && date < weeks[i].end) {
            salesByWeek[weeks[i].label] += parseFloat(ord.grandTotal);
            break;
          }
        }
      });
      
      const maxSales = Math.max(...Object.values(salesByWeek), 1);
      salesTrends = Object.entries(salesByWeek).map(([day, val]) => {
        const heightPercent = Math.round((val / maxSales) * 100);
        return {
          day,
          height: `${Math.max(5, heightPercent)}%`,
          value: `₹${val.toFixed(2)}`
        };
      });
      
    } else {
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const salesByDay = {};
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = daysOfWeek[d.getDay()];
        salesByDay[dayName] = 0;
      }
      
      trendOrders.forEach(ord => {
        const dayName = daysOfWeek[ord.createdAt.getDay()];
        if (salesByDay[dayName] !== undefined) {
          salesByDay[dayName] += parseFloat(ord.grandTotal);
        }
      });
      
      const maxSales = Math.max(...Object.values(salesByDay), 1);
      salesTrends = Object.entries(salesByDay).map(([day, val]) => {
        const heightPercent = Math.round((val / maxSales) * 100);
        return {
          day,
          height: `${Math.max(5, heightPercent)}%`,
          value: `₹${val.toFixed(2)}`
        };
      });
    }

    // 3. Top Selling Products
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: { status: 'PAID' }
      },
      select: {
        quantity: true,
        product: {
          select: { name: true }
        }
      }
    });

    const productSales = {};
    orderItems.forEach(item => {
      if (item.product && item.product.name) {
        const name = item.product.name;
        productSales[name] = (productSales[name] || 0) + item.quantity;
      }
    });

    const sortedProducts = Object.entries(productSales)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const maxCount = sortedProducts.length > 0 ? sortedProducts[0].count : 1;
    const topProducts = sortedProducts.map(prod => ({
      name: prod.name,
      count: prod.count,
      percent: `${Math.round((prod.count / maxCount) * 100)}%`
    }));

    // 4. Recent Orders (Last 5 orders)
    const recentOrdersData = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        table: true,
        orderItems: true
      }
    });

    const recentOrders = recentOrdersData.map(ord => {
      const itemsCount = ord.orderItems.reduce((acc, curr) => acc + curr.quantity, 0);
      return {
        id: `#${ord.orderNumber.split('-')[1] || ord.orderNumber}`,
        table: ord.table ? ord.table.tableNumber : 'Takeaway',
        items: `${itemsCount} ${itemsCount === 1 ? 'Item' : 'Items'}`,
        amount: parseFloat(ord.grandTotal),
        status: ord.status === 'PAID' ? 'Completed' : 
                ord.status === 'CANCELLED' ? 'Cancelled' : 'Preparing'
      };
    });

    // 5. Employee Performance (sales rank based on paid sessions)
    const sessionsWithOrders = await prisma.session.findMany({
      include: {
        user: {
          select: { name: true }
        },
        orders: {
          where: { status: 'PAID' },
          select: { grandTotal: true }
        }
      }
    });

    const employeeSales = {};
    sessionsWithOrders.forEach(sess => {
      if (sess.user && sess.user.name) {
        const userName = sess.user.name;
        if (!employeeSales[userName]) {
          employeeSales[userName] = { name: userName, orders: 0, sales: 0 };
        }
        sess.orders.forEach(ord => {
          employeeSales[userName].orders += 1;
          employeeSales[userName].sales += parseFloat(ord.grandTotal);
        });
      }
    });

    const employees = Object.values(employeeSales)
      .filter(emp => emp.orders > 0)
      .sort((a, b) => b.sales - a.sales)
      .map((emp, index) => ({
        name: emp.name,
        orders: emp.orders,
        sales: emp.sales,
        rank: index + 1,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=8A583C&color=fff&size=100`
      }));

    res.status(200).json({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      activeTables,
      activeTablesPercent,
      salesTrends,
      topProducts,
      recentOrders,
      employees
    });
  } catch (error) {
    next(error);
  }
};
