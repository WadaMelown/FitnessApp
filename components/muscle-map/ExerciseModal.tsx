import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, ScrollView,
  TouchableOpacity, Linking, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
const LEVEL_LABELS: Record<Level, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const LEVEL_COLORS: Record<Level, string> = { beginner: Colors.success, intermediate: Colors.warning, advanced: Colors.danger };

interface MuscleTips { formCues: string[]; maximizeTips: string[]; }

const MUSCLE_TIPS: Record<string, MuscleTips> = {
  chest: {
    formCues: ['Retract shoulder blades before each rep', 'Lower bar to sternum — not neck', 'Drive elbows slightly inward at the top'],
    maximizeTips: ['Pre-exhaust with flyes before compound lifts', 'Slow the eccentric phase (3-4s down)', 'Squeeze hard at peak contraction for 1-2s'],
  },
  shoulders: {
    formCues: ['Brace core to protect lower back', 'Keep traps relaxed — don\'t shrug', 'Control the descent to protect joints'],
    maximizeTips: ['Face pulls for rear delt balance', 'Lateral raises at 30° forward hits the medial delt peak', 'Superset front + lateral raises for burn'],
  },
  biceps: {
    formCues: ['Pin elbows to your sides — no swinging', 'Start from full extension every rep', 'Supinate at the top for full peak contraction'],
    maximizeTips: ['Incline curls target the long head (peak)', 'Slow negatives build the most mass', 'Try 21s: 7 bottom-half, 7 top-half, 7 full reps'],
  },
  triceps: {
    formCues: ['Keep elbows pointing forward — no flaring', 'Full lockout at top for max activation', 'Control the descent — don\'t let the bar drop'],
    maximizeTips: ['Long head = overhead extensions', 'Lateral head = pushdowns with bar or rope', 'Superset close-grip bench + dips for killer pump'],
  },
  abs: {
    formCues: ['Exhale on the crunch, inhale on descent', 'Don\'t pull your neck — hands lightly on head', 'Flatten lower back before each rep'],
    maximizeTips: ['Add load before increasing reps past 20', 'Dragon flags & rollouts > endless crunches', 'Train abs at end — they stabilise every lift'],
  },
  obliques: {
    formCues: ['Rotate from the torso, not just arms', 'Keep hips square and stable during rotation', 'Slow controlled reps beat fast sloppy ones'],
    maximizeTips: ['Avoid excessive side bends for a narrow waist', 'Cable woodchops give constant tension', 'Pair with plank variations for complete core'],
  },
  quads: {
    formCues: ['Track knees over toes — no caving in', 'Drive through your full foot, not just heels', 'Keep chest tall, torso upright throughout'],
    maximizeTips: ['Pause squats at bottom for max quad time under tension', 'Drop sets on leg extensions for brutal pump', 'Bulgarian split squats = best unilateral quads movement'],
  },
  calves: {
    formCues: ['Full range: heel all the way down, up on full tiptoe', 'Hold the peak for 1 second every rep', 'Don\'t bounce — control the stretch at bottom'],
    maximizeTips: ['Calves need high volume — aim for 15-25 reps', 'Train both straight-knee and bent-knee variations', 'Train them 3-4×/week — they recover fast'],
  },
  hamstrings: {
    formCues: ['Push hips back — don\'t just bend forward', 'Keep back flat — zero rounding', 'Feel the stretch in the hamstring at the bottom'],
    maximizeTips: ['Nordic curls are the gold standard for strength', 'Combine hip hinge + lying curl for full coverage', 'Slow the eccentric — hamstrings tear on fast negatives'],
  },
  glutes: {
    formCues: ['Squeeze glutes hard at full hip extension', 'Tuck pelvis at the top of hip thrusts', 'Don\'t let your lower back dominate'],
    maximizeTips: ['Hip thrusts provide more direct load than squats', 'Activate with bridges before heavy work', 'Full-range Romanian DLs create the glute stretch reflex'],
  },
  lats: {
    formCues: ['Drive elbows down and back — "elbows to hips"', 'Depress shoulders before pulling — no shrugging', 'Dead hang at the bottom for full lat stretch'],
    maximizeTips: ['Wide grip = width, close grip = thickness', 'Unilateral rows fix left-right imbalances', 'False grip isolates lats from biceps'],
  },
  traps: {
    formCues: ['Elevate straight up — no rolling the shoulders', 'Hold peak contraction for 1-2 seconds', 'Use straps — grip fails before traps do'],
    maximizeTips: ['Face pulls build mid and lower trap balance', 'Rack pulls give an incredible loaded stretch', 'Shrug + face pull superset for complete trap development'],
  },
  lowerBack: {
    formCues: ['Maintain neutral spine — no rounding or hyperextending', 'Brace core tight before every single rep', 'Hip hinge mechanics protect discs — master them'],
    maximizeTips: ['Deadlift is the king for erector strength', 'Hyperextensions at high rep for endurance strength', 'Never train lower back when it\'s sore — injury risk'],
  },
  rearDelts: {
    formCues: ['Elbows high and wide on face pulls', 'Keep chin tucked — don\'t crane your neck', 'Think "pull apart" not just "pull back"'],
    maximizeTips: ['Rear delts respond best to high reps (15-25)', 'Train them after big pressing days', 'Most people undertrain rear delts — prioritise them'],
  },
  forearms: {
    formCues: ['Full wrist extension AND flexion each rep', 'Controlled tempo — momentum defeats the purpose', 'Train both flexors and extensors equally'],
    maximizeTips: ['Grip strength carries over to every pull movement', 'Dead hangs are criminally underrated', 'Farmer carries build the most functional forearm strength'],
  },
};

