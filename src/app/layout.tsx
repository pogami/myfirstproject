import type {Metadata} from 'next';
import './globals.css';
import { Toaster as Sonner } from "@/components/ui/sonner"
import { StudyBreakProvider } from "@/components/study-break-provider"
import { PageTransitionBar } from "@/components/ui/page-transition-bar"
import { MobileDetectionPopup } from "@/components/mobile-detection-popup"
import { Analytics } from '@vercel/analytics/next';
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "CourseConnect AI - Your AI-Powered Study Companion",
  description: "Upload your syllabus and let AI help you ace your courses. Get personalized study plans, interactive quizzes, and smart tutoring tailored to your classes.",
  openGraph: {
    type: "website",
    url: "https://courseconnectai.com",
    title: "CourseConnect AI - Your AI-Powered Study Companion",
    description: "Upload your syllabus and let AI help you ace your courses. Get personalized study plans, interactive quizzes, and smart tutoring tailored to your classes.",
    siteName: "CourseConnect AI",
    images: [
      {
        url: "https://courseconnectai.com/opengraph2.png",
        width: 1200,
        height: 630,
        alt: "CourseConnect AI - AI-Powered Study Platform",
      },
      {
        url: "https://courseconnectai.com/opengraph2.png",
        width: 1200,
        height: 630,
        alt: "CourseConnect AI - Mobile Preview",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "CourseConnect AI - Your AI-Powered Study Companion",
    description: "Upload your syllabus and let AI help you ace your courses. Get personalized study plans, interactive quizzes, and smart tutoring tailored to your classes.",
    images: ["https://courseconnectai.com/opengraph2.png"],
    creator: "@courseconnectai",
    site: "@courseconnectai",
  },
  other: {
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:type': 'image/png',
    'og:image:alt': 'CourseConnect AI - AI-Powered Study Platform',
    'twitter:image:alt': 'CourseConnect AI - AI-Powered Study Platform',
    'apple-mobile-web-app-title': 'CourseConnect AI',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'theme-color': '#3b82f6',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-TileImage': '/app-icon-512x512.png',
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon-32x32.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        
        {/* Open Graph Meta Tags - Server Side Rendered */}
        <meta property="og:title" content="CourseConnect AI - Your AI-Powered Study Companion" />
        <meta property="og:description" content="Upload your syllabus and let AI help you ace your courses. Get personalized study plans, interactive quizzes, and smart tutoring tailored to your classes." />
        <meta property="og:url" content="https://courseconnectai.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CourseConnect AI" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CourseConnect AI - Your AI-Powered Study Companion" />
        <meta name="twitter:description" content="Upload your syllabus and let AI help you ace your courses. Get personalized study plans, interactive quizzes, and smart tutoring tailored to your classes." />
        <meta name="twitter:image:alt" content="CourseConnect AI - AI-Powered Study Platform" />
        <meta name="twitter:creator" content="@courseconnectai" />
        <meta name="twitter:site" content="@courseconnectai" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="description" content="Upload your syllabus and let AI help you ace your courses. Get personalized study plans, interactive quizzes, and smart tutoring tailored to your classes." />
        <meta name="keywords" content="AI tutoring, study platform, syllabus analysis, online learning, college success, personalized study plans, interactive quizzes, CourseConnect" />
        <meta name="author" content="CourseConnect AI" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://courseconnectai.com" />
        
        {/* iMessage and Link Preview Tags */}
        <meta property="al:ios:app_name" content="CourseConnect AI" />
        <meta property="al:android:app_name" content="CourseConnect AI" />
        <meta property="og:determiner" content="the" />
        
        {/* Favicon and Icons - Multiple sizes for better visibility */}
        <link rel="icon" href="/favicon-32x32.png?v=3" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png?v=3" type="image/png" sizes="16x16" />
        <link rel="shortcut icon" href="/favicon-32x32.png?v=3" type="image/png" />
        
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" sizes="180x180" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Additional Meta Tags */}
        <meta name="application-name" content="CourseConnect" />
        <meta name="apple-mobile-web-app-title" content="CourseConnect" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
        {/* Cache Control */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="font-body antialiased bg-gradient-to-b from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950 min-h-screen" suppressHydrationWarning>
        <Providers>
          <PageTransitionBar />
          <StudyBreakProvider>
            {children}
          </StudyBreakProvider>
          <MobileDetectionPopup />
          <Sonner />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
