import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useVisualizerStore } from '../../store/useVisualizerStore';

export interface CodePanelProps {
  algorithmId: string | null;
  progLanguage: string;
}

export const CodePanel: React.FC<CodePanelProps> = ({ algorithmId, progLanguage }) => {
  const activeLine = useVisualizerStore((s) => s.activeLine);
  const [codeData, setCodeData] = useState<any>(null);

  useEffect(() => {
    if (algorithmId) {
      const lang = progLanguage === 'javascript' ? 'js' : progLanguage;
      import(`../../engine/code_templates/${algorithmId}/${lang}.json`)
        .then(mod => setCodeData(mod.default))
        .catch(() => setCodeData(null));
    } else {
      setCodeData(null);
    }
  }, [algorithmId, progLanguage]);

  if (!codeData) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-slate-500 font-mono text-sm">
        <div className="text-center">
          <p className="text-2xl mb-2">📄</p>
          <p>Select an algorithm to view code</p>
        </div>
      </div>
    );
  }

  const lines = codeData.code.split('\n');

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header badge */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 shrink-0">
        <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-600/20 text-primary-400 rounded">
          {codeData.language.toUpperCase()}
        </span>
        <div className="flex gap-2 text-[10px] text-slate-400">
          <span>Time: <strong className="text-accent-400">{codeData.time_complexity}</strong></span>
          <span>Space: <strong className="text-accent-400">{codeData.space_complexity}</strong></span>
        </div>
      </div>

      {/* Code lines */}
      <div className="flex-1 overflow-y-auto overflow-x-auto p-1.5">
        {lines.map((line: string, idx: number) => {
          const isActive = activeLine === idx;
          const isExecuted = activeLine > idx;
          return (
            <div 
              key={idx} 
              className={`code-line flex items-start gap-0 rounded-sm transition-all duration-300 ${
                isActive ? 'active' : isExecuted ? 'executed' : ''
              }`}
            >
              <span className="w-7 min-w-[1.75rem] text-right pr-2 text-slate-600 select-none text-[10px] leading-5">
                {idx + 1}
              </span>
              <pre className={`flex-1 text-xs leading-5 whitespace-pre ${
                isActive ? 'text-white font-medium' : 'text-slate-300'
              }`}>
                {line || ' '}
              </pre>
            </div>
          );
        })}
      </div>

      {/* Steps logic */}
      <div className="border-t border-white/5 px-3 py-2 shrink-0 max-h-[30%] overflow-y-auto">
        <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Algorithm Steps</h4>
        <ol className="list-decimal list-inside text-[11px] text-slate-400 space-y-0.5 leading-relaxed">
          {codeData.steps_logic.map((step: string, idx: number) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};
