import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bot, Clock, LayoutDashboard, MessageSquare, PlayCircle, Puzzle, Hash, Plus, RefreshCw, X } from 'lucide-react';
import { useAppStore } from '../../store/AppContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewAgent: () => void;
  onOpenNewJob: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenNewAgent,
  onOpenNewJob,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { state, dispatch } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setSelectedIndex(0);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build items list
  const pages = [
    { id: 'page_dash', title: 'Go to Dashboard', icon: LayoutDashboard, category: 'Pages', action: () => navigate('/') },
    { id: 'page_agents', title: 'Go to Agents', icon: Bot, category: 'Pages', action: () => navigate('/agents') },
    { id: 'page_conv', title: 'Go to Conversations', icon: MessageSquare, category: 'Pages', action: () => navigate('/conversations') },
    { id: 'page_jobs', title: 'Go to Scheduled Work', icon: Clock, category: 'Pages', action: () => navigate('/jobs') },
    { id: 'page_runs', title: 'Go to Task Runs', icon: PlayCircle, category: 'Pages', action: () => navigate('/runs') },
    { id: 'page_integrations', title: 'Go to Integrations', icon: Puzzle, category: 'Pages', action: () => navigate('/integrations') },
    { id: 'page_slack', title: 'Go to Slack View', icon: Hash, category: 'Pages', action: () => navigate('/slack') },
  ];

  const agentItems = state.agents.map((ag) => ({
    id: `agent_${ag.id}`,
    title: `Chat with ${ag.name} (${ag.role})`,
    icon: Bot,
    category: 'Agents',
    action: () => {
      dispatch({ type: 'CREATE_CONVERSATION', payload: { agentId: ag.id } });
      navigate('/conversations');
    },
  }));

  const actionItems = [
    {
      id: 'act_new_agent',
      title: 'Create New AI Agent',
      icon: Plus,
      category: 'Actions',
      action: () => onOpenNewAgent(),
    },
    {
      id: 'act_new_job',
      title: 'Create Scheduled Job',
      icon: Clock,
      category: 'Actions',
      action: () => onOpenNewJob(),
    },
    {
      id: 'act_reset_demo',
      title: 'Reset Demo Data to Initial State',
      icon: RefreshCw,
      category: 'Actions',
      action: () => {
        dispatch({ type: 'RESET_DEMO_DATA' });
      },
    },
  ];

  const allItems = [...actionItems, ...pages, ...agentItems];
  const filtered = query.trim() === ''
    ? allItems
    : allItems.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1C1917]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white rounded-[14px] border border-[#ECE7E1] shadow-[0_16px_50px_rgba(28,25,23,0.18)] overflow-hidden z-10 animate-in fade-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#ECE7E1] gap-3">
          <Search className="w-5 h-5 text-[#78716C]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, page, or agent name..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#1C1917] placeholder-[#A8A29E]"
          />
          <button
            onClick={onClose}
            className="p-1 text-[#78716C] hover:text-[#1C1917] rounded-[6px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#78716C]">
              No matching commands found for "{query}".
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] text-xs font-medium transition-colors text-left ${
                    isSelected
                      ? 'bg-[#FAF8F5] text-[#1C1917] border border-[#ECE7E1]'
                      : 'text-[#57534E] hover:bg-[#FAF8F5] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-[8px] ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#FF7A59]/15 to-[#F0467E]/15 text-[#FF7A59]'
                          : 'bg-[#ECE7E1]/50 text-[#78716C]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#A8A29E] uppercase tracking-wider">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#FAF8F5] border-t border-[#ECE7E1] flex items-center justify-between text-[11px] text-[#78716C]">
          <div className="flex items-center gap-2">
            <span>Use <kbd className="px-1 py-0.5 font-mono bg-white border border-[#ECE7E1] rounded text-[10px]">↑</kbd> <kbd className="px-1 py-0.5 font-mono bg-white border border-[#ECE7E1] rounded text-[10px]">↓</kbd> to navigate</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 font-mono bg-white border border-[#ECE7E1] rounded text-[10px]">↵</kbd> to select</span>
          </div>
          <span>Pazi Quick Navigator</span>
        </div>
      </div>
    </div>
  );
};
