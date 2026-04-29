import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';

interface Props {
  visible: boolean;
  exerciseName: string;
  defaultSeconds?: number;
  onDismiss: () => void;
}

export default function RestTimer({ visible, exerciseName, defaultSeconds = 90, onDismiss }: Props) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [total, setTotal] = useState(defaultSeconds);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible) {
      setSeconds(defaultSeconds);
      setTotal(defaultSeconds);
      setRunning(true);
    }
  }, [visible, defaultSeconds]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!running || !visible) return;

    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setRunning(false);
          return 0;
        }
        if (s <= 4) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return s - 1;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, visible]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = total > 0 ? seconds / total : 0;

  const adjust = (delta: number) => {
    Haptics.selectionAsync();
    setSeconds(s => Math.max(0, s + delta));
    setTotal(t => Math.max(delta > 0 ? t : 1, t + delta));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.successBadge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.successText}>Set Logged</Text>
            </View>
            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={Colors.subtext} />
            </TouchableOpacity>
          </View>

          <Text style={styles.exerciseLabel} numberOfLines={1}>{exerciseName}</Text>

          {/* Circular-ish progress ring via stroke */}
          <View style={styles.timerContainer}>
            <Text style={styles.timeText}>
              {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </Text>
            <Text style={styles.restLabel}>rest</Text>
          </View>

          {/* Progress track */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjust(-15)}>
              <Text style={styles.adjustText}>−15s</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainBtn, running ? styles.pauseColor : styles.playColor]}
              onPress={() => { Haptics.selectionAsync(); setRunning(r => !r); }}
            >
              <Ionicons name={running ? 'pause' : 'play'} size={24} color={Colors.white} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjust(15)}>
              <Text style={styles.adjustText}>+15s</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.skipBtn} onPress={onDismiss}>
            <Text style={styles.skipText}>Skip Rest</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.success + '22',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  successText: { fontSize: 13, fontWeight: '600', color: Colors.success },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseLabel: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 72,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  restLabel: {
    fontSize: 13,
    color: Colors.subtext,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: -4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: 28,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  adjustBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  adjustText: { fontSize: 14, fontWeight: '700', color: Colors.text },
  mainBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseColor: { backgroundColor: Colors.accent },
  playColor: { backgroundColor: Colors.success },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontSize: 14, color: Colors.subtext, fontWeight: '600' },
});
