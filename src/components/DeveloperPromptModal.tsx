import React, { useState } from 'react';
import { THREEJS_DEVELOPER_PROMPT } from '../data/jaldrishtiData';
import { Code2, Copy, Check, X, Terminal } from 'lucide-react';

interface DeveloperPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperPromptModal: React.FC<DeveloperPromptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(THREEJS_DEVELOPER_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 text-slate-200 animate-fade-in max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Code2 className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">3D NASA Earth Three.js Developer Specification Prompt</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Use this engineering prompt to integrate or replicate the exact WebGL 3D rotating NASA Earth model scene with atmospheric Rayleigh bloom and night city lights in any WebGL/Three.js project.
        </p>

        {/* Copy Button & Code Box */}
        <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Developer Prompt'}
          </button>

          <pre className="h-full overflow-y-auto pr-16 whitespace-pre-wrap text-[11px] leading-relaxed text-slate-300">
            {THREEJS_DEVELOPER_PROMPT}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Standard Three.js + GLSL Shader Material
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
