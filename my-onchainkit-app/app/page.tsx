"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FeatureCard from "./components/FeatureCard";
import CodeSnippet from "./components/CodeSnippet";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600 dark:text-gray-400">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* 🔹 HERO SECTION */}
        <section className="text-center mb-16">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome to Polaris AI - Your Web3 AI Assistant
          </motion.h1>
          <motion.p
            className="text-xl mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            A powerful AI-driven platform to manage on-chain assets, swap tokens, stake funds, and interact with
            decentralized chatbots.
          </motion.p>
          <motion.button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => router.push("/dashboard")}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Get Started
          </motion.button>
        </section>

        {/* 🔹 FEATURE SECTION */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard title="AI-Powered Transactions" description="Perform swaps, staking, and bridging with ease." />
            <FeatureCard title="On-Chain Chatbot" description="Interact via web-based and Telegram chat." />
            <FeatureCard title="Decentralized Identity" description="Fetch usernames, avatars, and balances." />
            <FeatureCard title="Secure & Trustless" description="Ensuring user privacy and smart contract security." />
          </div>
        </section>

        {/* 🔹 CODE SNIPPETS SECTION */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Code Snippets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CodeSnippet
              title="Swap Tokens"
              code={`
// Example: Ask Polaris AI to Swap Tokens
User: "Swap 0.1 ETH for USDC"
Polaris AI: "Transaction initiated! Check your wallet."
              `}
            />
            <CodeSnippet
              title="Stake Funds"
              code={`
// Example: Staking Funds
User: "Stake 50 USDC on Base Network"
Polaris AI: "Your USDC is now staked!"
              `}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
