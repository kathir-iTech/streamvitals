'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Bot, Shield, WifiOff, Loader2, X, Send } from 'lucide-react';
import { indicators } from '@/data/indicators';
import { getOfflineAssistantResponse, OUT_OF_SCOPE_RESPONSE } from '@/lib/factsheet-content';

interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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

function getOfflineResponse(indicatorId: string, question: string): string {
  return getOfflineAssistantResponse(indicatorId, question);
}

function renderInline(text: string, baseKey: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g)
    .map((part, idx) => {
      if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${baseKey}-${idx}`}>{part.slice(2, -2)}</strong>;
      }
      if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
        return <em key={`${baseKey}-${idx}`}>{part.slice(1, -1)}</em>;
      }
      return <span key={`${baseKey}-${idx}`}>{part}</span>;
    });
}

// Minimal rich text: bullet/numbered lists, bold, italic, paragraphs. Groq
// answers arrive as markdown; raw asterisks in the chat looked broken.
function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const ordered = lines[i].match(/^\s*\d+\.\s+(.*)$/);
    const bullet = lines[i].match(/^\s*[-*]\s+(.*)$/);
    if (ordered) {
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*\d+\.\s+(.*)$/);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      const listKey = key++;
      blocks.push(
        <ol key={listKey} className="list-decimal pl-4 space-y-0.5 my-1">
          {items.map((t, j) => (
            <li key={j}>{renderInline(t, `${listKey}-${j}`)}</li>
          ))}
        </ol>,
      );
    } else if (bullet) {
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*[-*]\s+(.*)$/);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      const listKey = key++;
      blocks.push(
        <ul key={listKey} className="list-disc pl-4 space-y-0.5 my-1">
          {items.map((t, j) => (
            <li key={j}>{renderInline(t, `${listKey}-${j}`)}</li>
          ))}
        </ul>,
      );
    } else {
      if (lines[i].trim()) {
        const pKey = key++;
        blocks.push(<p key={pKey} className="my-0.5">{renderInline(lines[i].trim(), String(pKey))}</p>);
      }
      i++;
    }
  }
  return <div>{blocks}</div>;
}

export default function BoundedAssistant({ indicatorId }: { indicatorId: string }) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const storageKey = `sv-assistant-chat-${indicatorId}`;
  const restoredRef = useRef(false);
  const openRestoredRef = useRef(false);
  const content = getIndicatorContent(indicatorId);

  // The panel's open state survives reloads too — otherwise the restored chat
  // sits behind a collapsed button and looks like it was lost.
  useEffect(() => {
    const isRestorePass = !openRestoredRef.current;
    openRestoredRef.current = true;
    if (isRestorePass) {
      const timer = setTimeout(() => {
        try {
          if (sessionStorage.getItem('sv-assistant-open') === '1') setOpen(true);
        } catch {
          // storage unavailable — panel starts closed
        }
      }, 0);
      return () => clearTimeout(timer);
    }
    try {
      sessionStorage.setItem('sv-assistant-open', open ? '1' : '0');
    } catch {
      // storage unavailable — ignore
    }
    return undefined;
  }, [open]);

  // The conversation survives reloads and navigation within the tab (the
  // owner's complaint: every reload started a brand-new chat). First effect
  // pass restores; later passes persist. sessionStorage, so closing the tab
  // still discards it.
  useEffect(() => {
    const isRestorePass = !restoredRef.current;
    restoredRef.current = true;
    if (isRestorePass) {
      const timer = setTimeout(() => {
        try {
          const raw = sessionStorage.getItem(storageKey);
          if (raw) {
            const saved: unknown = JSON.parse(raw);
            if (Array.isArray(saved)) setMessages(saved as AssistantMessage[]);
          }
        } catch {
          // storage unavailable (private mode) — chat stays in-memory only
        }
      }, 0);
      return () => clearTimeout(timer);
    }
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // storage unavailable — ignore
    }
    return undefined;
  }, [messages, storageKey]);

  useEffect(() => {
    const onlineTimer = setTimeout(() => setIsOnline(navigator.onLine), 0);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      clearTimeout(onlineTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    const userMessage: AssistantMessage = { role: 'user', content: text, timestamp: new Date().toISOString(), source: 'factsheet' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      if (!isOnline) {
        const response = getOfflineResponse(indicatorId, text);
        setMessages((prev) => [...prev, { role: 'assistant', content: response, timestamp: new Date().toISOString(), source: 'offline' }]);
      } else {
        const groqResponse = await callGroq(indicatorId, text);
        setMessages((prev) => [...prev, { role: 'assistant', content: groqResponse, timestamp: new Date().toISOString(), source: 'groq' }]);
      }
    } catch {
      const response = getOfflineResponse(indicatorId, text);
      setMessages((prev) => [...prev, { role: 'assistant', content: response, timestamp: new Date().toISOString(), source: 'offline' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, isOnline, indicatorId]);

  const handleQuickQuestion = (question: string) => { void handleSend(question); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleClear = () => { setMessages([]); };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Field Assistant"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-[#0a7d58] text-white rounded-full shadow-lg hover:bg-[#0a7d58] transition-all text-sm font-bold"
      >
        <Bot className="w-4 h-4" /> Field Assistant
      </button>
    );
  }

  return (
    <aside className="fixed right-0 top-0 h-full w-80 max-w-[90vw] z-40 bg-[#f5faf7] border-l border-[rgba(0,0,0,0.06)] flex flex-col shadow-xl" aria-label="Field Assistant panel">
      <div className="p-4 border-b border-[rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-black flex items-center gap-2"><Bot className="w-4 h-4 text-[#0a7d58]" /> Field Assistant</h3>
          <div className="flex items-center gap-2">
            <button onClick={handleClear} aria-label="Clear assistant history" className="text-[rgba(0,0,0,0.55)] hover:text-black transition-colors text-[10px] font-bold px-2 py-1">Clear</button>
            <button onClick={() => setOpen(false)} aria-label="Close Field Assistant" className="text-[rgba(0,0,0,0.55)] hover:text-black transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 border border-[rgba(0,0,0,0.06)]">
          <div className="flex items-start gap-2">
            <Shield className="w-3 h-3 text-[#0a7d58] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-[#0a7d58] font-bold">Bounded Scope</p>
              <p className="text-[10px] text-[rgba(0,0,0,0.55)] leading-tight">Answers from OneAquaHealth factsheets only. Never identifies species and never scores — assessment comes from the deterministic rules on this page.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="bg-white rounded-lg p-3 border border-[rgba(0,0,0,0.06)]">
            <p className="text-[11px] text-[rgba(0,0,0,0.62)] mb-2">Click a question below or type your own:</p>
            <div className="space-y-1.5">
              <button onClick={() => handleQuickQuestion(content ? content.citizen_question : 'Explain this indicator')} className="w-full text-left bg-[#f5faf7] rounded p-2.5 border border-[rgba(0,0,0,0.06)] hover:border-[#0d9b6e] hover:bg-[rgba(13,155,110,0.03)] text-[11px] text-[rgba(0,0,0,0.62)] transition-all">
                What does this indicator measure?
              </button>
              <button onClick={() => handleQuickQuestion('What should I do during sampling?')} className="w-full text-left bg-[#f5faf7] rounded p-2.5 border border-[rgba(0,0,0,0.06)] hover:border-[#0d9b6e] hover:bg-[rgba(13,155,110,0.03)] text-[11px] text-[rgba(0,0,0,0.62)] transition-all">
                Sampling procedure guidance
              </button>
              <button onClick={() => handleQuickQuestion('What equipment do I need?')} className="w-full text-left bg-[#f5faf7] rounded p-2.5 border border-[rgba(0,0,0,0.06)] hover:border-[#0d9b6e] hover:bg-[rgba(13,155,110,0.03)] text-[11px] text-[rgba(0,0,0,0.62)] transition-all">
                Required equipment
              </button>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-5 h-5 rounded-full bg-[rgba(13,155,110,0.08)] flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-3 h-3 text-[#0a7d58]" />
              </div>
            )}
            <div className={`max-w-[200px] rounded-lg p-2.5 text-xs ${msg.role === 'user' ? 'bg-[rgba(13,155,110,0.08)] text-black ml-auto' : 'bg-white text-[rgba(0,0,0,0.6)] border border-[rgba(0,0,0,0.06)]'}`}>
              {msg.role === 'assistant' ? (
                <div className="leading-relaxed">
                  <RichText text={msg.content} />
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2" data-testid="assistant-pending">
            <div className="w-5 h-5 rounded-full bg-[rgba(13,155,110,0.08)] flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-3 h-3 text-[#0a7d58]" />
            </div>
            <div className="max-w-[200px] rounded-lg p-2.5 text-xs bg-white text-[rgba(0,0,0,0.6)] border border-[rgba(0,0,0,0.06)]">
              <span className="animate-pulse">Checking the factsheet…</span>
            </div>
          </div>
        )}
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
                  placeholder={loading ? 'Checking the factsheet…' : 'Ask about this indicator...'}
                  suppressHydrationWarning
                  className="flex-1 px-3 py-2 bg-white border border-[rgba(0,0,0,0.08)] rounded-full text-xs text-black placeholder-[rgba(0,0,0,0.25)] focus:ring-2 focus:ring-[#0d9b6e] focus:outline-none"
                />
            <button onClick={() => void handleSend()} disabled={loading || !input.trim()} aria-label="Send question" className="px-3 py-2 bg-[#0a7d58] text-white rounded-full hover:bg-[#0a7d58] disabled:opacity-40 transition-all">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            </button>
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="border-t border-[rgba(0,0,0,0.06)] p-3">
          <div className="flex items-center gap-2 mb-2">
            <WifiOff className="w-3 h-3 text-[#c2410c]" />
            <span className="text-[10px] text-[#c2410c] font-medium">Offline — showing factsheet reference</span>
          </div>
          <button onClick={handleClear} className="w-full py-1.5 bg-white border border-[rgba(0,0,0,0.08)] rounded-full text-[10px] text-[rgba(0,0,0,0.62)] hover:text-black transition-all">Clear history</button>
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
