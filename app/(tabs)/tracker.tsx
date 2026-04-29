import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import WorkoutLogger from '@/components/tracker/WorkoutLogger';
import AIChat from '@/components/tracker/AIChat';
import ProgressHistory from '@/components/tracker/ProgressHistory';
import { getRecentWorkouts, getSetting, getWeeklyVolume, WeeklyVolumeEntry, WorkoutEntry } from '@/lib/database';
import { getMuscleGroupName } from '@/lib/exercises';

type Tab = 'log' | 'history' | 'chat';

export default function TrackerScreen() {
  const params = useLocalSearchParams<{
    exerciseId?: string;
    exerciseName?: string;
    muscleGroup?: string;
    defaultSets?: string;
    defaultReps?: string;
  }>();

  const [activeTab, setActiveTab] = useState<Tab>('log');
  const [userName, setUserName] = useState('');
  const [todayWorkouts, setTodayWorkouts] = useState<WorkoutEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [weeklyVolume, setWeeklyVolume] = useState<WeeklyVolumeEntry[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const [name, workouts, volume] = await Promise.all([
      getSetting('userName'),
      getRecentWorkouts(50),
      getWeeklyVolume(),
    ]);
    setUserName(name ?? '');
    const today = new Date().toISOString().split('T')[0];
    setTodayWorkouts(workouts.filter(w => w.date === today));
    setStreak(calculateStreak(workouts));
    setWeeklyVolume(volume);
  };

  const switchTab = (tab: Tab) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  const TABS: { id: Tab; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
    { id: 'log',     label: 'Log',      icon: 'add-circle-outline' },
    { id: 'history', label: 'Progress', icon: 'trending-up-outline' },
    { id: 'chat',    label: 'AI Coach', icon: 'sparkles-outline'   },
  ];

  const todayMuscles = [...new Set(todayWorkouts.map(w => w.muscleGroup))];
  const totalWeeklyVolume = weeklyVolume.reduce((s, v) => s + v.totalVolume, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {userName ? `Hey, ${userName} 👋` : 'Tracker'}
            </Text>
            <Text style={styles.subtitle}>
              {todayWorkouts.length > 0
                ? `${todayWorkouts.length} set${todayWorkouts.length !== 1 ? 's' : ''} logged today`
                : 'No workouts logged yet today'}
            </Text>
          </View>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakCount}>{streak}</Text>
              <Text style={styles.streakLabel}>day{streak !== 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>

        {/* Weekly Volume Strip */}
        {weeklyVolume.length > 0 && (
          <View style={styles.volumeCard}>
            <View style={styles.volumeHeader}>
              <Ionicons name="stats-chart" size={13} color={Colors.accent} />
              <Text style={styles.volumeTitle}>This Week</Text>
              <Text style={styles.volumeTotal}>{totalWeeklyVolume.toLocaleString()} kg total</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.volumeRow}>
              {weeklyVolume.map(v => (
                <View key={v.muscleGroup} style={styles.volumeChip}>
                  <Text style={styles.volumeChipMuscle}>{getMuscleGroupName(v.muscleGroup)}</Text>
                  <Text style={styles.volumeChipNum}>{v.totalVolume.toLocaleString()}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Today's Activity */}
        {todayMuscles.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.todayScroll}
            contentContainerStyle={styles.todayRow}
          >
            <Text style={styles.todayLabel}>Today:</Text>
            {todayMuscles.map(m => (
              <View key={m} style={styles.todayChip}>
                <Text style={styles.todayChipText}>{getMuscleGroupName(m)}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
              onPress={() => switchTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={activeTab === tab.id ? Colors.white : Colors.subtext}
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'log' && (
            <WorkoutLogger
              prefill={params.exerciseId ? {
                exerciseId: params.exerciseId,
                exerciseName: params.exerciseName,
                muscleGroup: params.muscleGroup,
                defaultSets: params.defaultSets,
                defaultReps: params.defaultReps,
              } : undefined}
              onLogged={() => { loadDashboard(); switchTab('history'); }}
            />
          )}
          {activeTab === 'history' && <ProgressHistory />}
          {activeTab === 'chat' && <AIChat />}
        </View>
      </View>
    </SafeAreaView>
  );
}

function calculateStreak(workouts: WorkoutEntry[]): number {
  if (workouts.length === 0) return 0;
  const dates = [...new Set(workouts.map(w => w.date))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 0;
  let expected = new Date(dates[0]);
  for (const date of dates) {
    const d = new Date(date);
    const diff = Math.round((expected.getTime() - d.getTime()) / 86400000);
    if (diff > 1) break;
    streak++;
    expected = new Date(d.getTime() - 86400000);
  }
  return streak;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 10,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: Colors.subtext, marginTop: 3 },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.warning + '50',
  },
  streakFire: { fontSize: 18 },
  streakCount: { fontSize: 20, fontWeight: '800', color: Colors.warning, lineHeight: 24 },
  streakLabel: { fontSize: 10, color: Colors.subtext, fontWeight: '600', textTransform: 'uppercase' },
  volumeCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  volumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  volumeTitle: { fontSize: 12, fontWeight: '700', color: Colors.text, flex: 1 },
  volumeTotal: { fontSize: 11, fontWeight: '600', color: Colors.accent },
  volumeRow: { gap: 8, paddingBottom: 2 },
  volumeChip: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 64,
  },
  volumeChipMuscle: { fontSize: 10, fontWeight: '700', color: Colors.subtext, textTransform: 'uppercase', letterSpacing: 0.3 },
  volumeChipNum: { fontSize: 13, fontWeight: '700', color: Colors.text, marginTop: 2 },
  todayScroll: { maxHeight: 40 },
  todayRow: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  todayLabel: { fontSize: 12, fontWeight: '700', color: Colors.subtext, textTransform: 'uppercase', letterSpacing: 0.5 },
  todayChip: {
    backgroundColor: Colors.success + '22',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  todayChipText: { fontSize: 12, fontWeight: '600', color: Colors.success },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 11,
  },
  tabBtnActive: { backgroundColor: Colors.accent },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.subtext },
  tabTextActive: { color: Colors.white },
  content: { flex: 1 },
});
