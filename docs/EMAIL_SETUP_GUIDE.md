# Email Setup Guide for CourseConnect

## 📧 How to Set Up Email Functionality

### 1. Create Environment File
Create a `.env.local` file in your project root with:

```bash
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Site URL for email links
NEXT_PUBLIC_SITE_URL=http://localhost:9002

# AI API Keys (optional)
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
AI_PROVIDER_PREFERENCE=fallback
```

### 2. Gmail Setup (Recommended)

#### Option A: Use Gmail with App Password
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

#### Option B: Use Other Email Services
Change the service in `src/app/api/newsletter/route.ts`:
```typescript
const transporter = nodemailer.createTransporter({
  service: 'outlook', // or 'yahoo', 'hotmail', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### 3. Alternative Email Services

#### SendGrid (Professional)
```bash
npm install @sendgrid/mail
```

#### Mailgun
```bash
npm install mailgun-js
```

#### AWS SES
```bash
npm install aws-sdk
```

### 4. Testing

1. **Start your server**: `npm run dev`
2. **Visit**: `http://localhost:9002/home`
3. **Scroll to bottom** and enter your email
4. **Check your inbox** for the welcome email!

### 5. Production Deployment

For production, update:
- `NEXT_PUBLIC_SITE_URL` to your actual domain
- Use a professional email service (SendGrid, Mailgun, etc.)
- Consider using a dedicated email domain

## 🎯 Features Included

- ✅ **Welcome Email**: Beautiful HTML email template
- ✅ **Duplicate Prevention**: Won't send multiple emails to same address
- ✅ **Error Handling**: Graceful fallback if email fails
- ✅ **Development Notice**: Includes disclaimer about demo project
- ✅ **Responsive Design**: Email looks great on all devices

## 🔧 Customization

You can customize the email template in `src/app/api/newsletter/route.ts`:
- Change colors and styling
- Add your logo
- Modify the content
- Add unsubscribe links
- Include social media links

## 📊 Analytics

The system logs:
- New subscribers
- Total subscriber count
- Email send success/failure
- Console logs for debugging

## 🚀 Next Steps

1. Set up your email credentials
2. Test the functionality locally
3. Deploy to production
4. Monitor email delivery
5. Consider adding unsubscribe functionality
