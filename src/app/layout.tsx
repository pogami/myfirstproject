import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { StudyBreakProvider } from "@/components/study-break-provider"
import { PageTransitionBar } from "@/components/ui/page-transition-bar"
import { Analytics } from '@vercel/analytics/next';
import { FirebaseConnectionManager } from "@/components/firebase-connection-manager";
import { ThemeProvider } from "@/contexts/theme-context";

export const metadata: Metadata = {
  title: "CourseConnect - AI College Platform",
  description: "Your unified platform for college success with AI-powered study tools",
  openGraph: {
    type: "website",
    url: "https://www.courseconnectai.com",
    title: "CourseConnect - AI College Platform",
    description: "Your unified platform for college success with AI-powered study tools",
        images: [
          {
            url: "https://www.courseconnectai.com/final-logo.png?v=7",
            width: 1200,
            height: 630,
            alt: "CourseConnect Logo",
          },
        ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CourseConnect - AI College Platform",
    description: "Your unified platform for college success with AI-powered study tools",
    images: ["https://www.courseconnectai.com/final-logo.png?v=7"],
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
