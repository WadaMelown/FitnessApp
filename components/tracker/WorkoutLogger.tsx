import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { MUSCLE_GROUPS, getAllExercisesForMuscle } from '@/lib/exercises';
import { useTrackerStore, TrackerState } from '@/store/useTrackerStore';
import { getLastWorkoutForExercise, getPersonalBest, WorkoutEntry } from '@/lib/database';
import RestTimer from './RestTimer';

interface Prefill {
  exerciseId?: string;
  exerciseName?: string;
  muscleGroup?: string;
  defaultSets?: string;
  defaultReps?: string;
}

interface Props {
  prefill?: Prefill;
  onLogged?: () => void;
}

export default function WorkoutLogger({ prefill, onLogged }: Props) {
  const addWorkout = useTrackerStore((s: TrackerState) => s.addWorkout);

  const [selectedMuscle, setSelectedMuscle] = useState(prefill?.muscleGroup ?? '');
  const [selectedExerciseId, setSelectedExerciseId] = useState(prefill?.exerciseId ?? '');
  const [selectedExerciseName, setSelectedExerciseName] = useState(prefill?.exerciseName ?? '');
  const [sets, setSets] = useState(prefill?.defaultSets ?? '3');
  const [reps, setReps] = useState(prefill?.defaultReps ?? '10');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastEntry, setLastEntry] = useState<WorkoutEntry | null>(null);
  const [personalBest, setPersonalBest] = useState<WorkoutEntry | null>(null);
  const [restSeconds, setRestSeconds] = useState(90);
  const [showTimer, setShowTimer] = useState(false);

  const muscleExercises = selectedMuscle ? getAllExercisesForMuscle(selectedMuscle) : [];

  useEffect(() => {
    if (!selectedExerciseId) {
      setLastEntry(null);
      setPersonalBest(null);
      return;
    }
    (async () => {
      const [last, pb] = await Promise.all([
        getLastWorkoutForExercise(selectedExerciseId),
        getPersonalBest(selectedExerciseId),
      ]);
      setLastEntry(last);
      setPersonalBest(pb);
      if (last) {
        setWeight(String(last.weight));
        setWeightUnit(last.weightUnit as 'kg' | 'lbs');
        setSets(String(last.sets));
        setReps(last.reps);
      }
    })();
  }, [selectedExerciseId]);

  const selectMuscle = (muscleId: string) => {
    Haptics.selectionAsync();
    setSelectedMuscle(muscleId);
    setSelectedExerciseId('');
    setSelectedExerciseName('');
    setLastEntry(null);
    setPersonalBest(null);
  };

  const selectExercise = (id: string, name: string) => {
    Haptics.selectionAsync();
    setSelectedExerciseId(id);
    setSelectedExerciseName(name);
    const ex = muscleExercises.find(e => e.id === id);
    if (ex) setRestSeconds(ex.restSeconds);
  };

  const handleSave = useCallback(async () => {
    if (!selectedMuscle || !selectedExerciseId || !weight) {
      Alert.alert('Missing info', 'Please select a muscle, exercise, and enter the weight.');
      return;
    }
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('Invalid weight', 'Please enter a valid weight.');
      return;
    }

    const isPB = personalBest && weightNum > personalBest.weight;

    if (isPB) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setSaving(true);
    try {
      await addWorkout({
        date: new Date().toISOString().split('T')[0],
        muscleGroup: selectedMuscle,
        exerciseId: selectedExerciseId,
        exerciseName: selectedExerciseName,
        sets: parseInt(sets, 10) || 3,
        reps,
        weight: weightNum,
        weightUnit,
        notes: notes.trim() || undefined,
      });

      setNotes('');
      onLogged?.();
      setShowTimer(true);

      if (isPB) {
        Alert.alert(
          '🏆 New Personal Best!',
          `${selectedExerciseName} — ${weightNum}${weightUnit} (previous best: ${personalBest!.weight}${personalBest!.weightUnit})`,
        );
      }
    } catch {
      Alert.alert('Error', 'Could not save workout. Try again.');
    } finally {
      setSaving(false);
    }
  }, [selectedMuscle, selectedExerciseId, selectedExerciseName, sets, reps, weight, weightUnit, notes, personalBest, addWorkout]);

  const progressHint = lastEntry
    ? `Last: ${lastEntry.weight}${lastEntry.weightUnit} · ${lastEntry.sets}×${lastEntry.reps} (${formatDate(lastEntry.date)})`
    : null;
  const pbHint = personalBest
    ? `PB: ${personalBest.weight}${personalBest.weightUnit}`
    : null;

  return (
    <>
      <RestTimer
        visible={showTimer}
        exerciseName={selectedExerciseName}
        defaultSeconds={restSeconds}
        onDismiss={() => setShowTimer(false)}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Muscle Group */}
          <SectionLabel>Muscle Group</SectionLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
            {MUSCLE_GROUPS.map(mg => (
              <TouchableOpacity
                key={mg.id}
                style={[styles.chip, selectedMuscle === mg.id && styles.chipActive]}
                onPress={() => selectMuscle(mg.id)}
              >
                <Text style={[styles.chipText, selectedMuscle === mg.id && styles.chipTextActive]}>
                  {mg.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Exercise */}
          {selectedMuscle !== '' && (
            <>
              <SectionLabel>Exercise</SectionLabel>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
                {muscleExercises.map(ex => (
                  <TouchableOpacity
                    key={ex.id}
                    style={[styles.chip, selectedExerciseId === ex.id && styles.chipActive]}
                    onPress={() => selectExercise(ex.id, ex.name)}
                  >
                    <Text style={[styles.chipText, selectedExerciseId === ex.id && styles.chipTextActive]} numberOfLines={1}>
                      {ex.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Last session + PB hints */}
          {(progressHint || pbHint) && (
            <View style={styles.hintRow}>
              {progressHint && (
                <View style={styles.hintBadge}>
                  <Ionicons name="time-outline" size={12} color={Colors.subtext} />
                  <Text style={styles.hintText}>{progressHint}</Text>
                </View>
              )}
              {pbHint && (
                <View style={[styles.hintBadge, styles.pbBadge]}>
                  <Ionicons name="trophy-outline" size={12} color={Colors.warning} />
                  <Text style={[styles.hintText, { color: Colors.warning }]}>{pbHint}</Text>
                </View>
              )}
            </View>
          )}

          {/* Rest time indicator */}
          {selectedExerciseId !== '' && (
            <View style={styles.restRow}>
              <Ionicons name="timer-outline" size={13} color={Colors.subtext} />
              <Text style={styles.restText}>Recommended rest: {restSeconds}s</Text>
            </View>
          )}

          {/* Sets / Reps / Weight */}
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <SectionLabel>Sets</SectionLabel>
              <View style={styles.stepperRow}>
                <TouchableOpacity style={styles.stepBtn} onPress={() => { Haptics.selectionAsync(); setSets(s => String(Math.max(1, parseInt(s) - 1))); }}>
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.stepInput}
                  value={sets}
                  onChangeText={setSets}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.muted}
                  selectionColor={Colors.accent}
                  textAlign="center"
                />
                <TouchableOpacity style={styles.stepBtn} onPress={() => { Haptics.selectionAsync(); setSets(s => String(parseInt(s) + 1)); }}>
                  <Text style={styles.stepBtnText}>＋</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <SectionLabel>Reps</SectionLabel>
              <TextInput
                style={styles.input}
                value={reps}
                onChangeText={setReps}
                placeholderTextColor={Colors.muted}
                placeholder="10"
                selectionColor={Colors.accent}
                textAlign="center"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1.8 }]}>
              <SectionLabel>Weight</SectionLabel>
              <View style={styles.weightRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.muted}
                  placeholder={lastEntry ? String(lastEntry.weight) : '60'}
                  selectionColor={Colors.accent}
                  textAlign="center"
                />
                <TouchableOpacity
                  style={styles.unitToggle}
                  onPress={() => { Haptics.selectionAsync(); setWeightUnit(u => u === 'kg' ? 'lbs' : 'kg'); }}
                >
                  <Text style={styles.unitText}>{weightUnit}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Notes */}
          <SectionLabel>Notes (optional)</SectionLabel>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholderTextColor={Colors.muted}
            placeholder="How did it feel? Any form notes..."
            multiline
            numberOfLines={3}
            selectionColor={Colors.accent}
          />

          {/* Save Button */}
          <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Log Workout'}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.subtext,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 8,
  },
  chipScroll: { marginHorizontal: -20 },
  chipRow: { paddingHorizontal: 20, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.accentDim, borderColor: Colors.accent },
  chipText: { fontSize: 14, color: Colors.subtext, fontWeight: '500' },
  chipTextActive: { color: Colors.accentLight, fontWeight: '600' },
  hintRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  hintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pbBadge: { borderColor: Colors.warning + '60', backgroundColor: Colors.warning + '11' },
  hintText: { fontSize: 12, color: Colors.subtext },
  restRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  restText: { fontSize: 12, color: Colors.subtext },
  inputRow: { flexDirection: 'row', gap: 10 },
  inputGroup: { flex: 1 },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  stepBtn: { paddingHorizontal: 10, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 18, color: Colors.accentLight, fontWeight: '300' },
  stepInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
    paddingVertical: 13,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 17,
    fontWeight: '600',
    paddingHorizontal: 14,
    paddingVertical: 13,
    textAlign: 'center',
  },
  weightRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  unitToggle: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  unitText: { fontSize: 12, color: Colors.accentLight, fontWeight: '700' },
  notesInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 20,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
