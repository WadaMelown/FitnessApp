import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useBodySimStore, BodySimState } from '@/store/useBodySimStore';

interface Props {
  onSaved?: () => void;
}

export default function MeasurementsForm({ onSaved }: Props) {
  const addMeasurement = useBodySimStore((s: BodySimState) => s.addMeasurement);

  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');
  const [neck, setNeck] = useState('');
  const [saving, setSaving] = useState(false);

  const parseNum = (v: string) => parseFloat(v) || undefined;

  const handleSave = useCallback(async () => {
    if (!weight || !height) {
      Alert.alert('Required', 'Weight and height are required.');
      return;
    }
    setSaving(true);
    try {
      await addMeasurement({
        date: new Date().toISOString().split('T')[0],
        weight: parseNum(weight),
        weightUnit,
        height: parseNum(height),
        heightUnit,
        chest: parseNum(chest),
        waist: parseNum(waist),
        hips: parseNum(hips),
        arms: parseNum(arms),
        thighs: parseNum(thighs),
        neck: parseNum(neck),
        age: parseNum(age),
        gender,
      });
      onSaved?.();
      Alert.alert('Saved!', 'Measurements logged. Your avatar has been updated.');
    } catch (e) {
      Alert.alert('Error', 'Could not save measurements.');
    } finally {
      setSaving(false);
    }
  }, [weight, height, weightUnit, heightUnit, chest, waist, hips, arms, thighs, neck, age, gender]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Gender */}
        <Label>Gender</Label>
        <View style={styles.genderRow}>
          {(['male', 'female'] as const).map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
              onPress={() => setGender(g)}
            >
              <Text style={styles.genderEmoji}>{g === 'male' ? '♂' : '♀'}</Text>
              <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Required Measurements */}
        <Label>Required</Label>
        <View style={styles.row}>
          <FieldGroup label={`Weight (${weightUnit})`} value={weight} onChange={setWeight} keyType="decimal-pad">
            <TouchableOpacity style={styles.unitToggle} onPress={() => setWeightUnit(u => u === 'kg' ? 'lbs' : 'kg')}>
              <Text style={styles.unitText}>{weightUnit}</Text>
            </TouchableOpacity>
          </FieldGroup>
          <FieldGroup label={`Height (${heightUnit})`} value={height} onChange={setHeight} keyType="decimal-pad">
            <TouchableOpacity style={styles.unitToggle} onPress={() => setHeightUnit(u => u === 'cm' ? 'in' : 'cm')}>
              <Text style={styles.unitText}>{heightUnit}</Text>
            </TouchableOpacity>
          </FieldGroup>
          <FieldGroup label="Age" value={age} onChange={setAge} keyType="number-pad" />
        </View>

        {/* Body Measurements */}
        <Label>Body Measurements (cm)</Label>
        <View style={styles.row}>
          <FieldGroup label="Chest" value={chest} onChange={setChest} keyType="decimal-pad" />
          <FieldGroup label="Waist" value={waist} onChange={setWaist} keyType="decimal-pad" />
          <FieldGroup label="Hips" value={hips} onChange={setHips} keyType="decimal-pad" />
        </View>
        <View style={styles.row}>
          <FieldGroup label="Arms" value={arms} onChange={setArms} keyType="decimal-pad" />
          <FieldGroup label="Thighs" value={thighs} onChange={setThighs} keyType="decimal-pad" />
          <FieldGroup label="Neck" value={neck} onChange={setNeck} keyType="decimal-pad" />
        </View>

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          <Ionicons name="save-outline" size={18} color={Colors.white} />
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Measurements'}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

function FieldGroup({ label, value, onChange, keyType, children }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyType?: any;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldInputRow}>
        <TextInput
          style={[styles.fieldInput, children ? { flex: 1 } : undefined]}
          value={value}
          onChangeText={onChange}
          keyboardType={keyType ?? 'default'}
          placeholderTextColor={Colors.muted}
          placeholder="—"
          selectionColor={Colors.accent}
        />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.subtext,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 8,
  },
  genderRow: { flexDirection: 'row', gap: 12 },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  genderBtnActive: { borderColor: Colors.accent, backgroundColor: Colors.accentDim },
  genderEmoji: { fontSize: 20 },
  genderText: { fontSize: 15, fontWeight: '600', color: Colors.subtext },
  genderTextActive: { color: Colors.accentLight },
  row: { flexDirection: 'row', gap: 10 },
  fieldGroup: { flex: 1 },
  fieldLabel: { fontSize: 12, color: Colors.subtext, marginBottom: 4, fontWeight: '500' },
  fieldInputRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fieldInput: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 11,
    textAlign: 'center',
    flex: 1,
  },
  unitToggle: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 11,
  },
  unitText: { fontSize: 12, color: Colors.accentLight, fontWeight: '700' },
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
  saveBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
