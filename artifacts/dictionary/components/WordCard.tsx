import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DictionaryEntry } from '@/data/dictionary';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

interface WordCardProps {
  entry: DictionaryEntry;
  onPress?: () => void;
  compact?: boolean;
}

const DIFFICULTY_COLORS = {
  basic: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};

export default function WordCard({ entry, onPress, compact }: WordCardProps) {
  const colors = useColors();
  const { isFavorite, addFavorite, removeFavorite } = useApp();
  const fav = isFavorite(entry.word);

  const toggleFav = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (fav) removeFavorite(entry.word);
    else addFavorite(entry);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.navy }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        <View style={styles.wordGroup}>
          <Text style={[styles.word, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {entry.word}
          </Text>
          {!compact && entry.pronunciation && (
            <Text style={[styles.pronunciation, { color: colors.gold, fontFamily: 'Inter_400Regular' }]}>
              /{entry.pronunciation}/
            </Text>
          )}
        </View>
        <View style={styles.rightGroup}>
          <View style={[styles.badge, { backgroundColor: DIFFICULTY_COLORS[entry.difficulty] + '20', borderColor: DIFFICULTY_COLORS[entry.difficulty] }]}>
            <Text style={[styles.badgeText, { color: DIFFICULTY_COLORS[entry.difficulty] }]}>
              {entry.difficulty}
            </Text>
          </View>
          <TouchableOpacity onPress={toggleFav} style={styles.favBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name={fav ? 'bookmark' : 'bookmark'} size={18} color={fav ? colors.gold : colors.mutedForeground} solid={fav} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.goldLight }]} />

      <View style={styles.hindiRow}>
        <Text style={[styles.hindi, { color: colors.gold, fontFamily: 'Inter_700Bold' }]}>
          {entry.hindi}
        </Text>
        {!compact && entry.hindiPronunciation && (
          <Text style={[styles.hindiPron, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {entry.hindiPronunciation}
          </Text>
        )}
      </View>

      {!compact && (
        <>
          <Text style={[styles.posLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {entry.partOfSpeech}
          </Text>
          <Text style={[styles.definition, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
            {entry.definition}
          </Text>
          {entry.example && (
            <Text style={[styles.example, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              "{entry.example}"
            </Text>
          )}
          {entry.synonyms && entry.synonyms.length > 0 && (
            <View style={styles.synonymRow}>
              {entry.synonyms.slice(0, 3).map((s, i) => (
                <View key={i} style={[styles.synonym, { backgroundColor: colors.goldLight, borderColor: colors.border }]}>
                  <Text style={[styles.synonymText, { color: colors.goldDark, fontFamily: 'Inter_500Medium' }]}>{s}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  wordGroup: { flex: 1 },
  word: { fontSize: 22, letterSpacing: 0.3 },
  pronunciation: { fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  rightGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  favBtn: { padding: 2 },
  divider: { height: 1, marginVertical: 10, borderRadius: 1 },
  hindiRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  hindi: { fontSize: 20 },
  hindiPron: { fontSize: 12, fontStyle: 'italic' },
  posLabel: { fontSize: 11, marginTop: 4, textTransform: 'italic' },
  definition: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  example: { fontSize: 13, marginTop: 6, fontStyle: 'italic', lineHeight: 18 },
  synonymRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  synonym: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  synonymText: { fontSize: 12 },
});
