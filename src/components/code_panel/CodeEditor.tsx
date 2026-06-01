import React, { useState } from 'react';
import { SandboxEngine } from '../../engine/sandboxEngine';
import { ImprovementEngine } from '../../engine/improvementEngine';
import { useVisualizerStore } from '../../store/useVisualizerStore';
import { Play, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

const EXAMPLE_CODE = `// Welcome to the Free Sandbox!
// Available variables: 
// - arr: The visualizer data array (e.g., [50, 20, 80])
// - n: Length of the array
//
// Available helpers:
// - compare(i, j): Returns arr[i] - arr[j] and visualizes comparison
// - swap(i, j): Swaps elements and visualizes it
// - highlight(index, message): Highlights an element
// - visit(index, message): Marks an element as visited
// - markSorted(index, message): Marks an element as complete

// Try a basic operation:
for (let i = 0; i < n; i++) {
    highlight(i, \`Checking element at \${i}\`);
    if (arr[i] > 50) {
        visit(i, \`\${arr[i]} is greater than 50!\`);
    } else {
        markSorted(i, \`\${arr[i]} is small.\`);
    }
}`;

export const CodeEditor: React.FC = () => {
  const [code, setCode] = useState(EXAMPLE_CODE);
  const [feedback, setFeedback] = useState<{issues: string[]; suggestions: string[]} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executed, setExecuted] = useState(false);
  const [language, setLanguage] = useState('js');

  const { data, initializeData } = useVisualizerStore();

  const handleRun = () => {
    setFeedback(null);
    setError(null);
    setExecuted(false);

    // Ensure we have data
    let currentData = data;
    if (!currentData.length) {
      initializeData(8);
      currentData = useVisualizerStore.getState().data;
    }

    if (language !== 'js') {
      setError('Offline Execution is currently only supported for JavaScript. Other languages operate as syntax scratchpads.');
      return;
    }

    // 1. Run improvement engine (rule-based analysis)
    const analysis = ImprovementEngine.analyzeCode(code, 'js');
    setFeedback(analysis);

    // 2. Run sandbox engine (execute the code)
    const result = SandboxEngine.executeUserCode(code, currentData);
    
    if (result.error) {
      setError(result.error);
      return;
    }

    // 3. Load steps into visualizer store
    useVisualizerStore.setState({
      steps: result.steps,
      currentStepIndex: -1,
      isPlaying: false,
      activeIndices: [],
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: [],
      foundIndex: -1,
      structureData: [],
      activeLine: -1,
      currentMessage: 'Custom code loaded. Press Play to begin.'
    });

    setExecuted(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-accent-400 uppercase tracking-wider">✏️ Raw Sandbox</span>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-dark-800 text-xs text-white rounded outline-none border border-white/10 px-1 py-0.5"
          >
            <option value="js">JavaScript (Executable)</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
          </select>
        </div>
        <button
          onClick={handleRun}
          className="flex items-center gap-2 px-4 py-1.5 bg-success-500/20 text-success-400 text-xs font-bold rounded-lg hover:bg-success-500/30 transition-colors"
        >
          <Play size={14} />
          {language === 'js' ? 'Analyze & Run' : 'Check Syntax'}
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        className="flex-1 bg-dark-950 text-slate-200 font-mono text-sm p-4 resize-none focus:outline-none border-none leading-6"
        placeholder="Write your sorting algorithm here..."
      />

      {/* Feedback panel */}
      {(feedback || error) && (
        <div className="border-t border-white/5 p-3 max-h-48 overflow-y-auto space-y-2">
          {error && (
            <div className="flex items-start gap-2 text-danger-400 text-xs">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span><strong>Error:</strong> {error}</span>
            </div>
          )}
          {executed && !error && (
            <div className="flex items-start gap-2 text-success-400 text-xs">
              <CheckCircle size={14} className="mt-0.5 shrink-0" />
              <span>Code executed successfully! Press Play to visualize.</span>
            </div>
          )}
          {feedback && (
            <>
              {feedback.issues.map((issue, i) => (
                <div key={`i-${i}`} className="flex items-start gap-2 text-warning-400 text-xs">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>{issue}</span>
                </div>
              ))}
              {feedback.suggestions.map((s, i) => (
                <div key={`s-${i}`} className="flex items-start gap-2 text-accent-300 text-xs">
                  <Lightbulb size={14} className="mt-0.5 shrink-0" />
                  <span>{s}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};
