import {
    AgentKit,
    CdpWalletProvider,
    wethActionProvider,
    walletActionProvider,
    erc20ActionProvider,
    cdpApiActionProvider,
    pythActionProvider,
    cdpWalletActionProvider,
  } from "@coinbase/agentkit";
  import { getLangChainTools } from "@coinbase/agentkit-langchain";
  import { HumanMessage } from "@langchain/core/messages";
  import { MemorySaver } from "@langchain/langgraph";
  import { createReactAgent } from "@langchain/langgraph/prebuilt";
  import { ChatOpenAI } from "@langchain/openai";
  
  export class AgentService {
    private static instance: AgentService;
    private agentKit!: AgentKit;
    private agent: any;
    private walletProvider!: CdpWalletProvider;
  
    private constructor() {}
  
    public static async getInstance(): Promise<AgentService> {
      if (!AgentService.instance) {
        AgentService.instance = new AgentService();
        await AgentService.instance.initialize();
      }
      return AgentService.instance;
    }
  
    private async initialize() {
      try {
        // Initialize wallet provider
        this.walletProvider = await CdpWalletProvider.configureWithWallet({
          apiKeyName: process.env.NEXT_PUBLIC_CDP_API_KEY_NAME,
          apiKeyPrivateKey: process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY,
          networkId: "base-sepolia",
        });
  
        // Initialize AgentKit with all necessary providers
        this.agentKit = await AgentKit.from({
          walletProvider: this.walletProvider,
          actionProviders: [
            wethActionProvider(),
            pythActionProvider(),
            walletActionProvider(),
            erc20ActionProvider(),
            cdpApiActionProvider({
              apiKeyName: process.env.CDP_API_KEY_NAME,
              apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
            }),
            cdpWalletActionProvider({
              apiKeyName: process.env.CDP_API_KEY_NAME,
              apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
            }),
          ],
        });
  
        // Initialize LangChain agent
        const llm = new ChatOpenAI({
          modelName: "gpt-4-turbo-preview",
          temperature: 0.7,
        });
  
        const tools = await getLangChainTools(this.agentKit);
        const memory = new MemorySaver();
  
        this.agent = createReactAgent({
          llm,
          tools,
          checkpointSaver: memory,
          messageModifier: `
            You are PolarisAI, a helpful Web3 assistant that can interact with blockchain using the Coinbase Developer Platform AgentKit.
            You are empowered to interact onchain using your tools. You'll help users with:
            - Trading tokens and executing swaps
            - Checking token prices and market data
            - Managing wallet assets and transactions
            - Analyzing DeFi opportunities
            - Executing smart contract interactions
            
            If you ever need funds, you can request them from the faucet if on base-sepolia. Otherwise, provide wallet details 
            and request funds from the user. Before executing any action, get wallet details to confirm the network.
            
            Be concise and clear in your responses. If someone asks you to do something you can't do with your current tools,
            explain what's possible and what alternatives are available.
          `,
        });
  
      } catch (error) {
        console.error("Failed to initialize AgentService:", error);
        throw error;
      }
    }
  
    // Basic wallet operations
    public async getWalletDetails() {
      const address = await this.walletProvider.getAddress();
      const balance = await this.walletProvider.getBalance();
      return { address, balance };
    }
  
    public async getTransactionHistory() {
      try {
        // Implement transaction history fetching
        const address = await this.walletProvider.getAddress();
        // You would typically call an API here to get transaction history
        return [];
      } catch (error) {
        console.error("Failed to get transaction history:", error);
        throw error;
      }
    }
  
    // AI Chat functionality
    public async chat(message: string) {
      try {
        const stream = await this.agent.stream(
          { messages: [new HumanMessage(message)] },
          { configurable: { thread_id: "polaris-ai-chat" } }
        );
  
        return stream;
      } catch (error) {
        console.error("Chat error:", error);
        throw error;
      }
    }
  
    // Token operations
    public async getTokenPrice(symbol: string) {
      try {
        const result = await this.agentKit.execute({
          type: "token_prices_by_symbol",
          parameters: {
            symbols: [symbol],
          }
        });
        return result;
      } catch (error) {
        console.error("Failed to get token price:", error);
        throw error;
      }
    }
  
    public async swapTokens(fromToken: string, toToken: string, amount: string) {
      try {
        const result = await this.agentKit.execute({
          type: "swap_exact_tokens_for_tokens",
          parameters: {
            amountIn: amount,
            fromToken,
            toToken,
          }
        });
        return result;
      } catch (error) {
        console.error("Failed to swap tokens:", error);
        throw error;
      }
    }
  }