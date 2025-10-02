const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 9002;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Pusher server configuration
const Pusher = require('pusher');

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '2058327',
  key: process.env.PUSHER_KEY || '1e4d1e2b0527bdbbbea7',
  secret: process.env.PUSHER_SECRET || '98d3b598ddb894e41e38',
  cluster: process.env.PUSHER_CLUSTER || 'us2',
  useTLS: true,
});

console.log('Pusher server initialized with credentials:', {
  appId: process.env.PUSHER_APP_ID || '2058327',
  key: process.env.PUSHER_KEY || '1e4d1e2b0527bdbbbea7',
  cluster: process.env.PUSHER_CLUSTER || 'us2'
});

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log('> Pusher server running on port', port);
  });
});