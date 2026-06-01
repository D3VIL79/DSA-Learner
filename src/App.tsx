import React from 'react';
import { useAppStore } from './store/useAppStore';
import { HeroWrapper } from './components/hero/HeroWrapper';
import { MainGame } from './components/MainGame';
import { Cursor } from './components/Cursor';

export default function App() {
  const appMode = useAppStore((state) => state.mode);
  const setAppMode = useAppStore((state) => state.setMode);

  return (
    <>
      <Cursor />
      <div className="w-screen h-screen bg-dark-950 text-slate-200 overflow-hidden font-sans">
        {appMode === 'hero' ? (
          <HeroWrapper />
        ) : (
          <MainGame />
        )}
      </div>
    </>
  );
}
