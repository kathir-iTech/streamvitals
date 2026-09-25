'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Bot, Shield, AlertTriangle, WifiOff, Loader2, X, ChevronDown, Send } from 'lucide-react';
import { indicators } from '@/data/indicators';

const OUT_OF_SCOPE_RESPONSE = "I'm equipped to answer using the OneAquaHealth protocol and factsheet definitions I have. This question falls outside that scope — please consult the official monitoring guide.";

interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  source: 'factsheet' | 'groq' | 'offline';
}

interface IndicatorContent {
  id: string;
  name: string;
  citizen_question: string;
  visual_anchor_guide: string;
  citizen_state_labels: Record<string, string>;
  source: string;
}

function getIndicatorContent(indicatorId: string): IndicatorContent | null {
  const ind = indicators.find((i) => i.id === indicatorId);
  if (!ind) return null;
  return {
    id: ind.id,
    name: ind.name,
    citizen_question: ind.citizen_question,
    visual_anchor_guide: ind.visual_anchor_guide,
    citizen_state_labels: ind.citizen_state_labels || {},
    source: ind.source,
  };
}

function getOfflineResponse(content: IndicatorContent | null, indicatorId: string): string {
  if (!content) return `Indicator ${indicatorId} content is not available offline. Please consult the official OneAquaHealth factsheets.`;
  return `Based on the OneAquaHealth factsheet (${content.source}):\n\n**Indicator:** ${content.name}\n\n**Protocol Question:** ${content.citizen_question}\n\n**Visual Anchor:** ${content.visual_anchor_guide}\n\n${content.citizen_state_labels && Object.keys(content.citizen_state_labels).length > 0 ? '**State definitions:**\n' + Object.entries(content.citizen_state_labels).map(([k, v]) => `- ${v}`).join('\n') : 'No citizen state labels defined for this indicator.'}\n\nThis indicator requires laboratory analysis. You cannot determine the result in the field.`;
}

export default function BoundedAssistant({ indicatorId }: { indicatorId: string }) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const content = getIndicatorContent(indicatorId);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMessage: AssistantMessage = { role: 'user', content: input, timestamp: new Date(), source: 'factsheet' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (!isOnline) {
        const response = getOfflineResponse(content, indicatorId);
        const assistantMessage: AssistantMessage = { role: 'assistant', content: response, timestamp: new Date(), source: 'offline' };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const groqResponse = await callGroq(indicatorId, input);
        const assistantMessage: AssistantMessage = { role: 'assistant', content: groqResponse, timestamp: new Date(), source: 'groq' };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      const response = getOfflineResponse(content, indicatorId);
      const assistantMessage: AssistantMessage = { role: 'assistant', content: response, timestamp: new Date(), source: 'offline' };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, isOnline, content, indicatorId]);

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    handleSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleClear = () => {
    setMessages([]);
    setShowHistory(false);
  };

  return (
    <aside className="w-72 bg-white border-l border-gray-200 flex flex-col h-full shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold flex items-center gap-2 text-[#1a1a2e]">
            <Bot className="w-4 h-4 text-emerald-600" /> Field Assistant
          </h3>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-1" title="Offline mode">
                <WifiOff className="w-2 h-2" /> Offline
              </span>
            )}
            <button onClick={handleClear} className="text-[#1a1a2e]/30 hover:text-[#1a1a2e]/60 transition-colors" title="Clear history">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
          <div className="flex items-start gap-2">
            <Shield className="w-3 h-3 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-emerald-700 font-semibold">Bounded Scope</p>
              <p className="text-[10px] text-[#1a1a2e]/40 leading-tight">Answers from OneAquaHealth factsheets only. Cannot identify species, assess water quality, or provide health opinions.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-[#1a1a2e]/50 mb-2">Click a question below or type your own:</p>
            <div className="space-y-1.5">
              <button onClick={() => handleQuickQuestion(content ? content.citizen_question : 'Explain this indicator')} className="w-full text-left bg-white rounded p-2.5 border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-[11px] text-[#1a1a2e]/60 hover:text-[#1a1a2e]/80 transition-all">
                What does this indicator measure?
              </button>
              <button onClick={() => handleQuickQuestion('What should I do during sampling?')} className="w-full text-left bg-white rounded p-2.5 border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-[11px] text-[#1a1a2e]/60 hover:text-[#1a1a2e]/80 transition-all">
                Sampling procedure guidance
              </button>
              <button onClick={() => handleQuickQuestion('What equipment do I need?')} className="w-full text-left bg-white rounded p-2.5 border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-[11px] text-[#1a1a2e]/60 hover:text-[#1a1a2e]/80 transition-all">
                Required equipment
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-3 h-3 text-emerald-600" />
              </div>
            )}
            <div className={`max-w-[220px] rounded-lg p-2.5 text-xs ${msg.role === 'user' ? 'bg-emerald-50 text-[#1a1a2e] ml-auto' : 'bg-gray-50 text-[#1a1a2e]/70 border border-gray-200'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <span className="text-[9px] text-[#1a1a2e]/20 mt-1 inline-block">
                {msg.source === 'offline' ? '📡 Offline' : msg.source === 'groq' ? '🤖 Groq' : '📄 Factsheet'}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isOnline && (
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this indicator..."
              disabled={loading}
              className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-[#1a1a2e] placeholder-[#1a1a2e]/30 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-40"
            />
            <button onClick={handleSend} disabled={loading || !input.trim()} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 disabled:opacity-40 transition-all">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            </button>
          </div>
          <p className="text-[9px] text-[#1a1a2e]/20 mt-1">Requires network. Offline: static factsheet reference.</p>
        </div>
      )}

      {!isOnline && (
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-2">
            <WifiOff className="w-3 h-3 text-amber-600" />
            <span className="text-[10px] text-amber-700">Offline — showing factsheet reference</span>
          </div>
          <button onClick={handleClear} className="w-full py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] text-[#1a1a2e]/50 hover:text-[#1a1a2e]/70 transition-all">
            Clear history
          </button>
        </div>
      )}
    </aside>
  );
}

async function callGroq(indicatorId: string, question: string): Promise<string> {
  const response = await fetch('/api/ai/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ indicatorId, question }),
  });
  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }
  const data = await response.json();
  return data.response || OUT_OF_SCOPE_RESPONSE;
}