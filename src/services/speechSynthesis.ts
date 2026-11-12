/**
 * Helper for browser SpeechSynthesis API
 */

export function speakText(text: string, onEnd?: () => void, rate: number = 0.95): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  window.speechSynthesis.cancel();

  const cleanText = text.replace(/[{}]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = rate; // Configurable educational pace (0.75x, 0.95x, 1.2x)
  utterance.pitch = 1.0;
  utterance.lang = 'en-US';

  // Try to pick a natural English voice if available
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
  ) || voices.find(v => v.lang.startsWith('en'));

  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
