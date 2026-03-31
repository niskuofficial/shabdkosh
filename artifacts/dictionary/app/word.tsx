import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { dictionaryData, DictionaryEntry } from '@/data/dictionary';
import { lookupWord, ApiWordEntry } from '@/utils/dictionaryApi';
import { fonts } from '@/utils/fonts';

const DIFFICULTY_COLORS = {
  basic: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};

type DisplayEntry = {
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  definition: string;
  example?: string;
  synonyms: string[];
  hindi: string;
  hindiPronunciation?: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  isLocal: boolean;
};

function localToDisplay(e: DictionaryEntry): DisplayEntry {
  return {
    word: e.word,
    phonetic: e.pronunciation,
    partOfSpeech: e.partOfSpeech,
    definition: e.definition,
    example: e.example,
    synonyms: e.synonyms ?? [],
    hindi: e.hindi,
    hindiPronunciation: e.hindiPronunciation,
    difficulty: e.difficulty,
    isLocal: true,
  };
}

function apiToDisplay(e: ApiWordEntry): DisplayEntry {
  return {
    word: e.word,
    phonetic: e.phonetic,
    partOfSpeech: e.partOfSpeech,
    definition: e.definition,
    example: e.example,
    synonyms: e.synonyms,
    hindi: e.hindi,
    difficulty: e.difficulty,
    isLocal: false,
  };
}

