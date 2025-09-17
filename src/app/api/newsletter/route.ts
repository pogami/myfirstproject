import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Mock email service - in production, you'd use SendGrid, Mailchimp, etc.
const emailSubscribers: string[] = [];

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send welcome email
async function sendWelcomeEmail(email: string) {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email credentials not configured, skipping email send');
      console.log('📧 EMAIL CONTENT PREVIEW:');
      console.log('Subject: Welcome to CourseConnect! 🎓');
      console.log('To:', email);
      console.log('Content: Beautiful HTML welcome email with CourseConnect branding, features list, and dashboard link');
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to CourseConnect! 🎓',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to CourseConnect</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <div style="display: inline-block; margin-bottom: 15px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="60" height="60">
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#f0f9ff;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <rect width="60" height="60" rx="12" fill="url(#grad1)"/>
                <g>
                  <path d="M 15 15 C 21 9, 39 51, 45 45" stroke="#3b82f6" stroke-width="4.8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M 15 45 C 21 51, 39 9, 45 15" stroke="#3b82f6" stroke-width="4.8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                  <circle cx="15" cy="15" r="2.4" fill="#3b82f6" />
                  <circle cx="45" cy="45" r="2.4" fill="#3b82f6" />
                  <circle cx="15" cy="45" r="2.4" fill="#3b82f6" />
                  <circle cx="45" cy="15" r="2.4" fill="#3b82f6" />
                </g>
              </svg>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to CourseConnect!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your AI-powered study companion</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-top: 0;">Thank you for joining us!</h2>
            
            <p style="color: #6b7280; line-height: 1.6;">
              We're excited to have you on board! CourseConnect is designed to help you succeed academically with AI-powered tools and collaborative study features.
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">What you can do with CourseConnect:</h3>
              <ul style="color: #6b7280; line-height: 1.8;">
                <li>📚 Upload your syllabus for instant analysis</li>
                <li>🤖 Get AI-powered homework help</li>
                <li>👥 Join study groups with classmates</li>
                <li>📝 Generate flashcards automatically</li>
                <li>📊 Track your academic progress</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://courseconnect-sooty.vercel.app'}/dashboard" 
                 target="_blank"
                 style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                🚀 Get Started Now
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
              This is a development demonstration project. CourseConnect is not a commercial business, 
              but you can use it for academic work. Please verify any AI-generated content for accuracy.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              You're receiving this email because you subscribed to CourseConnect updates.<br>
              If you didn't sign up, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    if (emailSubscribers.includes(email)) {
      return NextResponse.json(
        { 
          message: 'Email already subscribed! You\'ll receive updates about new features and improvements.',
          alreadySubscribed: true
        },
        { status: 200 }
      );
    }

    // Add email to subscribers list
    emailSubscribers.push(email);

    // Send welcome email
    const emailSent = await sendWelcomeEmail(email);

    console.log('New email subscriber:', email);
    console.log('Total subscribers:', emailSubscribers.length);
    console.log('Welcome email sent:', emailSent);

    return NextResponse.json(
      { 
        message: emailSent 
          ? 'Successfully subscribed! Check your email for a welcome message. You\'ll receive updates about new features and improvements.'
          : 'Successfully subscribed! You\'ll receive updates about new features and improvements. (Note: Welcome email could not be sent)',
        subscriberCount: emailSubscribers.length,
        emailSent: emailSent
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Optional: GET endpoint to check subscription status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter is required' },
      { status: 400 }
    );
  }

  const isSubscribed = emailSubscribers.includes(email);

  return NextResponse.json({
    email,
    isSubscribed,
    subscriberCount: emailSubscribers.length
  });
}