const MUSCLE_EMOJIS: Record<string, string> = {
  chest: '🫁', shoulders: '🦾', biceps: '💪', triceps: '🦿', forearms: '✊',
  abs: '⚡', obliques: '🌀', quads: '🦵', calves: '👟', hamstrings: '🏃',
  glutes: '🍑', lats: '🦅', traps: '🏔️', lowerBack: '🔩', rearDelts: '🎯',
};

export default function ExerciseModal({
  visible, muscleId, exercises, selectedLevel, onClose, onLevelChange, onLogExercise,
}: Props) {
  const muscleName = getMuscleGroupName(muscleId);
  const emoji = MUSCLE_EMOJIS[muscleId] ?? '💪';
  const tips = MUSCLE_TIPS[muscleId];

  const openYoutube = async (query: string) => {
    const url = YOUTUBE_SEARCH_BASE + encodeURIComponent(query);
    const ytUrl = `youtube://results?search_query=${encodeURIComponent(query)}`;
    const canOpen = await Linking.canOpenURL(ytUrl);
    await Linking.openURL(canOpen ? ytUrl : url);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheetWrapper}>
        <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Header */}
        <LinearGradient
          colors={[Colors.accentDim + 'DD', Colors.surface]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.emoji}>{emoji}</Text>
            <View>
              <Text style={styles.title}>{muscleName}</Text>
              <Text style={styles.subtitle}>Form tips · Exercises · Videos</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={Colors.subtext} />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── FORM CUES ── always visible at top */}
          {tips && (
            <>
              <View style={[styles.tipsCard, { borderColor: Colors.success + '40' }]}>
                <View style={styles.tipsCardHeader}>
                  <View style={[styles.tipsIcon, { backgroundColor: Colors.success + '20' }]}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                  </View>
                  <View>
                    <Text style={[styles.tipsCardTitle, { color: Colors.success }]}>Form Cues</Text>
                    <Text style={styles.tipsCardSub}>Perfect your technique</Text>
                  </View>
                </View>
                {tips.formCues.map((cue, i) => (
                  <View key={i} style={[styles.tipRow, { borderLeftColor: Colors.success }]}>
                    <Text style={styles.tipText}>{cue}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.tipsCard, { borderColor: Colors.warning + '40', marginTop: 10 }]}>
                <View style={styles.tipsCardHeader}>
                  <View style={[styles.tipsIcon, { backgroundColor: Colors.warning + '20' }]}>
                    <Ionicons name="flash" size={20} color={Colors.warning} />
                  </View>
                  <View>
                    <Text style={[styles.tipsCardTitle, { color: Colors.warning }]}>Maximize Your Set</Text>
                    <Text style={styles.tipsCardSub}>Get more from every rep</Text>
                  </View>
                </View>
                {tips.maximizeTips.map((tip, i) => (
                  <View key={i} style={[styles.tipRow, { borderLeftColor: Colors.warning }]}>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>

              {/* removed per-muscle YouTube row — kept per-exercise only */}
            </>
          )}

          {/* ── EXERCISES DIVIDER ── */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>EXERCISES</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Level Selector */}
          <View style={styles.levelRow}>
            {LEVELS.map(level => (
              <TouchableOpacity
                key={level}
                style={[styles.levelBtn, selectedLevel === level && {
                  backgroundColor: LEVEL_COLORS[level] + '22',
                  borderColor: LEVEL_COLORS[level],
                }]}
                onPress={() => onLevelChange(level)}
              >
                <View style={[styles.levelDot, { backgroundColor: LEVEL_COLORS[level] }]} />
                <Text style={[styles.levelText, selectedLevel === level && { color: LEVEL_COLORS[level] }]}>
                  {LEVEL_LABELS[level]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Exercise Cards */}
          {exercises.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="fitness-outline" size={32} color={Colors.muted} />
              <Text style={styles.emptyText}>No exercises for this level.</Text>
            </View>
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

          <View style={{ height: 48 }} />
        </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ExerciseCard({ exercise, onWatch, onLog }: {
  exercise: Exercise; onWatch: () => void; onLog: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.card}>
      <LinearGradient colors={[Colors.accent, Colors.accentLight]} style={styles.cardBar} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.cardName}>{exercise.name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{exercise.sets}×{exercise.reps}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.expandBtn} onPress={() => setExpanded(e => !e)}>
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={15} color={Colors.subtext} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.ytBtn} onPress={onWatch}>
            <Ionicons name="logo-youtube" size={17} color="#FF3333" />
            <Text style={styles.ytBtnText}>Watch Tutorial</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logBtn} onPress={onLog}>
            <Ionicons name="add-circle" size={17} color={Colors.white} />
            <Text style={styles.logBtnText}>Log it</Text>
          </TouchableOpacity>
        </View>

        {expanded && (
          <View style={styles.cardDetails}>
            <Text style={styles.cardDesc}>{exercise.description}</Text>
            <View style={styles.chipRow}>
              <View style={styles.chip}><Ionicons name="barbell-outline" size={11} color={Colors.subtext} /><Text style={styles.chipText}>{exercise.equipment}</Text></View>
              <View style={styles.chip}><Ionicons name="time-outline" size={11} color={Colors.subtext} /><Text style={styles.chipText}>{exercise.restSeconds}s rest</Text></View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheetWrapper: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '88%',
    borderTopWidth: 1, borderColor: Colors.accent + '40',
    overflow: 'hidden',
  },
  handle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginTop: 12 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 30 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: Colors.subtext, marginTop: 1 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  scroll: {},
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },
  // Tips cards
  tipsCard: {
    backgroundColor: Colors.card, borderRadius: 16,
    padding: 14, borderWidth: 1,
  },
  tipsCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  tipsIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tipsCardTitle: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  tipsCardSub: { fontSize: 12, color: Colors.subtext, marginTop: 1 },
  tipRow: {
    borderLeftWidth: 3, paddingLeft: 10, marginBottom: 9,
    borderRadius: 2,
  },
  tipText: { fontSize: 14, color: Colors.text, lineHeight: 20, flex: 1 },
  ytRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.card, borderRadius: 12, padding: 13,
    marginTop: 10, borderWidth: 1, borderColor: '#FF333325',
  },
  ytRowText: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.text },
  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 11, fontWeight: '700', color: Colors.subtext, letterSpacing: 1 },
  // Level
  levelRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  levelBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.card,
  },
  levelDot: { width: 6, height: 6, borderRadius: 3 },
  levelText: { fontSize: 12, fontWeight: '700', color: Colors.subtext },
  emptyWrap: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { color: Colors.subtext, fontSize: 15 },
  // Exercise card
  card: {
    flexDirection: 'row', backgroundColor: Colors.card,
    borderRadius: 14, marginBottom: 10,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
  },
  cardBar: { width: 4 },
  cardBody: { flex: 1, padding: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  cardName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  badge: { backgroundColor: Colors.accentDim, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.accentLight },
  expandBtn: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  cardActions: { flexDirection: 'row', gap: 8 },
  ytBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#FF333315', borderRadius: 10, paddingVertical: 9,
    borderWidth: 1, borderColor: '#FF333330',
  },
  ytBtnText: { fontSize: 13, fontWeight: '700', color: '#FF4444' },
  logBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 9,
  },
  logBtnText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  cardDetails: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: Colors.border },
  cardDesc: { fontSize: 13, color: Colors.subtext, lineHeight: 19, marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surface, paddingHorizontal: 9, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
  },
  chipText: { fontSize: 12, color: Colors.subtext },
});
