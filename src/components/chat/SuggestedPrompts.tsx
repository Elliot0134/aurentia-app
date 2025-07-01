import React from 'react';

interface SuggestedPromptsProps {
  prompts: string[];
  onPromptSelect: (prompt: string) => void;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  prompts,
  onPromptSelect,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-6 sm:mb-8 px-3 sm:px-0">
      {prompts.map((prompt, index) => (
        <button
          key={index}
          onClick={() => onPromptSelect(prompt)}
          className="p-3 sm:p-4 text-left bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 group text-sm sm:text-base"
        >
          <span className="text-gray-700 group-hover:text-gray-900">
            {prompt}
          </span>
        </button>
      ))}
    </div>
  );
}; 