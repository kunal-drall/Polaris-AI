export default function Hero() {
    return (
      <section className="flex flex-col items-center text-center py-20 px-6 bg-gradient-to-b from-gray-900 to-gray-800">
        <h1 className="text-4xl font-bold text-white md:text-6xl">
          The Future of On-Chain AI Agents 🚀
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Seamlessly interact with blockchain, stake, swap, and bridge assets using AI-powered automation.
        </p>
        <div className="mt-6 flex space-x-4">
          <a href="/chat" className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Try AI Agent
          </a>
          <a href="/#get-started" className="px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600">
            Learn More
          </a>
        </div>
      </section>
    );
  }
  