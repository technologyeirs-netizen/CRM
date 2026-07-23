const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const bootstrapAdminFromEnv = require('./config/bootstrapAdmin');
const errorHandler = require('./middleware/errorHandler');


// Load env vars from .env file if it exists
// First try local .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  // Fallback to environment variables (Vercel/Railway runtime env)
  dotenv.config();
}

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please set these variables in your Vercel dashboard or .env file');
  if (!process.env.VERCEL) {
    process.exit(1);
  }
}

const app = express();

// =========================
// CORS
// =========================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://eirstechnology.com",
  "https://crm.eirstechnology.com",
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow Postman, curl, server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
  ],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Apply CORS middleware to all routes
app.use(cors(corsOptions));

// Explicit preflight handler - MUST be before body parsers
app.options('*', cors(corsOptions));

// Additional safety: explicit OPTIONS handler for API routes
app.options('/api/*', cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Determine the correct path for client build
// Works both locally and on Render/Vercel
const clientBuildPath = path.resolve(__dirname, '../client/dist');

// Serve static files from client build if it exists
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  console.log(`Serving static files from ${clientBuildPath}`);
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/followups', require('./routes/followUpRoutes'));
app.use('/api/interactions', require('./routes/interactionRoutes'));
app.use('/api/prospects', require('./routes/prospectRoutes'));
app.use('/api/service-management', require('./routes/prospectRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/sales-invoices', require('./routes/salesInvoiceRoutes'));
app.use('/api/credit-notes', require('./routes/creditNoteRoutes'));
app.use('/api/delivery-challans', require('./routes/deliveryChallanRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/subcategories', require('./routes/subCategoryRoutes'));
app.use('/api/godowns', require('./routes/godownRoutes'));
app.use('/api/distribution', require('./routes/distributionRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/quotations', require('./routes/quotationRoutes'));
app.use('/api/website-sync', require('./routes/websiteSyncRoutes'));
app.use("/api/sales-settings",require("./routes/salesSettingRoutes"));
app.use('/api/fsm', require('./routes/fsmRoutes'));
app.use('/api/fsm/jobs', require('./routes/fsmJobRoutes'));
app.use('/api/fsm-admin', require('./routes/fsmAdminRoutes'));


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EIRS CRM Backend Running 🚀",
    health: "/api/health"
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'EIRS CRM API is running', timestamp: new Date() });
});

// Debug endpoint - show environment configuration
app.get('/api/debug/config', (req, res) => {
  res.json({
    success: true,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGO_CONNECTED: !!process.env.MONGO_URI,
      JWT_SECRET_SET: !!process.env.JWT_SECRET,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      VERCEL: process.env.VERCEL || 'false',
      timestamp: new Date()
    }
  });
});

// Serve index.html for SPA routing (must be before error handler)
if (fs.existsSync(clientBuildPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error Handler Middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

let server;
let started = false;

const startServer = async () => {
  if (started) return;
  started = true;

  await connectDB();

  const hasAdminBootstrapCredentials = Boolean(
    String(process.env.ADMIN_EMAIL || '').trim() &&
    String(process.env.ADMIN_PASSWORD || '').trim()
  );

  const shouldBootstrapAdmin =
    process.env.ENABLE_ADMIN_BOOTSTRAP === 'true' ||
    hasAdminBootstrapCredentials;

  if (shouldBootstrapAdmin) {
    await bootstrapAdminFromEnv();
  } else {
    console.warn('Admin bootstrap skipped: set ADMIN_EMAIL and ADMIN_PASSWORD to enable CRM sync login');
  }

  // In Vercel serverless runtime, do not bind a listening socket.
  if (process.env.VERCEL) {
    console.log('EIRS CRM running in Vercel serverless mode');
    return;
  }

  server = app.listen(PORT, () => {
    console.log(`EIRS CRM Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error(`Server startup failed: ${err.message}`);
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

module.exports = app;
