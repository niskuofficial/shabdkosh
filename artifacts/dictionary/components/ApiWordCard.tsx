import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ApiWordEntry } from '@/utils/dictionaryApi';
import { useColors } from '@/hooks/useColors';
import { fonts } from '@/utils/fonts';

interface ApiWordCardProps {
  entry: ApiWordEntry;
  onPress?: () => void;
  compact?: boolean;
}

export default function ApiWordCard({ entry, onPress, compact }: ApiWordCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.navy }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        <View style={styles.wordGroup}>
          <Text style={[styles.word, { color: colors.foreground, fontFamily: fonts.bold }]}>
            {entry.word}
          </Text>
          {entry.phonetic && (
            <Text style={[styles.phonetic, { color: colors.gold, fontFamily: fonts.regular }]}>
              {entry.phonetic}
            </Text>
          )}
        </View>
        <View style={[styles.posBadge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Text style={[styles.posText, { color: colors.mutedForeground, fontFamily: fonts.medium }]}>
            {entry.partOfSpeech}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.goldLight }]} />

      <View style={styles.hindiRow}>
        <Text style={[styles.hindi, { color: colors.gold, fontFamily: fonts.bold }]}>
          {entry.hindi}
        </Text>
        <View style={[styles.liveBadge, { backgroundColor: colors.gold + '15', borderColor: colors.gold + '40' }]}>
          <Feather name="globe" size={10} color={colors.gold} />
          <Text style={[styles.liveText, { color: colors.gold, fontFamily: fonts.semiBold }]}>Live</Text>
        </View>
      </View>

      {!compact && (
        <>
          <Text style={[styles.definition, { color: colors.foreground, fontFamily: fonts.regular }]}>
            {entry.definition}
          </Text>
          {entry.example && (
            <Text style={[styles.example, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
              "{entry.example}"
            </Text>
          )}
          {entry.synonyms.length > 0 && (
            <View style={styles.synonymRow}>
              {entry.synonyms.map((s, i) => (
                <View key={i} style={[styles.synonym, { backgroundColor: colors.goldLight, borderColor: colors.border }]}>
                  <Text style={[styles.synonymText, { color: colors.goldDark, fontFamily: fonts.medium }]}>{s}</Text>
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  wordGroup: { flex: 1 },
  word: { fontSize: 22, letterSpacing: 0.3 },
  phonetic: { fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  posBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  posText: { fontSize: 10, textTransform: 'capitalize' },
  divider: { height: 1, marginVertical: 10, borderRadius: 1 },
  hindiRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  hindi: { fontSize: 20 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  liveText: { fontSize: 10 },
  definition: { fontSize: 14, lineHeight: 20, marginTop: 2 },
  example: { fontSize: 13, marginTop: 6, fontStyle: 'italic', lineHeight: 18 },
  synonymRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  synonym: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  synonymText: { fontSize: 12 },
});
