import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Modal, Pressable, TextInput, Switch, Alert, ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import BodyModelSVG, { BodyView } from '@/components/muscle-map/BodyModelSVG';
import ExerciseModal from '@/components/muscle-map/ExerciseModal';
import { Exercise, Level, getExercisesForMuscle, getMuscleGroupName } from '@/lib/exercises';
import { useTrackerStore, TrackerState } from '@/store/useTrackerStore';
import { getSetting, setSetting } from '@/lib/database';
import { router } from 'expo-router';

export default function MuscleMapScreen() {
  const [view, setView] = useState<BodyView>('front');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [level, setLevel] = useState<Level>('beginner');
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const addWorkout = useTrackerStore((s: TrackerState) => s.addWorkout);

  // Load saved level preference
  useEffect(() => {
    getSetting('fitnessLevel').then(saved => {
      if (saved) setLevel(saved as Level);
    });
  }, []);

  const handleMusclePress = useCallback((muscleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMuscle(muscleId);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setSelectedMuscle(null), 300);
  }, []);

  const handleLevelChange = useCallback((newLevel: Level) => {
    Haptics.selectionAsync();
    setLevel(newLevel);
    setSetting('fitnessLevel', newLevel);
  }, []);

  const handleLogExercise = useCallback((exercise: Exercise) => {
    if (!selectedMuscle) return;
    setModalVisible(false);
    router.push({
      pathname: '/tracker',
      params: {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroup: selectedMuscle,
        defaultSets: exercise.sets,
        defaultReps: exercise.reps,
      },
    });
  }, [selectedMuscle]);

  const exercises = selectedMuscle ? getExercisesForMuscle(selectedMuscle, level) : [];

  const LEVEL_LABELS: Record<Level, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Muscle Map</Text>
            <Text style={styles.subtitle}>Tap a muscle to explore</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => setSettingsVisible(true)}>
            <Ionicons name="settings-outline" size={20} color={Colors.subtext} />
          </TouchableOpacity>
        </View>

        {/* Controls row */}
        <View style={styles.controlsRow}>
          {/* Front/Back toggle */}
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, view === 'front' && styles.toggleActive]}
              onPress={() => { Haptics.selectionAsync(); setView('front'); }}
            >
              <Text style={[styles.toggleText, view === 'front' && styles.toggleTextActive]}>Front</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, view === 'back' && styles.toggleActive]}
              onPress={() => { Haptics.selectionAsync(); setView('back'); }}
            >
              <Text style={[styles.toggleText, view === 'back' && styles.toggleTextActive]}>Back</Text>
            </TouchableOpacity>
          </View>

          {/* Level indicator */}
          <TouchableOpacity
            style={styles.levelChip}
            onPress={() => {
              const levels: Level[] = ['beginner', 'intermediate', 'advanced'];
              const next = levels[(levels.indexOf(level) + 1) % 3];
              handleLevelChange(next);
            }}
          >
            <Ionicons name="fitness-outline" size={14} color={Colors.accent} />
            <Text style={styles.levelChipText}>{LEVEL_LABELS[level]}</Text>
            <Ionicons name="swap-horizontal-outline" size={12} color={Colors.subtext} />
          </TouchableOpacity>
        </View>

        {/* Body Model with pinch-to-zoom */}
        <View style={styles.modelContainer}>
          <ScrollView
            style={styles.zoomScroll}
            contentContainerStyle={styles.zoomContent}
            maximumZoomScale={3}
            minimumZoomScale={1}
            centerContent
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            bouncesZoom
          >
            <BodyModelSVG
              view={view}
              selectedMuscle={selectedMuscle}
              onMusclePress={handleMusclePress}
            />
          </ScrollView>
        </View>

        {/* Bottom hint */}
        <View style={styles.hintBar}>
          {selectedMuscle ? (
            <Text style={styles.hintSelected}>{getMuscleGroupName(selectedMuscle)}</Text>
          ) : (
            <View style={styles.hintRow}>
              <Ionicons name="search-outline" size={13} color={Colors.muted} />
              <Text style={styles.hint}>Tap a muscle · Pinch to zoom</Text>
            </View>
          )}
        </View>

        {/* Exercise Modal */}
        {selectedMuscle && (
          <ExerciseModal
            visible={modalVisible}
            muscleId={selectedMuscle}
            exercises={exercises}
            selectedLevel={level}
            onClose={handleCloseModal}
            onLevelChange={handleLevelChange}
            onLogExercise={handleLogExercise}
          />
        )}

        {/* Settings Modal */}
        <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
      </View>
    </SafeAreaView>
  );
}

function SettingsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      getSetting('anthropicApiKey').then(k => setApiKey(k ?? ''));
    }
  }, [visible]);

  const save = async () => {
    setSaving(true);
    await setSetting('anthropicApiKey', apiKey.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(false);
    onClose();
    Alert.alert('Saved', 'Settings updated. Restart the app for the API key to take effect.');
  };

  const resetOnboarding = async () => {
    Alert.alert('Reset Onboarding', 'This will restart the onboarding flow next time the app opens. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive', onPress: async () => {
          await setSetting('onboardingComplete', '');
          onClose();
          router.replace('/onboarding');
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.settingsSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={Colors.subtext} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <SectionHead>AI Coach</SectionHead>
          <Text style={styles.settingDesc}>
            Enter your Anthropic API key to enable the AI fitness coach. Get one free at console.anthropic.com
          </Text>
          <View style={styles.apiKeyRow}>
            <TextInput
              style={styles.apiKeyInput}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="sk-ant-..."
              placeholderTextColor={Colors.muted}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
              selectionColor={Colors.accent}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowKey(s => !s)}>
              <Ionicons name={showKey ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.subtext} />
            </TouchableOpacity>
          </View>

          <SectionHead>Account</SectionHead>
          <TouchableOpacity style={styles.dangerBtn} onPress={resetOnboarding}>
            <Ionicons name="refresh-outline" size={16} color={Colors.danger} />
            <Text style={styles.dangerBtnText}>Redo onboarding</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveSettingsBtn, saving && { opacity: 0.6 }]}
            onPress={save}
            disabled={saving}
          >
            <Text style={styles.saveSettingsBtnText}>{saving ? 'Saving...' : 'Save Settings'}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionHead}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.subtext, marginTop: 2 },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 8,
    width: '100%',
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  toggleActive: { backgroundColor: Colors.accent },
  toggleText: { fontSize: 14, fontWeight: '600', color: Colors.subtext },
  toggleTextActive: { color: Colors.white },
  levelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.accentDim,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: Colors.accent + '60',
  },
  levelChipText: { fontSize: 13, fontWeight: '600', color: Colors.accentLight },
  modelContainer: { flex: 1, width: '100%' },
  zoomScroll: { flex: 1, width: '100%' },
  zoomContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  hintBar: { paddingBottom: 12, alignItems: 'center' },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  hint: { fontSize: 13, color: Colors.muted },
  hintSelected: { fontSize: 14, fontWeight: '700', color: Colors.accentLight },
  // Settings modal
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  settingsSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center',
  },
  sectionHead: {
    fontSize: 11, fontWeight: '700', color: Colors.subtext,
    letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 20, marginBottom: 10,
  },
  settingDesc: { fontSize: 13, color: Colors.subtext, lineHeight: 18, marginBottom: 10 },
  apiKeyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  apiKeyInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'monospace',
  },
  eyeBtn: { padding: 10 },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.danger + '15',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.danger + '40',
  },
  dangerBtnText: { fontSize: 14, fontWeight: '600', color: Colors.danger },
  saveSettingsBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveSettingsBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
