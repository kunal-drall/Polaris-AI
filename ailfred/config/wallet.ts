// Create a new file: config/wallet.ts
import { CdpWalletProvider } from "@coinbase/agentkit";

export async function initializeWallet() {
    try {
        // Configuration for CDP Wallet
        const config = {
            apiKeyName: process.env.NEXT_PUBLIC_CDP_API_KEY_NAME!,
            apiKeyPrivateKey: process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY!.replace(/\\n/g, "\n"),
            networkId: process.env.NEXT_PUBLIC_NETWORK_ID || "base-sepolia",
            // Use your existing wallet data if you want to maintain the same wallet
            cdpWalletData: undefined  // Remove this line if you want a new wallet
        };

        // Initialize wallet provider
        const walletProvider = await CdpWalletProvider.configureWithWallet(config);
        
        // Get wallet address
        const address = walletProvider.getAddress();
        console.log('Wallet initialized with address:', address);

        return walletProvider;
    } catch (error) {
        console.error('Failed to initialize wallet:', error);
        throw error;
    }
}