import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CodeViewerProps {
  code: string;
  language?: string;
}

export default function CodeViewer({ code, language = 'tsx' }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-[#2e333d] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#3f4451]">
        <span className="text-xs text-[#9ca3af] font-mono">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2 text-white hover:bg-[#3f4451]"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm text-[#f8f8f6] font-mono">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
