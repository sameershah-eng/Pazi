import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { streamAgentChat } from '../lib/gemini';
import {
  Hash,
  Send,
  AtSign,
  Smile,
  Paperclip,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  MessageSquare,
  PlayCircle,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SlackPage: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const navigate = useNavigate();

  const [activeChannel, setActiveChannel] = useState('#agent-ops');
  const [inputText, setInputText] = useState('');
  const [isAgentReplying, setIsAgentReplying] = useState(false);
  const [activeThreadParentId, setActiveThreadParentId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const channels = ['#agent-ops', '#lead-triage', '#general', '#incidents'];

  const channelMessages = state.slackMessages.filter(
    (m) => m.channel === activeChannel
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length, isAgentReplying]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isAgentReplying) return;

    setInputText('');

    // Check if user mentioned an agent
    const mentionedAgent = state.agents.find((ag) =>
      text.toLowerCase().includes(`@${ag.name.toLowerCase()}`) ||
      text.toLowerCase().includes(`@${ag.initials.toLowerCase()}`)
    ) || state.agents[0]; // Default to first agent if @Agent or generic query

    const newMsgId = `slk_${Date.now()}`;

    // 1. Post user message
    dispatch({
      type: 'POST_SLACK_MESSAGE',
      payload: {
        text,
        channel: activeChannel,
        authorName: 'Alex Rivera (Staff Ops)',
      },
    });

    // 2. If mentioning an agent or query, trigger autonomous reply
    if (text.includes('@') || text.includes('?')) {
      setIsAgentReplying(true);

      // Create linked task run
      const runId = `run_${Date.now()}`;
      dispatch({
        type: 'TRIGGER_AGENT_RUN',
        payload: {
          agentId: mentionedAgent.id,
          trigger: 'slack',
          inputPrompt: `Slack query in ${activeChannel}: "${text}"`,
        },
      });

      // Stream response using chat engine
      let fullText = '';
      await streamAgentChat(
        {
          messages: [{ role: 'user', content: text }],
          agentName: mentionedAgent.name,
          agentRole: mentionedAgent.role,
          systemPrompt: `${mentionedAgent.systemPrompt}\n\nYou are replying directly inside Slack channel ${activeChannel}. Keep reply punchy, professional, and formatted for Slack.`,
          enabledTools: mentionedAgent.tools,
        },
        {
          onChunk: (chunk) => {
            fullText += chunk;
          },
          onDone: (full) => {
            dispatch({
              type: 'POST_SLACK_REPLY',
              payload: {
                parentId: newMsgId,
                text: full || fullText,
                taskRunId: runId,
              },
            });
            setIsAgentReplying(false);
          },
        }
      );
    }
  };

  const handleInsertMention = (agentName: string) => {
    setInputText((prev) => `@${agentName} ${prev}`);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Slack Workspace Preview
          </h1>
          <span className="w-2 h-2 rounded-full bg-[#0FB5A6] animate-pulse" />
        </div>
        <p className="text-xs text-[#78716C] mt-1">
          Test interactive Slack app mentions, threaded agent reasoning, and task run dispatch cards.
        </p>
      </div>

      {/* Main Slack App Container */}
      <div className="h-[calc(100vh-13rem)] bg-white rounded-[14px] border border-[#ECE7E1] shadow-sm flex overflow-hidden">
        {/* Slack Left Sidebar */}
        <div className="w-56 bg-[#FAF8F5] border-r border-[#ECE7E1] flex flex-col flex-shrink-0">
          {/* Workspace Title */}
          <div className="h-14 px-4 border-b border-[#ECE7E1] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-[6px] bg-[#1C1917] text-white flex items-center justify-center font-extrabold text-xs">
                A
              </div>
              <span className="font-bold text-xs text-[#1C1917] truncate">Acme Workspace</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#0FB5A6]" />
          </div>

          {/* Channels list */}
          <div className="flex-1 p-3 space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#A8A29E]">
              Channels
            </div>
            {channels.map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-xs font-semibold transition-colors ${
                  activeChannel === ch
                    ? 'bg-white text-[#1C1917] border border-[#ECE7E1] shadow-2xs'
                    : 'text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE9]'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#A8A29E]" />
                  {ch.replace('#', '')}
                </span>
                {ch === '#agent-ops' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A59]" />
                )}
              </button>
            ))}

            <div className="pt-4 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#A8A29E]">
              Active Agents in Slack
            </div>
            {state.agents.map((ag) => (
              <div
                key={ag.id}
                onClick={() => handleInsertMention(ag.name)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] text-xs text-[#57534E] hover:bg-[#F3EFE9] cursor-pointer"
                title={`Click to mention @${ag.name}`}
              >
                <span className="w-2 h-2 rounded-full bg-[#0FB5A6]" />
                <span className="truncate">{ag.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Slack Center Channel Feed */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Channel Header */}
          <div className="h-14 px-5 border-b border-[#ECE7E1] flex items-center justify-between bg-[#FAF8F5]/50">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#78716C]" />
              <span className="font-bold text-xs text-[#1C1917]">{activeChannel}</span>
              <span className="text-[11px] text-[#A8A29E] hidden sm:inline">
                | Agent automation & collaborative triage channel
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#78716C]">Pazi Bot v2.4</span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {channelMessages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                {/* Parent Message */}
                <div className="flex items-start gap-3 group">
                  <img
                    src={msg.user.avatar}
                    alt={msg.user.name}
                    className="w-9 h-9 rounded-[8px] object-cover border border-[#ECE7E1] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-xs text-[#1C1917]">{msg.user.name}</span>
                      <span className="text-[10px] text-[#A8A29E] font-mono">{msg.timestamp}</span>
                    </div>

                    <p className="text-xs text-[#1C1917] mt-1 leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>

                    {/* Attached Task Run Card if present */}
                    {msg.taskRunId && (
                      <div className="mt-2.5 max-w-lg p-3 bg-[#FAF8F5] rounded-[10px] border border-[#ECE7E1] flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#0FB5A6]" />
                          <span className="font-bold text-[#1C1917]">
                            Task Run #{msg.taskRunId.replace('run_', '')} Succeeded
                          </span>
                        </div>
                        <button
                          onClick={() => navigate('/runs')}
                          className="text-[11px] text-[#FF7A59] font-semibold hover:underline flex items-center gap-1"
                        >
                          View Logs
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Threaded Replies */}
                {msg.replies && msg.replies.length > 0 && (
                  <div className="ml-12 pl-4 border-l-2 border-[#ECE7E1] space-y-3">
                    {msg.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-[8px] bg-gradient-to-tr from-[#FF7A59] via-[#F0467E] to-[#FFB547] text-white flex items-center justify-center font-extrabold text-xs shadow-2xs flex-shrink-0">
                          P
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-xs text-[#1C1917]">
                              {reply.user.name}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-[#FAF8F5] border border-[#ECE7E1] text-[9px] font-bold text-[#78716C] uppercase">
                              App
                            </span>
                            <span className="text-[10px] text-[#A8A29E] font-mono">
                              {reply.timestamp}
                            </span>
                          </div>

                          <div className="text-xs text-[#1C1917] mt-1 leading-relaxed bg-[#FAF8F5] p-3 rounded-[10px] border border-[#ECE7E1] whitespace-pre-wrap">
                            {reply.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isAgentReplying && (
              <div className="ml-12 pl-4 border-l-2 border-[#ECE7E1] flex items-center gap-2 text-xs text-[#78716C] animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#FF7A59]" />
                <span>Agent is reasoning and drafting thread response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Mention Suggestions */}
          <div className="px-4 py-2 bg-[#FAF8F5] border-t border-[#ECE7E1] flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] text-[#78716C] font-semibold whitespace-nowrap">
              Mention agent:
            </span>
            {state.agents.map((ag) => (
              <button
                key={ag.id}
                onClick={() => handleInsertMention(ag.name)}
                className="px-2 py-0.5 rounded-[6px] bg-white border border-[#ECE7E1] text-[11px] font-semibold text-[#1C1917] hover:border-[#FF7A59] transition-colors whitespace-nowrap"
              >
                @{ag.name}
              </button>
            ))}
          </div>

          {/* Slack Input Box */}
          <div className="p-3 bg-white border-t border-[#ECE7E1]">
            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder={`Message ${activeChannel} (e.g. "@Lead Qualifier can you review inbound leads?")`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isAgentReplying}
                className="flex-1 px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#ECE7E1] rounded-[10px] focus:outline-none focus:border-[#FF7A59] text-[#1C1917]"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!inputText.trim() || isAgentReplying}
                isLoading={isAgentReplying}
                className="h-9 px-3.5"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
