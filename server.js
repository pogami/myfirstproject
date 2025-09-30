const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 9002;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store active users and typing status per room
const activeUsers = new Map();
const typingUsers = new Map();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new Server(server, {
    path: '/api/socketio',
    cors: {
      origin: ['http://localhost:9002', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a chat room
    socket.on('join-room', (data) => {
      const { room, userId, username, avatar } = data;
      
      socket.join(room);
      socket.data = { userId, username, room };

      // Add user to active users for this room
      if (!activeUsers.has(room)) {
        activeUsers.set(room, new Map());
      }
      activeUsers.get(room).set(userId, {
        userId,
        username,
        avatar,
        joinedAt: Date.now()
      });

      // Notify room about new user
      socket.to(room).emit('user-joined', {
        userId,
        username,
        avatar,
        timestamp: Date.now()
      });

      // Send current online users to the new user
      const roomUsers = Array.from(activeUsers.get(room)?.values() || []);
      socket.emit('online-users', roomUsers);
      
      // Also broadcast updated user count to all users in the room
      io.to(room).emit('online-users', roomUsers);

      console.log(`${username} joined room: ${room}`);
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      const { room, userId, username } = data;
      
      if (!typingUsers.has(room)) {
        typingUsers.set(room, new Map());
      }
      
      typingUsers.get(room).set(userId, {
        userId,
        username,
        timestamp: Date.now()
      });

      socket.to(room).emit('user-typing', { userId, username, timestamp: Date.now() });
    });

    socket.on('typing-stop', (data) => {
      const { room, userId } = data;
      
      if (typingUsers.has(room)) {
        typingUsers.get(room).delete(userId);
        socket.to(room).emit('user-stopped-typing', { userId });
      }
    });

    // Handle AI thinking events
    socket.on('ai-thinking-start', (data) => {
      const { room, userId, username, timestamp } = data;
      
      // Broadcast to all users in the room
      io.to(room).emit('ai-thinking-start', { userId, username, timestamp });
    });

    socket.on('ai-thinking-stop', (data) => {
      const { room } = data;
      
      // Broadcast to all users in the room
      io.to(room).emit('ai-thinking-stop');
    });

    // Handle new messages (for real-time delivery)
    socket.on('new-message', (data) => {
      const { room, message } = data;
      
      // Broadcast to all users in the room except sender
      socket.to(room).emit('message-received', {
        ...message,
        timestamp: Date.now()
      });
    });

    // Handle @ai mentions
    socket.on('ai-mention', (data) => {
      const { room, message, aiResponse } = data;
      
      // Broadcast AI response to the room
      io.to(room).emit('ai-response', {
        ...message,
        aiResponse,
        timestamp: Date.now()
      });
    });

    // Handle user presence updates
    socket.on('update-presence', (data) => {
      const { room, userId, status } = data;
      
      socket.to(room).emit('presence-updated', {
        userId,
        status,
        timestamp: Date.now()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const socketData = socket.data;
      if (socketData) {
        const { room, userId, username } = socketData;
        
        // Remove from active users
        if (activeUsers.has(room)) {
          activeUsers.get(room).delete(userId);
        }
        
        // Remove from typing users
        if (typingUsers.has(room)) {
          typingUsers.get(room).delete(userId);
        }
        
        // Notify room about user leaving
        socket.to(room).emit('user-left', {
          userId,
          username,
          timestamp: Date.now()
        });
        
        // Broadcast updated user count to remaining users
        const remainingUsers = Array.from(activeUsers.get(room)?.values() || []);
        io.to(room).emit('online-users', remainingUsers);
        
        console.log(`${username} left room: ${room}`);
      }
    });

    // Clean up typing indicators periodically
    setInterval(() => {
      const now = Date.now();
      typingUsers.forEach((roomTypingUsers, room) => {
        roomTypingUsers.forEach((typingUser, userId) => {
          if (now - typingUser.timestamp > 5000) { // 5 seconds timeout
            roomTypingUsers.delete(userId);
            socket.to(room).emit('user-stopped-typing', { userId });
          }
        });
      });
    }, 2000);
  });

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log('> Socket.IO server initialized');
  });
});
