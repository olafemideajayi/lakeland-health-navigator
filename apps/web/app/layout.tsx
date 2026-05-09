import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegister } from '@/components/ui/service-worker-register';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { InstallPrompt } from '@/components/ui/install-prompt';
import { PhiaConsent } from '@/components/ui/phia-consent';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export const metadata: Metadata = {
  title: 'Lakeland Health Navigator',
  description: 'Real-time healthcare navigation for rural Alberta — wait times, telehealth, and triage.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0066CC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <ServiceWorkerRegister />
        <OfflineBanner />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <PhiaConsent />
        <InstallPrompt />
      </body>
    </html>
  );
}
