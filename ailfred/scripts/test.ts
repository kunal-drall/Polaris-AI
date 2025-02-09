// scripts/test.ts
import { AilfredAgent } from '../src/lib/agent/index.js';

const main = async () => {
    try {
        // Initialize the agent
        console.log('Initializing agent...');
        const agent = await AilfredAgent.initialize();
        
        // Test basic functionality
        console.log('Testing wallet functionality...');
        const balanceResponse = await agent.processMessage('What is my wallet balance?');
        console.log('Balance Response:', balanceResponse.content);

    } catch (error) {
        console.error('Test failed:', error);
    }
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });