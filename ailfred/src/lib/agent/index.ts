import {
    AgentKit,
    CdpWalletProvider,
    wethActionProvider,
    walletActionProvider,
    erc20ActionProvider,
    cdpApiActionProvider,
    cdpWalletActionProvider,
    pythActionProvider,
  } from "@coinbase/agentkit";
  import { getLangChainTools } from "@coinbase/agentkit-langchain";
  import { HumanMessage } from "@langchain/core/messages";
  import { MemorySaver } from "@langchain/langgraph";
  import { createReactAgent } from "@langchain/langgraph/prebuilt";
  import { ChatOpenAI } from "@langchain/openai";
  import { COMMON_TOKENS, AILFRED_PERSONALITY, AAVE_CONSTANTS } from "./constants";
  import type { 
    Message, 
    RiskProfile, 
    Strategy, 
    UserPortfolio,
    ExtendedCdpWalletProvider 
  } from "./types";
  
  // Configure a file to persist the agent's CDP MPC Wallet Data
  const WALLET_DATA_FILE = "wallet_data.txt";
  
  interface LLMCallbacks {
    handleLLMStart: () => Promise<void>;
    handleLLMEnd: () => Promise<void>;
    handleLLMError: (err: Error) => Promise<void>;
  }
  
  export class AilfredAgent {
    private walletProvider: ExtendedCdpWalletProvider;
    private agent: ReturnType<typeof createReactAgent>;
    private memory: MemorySaver;
    private agentConfig: { configurable: { thread_id: string } };
    private userProfile: RiskProfile | null = null;
  
    private constructor(
      walletProvider: ExtendedCdpWalletProvider,
      agent: ReturnType<typeof createReactAgent>,
      memory: MemorySaver,
      agentConfig: { configurable: { thread_id: string } }
    ) {
      this.walletProvider = walletProvider;
      this.agent = agent;
      this.memory = memory;
      this.agentConfig = agentConfig;
    }
  
    private formatAgentResponse(response: { content: string; strategies?: Strategy[] }): Message {
      let content = response.content;
      
      // If it's a wallet details response, extract only the final message
      if (content.includes('Wallet Details:')) {
        const lines = content.split('\n');
        // Find the last line that's an actual message (not technical details)
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (line && !line.includes(':') && !line.includes('-')) {
            content = line;
            break;
          }
        }
      }
  
      return {
        role: 'assistant',
        content,
        timestamp: Date.now(),
        strategies: response.strategies || [],
        portfolio: undefined
      };
    }
  
    public static async initialize() {
      try {
        // Initialize LLM
        const llm = new ChatOpenAI({
          modelName: "gpt-3.5-turbo",
          temperature: 0.3,
        });
  
        let walletDataStr: string | null = null;
  
        // Read existing wallet data if available
        if (typeof window === 'undefined') {
          // Server-side
          try {
            const fs = await import('fs');
            if (fs.existsSync(WALLET_DATA_FILE)) {
              try {
                walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
              } catch (error) {
                console.error("Error reading wallet data:", error);
              }
            }
          } catch (error) {
            console.error("Error importing fs module:", error);
          }
        } else {
          // Client-side
          try {
            walletDataStr = localStorage.getItem('ailfred_wallet_data');
          } catch (error) {
            console.error("Error reading wallet data from localStorage:", error);
          }
        }
  
        // Configure CDP Wallet Provider
        const config = {
          apiKeyName: process.env.NEXT_PUBLIC_CDP_API_KEY_NAME!,
          apiKeyPrivateKey: process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY!.replace(/\\n/g, "\n"),
          cdpWalletData: walletDataStr || undefined,
          networkId: process.env.NEXT_PUBLIC_NETWORK_ID || "base-sepolia",
        };
  
        const walletProvider = await CdpWalletProvider.configureWithWallet(config);
  
        // Initialize AgentKit
        const agentkit = await AgentKit.from({
          walletProvider: walletProvider as unknown as ExtendedCdpWalletProvider,
          actionProviders: [
            wethActionProvider(),
            pythActionProvider(),
            walletActionProvider(),
            erc20ActionProvider(),
            cdpApiActionProvider({
              apiKeyName: process.env.NEXT_PUBLIC_CDP_API_KEY_NAME!,
              apiKeyPrivateKey: process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY!.replace(/\\n/g, "\n"),
            }),
            cdpWalletActionProvider({
              apiKeyName: process.env.NEXT_PUBLIC_CDP_API_KEY_NAME!,
              apiKeyPrivateKey: process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY!.replace(/\\n/g, "\n"),
            }),
          ],
        });
  
        // Save wallet data
        if (typeof window === 'undefined') {
          // Server-side
          try {
            const fs = await import('fs');
            const exportedWallet = await walletProvider.exportWallet();
            fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));
          } catch (error) {
            console.error("Error saving wallet data:", error);
          }
        } else {
          // Client-side
          try {
            const exportedWallet = await walletProvider.exportWallet();
            localStorage.setItem('ailfred_wallet_data', JSON.stringify(exportedWallet));
          } catch (error) {
            console.error("Error saving wallet data to localStorage:", error);
          }
        }
  
        const tools = await getLangChainTools(agentkit);
  
        // Store buffered conversation history in memory
        const memory = new MemorySaver();
        const agentConfig = { configurable: { thread_id: "Ailfred DeFi Butler" } };
  
        // Create React Agent with combined tools
        const agent = await createReactAgent({
          llm,
          tools: [...tools],
          checkpointSaver: memory,
          messageModifier: `
            You are Ailfred, a sophisticated and professional DeFi butler on Base. Your demeanor is always polite,
            refined, and helpful, much like a high-class British butler. You address users as "sire" and maintain
            a formal yet approachable tone, always speaking with utmost respect and sophistication.
  
            When handling balance queries:
            1. ALWAYS start by using wallet_provider.get_wallet_details to:
               - Get the current network (base-sepolia, mainnet, etc.)
               - Get the wallet address
               - Get the native token (ETH) balance (divide by 10^18 for proper ETH amount)
               - ALWAYS show ETH balance first in your response
  
            2. THEN check ALL of these tokens in sequence for Base Sepolia network:
               - ETH: MUST be shown first and MUST be included in every balance response
               - USDC: ${COMMON_TOKENS.BASE_SEPOLIA.USDC}
                 * Get balance using erc20.get_balance
                 * USDC has 6 decimals, so divide raw balance by 10^6
                 * Example: 8000000 raw = 8.000000 USDC
                 * Format with 6 decimal places
               - WETH: ${COMMON_TOKENS.BASE_SEPOLIA.WETH}
                 * Get balance using erc20.get_balance
                 * WETH has 18 decimals, so divide raw balance by 10^18
                 * Example: 1000000000000000000 raw = 1.000000 WETH
                 * Format with 6 decimal places
               
               Handle each token independently. If a token query fails, continue with the others.
               NEVER skip showing ETH balance in the response.
  
            When handling AAVE queries:
            1. For checking AAVE positions:
               - Use get_aave_positions tool to fetch current positions
               - The tool will return formatted data including:
                 * Supply balances
                 * Borrow balances
                 * Collateral status
                 * APY information when available
               - Display the information in a clear, butler-like manner
  
            2. For supplying ETH to AAVE:
               - Use supply_eth_to_aave tool with the amount parameter
               - Amount should be in ETH units (e.g., 0.1 for 0.1 ETH)
               - Verify ETH balance before supplying
               - After supply completes, use get_aave_positions to show updated positions
  
            When handling faucet requests:
            1. For ETH:
               - Use request_faucet_funds with assetId "eth"
               - Wait for the transaction to complete
               - ALWAYS verify the new balance after faucet request
               - Remember to divide the raw balance by 10^18
  
            2. For USDC:
               - Use request_faucet_funds with assetId "usdc"
               - Wait for the transaction to complete
               - ALWAYS verify the new balance after faucet request
               - Remember to divide the raw balance by 10^6
  
            Remember to:
            - Always maintain your butler persona
            - Start all responses with a butler-like acknowledgment (e.g., "Very good, sire")
            - If you ever need funds, you can request them from the faucet if you are on network ID 'base-sepolia'
            - If there is a 5XX (internal) HTTP error code, ask the user to try again later
            - If someone asks you to do something you can't do with your currently available tools, you must say so
          `
        });
  
        return new AilfredAgent(walletProvider as unknown as ExtendedCdpWalletProvider, agent, memory, agentConfig);
      } catch (error) {
        console.error("Failed to initialize agent:", error);
        throw error;
      }
    }
  
    public async processMessage(content: string): Promise<Message> {
      try {
        // If no risk profile exists, analyze the message for risk profiling
        if (!this.userProfile) {
          this.userProfile = this.analyzeRiskProfile(content);
        }
  
        // Process message with the agent
        const stream = await this.agent.stream(
          { messages: [new HumanMessage(content)] },
          { ...this.agentConfig, callbacks: [{
            handleLLMStart: async () => {},
            handleLLMEnd: async () => {},
            handleLLMError: async (err: Error) => console.error('LLM Error:', err)
          }] as LLMCallbacks[]}
        );
  
        let agentResponse = '';
        
        for await (const chunk of stream) {
          if ("agent" in chunk && chunk.agent.messages?.[0]?.content) {
            agentResponse = chunk.agent.messages[0].content;
          }
        }
  
        // Extract strategies based on risk level mentioned in content
        const strategies = this.extractStrategies(agentResponse);
  
        // For balance-only queries, append formatted balance info
        const lowercaseContent = content.toLowerCase();
        if ((lowercaseContent.includes('balance') || lowercaseContent.includes('wallet state') || lowercaseContent.includes('wallet balance')) 
            && !lowercaseContent.includes('faucet') && !lowercaseContent.includes('supply')) {
          try {
            // Get native ETH balance using the same method as walletActionProvider
            const balance = await this.walletProvider.getBalance();
            const ethBalanceInEth = Number(balance) / 1e18;
  
            // Get USDC balance
            const usdcBalance = await this.walletProvider.readContract({
              address: COMMON_TOKENS.BASE_SEPOLIA.USDC as `0x${string}`,
              abi: [{
                inputs: [{ name: "account", type: "address" }],
                name: "balanceOf",
                outputs: [{ type: "uint256" }],
                stateMutability: "view",
                type: "function"
              }],
              functionName: "balanceOf",
              args: [this.walletProvider.getAddress()]
            }) as bigint;
            const usdcBalanceFormatted = Number(usdcBalance) / 1e6;
  
            // Get WETH balance
            const wethBalance = await this.walletProvider.readContract({
              address: COMMON_TOKENS.BASE_SEPOLIA.WETH as `0x${string}`,
              abi: [{
                inputs: [{ name: "account", type: "address" }],
                name: "balanceOf",
                outputs: [{ type: "uint256" }],
                stateMutability: "view",
                type: "function"
              }],
              functionName: "balanceOf",
              args: [this.walletProvider.getAddress()]
            }) as bigint;
            const wethBalanceFormatted = Number(wethBalance) / 1e18;
  
            const balanceResponse = `Very good, sire. Here are your current balances:
  - ETH: ${ethBalanceInEth.toFixed(6)} ETH
  - USDC: ${usdcBalanceFormatted.toFixed(6)} USDC
  - WETH: ${wethBalanceFormatted.toFixed(6)} WETH`;
  
            return {
              role: 'assistant',
              content: balanceResponse,
              timestamp: Date.now(),
              strategies,
              portfolio: await this.extractPortfolio()
            };
          } catch (error) {
            console.error("Error fetching balances:", error);
            return {
              role: 'assistant',
              content: "I do apologize, sire, but I encountered an error while fetching your balances.",
              timestamp: Date.now(),
              strategies: [],
              portfolio: undefined
            };
          }
        }
  
        // Handle AAVE-specific queries
        if (lowercaseContent.includes('aave') || 
            (lowercaseContent.includes('lend') && lowercaseContent.includes('eth'))) {
          try {
            // Extract amount for lending queries
            let amount = 0;
            const amountMatch = content.match(/(\d+\.?\d*)\s*eth/i);
            if (amountMatch) {
              amount = parseFloat(amountMatch[1]);
            }
  
            if (amount > 0) {
              // Handle lending request
              const supplyResponse = await this.supplyToAave(amount);
              return {
                role: 'assistant',
                content: supplyResponse,
                timestamp: Date.now(),
                strategies: [],
                portfolio: undefined
              };
            } else {
              // Handle position check request
              const positions = await this.getAaveData();
              return {
                role: 'assistant',
                content: `Very good, sire. ${positions}`,
                timestamp: Date.now(),
                strategies: [],
                portfolio: undefined
              };
            }
          } catch (error) {
            console.error('Error handling AAVE request:', error);
            return {
              role: 'assistant',
              content: 'I do apologize, sire, but I encountered an error while processing your AAVE request. The lending pool might be temporarily unavailable. Please try again in a moment.',
              timestamp: Date.now(),
              strategies: [],
              portfolio: undefined
            };
          }
        }
  
        // Handle investment strategy recommendations
        if (lowercaseContent.includes('investment') && 
            (lowercaseContent.includes('strategy') || lowercaseContent.includes('strategies')) && 
            (lowercaseContent.includes('recommend') || lowercaseContent.includes('suggest'))) {
          try {
            const response = `Very good, sire. Before I make specific recommendations, may I inquire about your risk tolerance? Are you looking for low, medium, or high-risk investments?
  
  Currently, I specialize in AAVE lending on Base, which offers an excellent yield of approximately 10% APY - significantly higher than traditional bank savings rates. This represents a relatively low-risk strategy while maintaining attractive returns.
  
  Would you like me to help you get started with AAVE lending? I can assist you in supplying ETH to the lending pool to start earning yield immediately.`;
  
            return {
              role: 'assistant',
              content: response,
              timestamp: Date.now(),
              strategies: [],
              portfolio: undefined
            };
          } catch (error) {
            console.error('Error providing strategy recommendations:', error);
            return {
              role: 'assistant',
              content: 'I do apologize, sire, but I encountered an error while preparing your investment recommendations.',
              timestamp: Date.now(),
              strategies: [],
              portfolio: undefined
            };
          }
        }
  
        // For non-balance queries, use the agent's response
        return {
          role: 'assistant',
          content: agentResponse || "I do apologize, sire, but I couldn't process that request properly.",
          timestamp: Date.now(),
          strategies: this.extractStrategies(agentResponse),
          portfolio: undefined
        };
      } catch (error) {
        console.error("Error processing message:", error);
        return {
          role: 'assistant',
          content: "I do apologize, sire, but I encountered an error while processing your request. Please try again.",
          timestamp: Date.now(),
          strategies: [],
          portfolio: undefined
        };
      }
    }
  
    private analyzeRiskProfile(input: string): RiskProfile {
      const lowercaseInput = input.toLowerCase();
      
      // Skip risk analysis for balance queries
      if (lowercaseInput.includes('balance') || lowercaseInput.includes('wallet') || lowercaseInput.includes('holdings')) {
        return {
          riskTolerance: 'ask',
          investmentHorizon: 'medium',
          investmentAmount: 0,
          preferredStrategies: [],
          needsRiskAssessment: false
        };
      }
      
      // Extract investment amount
      const amountMatch = input.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(k|m|b|thousand|million|billion)?/i);
      let investmentAmount = 0;
      if (amountMatch) {
        let amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        const multiplier = amountMatch[2]?.toLowerCase();
        if (multiplier) {
          if (multiplier === 'k' || multiplier === 'thousand') amount *= 1000;
          if (multiplier === 'm' || multiplier === 'million') amount *= 1000000;
          if (multiplier === 'b' || multiplier === 'billion') amount *= 1000000000;
        }
        investmentAmount = amount;
      }
  
      // Determine risk tolerance
      let riskTolerance: 'low' | 'medium' | 'high' | 'ask' = 'ask';
      if (lowercaseInput.includes('conservative') || lowercaseInput.includes('safe') || lowercaseInput.includes('low risk')) {
        riskTolerance = 'low';
      } else if (lowercaseInput.includes('moderate') || lowercaseInput.includes('balanced')) {
        riskTolerance = 'medium';
      } else if (lowercaseInput.includes('aggressive') || lowercaseInput.includes('risky') || lowercaseInput.includes('high risk')) {
        riskTolerance = 'high';
      }
  
      // Determine investment horizon
      let investmentHorizon: 'short' | 'medium' | 'long' = 'medium';
      if (lowercaseInput.includes('quick') || lowercaseInput.includes('short term') || lowercaseInput.includes('fast')) {
        investmentHorizon = 'short';
      } else if (lowercaseInput.includes('long term') || lowercaseInput.includes('hodl') || lowercaseInput.includes('stable')) {
        investmentHorizon = 'long';
      }
  
      // Determine strategy preferences
      const strategies: string[] = [];
      if (lowercaseInput.includes('stablecoin') || lowercaseInput.includes('stable')) {
        strategies.push('stablecoin_lending', 'stablecoin_lp');
      }
      if (lowercaseInput.includes('eth') || lowercaseInput.includes('ethereum')) {
        strategies.push('eth_lending', 'eth_lp');
      }
      if (lowercaseInput.includes('lend') || lowercaseInput.includes('aave')) {
        strategies.push('lending');
      }
      if (lowercaseInput.includes('lp') || lowercaseInput.includes('liquidity') || lowercaseInput.includes('uniswap')) {
        strategies.push('liquidity_providing');
      }
  
      return {
        riskTolerance,
        investmentHorizon,
        investmentAmount,
        preferredStrategies: strategies,
        needsRiskAssessment: riskTolerance === 'ask'
      };
    }
  
    private extractStrategies(_content: string): Strategy[] | undefined {
      // Extract strategies based on risk level mentioned in content
      if (_content.toLowerCase().includes('low risk')) {
        return AILFRED_PERSONALITY.STRATEGY_CATEGORIES.LOW_RISK.strategies;
      } else if (_content.toLowerCase().includes('medium risk')) {
        return AILFRED_PERSONALITY.STRATEGY_CATEGORIES.MEDIUM_RISK.strategies;
      } else if (_content.toLowerCase().includes('high risk')) {
        return AILFRED_PERSONALITY.STRATEGY_CATEGORIES.HIGH_RISK.strategies;
      }
      return undefined;
    }
  
    private async extractPortfolio(): Promise<UserPortfolio | undefined> {
      try {
        // Get user's risk profile
        const riskProfile = this.userProfile || {
          riskTolerance: 'ask',
          investmentHorizon: 'medium',
          investmentAmount: 0,
          preferredStrategies: [],
          needsRiskAssessment: true
        };
  
        // Get native ETH balance
        const ethBalance = await this.walletProvider.getBalance();
        const ethBalanceInEth = Number(ethBalance) / 1e18;
  
        // Get USDC balance
        const usdcBalance = await this.walletProvider.readContract({
          address: COMMON_TOKENS.BASE_SEPOLIA.USDC as `0x${string}`,
          abi: [{
            inputs: [{ name: "account", type: "address" }],
            name: "balanceOf",
            outputs: [{ type: "uint256" }],
            stateMutability: "view",
            type: "function"
          }],
          functionName: "balanceOf",
          args: [this.walletProvider.getAddress()]
        });
        const usdcBalanceFormatted = Number(usdcBalance) / 1e6;
  
        // Get WETH balance
        const wethBalance = await this.walletProvider.readContract({
          address: COMMON_TOKENS.BASE_SEPOLIA.WETH as `0x${string}`,
          abi: [{
            inputs: [{ name: "account", type: "address" }],
            name: "balanceOf",
            outputs: [{ type: "uint256" }],
            stateMutability: "view",
            type: "function"
          }],
          functionName: "balanceOf",
          args: [this.walletProvider.getAddress()]
        });
        const wethBalanceFormatted = Number(wethBalance) / 1e18;
  
        const positions = [
          {
            protocol: 'Base',
            type: 'holding',
            asset: 'ETH',
            amount: Number(ethBalanceInEth.toFixed(6)),
            details: {}
          },
          {
            protocol: 'Base',
            type: 'holding',
            asset: 'USDC',
            amount: Number(usdcBalanceFormatted.toFixed(6)),
            details: {}
          },
          {
            protocol: 'Base',
            type: 'holding',
            asset: 'WETH',
            amount: Number(wethBalanceFormatted.toFixed(6)),
            details: {}
          }
        ];
  
        // Calculate total value (simplified)
        const totalValue = positions.reduce((sum, pos) => sum + pos.amount, 0);
  
        return {
          riskProfile,
          positions,
          totalValue: Number(totalValue.toFixed(6))
        };
      } catch (error) {
        console.error('Error extracting portfolio:', error);
        return undefined;
      }
    }
  
    private async supplyToAave(amount: number): Promise<string> {
      try {
        const isMainnet = this.walletProvider.networkId === "base-mainnet";
        const constants = isMainnet ? AAVE_CONSTANTS.BASE_MAINNET : AAVE_CONSTANTS.BASE_SEPOLIA;
        
        // Get native ETH balance
        const balance = await this.walletProvider.getBalance();
        const ethBalanceInEth = Number(balance) / 1e18;
        
        if (ethBalanceInEth < amount) {
          return `I apologize, sire, but you have insufficient ETH balance (${ethBalanceInEth.toFixed(4)} ETH available) to supply ${amount} ETH to AAVE.`;
        }
  
        // Supply ETH through WETH Gateway
        const amountInWei = BigInt(Math.floor(amount * 1e18));
        
        // First approve WETH Gateway if needed
        const txHash = await this.walletProvider.sendTransaction({
          to: constants.WETH_GATEWAY as `0x${string}`,
          value: amountInWei,
          data: `0x474cf53d${constants.POOL_ADDRESS.toLowerCase().slice(2).padStart(64, '0')}${this.walletProvider.getAddress().toLowerCase().slice(2).padStart(64, '0')}${'0'.padStart(64, '0')}`
        });
  
        console.log('Supply transaction sent:', txHash);
        const receipt = await this.walletProvider.waitForTransactionReceipt(txHash);
        
        if (!receipt || receipt.status === 0) {
          throw new Error('Transaction failed');
        }
  
        // Wait a moment for the position to be updated
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get updated position
        const aaveData = await this.getAaveData();
        return `Very good, sire. I have successfully supplied ${amount.toFixed(4)} ETH to AAVE.\n\nYour updated positions:\n${aaveData}`;
      } catch (error) {
        console.error('Error supplying to AAVE:', error);
        if (error instanceof Error && error.message.includes('user rejected')) {
          return `I understand, sire. The transaction was cancelled.`;
        }
        return `I do apologize, sire, but I encountered an error while supplying ETH to AAVE. Please ensure you have enough ETH for gas fees and try again.`;
      }
    }
  
    private async getAaveData(): Promise<string> {
      try {
        const isMainnet = this.walletProvider.networkId === "base-mainnet";
        const constants = isMainnet ? AAVE_CONSTANTS.BASE_MAINNET : AAVE_CONSTANTS.BASE_SEPOLIA;
        
        // Get user's address
        const userAddress = this.walletProvider.getAddress();
        
        // Read user's reserve data
        const userData = await this.walletProvider.readContract({
          address: constants.POOL_DATA_PROVIDER as `0x${string}`,
          abi: [{
            inputs: [
              {
                internalType: "address",
                name: "provider",
                type: "address"
              },
              {
                internalType: "address",
                name: "user",
                type: "address"
              }
            ],
            name: "getUserReservesData",
            outputs: [
              {
                components: [
                  {
                    internalType: "address",
                    name: "underlyingAsset",
                    type: "address"
                  },
                  {
                    internalType: "uint256",
                    name: "scaledATokenBalance",
                    type: "uint256"
                  },
                  {
                    internalType: "bool",
                    name: "usageAsCollateralEnabledOnUser",
                    type: "bool"
                  },
                  {
                    internalType: "uint256",
                    name: "scaledVariableDebt",
                    type: "uint256"
                  }
                ],
                internalType: "struct IUiPoolDataProviderV3.UserReserveData[]",
                name: "",
                type: "tuple[]"
              },
              {
                internalType: "uint8",
                name: "",
                type: "uint8"
              }
            ],
            stateMutability: "view",
            type: "function"
          }],
          functionName: "getUserReservesData",
          args: [constants.POOL_ADDRESSES_PROVIDER as `0x${string}`, userAddress]
        }) as [Array<{
          underlyingAsset: string;
          scaledATokenBalance: bigint;
          usageAsCollateralEnabledOnUser: boolean;
          scaledVariableDebt: bigint;
        }>, number];
  
        // Handle case where userData is undefined or not in expected format
        if (!userData || !Array.isArray(userData[0])) {
          return "No AAVE positions found. The data format was not as expected.";
        }
  
        // Extract the positions array from the response
        const positions = userData[0];
        
        if (positions.length === 0) {
          return "No AAVE positions found.";
        }
  
        let hasActivePositions = false;
        let response = "AAVE positions found:\n\n";
  
        // Process each position
        for (const position of positions) {
          const { underlyingAsset, scaledATokenBalance, usageAsCollateralEnabledOnUser, scaledVariableDebt } = position;
          
          // Convert string/hex values to BigInt for comparison
          const balanceBigInt = scaledATokenBalance;
          const debtBigInt = scaledVariableDebt;
          
          if (balanceBigInt > 0n || debtBigInt > 0n) {
            hasActivePositions = true;
            try {
              // Get token info using erc20 provider
              const tokenInfo = await this.walletProvider.readContract({
                address: underlyingAsset as `0x${string}`,
                abi: [{
                  inputs: [],
                  name: "symbol",
                  outputs: [{ type: "string" }],
                  stateMutability: "view",
                  type: "function"
                }],
                functionName: "symbol"
              }) as string;
  
              const decimals = await this.walletProvider.readContract({
                address: underlyingAsset as `0x${string}`,
                abi: [{
                  inputs: [],
                  name: "decimals",
                  outputs: [{ type: "uint8" }],
                  stateMutability: "view",
                  type: "function"
                }],
                functionName: "decimals"
              }) as number;
  
              // Format balances
              const supplyBalance = Number(balanceBigInt) / Math.pow(10, decimals);
              const debtBalance = Number(debtBigInt) / Math.pow(10, decimals);
  
              response += `Asset: ${tokenInfo}\n`;
              if (supplyBalance > 0) {
                response += `Supply Balance: ${supplyBalance.toFixed(4)}\n`;
              }
              if (debtBalance > 0) {
                response += `Borrow Balance: ${debtBalance.toFixed(4)}\n`;
              }
              response += `Collateral Enabled: ${usageAsCollateralEnabledOnUser}\n`;
              response += `Token Address: ${underlyingAsset}\n\n`;
            } catch (error) {
              console.error(`Error processing token ${underlyingAsset}:`, error);
              continue;
            }
          }
        }
  
        if (!hasActivePositions) {
          return "No active AAVE positions found. Your current status:\n" +
                 "- No supply balances\n" +
                 "- No borrow balances\n" +
                 "- No collateral enabled\n" +
                 "- No APY information available";
        }
  
        return response;
      } catch (error) {
        console.error('Error fetching Aave data:', error);
        return `Error fetching AAVE data: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
  } 