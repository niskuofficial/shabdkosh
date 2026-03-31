import React from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import WordCard from '@/components/WordCard';
import GoldHeader from '@/components/GoldHeader';
import { fonts } from '@/utils/fonts';

export default function FavoritesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favorites, addToRecent } = useApp();

  const handleWordPress = (word: any) => {
    addToRecent(word);
    router.push({ pathname: '/word', params: { word: word.word } });
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <GoldHeader
        title="Saved Words"
        subtitle={`${favorites.length} word${favorites.length !== 1 ? 's' : ''} saved`}
      />
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.word}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <WordCard entry={item} onPress={() => handleWordPress(item)} />
          </View>
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 80 }
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bookmark" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: fonts.semiBold }]}>
              No saved words yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
              Bookmark words while browsing to save them here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingTop: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
