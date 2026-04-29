import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import AvatarSVG from '@/components/body-sim/AvatarSVG';
import MeasurementsForm from '@/components/body-sim/MeasurementsForm';
import {
  useBodySimStore,
  calculateBMI,
  getBMICategory,
  estimateBodyFat,
  toKg,
  toCm,
} from '@/store/useBodySimStore';

type Tab = 'avatar' | 'form' | 'history';

const { width } = Dimensions.get('window');

export default function BodySimScreen() {
  const { latest, measurements, isLoading, loadMeasurements } = useBodySimStore();
  const [tab, setTab] = useState<Tab>('avatar');

  useEffect(() => {
    loadMeasurements();
  }, []);

  const weightKg = latest?.weight ? toKg(latest.weight, latest.weightUnit) : null;
  const heightCm = latest?.height ? toCm(latest.height, latest.heightUnit) : null;
  const bmi = weightKg && heightCm ? calculateBMI(weightKg, heightCm) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;
  const bodyFat = bmi && latest?.age ? estimateBodyFat(bmi, latest.age, latest.gender === 'male') : null;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'avatar', label: 'Avatar' },
    { id: 'form', label: 'Log' },
    { id: 'history', label: 'History' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Body Sim</Text>
          <Text style={styles.subtitle}>Track your transformation</Text>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabBtn, tab === t.id && styles.tabBtnActive]}
              onPress={() => setTab(t.id)}
            >
              <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'avatar' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.avatarScrollContent}>
            {!latest ? (
              <NoDataCard onPress={() => setTab('form')} />
            ) : (
              <>
                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <StatCard label="Weight" value={`${latest.weight?.toFixed(1) ?? '—'} ${latest.weightUnit}`} />
                  <StatCard label="Height" value={`${latest.height?.toFixed(0) ?? '—'} ${latest.heightUnit}`} />
                  {bmi && (
                    <StatCard
                      label="BMI"
                      value={bmi.toFixed(1)}
                      valueColor={bmiCategory?.color}
                      sub={bmiCategory?.label}
                    />
                  )}
                </View>

                {bodyFat && (
                  <View style={styles.bodyFatRow}>
                    <Text style={styles.bodyFatLabel}>Est. Body Fat</Text>
                    <Text style={styles.bodyFatValue}>{bodyFat.toFixed(1)}%</Text>
                  </View>
                )}

                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  <AvatarSVG
                    bmi={bmi ?? 22}
                    isMale={latest.gender !== 'female'}
                    waistCm={latest.waist ? toCm(latest.waist, 'cm') : undefined}
                    hipsCm={latest.hips ? toCm(latest.hips, 'cm') : undefined}
                    heightCm={heightCm ?? undefined}
                  />
                </View>

                {/* Measurements detail */}
                {(latest.chest || latest.waist || latest.hips) && (
                  <View style={styles.measureCard}>
                    <Text style={styles.measureCardTitle}>Body Measurements</Text>
                    <View style={styles.measureGrid}>
                      {latest.chest && <MeasureRow label="Chest" value={latest.chest} />}
                      {latest.waist && <MeasureRow label="Waist" value={latest.waist} />}
                      {latest.hips && <MeasureRow label="Hips" value={latest.hips} />}
                      {latest.arms && <MeasureRow label="Arms" value={latest.arms} />}
                      {latest.thighs && <MeasureRow label="Thighs" value={latest.thighs} />}
                      {latest.neck && <MeasureRow label="Neck" value={latest.neck} />}
                    </View>
                  </View>
                )}

                <TouchableOpacity style={styles.updateBtn} onPress={() => setTab('form')}>
                  <Ionicons name="pencil" size={16} color={Colors.white} />
                  <Text style={styles.updateBtnText}>Update Measurements</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {tab === 'form' && (
          <MeasurementsForm onSaved={() => { loadMeasurements(); setTab('avatar'); }} />
        )}

        {tab === 'history' && (
          <MeasurementHistory measurements={measurements} />
        )}
      </View>
    </SafeAreaView>
  );
}

function StatCard({ label, value, valueColor, sub }: { label: string; value: string; valueColor?: string; sub?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor && { color: valueColor }]}>{value}</Text>
      {sub && <Text style={[styles.statSub, valueColor && { color: valueColor }]}>{sub}</Text>}
    </View>
  );
}

function MeasureRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.measureRow}>
      <Text style={styles.measureLabel}>{label}</Text>
      <Text style={styles.measureValue}>{value.toFixed(1)} cm</Text>
    </View>
  );
}

