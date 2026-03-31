import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { fonts } from '@/utils/fonts';

type LangPair = 'en|hi' | 'hi|en';

function isHindiText(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

async function translateText(text: string, langpair: LangPair): Promise<string> {
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`
  );
  if (!res.ok) throw new Error('Translation failed');
  const data = await res.json();
  return data?.responseData?.translatedText ?? '';
}

export default function TranslateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [direction, setDirection] = useState<LangPair>('en|hi');
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fromLang = direction === 'en|hi' ? 'English' : 'Hindi';
  const toLang = direction === 'en|hi' ? 'Hindi' : 'English';

  const handleInput = (text: string) => {
    setInputText(text);
    setError('');

    // Auto-detect script and switch direction
    if (text.length > 0) {
      const detectedHindi = isHindiText(text);
      const newDir: LangPair = detectedHindi ? 'hi|en' : 'en|hi';
      if (newDir !== direction) setDirection(newDir);
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) { setOutputText(''); return; }

    debounceRef.current = setTimeout(() => doTranslate(text, direction), 800);
  };

  const doTranslate = async (text: string, dir: LangPair) => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await translateText(text.trim(), dir);
      setOutputText(result);
    } catch {
      setError('Translation failed. Please check your connection.');
      setOutputText('');
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newDir: LangPair = direction === 'en|hi' ? 'hi|en' : 'en|hi';
    setDirection(newDir);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const copyOutput = () => {
    if (!outputText) return;
    Clipboard.setString(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setError('');
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.navy, paddingTop: topPad + 12 }]}>
        <View style={[styles.accent, { backgroundColor: colors.gold }]} />
        <Text style={[styles.title, { color: colors.gold, fontFamily: fonts.bold }]}>Translate</Text>
        <Text style={[styles.subtitle, { color: '#FFFFFF', fontFamily: fonts.regular, opacity: 0.7 }]}>
          English ↔ Hindi
        </Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === 'web' ? 100 : insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Direction indicator */}
        <View style={[styles.dirRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.langBox}>
            <Text style={[styles.langLabel, { color: colors.gold, fontFamily: fonts.bold }]}>{fromLang}</Text>
            <Text style={[styles.langSub, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
              {direction === 'en|hi' ? 'English' : 'हिन्दी'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.swapBtn, { backgroundColor: colors.gold + '20', borderColor: colors.gold + '50' }]}
            onPress={swapLanguages}
          >
            <Feather name="repeat" size={18} color={colors.gold} />
          </TouchableOpacity>

          <View style={[styles.langBox, styles.langBoxRight]}>
            <Text style={[styles.langLabel, { color: colors.foreground, fontFamily: fonts.bold }]}>{toLang}</Text>
            <Text style={[styles.langSub, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
              {direction === 'en|hi' ? 'हिन्दी' : 'English'}
            </Text>
          </View>
        </View>

        {/* Input box */}
        <View style={[styles.box, { backgroundColor: colors.card, borderColor: colors.gold + '60' }]}>
          <View style={styles.boxHeader}>
            <Text style={[styles.boxLang, { color: colors.gold, fontFamily: fonts.semiBold }]}>{fromLang}</Text>
            {inputText.length > 0 && (
              <TouchableOpacity onPress={clearAll} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x-circle" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={[styles.textInput, { color: colors.foreground, fontFamily: fonts.regular }]}
            value={inputText}
            onChangeText={handleInput}
            placeholder={direction === 'en|hi' ? 'Type English text here...' : 'हिंदी में लिखें...'}
            placeholderTextColor={colors.mutedForeground}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
            {inputText.length} chars
          </Text>
        </View>

        {/* Output box */}
        <View style={[styles.box, { backgroundColor: colors.navy, borderColor: colors.border }]}>
          <View style={styles.boxHeader}>
            <Text style={[styles.boxLang, { color: colors.gold, fontFamily: fonts.semiBold }]}>{toLang}</Text>
            <TouchableOpacity
              onPress={copyOutput}
              disabled={!outputText}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name={copied ? 'check' : 'copy'} size={18} color={outputText ? colors.gold : colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.gold} />
              <Text style={[styles.loadingText, { color: colors.mutedForeground, fontFamily: fonts.regular }]}>
                Translating...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={20} color="#ef4444" />
              <Text style={[styles.errorText, { color: '#ef4444', fontFamily: fonts.regular }]}>{error}</Text>
            </View>
          ) : outputText ? (
            <Text style={[styles.outputText, { color: '#FFFFFF', fontFamily: fonts.regular }]}>
              {outputText}
            </Text>
          ) : (
            <Text style={[styles.placeholder, { color: '#FFFFFF', fontFamily: fonts.regular, opacity: 0.3 }]}>
              {toLang === 'Hindi' ? 'अनुवाद यहाँ दिखेगा...' : 'Translation appears here...'}
            </Text>
          )}

          {copied && (
            <View style={[styles.copiedBadge, { backgroundColor: '#22c55e20', borderColor: '#22c55e' }]}>
              <Text style={[styles.copiedText, { color: '#22c55e', fontFamily: fonts.semiBold }]}>Copied!</Text>
            </View>
          )}
        </View>

        {/* Tip */}
        <View style={[styles.tip, { backgroundColor: colors.goldLight, borderColor: colors.gold + '40' }]}>
          <Feather name="zap" size={14} color={colors.goldDark} />
          <Text style={[styles.tipText, { color: colors.goldDark, fontFamily: fonts.regular }]}>
            Auto-detects language — type Hindi or English and it switches automatically
          </Text>
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
  dirRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  langBox: { flex: 1 },
  langBoxRight: { alignItems: 'flex-end' },
  langLabel: { fontSize: 15 },
  langSub: { fontSize: 11, marginTop: 2 },
  swapBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  box: { borderRadius: 16, borderWidth: 1.5, padding: 16 },
  boxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  boxLang: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  textInput: { fontSize: 18, lineHeight: 26, minHeight: 100, },
  charCount: { fontSize: 11, marginTop: 8, textAlign: 'right' },
  loadingBox: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 60, paddingVertical: 10 },
  loadingText: { fontSize: 14 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 60 },
  errorText: { fontSize: 14, flex: 1 },
  outputText: { fontSize: 20, lineHeight: 30, minHeight: 80 },
  placeholder: { fontSize: 18, lineHeight: 26, minHeight: 60 },
  copiedBadge: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  copiedText: { fontSize: 12 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
