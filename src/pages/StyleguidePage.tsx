import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

// We'll import these as we create them
import StyleguideNav from '@/components/styleguide/StyleguideNav';
import FoundationsSection from '@/components/styleguide/FoundationsSection';
import ComponentsSection from '@/components/styleguide/ComponentsSection';
import PatternsSection from '@/components/styleguide/PatternsSection';

export type StyleguideSection = 'foundations' | 'components' | 'patterns';

export default function StyleguidePage() {
  const [activeSection, setActiveSection] = useState<StyleguideSection>('foundations');

  return (
    <div className="flex h-screen bg-[#fafaf8]">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-[#e6e6e9] bg-white">
        <div className="p-6 border-b border-[#e6e6e9]">
          <h1 className="text-2xl font-bold text-[#2e333d]">Styleguide</h1>
          <p className="text-sm text-[#6b7280] mt-1">Design System Reference</p>
        </div>
        <ScrollArea className="h-[calc(100vh-89px)]">
          <StyleguideNav
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-8 max-w-7xl mx-auto">
            {activeSection === 'foundations' && <FoundationsSection />}
            {activeSection === 'components' && <ComponentsSection />}
            {activeSection === 'patterns' && <PatternsSection />}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
