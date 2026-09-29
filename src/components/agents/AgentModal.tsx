import React, { useState, useEffect } from 'react';
import { Agent, IntegrationId } from '../../types';
import { Modal } from '../ui/Modal';
import { Tabs } from '../ui/Tabs';
import { Button } from '../ui/Button';
import { useAppStore } from '../../store/AppContext';
import { User, FileText, Wrench, Share2, ShieldAlert } from 'lucide-react';

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentToEdit?: Agent | null;
}

export const AgentModal: React.FC<AgentModalProps> = ({
  isOpen,
  onClose,
  agentToEdit,
}) => {
  const { state, dispatch } = useAppStore();
  const [activeTab, setActiveTab] = useState('profile');

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [tools, setTools] = useState<IntegrationId[]>([]);
  const [channels, setChannels] = useState<('web' | 'slack')[]>(['web', 'slack']);
  const [maxSteps, setMaxSteps] = useState(8);
  const [requireApproval, setRequireApproval] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (agentToEdit) {
      setName(agentToEdit.name);
      setRole(agentToEdit.role);
      setDescription(agentToEdit.description);
      setSystemPrompt(agentToEdit.systemPrompt);
      setTools(agentToEdit.tools);
      setChannels(agentToEdit.channels);
      setMaxSteps(agentToEdit.guardrails.maxSteps);
      setRequireApproval(agentToEdit.guardrails.requireApproval);
    } else {
      setName('');
      setRole('');
      setDescription('');
      setSystemPrompt(
        `You are an autonomous AI Agent operating inside Pazi.\nYour mission is to evaluate incoming requests, maintain security guardrails, and execute tasks with high accuracy.`
      );
      setTools(['slack']);
      setChannels(['web', 'slack']);
      setMaxSteps(8);
      setRequireApproval(false);
    }
    setActiveTab('profile');
    setErrors({});
  }, [agentToEdit, isOpen]);

  const handleToggleTool = (toolId: IntegrationId) => {
    if (tools.includes(toolId)) {
      setTools(tools.filter((t) => t !== toolId));
    } else {
      setTools([...tools, toolId]);
    }
  };

  const handleToggleChannel = (channel: 'web' | 'slack') => {
    if (channels.includes(channel)) {
      if (channels.length === 1) return; // Must keep at least one channel
      setChannels(channels.filter((c) => c !== channel));
    } else {
      setChannels([...channels, channel]);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Agent name is required';
    if (!role.trim()) errs.role = 'Role or specialty is required';
    if (!systemPrompt.trim()) errs.systemPrompt = 'System prompt instructions are required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (agentToEdit) {
      const updated: Agent = {
        ...agentToEdit,
        name: name.trim(),
        role: role.trim(),
        description: description.trim(),
        systemPrompt: systemPrompt.trim(),
        tools,
        channels,
        guardrails: {
          maxSteps,
          requireApproval,
        },
      };
      dispatch({ type: 'UPDATE_AGENT', payload: updated });
    } else {
      dispatch({
        type: 'ADD_AGENT',
        payload: {
          name: name.trim(),
          role: role.trim(),
          description: description.trim(),
          status: 'active',
          systemPrompt: systemPrompt.trim(),
          tools,
          channels,
          guardrails: {
            maxSteps,
            requireApproval,
          },
        },
      });
    }

    onClose();
  };

  const modalTabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'instructions', label: 'Instructions', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'tools', label: 'Tools', badge: tools.length, icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'channels', label: 'Channels', icon: <Share2 className="w-3.5 h-3.5" /> },
    { id: 'guardrails', label: 'Guardrails', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={agentToEdit ? `Edit Agent: ${agentToEdit.name}` : 'Create New AI Agent'}
      description="Configure your agent persona, system instructions, tool access, and safety guardrails."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Tabs tabs={modalTabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-4 pt-1 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">Agent Name *</label>
              <input
                type="text"
                placeholder="e.g. Inbound Lead Qualifier"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#ECE7E1] focus:border-[#FF7A59] focus:outline-none rounded-[10px] text-[#1C1917]"
              />
              {errors.name && <p className="mt-1 text-xs text-[#DC2626]">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">
                Role & Specialty *
              </label>
              <input
                type="text"
                placeholder="e.g. SDR & CRM Pipeline Automator"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#ECE7E1] focus:border-[#FF7A59] focus:outline-none rounded-[10px] text-[#1C1917]"
              />
              {errors.role && <p className="mt-1 text-xs text-[#DC2626]">{errors.role}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Briefly describe what this agent does for team members..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#ECE7E1] focus:border-[#FF7A59] focus:outline-none rounded-[10px] text-[#1C1917] resize-none"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Instructions */}
        {activeTab === 'instructions' && (
          <div className="space-y-3 pt-1 animate-in fade-in">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#1C1917]">
                System Instructions Prompt *
              </label>
              <span className="text-[11px] font-mono text-[#78716C]">
                {systemPrompt.length} characters
              </span>
            </div>
            <textarea
              rows={8}
              placeholder="Define behavioral rules, ICP criteria, output guidelines, and edge-case policies..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-[#FAF8F5] border border-[#ECE7E1] focus:border-[#FF7A59] focus:outline-none rounded-[10px] text-[#1C1917] leading-relaxed"
            />
            {errors.systemPrompt && (
              <p className="mt-1 text-xs text-[#DC2626]">{errors.systemPrompt}</p>
            )}
            <p className="text-[11px] text-[#78716C] leading-normal">
              These instructions govern how the model reasons when executing jobs, replying in Slack, and invoking connected tools.
            </p>
          </div>
        )}

        {/* Tab 3: Tools */}
        {activeTab === 'tools' && (
          <div className="space-y-3 pt-1 animate-in fade-in">
            <p className="text-xs text-[#78716C]">
              Select which integrated tools this agent is authorized to invoke during task runs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {state.integrations.map((integration) => {
                const isChecked = tools.includes(integration.id);
                return (
                  <div
                    key={integration.id}
                    onClick={() => handleToggleTool(integration.id)}
                    className={`flex items-start gap-3 p-3 rounded-[10px] border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-[#FAF8F5] border-[#FF7A59]/40 shadow-xs'
                        : 'bg-white border-[#ECE7E1] hover:border-[#D8D2C9]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-[#FF7A59] focus:ring-[#FF7A59]"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#1C1917]">{integration.name}</span>
                        {integration.connected ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#ECFDF5] text-[#059669] font-semibold">
                            Connected
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#FAF8F5] text-[#78716C]">
                            Needs auth
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#78716C] mt-0.5 line-clamp-1">
                        {integration.category}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Channels */}
        {activeTab === 'channels' && (
          <div className="space-y-3 pt-1 animate-in fade-in">
            <p className="text-xs text-[#78716C]">
              Specify where this agent can be interacted with.
            </p>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3.5 rounded-[10px] border border-[#ECE7E1] bg-white cursor-pointer hover:bg-[#FAF8F5]">
                <input
                  type="checkbox"
                  checked={channels.includes('web')}
                  onChange={() => handleToggleChannel('web')}
                  className="mt-0.5 rounded text-[#FF7A59] focus:ring-[#FF7A59]"
                />
                <div>
                  <span className="text-xs font-bold text-[#1C1917]">Pazi Web Application</span>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Allow direct interactive chats in the Conversations tab.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-[10px] border border-[#ECE7E1] bg-white cursor-pointer hover:bg-[#FAF8F5]">
                <input
                  type="checkbox"
                  checked={channels.includes('slack')}
                  onChange={() => handleToggleChannel('slack')}
                  className="mt-0.5 rounded text-[#FF7A59] focus:ring-[#FF7A59]"
                />
                <div>
                  <span className="text-xs font-bold text-[#1C1917]">Slack Channels & Threads</span>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Respond to team member @mentions and post scheduled summaries in Slack.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Tab 5: Guardrails */}
        {activeTab === 'guardrails' && (
          <div className="space-y-4 pt-1 animate-in fade-in">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#1C1917]">Max Step Limit</label>
                <span className="font-mono text-xs font-bold text-[#FF7A59]">
                  {maxSteps} steps
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                value={maxSteps}
                onChange={(e) => setMaxSteps(parseInt(e.target.value, 10))}
                className="w-full accent-[#FF7A59] cursor-pointer"
              />
              <p className="text-[11px] text-[#78716C] mt-1">
                Halts recursive tool invocation loops if reasoning exceeds this limit.
              </p>
            </div>

            <div className="pt-3 border-t border-[#ECE7E1]">
              <label className="flex items-start gap-3 p-3.5 rounded-[10px] border border-[#ECE7E1] bg-[#FAF8F5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="mt-0.5 rounded text-[#FF7A59] focus:ring-[#FF7A59]"
                />
                <div>
                  <span className="text-xs font-bold text-[#1C1917]">
                    Require Human Approval for External Actions
                  </span>
                  <p className="text-[11px] text-[#78716C] mt-0.5">
                    When enabled, actions like sending emails or writing destructive database records will pause for confirmation before proceeding.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-[#ECE7E1] flex items-center justify-end gap-2.5">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            {agentToEdit ? 'Save Changes' : 'Create Agent'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
