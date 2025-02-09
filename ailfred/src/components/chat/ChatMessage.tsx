import { Message } from '../../lib/agent/types';
import StrategyCard from './StrategyCard';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';
  const bubbleColor = isAssistant ? 'bg-neutral-900' : 'bg-blue-600';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`
          max-w-[80%] 
          px-6 
          py-4 
          ${bubbleColor}
          text-white
          ${isAssistant ? 'rounded-r-2xl rounded-tl-2xl' : 'rounded-l-2xl rounded-tr-2xl'}
          shadow-sm
        `}
      >
        <p className={`text-lg whitespace-pre-wrap ${bubbleColor}`}>{message.content}</p>

        {/* Strategy Cards */}
        {isAssistant && message.strategies && message.strategies.length > 0 && (
          <div className={`mt-4 space-y-4 ${bubbleColor}`}>
            {message.strategies.map((strategy, index) => (
              <StrategyCard key={index} strategy={strategy} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 