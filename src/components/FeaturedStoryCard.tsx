import React from 'react';
import { Story } from '../types';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';

interface FeaturedStoryCardProps {
  story: Story;
  onRead: (story: Story) => void;
}

export const FeaturedStoryCard: React.FC<FeaturedStoryCardProps> = ({ story, onRead }) => {
  const targetWordCount = Object.keys(story.targetWords).length;
  const leadCharacter = Object.values(story.characters)[0];

  return (
    <div className="relative bg-white rounded-3xl border border-[#E6E1D6] shadow-[0_4px_0_#E6E1D6] overflow-hidden transition-all hover:border-[#D6D0C4]">
      {/* Editorial badge bar */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#FAF7F2] bg-[#FAF7F2]/50 text-xs text-[#57534E]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-bold text-[#E05A47] uppercase tracking-wider text-[11px]">
            <Sparkles className="w-3.5 h-3.5" /> Story of the Day
          </span>
          <span aria-hidden="true">·</span>
          <span>{story.categoryName}</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-[#57534E]" />
          <span>{story.readingTime}</span>
        </div>
      </div>

      {/* Featured Artwork Header */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-[#FAF7F2]">
        <img
          src={story.coverImage}
          alt={story.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {/* Scrim gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        
        {/* Character pill floating bottom left */}
        {leadCharacter && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-[#E6E1D6] rounded-xl px-2.5 py-1 flex items-center gap-2 shadow-sm">
            <span className="text-sm">{leadCharacter.emotion}</span>
            <span className="text-xs font-semibold text-[#1C1917]">{leadCharacter.name}</span>
            <span className="text-[10px] text-[#57534E] font-medium hidden sm:inline">({leadCharacter.role})</span>
          </div>
        )}

        {/* Level badge floating top right */}
        <div className="absolute top-3 right-3 bg-[#1C1917]/85 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
          {story.level}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] font-sans leading-tight">
            {story.title}
          </h3>
          <p className="mt-2 text-sm text-[#57534E] font-serif leading-relaxed line-clamp-2">
            {story.hook}
          </p>
        </div>

        {/* Word Preview Chips */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-[#57534E] uppercase tracking-wider flex items-center gap-1">
            <span>Target Vocabulary ({targetWordCount} words):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(story.targetWords).slice(0, 5).map(wordKey => (
              <span
                key={wordKey}
                className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#FEF08A] text-[#1C1917] border border-[#FDE047]"
              >
                {wordKey}
              </span>
            ))}
            {targetWordCount > 5 && (
              <span className="text-xs text-[#57534E] self-center pl-1 font-mono">
                +{targetWordCount - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => onRead(story)}
            className="w-full py-3 px-5 rounded-2xl tactile-btn-primary font-bold text-sm flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Read Story</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
