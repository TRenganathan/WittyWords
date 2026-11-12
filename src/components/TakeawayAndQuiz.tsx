import React, { useState, useEffect } from 'react';
import { Story } from '../types';
import { Sparkles, CheckCircle2, RotateCcw, ArrowRight, Quote } from 'lucide-react';

interface TakeawayAndQuizProps {
  story: Story;
  onCompleteQuiz: () => void;
  onNextStory?: () => void;
}

export const TakeawayAndQuiz: React.FC<TakeawayAndQuizProps> = ({
  story,
  onCompleteQuiz,
  onNextStory,
}) => {
  // Matching Game State
  const [quizMode, setQuizMode] = useState<'english' | 'tamil'>('english');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matchedWords, setMatchedWords] = useState<Set<string>>(new Set());
  const [mismatchedPair, setMismatchedPair] = useState<{ word: string; meaning: string } | null>(null);
  const [shuffledMeanings, setShuffledMeanings] = useState<{ word: string; displayMeaning: string }[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);

  // Helper to build definition list based on mode
  const buildMeanings = (mode: 'english' | 'tamil') => {
    return story.quizPairs.map(pair => {
      const targetWordObj = story.targetWords[pair.word.toLowerCase()];
      const tamilDef = pair.tamilMeaning || targetWordObj?.tamilMeaning || pair.meaning;
      return {
        word: pair.word,
        displayMeaning: mode === 'tamil' ? tamilDef : pair.meaning,
      };
    });
  };

  // Initialize and shuffle meanings on story change or quizMode change
  useEffect(() => {
    const meanings = buildMeanings(quizMode);
    const shuffled = [...meanings].sort(() => Math.random() - 0.5);
    setShuffledMeanings(shuffled);
    setMatchedWords(new Set());
    setSelectedWord(null);
    setMismatchedPair(null);
    setQuizFinished(false);
  }, [story.id, quizMode]);

  const handleWordClick = (word: string) => {
    if (matchedWords.has(word)) return;
    setSelectedWord(word);
    setMismatchedPair(null);
  };

  const handleMeaningClick = (item: { word: string; displayMeaning: string }) => {
    if (!selectedWord || matchedWords.has(item.word)) return;

    if (selectedWord === item.word) {
      // Match found!
      const newMatched = new Set(matchedWords);
      newMatched.add(item.word);
      setMatchedWords(newMatched);
      setSelectedWord(null);
      setMismatchedPair(null);

      // Check if finished
      if (newMatched.size === story.quizPairs.length) {
        setQuizFinished(true);
        onCompleteQuiz();
      }
    } else {
      // Mismatch
      setMismatchedPair({ word: selectedWord, meaning: item.displayMeaning });
      setTimeout(() => {
        setMismatchedPair(null);
        setSelectedWord(null);
      }, 700);
    }
  };

  const handleRestartQuiz = () => {
    const meanings = buildMeanings(quizMode);
    const shuffled = [...meanings].sort(() => Math.random() - 0.5);
    setShuffledMeanings(shuffled);
    setMatchedWords(new Set());
    setSelectedWord(null);
    setMismatchedPair(null);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-8 pt-8 pb-12 border-t border-[#E6E1D6]">
      {/* 1. EDITORIAL TAKEAWAY PULL-QUOTE BOX */}
      <section className="bg-white rounded-3xl border-2 border-[#E05A47]/40 shadow-[0_4px_0_#E6E1D6] p-6 sm:p-7 relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-[#E05A47] uppercase tracking-wider mb-2">
          <Quote className="w-4 h-4" />
          <span>The Meaningful Takeaway</span>
        </div>

        <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1917] leading-tight">
          {story.takeaway.title}
        </h4>

        <blockquote className="mt-3 text-base sm:text-lg font-serif italic text-[#1C1917] leading-relaxed border-l-2 border-[#E05A47] pl-4 py-1">
          “{story.takeaway.moral}”
        </blockquote>

        <p className="mt-3 text-xs sm:text-sm text-[#57534E] font-sans leading-relaxed">
          {story.takeaway.reflection}
        </p>
      </section>

      {/* 2. 20-SECOND RECALL QUIZ (TAP-TO-MATCH) */}
      <section className="bg-white rounded-3xl border border-[#E6E1D6] shadow-[0_4px_0_#E6E1D6] p-6 sm:p-7 space-y-4">
        <div className="flex items-start sm:items-center justify-between gap-2 flex-col sm:flex-row">
          <div>
            <div className="flex items-center gap-1.5 text-[#E05A47] font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>20-Second Recall Challenge</span>
            </div>
            <h4 className="text-lg font-bold text-[#1C1917] font-sans mt-0.5">
              Tap to Match Vocabulary
            </h4>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Mode Toggle: English vs Tamil definitions */}
            <div className="flex items-center p-1 bg-[#FAF7F2] border border-[#E6E1D6] rounded-xl text-xs font-semibold">
              <button
                onClick={() => setQuizMode('english')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  quizMode === 'english'
                    ? 'bg-white text-[#1C1917] shadow-xs font-bold'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setQuizMode('tamil')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  quizMode === 'tamil'
                    ? 'bg-[#FEF08A] text-[#92400E] shadow-xs font-bold'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
                title="Match with Tamil definitions"
              >
                🇮🇳 தமிழ்
              </button>
            </div>

            <div className="text-xs font-mono font-bold text-[#57534E] bg-[#FAF7F2] border border-[#E6E1D6] px-2.5 py-1.5 rounded-xl">
              {matchedWords.size} / {story.quizPairs.length}
            </div>
          </div>
        </div>

        <p className="text-xs text-[#57534E]">
          {quizMode === 'tamil'
            ? 'இடப்பக்கம் உள்ள ஆங்கிலச் சொல்லைத் தொட்டு, வலப்பக்கம் உள்ள அதன் தமிழ்ப் பொருளை இணைக்கவும்.'
            : 'Tap a highlighted word on the left, then select its plain-English definition on the right.'}
        </p>

        {/* The Two-Column Match Arena */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Left Column: Words */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#57534E] block mb-1">
              Story Words
            </span>
            {story.quizPairs.map(item => {
              const isMatched = matchedWords.has(item.word);
              const isSelected = selectedWord === item.word;
              const isMismatched = mismatchedPair?.word === item.word;

              let btnStyles = 'bg-white border-[#E6E1D6] text-[#1C1917] hover:border-[#D6D0C4]';
              if (isMatched) {
                btnStyles = 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] font-bold line-through opacity-80';
              } else if (isMismatched) {
                btnStyles = 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B] animate-pulse';
              } else if (isSelected) {
                btnStyles = 'bg-[#FEF08A] border-[#B45309] text-[#1C1917] font-bold shadow-[0_2px_0_#B45309] scale-[1.02]';
              }

              return (
                <button
                  key={item.word}
                  onClick={() => handleWordClick(item.word)}
                  disabled={isMatched}
                  className={`w-full p-3 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all tactile-btn capitalize cursor-pointer flex items-center justify-between ${btnStyles}`}
                >
                  <span>{item.word}</span>
                  {isMatched && <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Right Column: Definitions */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#57534E] block mb-1">
              {quizMode === 'tamil' ? 'தமிழ் அர்த்தங்கள் (Tamil)' : 'Plain English Meanings'}
            </span>
            {shuffledMeanings.map(item => {
              const isMatched = matchedWords.has(item.word);
              const isMismatched = mismatchedPair?.meaning === item.displayMeaning;

              let btnStyles = 'bg-white border-[#E6E1D6] text-[#57534E] hover:text-[#1C1917] hover:border-[#D6D0C4]';
              if (isMatched) {
                btnStyles = 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] font-medium line-through opacity-80';
              } else if (isMismatched) {
                btnStyles = 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B] animate-pulse';
              }

              return (
                <button
                  key={`${item.word}-${item.displayMeaning}`}
                  onClick={() => handleMeaningClick(item)}
                  disabled={isMatched}
                  className={`w-full p-3 rounded-2xl border text-left text-xs sm:text-xs font-medium transition-all tactile-btn cursor-pointer flex items-center justify-between leading-snug ${btnStyles}`}
                  style={quizMode === 'tamil' ? { fontFamily: 'var(--font-tamil, inherit)' } : undefined}
                >
                  <span className={quizMode === 'tamil' ? 'font-semibold text-[#78350F]' : ''}>
                    {item.displayMeaning}
                  </span>
                  {isMatched && <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Victory State Banner */}
        {quizFinished && (
          <div className="mt-5 p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-center space-y-3 animate-fade-in">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#10B981]/20 text-2xl mb-1">
              🎉
            </div>
            <h5 className="font-extrabold text-lg text-[#065F46] font-sans">
              All Words Mastered!
            </h5>
            <p className="text-xs text-[#047857]">
              You completed the recall quiz for <strong>{story.title}</strong>. Your vocabulary bank and daily streak have been updated!
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={handleRestartQuiz}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[#A7F3D0] bg-white text-[#065F46] text-xs font-semibold flex items-center justify-center gap-1.5 tactile-btn cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Again</span>
              </button>
              {onNextStory && (
                <button
                  onClick={onNextStory}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl tactile-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Next Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
