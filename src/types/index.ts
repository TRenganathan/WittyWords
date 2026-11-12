export type DifficultyLevel = 'All Levels' | 'A2 Beginner' | 'B2 Intermediate' | 'C1 Workplace Pro';

export type StoryCategory = 'corporate' | 'interview' | 'fables' | 'social' | 'everyday';

export interface TargetWord {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  plainEnglish: string;
  inThisStory: string;
  exampleSentence: string;
  tamilMeaning: string;
  tamilTransliteration?: string;
  tamilSentence?: string;
  quote?: string;
  speaker?: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  emotion: string;
  avatarBg: string;
  avatarSeed: string;
}

export interface StoryBlock {
  id: string;
  type: 'narrator' | 'dialogue';
  characterId?: string;
  text: string;
  targetWordKeys?: string[];
}

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  hook: string;
  category: StoryCategory;
  categoryName: string;
  categoryEmoji: string;
  categoryBg: string;
  level: 'A2 Beginner' | 'B2 Intermediate' | 'C1 Workplace Pro';
  readingTime: string;
  coverImage: string;
  featured: boolean;
  characters: Record<string, Character>;
  blocks: StoryBlock[];
  targetWords: Record<string, TargetWord>;
  takeaway: {
    title: string;
    moral: string;
    reflection: string;
  };
  quizPairs: {
    word: string;
    meaning: string;
    tamilMeaning?: string;
  }[];
}

export interface SavedWord {
  id: string;
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
  savedAt: number;
  mastered: boolean;
}

export interface DictionaryResult {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  example?: string;
  synonyms?: string[];
  audioUrl?: string;
  tamilMeaning?: string;
  source: 'api' | 'curated' | 'fallback';
}
