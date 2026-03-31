import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { dictionaryData, DictionaryEntry } from '@/data/dictionary';
import { fonts } from '@/utils/fonts';

function getQuizQuestion(data: DictionaryEntry[]) {
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  const correct = shuffled[0];
  const options = [correct, shuffled[1], shuffled[2], shuffled[3]].sort(() => Math.random() - 0.5);
  return { correct, options };
}

export default function QuizScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { quizScore, incrementScore } = useApp();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const [{ correct, options }, setQuestion] = useState(() => getQuizQuestion(dictionaryData));
  const [selected, setSelected] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);

  const handleAnswer = useCallback((hindi: string) => {
    if (selected) return;
    if (Platform.OS !== 'web') {
      if (hindi === correct.hindi) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setSelected(hindi);
    setTotal(t => t + 1);
    if (hindi === correct.hindi) {
      incrementScore();
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  }, [selected, correct, incrementScore]);

  const nextQuestion = () => {
    setSelected(null);
    setQuestion(getQuizQuestion(dictionaryData));
  };

  const getOptionStyle = (hindi: string) => {
    if (!selected) return [styles.option, { backgroundColor: colors.card, borderColor: colors.border }];
    if (hindi === correct.hindi) return [styles.option, { backgroundColor: '#22c55e20', borderColor: '#22c55e' }];
    if (hindi === selected) return [styles.option, { backgroundColor: '#ef444420', borderColor: '#ef4444' }];
    return [styles.option, { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.5 }];
  };

  const getOptionTextColor = (hindi: string) => {
    if (!selected) return colors.foreground;
    if (hindi === correct.hindi) return '#22c55e';
    if (hindi === selected) return '#ef4444';
    return colors.mutedForeground;
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.navy, paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.gold + '20' }]}>
            <Feather name="arrow-left" size={20} color={colors.gold} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.gold, fontFamily: fonts.bold }]}>Vocab Quiz</Text>
          <View style={[styles.scoreBox, { backgroundColor: colors.gold }]}>
            <Text style={[styles.scoreText, { color: '#0D1117', fontFamily: fonts.bold }]}>{quizScore}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {streak > 1 && (
            <View style={[styles.streakBadge, { backgroundColor: '#f59e0b20', borderColor: '#f59e0b' }]}>
              <Text style={[styles.streakText, { color: '#f59e0b', fontFamily: fonts.bold }]}>
                {streak}x Streak!
              </Text>
            </View>
          )}
          <Text style={[styles.statText, { color: '#FFFFFF', fontFamily: fonts.regular, opacity: 0.7 }]}>
            {total > 0 ? `${quizScore}/${total} correct` : 'Pick the Hindi translation'}
          </Text>
        </View>
      </View>

      <View style={[styles.content, { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 40 }]}>
        {/* Question */}
        <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.questionLabel, { color: colors.mutedForeground, fontFamily: fonts.medium }]}>
            What is the Hindi translation of...
          </Text>
          <Text style={[styles.questionWord, { color: colors.foreground, fontFamily: fonts.bold }]}>
            {correct.word}
          </Text>
          {correct.pronunciation && (
            <Text style={[styles.questionPron, { color: colors.gold, fontFamily: fonts.regular }]}>
              /{correct.pronunciation}/
            </Text>
          )}
          <Text style={[styles.questionDef, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
            {correct.definition}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsGrid}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.word}
              style={getOptionStyle(opt.hindi)}
              onPress={() => handleAnswer(opt.hindi)}
              disabled={!!selected}
              activeOpacity={0.8}
            >
              {selected && opt.hindi === correct.hindi && (
                <Feather name="check-circle" size={18} color="#22c55e" style={styles.optionIcon} />
              )}
              {selected && opt.hindi === selected && opt.hindi !== correct.hindi && (
                <Feather name="x-circle" size={18} color="#ef4444" style={styles.optionIcon} />
              )}
              <Text style={[styles.optionText, { color: getOptionTextColor(opt.hindi), fontFamily: fonts.semiBold }]}>
                {opt.hindi}
              </Text>
              <Text style={[styles.optionSub, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
                {opt.hindiPronunciation}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Button */}
        {selected && (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: colors.gold }]}
            onPress={nextQuestion}
          >
            <Text style={[styles.nextBtnText, { color: '#0D1117', fontFamily: fonts.bold }]}>
              Next Question
            </Text>
            <Feather name="arrow-right" size={18} color="#0D1117" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22 },
  scoreBox: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  scoreText: { fontSize: 15 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  streakText: { fontSize: 12 },
  statText: { fontSize: 13 },
  content: { flex: 1, padding: 16 },
  questionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  questionLabel: { fontSize: 13, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  questionWord: { fontSize: 36, textAlign: 'center', marginBottom: 4 },
  questionPron: { fontSize: 14, fontStyle: 'italic', marginBottom: 8 },
  questionDef: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  optionsGrid: { gap: 10, marginBottom: 16 },
  option: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: { marginRight: 10 },
  optionText: { fontSize: 20, flex: 1 },
  optionSub: { fontSize: 12, fontStyle: 'italic' },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
  },
  nextBtnText: { fontSize: 16 },
});
