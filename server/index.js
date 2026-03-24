const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// 1. Global Middleware (Security & CORS first)
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    return callback(null, true); // Dynamically allow all origins to fix CORS issues easily
  },
  credentials: true
}));
app.use(morgan('dev'));

// 2. Stripe Webhook (MUST come before express.json() for raw body)
// We import the controller directly for the webhook to avoid router overhead
const { handleWebhook } = require('./controllers/subscriptionController');
app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// 3. For all other routes, use JSON parser
app.use(express.json());

// 4. Mount Routes
app.use('/api/subscriptions', require('./routes/subscriptions')); 
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api/draws', require('./routes/draws'));
app.use('/api/charities', require('./routes/charities'));
app.use('/api/winners', require('./routes/winners'));
app.use('/api/admin', require('./routes/admin'));

// 4. Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 5. Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
