import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-1 border-b border-[#ECE7E1] ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold transition-colors duration-150 cursor-pointer ${
              isActive ? 'text-[#1C1917]' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={`px-1.5 py-0.2 text-[11px] rounded-full font-mono ${
                  isActive ? 'bg-[#1C1917] text-white' : 'bg-[#ECE7E1] text-[#78716C]'
                }`}
              >
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF7A59] via-[#F0467E] to-[#FFB547]" />
            )}
          </button>
        );
      })}
    </div>
  );
};
