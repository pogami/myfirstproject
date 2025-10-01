const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 9002;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store user count and typing status per room
const roomUserCounts = new Map();
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

      // Update user count for this room
      if (!roomUserCounts.has(room)) {
        roomUserCounts.set(room, new Set());
      }
      roomUserCounts.get(room).add(userId);

      // Get current user count
      const userCount = roomUserCounts.get(room).size;
      
      // Broadcast updated user count to all users in the room
      io.to(room).emit('user-count-update', userCount);

      console.log(`${username} joined room: ${room} (${userCount} users)`);
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      const { room, userId, username } = data;
      
      if (!typingUsers.has(room)) {
        typingUsers.set(room, new Set());
      }
      
      typingUsers.get(room).add(userId);
      socket.to(room).emit('user-typing', { userId });
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
      const { room } = data;
      
      // Broadcast to all users in the room
      io.to(room).emit('ai-thinking-start');
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


    // Handle disconnection
    socket.on('disconnect', () => {
      const socketData = socket.data;
      if (socketData) {
        const { room, userId, username } = socketData;
        
        // Remove from user count
        if (roomUserCounts.has(room)) {
          roomUserCounts.get(room).delete(userId);
        }
        
        // Remove from typing users
        if (typingUsers.has(room)) {
          typingUsers.get(room).delete(userId);
        }
        
        // Get updated user count
        const userCount = roomUserCounts.get(room)?.size || 0;
        
        // Broadcast updated user count to remaining users
        io.to(room).emit('user-count-update', userCount);
        
        console.log(`${username} left room: ${room} (${userCount} users remaining)`);
      }
    });

    // Clean up typing indicators periodically
    setInterval(() => {
      typingUsers.forEach((roomTypingUsers, room) => {
        // Clear all typing users after 5 seconds (simplified)
        if (roomTypingUsers.size > 0) {
          roomTypingUsers.clear();
          io.to(room).emit('typing-clear');
        }
      });
    }, 5000);
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
