import React, { useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { CodeBlock as CodeBlockType } from '@/types/resourceTypes';

interface CodeBlockProps {
  block: CodeBlockType;
  onUpdate: (data: Partial<CodeBlockType['data']>) => void;
  readOnly?: boolean;
  isActive?: boolean;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'powershell', label: 'PowerShell' },
];

export function CodeBlock({ block, onUpdate, readOnly = false, isActive = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(block.data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (readOnly) {
    return (
      <div className="rounded-lg overflow-hidden border">
        {/* Header */}
        {(block.data.filename || block.data.language) && (
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-200 text-sm">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              {block.data.filename && <span>{block.data.filename}</span>}
              {!block.data.filename && <span className="text-gray-400">{block.data.language}</span>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 text-gray-200 hover:text-white hover:bg-gray-700"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copier
                </>
              )}
            </Button>
          </div>
        )}

        {/* Code content */}
        <div className={`${block.data.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-4 overflow-x-auto`}>
          <pre className={`text-sm ${block.data.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
            <code className={`language-${block.data.language}`}>
              {block.data.code.split('\n').map((line, i) => (
                <div key={i} className="flex">
                  {block.data.showLineNumbers && (
                    <span className="select-none mr-4 text-gray-500 text-right" style={{ minWidth: '2em' }}>
                      {i + 1}
                    </span>
                  )}
                  <span>{line || ' '}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      {isActive && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
          <div>
            <Label>Langage</Label>
            <Select
              value={block.data.language}
              onValueChange={(value) => onUpdate({ language: value })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Nom du fichier (optionnel)</Label>
            <Input
              value={block.data.filename || ''}
              onChange={(e) => onUpdate({ filename: e.target.value })}
              placeholder="exemple.js"
              className="mt-1.5"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="line-numbers">Numéros de ligne</Label>
            <Switch
              id="line-numbers"
              checked={block.data.showLineNumbers ?? true}
              onCheckedChange={(checked) => onUpdate({ showLineNumbers: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="theme">Thème sombre</Label>
            <Switch
              id="theme"
              checked={block.data.theme === 'dark'}
              onCheckedChange={(checked) => onUpdate({ theme: checked ? 'dark' : 'light' })}
            />
          </div>
        </div>
      )}

      {/* Code editor */}
      <Textarea
        value={block.data.code}
        onChange={(e) => onUpdate({ code: e.target.value })}
        placeholder="Entrez votre code ici..."
        className="font-mono text-sm min-h-[200px]"
        spellCheck={false}
      />
    </div>
  );
}

export default CodeBlock;
