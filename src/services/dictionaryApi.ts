import { DictionaryResult } from '../types';

const cache = new Map<string, DictionaryResult>();

export function cleanWordToken(raw: string): string {
  return raw
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'“”‘’]/g, '')
    .trim()
    .toLowerCase();
}

// Quick Tamil vocabulary mapping for common English words
const TAMIL_COMMON_DICT: Record<string, string> = {
  // Workplace & tech
  boss: 'முதலாளி / மேலாளர்',
  client: 'வாடிக்கையாளர் / பயனாளி',
  campaign: 'பிரச்சாரம் / திட்ட இயக்கம்',
  meeting: 'கூட்டம் / ஆலோசனைக் கூட்டம்',
  email: 'மின்னஞ்சல்',
  presentation: 'விளக்கக்காட்சி',
  interview: 'நேர்காணல்',
  candidate: 'விண்ணப்பதாரர் / போட்டியாளர்',
  strategy: 'வியூகம் / தந்திரோபாயம்',
  deadline: 'கடைசி காலக்கெடு',
  salary: 'சம்பளம் / ஊதியம்',
  promotion: 'பதவி உயர்வு',
  intern: 'பயிற்சிப் பணியாளர்',
  manager: 'மேலாளர்',
  project: 'திட்டம் / பணிப்பொறுப்பு',
  startup: 'தொடக்க நிறுவனம்',
  consultant: 'ஆலோசகர்',
  feedback: 'கருத்து / மறுமொழி',
  challenge: 'சவால்',
  success: 'வெற்றி',
  failure: 'தோல்வி',
  progress: 'முன்னேற்றம்',
  solution: 'தீர்வு',
  decision: 'முடிவு',
  problem: 'பிரச்சனை',
  stress: 'மன அழுத்தம்',
  career: 'தொழில் வாழ்க்கை',
  conversation: 'உரையாடல்',
  whisper: 'மெல்லப் பேசுதல் / கிசுகிசுப்பு',
  laugh: 'சிரிப்பு',
  awkward: 'தர்மசங்கடமான / சங்கடமான',
  panic: 'பீதி / திடீர் பதற்றம்',
  humor: 'நகைச்சுவை',
  coffee: 'காபி',
  mistake: 'தவறு / பிழை',
  memory: 'நினைவு',
  future: 'எதிர்காலம்',
  friendship: 'நட்பு',
  respect: 'மரியாதை',
  curious: 'ஆர்வமுள்ள',
  patience: 'பொறுமை',
};

export async function fetchWordDefinition(rawWord: string): Promise<DictionaryResult> {
  const clean = cleanWordToken(rawWord);
  if (!clean || clean.length < 2) {
    return {
      word: rawWord,
      definition: 'A common grammatical word or particle used in English discourse.',
      tamilMeaning: 'ஆங்கில வாக்கிய அமைப்பில் பயன்படும் சொல்.',
      source: 'fallback',
    };
  }

  if (cache.has(clean)) {
    return cache.get(clean)!;
  }

  const tamilMeaning = TAMIL_COMMON_DICT[clean] || undefined;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Word not found in dictionary (Status: ${response.status})`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const entry = data[0];
      const phonetic = entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text || '';
      const audioUrl = entry.phonetics?.find((p: any) => p.audio && p.audio.length > 0)?.audio;
      
      const firstMeaning = entry.meanings?.[0];
      const partOfSpeech = firstMeaning?.partOfSpeech || 'Word';
      const firstDef = firstMeaning?.definitions?.[0];
      const definition = firstDef?.definition || 'Definition currently unavailable.';
      const example = firstDef?.example;
      const synonyms = firstMeaning?.synonyms?.slice(0, 4) || [];

      const result: DictionaryResult = {
        word: entry.word || clean,
        phonetic,
        partOfSpeech,
        definition,
        example,
        synonyms: synonyms.length > 0 ? synonyms : undefined,
        audioUrl,
        tamilMeaning: tamilMeaning || `தமிழ் விளக்கம்: "${clean}" என்ற ஆங்கிலச் சொல்லின் எளிய விளக்கம்`,
        source: 'api',
      };

      cache.set(clean, result);
      return result;
    }
    throw new Error('No entries found');
  } catch (err: any) {
    const fallback: DictionaryResult = {
      word: clean,
      partOfSpeech: 'Word',
      definition: `Defined in context: A commonly understood English term representing an action, state, or descriptor in this passage.`,
      example: `Used naturally in everyday conversational and workplace English.`,
      tamilMeaning: tamilMeaning || `வாக்கியச் சூழலில் பயன்படும் ஆங்கிலச் சொல் (${clean})`,
      source: 'fallback',
    };
    cache.set(clean, fallback);
    return fallback;
  }
}
