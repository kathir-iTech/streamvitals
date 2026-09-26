'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Bot, Shield, WifiOff, Loader2, X, Send } from 'lucide-react';
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
  return { id: ind.id, name: ind.name, citizen_question: ind.citizen_question, visual_anchor_guide: ind.visual_anchor_guide, citizen_state_labels: ind.citizen_state_labels || {}, source: ind.source };
}

function getOfflineResponse(content: IndicatorContent | null, indicatorId: string): string {
  if (!content) return `Indicator ${indicatorId} content is not available offline.`;
  return `Based on the OneAquaHealth factsheet (${content.source}):\n\nIndicator: ${content.name}\n\nProtocol Question: ${content.citizen_question}\n\nVisual Anchor: ${content.visual_anchor_guide}\n\nThis indicator requires laboratory analysis.`;
}

export default function BoundedAssistant({ indicatorId }: { indicatorId: string }) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
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

  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMessage: AssistantMessage = { role: 'user', content: input, timestamp: new Date(), source: 'factsheet' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      if (!isOnline) {
        const response = getOfflineResponse(content, indicatorId);
        setMessages((prev) => [...prev, { role: 'assistant', content: response, timestamp: new Date(), source: 'offline' }]);
      } else {
        const groqResponse = await callGroq(indicatorId, input);
        setMessages((prev) => [...prev, { role: 'assistant', content: groqResponse, timestamp: new Date(), source: 'groq' }]);
      }
    } catch {
      const response = getOfflineResponse(content, indicatorId);
      setMessages((prev) => [...prev, { role: 'assistant', content: response, timestamp: new Date(), source: 'offline' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, isOnline, content, indicatorId]);

  const handleQuickQuestion = (question: string) => { setInput(question); handleSend(); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleClear = () => { setMessages([]); };

  return (
    <aside className="w-64 bg-[#f5faf7] border-l border-[rgba(0,0,0,0.06)] flex flex-col h-full">
      <div className="p-4 border-b border-[rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-black flex items-center gap-2"><Bot className="w-4 h-4 text-[#0d9b6e]" /> Field Assistant</h3>
          <button onClick={handleClear} className="text-[rgba(0,0,0,0.2)] hover:text-black transition-colors"><X className="w-3 h-3" /></button>
        </div>
        <div className="bg-white rounded-lg p-2.5 border border-[rgba(0,0,0,0.06)]">
          <div className="flex items-start gap-2">
            <Shield className="w-3 h-3 text-[#0d9b6e] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-[#0d9b6e] font-bold">Bounded Scope</p>
              <p className="text-[10px] text-[rgba(0,0,0,0.35)] leading-tight">Answers from OneAquaHealth factsheets only. Cannot identify species or assess water quality.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="bg-white rounded-lg p-3 border border-[rgba(0,0,0,0.06)]">
            <p className="text-[11px] text-[rgba(0,0,0,0.4)] mb-2">Click a question below or type your own:</p>
            <div className="space-y-1.5">
              <button onClick={() => handleQuickQuestion(content ? content.citizen_question : 'Explain this indicator')} className="w-full text-left bg-[#f5faf7] rounded p-2.5 border border-[rgba(0,0,0,0.06)] hover:border-[#0d9b6e] hover:bg-[rgba(13,155,110,0.03)] text-[11px] text-[rgba(0,0,0,0.5)] transition-all">
                What does this indicator measure?
              </button>
              <button onClick={() => handleQuickQuestion('What should I do during sampling?')} className="w-full text-left bg-[#f5faf7] rounded p-2.5 border border-[rgba(0,0,0,0.06)] hover:border-[#0d9b6e] hover:bg-[rgba(13,155,110,0.03)] text-[11px] text-[rgba(0,0,0,0.5)] transition-all">
                Sampling procedure guidance
              </button>
              <button onClick={() => handleQuickQuestion('What equipment do I need?')} className="w-full text-left bg-[#f5faf7] rounded p-2.5 border border-[rgba(0,0,0,0.06)] hover:border-[#0d9b6e] hover:bg-[rgba(13,155,110,0.03)] text-[11px] text-[rgba(0,0,0,0.5)] transition-all">
                Required equipment
              </button>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-5 h-5 rounded-full bg-[rgba(13,155,110,0.08)] flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-3 h-3 text-[#0d9b6e]" />
              </div>
            )}
            <div className={`max-w-[200px] rounded-lg p-2.5 text-xs ${msg.role === 'user' ? 'bg-[rgba(13,155,110,0.08)] text-black ml-auto' : 'bg-white text-[rgba(0,0,0,0.6)] border border-[rgba(0,0,0,0.06)]'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isOnline && (
        <div className="border-t border-[rgba(0,0,0,0.06)] p-3">
          <div className="flex items-center gap-2 mb-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this indicator..."
              disabled={loading}
              className="flex-1 px-3 py-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-full text-xs text-black placeholder-[rgba(0,0,0,0.25)] focus:ring-2 focus:ring-[#0d9b6e] focus:outline-none disabled:opacity-40"
            />
            <button onClick={handleSend} disabled={loading || !input.trim()} className="px-3 py-2 bg-[#0d9b6e] text-white rounded-full hover:bg-[#0a7d58] disabled:opacity-40 transition-all">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            </button>
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="border-t border-[rgba(0,0,0,0.06)] p-3">
          <div className="flex items-center gap-2 mb-2">
            <WifiOff className="w-3 h-3 text-[#e85d3a]" />
            <span className="text-[10px] text-[#e85d3a] font-medium">Offline — showing factsheet reference</span>
          </div>
          <button onClick={handleClear} className="w-full py-1.5 bg-white border border-[rgba(0,0,0,0.08)] rounded-full text-[10px] text-[rgba(0,0,0,0.4)] hover:text-black transition-all">Clear history</button>
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
  if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
  const data = await response.json();
  return data.response || OUT_OF_SCOPE_RESPONSE;
}
