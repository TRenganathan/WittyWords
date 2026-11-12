import React from 'react';
import { X, Sparkles, Volume2, CheckCircle2, Zap, Brain, MessageSquare } from 'lucide-react';
import { speakText } from '../services/speechSynthesis';

interface FluencyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POWER_PHRASES = [
  {
    english: 'Could I get that to go?',
    tamil: 'இதை பார்சலாகக் கட்டித் தர முடியுமா?',
    scenario: 'Coffee shops, bakeries & fast food restaurants',
  },
  {
    english: 'I am running a bit behind today.',
    tamil: 'இன்று எனக்கு கொஞ்சம் நேர தாமதமாகிவிட்டது.',
    scenario: 'Apologizing casually when meeting friends or arriving late',
  },
  {
    english: 'Let’s split the bill evenly.',
    tamil: 'பில் தொகையை நாம் ஆளுக்குப் பாதியாகப் பிரித்துக் கொள்ளலாம்.',
    scenario: 'Dining out or paying shared grocery/cab expenses',
  },
  {
    english: 'Could we take a rain check?',
    tamil: 'இந்தத் திட்டத்தை மற்றொரு நாளுக்குத் தள்ளி வைக்கலாமா?',
    scenario: 'Politely postponing a plan when you are busy or tired',
  },
  {
    english: 'Let’s grab a quick bite.',
    tamil: 'வாருங்கள், அவசரமாக எதாவது சாப்பிட்டுவிட்டு வரலாம்.',
    scenario: 'Inviting a coworker or friend for a fast casual meal',
  },
  {
    english: 'Let’s call it a day.',
    tamil: 'இன்றைய வேலையை இத்துடன் முடித்துக் கொள்ளலாம்.',
    scenario: 'Wrapping up work or study sessions in the evening',
  },
];

export const FluencyGuideModal: React.FC<FluencyGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl border border-[#E6E1D6] shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#FAF7F2] pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E05A47] uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Accelerated Fluency Method</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] font-sans">
              How to Learn English Quickly & Easily
            </h3>
            <p className="text-xs text-[#57534E] mt-1">
              Why traditional grammar rules fail, and how micro-stories give you instant conversational fluency.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Core Principles */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-[#E05A47]" />
            <span>The 3 Rules of Fast English Acquisition</span>
          </h4>

          <div className="grid grid-cols-1 gap-2.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#1C1917]">
                <span className="w-5 h-5 rounded-full bg-[#E05A47] text-white flex items-center justify-center text-[11px]">1</span>
                <span>Learn in Chunks, Not Single Words</span>
              </div>
              <p className="text-[#57534E] pl-6 leading-relaxed">
                Native speakers don't construct grammar in their heads word-by-word. They think in ready-made phrases like <em>"I'm running behind"</em> or <em>"Let's split the bill"</em>. When you learn complete chunks, speaking is instant.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#1C1917]">
                <span className="w-5 h-5 rounded-full bg-[#E05A47] text-white flex items-center justify-center text-[11px]">2</span>
                <span>Anchor With Humor & Emotional Stories</span>
              </div>
              <p className="text-[#57534E] pl-6 leading-relaxed">
                The brain forgets 80% of textbook lists within 48 hours. But when you laugh at Maya’s <em>"reply-all blunder"</em> or Leo’s <em>"spilled iced latte"</em>, emotional episodic memory locks the vocabulary into your long-term memory.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#1C1917]">
                <span className="w-5 h-5 rounded-full bg-[#E05A47] text-white flex items-center justify-center text-[11px]">3</span>
                <span>Listen & Shadow (Speak Aloud)</span>
              </div>
              <p className="text-[#57534E] pl-6 leading-relaxed">
                Use the <strong>"🎧 Listen"</strong> button in our stories. Listen to a line, pause, and immediately repeat it out loud. This trains your tongue muscles and removes the hesitation of speaking in public.
              </p>
            </div>
          </div>
        </div>

        {/* Essential Everyday Conversational Phrases */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#E05A47]" />
              <span>Must-Know Everyday Real Talk Phrases</span>
            </h4>
            <span className="text-[11px] text-[#57534E]">Tap 🔊 to listen</span>
          </div>

          <div className="space-y-2">
            {POWER_PHRASES.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white border border-[#E6E1D6] shadow-[0_2px_0_#E6E1D6] flex items-start justify-between gap-2.5 transition-all hover:border-[#D6D0C4]"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#1C1917]">
                      {item.english}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#B45309]" style={{ fontFamily: 'var(--font-tamil, inherit)' }}>
                    {item.tamil}
                  </p>
                  <p className="text-[11px] text-[#57534E] italic">
                    When to use: {item.scenario}
                  </p>
                </div>

                <button
                  onClick={() => speakText(item.english)}
                  className="p-2 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] text-[#1C1917] hover:bg-[#FEF08A] hover:text-[#B45309] tactile-btn shrink-0 cursor-pointer"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dismiss CTA */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl tactile-btn-primary font-bold text-sm cursor-pointer"
          >
            Got It! Start Practicing Stories
          </button>
        </div>
      </div>
    </div>
  );
};
