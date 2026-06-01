import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../utils/useTranslation';
import { ParticleCanvas } from './ParticleCanvas';
import gsap from 'gsap';

export const HeroWrapper: React.FC = () => {
  const setMode = useAppStore((state) => state.setMode);
  const { t } = useTranslation();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Badge
    if (badgeRef.current) {
      tl.fromTo(badgeRef.current,
        { y: -20, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6 }
      );
    }

    // Title — letter by letter
    if (titleRef.current) {
      const text = titleRef.current.textContent || '';
      titleRef.current.innerHTML = '';
      text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(60px) rotateX(-90deg)';
        titleRef.current!.appendChild(span);
      });

      const spans = titleRef.current.querySelectorAll('span');
      tl.to(spans, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.04,
        ease: 'back.out(1.7)',
      }, '-=0.2');
    }

    // Subtitle
    if (subtitleRef.current) {
      tl.fromTo(subtitleRef.current,
        { y: 30, opacity: 0, filter: 'blur(10px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8 },
        '-=0.4'
      );
    }

    // Tagline
    if (taglineRef.current) {
      tl.fromTo(taglineRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.3'
      );
    }

    // CTA button
    if (btnRef.current) {
      tl.fromTo(btnRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' },
        '-=0.2'
      );
    }

    return () => { tl.kill(); };
  }, []);

  const handleStart = () => {
    gsap.to(containerRef.current, {
      scale: 1.15,
      opacity: 0,
      filter: 'blur(20px)',
      duration: 0.9,
      ease: 'power3.inOut',
      onComplete: () => setMode('game')
    });
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden bg-dark-950"
    >
      {/* Particle Canvas Background */}
      <ParticleCanvas />

      {/* Grid overlay */}
      <div className="absolute inset-0 hero-grid pointer-events-none" />

      {/* Radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] max-lg:w-[350px] max-lg:h-[350px] bg-primary-600/15 rounded-full blur-[150px] max-lg:blur-[80px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-accent-400/10 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-[#c084fc]/10 rounded-full blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '3s' }} />

      {/* Content */}
      <div className="z-10 text-center flex flex-col items-center gap-6 px-4">
        
        {/* Badge */}
        <div ref={badgeRef} className="opacity-0 px-4 max-lg:landscape:px-3 py-1.5 max-lg:landscape:py-1 rounded-full glass text-xs max-lg:landscape:text-[10px] font-semibold text-accent-400 tracking-widest uppercase mb-2 max-lg:landscape:mb-1">
          ✨ Interactive Algorithm Learning Engine
        </div>

        {/* Title */}
        <h1 
          ref={titleRef} 
          className="text-4xl sm:text-5xl md:text-7xl lg:text-[120px] font-black tracking-tighter text-gradient leading-none"
          style={{ perspective: '600px' }}
        >
          {t('hero.title')}
        </h1>
        
        {/* Subtitle */}
        <p 
          ref={subtitleRef}
          className="text-sm sm:text-lg md:text-xl lg:text-2xl text-slate-300/80 font-light tracking-wide max-w-xl opacity-0"
        >
          {t('hero.subtitle')}
        </p>

        {/* Tagline */}
        <p
          ref={taglineRef}
          className="text-sm text-slate-500 font-mono opacity-0"
        >
          Game · Visualization · Sandbox · 100% Offline
        </p>
        
        {/* CTA */}
        <button
          ref={btnRef}
          onClick={handleStart}
          className="mt-6 max-lg:landscape:mt-3 group relative px-12 max-lg:landscape:px-8 py-4 max-lg:landscape:py-2.5 text-lg max-lg:landscape:text-sm font-bold rounded-full overflow-hidden opacity-0 transition-transform hover:scale-105 active:scale-95"
        >
          {/* Gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-accent-400 to-primary-500 bg-[length:200%_100%] animate-shimmer" />
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-full animate-pulse-glow" />
          {/* Text */}
          <span className="relative text-white drop-shadow-lg">{t('hero.start')}</span>
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 animate-bounce-slow">
        <span className="text-xs text-slate-500 tracking-widest uppercase">Click to Begin</span>
        <div className="w-5 h-8 border-2 border-slate-600 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-slate-400 rounded-full animate-bounce-slow" />
        </div>
      </div>
    </div>
  );
};
