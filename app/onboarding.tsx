import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, Dimensions, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { setSetting } from '@/lib/database';

const { width } = Dimensions.get('window');

type Goal = 'lose_weight' | 'build_muscle' | 'stay_active' | 'improve_fitness';
type Level = 'beginner' | 'intermediate' | 'advanced';

const GOALS: { id: Goal; label: string; emoji: string; desc: string }[] = [
  { id: 'lose_weight',     label: 'Lose Weight',      emoji: '🔥', desc: 'Burn fat and slim down' },
  { id: 'build_muscle',    label: 'Build Muscle',     emoji: '💪', desc: 'Gain strength and mass' },
  { id: 'stay_active',     label: 'Stay Active',      emoji: '⚡', desc: 'Keep moving and feeling good' },
  { id: 'improve_fitness', label: 'Improve Fitness',  emoji: '🏃', desc: 'Boost endurance and performance' },
];

const LEVELS: { id: Level; label: string; desc: string }[] = [
  { id: 'beginner',     label: 'Beginner',     desc: 'New to training or returning after a break' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Training consistently for 6+ months' },
  { id: 'advanced',     label: 'Advanced',     desc: 'Years of structured training' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [saving, setSaving] = useState(false);

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s => s + 1);
  };
  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s => s - 1);
  };

  const finish = async () => {
    if (!name.trim() || !goal || !level) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);
    try {
      await Promise.all([
        setSetting('onboardingComplete', 'true'),
        setSetting('userName', name.trim()),
        setSetting('userGoal', goal),
        setSetting('fitnessLevel', level),
      ]);
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    <NameStep key="name" name={name} onChange={setName} onNext={goNext} />,
    <GoalStep key="goal" selected={goal} onSelect={g => { Haptics.selectionAsync(); setGoal(g); }} onNext={goNext} onBack={goBack} />,
    <LevelStep key="level" selected={level} onSelect={l => { Haptics.selectionAsync(); setLevel(l); }} onFinish={finish} onBack={goBack} saving={saving} />,
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#0C0C14', '#14143A', '#0C0C14']} style={styles.gradient} locations={[0, 0.5, 1]}>
        {/* Progress dots */}
        <View style={styles.dots}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.dot, step >= i && styles.dotActive]} />
          ))}
        </View>

        {steps[step]}
      </LinearGradient>
    </SafeAreaView>
  );
}

function NameStep({ name, onChange, onNext }: { name: string; onChange: (s: string) => void; onNext: () => void }) {
  return (
    <KeyboardAvoidingView style={styles.step} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.stepContent}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.stepTitle}>What should we call you?</Text>
        <Text style={styles.stepSubtitle}>We'll personalise your experience based on your name.</Text>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={onChange}
          placeholder="Your first name"
          placeholderTextColor={Colors.muted}
          autoFocus
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => name.trim() && onNext()}
          selectionColor={Colors.accent}
        />
      </View>
      <TouchableOpacity
        style={[styles.nextBtn, !name.trim() && styles.nextBtnDisabled]}
        onPress={onNext}
        disabled={!name.trim()}
      >
        <Text style={styles.nextBtnText}>Continue</Text>
        <Ionicons name="arrow-forward" size={18} color={Colors.white} />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

function GoalStep({ selected, onSelect, onNext, onBack }: {
  selected: Goal | null;
  onSelect: (g: Goal) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.step}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.subtext} />
      </TouchableOpacity>
      <View style={styles.stepContent}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.stepTitle}>What's your main goal?</Text>
        <Text style={styles.stepSubtitle}>This helps us tailor your exercise recommendations.</Text>
        <View style={styles.optionGrid}>
          {GOALS.map(g => (
            <TouchableOpacity
              key={g.id}
              style={[styles.optionCard, selected === g.id && styles.optionCardActive]}
              onPress={() => onSelect(g.id)}
            >
              <Text style={styles.optionEmoji}>{g.emoji}</Text>
              <Text style={[styles.optionLabel, selected === g.id && styles.optionLabelActive]}>{g.label}</Text>
              <Text style={styles.optionDesc}>{g.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
        onPress={onNext}
        disabled={!selected}
      >
        <Text style={styles.nextBtnText}>Continue</Text>
        <Ionicons name="arrow-forward" size={18} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

function LevelStep({ selected, onSelect, onFinish, onBack, saving }: {
  selected: Level | null;
  onSelect: (l: Level) => void;
  onFinish: () => void;
  onBack: () => void;
  saving: boolean;
}) {
  return (
    <View style={styles.step}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.subtext} />
      </TouchableOpacity>
      <View style={styles.stepContent}>
        <Text style={styles.emoji}>🏋️</Text>
        <Text style={styles.stepTitle}>Your experience level?</Text>
        <Text style={styles.stepSubtitle}>This sets the default exercise difficulty across the app. You can always change it.</Text>
        <View style={styles.levelList}>
          {LEVELS.map(l => (
            <TouchableOpacity
              key={l.id}
              style={[styles.levelCard, selected === l.id && styles.levelCardActive]}
              onPress={() => onSelect(l.id)}
            >
              <View style={styles.levelLeft}>
                <View style={[styles.levelDot, selected === l.id && styles.levelDotActive]} />
                <View>
                  <Text style={[styles.levelLabel, selected === l.id && styles.levelLabelActive]}>{l.label}</Text>
                  <Text style={styles.levelDesc}>{l.desc}</Text>
                </View>
              </View>
              {selected === l.id && <Ionicons name="checkmark-circle" size={22} color={Colors.accent} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.nextBtn, (!selected || saving) && styles.nextBtnDisabled]}
        onPress={onFinish}
        disabled={!selected || saving}
      >
        <Text style={styles.nextBtnText}>{saving ? 'Setting up...' : "Let's Go!"}</Text>
        <Ionicons name="fitness" size={18} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  gradient: { flex: 1 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: { backgroundColor: Colors.accent, width: 24 },
  step: { flex: 1, paddingHorizontal: 24 },
  backBtn: { paddingVertical: 8, paddingRight: 16, alignSelf: 'flex-start' },
  stepContent: { flex: 1, justifyContent: 'center' },
  emoji: { fontSize: 52, textAlign: 'center', marginBottom: 16 },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 15,
    color: Colors.subtext,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  nameInput: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 22,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 18,
    textAlign: 'center',
  },
  optionGrid: { gap: 12 },
  optionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  optionEmoji: { fontSize: 26 },
  optionLabel: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  optionLabelActive: { color: Colors.accentLight },
  optionDesc: { fontSize: 12, color: Colors.subtext },
  levelList: { gap: 12 },
  levelCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelCardActive: { borderColor: Colors.accent, backgroundColor: Colors.accentDim },
  levelLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  levelDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.border },
  levelDotActive: { backgroundColor: Colors.accent },
  levelLabel: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 3 },
  levelLabelActive: { color: Colors.accentLight },
  levelDesc: { fontSize: 12, color: Colors.subtext, paddingRight: 8 },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 24,
    marginTop: 16,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: Colors.white },
});
