// backend/server.js
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Routes
const authRoutes = require('./src/routes/auth');
const vehicleRoutes = require('./src/routes/vehicles');
const repairRoutes = require('./src/routes/repairs');
const materialRoutes = require('./src/routes/materials');
const paymentRoutes = require('./src/routes/payments');
const reportRoutes = require('./src/routes/reports');
const notificationRoutes = require('./src/routes/notifications');

dotenv.config();
connectDB();

const app = express();

// ---- MIDDLEWARE ----
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- ROUTES ----
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// ---- HEALTH CHECK ----
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Garage API is running 🚗', time: new Date() });
});

// ---- 404 ----
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route không tồn tại' });
});

// ---- ERROR HANDLER ----
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});