import React from 'react';
import { Story } from '../types';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';

interface StoryCardProps {
  story: Story;
  onRead: (story: Story) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onRead }) => {
  const targetWordCount = Object.keys(story.targetWords).length;
  const charactersList = Object.values(story.characters);

  return (
    <article className="bg-white rounded-3xl border border-[#E6E1D6] shadow-[0_3px_0_#E6E1D6] overflow-hidden transition-all hover:border-[#D6D0C4] flex flex-col justify-between">
      {/* Top Media Bar */}
      <div className="relative h-40 w-full overflow-hidden bg-[#FAF7F2]">
        <img
          src={story.coverImage}
          alt={story.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
        
        {/* Category & Reading Time floating */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-[#E6E1D6] text-[#1C1917] text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs">
          <span>{story.categoryEmoji}</span>
          <span>{story.categoryName}</span>
        </div>

        <div className="absolute top-3 right-3 bg-[#1C1917]/80 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
          {story.level}
        </div>

        {/* Character badges at bottom of image */}
        <div className="absolute bottom-2.5 left-3 flex items-center -space-x-1">
          {charactersList.map(c => (
            <div
              key={c.id}
              className="w-7 h-7 rounded-full bg-white border-2 border-white flex items-center justify-center text-xs shadow-xs"
              title={`${c.name} (${c.role})`}
            >
              {c.emotion}
            </div>
          ))}
          <span className="text-[11px] text-white/90 pl-2 font-medium drop-shadow-xs">
            {charactersList.map(c => c.name).join(' & ')}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#57534E] mb-1 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {story.readingTime}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 font-semibold text-[#B45309]">
              <BookOpen className="w-3 h-3" />
              {targetWordCount} Target Words
            </span>
          </div>

          <h3 className="font-extrabold text-lg text-[#1C1917] font-sans leading-snug group-hover:text-[#E05A47]">
            {story.title}
          </h3>

          <p className="mt-1.5 text-xs sm:text-sm text-[#57534E] font-serif leading-relaxed line-clamp-2">
            {story.hook}
          </p>
        </div>

        {/* Word Tags preview */}
        <div className="pt-1 flex flex-wrap gap-1">
          {Object.keys(story.targetWords).slice(0, 4).map(w => (
            <span
              key={w}
              className="text-[11px] font-medium px-2 py-0.5 bg-[#FAF7F2] border border-[#E6E1D6] rounded text-[#1C1917]"
            >
              {w}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={() => onRead(story)}
          className="w-full mt-2 py-2.5 px-4 rounded-xl border border-[#E6E1D6] bg-[#FAF7F2] hover:bg-[#E05A47] hover:text-white hover:border-[#E05A47] text-[#1C1917] font-bold text-xs flex items-center justify-center gap-1.5 transition-all tactile-btn cursor-pointer"
        >
          <span>Read Story</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
