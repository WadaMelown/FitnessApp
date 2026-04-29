import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useTrackerStore, TrackerState } from '@/store/useTrackerStore';
import { getProgressionSuggestion } from '@/lib/ai';
import { WorkoutEntry, getWorkoutsForExercise, deleteWorkout } from '@/lib/database';
import { getMuscleGroupName } from '@/lib/exercises';

export default function ProgressHistory() {
  const recentWorkouts = useTrackerStore((s: TrackerState) => s.recentWorkouts);
  const isLoading = useTrackerStore((s: TrackerState) => s.isLoading);
  const loadWorkouts = useTrackerStore((s: TrackerState) => s.loadWorkouts);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleGetSuggestion = async (exerciseId: string, exerciseName: string) => {
    setSelectedExercise(exerciseId);
    setSuggestionLoading(true);
    setSuggestion(null);
    try {
      const history = await getWorkoutsForExercise(exerciseId, 10);
      const result = await getProgressionSuggestion(exerciseName, history);
      setSuggestion(result);
    } catch (e: any) {
      setSuggestion(`Could not get suggestion: ${e?.message ?? 'Please try again.'}`);
    } finally {
      setSuggestionLoading(false);
    }
  };

  const handleDelete = useCallback((entry: WorkoutEntry) => {
    if (!entry.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Entry',
      `Remove ${entry.exerciseName} on ${entry.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await deleteWorkout(entry.id!);
            loadWorkouts();
          },
        },
      ]
    );
  }, [loadWorkouts]);

  const grouped = groupByExercise(recentWorkouts.slice(0, 100));

  if (isLoading) {
    return <ActivityIndicator color={Colors.accent} style={{ flex: 1, marginTop: 60 }} />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {recentWorkouts.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bar-chart-outline" size={48} color={Colors.muted} />
          <Text style={styles.emptyTitle}>No workouts logged yet</Text>
          <Text style={styles.emptyText}>Log your first workout to start tracking progress.</Text>
        </View>
      ) : (
        Object.entries(grouped).map(([exerciseId, entries]) => (
          <ExerciseHistoryCard
            key={exerciseId}
            exerciseId={exerciseId}
            exerciseName={entries[0].exerciseName}
            muscleGroup={entries[0].muscleGroup}
            entries={entries}
            isSelected={selectedExercise === exerciseId}
            suggestion={selectedExercise === exerciseId ? suggestion : null}
            suggestionLoading={selectedExercise === exerciseId && suggestionLoading}
            onGetSuggestion={() => handleGetSuggestion(exerciseId, entries[0].exerciseName)}
            onDelete={handleDelete}
          />
        ))
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

interface CardProps {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  entries: WorkoutEntry[];
  isSelected: boolean;
  suggestion: string | null;
  suggestionLoading: boolean;
  onGetSuggestion: () => void;
  onDelete: (entry: WorkoutEntry) => void;
}

function ExerciseHistoryCard({
  exerciseName, muscleGroup, entries, isSelected,
  suggestion, suggestionLoading, onGetSuggestion, onDelete,
}: CardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const latest = entries[0];
  const prev = entries[1];
  const weightDiff = prev ? latest.weight - prev.weight : null;

  // Total volume for the card (sum weight × sets across all sessions)
  const totalVolume = entries.reduce((sum, e) => sum + e.weight * e.sets, 0);
  const pb = entries.reduce((best, e) => (e.weight > best ? e.weight : best), 0);

  const displayEntries = showAll ? entries : entries.slice(0, 5);

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={() => { Haptics.selectionAsync(); setExpanded(e => !e); }} activeOpacity={0.8}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardTitle}>{exerciseName}</Text>
          <Text style={styles.cardMuscle}>{getMuscleGroupName(muscleGroup)}</Text>
        </View>
        <View style={styles.cardRight}>
          <View style={styles.cardStats}>
            <Text style={styles.latestWeight}>{latest.weight}{latest.weightUnit}</Text>
            {weightDiff !== null && (
              <View style={[styles.diffBadge, weightDiff >= 0 ? styles.diffUp : styles.diffDown]}>
                <Ionicons
                  name={weightDiff >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={10}
                  color={weightDiff >= 0 ? Colors.success : Colors.danger}
                />
                <Text style={[styles.diffText, { color: weightDiff >= 0 ? Colors.success : Colors.danger }]}>
                  {Math.abs(weightDiff).toFixed(1)}
                </Text>
              </View>
            )}
          </View>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.subtext} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.cardBody}>
          {/* Volume + PB summary */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Sessions</Text>
              <Text style={styles.summaryValue}>{entries.length}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Volume</Text>
              <Text style={styles.summaryValue}>{Math.round(totalVolume).toLocaleString()}{latest.weightUnit}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>PB</Text>
              <Text style={[styles.summaryValue, { color: Colors.warning }]}>{pb}{latest.weightUnit}</Text>
            </View>
          </View>

          {/* Mini chart */}
          <MiniProgressBar entries={entries.slice(0, 8).reverse()} />

          {/* Session log */}
          {displayEntries.map((e, i) => (
            <View key={e.id ?? i} style={styles.sessionRow}>
              <Text style={styles.sessionDate}>{formatDate(e.date)}</Text>
              <Text style={styles.sessionDetail}>{e.sets}×{e.reps}</Text>
              <Text style={[styles.sessionWeight, e.weight === pb && styles.pbWeight]}>
                {e.weight === pb && '🏆 '}{e.weight}{e.weightUnit}
              </Text>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(e)}>
                <Ionicons name="trash-outline" size={14} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ))}

          {entries.length > 5 && (
            <TouchableOpacity style={styles.showMoreBtn} onPress={() => { Haptics.selectionAsync(); setShowAll(v => !v); }}>
              <Text style={styles.showMoreText}>
                {showAll ? 'Show less' : `Show ${entries.length - 5} more`}
              </Text>
              <Ionicons name={showAll ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.accent} />
            </TouchableOpacity>
          )}

          {/* AI Suggestion */}
          <TouchableOpacity style={styles.aiBtn} onPress={onGetSuggestion} disabled={suggestionLoading}>
            {suggestionLoading ? (
              <ActivityIndicator size="small" color={Colors.accent} />
            ) : (
              <>
                <Ionicons name="sparkles" size={14} color={Colors.accent} />
                <Text style={styles.aiBtnText}>AI progression advice</Text>
              </>
            )}
          </TouchableOpacity>

          {suggestion && (
            <View style={styles.suggestionBox}>
              <View style={styles.suggestionHeader}>
                <Ionicons name="sparkles" size={12} color={Colors.accent} />
                <Text style={styles.suggestionTitle}>FitForge AI</Text>
              </View>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function MiniProgressBar({ entries }: { entries: WorkoutEntry[] }) {
  if (entries.length < 2) return null;
  const weights = entries.map(e => e.weight);
  const max = Math.max(...weights);
  const min = Math.min(...weights);
  const range = max - min || 1;

  return (
    <View style={styles.miniChart}>
      {entries.map((e, i) => {
        const height = 8 + ((e.weight - min) / range) * 30;
        const isLatest = i === entries.length - 1;
        return (
          <View key={i} style={styles.barWrapper}>
            <View style={[styles.bar, { height }, isLatest && styles.barLatest]} />
          </View>
        );
      })}
    </View>
  );
}

function groupByExercise(workouts: WorkoutEntry[]): Record<string, WorkoutEntry[]> {
  return workouts.reduce((acc, w) => {
    if (!acc[w.exerciseId]) acc[w.exerciseId] = [];
    acc[w.exerciseId].push(w);
    return acc;
  }, {} as Record<string, WorkoutEntry[]>);
}

function formatDate(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.subtext, textAlign: 'center' },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginTop: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardLeft: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  cardMuscle: { fontSize: 12, color: Colors.subtext, marginTop: 2 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardStats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  latestWeight: { fontSize: 16, fontWeight: '700', color: Colors.text },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffUp: { backgroundColor: Colors.success + '22' },
  diffDown: { backgroundColor: Colors.danger + '22' },
  diffText: { fontSize: 11, fontWeight: '700' },
  cardBody: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderColor: Colors.border },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    marginBottom: 4,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryLabel: { fontSize: 10, color: Colors.subtext, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { fontSize: 14, fontWeight: '700', color: Colors.text, marginTop: 3 },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 46,
    gap: 3,
    marginVertical: 14,
  },
  barWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '65%', backgroundColor: Colors.accent + '60', borderRadius: 3 },
  barLatest: { backgroundColor: Colors.accent },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  sessionDate: { fontSize: 13, color: Colors.subtext, flex: 1.2 },
  sessionDetail: { fontSize: 13, color: Colors.text, flex: 1, textAlign: 'center' },
  sessionWeight: { fontSize: 13, fontWeight: '600', color: Colors.text, flex: 1.2, textAlign: 'right' },
  pbWeight: { color: Colors.warning },
  deleteBtn: { padding: 6, marginLeft: 4 },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    marginTop: 4,
  },
  showMoreText: { fontSize: 13, color: Colors.accent, fontWeight: '600' },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
    minHeight: 40,
  },
  aiBtnText: { fontSize: 13, fontWeight: '600', color: Colors.accentLight },
  suggestionBox: {
    marginTop: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  suggestionTitle: { fontSize: 12, fontWeight: '700', color: Colors.accent },
  suggestionText: { fontSize: 13, color: Colors.text, lineHeight: 20 },
});
