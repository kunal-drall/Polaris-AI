'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Message } from '../../lib/agent/types';
import ChatMessage from '../../components/chat/ChatMessage';
import Suggestions from '../../components/chat/Suggestions';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Greetings, sire. I am Ailfred, your personal DeFi butler on Base. How may I assist you today?",
    timestamp: Date.now()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll when messages update

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I do apologize, sire, but I encountered an error while processing your request. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center px-8 py-4 bg-black border-b border-neutral-800">
        <div className="relative w-10 h-10">
          <Image
            src="/assets/logo.jpeg"
            alt="Ailfred Logo"
            fill
            className="rounded-full object-cover"
            priority
          />
        </div>
        <h1 className={`${playfair.className} ml-4 text-xl font-medium text-white`}>
          Ailfred
        </h1>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto py-6 bg-black">
        <div className="max-w-4xl mx-auto px-8">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-400">
                <span className="animate-pulse">Ailfred is thinking</span>
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
            )}
            <div ref={messagesEndRef} /> {/* Scroll anchor */}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-black border-t border-neutral-800">
        <div className="max-w-4xl mx-auto px-8 py-6 space-y-4">
          <Suggestions onSelect={(suggestion) => setInput(suggestion)} />
          
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How may I assist you, sire?"
              className="flex-1 px-4 py-3 bg-neutral-900 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-700 placeholder-gray-500 text-lg"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-700 disabled:opacity-50 transition-colors text-lg"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 