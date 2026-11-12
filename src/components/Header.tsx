import React from 'react';
import { BookOpen, Sparkles, BookmarkCheck } from 'lucide-react';

interface HeaderProps {
  streakDays: number;
  wordBankCount: number;
  onOpenWordBank: () => void;
  onOpenStreakModal: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  streakDays,
  wordBankCount,
  onOpenWordBank,
  onOpenStreakModal,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6E1D6]">
      <div className="max-w-[680px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 group text-left transition-opacity hover:opacity-90 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-[#E05A47] text-white flex items-center justify-center shadow-[0_2px_0_#B93E2D] group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-[#1C1917] font-sans">
                WittyWords
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#E05A47]" />
              <span className="hidden sm:inline-flex text-[10px] font-bold text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] px-1.5 py-0.2 rounded-md">
                தமிழ் Included
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#57534E] leading-none">
              High-impact stories · எளிய தமிழ் விளக்கம்
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Streak Badge */}
          <button
            onClick={onOpenStreakModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#1C1917] border border-[#E6E1D6] rounded-xl text-xs font-semibold tactile-btn hover:bg-[#FDFBF7] transition-all cursor-pointer"
            title="View your learning streak"
          >
            <span className="text-base leading-none">🔥</span>
            <span>{streakDays} Day Streak</span>
          </button>

          {/* Word Bank Drawer Trigger */}
          <button
            onClick={onOpenWordBank}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#1C1917] border border-[#E6E1D6] rounded-xl text-xs font-semibold tactile-btn hover:bg-[#FDFBF7] transition-all relative cursor-pointer"
            title="Open saved Word Bank"
          >
            <BookmarkCheck className="w-4 h-4 text-[#E05A47]" />
            <span className="hidden sm:inline">Word Bank</span>
            <span className="px-1.5 py-0.2 bg-[#FEF08A] text-[#B45309] font-mono text-[11px] rounded-full font-bold">
              {wordBankCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
