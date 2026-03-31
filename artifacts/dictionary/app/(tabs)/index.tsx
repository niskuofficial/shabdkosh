import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import SearchBar from '@/components/SearchBar';
import WordCard from '@/components/WordCard';
import ApiWordCard from '@/components/ApiWordCard';
import { searchWords, getWordOfDay, DictionaryEntry } from '@/data/dictionary';
import { lookupWord, ApiWordEntry } from '@/utils/dictionaryApi';
import { fonts } from '@/utils/fonts';

type SearchState = 'idle' | 'local' | 'loading' | 'api' | 'empty';
type ListItem =
  | { type: 'local'; data: DictionaryEntry }
  | { type: 'api'; data: ApiWordEntry };

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addToRecent, recentWords } = useApp();

  const [query, setQuery] = useState('');
  const [localResults, setLocalResults] = useState<DictionaryEntry[]>([]);
  const [apiResults, setApiResults] = useState<ApiWordEntry[]>([]);
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wordOfDay = getWordOfDay();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleSearch = useCallback((text: string) => {
    setQuery(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setLocalResults([]);
      setApiResults([]);
      setSearchState('idle');
      return;
    }

    const local = searchWords(text);
    setLocalResults(local);
    setSearchState(local.length > 0 ? 'local' : 'loading');

    debounceRef.current = setTimeout(async () => {
      const trimmed = text.trim();
      if (trimmed.includes(' ') || trimmed.length < 2) {
        if (local.length === 0) setSearchState('empty');
        return;
      }
      setSearchState('loading');
      const results = await lookupWord(trimmed);
      if (results && results.length > 0) {
        setApiResults(results);
        setSearchState('api');
      } else {
        setApiResults([]);
        setSearchState(local.length > 0 ? 'local' : 'empty');
      }
    }, 800);
  }, []);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleWordPress = (entry: DictionaryEntry) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addToRecent(entry);
    router.push({ pathname: '/word', params: { word: entry.word } });
  };

  const handleApiWordPress = (entry: ApiWordEntry) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/word', params: { word: entry.word, fromApi: '1' } });
  };

  // Build a single flat data list — avoids FlatList swap that kills keyboard
  const listData: ListItem[] = useMemo(() => {
    if (searchState === 'api' && apiResults.length > 0) {
      return apiResults.map(d => ({ type: 'api' as const, data: d }));
    }
    if (searchState === 'local' && localResults.length > 0) {
      return localResults.map(d => ({ type: 'local' as const, data: d }));
    }
    return [];
  }, [searchState, apiResults, localResults]);

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'api') {
      return (
        <View style={{ paddingHorizontal: 16 }}>
          <ApiWordCard entry={item.data} onPress={() => handleApiWordPress(item.data)} />
        </View>
      );
    }
    return (
      <View style={{ paddingHorizontal: 16 }}>
        <WordCard entry={item.data} compact onPress={() => handleWordPress(item.data)} />
      </View>
    );
  }, []);

  const ListHeader = useMemo(() => (
    <View>
      {/* App Header */}
      <View style={[styles.header, { backgroundColor: colors.navy, paddingTop: topPad + 12 }]}>
        <View style={[styles.goldAccent, { backgroundColor: colors.gold }]} />
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.appTitle, { color: colors.gold, fontFamily: fonts.bold }]}>
              Shabdkosh
            </Text>
            <Text style={[styles.appSubtitle, { color: '#FFFFFF', fontFamily: fonts.regular, opacity: 0.75 }]}>
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
        <SearchBar
          value={query}
          onChangeText={handleSearch}
          onClear={() => handleSearch('')}
        />
      </View>

      {/* Home content — only shown when not searching */}
      {searchState === 'idle' && (
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={[styles.wotdCard, { backgroundColor: colors.navy }]}>
            <View style={styles.wotdHeader}>
              <View style={[styles.wotdBadge, { backgroundColor: colors.gold }]}>
                <Text style={[styles.wotdBadgeText, { color: '#0D1117', fontFamily: fonts.bold }]}>
                  Word of the Day
                </Text>
              </View>
              <Feather name="sun" size={18} color={colors.gold} />
            </View>
            <TouchableOpacity onPress={() => handleWordPress(wordOfDay)} activeOpacity={0.85}>
              <Text style={[styles.wotdWord, { color: '#FFFFFF', fontFamily: fonts.bold }]}>{wordOfDay.word}</Text>
              <Text style={[styles.wotdHindi, { color: colors.gold, fontFamily: fonts.bold }]}>{wordOfDay.hindi}</Text>
              <Text style={[styles.wotdDef, { color: '#FFFFFF', fontFamily: fonts.regular, opacity: 0.8 }]}>{wordOfDay.definition}</Text>
              <View style={[styles.wotdCta, { borderColor: colors.gold + '50' }]}>
                <Text style={[styles.wotdCtaText, { color: colors.gold, fontFamily: fonts.medium }]}>View Full Entry</Text>
                <Feather name="arrow-right" size={14} color={colors.gold} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.tipCard, { backgroundColor: colors.goldLight, borderColor: colors.gold + '40' }]}>
            <Feather name="globe" size={16} color={colors.goldDark} />
            <Text style={[styles.tipText, { color: colors.goldDark, fontFamily: fonts.regular }]}>
              Type any English word — live results from the internet dictionary
            </Text>
          </View>

          {recentWords.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fonts.semiBold }]}>Recent</Text>
              {recentWords.slice(0, 3).map((entry) => (
                <WordCard key={entry.word} entry={entry} compact onPress={() => handleWordPress(entry)} />
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fonts.semiBold }]}>Browse by Difficulty</Text>
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
                  <Text style={[styles.pillText, { color: d.color, fontFamily: fonts.semiBold }]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Search status bar */}
      {searchState !== 'idle' && (
        <View style={[styles.statusBar, { backgroundColor: colors.background }]}>
          {searchState === 'loading' && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.gold} />
              <Text style={[styles.loadingText, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
                Searching...
              </Text>
            </View>
          )}
          {searchState === 'api' && (
            <View style={[styles.sourceBadge, { backgroundColor: colors.gold + '20', borderColor: colors.gold }]}>
              <Feather name="globe" size={11} color={colors.gold} />
              <Text style={[styles.sourceText, { color: colors.gold, fontFamily: fonts.semiBold }]}>
                Live — {query}
              </Text>
            </View>
          )}
          {searchState === 'local' && (
            <Text style={[styles.resultCount, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
              {localResults.length} match{localResults.length !== 1 ? 'es' : ''}
            </Text>
          )}
          {searchState === 'empty' && (
            <Text style={[styles.resultCount, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
              No results for "{query}"
            </Text>
          )}
        </View>
      )}
    </View>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [query, searchState, localResults.length, recentWords.length, colors]);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <FlatList
        data={listData}
        keyExtractor={(item, i) =>
          item.type === 'local' ? item.data.word : `api-${item.data.word}-${item.data.partOfSpeech}-${i}`
        }
        ListHeaderComponent={ListHeader}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 80 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  goldAccent: { width: 40, height: 3, borderRadius: 2, marginBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  appTitle: { fontSize: 30, letterSpacing: 1 },
  appSubtitle: { fontSize: 13, marginTop: 2, letterSpacing: 0.5 },
  statsBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  wotdCard: { borderRadius: 20, padding: 20, marginBottom: 14 },
  wotdHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  wotdBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  wotdBadgeText: { fontSize: 11 },
  wotdWord: { fontSize: 32, marginBottom: 4 },
  wotdHindi: { fontSize: 22, marginBottom: 8 },
  wotdDef: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  wotdCta: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, paddingTop: 12 },
  wotdCtaText: { fontSize: 13 },
  tipCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  tipText: { flex: 1, fontSize: 13, lineHeight: 18 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, marginBottom: 12 },
  pillRow: { flexDirection: 'row', gap: 10 },
  pill: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  pillText: { fontSize: 12 },
  statusBar: { paddingHorizontal: 16, paddingVertical: 10 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 13 },
  sourceBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  sourceText: { fontSize: 12 },
  resultCount: { fontSize: 13 },
});
