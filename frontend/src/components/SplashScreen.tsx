import React, { useEffect, useState } from 'react';
import { Film as FilmIcon, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  isLoading: boolean;
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isLoading, onFinish }) => {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Hold splash for 800ms for cinematic presentation
      const timer = setTimeout(() => {
        setFading(true);
        const removeTimer = setTimeout(() => {
          setVisible(false);
          onFinish?.();
        }, 600); // 600ms fade transition
        return () => clearTimeout(removeTimer);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 bg-[#11111b] transition-opacity duration-700 ease-out select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Projector Beam with subtle vignette */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/splash.jpg"
          alt="Cinema Projector"
          className="w-full h-full object-cover object-center filter brightness-95 contrast-105 scale-105 animate-[pulse_4s_ease-in-out_infinite]"
        />
        {/* Soft Catppuccin dark vignette gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#11111b] via-[#11111b]/50 to-[#11111b]/80" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#181825]/30 to-[#11111b]/90" />
      </div>

      {/* Top Header Badge */}
      <div className="relative z-10 pt-4 sm:pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e1e2e]/85 border border-[#313244]/80 backdrop-blur-md shadow-xl shadow-[#11111b]/60">
          <Sparkles className="w-3.5 h-3.5 text-[#cba6f7]" />
          <span className="text-xs font-medium text-[#cdd6f4] tracking-wide">
            Catppuccin Cinema
          </span>
        </div>
      </div>

      {/* Center Hero Logo & Title */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-4 animate-in fade-in zoom-in-95 duration-700">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#cba6f7]/30 to-[#b4befe]/40 border border-[#cba6f7]/50 flex items-center justify-center text-[#cba6f7] shadow-2xl shadow-[#cba6f7]/25 mb-4 backdrop-blur-md">
          <FilmIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#cba6f7]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#cdd6f4] tracking-tight mb-2 drop-shadow-lg">
          Films List
        </h1>
        <p className="text-xs sm:text-sm text-[#bac2de] max-w-xs drop-shadow">
          Личная кинематографическая коллекция
        </p>
      </div>

      {/* Bottom Loading Progress Indicator */}
      <div className="relative z-10 pb-6 sm:pb-8 w-full max-w-xs flex flex-col items-center gap-3 animate-in fade-in duration-700">
        <div className="w-44 sm:w-52 h-1.5 rounded-full bg-[#313244]/80 overflow-hidden border border-[#45475a]/50 shadow-inner">
          <div className="h-full bg-gradient-to-r from-[#fab387] via-[#cba6f7] to-[#b4befe] rounded-full animate-progress" />
        </div>
        <span className="text-[11px] font-medium text-[#a6adc8] tracking-wider uppercase">
          Загрузка базы фильмов...
        </span>
      </div>
    </div>
  );
};
