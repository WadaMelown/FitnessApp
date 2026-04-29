import React from 'react';
import Svg, { Path, Ellipse, Circle, G, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/colors';

interface AvatarProps {
  bmi: number;
  isMale: boolean;
  waistCm?: number;
  hipsCm?: number;
  heightCm?: number;
}

// Derive visual scale factors from BMI
function getScales(bmi: number, waistCm?: number, heightCm?: number) {
  const refBMI = 22;
  const ratio = bmi / refBMI;
  const torsoW = Math.max(0.65, Math.min(1.55, ratio));
  const limbs = Math.max(0.78, Math.min(1.35, Math.sqrt(ratio)));
  const belly = waistCm && heightCm
    ? Math.max(0.7, Math.min(1.6, (waistCm / (heightCm * 0.45))))
    : Math.max(0.7, Math.min(1.6, ratio * 1.15));
  return { torsoW, limbs, belly };
}

export default function AvatarSVG({ bmi, isMale, waistCm, hipsCm, heightCm }: AvatarProps) {
  const s = getScales(bmi, waistCm, heightCm);
  const cx = 100;

  // Dynamic widths based on scale
  const shoulderW = 34 * s.torsoW;
  const waistW = isMale ? 22 * s.belly : 20 * s.belly;
  const hipW = isMale ? 26 * s.torsoW : 30 * s.torsoW * 1.1;
  const armW = 9 * s.limbs;
  const legW = 14 * s.limbs;

  // Torso shape using path (trapezoid-ish with waist nip)
  const shoulderY = 80;
  const waistY = 160;
  const hipY = 200;
  const legTopY = 220;

  const torsoPath = [
    `M ${cx - shoulderW},${shoulderY}`,
    `Q ${cx - shoulderW - 4},${(shoulderY + waistY) / 2} ${cx - waistW},${waistY}`,
    `Q ${cx - waistW - 2},${(waistY + hipY) / 2} ${cx - hipW},${hipY}`,
    `L ${cx - hipW},${legTopY}`,
    `L ${cx + hipW},${legTopY}`,
    `Q ${cx + hipW + 2},${(waistY + hipY) / 2} ${cx + waistW},${waistY}`,
    `Q ${cx + shoulderW + 4},${(shoulderY + waistY) / 2} ${cx + shoulderW},${shoulderY}`,
    'Z',
  ].join(' ');

  const bodyColor = '#2A2A4A';
  const skinColor = '#3A3A5A';
  const accentCol = Colors.accent + 'AA';

  return (
    <Svg width="200" height="420" viewBox="0 0 200 420">
      <Defs>
        <LinearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#22223A" />
          <Stop offset="0.5" stopColor="#2E2E50" />
          <Stop offset="1" stopColor="#22223A" />
        </LinearGradient>
        <LinearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={Colors.accent} stopOpacity="0.6" />
          <Stop offset="1" stopColor={Colors.accent} stopOpacity="0.1" />
        </LinearGradient>
      </Defs>

      {/* ── Head ── */}
      <Circle cx={cx} cy={40} r={28} fill={skinColor} stroke={Colors.border} strokeWidth={1} />
      {/* Face details */}
      <Circle cx={cx - 9} cy={38} r={3.5} fill="#1E1E30" />
      <Circle cx={cx + 9} cy={38} r={3.5} fill="#1E1E30" />
      <Path d={`M ${cx - 7},47 Q ${cx},51 ${cx + 7},47`} stroke="#1E1E30" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      {/* Hair */}
      {isMale
        ? <Path d={`M ${cx - 26},30 Q ${cx},16 ${cx + 26},30 Q ${cx + 28},22 ${cx},14 Q ${cx - 28},22 ${cx - 26},30 Z`} fill="#1A1A2E" />
        : <Path d={`M ${cx - 28},36 Q ${cx - 30},16 ${cx},12 Q ${cx + 30},16 ${cx + 28},36 Q ${cx + 24},20 ${cx},14 Q ${cx - 24},20 ${cx - 28},36 Z`} fill="#1A1A2E" />
      }

      {/* ── Neck ── */}
      <Rect x={cx - 10} y={68} width={20} height={14} rx={5} fill={skinColor} />

      {/* ── Torso ── */}
      <Path d={torsoPath} fill="url(#bodyGrad)" stroke={Colors.border} strokeWidth={1} />

      {/* Female breast indication */}
      {!isMale && (
        <G opacity={0.5}>
          <Ellipse cx={cx - waistW * 0.7} cy={120} rx={waistW * 0.5} ry={14 * s.torsoW} fill={skinColor} />
          <Ellipse cx={cx + waistW * 0.7} cy={120} rx={waistW * 0.5} ry={14 * s.torsoW} fill={skinColor} />
        </G>
      )}

      {/* ── Left Arm ── */}
      <Path
        d={`M ${cx - shoulderW},${shoulderY} Q ${cx - shoulderW - armW - 8},${shoulderY + 20} ${cx - shoulderW - armW - 6},${shoulderY + 90} L ${cx - shoulderW - armW + 6},${shoulderY + 90} Q ${cx - shoulderW + 2},${shoulderY + 20} ${cx - shoulderW + 4},${shoulderY} Z`}
        fill={bodyColor}
        stroke={Colors.border}
        strokeWidth={1}
      />
      {/* Left forearm */}
      <Path
        d={`M ${cx - shoulderW - armW - 6},${shoulderY + 90} Q ${cx - shoulderW - armW - 4},${shoulderY + 155} ${cx - shoulderW - armW + 2},${shoulderY + 165} L ${cx - shoulderW - armW + 10},${shoulderY + 165} Q ${cx - shoulderW - armW + 8},${shoulderY + 155} ${cx - shoulderW - armW + 6},${shoulderY + 90} Z`}
        fill={skinColor}
        stroke={Colors.border}
        strokeWidth={1}
      />

      {/* ── Right Arm ── */}
      <Path
        d={`M ${cx + shoulderW},${shoulderY} Q ${cx + shoulderW + armW + 8},${shoulderY + 20} ${cx + shoulderW + armW + 6},${shoulderY + 90} L ${cx + shoulderW + armW - 6},${shoulderY + 90} Q ${cx + shoulderW - 2},${shoulderY + 20} ${cx + shoulderW - 4},${shoulderY} Z`}
        fill={bodyColor}
        stroke={Colors.border}
        strokeWidth={1}
      />
      {/* Right forearm */}
      <Path
        d={`M ${cx + shoulderW + armW + 6},${shoulderY + 90} Q ${cx + shoulderW + armW + 4},${shoulderY + 155} ${cx + shoulderW + armW - 2},${shoulderY + 165} L ${cx + shoulderW + armW - 10},${shoulderY + 165} Q ${cx + shoulderW + armW - 8},${shoulderY + 155} ${cx + shoulderW + armW - 6},${shoulderY + 90} Z`}
        fill={skinColor}
        stroke={Colors.border}
        strokeWidth={1}
      />

      {/* ── Left Leg ── */}
      <Path
        d={`M ${cx - hipW + 4},${legTopY} Q ${cx - hipW - 2},${legTopY + 100} ${cx - hipW + 2},${legTopY + 160} L ${cx - hipW + legW * 1.8},${legTopY + 160} Q ${cx - legW * 0.6},${legTopY + 100} ${cx - legW * 0.6},${legTopY} Z`}
        fill={bodyColor}
        stroke={Colors.border}
        strokeWidth={1}
      />
      {/* Left calf */}
      <Path
        d={`M ${cx - hipW + 2},${legTopY + 160} Q ${cx - hipW},${legTopY + 230} ${cx - hipW + 6},${legTopY + 265} L ${cx - hipW + legW + 2},${legTopY + 265} Q ${cx - legW * 0.2},${legTopY + 230} ${cx - hipW + legW * 1.8},${legTopY + 160} Z`}
        fill={skinColor}
        stroke={Colors.border}
        strokeWidth={1}
      />

      {/* ── Right Leg ── */}
      <Path
        d={`M ${cx + hipW - 4},${legTopY} Q ${cx + hipW + 2},${legTopY + 100} ${cx + hipW - 2},${legTopY + 160} L ${cx + hipW - legW * 1.8},${legTopY + 160} Q ${cx + legW * 0.6},${legTopY + 100} ${cx + legW * 0.6},${legTopY} Z`}
        fill={bodyColor}
        stroke={Colors.border}
        strokeWidth={1}
      />
      {/* Right calf */}
      <Path
        d={`M ${cx + hipW - 2},${legTopY + 160} Q ${cx + hipW},${legTopY + 230} ${cx + hipW - 6},${legTopY + 265} L ${cx + hipW - legW - 2},${legTopY + 265} Q ${cx + legW * 0.2},${legTopY + 230} ${cx + hipW - legW * 1.8},${legTopY + 160} Z`}
        fill={skinColor}
        stroke={Colors.border}
        strokeWidth={1}
      />

      {/* Feet */}
      <Ellipse cx={cx - hipW + 4} cy={legTopY + 270} rx={12 * s.limbs} ry={7} fill={bodyColor} />
      <Ellipse cx={cx + hipW - 4} cy={legTopY + 270} rx={12 * s.limbs} ry={7} fill={bodyColor} />

      {/* ── BMI glow ring around waist ── */}
      <Ellipse
        cx={cx}
        cy={waistY}
        rx={waistW + 8}
        ry={10}
        fill="none"
        stroke="url(#accentGrad)"
        strokeWidth={2}
        opacity={0.5}
      />
    </Svg>
  );
}
