import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { StudyBreakProvider } from "@/components/study-break-provider"
import { PageTransitionBar } from "@/components/ui/page-transition-bar"
import { Analytics } from '@vercel/analytics/next';
import { FirebaseConnectionManager } from "@/components/firebase-connection-manager";
import { ThemeProvider } from "@/contexts/theme-context";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.courseconnectai.com'),
  title: 'CourseConnect - AI College Platform',
  description: 'Your unified platform for college success with AI-powered study tools, syllabus analysis, and collaborative features.',
  keywords: ['college', 'AI', 'study', 'education', 'platform', 'academic'],
  authors: [{ name: 'CourseConnect' }],
  creator: 'CourseConnect',
  publisher: 'CourseConnect',
  manifest: '/manifest.json',
  robots: 'index, follow',
  verification: {
    google: 'your-google-verification-code',
  },
  other: {
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:type': 'image/png',
    'og:image:alt': 'CourseConnect Logo',
  },
  openGraph: {
    title: 'CourseConnect - AI College Platform',
    description: 'Your unified platform for college success with AI-powered study tools, syllabus analysis, and collaborative features.',
    url: 'https://www.courseconnectai.com',
    siteName: 'CourseConnect',
    images: [
      {
        url: '/icons/chat-icon-96x96.png?v=4',
        width: 1200,
        height: 630,
        alt: 'CourseConnect Logo',
      },
      {
        url: '/icons/groups-icon-96x96.png?v=4',
        width: 512,
        height: 512,
        alt: 'CourseConnect Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CourseConnect - AI College Platform',
    description: 'Your unified platform for college success with AI-powered study tools, syllabus analysis, and collaborative features.',
    images: ['/icons/chat-icon-96x96.png?v=4'],
  },
  icons: {
    icon: [
      { url: '/courseconnect-favicon.svg?v=4', type: 'image/svg+xml' },
      { url: '/courseconnect-favicon.svg?v=4', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/courseconnect-favicon.svg?v=4', sizes: '16x16', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.svg?v=4', sizes: '180x180', type: 'image/svg+xml' },
      { url: '/apple-touch-icon.svg?v=4', sizes: '152x152', type: 'image/svg+xml' },
      { url: '/apple-touch-icon.svg?v=4', sizes: '120x120', type: 'image/svg+xml' },
      { url: '/apple-touch-icon.svg?v=4', sizes: '76x76', type: 'image/svg+xml' }
    ],
    shortcut: '/courseconnect-favicon.svg?v=4'
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
        
        {/* Favicon and Icons */}
        <link rel="icon" href="/courseconnect-favicon.svg?v=4" type="image/svg+xml" />
        <link rel="shortcut icon" href="/courseconnect-favicon.svg?v=4" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg?v=4" sizes="180x180" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg?v=4" sizes="152x152" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg?v=4" sizes="120x120" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg?v=4" sizes="76x76" />
        
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
        <ThemeProvider>
          <PageTransitionBar />
          <StudyBreakProvider>
            {children}
          </StudyBreakProvider>
          <FirebaseConnectionManager />
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
