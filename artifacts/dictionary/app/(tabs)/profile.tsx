import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { fonts } from '@/utils/fonts';

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground, fontFamily: fonts.bold }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>{label}</Text>
    </View>
  );
}

function MenuRow({ icon, label, value, onPress, danger }: { icon: string; label: string; value?: string; onPress?: () => void; danger?: boolean }) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.menuRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.menuIconBox, { backgroundColor: (danger ? '#ef4444' : colors.gold) + '15' }]}>
        <Feather name={icon as any} size={18} color={danger ? '#ef4444' : colors.gold} />
      </View>
      <Text style={[styles.menuLabel, { color: danger ? '#ef4444' : colors.foreground, fontFamily: fonts.regular }]}>
        {label}
      </Text>
      {value && (
        <Text style={[styles.menuValue, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>{value}</Text>
      )}
      {onPress && !danger && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favorites, recentWords, quizScore } = useApp();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const [notifications, setNotifications] = useState(true);
  const [hindiFirst, setHindiFirst] = useState(false);

  const totalWordsViewed = recentWords.length;
  const level = quizScore < 10 ? 'Beginner' : quizScore < 30 ? 'Learner' : quizScore < 60 ? 'Scholar' : 'Master';
  const levelColor = quizScore < 10 ? '#60a5fa' : quizScore < 30 ? '#22c55e' : quizScore < 60 ? '#f59e0b' : colors.gold;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.navy, paddingTop: topPad + 12 }]}>
        <View style={[styles.accent, { backgroundColor: colors.gold }]} />
        <Text style={[styles.title, { color: colors.gold, fontFamily: fonts.bold }]}>Profile</Text>
        <Text style={[styles.subtitle, { color: '#FFFFFF', fontFamily: fonts.regular, opacity: 0.7 }]}>
          Your learning journey
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Platform.OS === 'web' ? 100 : insets.bottom + 100 }
        ]}
      >
        {/* Avatar + name */}
        <View style={[styles.avatarSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.navy, borderColor: colors.gold }]}>
            <Text style={[styles.avatarEmoji, { fontFamily: fonts.bold }]}>शब्द</Text>
          </View>
          <Text style={[styles.userName, { color: colors.foreground, fontFamily: fonts.bold }]}>
            Shabdkosh Learner
          </Text>
          <View style={[styles.levelBadge, { backgroundColor: levelColor + '20', borderColor: levelColor }]}>
            <Feather name="award" size={13} color={levelColor} />
            <Text style={[styles.levelText, { color: levelColor, fontFamily: fonts.bold }]}>{level}</Text>
          </View>
          <Text style={[styles.levelHint, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
            {quizScore < 10 ? `Score ${10 - quizScore} more to become Learner` :
              quizScore < 30 ? `Score ${30 - quizScore} more to become Scholar` :
              quizScore < 60 ? `Score ${60 - quizScore} more to become Master` :
              'You have reached the highest level!'}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard label="Quiz Score" value={quizScore} icon="zap" color={colors.gold} />
          <StatCard label="Saved Words" value={favorites.length} icon="bookmark" color="#22c55e" />
          <StatCard label="Words Explored" value={totalWordsViewed} icon="search" color="#60a5fa" />
          <StatCard label="Level" value={level} icon="award" color={levelColor} />
        </View>

        {/* Progress bar */}
        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.foreground, fontFamily: fonts.semiBold }]}>
              Quiz Progress
            </Text>
            <Text style={[styles.progressScore, { color: colors.gold, fontFamily: fonts.bold }]}>
              {quizScore} pts
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: levelColor, width: `${Math.min((quizScore / 60) * 100, 100)}%` as any }
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            {['0', 'Beginner', 'Learner', 'Scholar', 'Master'].map((l, i) => (
              <Text key={i} style={[styles.progressLabel, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
                {l}
              </Text>
            ))}
          </View>
        </View>

        {/* Preferences */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: fonts.semiBold }]}>
            PREFERENCES
          </Text>
          <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.menuIconBox, { backgroundColor: colors.gold + '15' }]}>
              <Feather name="bell" size={18} color={colors.gold} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.foreground, fontFamily: fonts.regular }]}>
              Daily Word Reminder
            </Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.muted, true: colors.gold + '60' }}
              thumbColor={notifications ? colors.gold : colors.mutedForeground}
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={[styles.menuIconBox, { backgroundColor: colors.gold + '15' }]}>
              <Feather name="type" size={18} color={colors.gold} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.foreground, fontFamily: fonts.regular }]}>
              Show Hindi First
            </Text>
            <Switch
              value={hindiFirst}
              onValueChange={setHindiFirst}
              trackColor={{ false: colors.muted, true: colors.gold + '60' }}
              thumbColor={hindiFirst ? colors.gold : colors.mutedForeground}
            />
          </View>
        </View>

        {/* Quick links */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: fonts.semiBold }]}>
            QUICK ACCESS
          </Text>
          <MenuRow icon="bookmark" label="Saved Words" value={`${favorites.length} words`} onPress={() => router.push('/(tabs)/favorites')} />
          <MenuRow icon="zap" label="Vocabulary Quiz" onPress={() => router.push('/quiz')} />
          <MenuRow icon="list" label="Browse Dictionary" onPress={() => router.push('/browse')} />
        </View>

        {/* About */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: fonts.semiBold }]}>
            ABOUT
          </Text>
          <MenuRow icon="book-open" label="App Name" value="Shabdkosh" />
          <MenuRow icon="server" label="Dictionary" value="Free Dictionary API" />
          <MenuRow icon="globe" label="Translation" value="MyMemory API" />
          <MenuRow icon="info" label="Version" value="1.0.0" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  accent: { width: 36, height: 3, borderRadius: 2, marginBottom: 8 },
  title: { fontSize: 28, letterSpacing: 0.5 },
  subtitle: { fontSize: 13, marginTop: 2 },
  scroll: { padding: 16, gap: 14 },
  avatarSection: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarEmoji: { fontSize: 16, color: '#C9A84C' },
  userName: { fontSize: 20 },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  levelText: { fontSize: 13 },
  levelHint: { fontSize: 12, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    flex: 1,
    minWidth: '44%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  statIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 22 },
  statLabel: { fontSize: 11, textAlign: 'center' },
  progressCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressTitle: { fontSize: 15 },
  progressScore: { fontSize: 15 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 9 },
  section: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  sectionTitle: { fontSize: 11, letterSpacing: 1, padding: 14, paddingBottom: 8 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  menuIconBox: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 14 },
  menuValue: { fontSize: 13 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
});
