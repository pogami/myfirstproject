import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { StudyBreakProvider } from "@/components/study-break-provider"
import { PageTransitionBar } from "@/components/ui/page-transition-bar"

export const metadata: Metadata = {
  title: 'CourseConnect',
  description: 'Your unified platform for college success.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg?v=2', type: 'image/svg+xml' },
      { url: '/favicon.ico?v=2', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.svg?v=2', sizes: '180x180', type: 'image/svg+xml' }
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
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg?v=2" />
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
