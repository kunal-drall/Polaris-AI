'use client';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import GetStarted from './components/GetStarted';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <Hero />
      <Features />
      <GetStarted />
    </div>
  );
}
