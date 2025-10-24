import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TabItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface CustomTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  children: React.ReactNode;
}

const CustomTabs: React.FC<CustomTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children
}) => {
  return (
    <>
      <div className="md:border-b md:border-gray-200">
        <nav className="grid grid-cols-2 gap-2 md:flex md:flex-row md:-mb-px md:space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                style={activeTab === tab.key ? {
                  // Only apply background color on mobile (desktop uses transparent bg with bottom border)
                  backgroundColor: 'var(--color-primary)',
                  // On desktop, apply border color to bottom border via CSS variable
                  ['--tw-border-opacity' as string]: '1',
                  borderBottomColor: 'var(--color-primary)'
                } : {}}
                className={`
                  py-2 px-4 font-medium text-base text-center rounded-md
                  ${
                    activeTab === tab.key
                      ? 'text-white'
                      : 'bg-white border border-gray-200 text-gray-700'
                  }
                  md:whitespace-nowrap md:py-3 md:px-2 md:border-b-2 md:rounded-none md:!bg-transparent md:text-center
                  ${
                    activeTab === tab.key
                      ? 'md:text-gray-700 md:hover:text-gray-700'
                      : 'md:border-transparent md:text-gray-500 md:hover:text-gray-700 md:hover:border-gray-400'
                  }
                `}
              >
                <Icon className="inline h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 animate-popup-appear" key={activeTab}>
        {children}
      </div>
    </>
  );
};

export default CustomTabs;