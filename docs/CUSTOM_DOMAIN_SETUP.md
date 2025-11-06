# Custom Domain Setup for Google OAuth

## 🎯 Goal
Change the Google OAuth popup to show "Choose an account to sign in to www.courseconnectai.com" instead of "courseconnect-61eme.firebaseapp.com"

## ✅ Code Changes Made
- Updated `src/lib/firebase/client.ts` to use `authDomain: "www.courseconnectai.com"`

## 🔧 Required Firebase Console Setup

### 1. Add Custom Domain to Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `courseconnect-61eme`
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Add these domains:
   - `www.courseconnectai.com` (your custom domain)
   - `courseconnectai.com` (without www)
   - `localhost` (for development)
   - `127.0.0.1` (for development)

### 2. Configure Custom Domain in Firebase Hosting
1. In Firebase Console, go to **Hosting**
2. Click **Add custom domain**
3. Enter: `www.courseconnectai.com`
4. Follow the DNS verification steps
5. Add DNS records to your domain provider:
   ```
   Type: A
   Name: www
   Value: [Firebase provided IP addresses]
   
   Type: CNAME
   Name: www
   Value: [Firebase provided CNAME]
   ```

## 🔧 Required Google Cloud Console Setup

### 1. Update OAuth 2.0 Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `courseconnect-61eme`
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID and click **Edit**

### 2. Update Authorized JavaScript Origins
Add these origins:
- `https://www.courseconnectai.com`
- `https://courseconnectai.com`
- `http://localhost:9002` (for development)
- `http://127.0.0.1:9002` (for development)

### 3. Update Authorized Redirect URIs
Add these redirect URIs:
- `https://www.courseconnectai.com/__/auth/handler`
- `https://courseconnectai.com/__/auth/handler`
- `http://localhost:9002/__/auth/handler` (for development)
- `http://127.0.0.1:9002/__/auth/handler` (for development)

## 🌐 DNS Configuration

### If you own courseconnectai.com domain:
1. Log into your domain registrar (GoDaddy, Namecheap, etc.)
2. Add the DNS records provided by Firebase Hosting
3. Wait for DNS propagation (can take up to 24 hours)

### If you don't own the domain yet:
1. Purchase `courseconnectai.com` from a domain registrar
2. Follow the DNS configuration steps above

## 🧪 Testing

### Development Testing
1. Run `npm run dev`
2. Go to `http://localhost:9002/login`
3. Click Google sign-in
4. Should show: "Choose an account to sign in to localhost:9002"

### Production Testing
1. Deploy to your hosting platform
2. Go to `https://www.courseconnectai.com/login`
3. Click Google sign-in
4. Should show: "Choose an account to sign in to www.courseconnectai.com"

## ⚠️ Important Notes

1. **DNS Propagation**: Changes can take up to 24 hours to fully propagate
2. **SSL Certificate**: Firebase will automatically provision SSL certificates for your custom domain
3. **Development**: Localhost will still work for development
4. **Backup**: Keep the original Firebase domain in authorized domains as backup

## 🔍 Troubleshooting

### "Invalid domain" error:
- Check that `www.courseconnectai.com` is added to Firebase authorized domains
- Verify DNS records are correctly configured

### "Redirect URI mismatch" error:
- Check that redirect URIs are added in Google Cloud Console
- Ensure the domain matches exactly (including https://)

### OAuth popup still shows Firebase domain:
- Clear browser cache and cookies
- Wait for DNS propagation
- Verify Firebase Hosting is properly configured

## 📞 Support

If you encounter issues:
1. Check Firebase Console → Authentication → Settings → Authorized domains
2. Check Google Cloud Console → Credentials → OAuth 2.0 Client ID
3. Verify DNS records with your domain provider
4. Test with browser developer tools to see exact error messages
