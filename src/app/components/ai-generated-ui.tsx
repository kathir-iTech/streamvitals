'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Wand2, Code } from 'lucide-react';

export default function AIGeneratedUI() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<string[]>([]);

  const generateUI = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    // Simulated AI component generation
    const patterns = [
      'Card component with glassmorphism and hover effects',
      'Dashboard grid with KPI tiles and sparkline charts',
      'Navigation bar with responsive hamburger menu',
      'Form with validation states and loading indicators',
      'Modal with focus trap and keyboard navigation',
      'Data table with sorting and pagination',
    ];

    const result = patterns.filter((p) => prompt.toLowerCase().includes(p.split(' ')[0].toLowerCase()) || Math.random() > 0.5);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setGenerated(result.length > 0 ? result : ['Generated component matching your description']);
    setIsGenerating(false);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-teal-400" />
        <h2 className="text-lg font-bold">AI-Generated Components</h2>
      </div>
      <p className="text-white/50 text-sm mb-4">Describe the component you need. The system generates React components from natural language.</p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., 'I need a card with glassmorphism and hover effects'"
        className="w-full h-24 p-4 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none resize-none"
      />
      <button
        onClick={generateUI}
        disabled={!prompt.trim() || isGenerating}
        className="mt-3 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-40 flex items-center gap-2"
      >
        {isGenerating ? 'Generating...' : <><Wand2 className="w-4 h-4" /> Generate Component</>}
      </button>
      {generated.length > 0 && (
        <div className="mt-4 space-y-2">
          {generated.map((g, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10 font-mono text-sm text-teal-300">
              {g}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}