import prisma from '../../config/prisma.js';

export const getAllSessions = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user.userId || req.user.id;

    const whereClause = role === 'ADMIN' ? {} : { userId: parseInt(userId) };

    const sessions = await prisma.session.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        orders: {
          where: { status: 'PAID' },
          select: { grandTotal: true }
        }
      },
      orderBy: { openingTime: 'desc' }
    });

    const formatted = sessions.map(s => {
      const totalSales = s.orders.reduce((acc, o) => acc + parseFloat(o.grandTotal), 0);
      return {
        id: s.id,
        userId: s.userId,
        userName: s.user.name,
        userEmail: s.user.email,
        openingTime: s.openingTime,
        closingTime: s.closingTime,
        openingBalance: parseFloat(s.openingBalance),
        closingAmount: s.closingAmount ? parseFloat(s.closingAmount) : null,
        status: s.status,
        ordersCount: s.orders.length,
        totalSales
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getActiveSession = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const activeSession = await prisma.session.findFirst({
      where: {
        userId: parseInt(userId),
        status: 'OPEN'
      },
      include: {
        orders: {
          where: { status: 'PAID' },
          select: { grandTotal: true }
        }
      }
    });

    if (!activeSession) {
      return res.status(200).json(null);
    }

    const totalSales = activeSession.orders.reduce((acc, o) => acc + parseFloat(o.grandTotal), 0);

    res.status(200).json({
      ...activeSession,
      openingBalance: parseFloat(activeSession.openingBalance),
      closingAmount: activeSession.closingAmount ? parseFloat(activeSession.closingAmount) : null,
      totalSales,
      ordersCount: activeSession.orders.length
    });
  } catch (error) {
    next(error);
  }
};

export const openSession = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { openingBalance } = req.body;

    if (openingBalance === undefined || openingBalance === null) {
      return res.status(400).json({ error: 'Opening balance is required.' });
    }

    const existing = await prisma.session.findFirst({
      where: {
        userId: parseInt(userId),
        status: 'OPEN'
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'You already have an open session.' });
    }

    const session = await prisma.session.create({
      data: {
        userId: parseInt(userId),
        openingBalance: parseFloat(openingBalance),
        status: 'OPEN'
      }
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

export const closeSession = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { closingAmount } = req.body;

    if (closingAmount === undefined || closingAmount === null) {
      return res.status(400).json({ error: 'Closing amount is required.' });
    }

    const activeSession = await prisma.session.findFirst({
      where: {
        userId: parseInt(userId),
        status: 'OPEN'
      },
      include: {
        orders: {
          where: { status: 'PAID' },
          select: { grandTotal: true }
        }
      }
    });

    if (!activeSession) {
      return res.status(400).json({ error: 'No active session found to close.' });
    }

    const totalSales = activeSession.orders.reduce((acc, o) => acc + parseFloat(o.grandTotal), 0);
    const expectedAmount = parseFloat(activeSession.openingBalance) + totalSales;
    const discrepancy = parseFloat(closingAmount) - expectedAmount;

    const closedSession = await prisma.session.update({
      where: { id: activeSession.id },
      data: {
        status: 'CLOSED',
        closingAmount: parseFloat(closingAmount),
        closingTime: new Date()
      }
    });

    res.status(200).json({
      session: closedSession,
      summary: {
        openingBalance: parseFloat(activeSession.openingBalance),
        totalSales,
        expectedAmount,
        actualAmount: parseFloat(closingAmount),
        discrepancy,
        ordersCount: activeSession.orders.length
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await prisma.session.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orders: {
          where: { status: 'PAID' },
          include: {
            table: true,
            customer: true
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    const totalSales = session.orders.reduce((acc, o) => acc + parseFloat(o.grandTotal), 0);
    const expectedAmount = parseFloat(session.openingBalance) + totalSales;
    const closingAmount = session.closingAmount ? parseFloat(session.closingAmount) : null;
    const discrepancy = closingAmount !== null ? (closingAmount - expectedAmount) : null;

    res.status(200).json({
      id: session.id,
      status: session.status,
      user: session.user,
      openingTime: session.openingTime,
      closingTime: session.closingTime,
      openingBalance: parseFloat(session.openingBalance),
      closingAmount,
      expectedAmount,
      discrepancy,
      totalSales,
      ordersCount: session.orders.length,
      orders: session.orders
    });
  } catch (error) {
    next(error);
  }
};
