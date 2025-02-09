import './globals.css';
import { Inter } from 'next/font/google';
import { WebAppProvider } from '@/components/telegram/WebAppProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PolarisAI - Web3 Assistant',
  description: 'AI-powered crypto wallet assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WebAppProvider>
          {children}
        </WebAppProvider>
      </body>
    </html>
  );
}