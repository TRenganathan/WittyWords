import React, { useState } from 'react';
import { SavedWord } from '../types';
import {
  X,
  Volume2,
  Trash2,
  Sparkles,
  Layers,
  List,
  CheckCircle2,
  RotateCw,
  Search,
  BookOpen,
  Download,
} from 'lucide-react';
import { speakText } from '../services/speechSynthesis';

interface WordBankDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedWords: SavedWord[];
  onRemoveWord: (wordId: string) => void;
  onToggleMastered: (wordId: string) => void;
}

export const WordBankDrawer: React.FC<WordBankDrawerProps> = ({
  isOpen,
  onClose,
  savedWords,
  onRemoveWord,
  onToggleMastered,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'flashcards'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen) return null;

  const filteredWords = savedWords.filter(
    w =>
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.plainEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.storyTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSpeak = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(word);
  };

  const handleNextFlashcard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentFlashcardIndex(prev => (prev + 1) % savedWords.length);
    }, 150);
  };

  const handleExportCSV = () => {
    if (savedWords.length === 0) return;
    const headers = ['Word', 'Phonetic', 'Part of Speech', 'Plain English', 'Tamil Meaning', 'Tamil Transliteration', 'Story Title', 'Quote', 'Example Sentence'];
    const rows = savedWords.map(w => [
      `"${(w.word || '').replace(/"/g, '""')}"`,
      `"${(w.phonetic || '').replace(/"/g, '""')}"`,
      `"${(w.partOfSpeech || '').replace(/"/g, '""')}"`,
      `"${(w.plainEnglish || '').replace(/"/g, '""')}"`,
      `"${(w.tamilMeaning || '').replace(/"/g, '""')}"`,
      `"${(w.tamilTransliteration || '').replace(/"/g, '""')}"`,
      `"${(w.storyTitle || '').replace(/"/g, '""')}"`,
      `"${(w.contextQuote || '').replace(/"/g, '""')}"`,
      `"${(w.exampleSentence || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `WittyWords_Saved_Vocabulary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentCard = savedWords[currentFlashcardIndex];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/35 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[460px] bg-[#FAF7F2] border-l border-[#E6E1D6] shadow-2xl flex flex-col justify-between">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E6E1D6] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📚</span>
              <h3 className="font-extrabold text-lg text-[#1C1917] font-sans">
                My Word Bank
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#FEF08A] text-[#B45309] font-mono text-xs font-bold">
                {savedWords.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {savedWords.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="p-1.5 rounded-xl border border-[#E6E1D6] bg-[#FAF7F2] hover:bg-[#F3EFE6] text-[#1C1917] text-xs font-semibold flex items-center gap-1 tactile-btn cursor-pointer"
                  title="Export vocabulary to CSV (Anki / Excel compatible)"
                >
                  <Download className="w-3.5 h-3.5 text-[#E05A47]" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-[#FAF7F2] text-[#57534E] hover:text-[#1C1917] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mode Switcher: List vs Flashcards */}
          <div className="grid grid-cols-2 p-1 bg-[#FAF7F2] border border-[#E6E1D6] rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'list'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Word List ({savedWords.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('flashcards');
                setIsFlipped(false);
              }}
              disabled={savedWords.length === 0}
              className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'flashcards'
                  ? 'bg-white text-[#E05A47] shadow-xs font-bold'
                  : 'text-[#57534E] hover:text-[#1C1917] disabled:opacity-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>🎴 Flashcards</span>
            </button>
          </div>

          {/* Search bar (when in list mode) */}
          {activeTab === 'list' && savedWords.length > 0 && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#57534E]" />
              <input
                type="text"
                placeholder="Search saved words, meanings, or stories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E6E1D6] bg-[#FAF7F2] text-xs text-[#1C1917] placeholder-[#57534E] focus:outline-none focus:border-[#E05A47]"
              />
            </div>
          )}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {savedWords.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-[#E6E1D6] flex items-center justify-center text-3xl shadow-[0_2px_0_#E6E1D6]">
                📖
              </div>
              <h4 className="font-bold text-[#1C1917] text-base">Your Word Bank is Empty</h4>
              <p className="text-xs text-[#57534E] max-w-[260px] mx-auto leading-relaxed">
                Click any highlighted mustard word or regular word in a story to save it here with full story context!
              </p>
            </div>
          ) : activeTab === 'list' ? (
            // LIST VIEW
            <div className="space-y-3">
              {filteredWords.map(sw => (
                <div
                  key={sw.id}
                  className="bg-white rounded-2xl border border-[#E6E1D6] p-4 shadow-[0_2px_0_#E6E1D6] space-y-2.5 transition-all hover:border-[#D6D0C4]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-[#1C1917] capitalize">
                          {sw.word}
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#57534E] border border-[#E6E1D6]">
                          {sw.partOfSpeech}
                        </span>
                      </div>
                      {sw.phonetic && (
                        <span className="text-[11px] font-mono text-[#B45309]">
                          {sw.phonetic}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => handleSpeak(sw.word, e)}
                        className="p-1.5 rounded-lg border border-[#E6E1D6] bg-[#FAF7F2] hover:bg-[#F3EFE6] text-[#1C1917] transition-colors"
                        title="Pronounce word"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveWord(sw.id)}
                        className="p-1.5 rounded-lg text-[#57534E] hover:text-[#DC2626] transition-colors"
                        title="Remove from bank"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Meaning & Tamil Meaning */}
                  <div className="space-y-1.5 text-xs">
                    <p className="font-semibold text-[#1C1917]">
                      {sw.plainEnglish}
                    </p>

                    {sw.tamilMeaning && (
                      <div className="bg-[#FFFBEB] p-2 rounded-xl border border-[#FDE68A] flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-[#92400E] uppercase tracking-wider flex items-center gap-1">
                          <span>🇮🇳 தமிழ் விளக்கம் (Tamil):</span>
                        </span>
                        <span className="font-bold text-xs text-[#78350F] leading-snug" style={{ fontFamily: 'var(--font-tamil, inherit)' }}>
                          {sw.tamilMeaning}
                        </span>
                        {sw.tamilTransliteration && (
                          <span className="text-[10px] text-[#92400E] font-mono italic">
                            ({sw.tamilTransliteration})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Original Story Context */}
                  <div className="bg-[#FAF7F2] rounded-xl p-2.5 border border-[#E6E1D6]/80 text-[11px] text-[#57534E] space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-[#E05A47] uppercase tracking-wider">
                      <BookOpen className="w-3 h-3" />
                      <span>{sw.storyTitle}</span>
                    </div>
                    {sw.contextQuote && (
                      <p className="font-serif italic text-[#1C1917]">
                        “{sw.contextQuote}”
                      </p>
                    )}
                    <div className="text-[10px] text-[#57534E]">
                      Spoken by <strong>{sw.speakerEmotion} {sw.speakerName}</strong> ({sw.speakerRole})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // FLASHCARDS VIEW
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between text-xs text-[#57534E]">
                <span className="font-semibold">Card {currentFlashcardIndex + 1} of {savedWords.length}</span>
                <span className="text-[11px] text-[#E05A47] font-medium">Click card to flip</span>
              </div>

              {currentCard && (
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`min-h-[280px] bg-white rounded-3xl border-2 transition-all p-6 shadow-[0_4px_0_#E6E1D6] flex flex-col justify-between cursor-pointer select-none ${
                    isFlipped
                      ? 'border-[#E05A47] bg-[#FFFBF7]'
                      : 'border-[#E6E1D6] hover:border-[#D6D0C4]'
                  }`}
                >
                  {/* Card Front */}
                  {!isFlipped ? (
                    <div className="space-y-4 my-auto text-center">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#57534E] tracking-widest block">
                        Front · Tap to Reveal
                      </span>
                      <h3 className="text-3xl font-extrabold text-[#1C1917] font-sans capitalize">
                        {currentCard.word}
                      </h3>
                      {currentCard.phonetic && (
                        <p className="text-sm font-mono text-[#B45309]">
                          {currentCard.phonetic}
                        </p>
                      )}

                      {/* Story Context Quote */}
                      <div className="pt-3 max-w-[320px] mx-auto bg-[#FAF7F2] p-3 rounded-2xl border border-[#E6E1D6] text-left">
                        <span className="text-[10px] uppercase font-bold text-[#E05A47] block mb-1">
                          Said in {currentCard.storyTitle}:
                        </span>
                        <p className="font-serif italic text-xs text-[#1C1917]">
                          “{currentCard.contextQuote}”
                        </p>
                        <span className="text-[10px] text-[#57534E] block mt-1">
                          — {currentCard.speakerEmotion} {currentCard.speakerName}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Card Back
                    <div className="space-y-3 my-auto">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#E05A47] tracking-widest block text-center">
                        Back · Meaning & Example
                      </span>

                      <div className="text-center pb-2 border-b border-[#E6E1D6]">
                        <h4 className="text-xl font-bold text-[#1C1917] capitalize">
                          {currentCard.word}
                        </h4>
                        <p className="text-sm font-semibold text-[#E05A47] mt-1">
                          {currentCard.plainEnglish}
                        </p>
                      </div>

                      {/* Flashcard Tamil Meaning */}
                      {currentCard.tamilMeaning && (
                        <div className="bg-[#FFFBEB] p-2.5 rounded-xl border border-[#FDE68A] text-center">
                          <span className="text-[10px] font-bold text-[#92400E] uppercase tracking-wider block mb-0.5">
                            🇮🇳 தமிழ் விளக்கம் (Tamil):
                          </span>
                          <p className="font-bold text-sm text-[#78350F]" style={{ fontFamily: 'var(--font-tamil, inherit)' }}>
                            {currentCard.tamilMeaning}
                          </p>
                          {currentCard.tamilTransliteration && (
                            <p className="text-[10px] text-[#92400E] font-mono italic mt-0.5">
                              ({currentCard.tamilTransliteration})
                            </p>
                          )}
                        </div>
                      )}

                      {currentCard.inThisStory && (
                        <div className="text-xs">
                          <span className="text-[10px] font-bold text-[#57534E] uppercase">In This Story:</span>
                          <p className="text-[#1C1917] font-serif italic">{currentCard.inThisStory}</p>
                        </div>
                      )}

                      {currentCard.exampleSentence && (
                        <div className="text-xs">
                          <span className="text-[10px] font-bold text-[#57534E] uppercase">Real-World Example:</span>
                          <p className="text-[#57534E]">{currentCard.exampleSentence}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card bottom hint */}
                  <div className="pt-2 text-center text-[11px] text-[#57534E] flex items-center justify-center gap-1">
                    <RotateCw className="w-3 h-3 text-[#E05A47]" />
                    <span>Flip card</span>
                  </div>
                </div>
              )}

              {/* Flashcard Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleNextFlashcard}
                  className="py-2.5 px-3 rounded-xl border border-[#E6E1D6] bg-white text-[#1C1917] text-xs font-semibold hover:bg-[#FDFBF7] tactile-btn cursor-pointer"
                >
                  Next Card →
                </button>
                <button
                  onClick={() => {
                    if (currentCard) onToggleMastered(currentCard.id);
                    handleNextFlashcard();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#10B981] text-white text-xs font-bold tactile-btn shadow-[0_2px_0_#059669] cursor-pointer flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Know This</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-white border-t border-[#E6E1D6] flex items-center justify-between text-xs text-[#57534E]">
          <span className="flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#E05A47]" />
            Saved to local storage
          </span>
          <button
            onClick={onClose}
            className="font-bold text-[#1C1917] hover:underline"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
};
