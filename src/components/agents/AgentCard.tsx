import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MoreVertical,
  Play,
  Pause,
  Copy,
  Trash2,
  Edit2,
  MessageSquare,
  Clock,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Agent, IntegrationId } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAppStore } from '../../store/AppContext';
import { formatRelativeTime } from '../../lib/cronUtils';

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onEdit }) => {
  const { dispatch } = useAppStore();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getToolLabel = (toolId: IntegrationId) => {
    const map: Record<IntegrationId, string> = {
      slack: 'Slack',
      gmail: 'Gmail',
      google_calendar: 'Calendar',
      hubspot: 'HubSpot',
      notion: 'Notion',
      github: 'GitHub',
      stripe: 'Stripe',
      webhooks: 'Webhooks',
    };
    return map[toolId] || toolId;
  };

  const handleStartChat = () => {
    dispatch({ type: 'CREATE_CONVERSATION', payload: { agentId: agent.id } });
    navigate('/conversations');
  };

  const handleRunNow = () => {
    dispatch({ type: 'TRIGGER_AGENT_RUN', payload: { agentId: agent.id, trigger: 'manual' } });
    navigate('/runs');
  };

  return (
    <>
      <Card hoverLift className="flex flex-col h-full p-5 relative group">
        {/* Header: Avatar, Name, Status, Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-[12px] bg-gradient-to-tr ${agent.avatarColor} text-white flex items-center justify-center font-extrabold text-sm shadow-[0_2px_8px_rgba(255,122,89,0.25)] flex-shrink-0`}
            >
              {agent.initials}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1917] tracking-tight group-hover:text-[#FF7A59] transition-colors">
                {agent.name}
              </h3>
              <p className="text-xs text-[#78716C] font-medium leading-none mt-1">
                {agent.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant={agent.status === 'active' ? 'active' : 'paused'} size="sm">
              {agent.status === 'active' ? 'Active' : 'Paused'}
            </Badge>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5] rounded-[8px] transition-colors"
                aria-label="Agent options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-[12px] border border-[#ECE7E1] shadow-[0_8px_24px_rgba(28,25,23,0.1)] py-1.5 z-20 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      onEdit(agent);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#1C1917] hover:bg-[#FAF8F5] font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#78716C]" />
                    Edit Agent
                  </button>
                  <button
                    onClick={() => {
                      dispatch({ type: 'TOGGLE_AGENT_STATUS', payload: agent.id });
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#1C1917] hover:bg-[#FAF8F5] font-medium"
                  >
                    {agent.status === 'active' ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-[#78716C]" />
                        Pause Agent
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-[#78716C]" />
                        Resume Agent
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      dispatch({ type: 'DUPLICATE_AGENT', payload: agent.id });
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#1C1917] hover:bg-[#FAF8F5] font-medium"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#78716C]" />
                    Duplicate
                  </button>
                  <div className="border-t border-[#ECE7E1] my-1" />
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#DC2626] hover:bg-[#FEF2F2] font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Agent
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-xs text-[#78716C] leading-relaxed line-clamp-2 min-h-[32px]">
          {agent.description}
        </p>

        {/* Tools & Guardrails tags */}
        <div className="mt-4 pt-3 border-t border-[#ECE7E1] flex flex-wrap gap-1.5">
          {agent.tools.length > 0 ? (
            agent.tools.slice(0, 3).map((toolId) => (
              <span
                key={toolId}
                className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-[#FAF8F5] border border-[#ECE7E1] text-[11px] font-medium text-[#57534E]"
              >
                {getToolLabel(toolId)}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-[#A8A29E] italic">No connected tools</span>
          )}
          {agent.tools.length > 3 && (
            <span className="text-[11px] text-[#78716C] px-1 font-semibold self-center">
              +{agent.tools.length - 3} more
            </span>
          )}
        </div>

        {/* Meta: Last run & max steps */}
        <div className="mt-auto pt-4 flex items-center justify-between text-[11px] text-[#78716C]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {agent.lastRunAt === 'Never' ? 'Never executed' : `Ran ${formatRelativeTime(agent.lastRunAt)}`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-[#A8A29E]" />
            <span className="font-mono text-[10px]">max {agent.guardrails.maxSteps} steps</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-3.5 pt-3 border-t border-[#ECE7E1] grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
            onClick={handleStartChat}
          >
            Chat
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Play className="w-3.5 h-3.5" />}
            onClick={handleRunNow}
          >
            Run Now
          </Button>
        </div>
      </Card>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1C1917]/40 backdrop-blur-xs"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-[14px] border border-[#ECE7E1] shadow-xl p-5 z-10 animate-in fade-in zoom-in-95">
            <h4 className="text-base font-bold text-[#1C1917]">Delete Agent?</h4>
            <p className="mt-1.5 text-xs text-[#78716C] leading-relaxed">
              Are you sure you want to delete <strong>"{agent.name}"</strong>? Any scheduled jobs assigned to this agent will need to be reassigned.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  dispatch({ type: 'DELETE_AGENT', payload: agent.id });
                  setShowDeleteConfirm(false);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
