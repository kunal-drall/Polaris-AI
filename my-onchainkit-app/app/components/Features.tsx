export default function Features() {
    const features = [
      { title: 'AI-Powered Transactions', description: 'Automate swaps, staking, and bridging using AI.' },
      { title: 'Secure Wallet Management', description: 'Manage wallets safely with Coinbase OnchainKit.' },
      { title: 'Live AI Chat', description: 'Interact with Polaris AI directly via chat for asset management.' },
      { title: 'Cross-Chain Functionality', description: 'Seamless bridging between Base, Arbitrum, and StarkNet.' },
    ];
  
    return (
      <section id="features" className="py-16 bg-gray-800 text-center">
        <h2 className="text-3xl font-bold text-white">Key Features</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="p-6 bg-gray-700 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-blue-400">{feature.title}</h3>
              <p className="mt-2 text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  