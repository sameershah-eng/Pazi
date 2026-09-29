import React, { useState } from 'react';
import { Agent } from '../types';
import { AgentCard } from '../components/agents/AgentCard';
import { AgentModal } from '../components/agents/AgentModal';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useAppStore } from '../store/AppContext';
import { Plus, Search, Filter, Bot } from 'lucide-react';

export const AgentsPage: React.FC = () => {
  const { state } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null);

  const filteredAgents = state.agents.filter((agent) => {
    const matchesQuery =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : agent.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const handleOpenCreate = () => {
    setAgentToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (agent: Agent) => {
    setAgentToEdit(agent);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">AI Agents</h1>
          <p className="text-xs text-[#78716C] mt-1">
            Deploy specialized worker agents to execute jobs across web apps, Slack, and integrations.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Create Agent
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[12px] border border-[#ECE7E1]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search agents by name, role, or tool..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#ECE7E1] rounded-[8px] focus:outline-none focus:border-[#FF7A59]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'active', 'paused'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] capitalize transition-colors ${
                statusFilter === filter
                  ? 'bg-[#1C1917] text-white'
                  : 'bg-[#FAF8F5] text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Agent Cards */}
      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onEdit={handleOpenEdit} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bot className="w-6 h-6" />}
          title="No agents match your filter"
          description="Try clearing your search query or create a new autonomous agent."
          actionLabel="Create Agent"
          onAction={handleOpenCreate}
        />
      )}

      {/* Agent Create / Edit Modal */}
      <AgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        agentToEdit={agentToEdit}
      />
    </div>
  );
};
