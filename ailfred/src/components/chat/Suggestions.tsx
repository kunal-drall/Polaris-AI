import { AILFRED_PERSONALITY } from '../../lib/agent/constants';

export interface SuggestionsProps {
  suggestions?: string[];
  onSelect: (suggestion: string) => void;
}

export default function Suggestions({ suggestions = AILFRED_PERSONALITY.SUGGESTIONS, onSelect }: SuggestionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
} 