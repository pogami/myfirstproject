import { Server as SocketIOServer } from 'socket.io';
import { NextRequest, NextResponse } from 'next/server';
import { Server as NetServer } from 'http';

interface SocketData {
  userId: string;
  username: string;
  room: string;
}

interface TypingUser {
  userId: string;
  username: string;
  timestamp: number;
}

interface OnlineUser {
  userId: string;
  username: string;
  avatar?: string;
  joinedAt: number;
}

// Store active users and typing status per room
const activeUsers = new Map<string, Map<string, OnlineUser>>();
const typingUsers = new Map<string, Map<string, TypingUser>>();

// Global Socket.IO instance
let io: SocketIOServer | null = null;

export function GET(req: NextRequest) {
  return new NextResponse('Socket.IO server is running', { status: 200 });
}

export function POST(req: NextRequest) {
  return new NextResponse('Socket.IO server is running', { status: 200 });
}

// Initialize Socket.IO server
export function initializeSocketIO(server: any) {
  if (io) {
    console.log('Socket.IO already running');
    return io;
  }

  console.log('Setting up Socket.IO server...');
  
  io = new SocketIOServer(server, {
    path: '/api/socketio',
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://localhost:9002'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a chat room
    socket.on('join-room', (data: { room: string; userId: string; username: string; avatar?: string }) => {
      const { room, userId, username, avatar } = data;
      
      socket.join(room);
      socket.data = { userId, username, room } as SocketData;

      // Add user to active users for this room
      if (!activeUsers.has(room)) {
        activeUsers.set(room, new Map());
      }
      activeUsers.get(room)!.set(userId, {
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
    socket.on('typing-start', (data: { room: string; userId: string; username: string }) => {
      const { room, userId, username } = data;
      
      if (!typingUsers.has(room)) {
        typingUsers.set(room, new Map());
      }
      
      typingUsers.get(room)!.set(userId, {
        userId,
        username,
        timestamp: Date.now()
      });

      socket.to(room).emit('user-typing', { userId, username, timestamp: Date.now() });
    });

    socket.on('typing-stop', (data: { room: string; userId: string }) => {
      const { room, userId } = data;
      
      if (typingUsers.has(room)) {
        typingUsers.get(room)!.delete(userId);
        socket.to(room).emit('user-stopped-typing', { userId });
      }
    });

    // Handle new messages (for real-time delivery)
    socket.on('new-message', (data: { room: string; message: any }) => {
      const { room, message } = data;
      
      // Broadcast to all users in the room except sender
      socket.to(room).emit('message-received', {
        ...message,
        timestamp: Date.now()
      });
    });

    // Handle @ai mentions
    socket.on('ai-mention', async (data: { room: string; message: any; aiResponse: string }) => {
      const { room, message, aiResponse } = data;
      
      // Broadcast AI response to the room
      io.to(room).emit('ai-response', {
        ...message,
        aiResponse,
        timestamp: Date.now()
      });
    });

    // Handle user presence updates
    socket.on('update-presence', (data: { room: string; userId: string; status: 'online' | 'away' | 'offline' }) => {
      const { room, userId, status } = data;
      
      socket.to(room).emit('presence-updated', {
        userId,
        status,
        timestamp: Date.now()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const socketData = socket.data as SocketData;
      if (socketData) {
        const { room, userId, username } = socketData;
        
        // Remove from active users
        if (activeUsers.has(room)) {
          activeUsers.get(room)!.delete(userId);
        }
        
        // Remove from typing users
        if (typingUsers.has(room)) {
          typingUsers.get(room)!.delete(userId);
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

  console.log('Socket.IO server setup complete');
  return io;
}
