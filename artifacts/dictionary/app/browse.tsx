import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import WordCard from '@/components/WordCard';
import { dictionaryData, getWordsByDifficulty, DictionaryEntry } from '@/data/dictionary';

export default function BrowseScreen() {
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addToRecent } = useApp();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const [activeFilter, setActiveFilter] = useState<string>(filter ?? 'all');

  let words: DictionaryEntry[];
  if (activeFilter === 'all') words = [...dictionaryData].sort((a, b) => a.word.localeCompare(b.word));
  else if (['basic', 'intermediate', 'advanced'].includes(activeFilter)) {
    words = getWordsByDifficulty(activeFilter as any);
  } else {
    words = dictionaryData;
  }

  const handleWordPress = (entry: DictionaryEntry) => {
    addToRecent(entry);
    router.push({ pathname: '/word', params: { word: entry.word } });
  };

  const filters = [
    { label: 'All', value: 'all', color: colors.gold },
    { label: 'Basic', value: 'basic', color: '#22c55e' },
    { label: 'Intermediate', value: 'intermediate', color: '#f59e0b' },
    { label: 'Advanced', value: 'advanced', color: '#ef4444' },
  ];

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navy, paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.gold + '20' }]}>
            <Feather name="arrow-left" size={20} color={colors.gold} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.gold, fontFamily: 'Inter_700Bold' }]}>Browse Words</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={[styles.count, { color: '#FFFFFF', fontFamily: 'Inter_400Regular', opacity: 0.7 }]}>
          {words.length} words
        </Text>

        <View style={styles.filterRow}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterChip,
                {
                  backgroundColor: activeFilter === f.value ? f.color : 'transparent',
                  borderColor: f.color,
                }
              ]}
              onPress={() => setActiveFilter(f.value)}
            >
              <Text style={[styles.filterText, { color: activeFilter === f.value ? '#0D1117' : f.color, fontFamily: 'Inter_600SemiBold' }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={words}
        keyExtractor={(item) => item.word}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <WordCard entry={item} compact onPress={() => handleWordPress(item)} />
          </View>
        )}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 40 }}
        keyboardDismissMode="on-drag"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20 },
  count: { fontSize: 13, marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 12 },
});