function NoDataCard({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.noDataCard}>
      <Ionicons name="body-outline" size={52} color={Colors.muted} />
      <Text style={styles.noDataTitle}>No data yet</Text>
      <Text style={styles.noDataText}>Log your measurements to generate your personalised body avatar.</Text>
      <TouchableOpacity style={styles.startBtn} onPress={onPress}>
        <Text style={styles.startBtnText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

function WeightTrendChart({ measurements }: { measurements: any[] }) {
  const withWeight = measurements.filter(m => m.weight).slice(0, 10).reverse();
  if (withWeight.length < 2) return null;

  const weights = withWeight.map((m: any) => toKg(m.weight, m.weightUnit));
  const maxW = Math.max(...weights);
  const minW = Math.min(...weights);
  const range = maxW - minW || 1;

  return (
    <View style={styles.trendCard}>
      <Text style={styles.trendTitle}>Weight Trend</Text>
      <View style={styles.trendChart}>
        {withWeight.map((m: any, i: number) => {
          const w = toKg(m.weight, m.weightUnit);
          const barH = 12 + ((w - minW) / range) * 46;
          const isLatest = i === withWeight.length - 1;
          return (
            <View key={i} style={styles.trendBarCol}>
              <Text style={styles.trendBarLabel}>{w.toFixed(0)}</Text>
              <View style={[styles.trendBar, { height: barH }, isLatest && styles.trendBarActive]} />
              <Text style={styles.trendDateLabel}>
                {new Date(m.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={styles.trendLegend}>
        <Text style={styles.trendLegendText}>Min: {minW.toFixed(1)}kg</Text>
        <Text style={[styles.trendLegendText, { color: weights[weights.length - 1] > weights[0] ? Colors.danger : Colors.success }]}>
          {weights[weights.length - 1] > weights[0] ? '▲' : '▼'} {Math.abs(weights[weights.length - 1] - weights[0]).toFixed(1)}kg
        </Text>
        <Text style={styles.trendLegendText}>Max: {maxW.toFixed(1)}kg</Text>
      </View>
    </View>
  );
}

function MeasurementHistory({ measurements }: { measurements: any[] }) {
  if (measurements.length === 0) {
    return (
      <View style={styles.noDataCard}>
        <Ionicons name="calendar-outline" size={48} color={Colors.muted} />
        <Text style={styles.noDataTitle}>No history yet</Text>
        <Text style={styles.noDataText}>Each time you log measurements, they'll appear here so you can track your progress.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
      <WeightTrendChart measurements={measurements} />
      <Text style={styles.historyTitle}>Measurement Log</Text>
      {measurements.map((m, i) => {
        const wKg = m.weight ? toKg(m.weight, m.weightUnit) : null;
        const hCm = m.height ? toCm(m.height, m.heightUnit) : null;
        const bmi = wKg && hCm ? calculateBMI(wKg, hCm) : null;
        const cat = bmi ? getBMICategory(bmi) : null;
        return (
          <View key={m.id ?? i} style={styles.historyCard}>
            <View style={styles.historyRow}>
              <Text style={styles.historyDate}>{formatDate(m.date)}</Text>
              {bmi && (
                <View style={[styles.bmiPill, { backgroundColor: (cat?.color ?? '#888') + '22' }]}>
                  <Text style={[styles.bmiPillText, { color: cat?.color }]}>BMI {bmi.toFixed(1)}</Text>
                </View>
              )}
            </View>
            <View style={styles.historyDetails}>
              {m.weight && <Text style={styles.historyDetail}>{m.weight} {m.weightUnit}</Text>}
              {m.waist && <Text style={styles.historyDetail}>Waist {m.waist}cm</Text>}
              {m.hips && <Text style={styles.historyDetail}>Hips {m.hips}cm</Text>}
              {m.chest && <Text style={styles.historyDetail}>Chest {m.chest}cm</Text>}
              {m.arms && <Text style={styles.historyDetail}>Arms {m.arms}cm</Text>}
            </View>
          </View>
        );
      })}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.subtext, marginTop: 4 },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  tabBtnActive: { backgroundColor: Colors.accent },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.subtext },
  tabTextActive: { color: Colors.white },
  avatarScrollContent: { paddingHorizontal: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: { fontSize: 11, color: Colors.subtext, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.text, marginTop: 4 },
  statSub: { fontSize: 11, color: Colors.subtext, marginTop: 2 },
  bodyFatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bodyFatLabel: { fontSize: 14, color: Colors.subtext, fontWeight: '600' },
  bodyFatValue: { fontSize: 18, fontWeight: '800', color: Colors.accent },
  avatarContainer: { alignItems: 'center', marginVertical: 8 },
  measureCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  measureCardTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  measureGrid: { gap: 4 },
  measureRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: Colors.border },
  measureLabel: { fontSize: 14, color: Colors.subtext },
  measureValue: { fontSize: 14, fontWeight: '600', color: Colors.text },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 16,
  },
  updateBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  noDataCard: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  noDataTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginTop: 16, marginBottom: 8 },
  noDataText: { fontSize: 14, color: Colors.subtext, textAlign: 'center', lineHeight: 20 },
  startBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 20,
  },
  startBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  trendCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trendTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 6,
    marginBottom: 10,
  },
  trendBarCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  trendBarLabel: { fontSize: 9, color: Colors.subtext, fontWeight: '600' },
  trendBar: { width: '70%', backgroundColor: Colors.accent + '55', borderRadius: 4 },
  trendBarActive: { backgroundColor: Colors.accent },
  trendDateLabel: { fontSize: 8, color: Colors.muted, textAlign: 'center' },
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingTop: 8,
  },
  trendLegendText: { fontSize: 11, color: Colors.subtext, fontWeight: '600' },
  historyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12, marginTop: 4 },
  historyCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  historyDate: { fontSize: 14, fontWeight: '600', color: Colors.text },
  bmiPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  bmiPillText: { fontSize: 12, fontWeight: '700' },
  historyDetails: { flexDirection: 'row', gap: 12 },
  historyDetail: { fontSize: 13, color: Colors.subtext },
});
