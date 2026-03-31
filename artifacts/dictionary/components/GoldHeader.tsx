import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

interface GoldHeaderProps {
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
}

export default function GoldHeader({ title, subtitle, rightComponent }: GoldHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top + 10;

  return (
    <View style={[styles.header, { backgroundColor: colors.navy, paddingTop: topPad }]}>
      <View style={[styles.accent, { backgroundColor: colors.gold }]} />
      <View style={styles.row}>
        <View style={styles.textGroup}>
          <Text style={[styles.title, { color: colors.gold, fontFamily: 'Inter_700Bold' }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.primaryForeground, fontFamily: 'Inter_400Regular', opacity: 0.7 }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightComponent && <View>{rightComponent}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  accent: {
    width: 36,
    height: 3,
    borderRadius: 2,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  textGroup: { flex: 1 },
  title: { fontSize: 28, letterSpacing: 0.5 },
  subtitle: { fontSize: 13, marginTop: 2 },
});
