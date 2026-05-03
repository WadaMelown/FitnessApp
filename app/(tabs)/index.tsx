import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Modal, Pressable, Alert, ScrollView,
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

const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];
const LEVEL_LABELS: Record<Level, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const LEVEL_COLORS: Record<Level, string> = { beginner: Colors.success, intermediate: Colors.warning, advanced: Colors.danger };

export default function MuscleMapScreen() {
  const [view, setView] = useState<BodyView>('front');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [level, setLevel] = useState<Level>('beginner');
  const [isMale, setIsMale] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const addWorkout = useTrackerStore((s: TrackerState) => s.addWorkout);

  useEffect(() => {
    Promise.all([
      getSetting('fitnessLevel'),
      getSetting('userGender'),
    ]).then(([savedLevel, savedGender]) => {
      if (savedLevel) setLevel(savedLevel as Level);
      if (savedGender) setIsMale(savedGender !== 'female');
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

  const handleGenderToggle = useCallback(() => {
    Haptics.selectionAsync();
    setIsMale(m => {
      const next = !m;
      setSetting('userGender', next ? 'male' : 'female');
      return next;
    });
  }, []);

  const handleViewToggle = useCallback((v: BodyView) => {
    Haptics.selectionAsync();
    setView(v);
    setSelectedMuscle(null);
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Muscle Map</Text>
            <Text style={styles.subtitle}>Tap a muscle to explore</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleGenderToggle}>
              <Text style={styles.genderIcon}>{isMale ? '♂' : '♀'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setSettingsVisible(true)}>
              <Ionicons name="settings-outline" size={19} color={Colors.subtext} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── BODY MODEL ── */}
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
              isMale={isMale}
              selectedMuscle={selectedMuscle}
              onMusclePress={handleMusclePress}
            />
          </ScrollView>
        </View>

        {/* ── BOTTOM CONTROLS ── */}
        <View style={styles.bottomBar}>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewBtn, view === 'front' && styles.viewBtnActive]}
              onPress={() => handleViewToggle('front')}
            >
              <Text style={[styles.viewBtnText, view === 'front' && styles.viewBtnTextActive]}>Front</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewBtn, view === 'back' && styles.viewBtnActive]}
              onPress={() => handleViewToggle('back')}
            >
              <Text style={[styles.viewBtnText, view === 'back' && styles.viewBtnTextActive]}>Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.levelRow}>
            {LEVELS.map(l => (
              <TouchableOpacity
                key={l}
                style={[styles.levelPill, level === l && { backgroundColor: LEVEL_COLORS[l] + '22', borderColor: LEVEL_COLORS[l] }]}
                onPress={() => handleLevelChange(l)}
              >
                <View style={[styles.levelDot, { backgroundColor: LEVEL_COLORS[l] }]} />
                <Text style={[styles.levelPillText, level === l && { color: LEVEL_COLORS[l] }]}>
                  {LEVEL_LABELS[l]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.hintRow}>
            {selectedMuscle ? (
              <Text style={styles.hintSelected}>{getMuscleGroupName(selectedMuscle)}</Text>
            ) : (
              <>
                <Ionicons name="hand-left-outline" size={12} color={Colors.muted} />
                <Text style={styles.hint}>Tap a muscle · Pinch to zoom</Text>
              </>
            )}
          </View>
        </View>

        {/* ── EXERCISE MODAL ── */}
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

        <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
      </View>
    </SafeAreaView>
  );
}

function SettingsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const resetOnboarding = () => {
    Alert.alert('Reset Onboarding', 'This will restart the setup flow. Continue?', [
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
        <Text style={styles.sectionHead}>Account</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={resetOnboarding}>
          <Ionicons name="refresh-outline" size={16} color={Colors.danger} />
          <Text style={styles.dangerBtnText}>Redo onboarding</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: Colors.subtext, marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  genderIcon: { fontSize: 20, color: Colors.accentLight, fontWeight: '700' },
  modelContainer: { flex: 1, width: '100%' },
  zoomScroll: { flex: 1, width: '100%' },
  zoomContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  bottomBar: {
    paddingHorizontal: 16, paddingBottom: 12, paddingTop: 10, gap: 10,
    borderTopWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  viewToggle: {
    flexDirection: 'row', backgroundColor: Colors.card,
    borderRadius: 14, padding: 4, borderWidth: 1, borderColor: Colors.border,
    alignSelf: 'center',
  },
  viewBtn: { paddingHorizontal: 30, paddingVertical: 9, borderRadius: 11 },
  viewBtnActive: { backgroundColor: Colors.accent },
  viewBtnText: { fontSize: 14, fontWeight: '600', color: Colors.subtext },
  viewBtnTextActive: { color: Colors.white },
  levelRow: { flexDirection: 'row', gap: 8 },
  levelPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 7, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.card,
  },
  levelDot: { width: 6, height: 6, borderRadius: 3 },
  levelPillText: { fontSize: 11, fontWeight: '700', color: Colors.subtext },
  hintRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  hint: { fontSize: 12, color: Colors.muted },
  hintSelected: { fontSize: 13, fontWeight: '700', color: Colors.accentLight },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' } as any,
  settingsSheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderColor: Colors.border,
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  sectionHead: { fontSize: 11, fontWeight: '700', color: Colors.subtext, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.danger + '15', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.danger + '40',
  },
  dangerBtnText: { fontSize: 14, fontWeight: '600', color: Colors.danger },
});
