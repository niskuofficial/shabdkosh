export interface ApiWordEntry {
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  definition: string;
  example?: string;
  synonyms: string[];
  hindi: string;
  hindiPronunciation?: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

interface DictionaryApiMeaning {
  partOfSpeech: string;
  definitions: { definition: string; example?: string }[];
  synonyms: string[];
}

interface DictionaryApiResponse {
  word: string;
  phonetic?: string;
  meanings: DictionaryApiMeaning[];
}

async function getEnglishData(word: string): Promise<DictionaryApiResponse | null> {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`);
    if (!res.ok) return null;
    const data: DictionaryApiResponse[] = await res.json();
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}

async function getHindiTranslation(word: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|hi`
    );
    if (!res.ok) return '';
    const data = await res.json();
    const translated: string = data?.responseData?.translatedText ?? '';
    // Reject if translation came back in English (MyMemory sometimes does this)
    const isHindi = /[\u0900-\u097F]/.test(translated);
    return isHindi ? translated : '';
  } catch {
    return '';
  }
}

export async function lookupWord(word: string): Promise<ApiWordEntry[] | null> {
  const [englishData, hindiWord] = await Promise.all([
    getEnglishData(word),
    getHindiTranslation(word),
  ]);

  if (!englishData) return null;

  const results: ApiWordEntry[] = [];

  for (const meaning of englishData.meanings) {
    const firstDef = meaning.definitions[0];
    if (!firstDef) continue;

    results.push({
      word: englishData.word,
      phonetic: englishData.phonetic,
      partOfSpeech: meaning.partOfSpeech,
      definition: firstDef.definition,
      example: firstDef.example,
      synonyms: meaning.synonyms?.slice(0, 4) ?? [],
      hindi: hindiWord || '—',
      difficulty: 'intermediate',
    });
  }

  return results.length ? results : null;
}

export async function lookupHindiTranslation(word: string): Promise<string> {
  return getHindiTranslation(word);
}
