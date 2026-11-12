import React, { useState, useEffect } from 'react';
import { DifficultyLevel, StoryCategory, Story, SavedWord } from './types';
import { STORIES } from './data/stories';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { FeaturedStoryCard } from './components/FeaturedStoryCard';
import { StoryCard } from './components/StoryCard';
import { StoryReader } from './components/StoryReader';
import { WordBankDrawer } from './components/WordBankDrawer';
import { StreakModal } from './components/StreakModal';
import { FluencyGuideModal } from './components/FluencyGuideModal';
import { Sparkles, Compass, Library, Zap, Search, X } from 'lucide-react';

const INITIAL_SAVED_WORDS: SavedWord[] = [
  {
    id: 'init-1',
    word: 'pragmatic',
    phonetic: '/præɡˈmætɪk/',
    partOfSpeech: 'Adjective',
    plainEnglish: 'Sensible, realistic & practical',
    tamilMeaning: 'நடைமுறைக்கேற்ற / எதார்த்தமான அணுகுமுறை',
    tamilTransliteration: 'Nadaimurai kkeattra / Edhaarthamaana',
    inThisStory: 'Raj advising Maya to stop sobbing and reframe the disaster into an intentional marketing strategy.',
    exampleSentence: 'Instead of debating philosophy for another month, the team made a pragmatic choice to ship the simple version.',
    storyTitle: 'The Reply-All Catastrophe',
    storyId: 'reply-all-catastrophe',
    contextQuote: '“Let’s be pragmatic. Crying burns calories; spin-doctoring saves jobs.”',
    speakerName: 'Raj',
    speakerRole: 'Unbothered Senior Dev',
    speakerEmotion: '😎',
    savedAt: Date.now() - 3600000 * 2,
    mastered: false,
  },
  {
    id: 'init-2',
    word: 'silver lining',
    phonetic: '/ˈsɪlvər ˈlaɪnɪŋ/',
    partOfSpeech: 'Idiom',
    plainEnglish: 'A hidden benefit in bad news',
    tamilMeaning: 'துன்பத்திலும் தோன்றும் நல்ல விஷயம் / ஆறுதல்',
    tamilTransliteration: 'Thunbathilum thondrum nalla vaaippu',
    inThisStory: 'The comical accident breaking the stuffy tension of formal corporate interviews.',
    exampleSentence: 'Failing the exam had a silver lining—it forced me to discover a career path I actually love.',
    storyTitle: 'The Coffee Shop CEO',
    storyId: 'coffee-shop-ceo',
    contextQuote: '“There is a silver lining here: you can’t possibly make a worse impression upstairs than you just made down here.”',
    speakerName: 'Sam',
    speakerRole: 'The Dry-Humor Barista',
    speakerEmotion: '👀',
    savedAt: Date.now() - 3600000 * 5,
    mastered: true,
  },
  {
    id: 'init-3',
    word: 'content',
    phonetic: '/kənˈtent/',
    partOfSpeech: 'Adjective',
    plainEnglish: 'Peacefully satisfied with current life',
    tamilMeaning: 'போதும் என்ற மனநிறைவு / மனத்திருப்தி',
    tamilTransliteration: 'Podhum endra mananiraivu / Thrupthi',
    inThisStory: 'Mateo’s tranquil satisfaction with fresh fish, afternoon naps, and guitar strumming.',
    exampleSentence: 'While others chased vanity titles, Sarah was deeply content with her fulfilling research projects.',
    storyTitle: 'The Fisherman & The Burnout Consultant',
    storyId: 'fisherman-burnout-consultant',
    contextQuote: '“I catch two fish, take a siesta with my wife, and play flamenco with my friends. I am content.”',
    speakerName: 'Mateo',
    speakerRole: 'Coastal Fisherman & Philosopher',
    speakerEmotion: '🎣',
    savedAt: Date.now() - 3600000 * 12,
    mastered: false,
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<'explore' | 'reader'>('explore');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Filters & Search
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>('All Levels');
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | 'all'>('all');
  const [storySearchQuery, setStorySearchQuery] = useState('');

  // Word Bank & Streak State with LocalStorage
  const [savedWords, setSavedWords] = useState<SavedWord[]>(() => {
    try {
      const stored = localStorage.getItem('wittywords_bank');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // Fallback
    }
    return INITIAL_SAVED_WORDS;
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('wittywords_streak');
      if (stored) return parseInt(stored, 10);
    } catch (e) {
      // Fallback
    }
    return 5;
  });

  // Modals & Drawers
  const [isWordBankOpen, setIsWordBankOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isFluencyGuideOpen, setIsFluencyGuideOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('wittywords_bank', JSON.stringify(savedWords));
    } catch (e) {}
  }, [savedWords]);

  useEffect(() => {
    try {
      localStorage.setItem('wittywords_streak', streakDays.toString());
    } catch (e) {}
  }, [streakDays]);

  // Handlers
  const handleOpenStory = (story: Story) => {
    setSelectedStory(story);
    setCurrentView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToExplore = () => {
    setCurrentView('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSaveWord = (data: {
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
  }) => {
    setSavedWords(prev => {
      const exists = prev.find(w => w.word.toLowerCase() === data.word.toLowerCase());
      if (exists) {
        // Remove if already saved
        return prev.filter(w => w.word.toLowerCase() !== data.word.toLowerCase());
      } else {
        // Add new
        const newWord: SavedWord = {
          id: `word-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          word: data.word,
          phonetic: data.phonetic || '',
          partOfSpeech: data.partOfSpeech || 'Word',
          plainEnglish: data.plainEnglish,
          inThisStory: data.inThisStory,
          exampleSentence: data.exampleSentence,
          tamilMeaning: data.tamilMeaning,
          tamilTransliteration: data.tamilTransliteration,
          storyTitle: data.storyTitle,
          storyId: data.storyId,
          contextQuote: data.contextQuote,
          speakerName: data.speakerName,
          speakerRole: data.speakerRole,
          speakerEmotion: data.speakerEmotion,
          savedAt: Date.now(),
          mastered: false,
        };
        return [newWord, ...prev];
      }
    });
  };

  const handleRemoveWord = (wordId: string) => {
    setSavedWords(prev => prev.filter(w => w.id !== wordId));
  };

  const handleToggleMastered = (wordId: string) => {
    setSavedWords(prev =>
      prev.map(w => (w.id === wordId ? { ...w, mastered: !w.mastered } : w))
    );
  };

  const handleIncrementStreak = () => {
    setStreakDays(prev => prev + 1);
  };

  const handleNextStory = () => {
    if (!selectedStory) return;
    const currentIndex = STORIES.findIndex(s => s.id === selectedStory.id);
    const nextIndex = (currentIndex + 1) % STORIES.length;
    handleOpenStory(STORIES[nextIndex]);
  };

  // Filtered stories (by level, category, and search query)
  const filteredStories = STORIES.filter(story => {
    const matchesLevel =
      selectedLevel === 'All Levels' || story.level === selectedLevel;
    const matchesCategory =
      selectedCategory === 'all' || story.category === selectedCategory;

    if (!matchesLevel || !matchesCategory) return false;

    if (!storySearchQuery.trim()) return true;

    const query = storySearchQuery.toLowerCase().trim();
    const inTitle = story.title.toLowerCase().includes(query);
    const inHook = story.hook.toLowerCase().includes(query);
    const inWords = Object.keys(story.targetWords).some(w => w.toLowerCase().includes(query));
    const inTamil = Object.values(story.targetWords).some(tw => 
      (tw.tamilMeaning && tw.tamilMeaning.includes(query)) ||
      (tw.tamilTransliteration && tw.tamilTransliteration.toLowerCase().includes(query))
    );

    return inTitle || inHook || inWords || inTamil;
  });

  const featuredStory = STORIES.find(s => s.featured) || STORIES[0];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] selection:bg-[#FEF08A] selection:text-[#1C1917]">
      {/* Global Header */}
      <Header
        streakDays={streakDays}
        wordBankCount={savedWords.length}
        onOpenWordBank={() => setIsWordBankOpen(true)}
        onOpenStreakModal={() => setIsStreakModalOpen(true)}
        onGoHome={handleBackToExplore}
      />

      {/* Main Views */}
      {currentView === 'explore' ? (
        <main className="max-w-[680px] mx-auto px-4 py-6 space-y-7">
          {/* Hero Welcome Banner */}
          <section className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E05A47] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Contextual English for Modern Achievers</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] font-sans tracking-tight">
              Master High-Impact Words Through Short, Funny Stories.
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] font-serif leading-relaxed">
              No boring flashcard drills. Read 3-minute comic dialogues, tap any word for instant definitions, and anchor vocabulary through humor and story arcs.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsFluencyGuideOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E6E1D6] text-xs font-bold text-[#E05A47] hover:bg-[#FDFBF7] shadow-[0_2px_0_#E6E1D6] tactile-btn flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>How to Learn English Quickly (Fluency Guide)</span>
              </button>
              <span className="text-[11px] font-semibold text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] px-2.5 py-1 rounded-xl">
                🇮🇳 தமிழ் விளக்கங்கள் (Tamil Meanings Included)
              </span>
            </div>
          </section>

          {/* Level Filter & Category Carousel */}
          <CategoryFilter
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Search Bar for Stories & Vocabulary */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#57534E]" />
            <input
              type="text"
              placeholder="Search stories, words, or idioms (e.g. 'candid', 'errands', 'ரத்து')..."
              value={storySearchQuery}
              onChange={e => setStorySearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-[#E6E1D6] bg-white text-xs sm:text-sm text-[#1C1917] placeholder-[#57534E] shadow-[0_2px_0_#E6E1D6] focus:outline-none focus:border-[#E05A47]"
            />
            {storySearchQuery && (
              <button
                onClick={() => setStorySearchQuery('')}
                className="absolute right-3 top-2.5 p-1 rounded-lg text-[#57534E] hover:text-[#1C1917]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Featured Story of the Day (shown when no search and viewing all categories or matching filter) */}
          {!storySearchQuery && selectedCategory === 'all' && selectedLevel === 'All Levels' && (
            <section className="space-y-2">
              <FeaturedStoryCard
                story={featuredStory}
                onRead={handleOpenStory}
              />
            </section>
          )}

          {/* Stories Grid */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#1C1917] font-sans flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#E05A47]" />
                <span>
                  {storySearchQuery ? `Search Results for "${storySearchQuery}"` : 'Available Stories'} ({filteredStories.length})
                </span>
              </h2>
            </div>

            {filteredStories.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E6E1D6] p-8 text-center space-y-2">
                <p className="text-sm font-semibold text-[#1C1917]">
                  No stories match your selected filters.
                </p>
                <p className="text-xs text-[#57534E]">
                  Try selecting "All Levels" or clearing the category filter.
                </p>
                <button
                  onClick={() => {
                    setSelectedLevel('All Levels');
                    setSelectedCategory('all');
                  }}
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] border border-[#E6E1D6] tactile-btn cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredStories.map(story => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onRead={handleOpenStory}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Footer note */}
          <footer className="pt-8 pb-6 border-t border-[#E6E1D6] text-center text-xs text-[#57534E] space-y-1">
            <p className="font-semibold text-[#1C1917]">
              WittyWords — Designed for thoughtful, fast vocabulary acquisition.
            </p>
            <p className="text-[11px]">
              Click any word inside stories to query live definitions. All progress saved locally.
            </p>
          </footer>
        </main>
      ) : selectedStory ? (
        <StoryReader
          story={selectedStory}
          onBack={handleBackToExplore}
          savedWords={savedWords}
          onToggleSaveWord={handleToggleSaveWord}
          onOpenWordBank={() => setIsWordBankOpen(true)}
          onIncrementStreak={handleIncrementStreak}
          onNextStory={handleNextStory}
        />
      ) : null}

      {/* Word Bank Drawer */}
      <WordBankDrawer
        isOpen={isWordBankOpen}
        onClose={() => setIsWordBankOpen(false)}
        savedWords={savedWords}
        onRemoveWord={handleRemoveWord}
        onToggleMastered={handleToggleMastered}
      />

      {/* Streak Modal */}
      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        streakDays={streakDays}
      />

      {/* Fluency Guide Modal */}
      <FluencyGuideModal
        isOpen={isFluencyGuideOpen}
        onClose={() => setIsFluencyGuideOpen(false)}
      />
    </div>
  );
}
