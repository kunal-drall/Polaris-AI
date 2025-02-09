import React, { useState, useEffect } from 'react';
import { useWebApp } from '../telegram/WebAppProvider';
import { AgentService } from '@/services/agent-service';
import ChatInterface from '../chat/ChatInterface';

type WalletState = {
  isLoading: boolean;
  address: string | null;
  balance: string | null;
  error: string | null;
};

type Transaction = {
  hash: string;
  type: 'send' | 'receive' | 'swap';
  amount: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
};

const WalletDashboard = () => {
  const { webApp } = useWebApp();
  const [walletState, setWalletState] = useState<WalletState>({
    isLoading: true,
    address: null,
    balance: null,
    error: null
  });

  const [activeTab, setActiveTab] = useState('wallet');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sendFormData, setSendFormData] = useState({
    to: '',
    amount: '',
  });
  const [isTransacting, setIsTransacting] = useState(false);

  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const agentService = await AgentService.getInstance();
        const { address, balance } = await agentService.getWalletDetails();
        
        setWalletState({
          isLoading: false,
          address,
          balance: balance.toString(),
          error: null
        });

        // Fetch transaction history
        const history = await agentService.getTransactionHistory();
        setTransactions(history);

      } catch (error) {
        setWalletState({
          isLoading: false,
          address: null,
          balance: null,
          error: error instanceof Error ? error.message : 'An unknown error occurred'
        });
      }
    };

    initializeWallet();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendFormData.to || !sendFormData.amount) return;

    setIsTransacting(true);
    try {
      const agentService = await AgentService.getInstance();
      await agentService.chat(`Send ${sendFormData.amount} ETH to ${sendFormData.to}`);
      
      // Refresh wallet state
      const { address, balance } = await agentService.getWalletDetails();
      setWalletState(prev => ({
        ...prev,
        balance: balance.toString(),
      }));

      // Clear form
      setSendFormData({ to: '', amount: '' });

      // Show success message
      webApp.showPopup({
        title: 'Success',
        message: 'Transaction sent successfully!',
        buttons: [{ type: 'close' }]
      });

    } catch (error) {
      webApp.showPopup({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Transaction failed',
        buttons: [{ type: 'close' }]
      });
    } finally {
      setIsTransacting(false);
    }
  };

  const handleQRScan = async () => {
    try {
      webApp.showScanQrPopup({
        text: "Scan wallet QR code"
      }, (text: string) => {
        if (text) {
          setSendFormData(prev => ({ ...prev, to: text }));
          return true; // close the scanner
        }
        return false;
      });
    } catch (error) {
      console.error('QR scan error:', error);
    }
  };

  const handleShare = async () => {
    if (!walletState.address) return;
    
    try {
      await webApp.showPopup({
        title: 'Share Wallet Address',
        message: 'Would you like to share your wallet address?',
        buttons: [
          {
            id: 'share',
            type: 'default',
            text: 'Share'
          },
          { type: 'cancel' }
        ]
      });

      // Create a message with the wallet address
      const message = `My ETH wallet address:\n${walletState.address}`;
      webApp.switchInlineQuery(message, ['users', 'groups', 'channels']);
      
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (walletState.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Navigation Tabs */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-2 ${activeTab === 'wallet' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('wallet')}
        >
          Wallet
        </button>
        <button
          className={`flex-1 py-2 ${activeTab === 'chat' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('chat')}
        >
          AI Assistant
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'wallet' ? (
          <div className="p-4 space-y-4 overflow-y-auto h-full">
            {/* Wallet Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h2 className="text-lg font-semibold mb-4">Wallet Overview</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono break-all bg-gray-50 dark:bg-gray-900 p-2 rounded flex-1">
                      {walletState.address}
                    </p>
                    <button 
                      onClick={handleShare}
                      className="p-2 text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      Share
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                  <p className="text-2xl font-bold">
                    {walletState.balance} ETH
                  </p>
                </div>
              </div>
            </div>

            {/* Send Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h2 className="text-lg font-semibold mb-4">Send ETH</h2>
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Recipient Address</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sendFormData.to}
                      onChange={(e) => setSendFormData(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="0x..."
                      className="flex-1 p-2 border rounded-lg bg-gray-50 dark:bg-gray-900"
                      disabled={isTransacting}
                    />
                    <button
                      type="button"
                      onClick={handleQRScan}
                      className="p-2 text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      disabled={isTransacting}
                    >
                      Scan QR
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount (ETH)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={sendFormData.amount}
                    onChange={(e) => setSendFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.0"
                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900"
                    disabled={isTransacting}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isTransacting || !sendFormData.to || !sendFormData.amount}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg disabled:opacity-50"
                >
                  {isTransacting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send'
                  )}
                </button>
              </form>
            </div>

            {/* Transaction History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
              {transactions.length === 0 ? (
                <p className="text-center text-gray-500">No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx, index) => (
                    <div 
                      key={tx.hash || index}
                      className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium">{tx.type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.timestamp * 1000).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{tx.amount} ETH</p>
                        <p className={`text-xs ${
                          tx.status === 'completed' ? 'text-green-500' : 
                          tx.status === 'failed' ? 'text-red-500' : 
                          'text-yellow-500'
                        }`}>
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <ChatInterface />
        )}
      </div>
    </div>
  );
};

export default WalletDashboard;