import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://indianrestaurantnearme.co.za'), 
  title: {
    default: 'Indian Restaurants Near Me | Find Best Indian Food Near You',
    template: '%s | Indian Restaurants SA',
  },
  description: 'Discover authentic Indian restaurants, curry houses, and takeaways across South Africa. Read reviews, view menus, and find the best Indian cuisine near you.',
  keywords: 'indian restaurants south africa, curry houses, indian takeaways, biryani, halal indian food, best indian restaurants',
  authors: [{ name: 'Indian Restaurants SA' }],
  creator: 'Indian Restaurants SA',
  publisher: 'Indian Restaurants SA',
  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Indian Restaurants SA | Find Best Indian Food Near You',
    description: 'Discover authentic Indian restaurants, curry houses, and takeaways across South Africa.',
    url: 'https://indianrestaurantnearme.co.za',
    siteName: 'Indian Restaurants SA',
    images: [
      {
        url: 'https://indianrestaurantnearme.co.za/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Indian Restaurants SA',
      },
    ],
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Indian Restaurants SA | Find Best Indian Food Near You',
    description: 'Discover authentic Indian restaurants across South Africa',
    images: ['https://indianrestaurantnearme.co.za/twitter-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code', // Google Search Console code
    // other verification codes
  },
  alternates: {
    canonical: 'https://indianrestaurantnearme.co.za',
  },
  category: 'Food & Dining',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <head>
           <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-GC0NLD0Z6H"
          strategy="afterInteractive"
        />
        
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GC0NLD0Z6H');
          `}
          </Script>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Organization",
                  name: "Indian Restaurants SA",
                  url: "https://indianrestaurantnearme.co.za",
                }),
              }}
        />
        </head>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}