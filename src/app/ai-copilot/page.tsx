'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, Loader2, ChevronDown, X, Mic, MicOff, Download, Copy, Check, Globe, FlaskConical, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

type AIMode = 'expert' | 'beginner' | 'friendly';
const modeConfig: Record<AIMode, { label: string; color: string; icon: string }> = {
  expert: { label: 'Expert', color: 'text-red-300', icon: '🔬' },
  beginner: { label: 'Beginner', color: 'text-emerald-300', icon: '🌱' },
  friendly: { label: 'Friendly', color: 'text-teal-300', icon: '🤝' },
};

export default function AICopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome to StreamVitals AI Copilot! 🌊 I can help you understand your stream health assessment, explain the rules behind it, and recommend actions. Try asking me something or pick a quick question below.', timestamp: new Date(), sources: [] },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [aiMode, setAIMode] = useState<AIMode>('beginner');
  const [showVoice, setShowVoice] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatExport, setChatExport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef(false);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages, displayedText]);

  const stopTyping = useCallback(() => {
    abortRef.current = true;
    setTyping(false);
    setDisplayedText('');
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    typingTimerRef.current = null;
  }, []);

  const streamResponse = useCallback((text: string, sources: string[]) => {
    setTyping(true);
    setDisplayedText('');
    abortRef.current = false;
    let idx = 0;
    const speed = aiMode === 'expert' ? 12 : aiMode === 'beginner' ? 18 : 22;
    typingTimerRef.current = setInterval(() => {
      if (abortRef.current || idx >= text.length) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
        setTyping(false);
        if (!abortRef.current) {
          const assistantMessage: Message = { role: 'assistant', content: text, timestamp: new Date(), sources };
          setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
          setDisplayedText('');
        }
        return;
      }
      setDisplayedText(text.slice(0, idx + 1));
      idx += speed === 12 ? 2 : 1;
    }, 16);
  }, [aiMode]);

  const generateResponse = (userInput: string): { text: string; sources: string[] } => {
    const lower = userInput.toLowerCase();
    const mode = aiMode;
    const modes = {
      beginner: { depth: 'intro', tone: 'encouraging' },
      expert: { depth: 'technical', tone: 'precise' },
      friendly: { depth: 'mid', tone: 'warm' },
    };

    const introDepth = mode === 'expert' ? '. Full technical details and EPA compliance standards included.' : mode === 'friendly' ? '. Let me break this down for you!' : '';
    const introTone = mode === 'expert' ? 'Analyzing with OneAquaHealth framework:' : mode === 'friendly' ? 'Great question! Here\'s what I found:' : 'Here\'s what the data tells us:';

    if (lower.includes('stressed') || lower.includes('why is') || lower.includes('why are')) {
      return {
        text: `${introTone} Your stream may be experiencing ecological stress based on the OneAquaHealth Key Indicators Factsheets${introDepth}

Key indicators to check:
• Dissolved Oxygen: Below 5.0 mg/L = stress
• pH: Outside 6.5-8.5 range = stress
• Turbidity: Above 25 NTU = stress
• Temperature: Above 30°C = stress

The deterministic evidence engine evaluates confirmed observations against cited rules — no AI is making the final adjudication decision. Each rule is sourced from the OneAquaHealth factsheets (doi:10.5281/zenodo.20345207).`,
        sources: ['OneAquaHealth Factsheets', 'EPA STORET/WQX Standards', 'OGC SensorThings API']
      };
    }
    if (lower.includes('diverse_sensitive') || lower.includes('sensitive') || lower.includes('macroinvertebrate') || lower.includes('bug')) {
      return {
        text: `${introTone} "Diverse sensitive species present" is the highest quality indicator in the OneAquaHealth framework${introDepth}

Sensitive species (like EPT taxa: Ephemeroptera, Plecoptera, Trichoptera) cannot survive in polluted water. Finding many of them indicates:
• Excellent dissolved oxygen (>7.0 mg/L)
• Stable pH (6.5-8.5)
• Low turbidity (<10 NTU)
• Healthy riparian zones

Policy severity: 0 (No Priority Concern) → Assessment Tier: T1 — No Priority Concern
This is the ideal state for any stream assessment.${introDepth.includes('technical') ? '\n\nTechnical: The Shannon Diversity Index for macroinvertebrates uses H\' = -Σ(pi × ln(pi)) where pi is the proportion of each taxon.' : ''}`,
        sources: ['OneAquaHealth Key Indicators Factsheets', 'BMWP Scoring System', 'EPA Rapid Bioassessment Protocol']
      };
    }
    if (lower.includes('next') || lower.includes('should i') || lower.includes('recommend') || lower.includes('what to')) {
      return {
        text: `${introTone} Based on the assessment framework, here are the recommended actions${introDepth}

1. Monitor water quality parameters quarterly using OGC SensorThings API endpoints
2. Check for invasive species spread along riparian corridors (INV-11 indicator)
3. Test for fecal coliforms (FCL-06) if not already completed
4. If assessment tier is T3: contact your local environmental agency
5. Share findings through the Citizen Science Hub
6. Re-assess in 30 days for trend comparison

Remember: The assessment tier indicates the level of further assessment recommended — it is not a diagnosis. ${mode === 'expert' ? 'See EPA STORET/WQX submission guidelines for regulatory reporting requirements.' : mode === 'friendly' ? 'You\'ve got this! The data will guide you.' : ''}`,
        sources: ['OneAquaHealth Factsheets', 'EPA STORET/WQX Guidelines', 'FROST Server Documentation']
      };
    }
    if (lower.includes('rule') || lower.includes('how does') || lower.includes('what is')) {
      return {
        text: `${introTone} The StreamVitals assessment engine works deterministically — not probabilistically${introDepth}

Workflow:
1. You answer questions about 3-5 stream indicators
2. Each answer maps to a state: diverse_sensitive (severity 0), tolerant_only (severity 2), or absent_or_dead (severity 3)
3. The engine takes the highest policy_severity → determines the tier
4. T1 = No Priority Concern | T2 = Needs Attention | T3 = Further Assessment Recommended

Every rule is cited from the OneAquaHealth Key Indicators Factsheets (doi:10.5281/zenodo.20345207). The system is fully reproducible — same input always produces the same output. ${mode === 'expert' ? 'Technical: Uses ISO 19156 Observations and Measurements standard with WaterML 2.0 encoding.' : ''}`,
        sources: ['OneAquaHealth Key Indicators Factsheets', 'ISO 19156 O&M Standard', 'WaterML 2.0 Part 5']
      };
    }
    if (lower.includes('turbidity') || lower.includes('turbid')) {
      return {
        text: `${introTone} Turbidity measures how cloudy the water is — it affects light penetration for aquatic plants${introDepth}

Key thresholds:
• < 5 NTU: Crystal clear — excellent habitat
• 5-25 NTU: Moderate — acceptable for most species
• > 25 NTU: High — stress for sensitive species
• > 50 NTU: Critical — may indicate sediment runoff or algal bloom

Causes: Sediment, algae, organic matter, dissolved organic carbon
Impact: Reduces photosynthesis, clogs fish gills, smothers benthic habitat

The FCL-06 (Fecal Coliforms) indicator often correlates with elevated turbidity due to similar pollution sources.${mode === 'expert' ? '\n\nTechnical: Turbidity is measured in Formazin Nephelometric Units (FNU) per EPA Method 180.1.' : ''}`,
        sources: ['OneAquaHealth Key Indicators Factsheets', 'EPA Method 180.1', 'WaterML 2.0 Turbidity Encoding']
      };
    }
    if (lower.includes('dissolved oxygen') || lower.includes('do ') || lower.includes('oxygen')) {
      return {
        text: `${introTone} Dissolved Oxygen (DO) is the most critical water quality parameter${introDepth}

Key thresholds:
• > 7.0 mg/L: Excellent — supports all aquatic life
• 5.0-7.0 mg/L: Good — supports most species
• 3.0-5.0 mg/L: Poor — stress for sensitive species
• < 3.0 mg/L: Critical — fish kills likely

DO is affected by:
• Temperature (warmer = less oxygen)
• Turbidity (blocks photosynthesis)
• Organic matter decomposition (consumes oxygen)
• Riparian shading (cooler water holds more O2)

The BMI-01 indicator directly correlates with dissolved oxygen levels — diverse sensitive species are only found when DO > 6.5 mg/L.${mode === 'expert' ? '\n\nTechnical: DO is measured via membrane electrode (Clark cell) or optical sensor per EPA Method 4500-O.' : ''}`,
        sources: ['OneAquaHealth Key Indicators Factsheets', 'EPA Method 4500-O', 'OGC SensorThings DO Parameters']
      };
    }
    if (lower.includes('ph') || lower.includes('acidity') || lower.includes('alkalinity')) {
      return {
        text: `${introTone} pH measures how acidic or alkaline the water is${introDepth}

Key thresholds:
• 6.5-8.5: Ideal range for all aquatic life
• 5.5-6.5: Slightly acidic — stress for some species
• 8.5-9.0: Slightly alkaline — moderate concern
• < 5.5 or > 9.0: Critical — harmful to most organisms

pH affects:
• Metal solubility (more toxic at low pH)
• Nutrient availability
• Enzyme function in aquatic organisms
• Ammonia toxicity (more toxic at higher pH)

The INV-11 (Invasive Plants) indicator can be affected by pH — acid-loving invasive species may dominate at lower pH levels.${mode === 'expert' ? '\n\nTechnical: pH measured via glass electrode (EPA Method 150.1) or ISFET sensor. Temperature correction applied per EPA guidelines.' : ''}`,
        sources: ['OneAquaHealth Key Indicators Factsheets', 'EPA Method 150.1', 'OGC SensorThings pH Parameters']
      };
    }
    if (lower.includes('invasive') || lower.includes('plant') || lower.includes('inv-11')) {
      return {
        text: `${introTone} Invasive aquatic plants can dramatically alter stream ecosystems${introDepth}

Assessment states:
• diverse_sensitive: Native plants dominate → healthy ecosystem
• tolerant_only: Some invasive present → monitor closely
• absent_or_dead: Widespread invasive coverage → Further Assessment Recommended

Common invasive species:
• Eurasian watermilfoil (Myriophyllum spicatum)
• Hydrilla (Hydrilla verticillata)
• Curly-leaf pondweed (Potamogeton crispus)

Impacts:
• Reduces dissolved oxygen (decomposition)
• Blocks light penetration
• Alters sediment chemistry
• Crowds out native vegetation

Management: Mechanical removal, herbicide treatment, biological control (grass carp).${mode === 'expert' ? '\n\nTechnical: NDVI (Normalized Difference Vegetation Index) used via satellite/aerial remote sensing per OGC SensorThings spec.' : ''}`,
        sources: ['OneAquaHealth Key Indicators Factsheets', 'USGS Invasive Species Database', 'OGC SensorThings Vegetation Index']
      };
    }
    if (lower.includes('temperature') || lower.includes('warm') || lower.includes('cold')) {
      return {
        text: `${introTone} Water temperature is a critical indicator of stream health${introDepth}

Key thresholds:
• < 15°C: Cold-water habitat (trout, salmon)
• 15-22°C: Moderate — warm-water species
• 22-30°C: Stress zone for cold-water species
• > 30°C: Critical — oxygen depletion risk

Temperature affects:
• Dissolved oxygen capacity (inverse relationship)
• Metabolic rates of aquatic organisms
• Reproduction cycles
• Susceptibility to disease

Climate change impacts: Increasing baseline temperatures reduce cold-water habitat availability. Riparian shading is the most effective mitigation.`,
        sources: ['OneAquaHealth Key Indicators Factsheets', 'EPA Temperature Standards', 'Climate Change Assessment Reports']
      };
    }
    if (lower.includes('birds') || lower.includes('bird') || lower.includes('bir-04')) {
      return {
        text: `${introTone} Avian populations serve as important bioindicators of stream health${introDepth}

Assessment states:
• diverse_sensitive: Many species observed → healthy riparian habitat
• tolerant_only: Few species → moderate habitat degradation
• absent_or_dead: No species observed → significant habitat loss

Key bird indicators:
• Kingfishers: Clean, clear water
• Herons: Healthy fish populations
• Waterfowl: Wetland quality
• Swifts: Insect abundance

Bird populations decline when:
• Riparian zones are degraded
• Water quality deteriorates
• Invasive plants remove nesting habitat
• Food sources (aquatic insects) decline`,
        sources: ['OneAquaHealth Key Indicators Factsheets', 'Audubon Society River Bird Survey', 'EPA Riparian Habitat Guidelines']
      };
    }
    if (lower.includes('fecal') || lower.includes('coliform') || lower.includes('fcl') || lower.includes('bacteria')) {
      return {
        text: `${introTone} Fecal coliform bacteria indicate waterborne contamination${introDepth}

Key thresholds:
• < 200 CFU/100mL: Safe for recreation
• 200-1000 CFU/100mL: Elevated — caution advised
• > 1000 CFU/100mL: High — health risk
• > 2000 CFU/100mL: Critical — avoid contact

Sources: Agricultural runoff, sewage overflow, wildlife, pet waste
Health risks: Gastrointestinal illness, ear infections, skin rashes

The FCL-06 indicator often correlates with turbidity — both increase after rain events due to stormwater runoff.${mode === 'expert' ? '\n\nTechnical: Coliforms detected via membrane filtration (EPA Method 9222D) or enzyme substrate (IDEXX Colilert).' : ''}`,
        sources: ['OneAquaHealth Key Indicators Factsheets', 'EPA Method 9222D', 'EPA Recreation Water Quality Criteria']
      };
    }
    if (lower.includes('diatom') || lower.includes('dia') || lower.includes('algae')) {
      return {
        text: `${introTone} Diatoms (single-celled algae) are excellent water quality indicators${introDepth}

Key indicators:
• Chlorophyll-a: Measures algal biomass
• Diatom diversity: Reflects nutrient levels and pH
• Harmful algal blooms (HABs): Toxin-producing cyanobacteria

Assessment states:
• Diverse diatom community: Healthy ecosystem
• Dominant tolerant species: Nutrient enrichment
• Cyanobacteria bloom: Critical — potential toxins

Diatoms respond quickly to environmental changes, making them ideal early-warning indicators. They are sensitive to nitrogen, phosphorus, and pH changes.`,
        sources: ['OneAquaHealth Key Indicators Factsheets', 'EPA National Lakes Survey', 'OECD Cyanobacteria Monitoring Guidelines']
      };
    }
    return {
      text: `${introTone} That's an interesting question! Let me analyze this through the OneAquaHealth framework${introDepth}

The StreamVitals engine evaluates your observations against real, cited rules from the OneAquaHealth Key Indicators Factsheets. Every answer is grounded in established ecological science — not speculative AI generation.

Key factsheets available:
• BMI-01: Benthic Macroinvertebrates
• BIR-04: Birds
• INV-11: Invasive Plants
• FCL-06: Fecal Coliforms
• DIA-10: Diatoms
• pH Scale & Water Health
• Dissolved Oxygen Standards
• Turbidity & Light Penetration

Try asking: "Why is my stream stressed?", "Explain pH", "What should I do next?", or "What does diverse_sensitive mean?"`,
      sources: ['OneAquaHealth Key Indicators Factsheets', 'doi:10.5281/zenodo.20345207']
    };
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    stopTyping();
    const userMessage: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const { text, sources } = generateResponse(input);
    // Remove the last assistant message if it's the placeholder, add user first
    const placeholderIndex = messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].content === '' ? messages.length - 1 : -1;
    
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', content: '', timestamp: new Date(), sources }]);
      streamResponse(text, sources);
      setLoading(false);
    }, 300);
  };

  const handleQuickQuestion = (question: string) => {
    stopTyping();
    setInput(question);
    handleSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const exportChat = () => {
    const content = messages.map((m) => `${m.role === 'user' ? 'USER' : 'AI'}: ${m.content}${m.sources?.length ? ` [Sources: ${m.sources.join(', ')}]` : ''}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'streamvitals-copilot-chat.txt'; a.click();
    URL.revokeObjectURL(url);
    setChatExport(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(messages.map((m) => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`).join('\n\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recentContext = messages.filter((m) => m.role === 'assistant').slice(-2);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-teal-400" />
          <h1 className="text-2xl font-bold">AI Copilot</h1>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI-Powered
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            {(['beginner', 'friendly', 'expert'] as AIMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setAIMode(m)}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${aiMode === m ? 'bg-teal-500 text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                {modeConfig[m].icon} {modeConfig[m].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/30">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-xl rounded-2xl p-4 ${msg.role === 'user' ? 'bg-gradient-to-r from-teal-500 to-emerald-600 border border-teal-400/30' : 'bg-white/5 border border-white/10'}`}>
                  {msg.role === 'assistant' ? (
                    <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                      {typing && i === messages.length - 1 ? displayedText : msg.content}
                      {typing && i === messages.length - 1 && (
                        <span className="inline-block w-1.5 h-4 bg-teal-300 ml-0.5 animate-pulse" style={{ animationDelay: `${Math.random() * 1000}ms` }} />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-white/90 whitespace-pre-wrap">{msg.content}</p>
                  )}
                  {msg.sources && msg.sources.length > 0 && !typing && (
                    <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-1">
                      {msg.sources.map((s, si) => (
                        <span key={si} className="text-[10px] bg-white/10 text-teal-300 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Globe className="w-2 h-2" /> {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-white/10 p-4 bg-black/20 backdrop-blur-xl">
            <div className="flex gap-2 mb-3 flex-wrap">
              {[
                'Why is my stream stressed?',
                'Explain pH levels',
                'What should I do next?',
                'What does diverse_sensitive mean?',
                'How does turbidity affect health?',
                'Explain dissolved oxygen',
                'What are invasive plants?',
                'Tell me about birds as indicators',
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickQuestion(q)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white/60 hover:bg-teal-500/20 hover:border-teal-400/30 hover:text-white transition-all disabled:opacity-40"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowVoice(!showVoice); if (showVoice) setVoiceActive(false); }}
                className={`p-3 rounded-xl transition-all ${showVoice && voiceActive ? 'bg-red-500/30 text-red-300' : 'bg-white/5 text-white/40 hover:text-white/70'}`}
                title="Voice input"
              >
                {showVoice && voiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your stream health..."
                disabled={loading}
                className="flex-1 p-3 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-white/30 focus:ring-2 focus:ring-teal-400 focus:outline-none disabled:opacity-40"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-teal-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setChatExport(true)}
                  disabled={messages.length <= 1}
                  className="p-3 bg-white/5 text-white/40 hover:text-white/70 rounded-xl disabled:opacity-40 transition-all"
                  title="Export chat"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={copyToClipboard}
                className="p-3 bg-white/5 text-white/40 hover:text-white/70 rounded-xl transition-all"
                title="Copy chat"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="w-72 bg-slate-900/50 border-l border-white/10 p-4 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" /> Knowledge Base
            </h3>
            <div className="space-y-2">
              {[
                { title: 'Benthic Macroinvertebrates', topic: 'BMI-01', icon: '🐛' },
                { title: 'Birds as Indicators', topic: 'BIR-04', icon: '🐦' },
                { title: 'Invasive Plants', topic: 'INV-11', icon: '🌿' },
                { title: 'Fecal Coliforms', topic: 'FCL-06', icon: '🦠' },
                { title: 'Diatoms', topic: 'DIA-10', icon: '🔬' },
                { title: 'Dissolved Oxygen', topic: 'General', icon: '💧' },
                { title: 'pH Scale & Water Health', topic: 'General', icon: '🧪' },
                { title: 'Turbidity & Light', topic: 'General', icon: '🌊' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickQuestion(`Explain ${item.title}`)}
                  className="w-full text-left bg-white/5 rounded-lg p-3 border border-white/10 hover:border-teal-400/30 hover:bg-teal-500/5 transition-all group"
                >
                  <p className="text-sm text-white/70 font-medium group-hover:text-white transition-colors">{item.icon} {item.title}</p>
                  <p className="text-xs text-white/30 mt-0.5">{item.topic}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-teal-400" /> Assessment Context
            </h3>
            <div className="space-y-2">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-teal-300 font-semibold mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Assessment Tier
                </p>
                <p className="text-sm text-white/60">T2 — Needs Attention</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-amber-300 font-semibold mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Key Driver
                </p>
                <p className="text-sm text-white/60">INV-11: Widespread invasive coverage</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-emerald-300 font-semibold mb-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Recommendation
                </p>
                <p className="text-sm text-white/60">Monitor invasive species spread quarterly</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Bot className="w-4 h-4 text-teal-400" /> Mode Info
            </h3>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xs text-white/40 mb-2">Current mode: <span className={modeConfig[aiMode].color}>{modeConfig[aiMode].icon} {modeConfig[aiMode].label}</span></p>
              <p className="text-xs text-white/30 leading-relaxed">
                {aiMode === 'beginner' && 'Simplified explanations with encouraging tone. Perfect for newcomers to water quality assessment.'}
                {aiMode === 'friendly' && 'Balanced explanations with practical advice. Great for community scientists.'}
                {aiMode === 'expert' && 'Full technical depth with EPA standards, formulas, and compliance details.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {chatExport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl border border-white/15 p-6 max-w-md w-full mx-4 animate-scaleIn">
            <h3 className="text-lg font-bold mb-4">Export Chat</h3>
            <p className="text-sm text-white/60 mb-4">Download your conversation as a text file for your assessment report.</p>
            <div className="flex gap-3">
              <button onClick={exportChat} className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all">Download</button>
              <button onClick={() => setChatExport(false)} className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}