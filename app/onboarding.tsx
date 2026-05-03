import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, Dimensions, KeyboardAvoidingView, Platform,
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
type Gender = 'male' | 'female';

const GOALS: { id: Goal; label: string; icon: string; desc: string }[] = [
  { id: 'lose_weight',     label: 'Lose Weight',      icon: '🔥', desc: 'Burn fat and slim down' },
  { id: 'build_muscle',    label: 'Build Muscle',     icon: '💪', desc: 'Gain strength and mass' },
  { id: 'stay_active',     label: 'Stay Active',      icon: '⚡', desc: 'Keep moving and feeling good' },
  { id: 'improve_fitness', label: 'Improve Fitness',  icon: '🏃', desc: 'Boost endurance and performance' },
];

const LEVELS: { id: Level; label: string; desc: string }[] = [
  { id: 'beginner',     label: 'Beginner',     desc: 'New to training or returning after a break' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Training consistently for 6+ months' },
  { id: 'advanced',     label: 'Advanced',     desc: 'Years of structured training' },
];

const TOTAL_STEPS = 4;

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [saving, setSaving] = useState(false);

  const goNext = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStep(s => s + 1); };
  const goBack = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStep(s => s - 1); };

  const finish = async () => {
    if (!name.trim() || !gender || !goal || !level) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);
    try {
      await Promise.all([
        setSetting('onboardingComplete', 'true'),
        setSetting('userName', name.trim()),
        setSetting('userGender', gender),
        setSetting('userGoal', goal),
        setSetting('fitnessLevel', level),
      ]);
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    <NameStep   key="name"   name={name} onChange={setName} onNext={goNext} />,
    <GenderStep key="gender" selected={gender} onSelect={g => { Haptics.selectionAsync(); setGender(g); }} onNext={goNext} onBack={goBack} />,
    <GoalStep   key="goal"   selected={goal} onSelect={g => { Haptics.selectionAsync(); setGoal(g); }} onNext={goNext} onBack={goBack} />,
    <LevelStep  key="level"  selected={level} onSelect={l => { Haptics.selectionAsync(); setLevel(l); }} onFinish={finish} onBack={goBack} saving={saving} />,
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#0C0C14', '#14143A', '#0C0C14']} style={styles.gradient} locations={[0, 0.5, 1]}>
        <View style={styles.dots}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
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
        <Text style={styles.stepEmoji}>👋</Text>
        <Text style={styles.stepTitle}>What should we call you?</Text>
        <Text style={styles.stepSub}>We'll personalise your experience.</Text>
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
      <TouchableOpacity style={[styles.cta, !name.trim() && styles.ctaDisabled]} onPress={onNext} disabled={!name.trim()}>
        <Text style={styles.ctaText}>Continue</Text>
        <Ionicons name="arrow-forward" size={18} color={Colors.white} />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

function GenderStep({ selected, onSelect, onNext, onBack }: {
  selected: Gender | null; onSelect: (g: Gender) => void; onNext: () => void; onBack: () => void;
}) {
  const cards: { id: Gender; label: string; icon: string; desc: string }[] = [
    { id: 'male',   label: 'Male',   icon: '♂', desc: 'Male body model & metrics' },
    { id: 'female', label: 'Female', icon: '♀', desc: 'Female body model & metrics' },
  ];
  return (
    <View style={styles.step}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.subtext} />
      </TouchableOpacity>
      <View style={styles.stepContent}>
        <Text style={styles.stepEmoji}>🧬</Text>
        <Text style={styles.stepTitle}>Select your body</Text>
        <Text style={styles.stepSub}>This determines which body model and body composition metrics we use for you.</Text>
        <View style={styles.genderRow}>
          {cards.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.genderCard, selected === c.id && styles.genderCardActive]}
              onPress={() => onSelect(c.id)}
            >
              <Text style={[styles.genderIcon, selected === c.id && { color: Colors.accentLight }]}>{c.icon}</Text>
              <Text style={[styles.genderLabel, selected === c.id && { color: Colors.accentLight }]}>{c.label}</Text>
              <Text style={styles.genderDesc}>{c.desc}</Text>
              {selected === c.id && (
                <View style={styles.genderCheck}>
                  <Ionicons name="checkmark" size={12} color={Colors.white} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity style={[styles.cta, !selected && styles.ctaDisabled]} onPress={onNext} disabled={!selected}>
        <Text style={styles.ctaText}>Continue</Text>
        <Ionicons name="arrow-forward" size={18} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

function GoalStep({ selected, onSelect, onNext, onBack }: {
  selected: Goal | null; onSelect: (g: Goal) => void; onNext: () => void; onBack: () => void;
}) {
  return (
    <View style={styles.step}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.subtext} />
      </TouchableOpacity>
      <View style={styles.stepContent}>
        <Text style={styles.stepEmoji}>🎯</Text>
        <Text style={styles.stepTitle}>What's your main goal?</Text>
        <Text style={styles.stepSub}>This helps us tailor your exercise recommendations.</Text>
        <View style={styles.optionList}>
          {GOALS.map(g => (
            <TouchableOpacity
              key={g.id}
              style={[styles.optionCard, selected === g.id && styles.optionCardActive]}
              onPress={() => onSelect(g.id)}
            >
              <Text style={styles.optionIcon}>{g.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionLabel, selected === g.id && styles.optionLabelActive]}>{g.label}</Text>
                <Text style={styles.optionDesc}>{g.desc}</Text>
              </View>
              {selected === g.id && <Ionicons name="checkmark-circle" size={22} color={Colors.accent} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity style={[styles.cta, !selected && styles.ctaDisabled]} onPress={onNext} disabled={!selected}>
        <Text style={styles.ctaText}>Continue</Text>
        <Ionicons name="arrow-forward" size={18} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

function LevelStep({ selected, onSelect, onFinish, onBack, saving }: {
  selected: Level | null; onSelect: (l: Level) => void; onFinish: () => void; onBack: () => void; saving: boolean;
}) {
  return (
    <View style={styles.step}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.subtext} />
      </TouchableOpacity>
      <View style={styles.stepContent}>
        <Text style={styles.stepEmoji}>🏋️</Text>
        <Text style={styles.stepTitle}>Your experience level?</Text>
        <Text style={styles.stepSub}>Sets your default exercise difficulty. You can change it anytime.</Text>
        <View style={styles.optionList}>
          {LEVELS.map(l => (
            <TouchableOpacity
              key={l.id}
              style={[styles.optionCard, selected === l.id && styles.optionCardActive]}
              onPress={() => onSelect(l.id)}
            >
              <View style={[styles.levelDot, selected === l.id && styles.levelDotActive]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionLabel, selected === l.id && styles.optionLabelActive]}>{l.label}</Text>
                <Text style={styles.optionDesc}>{l.desc}</Text>
              </View>
              {selected === l.id && <Ionicons name="checkmark-circle" size={22} color={Colors.accent} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.cta, (!selected || saving) && styles.ctaDisabled]}
        onPress={onFinish}
        disabled={!selected || saving}
      >
        <Text style={styles.ctaText}>{saving ? 'Setting up...' : "Let's Go!"}</Text>
        <Ionicons name="fitness" size={18} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  gradient: { flex: 1 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 16, paddingBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.accent, width: 24 },
  step: { flex: 1, paddingHorizontal: 24 },
  backBtn: { paddingVertical: 8, paddingRight: 16, alignSelf: 'flex-start' },
  stepContent: { flex: 1, justifyContent: 'center' },
  stepEmoji: { fontSize: 52, textAlign: 'center', marginBottom: 16 },
  stepTitle: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center', letterSpacing: -0.5, marginBottom: 10 },
  stepSub: { fontSize: 15, color: Colors.subtext, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  nameInput: {
    backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.border,
    color: Colors.text, fontSize: 22, fontWeight: '600', paddingHorizontal: 20, paddingVertical: 18, textAlign: 'center',
  },
  // Gender step
  genderRow: { flexDirection: 'row', gap: 14 },
  genderCard: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border,
    padding: 24, alignItems: 'center', gap: 8, position: 'relative',
  },
  genderCardActive: { borderColor: Colors.accent, backgroundColor: Colors.accentDim },
  genderIcon: { fontSize: 44, color: Colors.subtext },
  genderLabel: { fontSize: 18, fontWeight: '800', color: Colors.text },
  genderDesc: { fontSize: 11, color: Colors.subtext, textAlign: 'center' },
  genderCheck: {
    position: 'absolute', top: 10, right: 10,
    width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  // Option cards (goal + level)
  optionList: { gap: 12 },
  optionCard: {
    backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.border,
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  optionCardActive: { borderColor: Colors.accent, backgroundColor: Colors.accentDim },
  optionIcon: { fontSize: 26 },
  optionLabel: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  optionLabelActive: { color: Colors.accentLight },
  optionDesc: { fontSize: 12, color: Colors.subtext },
  levelDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.border },
  levelDotActive: { backgroundColor: Colors.accent },
  // CTA
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.accent, borderRadius: 16, paddingVertical: 18, marginBottom: 24, marginTop: 16,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { fontSize: 17, fontWeight: '700', color: Colors.white },
});
