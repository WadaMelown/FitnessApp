import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, ScrollView,
  TouchableOpacity, Linking, Animated, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Exercise, Level, YOUTUBE_SEARCH_BASE, getMuscleGroupName } from '@/lib/exercises';

interface Props {
  visible: boolean;
  muscleId: string;
  exercises: Exercise[];
  selectedLevel: Level;
  onClose: () => void;
  onLevelChange: (level: Level) => void;
  onLogExercise: (exercise: Exercise) => void;
}

const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];
const LEVEL_LABELS: Record<Level, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};
const LEVEL_COLORS: Record<Level, string> = {
  beginner: Colors.success,
  intermediate: Colors.warning,
  advanced: Colors.danger,
};

export default function ExerciseModal({
  visible, muscleId, exercises, selectedLevel, onClose, onLevelChange, onLogExercise,
}: Props) {
  const muscleName = getMuscleGroupName(muscleId);

  const openYoutube = async (query: string) => {
    const url = YOUTUBE_SEARCH_BASE + encodeURIComponent(query);
    const ytUrl = `youtube://results?search_query=${encodeURIComponent(query)}`;
    const canOpen = await Linking.canOpenURL(ytUrl);
    await Linking.openURL(canOpen ? ytUrl : url);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Header */}
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>{muscleName}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.subtext} />
          </TouchableOpacity>
        </View>

        {/* Level Selector */}
        <View style={styles.levelRow}>
          {LEVELS.map(level => (
            <TouchableOpacity
              key={level}
              style={[styles.levelBtn, selectedLevel === level && { backgroundColor: LEVEL_COLORS[level] + '33', borderColor: LEVEL_COLORS[level] }]}
              onPress={() => onLevelChange(level)}
            >
              <Text style={[styles.levelText, selectedLevel === level && { color: LEVEL_COLORS[level] }]}>
                {LEVEL_LABELS[level]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {exercises.length === 0 ? (
            <Text style={styles.empty}>No exercises found for this level.</Text>
          ) : (
            exercises.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onWatch={() => openYoutube(exercise.youtubeQuery)}
                onLog={() => onLogExercise(exercise)}
              />
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function ExerciseCard({ exercise, onWatch, onLog }: {
  exercise: Exercise;
  onWatch: () => void;
  onLog: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity style={styles.card} onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardName}>{exercise.name}</Text>
          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>{exercise.sets}×{exercise.reps}</Text>
          </View>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.subtext} />
      </View>

      {expanded && (
        <View style={styles.cardBody}>
          <Text style={styles.desc}>{exercise.description}</Text>
          <View style={styles.detailRow}>
            <InfoChip icon="barbell-outline" label={exercise.equipment} />
            <InfoChip icon="time-outline" label={`${exercise.restSeconds}s rest`} />
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.watchBtn} onPress={onWatch}>
              <Ionicons name="logo-youtube" size={16} color={Colors.danger} />
              <Text style={styles.watchText}>Watch Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logBtn} onPress={onLog}>
              <Ionicons name="add-circle-outline" size={16} color={Colors.accent} />
              <Text style={styles.logText}>Log Exercise</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

function InfoChip({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={12} color={Colors.subtext} />
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  levelBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.subtext,
  },
  list: {
    flex: 1,
  },
  empty: {
    color: Colors.subtext,
    textAlign: 'center',
    marginTop: 24,
    fontSize: 15,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  metaBadge: {
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentLight,
  },
  cardBody: {
    marginTop: 12,
  },
  desc: {
    fontSize: 14,
    color: Colors.subtext,
    lineHeight: 20,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: 12,
    color: Colors.subtext,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  watchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FF52521A',
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FF525240',
  },
  watchText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.danger,
  },
  logBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.accentDim,
    borderRadius: 10,
    paddingVertical: 10,
  },
  logText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accentLight,
  },
});
