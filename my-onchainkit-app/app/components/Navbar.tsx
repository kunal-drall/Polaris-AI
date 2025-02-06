"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { motion } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Wallet connection state
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 🔹 Brand Logo */}
          <div className="flex items-center">
            <button
              onClick={() => router.push("/")}
              className="text-2xl font-bold text-blue-600 dark:text-blue-400"
            >
              Polaris AI
            </button>
          </div>

          {/* 🔹 Navigation Links (Desktop) */}
          <div className="hidden md:flex space-x-6">
            {["Home", "Dashboard", "Chat", "Telegram Bot"].map((item) => (
              <button
                key={item}
                onClick={() => router.push(`/${item.toLowerCase().replace(" ", "")}`)}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition duration-300"
              >
                {item}
              </button>
            ))}
          </div>

          {/* 🔹 Right Section (Wallet + Theme Toggle) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* 🌞 Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-300"
            >
              {theme === "dark" ? "🌞" : "🌙"}
            </button>

            {/* 💳 Wallet Connection */}
            {isConnected ? (
              <div className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-800 p-2 rounded-lg">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
                  {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => connect()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* 🔹 Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {!isOpen ? "☰" : "✖"}
          </button>
        </div>
      </div>

      {/* 🔹 Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white dark:bg-gray-800 py-4"
        >
          <div className="flex flex-col space-y-2 text-center">
            {["Home", "Dashboard", "Chat", "Telegram Bot"].map((item) => (
              <button
                key={item}
                onClick={() => {
                  router.push(`/${item.toLowerCase().replace(" ", "")}`);
                  setIsOpen(false);
                }}
                className="py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {item}
              </button>
            ))}
          </div>

          {/* 💳 Mobile Wallet & Theme Toggle */}
          <div className="mt-4 flex flex-col items-center space-y-2">
            {isConnected ? (
              <div className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-800 p-2 rounded-lg">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
                  {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => connect()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Connect Wallet
              </button>
            )}

            {/* 🌞 Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-300"
            >
              {theme === "dark" ? "🌞" : "🌙"}
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
