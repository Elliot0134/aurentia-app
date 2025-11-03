import { StyleguideSection } from '@/pages/StyleguidePage';
import { Palette, Component as ComponentIcon, Layout } from 'lucide-react';

interface StyleguideNavProps {
  activeSection: StyleguideSection;
  onSectionChange: (section: StyleguideSection) => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  section: StyleguideSection;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, section, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg
        text-left transition-all duration-150
        ${isActive
          ? 'bg-[#ff592b] text-white font-semibold'
          : 'text-[#2e333d] hover:bg-[#f2f2f1]'
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function StyleguideNav({ activeSection, onSectionChange }: StyleguideNavProps) {
  const navItems = [
    {
      section: 'foundations' as StyleguideSection,
      icon: <Palette className="w-5 h-5" />,
      label: 'Foundations'
    },
    {
      section: 'components' as StyleguideSection,
      icon: <ComponentIcon className="w-5 h-5" />,
      label: 'Components'
    },
    {
      section: 'patterns' as StyleguideSection,
      icon: <Layout className="w-5 h-5" />,
      label: 'Patterns'
    }
  ];

  return (
    <nav className="p-4">
      <div className="space-y-2">
        {navItems.map((item) => (
          <NavItem
            key={item.section}
            icon={item.icon}
            label={item.label}
            section={item.section}
            isActive={activeSection === item.section}
            onClick={() => onSectionChange(item.section)}
          />
        ))}
      </div>

      {/* Quick Links */}
      <div className="mt-8 pt-6 border-t border-[#e6e6e9]">
        <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider px-4 mb-3">
          Quick Links
        </h3>
        <div className="space-y-1 text-sm">
          <a
            href="#colors"
            className="block px-4 py-2 text-[#2e333d] hover:bg-[#f2f2f1] rounded-lg transition-colors"
          >
            Colors
          </a>
          <a
            href="#typography"
            className="block px-4 py-2 text-[#2e333d] hover:bg-[#f2f2f1] rounded-lg transition-colors"
          >
            Typography
          </a>
          <a
            href="#buttons"
            className="block px-4 py-2 text-[#2e333d] hover:bg-[#f2f2f1] rounded-lg transition-colors"
          >
            Buttons
          </a>
          <a
            href="#cards"
            className="block px-4 py-2 text-[#2e333d] hover:bg-[#f2f2f1] rounded-lg transition-colors"
          >
            Cards
          </a>
          <a
            href="#forms"
            className="block px-4 py-2 text-[#2e333d] hover:bg-[#f2f2f1] rounded-lg transition-colors"
          >
            Forms
          </a>
          <a
            href="#modals"
            className="block px-4 py-2 text-[#2e333d] hover:bg-[#f2f2f1] rounded-lg transition-colors"
          >
            Modals
          </a>
          <a
            href="#dropdowns"
            className="block px-4 py-2 text-[#2e333d] hover:bg-[#f2f2f1] rounded-lg transition-colors"
          >
            Dropdowns
          </a>
          <a
            href="#select"
            className="block px-4 py-2 text-[#2e333d] hover:bg-[#f2f2f1] rounded-lg transition-colors"
          >
            Select
          </a>
          <a
            href="#tables"
            className="block px-4 py-2 text-[#2e333d] hover:bg-[#f2f2f1] rounded-lg transition-colors"
          >
            Tables
          </a>
          <a
            href="#tooltips"
            className="block px-4 py-2 text-[#2e333d] hover:bg-[#f2f2f1] rounded-lg transition-colors"
          >
            Tooltips
          </a>
          <a
            href="#accordion"
            className="block px-4 py-2 text-[#2e333d] hover:bg-[#f2f2f1] rounded-lg transition-colors"
          >
            Accordion
          </a>
          <a
            href="#avatars"
            className="block px-4 py-2 text-[#2e333d] hover:bg-[#f2f2f1] rounded-lg transition-colors"
          >
            Avatars
          </a>
        </div>
      </div>
    </nav>
  );
}
