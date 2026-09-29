import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  Clock,
  PlayCircle,
  Puzzle,
  Hash,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/agents', label: 'Agents', icon: Bot },
    { to: '/conversations', label: 'Conversations', icon: MessageSquare },
    { to: '/jobs', label: 'Scheduled Work', icon: Clock },
    { to: '/runs', label: 'Task Runs', icon: PlayCircle },
    { to: '/integrations', label: 'Integrations', icon: Puzzle },
    { to: '/slack', label: 'Slack View', icon: Hash },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-[#FAF8F5] border-r border-[#ECE7E1] h-screen transition-all duration-200 select-none z-20 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#ECE7E1]">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-[9px] bg-gradient-to-tr from-[#FF7A59] via-[#F0467E] to-[#FFB547] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <span className="font-extrabold text-sm tracking-wider">P</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-[#1C1917] tracking-tight leading-none">
                Pazi
              </span>
              <span className="text-[10px] text-[#78716C] font-semibold tracking-wider uppercase mt-0.5">
                Agent Platform
              </span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'text-[#1C1917] bg-white border border-[#ECE7E1] shadow-[0_1px_4px_rgba(28,25,23,0.04)]'
                    : 'text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE9] border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-[#FF7A59] to-[#F0467E]" />
                  )}
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-[#FF7A59]' : 'text-[#78716C]'
                    }`}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Status banner & Collapse */}
      <div className="p-3 border-t border-[#ECE7E1] space-y-2">
        {!isCollapsed && (
          <div className="p-2.5 bg-white rounded-[10px] border border-[#ECE7E1] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1C1917] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0FB5A6] animate-pulse" />
                Scheduler Active
              </span>
              <span className="text-[11px] font-mono text-[#78716C]">30s tick</span>
            </div>
            <p className="text-[11px] text-[#78716C] mt-1 leading-tight">
              Web & Slack daemons connected
            </p>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE9] rounded-[8px] transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
};
