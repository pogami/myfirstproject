import Pusher from 'pusher';

// Initialize Pusher server with environment variables (with fallback)
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || '2058327',
  key: process.env.PUSHER_KEY || '1e4d1e2b0527bdbbbea7',
  secret: process.env.PUSHER_SECRET || '98d3b598ddb894e41e38',
  cluster: process.env.PUSHER_CLUSTER || 'us2',
  useTLS: true,
});

export default pusherServer;
