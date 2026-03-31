import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import SearchBar from '@/components/SearchBar';
import WordCard from '@/components/WordCard';
import { searchWords, getWordOfDay, dictionaryData, DictionaryEntry } from '@/data/dictionary';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addToRecent, recentWords } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const wordOfDay = getWordOfDay();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (text.trim()) {
      setResults(searchWords(text));
      setHasSearched(true);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, []);

  const handleWordPress = (entry: DictionaryEntry) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addToRecent(entry);
    router.push({ pathname: '/word', params: { word: entry.word } });
  };

  const renderHeader = () => (
    <View>
      {/* App Header */}
      <View style={[styles.header, { backgroundColor: colors.navy, paddingTop: topPad + 12 }]}>
        <View style={[styles.goldAccent, { backgroundColor: colors.gold }]} />
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.appTitle, { color: colors.gold, fontFamily: 'Inter_700Bold' }]}>
              Shabdkosh
            </Text>
            <Text style={[styles.appSubtitle, { color: '#FFFFFF', fontFamily: 'Inter_400Regular', opacity: 0.75 }]}>
              English — Hindi Dictionary
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.statsBtn, { backgroundColor: colors.gold + '20', borderColor: colors.gold + '40' }]}
            onPress={() => router.push('/quiz')}
          >
            <Feather name="zap" size={18} color={colors.gold} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={query}
            onChangeText={handleSearch}
            onClear={() => handleSearch('')}
          />
        </View>
      </View>

      {!hasSearched && (
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          {/* Word of the Day */}
          <View style={[styles.wotdCard, { backgroundColor: colors.navy }]}>
            <View style={styles.wotdHeader}>
              <View style={[styles.wotdBadge, { backgroundColor: colors.gold }]}>
                <Text style={[styles.wotdBadgeText, { fontFamily: 'Inter_700Bold' }]}>Word of the Day</Text>
              </View>
              <Feather name="sun" size={18} color={colors.gold} />
            </View>
            <TouchableOpacity onPress={() => handleWordPress(wordOfDay)} activeOpacity={0.85}>
              <Text style={[styles.wotdWord, { color: '#FFFFFF', fontFamily: 'Inter_700Bold' }]}>
                {wordOfDay.word}
              </Text>
              <Text style={[styles.wotdHindi, { color: colors.gold, fontFamily: 'Inter_700Bold' }]}>
                {wordOfDay.hindi}
              </Text>
              <Text style={[styles.wotdDef, { color: '#FFFFFF', fontFamily: 'Inter_400Regular', opacity: 0.8 }]}>
                {wordOfDay.definition}
              </Text>
              <View style={[styles.wotdCta, { borderColor: colors.gold + '50' }]}>
                <Text style={[styles.wotdCtaText, { color: colors.gold, fontFamily: 'Inter_500Medium' }]}>
                  View Full Entry
                </Text>
                <Feather name="arrow-right" size={14} color={colors.gold} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Recent Words */}
          {recentWords.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                Recent
              </Text>
              {recentWords.slice(0, 3).map((entry) => (
                <WordCard
                  key={entry.word}
                  entry={entry}
                  compact
                  onPress={() => handleWordPress(entry)}
                />
              ))}
            </View>
          )}

          {/* Quick Browse */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              Browse by Difficulty
            </Text>
            <View style={styles.pillRow}>
              {[
                { label: 'Basic', color: '#22c55e', route: 'basic' },
                { label: 'Intermediate', color: '#f59e0b', route: 'intermediate' },
                { label: 'Advanced', color: '#ef4444', route: 'advanced' },
              ].map((d) => (
                <TouchableOpacity
                  key={d.label}
                  style={[styles.pill, { backgroundColor: d.color + '15', borderColor: d.color }]}
                  onPress={() => router.push({ pathname: '/browse', params: { filter: d.route } })}
                >
                  <Text style={[styles.pillText, { color: d.color, fontFamily: 'Inter_600SemiBold' }]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );

  if (hasSearched) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <FlatList
          data={results}
          keyExtractor={(item) => item.word}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 16 }}>
              <WordCard entry={item} compact onPress={() => handleWordPress(item)} />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="search" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                No words found for "{query}"
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 80 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <FlatList
        data={[]}
        ListHeaderComponent={renderHeader}
        renderItem={null}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 80 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  goldAccent: { width: 40, height: 3, borderRadius: 2, marginBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  appTitle: { fontSize: 30, letterSpacing: 1 },
  appSubtitle: { fontSize: 13, marginTop: 2, letterSpacing: 0.5 },
  statsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {},
  content: { paddingHorizontal: 16, paddingTop: 16 },
  wotdCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  wotdHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  wotdBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  wotdBadgeText: { fontSize: 11, color: '#0D1117' },
  wotdWord: { fontSize: 32, marginBottom: 4 },
  wotdHindi: { fontSize: 22, marginBottom: 8 },
  wotdDef: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  wotdCta: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, paddingTop: 12 },
  wotdCtaText: { fontSize: 13 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, marginBottom: 12 },
  pillRow: { flexDirection: 'row', gap: 10 },
  pill: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  pillText: { fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, textAlign: 'center' },
});
