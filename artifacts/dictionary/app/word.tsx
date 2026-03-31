import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { dictionaryData } from '@/data/dictionary';
import { fonts } from '@/utils/fonts';

const DIFFICULTY_COLORS = {
  basic: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};

export default function WordScreen() {
  const { word } = useLocalSearchParams<{ word: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isFavorite, addFavorite, removeFavorite } = useApp();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const entry = dictionaryData.find(e => e.word === word);
  const fav = entry ? isFavorite(entry.word) : false;

  const toggleFav = () => {
    if (!entry) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (fav) removeFavorite(entry.word);
    else addFavorite(entry);
  };

  if (!entry) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.foreground, fontFamily: fonts.regular }]}>
          Word not found.
        </Text>
      </View>
    );
  }

  const diffColor = DIFFICULTY_COLORS[entry.difficulty];

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
          <TouchableOpacity
            onPress={toggleFav}
            style={[styles.favBtn, { backgroundColor: fav ? colors.gold + '20' : 'transparent', borderColor: colors.gold + '40', borderWidth: 1 }]}
          >
            <Feather name="bookmark" size={20} color={fav ? colors.gold : colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <View style={[styles.diffBadge, { backgroundColor: diffColor + '25', borderColor: diffColor }]}>
          <Text style={[styles.diffText, { color: diffColor, fontFamily: fonts.semiBold }]}>
            {entry.difficulty}
          </Text>
        </View>

        <Text style={[styles.heroWord, { color: '#FFFFFF', fontFamily: fonts.bold }]}>
          {entry.word}
        </Text>

        {entry.pronunciation && (
          <Text style={[styles.heroPron, { color: colors.gold, fontFamily: fonts.regular }]}>
            /{entry.pronunciation}/
          </Text>
        )}

        <Text style={[styles.heroPos, { color: '#FFFFFF', fontFamily: fonts.regular, opacity: 0.6 }]}>
          {entry.partOfSpeech}
        </Text>
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
            {entry.hindi}
          </Text>
          {entry.hindiPronunciation && (
            <Text style={[styles.hindiPron, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
              {entry.hindiPronunciation}
            </Text>
          )}
        </View>

        {/* Definition */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardAccent, { backgroundColor: '#60a5fa' }]} />
            <Text style={[styles.cardLabel, { color: colors.mutedForeground, fontFamily: fonts.medium }]}>
              Definition
            </Text>
          </View>
          <Text style={[styles.definition, { color: colors.foreground, fontFamily: fonts.regular }]}>
            {entry.definition}
          </Text>
        </View>

        {/* Example */}
        {entry.example && (
          <View style={[styles.card, { backgroundColor: colors.goldLight, borderColor: colors.gold + '30' }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardAccent, { backgroundColor: colors.gold }]} />
              <Text style={[styles.cardLabel, { color: colors.goldDark, fontFamily: fonts.medium }]}>
                Example
              </Text>
            </View>
            <Text style={[styles.example, { color: colors.navy, fontFamily: fonts.regular }]}>
              "{entry.example}"
            </Text>
          </View>
        )}

        {/* Synonyms */}
        {entry.synonyms && entry.synonyms.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardAccent, { backgroundColor: '#a78bfa' }]} />
              <Text style={[styles.cardLabel, { color: colors.mutedForeground, fontFamily: fonts.medium }]}>
                Synonyms
              </Text>
            </View>
            <View style={styles.synonymRow}>
              {entry.synonyms.map((s, i) => (
                <View key={i} style={[styles.synChip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <Text style={[styles.synText, { color: colors.foreground, fontFamily: fonts.medium }]}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Category */}
        {entry.category && (
          <View style={styles.metaRow}>
            <Feather name="tag" size={14} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
              Category: {entry.category}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 16 },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  heroNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diffBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  diffText: { fontSize: 11, textTransform: 'capitalize' },
  heroWord: { fontSize: 40, letterSpacing: 0.5, marginBottom: 6 },
  heroPron: { fontSize: 16, fontStyle: 'italic', marginBottom: 6 },
  heroPos: { fontSize: 13, textTransform: 'capitalize' },
  body: { padding: 16, gap: 12 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardAccent: { width: 3, height: 16, borderRadius: 2 },
  cardLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  hindiWord: { fontSize: 30 },
  hindiPron: { fontSize: 14, marginTop: 4, fontStyle: 'italic' },
  definition: { fontSize: 15, lineHeight: 22 },
  example: { fontSize: 15, fontStyle: 'italic', lineHeight: 22 },
  synonymRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  synChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  synText: { fontSize: 13 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, textTransform: 'capitalize' },
});