export default function WordScreen() {
  const { word, fromApi } = useLocalSearchParams<{ word: string; fromApi?: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isFavorite, addFavorite, removeFavorite } = useApp();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const [entries, setEntries] = useState<DisplayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!word) { setNotFound(true); setLoading(false); return; }
    load();
  }, [word]);

  async function load() {
    setLoading(true);
    setNotFound(false);

    // 1. Check local dictionary first
    const local = dictionaryData.find(e => e.word.toLowerCase() === word.toLowerCase());
    if (local) {
      setEntries([localToDisplay(local)]);
      setLoading(false);
      return;
    }

    // 2. Fall back to API
    const apiResults = await lookupWord(word);
    if (apiResults && apiResults.length > 0) {
      setEntries(apiResults.map(apiToDisplay));
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }

  const primary = entries[0];
  const fav = primary ? isFavorite(primary.word) : false;

  const toggleFav = () => {
    if (!primary) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Convert to a local-compatible entry for saving
    const favEntry: DictionaryEntry = {
      word: primary.word,
      pronunciation: primary.phonetic,
      partOfSpeech: primary.partOfSpeech,
      definition: primary.definition,
      example: primary.example,
      synonyms: primary.synonyms,
      hindi: primary.hindi,
      hindiPronunciation: primary.hindiPronunciation,
      difficulty: primary.difficulty,
    };
    if (fav) removeFavorite(primary.word);
    else addFavorite(favEntry);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <View style={[styles.hero, { backgroundColor: colors.navy, paddingTop: topPad + 16 }]}>
          <View style={styles.heroNav}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.gold + '20' }]}>
              <Feather name="arrow-left" size={20} color={colors.gold} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.heroWord, { color: '#FFFFFF', fontFamily: fonts.bold }]}>{word}</Text>
        </View>
        <View style={styles.loadingBody}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
            Looking up "{word}"...
          </Text>
        </View>
      </View>
    );
  }

  if (notFound || !primary) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={[styles.hero, { backgroundColor: colors.navy, paddingTop: topPad + 16 }]}>
          <View style={styles.heroNav}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.gold + '20' }]}>
              <Feather name="arrow-left" size={20} color={colors.gold} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.heroWord, { color: '#FFFFFF', fontFamily: fonts.bold }]}>{word}</Text>
        </View>
        <View style={styles.notFoundBody}>
          <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
          <Text style={[styles.notFoundTitle, { color: colors.foreground, fontFamily: fonts.semiBold }]}>Word not found</Text>
          <Text style={[styles.notFoundSub, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
            Try checking spelling or search for another word
          </Text>
        </View>
      </View>
    );
  }

  const diffColor = DIFFICULTY_COLORS[primary.difficulty];

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 40 }}
    >
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.navy, paddingTop: topPad + 16 }]}>
        <View style={styles.heroNav}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.gold + '20' }]}>
            <Feather name="arrow-left" size={20} color={colors.gold} />
          </TouchableOpacity>
          <View style={styles.heroRight}>
            {!primary.isLocal && (
              <View style={[styles.livePill, { backgroundColor: colors.gold + '20', borderColor: colors.gold + '50' }]}>
                <Feather name="globe" size={12} color={colors.gold} />
                <Text style={[styles.livePillText, { color: colors.gold, fontFamily: fonts.semiBold }]}>Live</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={toggleFav}
              style={[styles.favBtn, { backgroundColor: fav ? colors.gold + '20' : 'transparent', borderColor: colors.gold + '40', borderWidth: 1 }]}
            >
              <Feather name="bookmark" size={20} color={fav ? colors.gold : colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.heroWord, { color: '#FFFFFF', fontFamily: fonts.bold }]}>
          {primary.word}
        </Text>

        {primary.phonetic && (
          <Text style={[styles.heroPron, { color: colors.gold, fontFamily: fonts.regular }]}>
            {primary.phonetic}
          </Text>
        )}
      </View>

      <View style={styles.body}>
        {/* Hindi Translation */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardAccent, { backgroundColor: colors.gold }]} />
            <Text style={[styles.cardLabel, { color: colors.mutedForeground, fontFamily: fonts.medium }]}>
              Hindi Translation
            </Text>
          </View>
          <Text style={[styles.hindiWord, { color: colors.gold, fontFamily: fonts.bold }]}>
            {primary.hindi}
          </Text>
          {primary.hindiPronunciation && (
            <Text style={[styles.hindiPron, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
              {primary.hindiPronunciation}
            </Text>
          )}
        </View>

        {/* All meanings */}
        {entries.map((entry, idx) => (
          <View key={idx} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardAccent, { backgroundColor: '#60a5fa' }]} />
              <Text style={[styles.cardLabel, { color: colors.mutedForeground, fontFamily: fonts.medium }]}>
                {entry.partOfSpeech}
              </Text>
              {entries.length > 1 && (
                <Text style={[styles.meaningNum, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
                  {idx + 1}/{entries.length}
                </Text>
              )}
            </View>
            <Text style={[styles.definition, { color: colors.foreground, fontFamily: fonts.regular }]}>
              {entry.definition}
            </Text>
            {entry.example && (
              <View style={[styles.exampleBox, { backgroundColor: colors.goldLight, borderColor: colors.gold + '30' }]}>
                <Text style={[styles.example, { color: colors.navy, fontFamily: fonts.regular }]}>
                  "{entry.example}"
                </Text>
              </View>
            )}
            {entry.synonyms.length > 0 && (
              <View style={styles.synonymRow}>
                {entry.synonyms.map((s, i) => (
                  <View key={i} style={[styles.synChip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                    <Text style={[styles.synText, { color: colors.foreground, fontFamily: fonts.medium }]}>{s}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1 },
  center: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingBottom: 28 },
  heroNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  heroRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  livePillText: { fontSize: 12 },
  favBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  heroWord: { fontSize: 40, letterSpacing: 0.5, marginBottom: 6 },
  heroPron: { fontSize: 16, fontStyle: 'italic', marginBottom: 6 },
  loadingBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 },
  loadingText: { fontSize: 15 },
  notFoundBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  notFoundTitle: { fontSize: 18 },
  notFoundSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  body: { padding: 16, gap: 12 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardAccent: { width: 3, height: 16, borderRadius: 2 },
  cardLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, flex: 1 },
  meaningNum: { fontSize: 11 },
  hindiWord: { fontSize: 30 },
  hindiPron: { fontSize: 14, marginTop: 4, fontStyle: 'italic' },
  definition: { fontSize: 15, lineHeight: 22 },
  exampleBox: { marginTop: 10, padding: 12, borderRadius: 10, borderWidth: 1 },
  example: { fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  synonymRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  synChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  synText: { fontSize: 13 },
});
