export const PROTOCOL_CONSTANTS = {
    AAVE: {
      MAINNET: {
        POOL: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
        POOL_DATA_PROVIDER: "0x68100bD5345eA474D93577127C11F39FF8463e93",
        POOL_ADDRESSES_PROVIDER: "0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D",
        WETH_GATEWAY: "0xd5DDE725b0A2dE43fBDb4E488A7fdA389210d461"
      },
      TESTNET: {
        POOL: "0xbE781D7Bdf469f3d94a62Cdcc407aCe106AEcA74",
        POOL_DATA_PROVIDER: "0x699784A7bbBD29021927B57059c932B10FEb9Bc3",
        POOL_ADDRESSES_PROVIDER: "0x150E9a8b83b731B9218a5633F1E804BC82508A46",
        WETH_GATEWAY: "0xd5DDE725b0A2dE43fBDb4E488A7fdA389210d461"
      }
    }
  };
  
  export const COMMON_TOKENS = {
    BASE_SEPOLIA: {
      USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      WETH: "0x4200000000000000000000000000000000000006"
    }
  };
  
  export const AILFRED_PERSONALITY = {
    GREETING: "Good day! I am Ailfred, your personal DeFi butler on Base. How may I assist you today?",
    SUGGESTIONS: [
      "Show me my portfolio",
      "I want to invest 1000 USDC safely",
      "What are my AAVE positions?",
      "Request testnet ETH from faucet",
      "What investment strategies do you recommend?"
    ],
    STRATEGY_CATEGORIES: {
      LOW_RISK: {
        title: "Conservative Strategies",
        description: "Safe and stable returns with minimal risk",
        strategies: [
          {
            id: "aave_lending",
            name: "AAVE Lending",
            description: "Supply stablecoins to AAVE for consistent yield",
            riskLevel: "low" as const,
            expectedApy: "3-5%",
            protocol: "AAVE",
            isAvailable: true
          }
        ]
      },
      MEDIUM_RISK: {
        title: "Balanced Strategies",
        description: "Moderate risk with potential for higher returns",
        strategies: [
          {
            id: "aave_eth_lending",
            name: "AAVE ETH Lending",
            description: "Supply ETH as collateral with conservative borrowing",
            riskLevel: "medium" as const,
            expectedApy: "5-8%",
            protocol: "AAVE",
            isAvailable: true
          }
        ]
      },
      HIGH_RISK: {
        title: "Aggressive Strategies",
        description: "Higher risk strategies for maximum yield potential",
        strategies: [
          {
            id: "meme_lp",
            name: "Meme Coin Liquidity Provision",
            description: "Provide liquidity for meme tokens (Not yet supported)",
            riskLevel: "high" as const,
            expectedApy: "20-100%+",
            protocol: "Various",
            isAvailable: false
          }
        ]
      }
    }
  };
  
  // Protocol Configuration
  export const PROTOCOL_CONFIG = {
    AAVE_POOL_ADDRESS: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', // Mainnet AAVE v3
    UNISWAP_V3_FACTORY: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    SUPPORTED_TOKENS: ['WETH', 'USDC', 'USDT', 'DAI', 'WBTC'],
  };
  
  // Default Suggestions
  export const DEFAULT_SUGGESTIONS = [
    "What's my current portfolio?",
    "Show me lending opportunities",
    "I want to provide liquidity",
    "Help me assess my risk profile",
    "What are the best yield strategies?",
    "How can I optimize my positions?"
  ];
  
  export const AAVE_CONSTANTS = {
    BASE_SEPOLIA: {
      POOL_ADDRESS: "0xbE781D7Bdf469f3d94a62Cdcc407aCe106AEcA74",
      POOL_DATA_PROVIDER: "0x699784A7bbBD29021927B57059c932B10FEb9Bc3",
      POOL_ADDRESSES_PROVIDER: "0x150E9a8b83b731B9218a5633F1E804BC82508A46",
      WETH_GATEWAY: "0xd5DDE725b0A2dE43fBDb4E488A7fdA389210d461"
    },
    BASE_MAINNET: {
      POOL_ADDRESS: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
      POOL_DATA_PROVIDER: "0x68100bD5345eA474D93577127C11F39FF8463e93",
      POOL_ADDRESSES_PROVIDER: "0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D",
      WETH_GATEWAY: "0xd5DDE725b0A2dE43fBDb4E488A7fdA389210d461"
    }
  }; 