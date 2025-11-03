import { useState } from 'react';
import { ChevronDown, ChevronUp, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import CodeViewer from './CodeViewer';

interface ComponentShowcaseProps {
  title: string;
  description?: string;
  preview: React.ReactNode;
  code: string;
  notes?: string;
  id?: string;
}

export default function ComponentShowcase({
  title,
  description,
  preview,
  code,
  notes,
  id
}: ComponentShowcaseProps) {
  const [showCode, setShowCode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="mb-6" id={id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCode(!showCode)}
            >
              <Code className="w-4 h-4 mr-1" />
              {showCode ? 'Hide' : 'Show'} Code
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {/* Preview */}
          <div className="border-2 border-[#e6e6e9] rounded-lg p-8 bg-white mb-4">
            {preview}
          </div>

          {/* Code */}
          {showCode && (
            <div className="mb-4">
              <CodeViewer code={code} />
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div className="bg-[#f2f2f1] border border-[#e6e6e9] rounded-lg p-4">
              <p className="text-sm text-[#6b7280]">
                <strong className="text-[#2e333d]">Note:</strong> {notes}
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
