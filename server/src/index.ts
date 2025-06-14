import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';

import providerRoutes from './routes/providerRoutes';
import serviceRoutes from './routes/serviceRoutes';
import paymentRoutes from './routes/paymentRoutes';
import bookingRoutes from './routes/bookingRoutes';
import authRoutes from "./routes/authRoutes";
import helmet from 'helmet';
import availabilityRoutes from './routes/availabilityRoutes';
const checkoutRoutes = require('./routes/checkout');
const userRoutes = require('./routes/userRoutes');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express(); 
const PORT = parseInt(process.env.PORT || '3001', 10);

const allowedOrigins = [
  'http://localhost:3000',
  'https://wellness2k25.vercel.app',
  'https://rorodev.ngrok.app'
];

const allowedPatterns = [
  /^https:\/\/(.*\.)?wellness2k25\.vercel\.app$/, 
  /^https:\/\/(.*\.)?connorwotkowiczs-projects\.vercel\.app$/,
  /^https:\/\/(.*\.)?vercel\.app$/, 
  /^https:\/\/[a-z0-9-]+\.ngrok\.(io|app)$/ 
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
   
    if (allowedOrigins.includes(origin) || 
        allowedPatterns.some(pattern => pattern.test(origin))) {
      return callback(null, true);
    }
    
    console.error(`CORS blocked: ${origin}`);  
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));  
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'Wellness API is up!' });
});

app.use('/api/providers', providerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/payment', paymentRoutes); 
app.use('/api/availability', availabilityRoutes);

app.get('/api/test', (_req, res) => {
  res.json({ message: 'Backend is alive!' });
});

console.log('Using DB URL:', process.env.DATABASE_URL);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

export default app;