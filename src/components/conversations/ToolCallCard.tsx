import React, { useState } from 'react';
import { ToolCall } from '../../types';
import { Wrench, CheckCircle2, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

interface ToolCallCardProps {
  toolCall: ToolCall;
}

export const ToolCallCard: React.FC<ToolCallCardProps> = ({ toolCall }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(toolCall, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="my-2.5 rounded-[12px] border border-[#ECE7E1] bg-[#FAF8F5] overflow-hidden text-xs shadow-2xs">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-white border-b border-[#ECE7E1]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[7px] bg-[#FAF8F5] border border-[#ECE7E1] flex items-center justify-center text-[#FF7A59]">
            <Wrench className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-[#1C1917]">{toolCall.toolName}</span>
            <span className="mx-1.5 text-[#A8A29E]">•</span>
            <span className="font-mono text-[11px] text-[#78716C]">{toolCall.action}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] text-[10px] font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            {toolCall.status.toUpperCase()}
          </span>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-[#78716C] hover:text-[#1C1917] rounded"
            title={isExpanded ? 'Collapse parameters' : 'Expand parameters'}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Result summary */}
      {toolCall.result && (
        <div className="px-3.5 py-2 text-[#1C1917] bg-[#FAF8F5] font-medium leading-relaxed flex items-start justify-between gap-2">
          <p className="flex-1 text-[11.5px]">{toolCall.result}</p>
          <button
            onClick={handleCopy}
            className="text-[#78716C] hover:text-[#1C1917] p-1 flex-shrink-0"
            title="Copy payload"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#0FB5A6]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* Expanded payload inputs */}
      {isExpanded && (
        <div className="px-3.5 py-2.5 bg-white border-t border-[#ECE7E1] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29E]">
            Invocation Parameters
          </span>
          <pre className="p-2.5 rounded-[8px] bg-[#FAF8F5] border border-[#ECE7E1] font-mono text-[11px] text-[#1C1917] overflow-x-auto">
            {JSON.stringify(toolCall.inputs, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
