import React from 'react';
import { X, Flame, Check, Sparkles, Trophy } from 'lucide-react';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  streakDays,
}) => {
  if (!isOpen) return null;

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Simulate active days: past 5 days completed
  const activeDaysIndices = [0, 1, 2, 3, 4];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl border border-[#E6E1D6] shadow-2xl p-6 space-y-5 text-center animate-scale-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF7F2] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Flame Icon */}
        <div className="w-16 h-16 rounded-3xl bg-[#FFF1EE] border border-[#FCD9D3] mx-auto flex items-center justify-center text-3xl shadow-[0_3px_0_#FCD9D3]">
          🔥
        </div>

        <div>
          <h3 className="text-2xl font-extrabold text-[#1C1917] font-sans">
            {streakDays} Day Learning Streak!
          </h3>
          <p className="text-xs text-[#57534E] mt-1">
            You are building consistent fluency muscle memory. Keep it up!
          </p>
        </div>

        {/* 7-Day Row */}
        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E6E1D6] space-y-2">
          <div className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider text-left">
            This Week’s Consistency
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {daysOfWeek.map((day, idx) => {
              const isActive = activeDaysIndices.includes(idx);
              const isToday = idx === 4;

              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono font-medium text-[#57534E]">
                    {day}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold border transition-all ${
                      isActive
                        ? 'bg-[#E05A47] text-white border-[#B93E2D] shadow-[0_2px_0_#B93E2D]'
                        : 'bg-white text-[#D6D0C4] border-[#E6E1D6]'
                    } ${isToday ? 'ring-2 ring-[#E05A47]/40' : ''}`}
                  >
                    {isActive ? <Check className="w-4 h-4 stroke-[3]" /> : '·'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Consistency Tip */}
        <div className="p-3 bg-[#FFFBEB] rounded-2xl border border-[#FEF08A] text-left text-xs text-[#92400E] flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
          <p className="leading-relaxed">
            <strong>The Micro-Story Method:</strong> Reading 1 short 3-minute story each day embeds <strong>2,500+ workplace words & idioms</strong> a year through emotional context rather than boring flashcard drilling.
          </p>
        </div>

        {/* Primary dismiss */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl tactile-btn-primary font-bold text-sm cursor-pointer"
        >
          Keep Learning
        </button>
      </div>
    </div>
  );
};
