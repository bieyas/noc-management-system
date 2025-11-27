const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/app');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map();
  }

  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: config.corsOrigin || '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          console.log('⚠️  Socket connection attempt without token');
          return next(); // Allow anonymous connections for now
        }

        // Verify JWT token
        const decoded = jwt.verify(token, config.jwtSecret);
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        
        console.log(`✅ Socket authenticated: User ${decoded.userId} (${decoded.role})`);
        next();
      } catch (error) {
        console.error('❌ Socket authentication error:', error.message);
        next(); // Allow connection but without authentication
      }
    });

    // Connection handler
    this.io.on('connection', (socket) => {
      console.log(`🔌 New socket connection: ${socket.id}`);
      
      if (socket.userId) {
        this.connectedClients.set(socket.userId, socket.id);
      }

      // Subscribe to rooms
      socket.on('subscribe', (room) => {
        socket.join(room);
        console.log(`📢 Socket ${socket.id} joined room: ${room}`);
      });

      // Unsubscribe from rooms
      socket.on('unsubscribe', (room) => {
        socket.leave(room);
        console.log(`📢 Socket ${socket.id} left room: ${room}`);
      });

      // Disconnect handler
      socket.on('disconnect', (reason) => {
        console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
        
        if (socket.userId) {
          this.connectedClients.delete(socket.userId);
        }
      });

      // Error handler
      socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
      });
    });

    console.log('✅ WebSocket service initialized');
    return this.io;
  }

  // Emit events

  // Device status update
  emitDeviceStatus(deviceId, status, data = {}) {
    if (this.io) {
      this.io.emit('device:status', {
        deviceId,
        status,
        timestamp: new Date(),
        ...data
      });
      console.log(`📡 Emitted device:status for device ${deviceId}`);
    }
  }

  // Bandwidth update
  emitBandwidthUpdate(data) {
    if (this.io) {
      this.io.emit('bandwidth:update', {
        ...data,
        timestamp: new Date()
      });
    }
  }

  // New alert
  emitNewAlert(alert) {
    if (this.io) {
      this.io.emit('alert:new', {
        ...alert,
        timestamp: new Date()
      });
      console.log(`🚨 Emitted alert:new - ${alert.title}`);
    }
  }

  // Customer update
  emitCustomerUpdate(customerId, data) {
    if (this.io) {
      this.io.emit('customer:update', {
        customerId,
        ...data,
        timestamp: new Date()
      });
    }
  }

  // Payment update
  emitPaymentUpdate(paymentId, status, data = {}) {
    if (this.io) {
      this.io.emit('payment:update', {
        paymentId,
        status,
        timestamp: new Date(),
        ...data
      });
      console.log(`💰 Emitted payment:update for payment ${paymentId}`);
    }
  }

  // Network log
  emitNetworkLog(log) {
    if (this.io) {
      this.io.emit('network:log', {
        ...log,
        timestamp: new Date()
      });
    }
  }

  // System statistics update
  emitStatsUpdate(stats) {
    if (this.io) {
      this.io.emit('stats:update', {
        ...stats,
        timestamp: new Date()
      });
    }
  }

  // Send to specific user
  emitToUser(userId, event, data) {
    const socketId = this.connectedClients.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Send to specific room
  emitToRoom(room, event, data) {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }

  // Get connected clients count
  getConnectedCount() {
    return this.connectedClients.size;
  }

  // Check if user is connected
  isUserConnected(userId) {
    return this.connectedClients.has(userId);
  }
}

// Create singleton instance
const socketService = new SocketService();

module.exports = socketService;
