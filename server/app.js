import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorMiddleware } from './src/middlewares/errorMiddleware.js';

// Route Imports
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import customerRoutes from './src/routes/customerRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import floorRoutes from './src/routes/floorRoutes.js';
import tableRoutes from './src/routes/tableRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public/ directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Base routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/tables', tableRoutes);

// Error Handler Middleware
app.use(errorMiddleware);

export default app;
