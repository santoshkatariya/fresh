// Voice assistant utilities for rural & regional Indian farmers
// Supports Kannada, Hindi, Marathi, Telugu, Tamil, and English text-to-speech & speech recognition

export interface VoiceAdvice {
  title: string;
  spokenText: string;
  actionText: string;
  actionRoute?: string;
}

export const speakKisanGuidance = (text: string, langCode: string = 'en'): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported on this browser');
      resolve(false);
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any active speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower for clear regional comprehension
      utterance.pitch = 1.0;

      // Select matching voice
      const voices = window.speechSynthesis.getVoices();
      const langMapping: Record<string, string[]> = {
        kn: ['kn-IN', 'kn', 'hi-IN', 'en-IN'],
        hi: ['hi-IN', 'hi', 'en-IN'],
        mr: ['mr-IN', 'hi-IN', 'en-IN'],
        te: ['te-IN', 'hi-IN', 'en-IN'],
        ta: ['ta-IN', 'hi-IN', 'en-IN'],
        en: ['en-IN', 'en-GB', 'en-US', 'en'],
      };

      const preferredLangs = langMapping[langCode] || ['en-IN', 'en'];
      let matchingVoice = null;

      for (const pl of preferredLangs) {
        matchingVoice = voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(pl.toLowerCase()));
        if (matchingVoice) break;
      }

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      utterance.lang = preferredLangs[0];

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
      resolve(false);
    }
  });
};

export const stopKisanSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Generates vernacular voice advice for farmers based on batch & decision
export const generateBatchVoiceAdvice = (
  crop: string,
  quantityKg: number,
  bestDecision: string,
  buyerName: string,
  netProfit: number,
  lang: string = 'en'
): string => {
  if (lang === 'kn') {
    return `ನಮಸ್ಕಾರ! ನಿಮ್ಮ ${quantityKg} ಕೆಜಿ ${crop} ಫಸಲನ್ನು ${buyerName} ಅವರಿಗೆ ಈಗಲೇ ಮಾರಾಟ ಮಾಡಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ. ನಿವ್ವಳ ಲಾಭ ಸುಮಾರು ₹${netProfit.toLocaleString('en-IN')}. ಸುರಕ್ಷಿತ ಸಾಗಾಣಿಕೆಗಾಗಿ ಎನ್-ಎಚ್ 60 ಹೆದ್ದಾರಿ ಬಳಸಿ.`;
  }
  if (lang === 'hi') {
    return `नमस्ते किसान भाई! आपकी ${quantityKg} किलो ${crop} की फसल को ${buyerName} को तुरंत बेचने की सलाह है। आपका शुद्ध मुनाफा ₹${netProfit.toLocaleString('en-IN')} होगा। न्यूनतम नुकसान के लिए NH-60 एक्सप्रेसवे मार्ग चुनें।`;
  }
  if (lang === 'mr') {
    return `नमस्कार शेतकरी मित्र! आपले ${quantityKg} किलो ${crop} त्वरित ${buyerName} यांना विक्री करण्याचा सल्ला आहे. निव्वळ नफा ₹${netProfit.toLocaleString('en-IN')} राहील.`;
  }
  // Default English
  return `Namaste! For your ${quantityKg} kg of ${crop}, FreshRoute AI recommends: ${bestDecision} to ${buyerName}. Expected net profit is ₹${netProfit.toLocaleString('en-IN')}. Take NH-60 highway to avoid transit spoilage.`;
};

// Speech Recognition helper
export const initKisanSpeechRecognition = (
  lang: string,
  onResult: (transcript: string) => void,
  onError: (err: string) => void
) => {
  const SpeechRecognition =
    (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
    (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Speech recognition is not supported in this browser. Please type or tap options directly.');
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    const langMap: Record<string, string> = {
      kn: 'kn-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      en: 'en-IN',
    };
    recognition.lang = langMap[lang] || 'en-IN';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      onError(event.error || 'Could not understand audio');
    };

    return recognition;
  } catch (e) {
    onError('Error starting microphone');
    return null;
  }
};
