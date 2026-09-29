import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/AppContext';
import { ToolCallCard } from '../components/conversations/ToolCallCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { streamAgentChat } from '../lib/gemini';
import {
  MessageSquare,
  Plus,
  Send,
  Search,
  Copy,
  Check,
  Bot,
  Wrench,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Info,
  Trash2,
} from 'lucide-react';
import { formatRelativeTime } from '../lib/cronUtils';

export const ConversationsPage: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Active conversation
  const selectedConversation =
    state.conversations.find((c) => c.id === state.selectedConversationId) ||
    state.conversations[0];

  const selectedAgent = state.agents.find(
    (a) => a.id === selectedConversation?.agentId
  ) || state.agents[0];

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages, isStreaming]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isStreaming || !selectedConversation || !selectedAgent) return;

    setInputText('');
    setIsStreaming(true);

    const convId = selectedConversation.id;

    // 1. Dispatch user message + empty agent streaming placeholder
    dispatch({
      type: 'ADD_USER_MESSAGE',
      payload: { conversationId: convId, content: trimmed },
    });

    // 2. Prepare context for Gemini
    const existingMessages = selectedConversation.messages
      .filter((m) => m.role === 'user' || m.role === 'agent')
      .map((m) => ({
        role: m.role as 'user' | 'agent',
        content: m.content,
      }));

    existingMessages.push({ role: 'user', content: trimmed });

    let fullAccumulated = '';

    await streamAgentChat(
      {
        messages: existingMessages,
        agentName: selectedAgent.name,
        agentRole: selectedAgent.role,
        systemPrompt: selectedAgent.systemPrompt,
        enabledTools: selectedAgent.tools,
      },
      {
        onChunk: (chunk) => {
          fullAccumulated += chunk;
          dispatch({
            type: 'APPEND_STREAM_CHUNK',
            payload: { conversationId: convId, chunk },
          });
        },
        onToolCall: (toolCall) => {
          dispatch({
            type: 'ATTACH_TOOL_CALL',
            payload: { conversationId: convId, toolCall },
          });
        },
        onDone: (full) => {
          dispatch({
            type: 'FINALIZE_STREAM',
            payload: { conversationId: convId, fullContent: full || fullAccumulated },
          });
          setIsStreaming(false);
          inputRef.current?.focus();
        },
        onError: (err) => {
          console.error('Chat stream error:', err);
          setIsStreaming(false);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 1800);
  };

  const handleNewConversation = (agentId?: string) => {
    const targetAgentId = agentId || selectedAgent?.id || state.agents[0]?.id;
    dispatch({
      type: 'CREATE_CONVERSATION',
      payload: { agentId: targetAgentId },
    });
  };

  const filteredConversations = state.conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* COLUMN 1: Conversation List (Left) */}
      <div className="w-full md:w-72 lg:w-80 flex flex-col bg-white rounded-[14px] border border-[#ECE7E1] shadow-2xs overflow-hidden flex-shrink-0">
        <div className="p-3.5 border-b border-[#ECE7E1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#FF7A59]" />
            <h2 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
              Conversations
            </h2>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => handleNewConversation()}
          >
            New
          </Button>
        </div>

        {/* Search */}
        <div className="p-2.5 border-b border-[#ECE7E1]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-[#FAF8F5] border border-[#ECE7E1] rounded-[8px] focus:outline-none focus:border-[#FF7A59]"
            />
          </div>
        </div>

        {/* Thread items list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.map((conv) => {
            const isSelected = selectedConversation?.id === conv.id;
            const convAgent = state.agents.find((a) => a.id === conv.agentId);
            return (
              <div
                key={conv.id}
                onClick={() => dispatch({ type: 'SELECT_CONVERSATION', payload: conv.id })}
                className={`group w-full p-2.5 rounded-[10px] text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-[#FAF8F5] border border-[#ECE7E1] shadow-2xs'
                    : 'hover:bg-[#FAF8F5] border border-transparent'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-[8px] bg-gradient-to-tr ${
                    convAgent?.avatarColor || 'from-[#FF7A59] to-[#FFB547]'
                  } text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5`}
                >
                  {convAgent?.initials || 'AG'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1C1917] truncate">
                      {conv.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-[#78716C]">
                    <span className="truncate">{convAgent?.name}</span>
                    <span className="font-mono text-[10px] flex-shrink-0">
                      {formatRelativeTime(conv.updatedAt)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'DELETE_CONVERSATION', payload: conv.id });
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#A8A29E] hover:text-[#DC2626] transition-opacity"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* COLUMN 2: Chat Thread (Center) */}
      <div className="flex-1 flex flex-col bg-white rounded-[14px] border border-[#ECE7E1] shadow-2xs overflow-hidden">
        {selectedConversation && selectedAgent ? (
          <>
            {/* Thread Header */}
            <div className="h-14 px-4 border-b border-[#ECE7E1] bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-[9px] bg-gradient-to-tr ${selectedAgent.avatarColor} text-white flex items-center justify-center font-extrabold text-xs shadow-2xs`}
                >
                  {selectedAgent.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-[#1C1917] tracking-tight">
                      {selectedAgent.name}
                    </h3>
                    <Badge variant={selectedAgent.status === 'active' ? 'active' : 'paused'} size="sm">
                      {selectedAgent.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#78716C] leading-none mt-0.5">
                    {selectedAgent.role}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-[#78716C] hidden sm:block">
                Powered by <span className="font-semibold text-[#1C1917]">gemini-2.5-flash</span>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl ${
                      isUser ? 'ml-auto' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`relative rounded-[12px] p-4 text-xs leading-relaxed max-w-full ${
                        isUser
                          ? 'bg-[#FAF8F5] text-[#1C1917] border border-[#ECE7E1] shadow-2xs'
                          : 'bg-white text-[#1C1917] border border-[#ECE7E1] shadow-2xs'
                      }`}
                    >
                      {/* Message author badge & copy */}
                      <div className="flex items-center justify-between gap-4 mb-1 text-[10px] text-[#78716C] pb-1 border-b border-[#ECE7E1]/50">
                        <span className="font-semibold text-[#1C1917]">
                          {isUser ? 'You' : selectedAgent.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{formatRelativeTime(msg.timestamp)}</span>
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="p-1 text-[#78716C] hover:text-[#1C1917] rounded"
                            title="Copy reply text"
                          >
                            {copiedMessageId === msg.id ? (
                              <Check className="w-3 h-3 text-[#0FB5A6]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content with markdown line break formatting */}
                      <div className="whitespace-pre-wrap font-sans text-xs">
                        {msg.content || (msg.isStreaming && (
                          <span className="inline-flex items-center gap-1.5 text-[#78716C] italic">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A59] animate-pulse" />
                            Reasoning and drafting response...
                          </span>
                        ))}
                      </div>

                      {/* Inline Tool Call Card if executed */}
                      {msg.toolCall && (
                        <ToolCallCard toolCall={msg.toolCall} />
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-[#ECE7E1] bg-[#FAF8F5]">
              <form onSubmit={handleSendMessage} className="relative flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  rows={2}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isStreaming}
                  placeholder={`Ask ${selectedAgent.name} to execute a task or query records (Press Enter to send)...`}
                  className="flex-1 p-2.5 text-xs bg-white border border-[#ECE7E1] rounded-[10px] focus:outline-none focus:border-[#FF7A59] resize-none leading-relaxed text-[#1C1917] disabled:opacity-50"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!inputText.trim() || isStreaming}
                  isLoading={isStreaming}
                  className="h-10 px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-[#78716C]">
            Select or create a conversation to begin.
          </div>
        )}
      </div>

      {/* COLUMN 3: Right Details Panel (Agent & Tool Context) */}
      {selectedAgent && (
        <div className="hidden xl:flex w-72 lg:w-80 flex-col bg-white rounded-[14px] border border-[#ECE7E1] shadow-2xs overflow-y-auto p-4 space-y-4 flex-shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E]">
              Agent Profile
            </span>
            <div className="mt-2.5 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-[11px] bg-gradient-to-tr ${selectedAgent.avatarColor} text-white flex items-center justify-center font-extrabold text-sm shadow-xs`}
              >
                {selectedAgent.initials}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1C1917]">{selectedAgent.name}</h3>
                <p className="text-xs text-[#78716C]">{selectedAgent.role}</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#78716C] leading-relaxed">
            {selectedAgent.description}
          </p>

          {/* Tools in this conversation thread */}
          <div className="pt-3 border-t border-[#ECE7E1]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E] flex items-center gap-1.5 mb-2">
              <Wrench className="w-3 h-3 text-[#FF7A59]" />
              Invoked in this Thread
            </span>
            {selectedConversation.usedTools && selectedConversation.usedTools.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedConversation.usedTools.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-[6px] bg-[#FAF8F5] border border-[#ECE7E1] text-[11px] font-medium text-[#1C1917]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#A8A29E] italic">
                No tool calls executed in this thread yet.
              </p>
            )}
          </div>

          {/* Guardrails summary */}
          <div className="pt-3 border-t border-[#ECE7E1]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E] flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-3 h-3 text-[#0FB5A6]" />
              Safety Guardrails
            </span>
            <div className="space-y-1.5 text-xs text-[#57534E]">
              <div className="flex justify-between">
                <span>Max Step Limit:</span>
                <span className="font-mono font-bold text-[#1C1917]">
                  {selectedAgent.guardrails.maxSteps} steps
                </span>
              </div>
              <div className="flex justify-between">
                <span>External Action Approval:</span>
                <span className="font-semibold text-[#1C1917]">
                  {selectedAgent.guardrails.requireApproval ? 'Required' : 'Automated'}
                </span>
              </div>
            </div>
          </div>

          {/* System Prompt snippet */}
          <div className="pt-3 border-t border-[#ECE7E1]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E]">
                System Prompt
              </span>
              <button
                onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                className="text-[11px] text-[#FF7A59] font-medium hover:underline"
              >
                {showSystemPrompt ? 'Hide' : 'Inspect'}
              </button>
            </div>
            {showSystemPrompt ? (
              <pre className="p-2.5 rounded-[8px] bg-[#FAF8F5] border border-[#ECE7E1] font-mono text-[10.5px] text-[#1C1917] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedAgent.systemPrompt}
              </pre>
            ) : (
              <p className="text-[11px] font-mono text-[#78716C] line-clamp-3 bg-[#FAF8F5] p-2 rounded-[6px]">
                {selectedAgent.systemPrompt}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
