import React, { useEffect, useState } from 'react';
import Svg, {
  Path, Circle, G, Defs, LinearGradient, Stop, Ellipse,
  Line, Text as SvgText, Rect,
} from 'react-native-svg';
import { Colors } from '@/constants/colors';

export type BodyView = 'front' | 'back';

interface Props {
  view: BodyView;
  isMale: boolean;
  selectedMuscle: string | null;
  onMusclePress: (muscleId: string) => void;
  width?: number;
  height?: number;
}

// ── Dot marker definition ──────────────────────────────────────────────────
interface Dot {
  id: string;
  label: string;
  dotX: number;   // SVG x of the dot (on body)
  dotY: number;   // SVG y of the dot
  labelX: number; // SVG x of label text anchor
  labelY: number; // SVG y of label text
  side: 'left' | 'right'; // which side label is on
}

// Front dots — positioned on a 260×480 viewBox
const FRONT_DOTS: Dot[] = [
  { id: 'shoulders', label: 'Shoulders', dotX: 87,  dotY: 103, labelX: 12,  labelY: 103, side: 'left'  },
  { id: 'chest',     label: 'Chest',     dotX: 130, dotY: 136, labelX: 248, labelY: 128, side: 'right' },
  { id: 'biceps',    label: 'Biceps',    dotX: 72,  dotY: 165, labelX: 12,  labelY: 165, side: 'left'  },
  { id: 'forearms',  label: 'Forearms',  dotX: 60,  dotY: 218, labelX: 12,  labelY: 218, side: 'left'  },
  { id: 'abs',       label: 'Abs',       dotX: 130, dotY: 192, labelX: 248, labelY: 192, side: 'right' },
  { id: 'obliques',  label: 'Obliques',  dotX: 107, dotY: 210, labelX: 248, labelY: 218, side: 'right' },
  { id: 'quads',     label: 'Quads',     dotX: 150, dotY: 325, labelX: 248, labelY: 325, side: 'right' },
  { id: 'calves',    label: 'Calves',    dotX: 110, dotY: 412, labelX: 12,  labelY: 412, side: 'left'  },
];

// Back dots
const BACK_DOTS: Dot[] = [
  { id: 'traps',      label: 'Traps',       dotX: 130, dotY: 108, labelX: 248, labelY: 100, side: 'right' },
  { id: 'rearDelts',  label: 'Rear Delts',  dotX: 87,  dotY: 108, labelX: 12,  labelY: 100, side: 'left'  },
  { id: 'lats',       label: 'Lats',        dotX: 152, dotY: 163, labelX: 248, labelY: 163, side: 'right' },
  { id: 'triceps',    label: 'Triceps',     dotX: 72,  dotY: 168, labelX: 12,  labelY: 168, side: 'left'  },
  { id: 'lowerBack',  label: 'Lower Back',  dotX: 130, dotY: 210, labelX: 248, labelY: 210, side: 'right' },
  { id: 'forearms',   label: 'Forearms',    dotX: 60,  dotY: 222, labelX: 12,  labelY: 222, side: 'left'  },
  { id: 'glutes',     label: 'Glutes',      dotX: 130, dotY: 266, labelX: 248, labelY: 266, side: 'right' },
  { id: 'hamstrings', label: 'Hamstrings',  dotX: 112, dotY: 330, labelX: 12,  labelY: 330, side: 'left'  },
  { id: 'calves',     label: 'Calves',      dotX: 150, dotY: 410, labelX: 248, labelY: 410, side: 'right' },
];

