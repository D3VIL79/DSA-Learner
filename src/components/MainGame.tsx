import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useVisualizerStore } from '../store/useVisualizerStore';
import { useProgressStore } from '../store/useProgressStore';
import { useTranslation } from '../utils/useTranslation';
import { parseCommand, ALGORITHM_MAP } from '../engine/commandParser';
import {
  Play, Square, FastForward, Rewind, RotateCcw, Code, BookOpen, Terminal,
  Trophy, Zap, Shuffle, ArrowRight, BarChart3, FileCode, Lightbulb, PanelRightOpen, X
} from 'lucide-react';
import { CodePanel } from './code_panel/CodePanel';
import { CodeEditor } from './code_panel/CodeEditor';
import { ArrayVisualizer } from './visualizer/ArrayVisualizer';
import { StackQueueVisualizer } from './visualizer/StackQueueVisualizer';
import { GraphVisualizer } from './visualizer/GraphVisualizer';
import { TreeVisualizer } from './visualizer/TreeVisualizer';
import { GridVisualizer } from './visualizer/GridVisualizer';
import { ExplanationPanel } from './ui/ExplanationPanel';

const PROG_LANGUAGES = [
  { id: 'python', label: 'PY', color: '#3776AB' },
  { id: 'cpp', label: 'C++', color: '#00599C' },
  { id: 'java', label: 'Java', color: '#ED8B00' },
  { id: 'c', label: 'C', color: '#A8B9CC' },
  { id: 'js', label: 'JS', color: '#F7DF1E' },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(max-width: 1024px)').matches);
    check();
    const mql = window.matchMedia('(max-width: 1024px)');
    mql.addEventListener('change', check);
    return () => mql.removeEventListener('change', check);
  }, []);
  return isMobile;
}

