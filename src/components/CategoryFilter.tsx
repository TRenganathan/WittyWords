import React from 'react';
import { DifficultyLevel, StoryCategory } from '../types';

interface CategoryFilterProps {
  selectedLevel: DifficultyLevel;
  onSelectLevel: (level: DifficultyLevel) => void;
  selectedCategory: StoryCategory | 'all';
  onSelectCategory: (category: StoryCategory | 'all') => void;
}

const CATEGORIES: {
  id: StoryCategory | 'all';
  name: string;
  emoji: string;
  description: string;
  bgActive: string;
}[] = [
  {
    id: 'all',
    name: 'All Stories',
    emoji: '✨',
    description: 'Browse the entire curated story collection',
    bgActive: 'bg-[#1C1917] text-white',
  },
  {
    id: 'everyday',
    name: 'Everyday Real Talk',
    emoji: '🛒',
    description: 'Groceries, coffee counters, errands & daily activities',
    bgActive: 'bg-[#15803D] text-white',
  },
  {
    id: 'corporate',
    name: 'Corporate Circus',
    emoji: '💼',
    description: 'Office comedy & sharp business idioms',
    bgActive: 'bg-[#92400E] text-white',
  },
  {
    id: 'interview',
    name: 'Interview & Hustle',
    emoji: '🎯',
    description: 'Career wins, interviews & power verbs',
    bgActive: 'bg-[#6B21A8] text-white',
  },
  {
    id: 'fables',
    name: 'Modern Fables',
    emoji: '🧠',
    description: 'Witty life lessons & smart metaphors',
    bgActive: 'bg-[#0F766E] text-white',
  },
  {
    id: 'social',
    name: 'Social & Awkward',
    emoji: '☕',
    description: 'Everyday mishaps & casual conversational fluency',
    bgActive: 'bg-[#C2410C] text-white',
  },
];

const LEVELS: DifficultyLevel[] = [
  'All Levels',
  'A2 Beginner',
  'B2 Intermediate',
  'C1 Workplace Pro',
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedLevel,
  onSelectLevel,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="space-y-4">
      {/* Level Filter Segmented Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
        {LEVELS.map(level => {
          const isActive = selectedLevel === level;
          return (
            <button
              key={level}
              onClick={() => onSelectLevel(level)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all tactile-btn ${
                isActive
                  ? 'bg-[#1C1917] text-white border border-[#1C1917] shadow-[0_2px_0_#000000]'
                  : 'bg-white text-[#57534E] border border-[#E6E1D6] hover:text-[#1C1917] hover:bg-[#FDFBF7]'
              }`}
            >
              {level}
            </button>
          );
        })}
      </div>

      {/* Categories Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
        {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isActive ? 'all' : (cat.id as StoryCategory))}
              className={`p-3 rounded-2xl border text-left transition-all tactile-btn flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-[#E05A47] shadow-[0_3px_0_#E05A47] ring-2 ring-[#E05A47]/10'
                  : 'bg-white border-[#E6E1D6] hover:border-[#D6D0C4] hover:bg-[#FDFBF7]'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1.5">
                <span className="text-xl leading-none p-1.5 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6]">
                  {cat.emoji}
                </span>
                {isActive && (
                  <span className="text-[10px] uppercase font-bold text-[#E05A47] tracking-wider px-1.5 py-0.5 rounded bg-[#FEE2E2]">
                    Active
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1C1917] leading-snug">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-[#57534E] line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Clear filter shortcut if category active */}
      {selectedCategory !== 'all' && (
        <div className="flex items-center justify-between text-xs text-[#57534E] pt-1 px-1">
          <span>Filtering by category: <strong className="text-[#1C1917]">{CATEGORIES.find(c => c.id === selectedCategory)?.name}</strong></span>
          <button
            onClick={() => onSelectCategory('all')}
            className="text-[#E05A47] font-semibold hover:underline"
          >
            Show All
          </button>
        </div>
      )}
    </div>
  );
};
