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
          className="p-3 sm:p-4 text-left bg-[var(--bg-card-static)] border border-[var(--border-default)]
                     rounded-xl hover:border-[var(--border-hover)] hover:shadow-md hover:bg-[var(--bg-card-clickable)]
                     transition-all group text-sm sm:text-base active:scale-[0.98]"
          style={{
            transitionDuration: 'var(--transition-base)',
            transitionTimingFunction: 'var(--ease-default)',
            animation: `fadeIn var(--transition-slow) var(--ease-out) ${index * 100}ms backwards`
          }}
          aria-label={`Suggestion: ${prompt}`}
        >
          <span className="text-[var(--text-primary)] group-hover:text-[var(--text-primary)] transition-colors font-sans"
                style={{ transitionDuration: 'var(--transition-fast)' }}>
            {prompt}
          </span>
        </button>
      ))}
    </div>
  );
}; 