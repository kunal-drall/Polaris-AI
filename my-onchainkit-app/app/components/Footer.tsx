export default function Footer() {
    return (
      <footer className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* 🔹 TOP SECTION: LINKS */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6">
              <a href="https://docs.polaris.ai" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                Documentation
              </a>
              <a href="https://twitter.com/polarisai" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                Twitter
              </a>
              <a href="https://github.com/polaris-ai" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                GitHub
              </a>
            </div>
          </div>
  
          {/* 🔹 DIVIDER */}
          <div className="border-t border-gray-300 dark:border-gray-600 my-6"></div>
  
          {/* 🔹 BOTTOM SECTION: COPYRIGHT & TECH STACK */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-center md:text-left text-sm">
              &copy; {new Date().getFullYear()} Polaris AI. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Built with Coinbase OnchainKit & Autonome</p>
          </div>
        </div>
      </footer>
    );
  }
  