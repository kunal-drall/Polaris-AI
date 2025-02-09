import React, { createContext, useContext, useEffect, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

type WebAppContextType = {
  webApp: any | null;
  isLoaded: boolean;
};

const WebAppContext = createContext<WebAppContextType>({
  webApp: null,
  isLoaded: false,
});

export const useWebApp = () => useContext(WebAppContext);

export const WebAppProvider = ({ children }: { children: React.ReactNode }) => {
  const [webApp, setWebApp] = useState<any | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const app = window.Telegram.WebApp;
      setWebApp(app);
      setIsLoaded(true);
      
      // Initialize the Mini App
      app.ready();
      
      // Match Telegram theme
      app.setHeaderColor(app.themeParams.bg_color);
      app.setBackgroundColor(app.themeParams.secondary_bg_color);

      // Expand to full height
      app.expand();
    }
  }, []);

  return (
    <>
      <Script 
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <WebAppContext.Provider value={{ webApp, isLoaded }}>
        {children}
      </WebAppContext.Provider>
    </>
  );
};
export type WalletState = {
    isLoading: boolean;
    address: string | null;
    balance: string | null;
    error: string | null;
};