export default function BodyModelSVG({
  view, isMale, selectedMuscle, onMusclePress, width = 240, height = 480,
}: Props) {
  const [dotScale, setDotScale] = useState(1.0);

  useEffect(() => {
    if (!selectedMuscle) { setDotScale(1.0); return; }
    let s = 1.0; let d = 1;
    const t = setInterval(() => {
      s += d * 0.06;
      if (s >= 1.5) d = -1;
      if (s <= 0.8) d = 1;
      setDotScale(s);
    }, 30);
    return () => clearInterval(t);
  }, [selectedMuscle]);

  const sel = (id: string) => selectedMuscle === id;
  const dots = view === 'front' ? FRONT_DOTS : BACK_DOTS;

  // cx = 130 (center of 260-wide viewBox)
  const cx = 130;

  // ── Body proportions (athletic, BMI ~22) ──────────────────────────────────
  // Male: shoulders 44, waist 28, hips 34
  // Female: shoulders 38, waist 26, hips 40 (wider hips)
  const shoulderW = isMale ? 44 : 38;
  const waistW    = isMale ? 28 : 26;
  const hipW      = isMale ? 34 : 42;
  const armW      = isMale ? 12 : 10;
  const legW      = isMale ? 16 : 14;

  const headR      = 28;
  const headCY     = 46;
  const neckTop    = headCY + headR - 4;
  const neckBot    = 88;
  const shoulderY  = 93;
  const waistY     = 210;
  const hipY       = 255;
  const legSepY    = 272;
  const kneeY      = 372;
  const calfBotY   = 460;

  // Arm positions
  const armOuterTopX = cx - shoulderW - 4;
  const armInnerTopX = cx - shoulderW + 2;
  const armOuterBotX = cx - shoulderW - armW - 4;
  const armInnerBotX = cx - shoulderW - 2;
  const elbowY = 190;
  const forearmOuterX = armOuterBotX - 2;
  const forearmInnerX = armInnerBotX + 2;
  const forearmBotY = 260;

  // Torso path
  const torsoPath = [
    `M ${cx - shoulderW},${shoulderY}`,
    `Q ${cx - shoulderW - 5},${(shoulderY + waistY) / 2} ${cx - waistW},${waistY}`,
    `Q ${cx - waistW - 3},${(waistY + hipY) / 2} ${cx - hipW},${hipY}`,
    `L ${cx - hipW},${legSepY} L ${cx + hipW},${legSepY}`,
    `Q ${cx + waistW + 3},${(waistY + hipY) / 2} ${cx + waistW},${waistY}`,
    `Q ${cx + shoulderW + 5},${(shoulderY + waistY) / 2} ${cx + shoulderW},${shoulderY}`,
    'Z',
  ].join(' ');

  // Left upper arm
  const leftUpperArm = [
    `M ${armOuterTopX},${shoulderY}`,
    `Q ${armOuterTopX - 6},${(shoulderY + elbowY) / 2} ${armOuterBotX},${elbowY}`,
    `L ${armInnerBotX},${elbowY}`,
    `Q ${armInnerTopX + 4},${(shoulderY + elbowY) / 2} ${armInnerTopX},${shoulderY}`,
    'Z',
  ].join(' ');

  // Left forearm
  const leftForearm = [
    `M ${armOuterBotX},${elbowY}`,
    `Q ${forearmOuterX - 2},${(elbowY + forearmBotY) / 2} ${forearmOuterX},${forearmBotY}`,
    `L ${forearmInnerX},${forearmBotY}`,
    `Q ${armInnerBotX + 2},${(elbowY + forearmBotY) / 2} ${armInnerBotX},${elbowY}`,
    'Z',
  ].join(' ');

  // Mirror for right arm
  const mirrorX = (x: number) => 2 * cx - x;

  const rightUpperArm = [
    `M ${mirrorX(armOuterTopX)},${shoulderY}`,
    `Q ${mirrorX(armOuterTopX) + 6},${(shoulderY + elbowY) / 2} ${mirrorX(armOuterBotX)},${elbowY}`,
    `L ${mirrorX(armInnerBotX)},${elbowY}`,
    `Q ${mirrorX(armInnerTopX) - 4},${(shoulderY + elbowY) / 2} ${mirrorX(armInnerTopX)},${shoulderY}`,
    'Z',
  ].join(' ');

  const rightForearm = [
    `M ${mirrorX(armOuterBotX)},${elbowY}`,
    `Q ${mirrorX(forearmOuterX) + 2},${(elbowY + forearmBotY) / 2} ${mirrorX(forearmOuterX)},${forearmBotY}`,
    `L ${mirrorX(forearmInnerX)},${forearmBotY}`,
    `Q ${mirrorX(armInnerBotX) - 2},${(elbowY + forearmBotY) / 2} ${mirrorX(armInnerBotX)},${elbowY}`,
    'Z',
  ].join(' ');

  // Left thigh
  const thighOuterX = cx - hipW + 2;
  const thighInnerX = cx - legW * 0.5;
  const leftThigh = [
    `M ${thighOuterX},${legSepY}`,
    `Q ${thighOuterX - 4},${(legSepY + kneeY) / 2} ${thighOuterX},${kneeY}`,
    `L ${thighInnerX + legW},${kneeY}`,
    `Q ${thighInnerX + legW + 2},${(legSepY + kneeY) / 2} ${thighInnerX},${legSepY}`,
    'Z',
  ].join(' ');

  // Left calf
  const calfOuterX = thighOuterX + 2;
  const calfInnerX = thighInnerX + legW - 2;
  const leftCalf = [
    `M ${calfOuterX},${kneeY + 2}`,
    `Q ${calfOuterX - 3},${(kneeY + calfBotY) / 2} ${calfOuterX + 2},${calfBotY}`,
    `L ${calfInnerX - 2},${calfBotY}`,
    `Q ${calfInnerX + 3},${(kneeY + calfBotY) / 2} ${calfInnerX},${kneeY + 2}`,
    'Z',
  ].join(' ');

  // Right thigh/calf (mirror)
  const rightThigh = [
    `M ${mirrorX(thighOuterX)},${legSepY}`,
    `Q ${mirrorX(thighOuterX) + 4},${(legSepY + kneeY) / 2} ${mirrorX(thighOuterX)},${kneeY}`,
    `L ${mirrorX(thighInnerX + legW)},${kneeY}`,
    `Q ${mirrorX(thighInnerX + legW) - 2},${(legSepY + kneeY) / 2} ${mirrorX(thighInnerX)},${legSepY}`,
    'Z',
  ].join(' ');

  const rightCalf = [
    `M ${mirrorX(calfOuterX)},${kneeY + 2}`,
    `Q ${mirrorX(calfOuterX) + 3},${(kneeY + calfBotY) / 2} ${mirrorX(calfOuterX) - 2},${calfBotY}`,
    `L ${mirrorX(calfInnerX) + 2},${calfBotY}`,
    `Q ${mirrorX(calfInnerX) - 3},${(kneeY + calfBotY) / 2} ${mirrorX(calfInnerX)},${kneeY + 2}`,
    'Z',
  ].join(' ');

  const SILHOUETTE = '#252558';
  const SILHOUETTE_STROKE = '#3838A0';
  const SILHOUETTE_LIGHT = '#2C2C62';

  return (
    <Svg width={width} height={height} viewBox="0 0 260 480">
      <Defs>
        <LinearGradient id="torsoG" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0%" stopColor="#2E2E68" />
          <Stop offset="50%" stopColor="#252558" />
          <Stop offset="100%" stopColor="#1E1E48" />
        </LinearGradient>
        <LinearGradient id="limbG" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor="#2A2A60" />
          <Stop offset="100%" stopColor="#1C1C44" />
        </LinearGradient>
        <LinearGradient id="headG" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#303070" />
          <Stop offset="100%" stopColor="#242460" />
        </LinearGradient>
      </Defs>

      {/* ── LIMBS (behind torso) ── */}
      <Path d={leftUpperArm}  fill="url(#limbG)" stroke={SILHOUETTE_STROKE} strokeWidth={1.2} />
      <Path d={rightUpperArm} fill="url(#limbG)" stroke={SILHOUETTE_STROKE} strokeWidth={1.2} />
      <Path d={leftForearm}   fill="url(#limbG)" stroke={SILHOUETTE_STROKE} strokeWidth={1.2} />
      <Path d={rightForearm}  fill="url(#limbG)" stroke={SILHOUETTE_STROKE} strokeWidth={1.2} />
      <Path d={leftThigh}     fill="url(#limbG)" stroke={SILHOUETTE_STROKE} strokeWidth={1.2} />
      <Path d={rightThigh}    fill="url(#limbG)" stroke={SILHOUETTE_STROKE} strokeWidth={1.2} />
      <Path d={leftCalf}      fill="url(#limbG)" stroke={SILHOUETTE_STROKE} strokeWidth={1.2} />
      <Path d={rightCalf}     fill="url(#limbG)" stroke={SILHOUETTE_STROKE} strokeWidth={1.2} />

      {/* Feet */}
      <Ellipse cx={cx - hipW + 6}  cy={calfBotY + 6} rx={14} ry={7} fill={SILHOUETTE} stroke={SILHOUETTE_STROKE} strokeWidth={1} />
      <Ellipse cx={cx + hipW - 6}  cy={calfBotY + 6} rx={14} ry={7} fill={SILHOUETTE} stroke={SILHOUETTE_STROKE} strokeWidth={1} />

      {/* ── TORSO ── */}
      <Path d={torsoPath} fill="url(#torsoG)" stroke={SILHOUETTE_STROKE} strokeWidth={1.2} />

      {/* Female breast indication */}
      {!isMale && (
        <G opacity={0.45}>
          <Ellipse cx={cx - 16} cy={138} rx={13} ry={16} fill={SILHOUETTE_LIGHT} />
          <Ellipse cx={cx + 16} cy={138} rx={13} ry={16} fill={SILHOUETTE_LIGHT} />
        </G>
      )}

      {/* ── NECK ── */}
      <Rect
        x={cx - 9} y={neckTop} width={18} height={neckBot - neckTop}
        rx={6} fill="url(#headG)" stroke={SILHOUETTE_STROKE} strokeWidth={0.8}
      />

      {/* ── HEAD ── */}
      <Circle cx={cx} cy={headCY} r={headR} fill="url(#headG)" stroke={SILHOUETTE_STROKE} strokeWidth={1.2} />

      {/* Face — front only */}
      {view === 'front' && (
        <>
          {/* Hair */}
          {isMale
            ? <Path d={`M ${cx-26},${headCY-10} Q ${cx},${headCY-34} ${cx+26},${headCY-10} Q ${cx+28},${headCY-22} ${cx},${headCY-30} Q ${cx-28},${headCY-22} ${cx-26},${headCY-10} Z`} fill="#12122C" />
            : <Path d={`M ${cx-28},${headCY-4} Q ${cx-32},${headCY-28} ${cx},${headCY-34} Q ${cx+32},${headCY-28} ${cx+28},${headCY-4} Q ${cx+26},${headCY-20} ${cx},${headCY-28} Q ${cx-26},${headCY-20} ${cx-28},${headCY-4} Z`} fill="#12122C" />
          }
          {/* Eyes */}
          <Circle cx={cx - 9} cy={headCY + 2} r={4} fill="#0E0E26" />
          <Circle cx={cx + 9} cy={headCY + 2} r={4} fill="#0E0E26" />
          <Circle cx={cx - 8} cy={headCY + 1} r={1.6} fill="#4848B8" />
          <Circle cx={cx + 10} cy={headCY + 1} r={1.6} fill="#4848B8" />
          {/* Eyebrows */}
          <Path d={`M ${cx-13},${headCY-7} Q ${cx-8},${headCY-10} ${cx-3},${headCY-7}`} stroke="#1E1E50" strokeWidth={1.8} fill="none" strokeLinecap="round" />
          <Path d={`M ${cx+3},${headCY-7} Q ${cx+8},${headCY-10} ${cx+13},${headCY-7}`} stroke="#1E1E50" strokeWidth={1.8} fill="none" strokeLinecap="round" />
          {/* Nose + mouth */}
          <Path d={`M ${cx-2},${headCY+9} Q ${cx},${headCY+12} ${cx+2},${headCY+9}`} stroke="#1E1E50" strokeWidth={1.0} fill="none" />
          <Path d={`M ${cx-7},${headCY+18} Q ${cx},${headCY+22} ${cx+7},${headCY+18}`} stroke="#1E1E50" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        </>
      )}
      {/* Back — just hair */}
      {view === 'back' && (
        isMale
          ? <Path d={`M ${cx-26},${headCY-10} Q ${cx},${headCY-34} ${cx+26},${headCY-10} Q ${cx+28},${headCY-22} ${cx},${headCY-30} Q ${cx-28},${headCY-22} ${cx-26},${headCY-10} Z`} fill="#12122C" />
          : <Path d={`M ${cx-28},${headCY-4} Q ${cx-32},${headCY-28} ${cx},${headCY-34} Q ${cx+32},${headCY-28} ${cx+28},${headCY+10} Q ${cx+22},${headCY+30} ${cx},${headCY+32} Q ${cx-22},${headCY+30} ${cx-28},${headCY+10} Z`} fill="#12122C" />
      )}

      {/* ── DOT MARKERS ── */}
      {dots.map((dot) => {
        const active = sel(dot.id);
        const r = active ? 8 * dotScale : 7;
        const dotFill = active ? Colors.accent : Colors.accent;
        const dotOpacity = active ? 1.0 : 0.35;
        const lineColor = active ? Colors.accentLight + 'CC' : '#4040A0';
        const labelColor = active ? Colors.accentLight : '#6868B0';
        const isFontBold = active;

        // Line: from label end to dot
        const labelLineX = dot.side === 'left'
          ? dot.labelX + dot.label.length * 4.5
          : dot.labelX - dot.label.length * 4.5;

        return (
          <G key={dot.id} onPress={() => onMusclePress(dot.id)}>
            {/* Glow ring when selected */}
            {active && (
              <Circle
                cx={dot.dotX} cy={dot.dotY} r={r + 6}
                fill={Colors.accent}
                opacity={0.18 * dotScale}
              />
            )}
            {/* Connector line */}
            <Line
              x1={labelLineX} y1={dot.labelY - 2}
              x2={dot.dotX}   y2={dot.dotY}
              stroke={lineColor}
              strokeWidth={0.9}
              strokeDasharray="3,3"
            />
            {/* Label */}
            <SvgText
              x={dot.labelX}
              y={dot.labelY + 3}
              fontSize={7.5}
              fill={labelColor}
              fontWeight={isFontBold ? 'bold' : 'normal'}
              textAnchor={dot.side === 'right' ? 'end' : 'start'}
            >
              {dot.label}
            </SvgText>
            {/* Dot */}
            <Circle
              cx={dot.dotX} cy={dot.dotY} r={r}
              fill={dotFill}
              opacity={dotOpacity}
            />
            {/* Dot inner highlight */}
            <Circle
              cx={dot.dotX - 2} cy={dot.dotY - 2} r={r * 0.35}
              fill={Colors.white}
              opacity={active ? 0.5 : 0.15}
            />
          </G>
        );
      })}
    </Svg>
  );
}
