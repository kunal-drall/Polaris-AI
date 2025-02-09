'use client';

import { useEffect, useState } from 'react';
import { useWebApp } from '@/components/telegram/WebAppProvider';
import dynamic from 'next/dynamic';

// Dynamically import wallet components to avoid SSR issues
const WalletDashboard = dynamic(
  () => import('@/components/wallet/WalletDashboard'),
  { 
    loading: () => <div className="flex justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>,
    ssr: false
  }
);

export default function Home() {
  const { webApp, isLoaded } = useWebApp();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isLoaded && webApp) {
      setIsReady(true);
    }
  }, [isLoaded, webApp]);

  if (!isReady) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main>
      <WalletDashboard />
    </main>
  );
}