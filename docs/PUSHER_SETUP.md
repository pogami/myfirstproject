# Pusher Setup Guide

## 1. Get Pusher Credentials

1. Go to [pusher.com](https://pusher.com) and create an account
2. Create a new app
3. Get your credentials:
   - App ID
   - Key (App Key)
   - Secret
   - Cluster

## 2. Environment Variables

Add these to your `.env.local` file:

```bash
# Pusher Configuration
NEXT_PUBLIC_PUSHER_APP_KEY=your_pusher_app_key_here
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster_here
PUSHER_APP_ID=your_pusher_app_id_here
PUSHER_SECRET=your_pusher_secret_here
```

## 3. Pusher App Settings

In your Pusher dashboard, enable:
- **Client events** (for typing indicators)
- **Presence channels** (for user tracking)
- **CORS** for your domain

## 4. Test the Connection

1. Start your development server: `npm run dev`
2. Open the chat page
3. Check browser console for "Pusher connected" message
4. Test real-time messaging between devices

## 5. Production Deployment

Make sure to add the same environment variables to your production environment (Vercel, etc.).

## Security Notes

- Never commit Pusher keys to version control
- Use different keys for development and production
- The `NEXT_PUBLIC_` prefix makes variables available to the client
- Server-side variables (without prefix) are only available on the server
