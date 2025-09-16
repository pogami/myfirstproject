import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { StudyBreakProvider } from "@/components/study-break-provider"
import { PageTransitionBar } from "@/components/ui/page-transition-bar"

export const metadata: Metadata = {
  title: 'CourseConnect - AI College Platform',
  description: 'Your unified platform for college success.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/courseconnect-favicon.svg?v=3', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.svg?v=3', sizes: '180x180', type: 'image/svg+xml' },
      { url: '/apple-touch-icon.svg?v=3', sizes: '152x152', type: 'image/svg+xml' },
      { url: '/apple-touch-icon.svg?v=3', sizes: '120x120', type: 'image/svg+xml' },
      { url: '/apple-touch-icon.svg?v=3', sizes: '76x76', type: 'image/svg+xml' }
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
        <link rel="icon" href="/courseconnect-favicon.svg?v=3" type="image/svg+xml" />
        <link rel="shortcut icon" href="/courseconnect-favicon.svg?v=3" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg?v=3" sizes="180x180" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg?v=3" sizes="152x152" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg?v=3" sizes="120x120" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg?v=3" sizes="76x76" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <PageTransitionBar />
        <StudyBreakProvider>
          {children}
        </StudyBreakProvider>
        <Toaster />
      </body>
    </html>
  );
}
