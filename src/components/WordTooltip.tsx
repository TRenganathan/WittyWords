import React, { useEffect, useState } from 'react';
import { TargetWord, DictionaryResult } from '../types';
import { Volume2, BookmarkPlus, Check, X, Loader2 } from 'lucide-react';
import { speakText } from '../services/speechSynthesis';

export interface ActiveWordData {
  rawToken: string;
  isTargetWord: boolean;
  targetWord?: TargetWord;
  rect?: DOMRect;
  contextQuote?: string;
  storyTitle?: string;
  storyId?: string;
  speakerName?: string;
  speakerRole?: string;
  speakerEmotion?: string;
}

interface WordTooltipProps {
  activeWord: ActiveWordData | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (data: {
    word: string;
    phonetic: string;
    partOfSpeech: string;
    plainEnglish: string;
    inThisStory: string;
    exampleSentence: string;
    tamilMeaning?: string;
    tamilTransliteration?: string;
    storyTitle: string;
    storyId: string;
    contextQuote: string;
    speakerName: string;
    speakerRole: string;
    speakerEmotion: string;
  }) => void;
  dictionaryResult?: DictionaryResult | null;
  isLoadingDict?: boolean;
}

export const WordTooltip: React.FC<WordTooltipProps> = ({
  activeWord,
  onClose,
  isSaved,
  onToggleSave,
  dictionaryResult,
  isLoadingDict,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Reset speaking on word change
    setIsSpeaking(false);
  }, [activeWord?.rawToken]);

  if (!activeWord) return null;

  const isTarget = activeWord.isTargetWord && activeWord.targetWord;
  const wordDisplay = isTarget ? activeWord.targetWord!.word : (dictionaryResult?.word || activeWord.rawToken);
  const phonetic = isTarget ? activeWord.targetWord!.phonetic : (dictionaryResult?.phonetic || '');
  const partOfSpeech = isTarget ? activeWord.targetWord!.partOfSpeech : (dictionaryResult?.partOfSpeech || 'Word');
  const plainEnglish = isTarget
    ? activeWord.targetWord!.plainEnglish
    : (dictionaryResult?.definition || 'Fetching definition...');
  const inThisStory = isTarget
    ? activeWord.targetWord!.inThisStory
    : (activeWord.contextQuote ? `Used in passage: "${activeWord.contextQuote}"` : undefined);
  const exampleSentence = isTarget
    ? activeWord.targetWord!.exampleSentence
    : (dictionaryResult?.example || 'Everyday conversational use.');
  
  const tamilMeaning = isTarget
    ? activeWord.targetWord!.tamilMeaning
    : (dictionaryResult?.tamilMeaning || `தமிழ் விளக்கம்: "${wordDisplay}" என்பதற்கான எளிய பொருள்.`);
  const tamilTransliteration = isTarget ? activeWord.targetWord!.tamilTransliteration : undefined;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpeaking(true);
    speakText(wordDisplay, () => setIsSpeaking(false));
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave({
      word: wordDisplay,
      phonetic: phonetic || '',
      partOfSpeech,
      plainEnglish,
      inThisStory: inThisStory || '',
      exampleSentence,
      tamilMeaning,
      tamilTransliteration,
      storyTitle: activeWord.storyTitle || 'WittyWords Story',
      storyId: activeWord.storyId || 'story',
      contextQuote: activeWord.contextQuote || '',
      speakerName: activeWord.speakerName || 'Narrator',
      speakerRole: activeWord.speakerRole || 'Story Context',
      speakerEmotion: activeWord.speakerEmotion || '📖',
    });
  };

  // Popover positioning logic
  const topPos = activeWord.rect ? Math.min(window.innerHeight - 440, Math.max(70, activeWord.rect.bottom + 8)) : 100;
  const leftPos = activeWord.rect ? Math.max(16, Math.min(window.innerWidth - 360, activeWord.rect.left - 40)) : 16;

  return (
    <>
      {/* Backdrop for click-outside dismissal */}
      <div
        className="fixed inset-0 z-45 bg-black/25 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Responsive Container: Desktop Popover / Mobile Bottom Sheet */}
      <div
        className={`fixed z-50 bg-white border border-[#E6E1D6] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-5 sm:rounded-2xl transition-all
          max-sm:bottom-0 max-sm:inset-x-0 max-sm:rounded-t-3xl max-sm:border-b-0 max-sm:max-h-[85vh] max-sm:overflow-y-auto
          sm:w-[380px] sm:rounded-2xl`}
        style={typeof window !== 'undefined' && window.innerWidth >= 640 ? { top: `${topPos}px`, left: `${leftPos}px` } : undefined}
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden w-10 h-1 bg-[#E6E1D6] rounded-full mx-auto mb-3" />

        {/* Header row */}
        <div className="flex items-start justify-between gap-2 border-b border-[#FAF7F2] pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-extrabold text-[#1C1917] font-sans capitalize">
                {wordDisplay}
              </h3>
              {partOfSpeech && (
                <span className="text-[11px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[#FAF7F2] text-[#57534E] border border-[#E6E1D6]">
                  {partOfSpeech}
                </span>
              )}
            </div>

            {phonetic && (
              <span className="text-xs font-mono text-[#B45309] block mt-0.5 font-medium">
                {phonetic}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Audio Button */}
            <button
              onClick={handleSpeak}
              className={`p-2 rounded-xl border border-[#E6E1D6] tactile-btn transition-colors cursor-pointer ${
                isSpeaking ? 'bg-[#FEF08A] text-[#B45309]' : 'bg-[#FAF7F2] text-[#1C1917] hover:bg-[#F3EFE6]'
              }`}
              title="Listen to pronunciation"
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Details */}
        <div className="py-3 space-y-3 text-xs leading-relaxed">
          {isLoadingDict ? (
            <div className="flex items-center justify-center py-6 gap-2 text-[#57534E]">
              <Loader2 className="w-4 h-4 animate-spin text-[#E05A47]" />
              <span>Looking up in real-time dictionary...</span>
            </div>
          ) : (
            <>
              {/* Plain English Synonym */}
              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E6E1D6]/80">
                <span className="text-[10px] font-bold text-[#E05A47] uppercase tracking-wider block mb-0.5">
                  In Plain English
                </span>
                <p className="font-semibold text-sm text-[#1C1917]">
                  {plainEnglish}
                </p>
              </div>

              {/* DEDICATED TAMIL TRANSLATION BOX */}
              {tamilMeaning && (
                <div className="bg-[#FFFBEB] p-2.5 rounded-xl border border-[#FDE68A] shadow-xs">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-[#92400E] uppercase tracking-wider flex items-center gap-1">
                      <span>🇮🇳 தமிழ் விளக்கம் (Tamil Meaning)</span>
                    </span>
                  </div>
                  <p className="font-bold text-sm text-[#78350F] leading-snug" style={{ fontFamily: 'var(--font-tamil, inherit)' }}>
                    {tamilMeaning}
                  </p>
                  {tamilTransliteration && (
                    <p className="text-[11px] text-[#92400E] mt-0.5 font-mono italic">
                      ({tamilTransliteration})
                    </p>
                  )}
                </div>
              )}

              {/* In This Story Context */}
              {inThisStory && (
                <div>
                  <span className="text-[10px] font-bold text-[#57534E] uppercase tracking-wider block mb-0.5">
                    In This Story
                  </span>
                  <p className="text-[#1C1917] font-serif italic text-xs">
                    {inThisStory}
                  </p>
                </div>
              )}

              {/* Example Sentence */}
              {exampleSentence && (
                <div>
                  <span className="text-[10px] font-bold text-[#57534E] uppercase tracking-wider block mb-0.5">
                    Real-World Example
                  </span>
                  <p className="text-[#57534E] font-sans">
                    {exampleSentence}
                  </p>
                </div>
              )}

              {/* Original Quote badge if present */}
              {activeWord.contextQuote && (
                <div className="pt-1 text-[11px] text-[#57534E] border-t border-[#FAF7F2]">
                  <span>Spoken by </span>
                  <strong className="text-[#1C1917]">{activeWord.speakerEmotion} {activeWord.speakerName}</strong>
                </div>
              )}
            </>
          )}
        </div>

        {/* Save to Word Bank Button */}
        <div className="pt-2">
          <button
            onClick={handleSaveClick}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all tactile-btn cursor-pointer ${
              isSaved
                ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                : 'bg-[#1C1917] text-white border border-[#1C1917]'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-[#059669]" />
                <span>✓ Saved in Word Bank</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4 text-[#FEF08A]" />
                <span>+ Save to Word Bank</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
