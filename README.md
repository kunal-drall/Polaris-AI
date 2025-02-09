# Ailfred: Your DeFi Butler on Base 🎩

## Overview

Ailfred is a sophisticated AI-powered DeFi butler that makes decentralized finance accessible through natural conversation. Built natively on Base, Ailfred handles complex DeFi operations while maintaining the charm and professionalism of a high-class butler.

## 🌟 Key Features

### 🤵 Personal DeFi Butler
- Natural language interaction for all DeFi operations
- Sophisticated butler persona for a unique user experience
- Personalized investment recommendations based on risk profile

### 💼 Portfolio Management
- Real-time balance tracking across multiple tokens (ETH, USDC, WETH)
- AAVE lending position monitoring and management
- Risk assessment and portfolio optimization suggestions

### 🔒 Security & Efficiency
- Secure transaction handling and validation
- Automated error detection and recovery
- Gas-efficient operations on Base network

### 💰 DeFi Operations
- AAVE lending pool interactions
- Token deposits and withdrawals
- Real-time APY tracking and recommendations

## 🛠 Technology Stack

### Frontend
- React with TypeScript
- MobX for state management
- Tailwind CSS for styling

### AI & Language Processing
- LangChain for agent orchestration
- OpenAI GPT-3.5 for natural language understanding
- Custom message modifier system for butler persona

### Blockchain & DeFi
- Base network integration
- CDP Wallet Provider from Coinbase
- Ethers.js for blockchain interactions
- AAVE protocol integration

## 🚀 Getting Started

### Prerequisites
```bash
Node.js v16+
npm or yarn
Base network wallet with testnet ETH
```

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/ailfred.git

# Install dependencies
cd ailfred
npm install

# Set up environment variables
cp .env.example .env
```

### Configuration
Add the following to your `.env` file:
```env
NEXT_PUBLIC_CDP_API_KEY_NAME=your_key_name
NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_NETWORK_ID=base-sepolia
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

### Running the Application
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 📝 Usage Examples

### Check Portfolio Balance
```typescript
const ailfred = await AilfredAgent.initialize();
const response = await ailfred.processMessage("What is my current portfolio value?");
console.log(response.content);
```

### Supply Assets to AAVE
```typescript
const response = await ailfred.processMessage("Supply 0.1 ETH to AAVE for lending");
console.log(response.content);
```

### Get Investment Recommendations
```typescript
const response = await ailfred.processMessage("What investment strategies do you recommend for a low-risk profile?");
console.log(response.content);
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- lib/agent/agent.test.ts
```

## 🔧 Project Structure

```
ailfred/
├── src/
│   ├── lib/
│   │   └── agent/
│   │       ├── index.ts         # Main agent implementation
│   │       ├── constants.ts     # Configuration constants
│   │       ├── types.ts         # TypeScript type definitions
│   │       └── baseProvider.ts  # Base network provider
│   ├── components/             # React components
│   └── utils/                  # Utility functions
├── scripts/                    # Build and deployment scripts
└── tests/                      # Test suites
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Base team for the excellent network infrastructure
- Coinbase Developer Platform for CDP Wallet Provider
- AAVE protocol for lending pool integration
- OpenAI for GPT-3.5 capabilities
- LangChain for agent framework

## 🌐 Links

- [Documentation](https://docs.ailfred.io)
- [Base Network](https://base.org)
- [AAVE Protocol](https://aave.com)
- [CDP Documentation](https://docs.coinbase.com/cdp)
