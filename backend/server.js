const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

/* =====================================================
   ✅ FINAL CORS CONFIG (PRODUCTION + PREVIEW SAFE)
===================================================== */

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    // Allow ALL Netlify domains (production + preview)
    if (origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }

    console.log('❌ CORS blocked:', origin);
    return callback(new Error('CORS blocked: ' + origin));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* =====================================================
   ✅ SOCKET.IO CONFIG
===================================================== */

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.endsWith('.netlify.app')) return callback(null, true);
      return callback(new Error('Socket CORS blocked: ' + origin));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

/* =====================================================
   ✅ MIDDLEWARE
===================================================== */

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

/* =====================================================
   ✅ ROUTES
===================================================== */

app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/settlements', require('./routes/settlements'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FairSplit API is running 🚀',
    timestamp: new Date().toISOString()
  });
});

/* =====================================================
   ✅ SOCKET EVENTS
===================================================== */

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join_group', (groupId) => {
    socket.join(`group_${groupId}`);
    console.log(`User joined group_${groupId}`);
  });

  socket.on('leave_group', (groupId) => {
    socket.leave(`group_${groupId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

app.set('io', io);

/* =====================================================
   ✅ 404 HANDLER
===================================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

/* =====================================================
   ✅ GLOBAL ERROR HANDLER
===================================================== */

app.use((err, req, res, next) => {
  console.error('🔥 Global error:', err.message);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

/* =====================================================
   ✅ START SERVER
===================================================== */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🚀 FairSplit Backend running on port ${PORT}`);
  console.log(`📊 Health: /api/health`);
  console.log(`🗄 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
  console.log('\n🎉 Ready to handle requests!\n');
});