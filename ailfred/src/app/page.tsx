'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export default function LandingPage() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="relative w-40 h-40 mx-auto mb-8">
          <Image
            src="/assets/logo.jpeg"
            alt="Ailfred Logo"
            fill
            className="rounded-full object-cover"
            priority
          />
        </div>

        {/* Title and Description */}
        <div className="mb-10">
          <h1 className={`${playfair.className} text-6xl font-bold text-white mb-6`}>
            Ailfred
          </h1>
          <div>
            <p className={`${playfair.className} text-2xl text-white mb-3`}>
              How may I assist you today, sire?
            </p>
            <p className="text-lg text-gray-400">
              Your personal DeFi butler on Base, at your service.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <Link 
          href="/chat"
          className="inline-block bg-neutral-900 text-white px-8 py-4 text-xl rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Get Started
        </Link>

        {/* Powered by text */}
        <div className="fixed bottom-6 left-0 right-0 text-center text-gray-600 text-sm">
          Powered by Base AgentKit
        </div>
      </div>
    </div>
  );
}