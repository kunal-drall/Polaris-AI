'use client';

import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center py-4 px-6 bg-gray-800 shadow-lg">
      <Link href="/" className="text-2xl font-bold text-blue-400">
        Polaris AI 🚀
      </Link>
      <div className="flex space-x-4">
        <Link href="/#features" className="hover:text-blue-300">
          Features
        </Link>
        <Link href="/#get-started" className="hover:text-blue-300">
          Get Started
        </Link>
        <ConnectWallet />
      </div>
    </nav>
  );
}
