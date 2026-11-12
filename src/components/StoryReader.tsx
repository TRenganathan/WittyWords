import React, { useState, useEffect, useRef } from 'react';
import { Story, StoryBlock, SavedWord, DictionaryResult } from '../types';
import { ArrowLeft, Volume2, Pause, Square, BookmarkCheck, Mic, MicOff, CheckCircle2, RotateCcw, X, Type } from 'lucide-react';
import { WordTooltip, ActiveWordData } from './WordTooltip';
import { TakeawayAndQuiz } from './TakeawayAndQuiz';
import { fetchWordDefinition } from '../services/dictionaryApi';
import { speakText, stopSpeech } from '../services/speechSynthesis';

interface StoryReaderProps {
  story: Story;
  onBack: () => void;
  savedWords: SavedWord[];
  onToggleSaveWord: (data: any) => void;
  onOpenWordBank: () => void;
  onIncrementStreak: () => void;
  onNextStory?: () => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  story,
  onBack,
  savedWords,
  onToggleSaveWord,
  onOpenWordBank,
  onIncrementStreak,
  onNextStory,
}) => {
  // Reading Progress Bar
  const [scrollProgress, setScrollProgress] = useState(0);

  // Audio Playback State for Story
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeAudioBlockIndex, setActiveAudioBlockIndex] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.95);

  // Font Size: 'sm' (17px), 'md' (19px), 'lg' (22px)
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Shadowing Coach State
  const [shadowingBlock, setShadowingBlock] = useState<StoryBlock | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Tooltip State
  const [activeWord, setActiveWord] = useState<ActiveWordData | null>(null);
  const [dictResult, setDictResult] = useState<DictionaryResult | null>(null);
  const [isLoadingDict, setIsLoadingDict] = useState(false);

  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentScroll = window.scrollY;
        setScrollProgress(Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Audio Reading Engine: sequentially speaks blocks
  const audioIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const playbackSpeedRef = useRef<number>(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  useEffect(() => {
    return () => {
      stopSpeech();
      isPlayingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  const playBlockAudio = (index: number) => {
    if (index >= story.blocks.length || !isPlayingRef.current) {
      setIsPlayingAudio(false);
      setActiveAudioBlockIndex(null);
      isPlayingRef.current = false;
      return;
    }

    const block = story.blocks[index];
    setActiveAudioBlockIndex(index);
    audioIndexRef.current = index;

    // Smoothly scroll active block into view
    const el = document.getElementById(`story-block-${block.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    let textToSpeak = block.text.replace(/[{}]/g, '');
    if (block.type === 'dialogue' && block.characterId) {
      const char = story.characters[block.characterId];
      if (char) {
        textToSpeak = `${char.name} says: ${textToSpeak}`;
      }
    }

    speakText(textToSpeak, () => {
      if (isPlayingRef.current) {
        setTimeout(() => {
          playBlockAudio(index + 1);
        }, 500);
      }
    }, playbackSpeedRef.current);
  };

  const handleToggleListen = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      isPlayingRef.current = false;
    } else {
      isPlayingRef.current = true;
      setIsPlayingAudio(true);
      const startIndex = activeAudioBlockIndex !== null ? activeAudioBlockIndex : 0;
      playBlockAudio(startIndex);
    }
  };

  const handleStopListen = () => {
    stopSpeech();
    setIsPlayingAudio(false);
    setActiveAudioBlockIndex(null);
    isPlayingRef.current = false;
  };

  const handleCycleSpeed = () => {
    const nextSpeed = playbackSpeed === 0.75 ? 0.95 : playbackSpeed === 0.95 ? 1.2 : 0.75;
    setPlaybackSpeed(nextSpeed);
    if (isPlayingAudio) {
      // Re-trigger current block with new speed
      stopSpeech();
      playBlockAudio(activeAudioBlockIndex !== null ? activeAudioBlockIndex : 0);
    }
  };

  // Shadowing & Pronunciation Evaluation
  const startShadowing = (block: StoryBlock) => {
    stopSpeech();
    setIsPlayingAudio(false);
    isPlayingRef.current = false;
    setShadowingBlock(block);
    setSpokenTranscript('');
    setMatchScore(null);
    setIsRecording(false);
  };

  const cleanForCompare = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'“”‘’]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const calculateSimilarity = (target: string, spoken: string): number => {
    const targetWords = cleanForCompare(target).split(' ').filter(Boolean);
    const spokenWords = new Set(cleanForCompare(spoken).split(' ').filter(Boolean));
    if (targetWords.length === 0) return 0;
    let matched = 0;
    targetWords.forEach(w => {
      if (spokenWords.has(w)) matched++;
    });
    return Math.min(100, Math.round((matched / targetWords.length) * 100));
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setSpokenTranscript('');
        setMatchScore(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setSpokenTranscript(transcript.trim());
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (shadowingBlock) {
          const targetClean = shadowingBlock.text.replace(/[{}]/g, '');
          setSpokenTranscript(prev => {
            if (prev) {
              const score = calculateSimilarity(targetClean, prev);
              setMatchScore(score);
            }
            return prev;
          });
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsRecording(false);
    }
  };

  // Click Handler for Curated Target Words
  const handleTargetWordClick = (
    targetWordKey: string,
    e: React.MouseEvent<HTMLSpanElement>,
    block: StoryBlock
  ) => {
    e.stopPropagation();
    const tw = story.targetWords[targetWordKey.toLowerCase()];
    if (!tw) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const speaker = block.characterId ? story.characters[block.characterId] : undefined;

    setActiveWord({
      rawToken: tw.word,
      isTargetWord: true,
      targetWord: tw,
      rect,
      contextQuote: block.text.replace(/[{}]/g, ''),
      storyTitle: story.title,
      storyId: story.id,
      speakerName: speaker?.name || 'Narrator',
      speakerRole: speaker?.role || 'Narrator',
      speakerEmotion: speaker?.emotion || '📖',
    });
    setDictResult(null);
    setIsLoadingDict(false);
  };

  // Click Handler for Regular Universal Clickable Words
  const handleRegularWordClick = async (
    rawToken: string,
    e: React.MouseEvent<HTMLSpanElement>,
    block: StoryBlock
  ) => {
    e.stopPropagation();
    const clean = rawToken.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'“”‘’]/g, '').trim();
    if (clean.length < 2) return;

    const matchedTarget = Object.values(story.targetWords).find(
      tw => tw.word.toLowerCase() === clean.toLowerCase()
    );

    const rect = e.currentTarget.getBoundingClientRect();
    const speaker = block.characterId ? story.characters[block.characterId] : undefined;

    if (matchedTarget) {
      setActiveWord({
        rawToken: matchedTarget.word,
        isTargetWord: true,
        targetWord: matchedTarget,
        rect,
        contextQuote: block.text.replace(/[{}]/g, ''),
        storyTitle: story.title,
        storyId: story.id,
        speakerName: speaker?.name || 'Narrator',
        speakerRole: speaker?.role || 'Narrator',
        speakerEmotion: speaker?.emotion || '📖',
      });
      setDictResult(null);
      setIsLoadingDict(false);
      return;
    }

    setActiveWord({
      rawToken: clean,
      isTargetWord: false,
      rect,
      contextQuote: block.text.replace(/[{}]/g, ''),
      storyTitle: story.title,
      storyId: story.id,
      speakerName: speaker?.name || 'Narrator',
      speakerRole: speaker?.role || 'Narrator',
      speakerEmotion: speaker?.emotion || '📖',
    });
    setDictResult(null);
    setIsLoadingDict(true);

    try {
      const res = await fetchWordDefinition(clean);
      setDictResult(res);
    } finally {
      setIsLoadingDict(false);
    }
  };

  const renderInteractiveBlockText = (block: StoryBlock) => {
    const rawText = block.text;
    const regex = /\{([^}]+)\}/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(rawText)) !== null) {
      const preText = rawText.substring(lastIndex, match.index);
      if (preText) {
        parts.push(renderSegmentAsClickableWords(preText, block));
      }

      const targetWordKey = match[1];

      parts.push(
        <span
          key={`target-${match.index}`}
          onClick={e => handleTargetWordClick(targetWordKey, e, block)}
          className="story-target-word"
          title="Curated Pro Vocabulary (Click to inspect)"
        >
          {targetWordKey}
        </span>
      );

      lastIndex = regex.lastIndex;
    }

    const remainingText = rawText.substring(lastIndex);
    if (remainingText) {
      parts.push(renderSegmentAsClickableWords(remainingText, block));
    }

    return parts;
  };

  const renderSegmentAsClickableWords = (textSegment: string, block: StoryBlock) => {
    const tokens = textSegment.split(/(\s+)/);

    return tokens.map((token, idx) => {
      if (/^\s+$/.test(token)) {
        return token;
      }

      const cleanWord = token.replace(/[^a-zA-Z0-9'-]/g, '');
      if (!cleanWord || cleanWord.length < 2) {
        return token;
      }

      return (
        <span
          key={`word-${idx}`}
          onClick={e => handleRegularWordClick(token, e, block)}
          className="story-regular-word"
          title="Click to look up word definition"
        >
          {token}
        </span>
      );
    });
  };

  const isCurrentWordSaved = savedWords.some(
    sw =>
      sw.word.toLowerCase() ===
      (activeWord?.isTargetWord ? activeWord.targetWord?.word : (dictResult?.word || activeWord?.rawToken))?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-20">
      {/* 1. STICKY TOP READER HEADER */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6E1D6]">
        {/* Scroll Progress Bar at very top edge */}
        <div className="h-1 w-full bg-[#E6E1D6]/50">
          <div
            className="h-full bg-[#E05A47] transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div className="max-w-[680px] mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Back button */}
          <button
            onClick={() => {
              stopSpeech();
              onBack();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E6E1D6] bg-white text-[#1C1917] text-xs font-semibold hover:bg-[#FDFBF7] tactile-btn cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Story Title */}
          <div className="flex-1 text-center truncate px-2">
            <h2 className="text-xs sm:text-sm font-bold text-[#1C1917] truncate font-sans">
              {story.title}
            </h2>
          </div>

          {/* Audio Listen, Speed, Font Size & Word Bank triggers */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {/* Speed Controller */}
            <button
              onClick={handleCycleSpeed}
              className="px-2 py-1 rounded-xl border border-[#E6E1D6] bg-white text-[#1C1917] text-[11px] font-mono font-bold hover:bg-[#FDFBF7] tactile-btn cursor-pointer"
              title="Click to toggle audio speed (0.75x, 1.0x, 1.25x)"
            >
              {playbackSpeed === 0.75 ? '0.75x' : playbackSpeed === 0.95 ? '1.0x' : '1.25x'}
            </button>

            {/* Listen Button */}
            <button
              onClick={handleToggleListen}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all tactile-btn cursor-pointer ${
                isPlayingAudio
                  ? 'bg-[#FEF08A] text-[#B45309] border border-[#B45309]'
                  : 'bg-white text-[#1C1917] border border-[#E6E1D6] hover:bg-[#FDFBF7]'
              }`}
              title="Listen to story read aloud"
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </>
              )}
            </button>

            {isPlayingAudio && (
              <button
                onClick={handleStopListen}
                className="p-1.5 rounded-xl border border-[#E6E1D6] bg-white text-[#57534E] hover:text-[#1C1917] tactile-btn cursor-pointer"
                title="Stop audio playback"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            )}

            {/* Font Size Toggle */}
            <button
              onClick={() => setFontSize(prev => prev === 'sm' ? 'md' : prev === 'md' ? 'lg' : 'sm')}
              className="p-1.5 rounded-xl border border-[#E6E1D6] bg-white text-[#57534E] hover:text-[#1C1917] tactile-btn cursor-pointer"
              title="Change text size (Small, Medium, Large)"
            >
              <Type className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenWordBank}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#E6E1D6] bg-white text-[#1C1917] text-xs font-semibold hover:bg-[#FDFBF7] tactile-btn cursor-pointer flex items-center gap-1"
              title="Saved Word Bank"
            >
              <BookmarkCheck className="w-4 h-4 text-[#E05A47]" />
              <span className="hidden md:inline">Bank</span>
              <span className="font-mono text-[10px] bg-[#FEF08A] text-[#B45309] px-1 rounded-full font-bold">
                {savedWords.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN STORY READING CONTAINER (max-width: 680px) */}
      <main className="max-w-[680px] mx-auto px-4 pt-6 space-y-6">
        {/* Story Editorial Header */}
        <div className="space-y-3 pb-4 border-b border-[#E6E1D6]">
          <div className="flex items-center gap-2 text-xs text-[#57534E]">
            <span className="text-base">{story.categoryEmoji}</span>
            <span className="font-semibold text-[#1C1917]">{story.categoryName}</span>
            <span aria-hidden="true">·</span>
            <span>{story.level}</span>
            <span aria-hidden="true">·</span>
            <span>{story.readingTime}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] font-sans leading-tight">
            {story.title}
          </h1>

          <p className="text-sm sm:text-base text-[#57534E] font-serif italic">
            {story.subtitle}
          </p>

          {/* Interactive prompt banner */}
          <div className="p-3 rounded-2xl bg-white border border-[#E6E1D6] flex items-center justify-between text-xs text-[#57534E] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block px-1.5 py-0.5 rounded bg-[#FEF08A] text-[#B45309] font-medium text-[11px] border border-[#FDE047]">
                Mustard
              </span>
              <span>= Curated Pro Words. <strong>Click ANY word</strong> for definitions &amp; <strong>தமிழ் விளக்கம்</strong>!</span>
            </div>
            <div className="text-[11px] text-[#57534E] flex items-center gap-1">
              <Mic className="w-3 h-3 text-[#E05A47]" />
              <span>Tap <strong>Speak</strong> to practice pronunciation</span>
            </div>
          </div>
        </div>

        {/* Comic-Editorial Hybrid Blocks */}
        <div className="space-y-6">
          {story.blocks.map((block, index) => {
            const isActiveAudio = activeAudioBlockIndex === index;
            const textSizeClass = fontSize === 'sm' ? 'text-[16px] sm:text-[17px]' : fontSize === 'lg' ? 'text-[20px] sm:text-[22px]' : 'text-[18px] sm:text-[19px]';

            if (block.type === 'narrator') {
              return (
                <div
                  key={block.id}
                  id={`story-block-${block.id}`}
                  className={`p-4 sm:p-5 rounded-2xl transition-all duration-300 font-serif ${textSizeClass} leading-[1.8] text-[#1C1917] group relative ${
                    isActiveAudio
                      ? 'bg-[#FEF9C3]/70 ring-2 ring-[#F59E0B] shadow-md'
                      : 'bg-transparent'
                  }`}
                >
                  <div>{renderInteractiveBlockText(block)}</div>
                  <div className="mt-2 flex items-center gap-2 justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startShadowing(block)}
                      className="px-2.5 py-1 rounded-xl bg-white border border-[#E6E1D6] text-[11px] font-sans font-semibold text-[#57534E] hover:text-[#E05A47] hover:border-[#E05A47] flex items-center gap-1 tactile-btn cursor-pointer"
                      title="Practice speaking this paragraph"
                    >
                      <Mic className="w-3 h-3 text-[#E05A47]" />
                      <span>Shadow / Speak</span>
                    </button>
                  </div>
                </div>
              );
            }

            const char = block.characterId ? story.characters[block.characterId] : null;

            return (
              <div
                key={block.id}
                id={`story-block-${block.id}`}
                className={`flex items-start gap-3 sm:gap-4 p-2 sm:p-3 rounded-2xl transition-all duration-300 group ${
                  isActiveAudio ? 'bg-[#FEF9C3]/60 ring-2 ring-[#F59E0B]' : ''
                }`}
              >
                {/* Character Avatar */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-12 h-12 rounded-2xl border border-[#E6E1D6] flex items-center justify-center text-2xl shadow-[0_2px_0_#E6E1D6] relative"
                    style={{ backgroundColor: char?.avatarBg || '#FFFFFF' }}
                  >
                    <span>{char?.emotion || '🗣️'}</span>
                  </div>
                </div>

                {/* Speech Bubble Container */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-extrabold text-[#1C1917] font-sans">
                        {char?.name || 'Character'}
                      </span>
                      <span className="text-[11px] text-[#57534E] font-medium">
                        • {char?.role || 'Speaker'}
                      </span>
                    </div>

                    <button
                      onClick={() => startShadowing(block)}
                      className="px-2 py-0.5 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] text-[10px] font-sans font-semibold text-[#57534E] hover:text-[#E05A47] hover:border-[#E05A47] flex items-center gap-1 tactile-btn cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
                      title="Repeat this dialogue to test your pronunciation"
                    >
                      <Mic className="w-3 h-3 text-[#E05A47]" />
                      <span>Shadow Dialogue</span>
                    </button>
                  </div>

                  <div className={`relative bg-white border border-[#E6E1D6] rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-[0_3px_0_#E6E1D6] font-serif ${textSizeClass} leading-[1.75] text-[#1C1917]`}>
                    {renderInteractiveBlockText(block)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. END-OF-STORY TAKEAWAY & 20-SECOND RECALL QUIZ */}
        <TakeawayAndQuiz
          story={story}
          onCompleteQuiz={onIncrementStreak}
          onNextStory={onNextStory}
        />
      </main>

      {/* 4. SMART WORD TOOLTIP */}
      <WordTooltip
        activeWord={activeWord}
        onClose={() => setActiveWord(null)}
        isSaved={isCurrentWordSaved}
        onToggleSave={data => onToggleSaveWord(data)}
        dictionaryResult={dictResult}
        isLoadingDict={isLoadingDict}
      />

      {/* 5. INTERACTIVE SHADOWING COACH MODAL */}
      {shadowingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            onClick={() => {
              if (isRecording && recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) {}
              }
              setShadowingBlock(null);
            }}
          />

          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-[#E6E1D6] shadow-2xl p-6 space-y-5 animate-scale-up">
            <div className="flex items-start justify-between gap-2 border-b border-[#FAF7F2] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#E05A47] uppercase tracking-wider flex items-center gap-1">
                  <Mic className="w-3.5 h-3.5" /> Pronunciation & Shadowing Coach
                </span>
                <h4 className="text-base font-extrabold text-[#1C1917] mt-0.5 font-sans">
                  Speak This Sentence Aloud
                </h4>
              </div>
              <button
                onClick={() => {
                  if (isRecording && recognitionRef.current) {
                    try { recognitionRef.current.stop(); } catch (e) {}
                  }
                  setShadowingBlock(null);
                }}
                className="p-1.5 rounded-xl text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF7F2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Sentence Box */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-2">
              <p className="text-sm sm:text-base font-serif italic text-[#1C1917] leading-relaxed">
                “{shadowingBlock.text.replace(/[{}]/g, '')}”
              </p>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[#57534E]">
                  {shadowingBlock.characterId ? `Spoken by ${story.characters[shadowingBlock.characterId]?.name}` : 'Narrator Line'}
                </span>
                <button
                  onClick={() => speakText(shadowingBlock.text.replace(/[{}]/g, ''), undefined, playbackSpeed)}
                  className="px-2.5 py-1 rounded-xl bg-white border border-[#E6E1D6] text-[#1C1917] font-semibold text-xs flex items-center gap-1 tactile-btn cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#E05A47]" />
                  <span>Hear Sample</span>
                </button>
              </div>
            </div>

            {/* Microphone Action Area */}
            <div className="text-center space-y-3 py-2">
              <button
                onClick={handleToggleRecord}
                className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-white transition-all cursor-pointer shadow-lg ${
                  isRecording
                    ? 'bg-[#DC2626] animate-pulse ring-4 ring-[#F87171]/40'
                    : 'bg-[#E05A47] hover:bg-[#D34B38] shadow-[0_4px_0_#B93E2D]'
                }`}
                title={isRecording ? 'Click to stop recording' : 'Click to start speaking'}
              >
                {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>

              <p className="text-xs font-semibold text-[#1C1917]">
                {isRecording ? 'Listening... Speak now!' : 'Tap the microphone and read the sentence'}
              </p>
            </div>

            {/* Real-time Spoken Transcript */}
            {spokenTranscript && (
              <div className="p-3 rounded-2xl bg-white border border-[#E6E1D6] space-y-1 text-left">
                <span className="text-[10px] font-bold text-[#57534E] uppercase tracking-wider block">
                  What we heard you say:
                </span>
                <p className="text-xs font-medium text-[#1C1917]">
                  "{spokenTranscript}"
                </p>
              </div>
            )}

            {/* Pronunciation Match Score */}
            {matchScore !== null && (
              <div className={`p-4 rounded-2xl border text-center space-y-1 ${
                matchScore >= 75
                  ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
                  : matchScore >= 40
                  ? 'bg-[#FFFBEB] border-[#F59E0B] text-[#92400E]'
                  : 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]'
              }`}>
                <div className="flex items-center justify-center gap-1.5 font-extrabold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Pronunciation Accuracy: {matchScore}%</span>
                </div>
                <p className="text-xs">
                  {matchScore >= 75
                    ? 'Superb! Your articulation and syllable pacing were crisp and clear!'
                    : matchScore >= 40
                    ? 'Good try! Listen to the sample audio once more and repeat with natural rhythm.'
                    : 'Keep going! Tap "Hear Sample" to listen closely, then try recording again.'}
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setSpokenTranscript('');
                  setMatchScore(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-[#E6E1D6] bg-white text-[#57534E] text-xs font-semibold hover:bg-[#FAF7F2] tactile-btn cursor-pointer flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={() => {
                  if (isRecording && recognitionRef.current) {
                    try { recognitionRef.current.stop(); } catch (e) {}
                  }
                  setShadowingBlock(null);
                }}
                className="flex-1 py-2.5 rounded-xl tactile-btn-primary text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
