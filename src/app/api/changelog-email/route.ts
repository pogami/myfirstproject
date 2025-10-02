import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Temporary email subscribers list (replace with database in production)
const emailSubscribers: string[] = [];

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send changelog update email
async function sendChangelogEmail(email: string, changelogData: any) {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email credentials not configured, skipping changelog email send');
      console.log('📧 CHANGELOG EMAIL PREVIEW:');
      console.log('Subject: CourseConnect Update - ' + changelogData.version);
      console.log('To:', email);
      console.log('Content: Changelog update with new features and improvements');
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `CourseConnect Update - ${changelogData.version} 🚀`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CourseConnect Update - ${changelogData.version}</title>
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
            <h1 style="color: white; margin: 0; font-size: 28px;">CourseConnect Update</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Version ${changelogData.version} - ${changelogData.date}</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
              <h2 style="color: #1f2937; margin-top: 0; display: flex; align-items: center;">
                <span style="background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 10px; text-transform: uppercase;">
                  ${changelogData.type}
                </span>
                What's New
              </h2>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #1f2937; margin-bottom: 15px;">✨ Latest Updates</h3>
              <ul style="color: #6b7280; line-height: 1.8; padding-left: 20px;">
                ${changelogData.changes.map((change: string) => `
                  <li style="margin-bottom: 8px;">${change}</li>
                `).join('')}
              </ul>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">🎯 Impact Level: ${changelogData.impact}</h3>
              <p style="color: #6b7280; margin: 0;">
                ${changelogData.impact === 'high' ? 'This update includes significant improvements that will enhance your experience.' : 
                  changelogData.impact === 'medium' ? 'This update includes useful improvements and new features.' : 
                  'This update includes minor improvements and bug fixes.'}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://courseconnect-sooty.vercel.app'}/dashboard" 
                 target="_blank"
                 style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-right: 10px;">
                🚀 Try It Now
              </a>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://courseconnect-sooty.vercel.app'}/changelog" 
                 target="_blank"
                 style="background: #6b7280; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                📋 View Full Changelog
              </a>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>💡 Pro Tip:</strong> Keep an eye on our changelog for the latest features and improvements. 
                We're constantly working to make CourseConnect better for you!
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              You're receiving this email because you subscribed to CourseConnect updates.<br>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://courseconnect-sooty.vercel.app'}/newsletter" style="color: #3b82f6;">Unsubscribe</a> | 
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://courseconnect-sooty.vercel.app'}/contact" style="color: #3b82f6;">Contact Us</a>
            </p>
          </div>
        </body>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Changelog email sent to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send changelog email:', error);
    return false;
  }
}

// POST endpoint to send changelog emails to all subscribers
export async function POST(request: NextRequest) {
  try {
    const { changelogData } = await request.json();

    if (!changelogData || !changelogData.version || !changelogData.changes) {
      return NextResponse.json(
        { error: 'Changelog data is required with version and changes' },
        { status: 400 }
      );
    }

    // Get all subscribers (in production, this would come from a database)
    const subscribers = emailSubscribers; // This should be replaced with actual database query

    if (subscribers.length === 0) {
      return NextResponse.json(
        { message: 'No subscribers found', sentCount: 0 },
        { status: 200 }
      );
    }

    let sentCount = 0;
    let failedCount = 0;

    // Send emails to all subscribers
    for (const email of subscribers) {
      try {
        const success = await sendChangelogEmail(email, changelogData);
        if (success) {
          sentCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        failedCount++;
      }
    }

    console.log(`Changelog email campaign completed: ${sentCount} sent, ${failedCount} failed`);

    return NextResponse.json({
      message: `Changelog emails sent successfully`,
      sentCount,
      failedCount,
      totalSubscribers: subscribers.length
    }, { status: 200 });

  } catch (error) {
    console.error('Changelog email campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to send changelog emails. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to get subscriber count
export async function GET() {
  return NextResponse.json({
    subscriberCount: emailSubscribers.length,
    subscribers: emailSubscribers
  });
}
