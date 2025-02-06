"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 🔹 Brand Logo */}
          <button
            onClick={() => router.push("/")}
            className="text-2xl font-bold text-blue-600 dark:text-blue-400"
          >
            Polaris AI
          </button>

          {/* 🔹 Desktop Navigation */}
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
        </motion.div>
      )}
    </nav>
  );
}
