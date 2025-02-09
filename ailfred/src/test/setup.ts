import dotenv from 'dotenv';
import path from 'path';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseMessage, AIMessage } from '@langchain/core/messages';
import { ChatResult } from '@langchain/core/outputs';
import { cleanup } from '@testing-library/react';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Runs a cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock LLM for testing
class MockChatModel extends BaseChatModel {
  async _generate(
    messages: BaseMessage[]
  ): Promise<ChatResult> {
    // Return predefined responses based on the input
    const lastMessage = messages[messages.length - 1].content;
    if (typeof lastMessage !== 'string') {
      return { generations: [{ text: '', message: new AIMessage('') }] };
    }

    let response = '';
    if (lastMessage.toLowerCase().includes('wallet balance')) {
      response = 'Very good, sir. Your current wallet balance is 1.5 ETH';
    } else if (lastMessage.toLowerCase().includes('aave')) {
      response = 'Aave positions found:\n\nAsset: USDC\nSupply Balance: 1000\nCollateral Enabled: true\nToken Address: 0x123...';
    } else {
      response = 'How else may I be of assistance?';
    }

    return {
      generations: [{
        text: response,
        message: new AIMessage(response)
      }]
    };
  }

  _llmType(): string {
    return 'mock';
  }
}

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Set up mock environment variables if not present
process.env.CDP_API_KEY_NAME = process.env.CDP_API_KEY_NAME || 'test_key_name';
process.env.CDP_API_KEY_PRIVATE_KEY = process.env.CDP_API_KEY_PRIVATE_KEY || `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIJ51q1xEO8fwsjlFtXClBloWikrkyFr5prXGi7F54RbMoAoGCCqGSM49
AwEHoUQDQgAESxBvbl8BUcuCNubDgS3sA8ShMRlKjV5SMVlwPRRw5Wbn/nLFCvwK
UGNcV/18H8jsbRcv3+BNc1xpLSOW3pLegg==
-----END EC PRIVATE KEY-----`;
process.env.NETWORK_ID = process.env.NETWORK_ID || 'base-sepolia';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test_openai_key';

// Export the mock LLM for use in tests
export const mockLLM = new MockChatModel({}); 