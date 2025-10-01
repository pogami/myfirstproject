const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 9002;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store active users and typing states
const activeUsers = new Map();
const typingUsers = new Map();
const availableChats = new Map();
const chatUsers = new Map(); // chatId -> Set of userIds

// Rate limiting storage
const rateLimits = new Map();

// Anti-abuse measures
const abuseDetection = new Map();
const bannedUsers = new Set();
const suspiciousUsers = new Map();

// Optimal rate limiting for chat systems
const RATE_LIMITS = {
  MESSAGES_PER_30_SECONDS: 10,
  MESSAGES_PER_HOUR: 100,
  TYPING_EVENTS_PER_MINUTE: 20
};

// Anti-abuse detection
const detectAbuse = (userId, message) => {
  const now = Date.now();
  const userAbuse = abuseDetection.get(userId) || {
    repeatedMessages: [],
    spamWords: [],
    capsMessages: [],
    lastActivity: now
  };

  // Check for repeated messages
  const recentMessages = userAbuse.repeatedMessages.filter(timestamp => 
    now - timestamp < 5 * 60 * 1000 // 5 minutes
  );
  
  if (recentMessages.length >= 5) {
    return { isAbuse: true, reason: 'Repeated messages detected' };
  }

  // Check for spam words
  const spamWords = ['spam', 'scam', 'free money', 'click here', 'buy now'];
  const hasSpamWords = spamWords.some(word => 
    message.text.toLowerCase().includes(word)
  );
  
  if (hasSpamWords) {
    userAbuse.spamWords.push(now);
    if (userAbuse.spamWords.length >= 3) {
      return { isAbuse: true, reason: 'Spam content detected' };
    }
  }

  // Check for excessive caps
  const capsRatio = (message.text.match(/[A-Z]/g) || []).length / message.text.length;
  if (capsRatio > 0.7 && message.text.length > 10) {
    userAbuse.capsMessages.push(now);
    if (userAbuse.capsMessages.length >= 3) {
      return { isAbuse: true, reason: 'Excessive caps detected' };
    }
  }

  // Update abuse detection
  userAbuse.repeatedMessages.push(now);
  userAbuse.lastActivity = now;
  abuseDetection.set(userId, userAbuse);

  return { isAbuse: false };
};

// Rate limiting function
const checkRateLimit = (userId, type) => {
  const now = Date.now();
  const userLimits = rateLimits.get(userId) || {
    messages: [],
    typing: []
  };

  if (type === 'message') {
    // Clean old messages (older than 1 hour)
    userLimits.messages = userLimits.messages.filter(timestamp => 
      now - timestamp < 60 * 60 * 1000
    );

    // Check 30-second limit
    const recentMessages = userLimits.messages.filter(timestamp => 
      now - timestamp < 30 * 1000
    );

    if (recentMessages.length >= RATE_LIMITS.MESSAGES_PER_30_SECONDS) {
      return {
        allowed: false,
        reason: 'Too many messages in 30 seconds',
        retryAfter: Math.ceil((recentMessages[0] + 30000 - now) / 1000)
      };
    }

    // Check 1-hour limit
    if (userLimits.messages.length >= RATE_LIMITS.MESSAGES_PER_HOUR) {
      return {
        allowed: false,
        reason: 'Too many messages in 1 hour',
        retryAfter: Math.ceil((userLimits.messages[0] + 60 * 60 * 1000 - now) / 1000)
      };
    }

    // Add current message
    userLimits.messages.push(now);
  }

  if (type === 'typing') {
    // Clean old typing events (older than 1 minute)
    userLimits.typing = userLimits.typing.filter(timestamp => 
      now - timestamp < 60 * 1000
    );

    if (userLimits.typing.length >= RATE_LIMITS.TYPING_EVENTS_PER_MINUTE) {
      return {
        allowed: false,
        reason: 'Too many typing events per minute',
        retryAfter: Math.ceil((userLimits.typing[0] + 60 * 1000 - now) / 1000)
      };
    }

    // Add current typing event
    userLimits.typing.push(now);
  }

  // Update user limits
  rateLimits.set(userId, userLimits);

  return { allowed: true };
};

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
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
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user joining a chat
    socket.on('join-chat', (data) => {
      const { chatId, userId, userName, userPhotoURL } = data;
      socket.join(chatId);
      
      // Track active user
      activeUsers.set(socket.id, {
        userId,
        userName,
        userPhotoURL,
        chatId,
        socketId: socket.id
      });

      // Track users per chat
      if (!chatUsers.has(chatId)) {
        chatUsers.set(chatId, new Set());
      }
      chatUsers.get(chatId).add(userId);

      // Update available chats
      if (!availableChats.has(chatId)) {
        availableChats.set(chatId, {
          chatId,
          title: chatId === 'public-general-chat' ? 'Community' : 
                 chatId === 'private-general-chat' ? 'General Chat' : chatId,
          userCount: 0,
          isActive: true
        });
      }

      // Update user count
      const chatInfo = availableChats.get(chatId);
      chatInfo.userCount = chatUsers.get(chatId).size;
      availableChats.set(chatId, chatInfo);

      // Broadcast user joined to chat room
      socket.to(chatId).emit('user-joined', {
        userId,
        userName,
        userPhotoURL,
        timestamp: Date.now()
      });

      // Send current active users to the new user
      const currentChatUsers = Array.from(activeUsers.values())
        .filter(user => user.chatId === chatId)
        .map(user => ({
          userId: user.userId,
          userName: user.userName,
          userPhotoURL: user.userPhotoURL
        }));
      
      socket.emit('active-users', currentChatUsers);

      // Broadcast chat list update to all users
      const chatList = Array.from(availableChats.values());
      io.emit('chat-list-update', chatList);
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      const { chatId, userId, userName, userPhotoURL } = data;
      
      // Check rate limit for typing events
      const rateLimitCheck = checkRateLimit(userId, 'typing');
      if (!rateLimitCheck.allowed) {
        console.log('Typing rate limited:', { userId, reason: rateLimitCheck.reason });
        socket.emit('rate-limit-exceeded', {
          type: 'typing',
          reason: rateLimitCheck.reason,
          retryAfter: rateLimitCheck.retryAfter
        });
        return;
      }
      
      console.log('Server received typing-start:', { chatId, userId, userName, userPhotoURL });
      typingUsers.set(socket.id, { userId, userName, userPhotoURL, chatId });
      socket.to(chatId).emit('user-typing', { userId, userName, userPhotoURL });
    });

    socket.on('typing-stop', (data) => {
      const { chatId, userId } = data;
      typingUsers.delete(socket.id);
      socket.to(chatId).emit('user-stopped-typing', { userId });
    });

    // Handle real-time message broadcasting
    socket.on('send-message', (data) => {
      const { chatId, message } = data;
      
      // Check if user is banned
      if (bannedUsers.has(message.userId)) {
        console.log('Banned user attempted to send message:', message.userId);
        socket.emit('user-banned', { reason: 'You have been banned from this chat' });
        return;
      }
      
      // Check for abuse
      const abuseCheck = detectAbuse(message.userId, message);
      if (abuseCheck.isAbuse) {
        console.log('Abuse detected:', { userId: message.userId, reason: abuseCheck.reason });
        socket.emit('abuse-detected', { reason: abuseCheck.reason });
        
        // Mark user as suspicious
        suspiciousUsers.set(message.userId, {
          reason: abuseCheck.reason,
          timestamp: Date.now(),
          count: (suspiciousUsers.get(message.userId)?.count || 0) + 1
        });
        
        // Auto-ban after 3 violations
        if (suspiciousUsers.get(message.userId)?.count >= 3) {
          bannedUsers.add(message.userId);
          console.log('User auto-banned:', message.userId);
          socket.emit('user-banned', { reason: 'Auto-banned for repeated violations' });
        }
        return;
      }
      
      // Check rate limit for messages
      const rateLimitCheck = checkRateLimit(message.userId, 'message');
      if (!rateLimitCheck.allowed) {
        console.log('Message rate limited:', { userId: message.userId, reason: rateLimitCheck.reason });
        socket.emit('rate-limit-exceeded', {
          type: 'message',
          reason: rateLimitCheck.reason,
          retryAfter: rateLimitCheck.retryAfter
        });
        return;
      }
      
      console.log('Broadcasting message to chat room:', { chatId, messageId: message.id, userId: message.userId, userName: message.name });
      
      // Get all sockets in this chat room
      const room = io.sockets.adapter.rooms.get(chatId);
      const roomSize = room ? room.size : 0;
      console.log(`Broadcasting to ${roomSize} users in chat room: ${chatId}`);
      
      socket.to(chatId).emit('new-message', message);

      // Update last message in chat info
      if (availableChats.has(chatId)) {
        const chatInfo = availableChats.get(chatId);
        chatInfo.lastMessage = {
          text: message.text,
          timestamp: message.timestamp,
          sender: message.name
        };
        availableChats.set(chatId, chatInfo);

        // Broadcast chat update
        io.emit('chat-updated', chatInfo);
      }
    });

    // Handle AI thinking animation
    socket.on('ai-thinking', (data) => {
      const { chatId, isThinking } = data;
      socket.to(chatId).emit('ai-thinking-update', { isThinking });
    });

    // Handle user identity switching (for testing)
    socket.on('switch-identity', (data) => {
      const { newUserId, newUserName } = data;
      const user = activeUsers.get(socket.id);
      if (user) {
        user.userId = newUserId;
        user.userName = newUserName;
        activeUsers.set(socket.id, user);
        
        // Broadcast identity change
        socket.to(user.chatId).emit('user-identity-changed', {
          oldUserId: data.oldUserId,
          newUserId,
          newUserName
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      const user = activeUsers.get(socket.id);
      if (user) {
        // Remove from chat users
        if (chatUsers.has(user.chatId)) {
          chatUsers.get(user.chatId).delete(user.userId);
          
          // Update user count
          if (availableChats.has(user.chatId)) {
            const chatInfo = availableChats.get(user.chatId);
            chatInfo.userCount = chatUsers.get(user.chatId).size;
            availableChats.set(user.chatId, chatInfo);

            // If no users left, mark chat as inactive
            if (chatInfo.userCount === 0) {
              chatInfo.isActive = false;
              availableChats.set(user.chatId, chatInfo);
            }

            // Broadcast chat update
            io.emit('chat-updated', chatInfo);
          }
        }

        // Broadcast user left
        socket.to(user.chatId).emit('user-left', {
          userId: user.userId,
          userName: user.userName,
          timestamp: Date.now()
        });
        
        // Remove from active users
        activeUsers.delete(socket.id);
      }
      
      // Remove from typing users
      typingUsers.delete(socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server running on port ${port}`);
    });
});
