import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Link as LinkIcon } from 'lucide-react';

interface LinkItem {
  label: string;
  href: string;
  target?: string;
}

interface DynamicLinkDropdownProps {
  links: LinkItem[];
  label?: string;
}

const DynamicLinkDropdown: React.FC<DynamicLinkDropdownProps> = ({ links, label = 'Sélectionner' }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 rounded-lg bg-white text-gray-800 hover:bg-gray-100 hover:text-black focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {label}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {links && links.length > 0 ? (
          links.map((link, index) => (
            <DropdownMenuItem key={index} asChild className="hover:bg-gray-100">
              <a href={link.href} target={link.target || "_blank"} rel="noopener noreferrer" className="flex items-center">
                <LinkIcon className="mr-2 h-4 w-4" />
                {link.label}
              </a>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>Aucun lien disponible</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { DynamicLinkDropdown };