export const MainGame: React.FC = () => {
  const { language, activeAlgorithm, mode, setLanguage, setActiveAlgorithm, setMode } = useAppStore();
  const viz = useVisualizerStore();
  const progress = useProgressStore();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const isEditorOpen = mode === 'game';
  const isExplainOpen = mode === 'explain';

  const [cmd, setCmd] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [progLang, setProgLang] = useState('js');
  const [rightPanel, setRightPanel] = useState<'code' | 'editor' | 'explain'>('code');
  const [customInput, setCustomInput] = useState('');
  const [arraySize, setArraySize] = useState(10);
  const [treeK, setTreeK] = useState(2);
  const [demoStarted, setDemoStarted] = useState(false);

  // Mobile: which full-screen view is active
  const [mobileView, setMobileView] = useState<'visualizer' | 'code' | 'explain'>('visualizer');
  // Mobile: show the right-side panel as a drawer overlay
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // ===== AUTO DEMO on first load =====
  useEffect(() => {
    if (!demoStarted) {
      setDemoStarted(true);
      setActiveAlgorithm('bubble_sort');
      setMode('visualize');
      viz.initializeData(0, [5, 3, 8, 1, 4, 7, 2, 6]);
      setTimeout(() => {
        viz.runAlgorithm('bubble_sort');
        setTimeout(() => viz.play(), 500);
      }, 100);
    }
  }, []);

  // Auto-play loop
  useEffect(() => {
    let interval: number;
    if (viz.isPlaying) {
      interval = window.setInterval(() => {
        viz.stepForward();
        progress.incrementSteps();
      }, viz.speed);
    }
    return () => clearInterval(interval);
  }, [viz.isPlaying, viz.speed]);

  // Load algorithm when selected
  useEffect(() => {
    if (activeAlgorithm && demoStarted) {
      viz.initializeData(arraySize, undefined, undefined, treeK);
      setTimeout(() => viz.runAlgorithm(activeAlgorithm), 50);
    }
  }, [arraySize, treeK, activeAlgorithm, demoStarted]);

  // Mark complete when visualization ends
  useEffect(() => {
    if (viz.currentStepIndex >= viz.steps.length - 1 && viz.steps.length > 0 && activeAlgorithm) {
      progress.completeAlgorithm(activeAlgorithm);
    }
  }, [viz.currentStepIndex, viz.steps.length]);

  // Search filter
  const filteredAlgorithms = useMemo(() => {
    if (!cmd.trim()) return ALGORITHM_MAP;
    const q = cmd.toLowerCase();
    return ALGORITHM_MAP.filter(a =>
      a.id.replace(/_/g, ' ').includes(q) || a.keywords.some(k => k.includes(q))
    );
  }, [cmd]);

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (parseCommand(cmd)) { setCmd(''); setShowDropdown(false); }
    }
  };

  const handleSelectAlgorithm = (id: string) => {
    setActiveAlgorithm(id);
    setMode('visualize');
    setCmd('');
    setShowDropdown(false);
    if (isMobile) setMobileView('visualizer');
  };

  const handleCustomInput = () => {
    if (!activeAlgorithm || !customInput) return;
    
    // Check if it's a graph edge list format (e.g., "0-1, 1-2, 2-0")
    if (customInput.includes('-') && (isGraph)) {
      try {
        const parts = customInput.split(',').map(s => s.trim());
        const edges = parts.map(p => {
          const [u, v, w] = p.split('-').map(Number);
          return { source: u, target: v, weight: w || Math.floor(Math.random() * 9) + 1 };
        });
        
        let maxNode = 0;
        edges.forEach(e => {
          maxNode = Math.max(maxNode, e.source, e.target);
        });
        
        const graphData = { nodes: maxNode + 1, edges };
        viz.initializeData(maxNode + 1, undefined, graphData, treeK);
        setTimeout(() => viz.runAlgorithm(activeAlgorithm), 50);
        return;
      } catch (e) {
        console.error("Invalid graph format");
      }
    }

    const parts = customInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (parts.length > 0) {
      viz.initializeData(parts.length, parts, undefined, treeK);
      setTimeout(() => viz.runAlgorithm(activeAlgorithm), 50);
    }
  };

  const handleRandomize = () => {
    viz.initializeData(arraySize, undefined, undefined, treeK);
    if (activeAlgorithm) setTimeout(() => viz.runAlgorithm(activeAlgorithm), 50);
  };

  const handleReset = () => {
    viz.reset();
    handleRandomize();
  };

  const isStackQueue = activeAlgorithm === 'stack_ops' || activeAlgorithm === 'queue_ops';
  const isGraph = activeAlgorithm === 'bfs_graph' || activeAlgorithm === 'dfs_graph' || activeAlgorithm === 'dijkstra';
  const isTree = activeAlgorithm === 'inorder' || activeAlgorithm === 'preorder' || activeAlgorithm === 'postorder' || activeAlgorithm === 'levelorder';
  const isGrid = ['knapsack_0_1', 'longest_common_subsequence', 'edit_distance', 'n_queens', 'sudoku_solver'].includes(activeAlgorithm || '');
  
  const xpPercent = ((progress.xp % 100) / 100) * 100;

  // =============================================
  // Shared sub-components
  // =============================================

  const renderVisualization = () => (
    <>
      {activeAlgorithm ? (
        <div className="w-full flex flex-col items-center gap-3 lg:gap-3">
          <h3 className="text-xl lg:text-xl text-sm font-bold text-white">{t(`algorithms.${activeAlgorithm}`)}</h3>
          
          {mode === 'visualize' && !isGraph && !isTree && !isStackQueue && !isGrid && (
            <ArrayVisualizer
              data={viz.data}
              activeIndices={viz.activeIndices}
              comparingIndices={viz.comparingIndices}
              swappingIndices={viz.swappingIndices}
              sortedIndices={viz.sortedIndices}
              foundIndex={viz.foundIndex}
            />
          )}
          
          {mode === 'visualize' && isStackQueue && (
            <StackQueueVisualizer
              data={viz.structureData}
              type={activeAlgorithm === 'stack_ops' ? 'stack' : 'queue'}
              highlightIndex={viz.activeIndices[0]}
              message={viz.currentMessage}
            />
          )}

          {mode === 'visualize' && isGraph && viz.graphData && (
            <GraphVisualizer
              numNodes={viz.graphData.nodes}
              edges={viz.graphData.edges}
              activeNode={viz.activeIndices[0]}
              visitedNodes={viz.sortedIndices}
            />
          )}

          {mode === 'visualize' && isTree && (
            <TreeVisualizer
              data={viz.data}
              activeIndices={viz.activeIndices}
              visitedNodes={viz.sortedIndices}
            />
          )}

          {mode === 'visualize' && isGrid && viz.gridData && (
            <GridVisualizer
              gridData={viz.gridData}
              activeRow={viz.activeIndices[0]}
              activeCol={viz.activeIndices[1]}
              comparingRow={viz.comparingIndices[0]}
              comparingCol={viz.comparingIndices[1]}
            />
          )}
        </div>
      ) : (
        <div className="text-center text-slate-500 space-y-2">
          <div className="text-4xl">🎮</div>
          <p className="text-sm font-medium">Select an algorithm to begin</p>
        </div>
      )}
    </>
  );

  const renderControls = () => (
    <div className={`border-b border-white/5 flex items-center justify-between px-3 shrink-0 ${isMobile ? 'h-9 px-2' : 'h-10'}`}>
      <div className={`flex items-center ${isMobile ? 'gap-0.5' : 'gap-1'}`}>
        <button onClick={viz.play} className={`${isMobile ? 'p-1' : 'p-1.5'} hover:bg-white/10 rounded transition`} title="Play"><Play size={isMobile ? 13 : 14} className="text-success-400" /></button>
        <button onClick={viz.pause} className={`${isMobile ? 'p-1' : 'p-1.5'} hover:bg-white/10 rounded transition`} title="Pause"><Square size={isMobile ? 13 : 14} className="text-warning-400" /></button>
        <button onClick={viz.stepBackward} className={`${isMobile ? 'p-1' : 'p-1.5'} hover:bg-white/10 rounded transition`} title="Step Back"><Rewind size={isMobile ? 13 : 14} className="text-accent-400" /></button>
        <button onClick={viz.stepForward} className={`${isMobile ? 'p-1' : 'p-1.5'} hover:bg-white/10 rounded transition`} title="Step Forward"><FastForward size={isMobile ? 13 : 14} className="text-accent-400" /></button>
        <button onClick={handleReset} className={`${isMobile ? 'p-1' : 'p-1.5'} hover:bg-white/10 rounded transition`} title="Reset"><RotateCcw size={isMobile ? 13 : 14} className="text-danger-400" /></button>
        
        {!isMobile && <div className="w-px h-4 bg-white/10 mx-1" />}
        {!isMobile && <span className="text-[10px] text-slate-600 mr-1">Timeline</span>}
        <input type="range" min={0} max={viz.history.length > 0 ? viz.history.length - 1 : 0} value={Math.max(0, viz.currentStepIndex)}
          onChange={(e) => viz.goToStep(Number(e.target.value))} className={`${isMobile ? 'w-16' : 'w-24'} h-1 accent-primary-500 ml-1`} />
        <span className="text-[10px] text-slate-600 ml-1 font-mono">{viz.currentStepIndex + 1}/{viz.steps.length}</span>
      </div>

      {/* Input controls */}
      <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-1.5'}`}>
        {!isMobile && <label className="text-[10px] text-slate-600">Size:</label>}
        <input type="number" min={2} max={30} value={arraySize} onChange={(e) => setArraySize(Number(e.target.value))}
          className={`${isMobile ? 'w-8' : 'w-10'} px-1 py-0.5 bg-dark-800 border border-white/10 rounded text-[10px] text-slate-300 text-center focus:outline-none focus:border-primary-500`} />
        <button onClick={handleRandomize} className="p-1 hover:bg-white/10 rounded transition" title="Randomize"><Shuffle size={13} className="text-accent-400" /></button>
        
        {isTree && !isMobile && (
          <>
            <div className="w-px h-4 bg-white/10" />
            <label className="text-[10px] text-slate-600">K:</label>
            <input type="number" min={2} max={4} value={treeK} onChange={(e) => setTreeK(Number(e.target.value))}
              className="w-8 px-1 py-0.5 bg-dark-800 border border-white/10 rounded text-[10px] text-slate-300 text-center focus:outline-none focus:border-primary-500" />
          </>
        )}

        {!isMobile && (
          <>
            <div className="w-px h-4 bg-white/10" />
            <input 
              type="text" 
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={isGraph ? "Edges: 0-1, 1-2" : "e.g. 5,3,8,1"}
              className="w-24 px-2 py-0.5 bg-dark-800 border border-white/10 rounded text-[10px] text-slate-300 focus:outline-none focus:border-primary-500" />
            <button onClick={handleCustomInput} className="px-2 py-0.5 bg-primary-600/20 text-primary-400 text-[10px] font-bold rounded hover:bg-primary-600/30 transition flex items-center gap-0.5">
              <ArrowRight size={10} /> Go
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderExplanationBar = () => (
    viz.currentMessage ? (
      <div className={`border-t border-white/5 flex items-center glass-strong shrink-0 ${isMobile ? 'h-9 px-2' : 'h-14 px-4'}`}>
        <BookOpen size={isMobile ? 12 : 15} className="text-accent-400 shrink-0 mr-2" />
        <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-slate-200 font-medium flex-1 truncate`}>{viz.currentMessage}</p>
        {!isMobile && viz.activeLine >= 0 && <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">Line {viz.activeLine + 1}</span>}
      </div>
    ) : null
  );

  const renderRightPanelContent = () => (
    <>
      {/* Panel tab buttons */}
      <div className={`border-b border-white/5 flex items-center px-1 shrink-0 ${isMobile ? 'h-10' : 'h-9'}`}>
        <button onClick={() => { setRightPanel('code'); if (isMobile) setMobileView('code'); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 ${isMobile ? 'text-xs' : 'text-[10px]'} font-bold rounded transition ${rightPanel === 'code' ? 'bg-primary-600/20 text-primary-400' : 'text-slate-500 hover:text-white'}`}>
          <BookOpen size={isMobile ? 14 : 11} /> Code
        </button>
        <button onClick={() => { setRightPanel('editor'); if (isMobile) setMobileView('code'); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 ${isMobile ? 'text-xs' : 'text-[10px]'} font-bold rounded transition ${rightPanel === 'editor' ? 'bg-accent-400/20 text-accent-400' : 'text-slate-500 hover:text-white'}`}>
          <Code size={isMobile ? 14 : 11} /> Editor
        </button>
        <button onClick={() => { setRightPanel('explain'); if (isMobile) setMobileView('code'); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 ${isMobile ? 'text-xs' : 'text-[10px]'} font-bold rounded transition ${rightPanel === 'explain' ? 'bg-yellow-500/20 text-yellow-500' : 'text-slate-500 hover:text-white'}`}>
          <Lightbulb size={isMobile ? 14 : 11} /> Explain
        </button>
      </div>
      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        {rightPanel === 'code' ? <CodePanel algorithmId={activeAlgorithm} progLanguage={progLang} /> : 
         rightPanel === 'editor' ? <CodeEditor /> :
         <ExplanationPanel algorithmId={activeAlgorithm || 'bubble_sort'} />}
      </div>
    </>
  );

  // =============================================
  // MOBILE LAYOUT
  // =============================================
  if (isMobile) {
    return (
      <div className="w-screen h-screen flex flex-col bg-dark-950 overflow-hidden">
        {/* ===== PORTRAIT ROTATE OVERLAY ===== */}
        <div className="rotate-overlay fixed inset-0 z-[9999] bg-dark-950 flex-col items-center justify-center gap-6 text-center p-8" style={{ display: 'none' }}>
          <div className="text-6xl animate-bounce-slow">📱↻</div>
          <h2 className="text-2xl font-bold text-gradient">Rotate Your Device</h2>
          <p className="text-slate-400 text-sm max-w-xs">DSA Quest is best experienced in landscape mode. Please rotate your device for the full experience.</p>
          <div className="w-16 h-24 border-2 border-primary-500 rounded-xl animate-pulse-glow relative">
            <div className="absolute inset-2 border border-primary-400/30 rounded-lg" />
          </div>
        </div>

        {/* ===== MOBILE TOP BAR ===== */}
        <header className="h-9 border-b border-white/5 flex items-center justify-between px-2 glass-strong z-30 shrink-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-black text-gradient tracking-tight">{t('hero.title')}</h2>
            <div className="flex items-center gap-1 ml-1">
              <Trophy size={11} className="text-warning-400" />
              <div className="w-10 h-1 bg-dark-700 rounded-full overflow-hidden">
                <div className="xp-bar h-full" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-[200px] mx-2">
            <input type="text" value={cmd}
              onChange={(e) => { setCmd(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              onKeyDown={handleCommand}
              placeholder="Search algorithms..."
              className="w-full command-input px-2 py-1 rounded-md text-[10px] text-slate-200 pl-6" />
            <Terminal size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
            {showDropdown && filteredAlgorithms.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 glass-strong rounded-lg border border-white/10 shadow-2xl overflow-hidden z-50 max-h-48 overflow-y-auto">
                {filteredAlgorithms.map(algo => (
                  <button key={algo.id} onMouseDown={() => handleSelectAlgorithm(algo.id)}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-primary-600/20 hover:text-white transition-colors flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      {progress.completedAlgorithms.includes(algo.id) && <Zap size={10} className="text-success-400" />}
                      {t(`algorithms.${algo.id}`)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Prog lang compact */}
          <div className="flex items-center gap-0.5">
            {PROG_LANGUAGES.slice(0, 3).map(pl => (
              <button key={pl.id} onClick={() => setProgLang(pl.id)}
                className={`px-1 py-0.5 rounded text-[8px] font-bold transition-all ${progLang === pl.id ? 'text-white' : 'text-slate-600 bg-dark-800'}`}
                style={progLang === pl.id ? { background: pl.color + '33', color: pl.color } : {}}>
                {pl.label}
              </button>
            ))}
          </div>
        </header>

        {/* ===== MOBILE MAIN CONTENT ===== */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Show visualizer view */}
          {mobileView === 'visualizer' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {renderControls()}
              <div className="flex-1 flex flex-col items-center justify-center p-2 overflow-hidden">
                {renderVisualization()}
              </div>
              {renderExplanationBar()}
            </div>
          )}

          {/* Show code/editor/explain view — full width */}
          {mobileView === 'code' && (
            <div className="flex-1 flex flex-col bg-dark-900 overflow-hidden">
              {renderRightPanelContent()}
            </div>
          )}
        </main>

        {/* ===== MOBILE BOTTOM TAB BAR ===== */}
        <nav className="h-11 border-t border-white/10 glass-strong flex items-center justify-around shrink-0 z-40">
          <button onClick={() => setMobileView('visualizer')}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-all ${mobileView === 'visualizer' ? 'text-primary-400 bg-primary-500/10' : 'text-slate-500'}`}>
            <BarChart3 size={16} />
            <span className="text-[9px] font-bold">Visualizer</span>
          </button>
          <button onClick={() => { setMobileView('code'); setRightPanel('code'); }}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-all ${mobileView === 'code' && rightPanel === 'code' ? 'text-accent-400 bg-accent-500/10' : 'text-slate-500'}`}>
            <FileCode size={16} />
            <span className="text-[9px] font-bold">Code</span>
          </button>
          <button onClick={() => { setMobileView('code'); setRightPanel('explain'); }}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-all ${mobileView === 'code' && rightPanel === 'explain' ? 'text-yellow-400 bg-yellow-500/10' : 'text-slate-500'}`}>
            <Lightbulb size={16} />
            <span className="text-[9px] font-bold">Explain</span>
          </button>
          <button onClick={() => { setMobileView('code'); setRightPanel('editor'); }}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-all ${mobileView === 'code' && rightPanel === 'editor' ? 'text-success-400 bg-success-500/10' : 'text-slate-500'}`}>
            <Code size={16} />
            <span className="text-[9px] font-bold">Editor</span>
          </button>
        </nav>
      </div>
    );
  }

  // =============================================
  // DESKTOP LAYOUT (unchanged)
  // =============================================
  return (
    <div className="w-screen h-screen flex flex-col bg-dark-950 overflow-hidden">
      {/* ===== TOP NAVBAR ===== */}
      <header className="h-12 border-b border-white/5 flex items-center justify-between px-3 glass-strong z-30 shrink-0">
        {/* Left */}
        <div className="flex items-center gap-3">
          <h2 className="text-base font-black text-gradient tracking-tight">{t('hero.title')}</h2>
          <div className="flex gap-1">
            {['en', 'hi', 'es'].map(lang => (
              <button key={lang} onClick={() => setLanguage(lang)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${language === lang ? 'bg-primary-600 text-white' : 'bg-dark-800 text-slate-600 hover:text-white'} transition-all`}>
                {lang}
              </button>
            ))}
          </div>
          {/* XP Bar */}
          <div className="flex items-center gap-2 ml-2">
            <Trophy size={13} className="text-warning-400" />
            <span className="text-[10px] font-bold text-warning-400">Lv.{progress.level}</span>
            <div className="w-20 h-1.5 bg-dark-700 rounded-full overflow-hidden">
              <div className="xp-bar h-full" style={{ width: `${xpPercent}%` }} />
            </div>
            <span className="text-[10px] text-slate-600">{progress.xp}xp</span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="relative w-[380px]">
          <input type="text" value={cmd}
            onChange={(e) => { setCmd(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            onKeyDown={handleCommand}
            placeholder={t('menu.command_placeholder')}
            className="w-full command-input px-3 py-1.5 rounded-lg text-xs text-slate-200 pl-8" />
          <Terminal size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          {showDropdown && filteredAlgorithms.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 glass-strong rounded-lg border border-white/10 shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto">
              {filteredAlgorithms.map(algo => (
                <button key={algo.id} onMouseDown={() => handleSelectAlgorithm(algo.id)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-primary-600/20 hover:text-white transition-colors flex items-center justify-between group">
                  <span className="flex items-center gap-2">
                    {progress.completedAlgorithms.includes(algo.id) && <Zap size={11} className="text-success-400" />}
                    {t(`algorithms.${algo.id}`)}
                  </span>
                  <span className="text-[10px] text-slate-600 group-hover:text-primary-400 font-mono">{algo.id}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Prog Language */}
        <div className="flex items-center gap-1">
          {PROG_LANGUAGES.map(pl => (
            <button key={pl.id} onClick={() => setProgLang(pl.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${progLang === pl.id ? 'text-white' : 'text-slate-600 hover:text-white bg-dark-800'}`}
              style={progLang === pl.id ? { background: pl.color + '33', color: pl.color, boxShadow: `0 0 10px ${pl.color}33` } : {}}>
              {pl.label}
            </button>
          ))}
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 flex overflow-hidden">
        {/* LEFT: Visualizer */}
        <section className="flex-1 flex flex-col border-r border-white/5 relative">
          {/* Controls */}
          {renderControls()}

          {/* Visualization */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
            {renderVisualization()}
          </div>

          {/* Explanation Bar */}
          {renderExplanationBar()}
        </section>

        {/* RIGHT: Code Panel */}
        <aside className="w-[380px] bg-dark-900 flex flex-col shrink-0">
          {renderRightPanelContent()}
        </aside>
      </main>
    </div>
  );
};
