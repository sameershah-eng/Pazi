import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, ChevronDown, Check, Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppStore } from '../../store/AppContext';

interface TopNavbarProps {
  onOpenCommandPalette: () => void;
  onOpenNewAgentModal: () => void;
  onOpenMobileMenu?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenCommandPalette,
  onOpenNewAgentModal,
  onOpenMobileMenu,
}) => {
  const { state, dispatch } = useAppStore();
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const workspaces = [
    'Acme Corp (Production)',
    'Acme Staging (v2.4)',
    'Acme EMEA Operations',
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (workspaceRef.current && !workspaceRef.current.contains(e.target as Node)) {
        setIsWorkspaceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-4 md:px-6 bg-white/80 backdrop-blur-md border-b border-[#ECE7E1] flex items-center justify-between sticky top-0 z-10">
      {/* Left: Mobile hamburger & Workspace Switcher */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5] rounded-[8px]"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative" ref={workspaceRef}>
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] border border-[#ECE7E1] bg-[#FAF8F5] hover:bg-white text-xs font-semibold text-[#1C1917] transition-colors shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#0FB5A6]" />
            <span className="max-w-[150px] md:max-w-[200px] truncate">{state.currentWorkspace}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
          </button>

          {isWorkspaceMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-[12px] border border-[#ECE7E1] shadow-[0_8px_24px_rgba(28,25,23,0.08)] py-1.5 z-30 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1 text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
                Workspaces
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws}
                  onClick={() => {
                    dispatch({ type: 'SET_WORKSPACE', payload: ws });
                    setIsWorkspaceMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-[#FAF8F5] transition-colors"
                >
                  <span className={state.currentWorkspace === ws ? 'font-bold text-[#1C1917]' : 'text-[#78716C]'}>
                    {ws}
                  </span>
                  {state.currentWorkspace === ws && <Check className="w-4 h-4 text-[#FF7A59]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="hidden sm:flex items-center flex-1 max-w-md mx-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-[#FAF8F5] border border-[#ECE7E1] hover:border-[#D8D2C9] rounded-[10px] text-xs text-[#78716C] transition-colors group shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#78716C] group-hover:text-[#1C1917]" />
            <span className="group-hover:text-[#1C1917]">Search agents, jobs, runs...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-[#ECE7E1] rounded text-[#78716C] shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Action & User Avatar */}
      <div className="flex items-center gap-2.5">
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={onOpenNewAgentModal}
        >
          <span className="hidden sm:inline">New Agent</span>
          <span className="sm:hidden">Agent</span>
        </Button>

        <div className="flex items-center pl-2 border-l border-[#ECE7E1]">
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1C1917] to-[#57534E] text-white flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
            title="Logged in as sameerupwork25@gmail.com"
          >
            SU
          </div>
        </div>
      </div>
    </header>
  );
};
