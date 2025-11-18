import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Pencil, Check } from 'lucide-react';

// Helper function to calculate textarea rows based on content
const calculateRows = (text: string, minRows: number = 4, maxRows: number = 20): number => {
  if (!text) return minRows;
  const lines = text.split('\n').length;
  const estimatedRows = Math.max(lines, minRows);
  return Math.min(estimatedRows, maxRows);
};

interface MarkdownEditableFieldProps {
  value: string;
  placeholder: string;
  label: string;
  icon: string;
  onChange: (value: string) => void;
}

const MarkdownEditableField = ({ value, placeholder, label, icon, onChange }: MarkdownEditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-base md:text-lg text-gray-800">{label}</label>
        {!isEditing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-[#FF6B35] hover:text-[#FF5722] hover:bg-[#FF6B35]/10"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Modifier
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        {/* Icon container */}
        <div className="hidden md:flex w-16 bg-gray-100 rounded-lg items-center justify-center flex-shrink-0">
          <img src={`/icones-livrables/${icon}`} alt={label} className="w-10 h-10 object-contain" />
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder={placeholder}
              rows={calculateRows(editValue)}
              className="transition-all duration-200 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] resize-y"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-800"
              >
                Annuler
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                className="bg-[#FF6B35] hover:bg-[#FF5722] text-white"
              >
                <Check className="w-4 h-4 mr-1" />
                Enregistrer
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-[100px] p-4 bg-white border border-gray-200 rounded-lg">
            {value ? (
              <div className="markdown-content text-gray-700 leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Texte formaté
                    strong: (props) => <strong className="font-bold text-gray-900" {...props} />,
                    em: (props) => <em className="italic text-gray-800" {...props} />,

                    // Titres
                    h1: (props) => <h1 className="text-2xl font-bold text-gray-900 mb-3 mt-4 first:mt-0" {...props} />,
                    h2: (props) => <h2 className="text-xl font-bold text-gray-900 mb-2 mt-3 first:mt-0" {...props} />,
                    h3: (props) => <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-3 first:mt-0" {...props} />,

                    // Paragraphes
                    p: (props) => <p className="mb-3 last:mb-0" {...props} />,

                    // Listes
                    ul: (props) => <ul className="list-disc list-inside space-y-1 mb-3" {...props} />,
                    ol: (props) => <ol className="list-decimal list-inside space-y-1 mb-3" {...props} />,
                    li: (props) => <li className="ml-2" {...props} />,

                    // Citations
                    blockquote: (props) => (
                      <blockquote className="border-l-4 border-[#FF6B35] pl-4 py-2 my-3 italic bg-gray-50 rounded-r" {...props} />
                    ),

                    // Code
                    code: (props) => {
                      const { inline, ...rest } = props as any;
                      return inline ? (
                        <code className="bg-gray-100 text-[#FF6B35] px-1.5 py-0.5 rounded text-sm font-mono" {...rest} />
                      ) : (
                        <code className="block bg-gray-100 text-gray-800 p-3 rounded my-2 text-sm font-mono overflow-x-auto" {...rest} />
                      );
                    },

                    // Liens
                    a: (props) => (
                      <a
                        className="text-[#FF6B35] hover:text-[#FF5722] underline font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                  }}
                >
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-400 italic">{placeholder}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditableField;
