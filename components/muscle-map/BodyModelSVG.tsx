import React, { useEffect, useState } from 'react';
import Svg, {
  Path, Circle, G, Defs, LinearGradient, Stop,
  Line, Text as SvgText,
} from 'react-native-svg';
import { Colors } from '@/constants/colors';

export type BodyView = 'front' | 'back';

interface Props {
  view: BodyView;
  selectedMuscle: string | null;
  onMusclePress: (muscleId: string) => void;
  width?: number;
  height?: number;
}

// Body parts — clearly visible against #0C0C14 background
const BODY_FILL = '#252550';
const BODY_STROKE = '#4848A8';
const BODY_STROKE_W = 1.2;

// Muscle idle: subtle accent tint overlay
const M_IDLE_OPACITY = 0.22;
const M_IDLE_STROKE_OPACITY = 0.55;

export default function BodyModelSVG({ view, selectedMuscle, onMusclePress, width = 220, height = 490 }: Props) {
  const [pulse, setPulse] = useState(0.5);

  useEffect(() => {
    if (!selectedMuscle) { setPulse(0.5); return; }
    let v = 0.5; let d = 1;
    const timer = setInterval(() => {
      v += d * 0.04;
      if (v >= 0.92) d = -1;
      if (v <= 0.28) d = 1;
      setPulse(v);
    }, 28);
    return () => clearInterval(timer);
  }, [selectedMuscle]);

  const sel = (id: string) => selectedMuscle === id;

  // Renders a single muscle path — idle is subtle tint, selected is fully lit + glow
  function MP({ id, d: pd, glow = false }: { id: string; d: string; glow?: boolean }) {
    const active = sel(id);
    return (
      <>
        {active && (
          <Path
            d={pd}
            fill={Colors.accent}
            stroke={Colors.accentLight}
            strokeWidth={glow ? 3 : 2.5}
            opacity={pulse * 0.55}
          />
        )}
        <Path
          d={pd}
          fill={Colors.accent}
          stroke={Colors.accentLight}
          strokeWidth={active ? 1.4 : 1.0}
          fillOpacity={active ? 1.0 : M_IDLE_OPACITY}
          strokeOpacity={active ? 1.0 : M_IDLE_STROKE_OPACITY}
        />
      </>
    );
  }

  const lc = (id: string) => sel(id) ? Colors.accentLight : '#7070C0';
  const lw = (id: string): 'bold' | 'normal' => sel(id) ? 'bold' : 'normal';

  function Label({ id, text, tx, ty, dx, dy, right = false }: {
    id: string; text: string;
    tx: number; ty: number;
    dx: number; dy: number;
    right?: boolean;
  }) {
    const charW = 4.2;
    const textStart = right ? tx : tx - text.length * charW;
    return (
      <G onPress={() => onMusclePress(id)}>
        <Line
          x1={right ? tx : textStart + text.length * charW}
          y1={ty}
          x2={dx} y2={dy}
          stroke={sel(id) ? Colors.accentLight : '#4848A0'}
          strokeWidth={0.9}
          strokeDasharray="2,2.5"
        />
        <Circle cx={dx} cy={dy} r={2.2}
          fill={sel(id) ? Colors.accent : '#4848A0'} />
        <SvgText
          x={textStart}
          y={ty + 2.5}
          fontSize={6.8}
          fill={lc(id)}
          fontWeight={lw(id)}
        >{text}</SvgText>
      </G>
    );
  }

  // ── BODY PATHS (viewBox 0 0 200 445) ──
  const head = { cx: 100, cy: 30, r: 22 };

  const torso = `
    M 90,52 L 110,52
    C 126,52 142,56 150,66
    C 160,78 160,94 156,110
    C 153,122 148,128 146,134
    C 144,146 142,160 140,172
    C 138,182 137,190 137,200
    L 137,208
    C 130,216 117,220 100,220
    C 83,220 70,216 63,208
    L 63,200
    C 63,190 62,182 60,172
    C 58,160 56,146 54,134
    C 52,128 47,122 44,110
    C 40,94 40,78 50,66
    C 58,56 74,52 90,52 Z
  `;

  const leftArm = `
    M 44,72 C 40,80 36,96 33,112
    C 30,128 29,144 30,158
    C 31,168 34,174 37,178
    C 35,192 32,208 30,222
    C 28,236 28,246 30,254
    L 38,258 C 40,260 44,260 46,258
    L 46,252 C 46,242 46,232 46,222
    C 46,208 47,192 49,178
    C 52,174 54,168 56,158
    C 57,144 56,128 54,112
    C 52,96 51,80 50,72 Z
  `;

  const rightArm = `
    M 156,72 C 160,80 164,96 167,112
    C 170,128 171,144 170,158
    C 169,168 166,174 163,178
    C 165,192 168,208 170,222
    C 172,236 172,246 170,254
    L 162,258 C 160,260 156,260 154,258
    L 154,252 C 154,242 154,232 154,222
    C 154,208 153,192 151,178
    C 148,174 146,168 144,158
    C 143,144 144,128 146,112
    C 148,96 149,80 150,72 Z
  `;

  const leftThigh = `
    M 63,222 C 60,232 56,248 53,265
    C 50,282 48,300 47,318
    C 46,333 48,346 53,356
    C 57,362 63,366 69,366
    C 73,366 76,363 78,357
    C 80,349 80,336 79,320
    C 78,304 77,288 77,272
    C 77,258 78,244 78,232 L 78,222 Z
  `;

  const leftCalf = `
    M 69,370 C 64,378 60,392 59,406
    C 58,416 60,426 65,432
    L 78,434 C 81,434 82,432 82,427
    C 82,419 80,409 78,399
    C 76,389 76,379 77,370 Z
  `;

  const rightThigh = `
    M 137,222 C 140,232 144,248 147,265
    C 150,282 152,300 153,318
    C 154,333 152,346 147,356
    C 143,362 137,366 131,366
    C 127,366 124,363 122,357
    C 120,349 120,336 121,320
    C 122,304 123,288 123,272
    C 123,258 122,244 122,232 L 122,222 Z
  `;

  const rightCalf = `
    M 131,370 C 136,378 140,392 141,406
    C 142,416 140,426 135,432
    L 122,434 C 119,434 118,432 118,427
    C 118,419 120,409 122,399
    C 124,389 124,379 123,370 Z
  `;

  // ── FRONT MUSCLES ──
  const mShoulderL = `M 42,74 C 38,82 37,96 40,108 C 42,116 48,120 54,118 C 58,116 60,110 60,103 C 60,93 59,83 56,77 C 52,71 46,71 42,74 Z`;
  const mShoulderR = `M 158,74 C 162,82 163,96 160,108 C 158,116 152,120 146,118 C 142,116 140,110 140,103 C 140,93 141,83 144,77 C 148,71 154,71 158,74 Z`;

  const mChestL = `M 66,72 C 58,78 55,92 58,106 C 61,116 69,122 78,120 C 86,118 90,110 90,100 C 90,88 86,76 78,70 C 73,66 69,67 66,72 Z`;
  const mChestR = `M 134,72 C 142,78 145,92 142,106 C 139,116 131,122 122,120 C 114,118 110,110 110,100 C 110,88 114,76 122,70 C 127,66 131,67 134,72 Z`;

  const mBicepL = `M 34,102 C 30,114 29,128 31,142 C 33,152 39,158 46,156 C 52,154 55,146 54,133 C 52,120 47,105 40,100 Z`;
  const mBicepR = `M 166,102 C 170,114 171,128 169,142 C 167,152 161,158 154,156 C 148,154 145,146 146,133 C 148,120 153,105 160,100 Z`;

  const mForearmL = `M 31,168 C 28,180 27,196 29,210 C 31,222 37,228 44,226 C 50,224 52,216 51,202 C 50,188 46,172 39,165 Z`;
  const mForearmR = `M 169,168 C 172,180 173,196 171,210 C 169,222 163,228 156,226 C 150,224 148,216 149,202 C 150,188 154,172 161,165 Z`;

  const mAbs = `M 80,130 C 75,140 73,154 73,168 L 73,200 C 73,210 80,218 92,220 L 100,221 L 108,220 C 120,218 127,210 127,200 L 127,168 C 127,154 125,140 120,130 C 114,124 86,124 80,130 Z`;

  const mObliqueL = `M 73,138 C 64,150 61,164 62,180 C 63,192 68,202 74,205 C 76,206 78,205 78,202 L 78,192 C 73,194 68,184 67,172 C 65,158 69,146 74,139 Z`;
  const mObliqueR = `M 127,138 C 136,150 139,164 138,180 C 137,192 132,202 126,205 C 124,206 122,205 122,202 L 122,192 C 127,194 132,184 133,172 C 135,158 131,146 126,139 Z`;

  const mQuadL = `M 55,236 C 52,250 49,266 47,284 C 46,300 48,314 52,324 C 56,332 63,336 69,334 C 76,332 78,323 78,312 C 78,296 76,280 74,264 C 72,250 69,236 63,230 Z`;
  const mQuadR = `M 145,236 C 148,250 151,266 153,284 C 154,300 152,314 148,324 C 144,332 137,336 131,334 C 124,332 122,323 122,312 C 122,296 124,280 126,264 C 128,250 131,236 137,230 Z`;

  const mCalfL = `M 54,378 C 51,390 50,404 53,416 C 56,424 63,430 70,428 C 75,426 78,418 77,406 C 76,394 70,378 63,374 Z`;
  const mCalfR = `M 146,378 C 149,390 150,404 147,416 C 144,424 137,430 130,428 C 125,426 122,418 123,406 C 124,394 130,378 137,374 Z`;

  // ── BACK MUSCLES ──
  const mTrap = `M 81,60 C 90,54 110,54 119,60 L 124,84 C 112,98 100,104 76,84 Z`;
  const mRearDeltL = `M 42,74 C 38,82 37,96 40,108 C 42,116 48,120 54,118 C 58,116 60,110 60,103 C 60,93 59,83 56,77 C 52,71 46,71 42,74 Z`;
  const mRearDeltR = `M 158,74 C 162,82 163,96 160,108 C 158,116 152,120 146,118 C 142,116 140,110 140,103 C 140,93 141,83 144,77 C 148,71 154,71 158,74 Z`;

  const mLatL = `M 77,84 C 65,98 59,116 58,136 C 57,152 61,166 71,172 C 77,176 83,172 85,164 C 88,151 86,130 84,111 C 82,98 80,88 77,84 Z`;
  const mLatR = `M 123,84 C 135,98 141,116 142,136 C 143,152 139,166 129,172 C 123,176 117,172 115,164 C 112,151 114,130 116,111 C 118,98 120,88 123,84 Z`;

  const mLowerBack = `M 84,174 C 79,184 78,198 81,210 C 84,220 92,224 100,224 C 108,224 116,220 119,210 C 122,198 121,184 116,174 C 111,167 89,167 84,174 Z`;

  const mTricepL = `M 36,106 C 32,118 30,132 32,146 C 34,156 40,162 47,160 C 54,158 57,149 55,137 C 53,123 48,108 41,102 Z`;
  const mTricepR = `M 164,106 C 168,118 170,132 168,146 C 166,156 160,162 153,160 C 146,158 143,149 145,137 C 147,123 152,108 159,102 Z`;

  const mGluteL = `M 65,226 C 58,236 55,250 58,262 C 61,272 69,276 78,274 C 86,272 90,263 89,252 C 88,240 81,227 73,223 Z`;
  const mGluteR = `M 135,226 C 142,236 145,250 142,262 C 139,272 131,276 122,274 C 114,272 110,263 111,252 C 112,240 119,227 127,223 Z`;

  const mHamL = `M 54,270 C 51,284 48,302 47,320 C 46,334 48,348 53,357 C 57,364 64,368 70,366 C 76,364 79,357 79,346 C 79,331 77,314 75,298 C 73,282 70,268 64,264 Z`;
  const mHamR = `M 146,270 C 149,284 152,302 153,320 C 154,334 152,348 147,357 C 143,364 136,368 130,366 C 124,364 121,357 121,346 C 121,331 123,314 125,298 C 127,282 130,268 136,264 Z`;

  const mCalfBackL = `M 53,378 C 50,392 49,406 52,418 C 55,426 63,432 70,430 C 75,428 77,420 76,408 C 74,396 69,380 62,374 Z`;
  const mCalfBackR = `M 147,378 C 150,392 151,406 148,418 C 145,426 137,432 130,430 C 125,428 123,420 124,408 C 126,396 131,380 138,374 Z`;

  const defLine = (id: string) => sel(id) ? Colors.accentLight + '66' : '#363688';

  return (
    <Svg width={width} height={height} viewBox="0 0 200 445">
      <Defs>
        <LinearGradient id="bodyGrad" x1="0.3" y1="0" x2="0.7" y2="1">
          <Stop offset="0%" stopColor="#2E2E62" />
          <Stop offset="50%" stopColor="#252550" />
          <Stop offset="100%" stopColor="#1E1E44" />
        </LinearGradient>
        <LinearGradient id="headGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#2E2E62" />
          <Stop offset="100%" stopColor="#232352" />
        </LinearGradient>
        <LinearGradient id="limbGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor="#2A2A58" />
          <Stop offset="100%" stopColor="#1E1E44" />
        </LinearGradient>
      </Defs>

      {/* ── BODY SEGMENTS ── */}
      <Path d={leftThigh}  fill="url(#limbGrad)" stroke={BODY_STROKE} strokeWidth={BODY_STROKE_W} />
      <Path d={rightThigh} fill="url(#limbGrad)" stroke={BODY_STROKE} strokeWidth={BODY_STROKE_W} />
      <Path d={leftCalf}   fill="url(#limbGrad)" stroke={BODY_STROKE} strokeWidth={BODY_STROKE_W} />
      <Path d={rightCalf}  fill="url(#limbGrad)" stroke={BODY_STROKE} strokeWidth={BODY_STROKE_W} />
      <Path d={leftArm}    fill="url(#limbGrad)" stroke={BODY_STROKE} strokeWidth={BODY_STROKE_W} />
      <Path d={rightArm}   fill="url(#limbGrad)" stroke={BODY_STROKE} strokeWidth={BODY_STROKE_W} />
      <Path d={torso}      fill="url(#bodyGrad)" stroke={BODY_STROKE} strokeWidth={BODY_STROKE_W} />
      <Circle cx={head.cx} cy={head.cy} r={head.r} fill="url(#headGrad)" stroke={BODY_STROKE} strokeWidth={BODY_STROKE_W} />
      <Path d="M 91,50 Q 89,58 89,66 L 111,66 Q 111,58 109,50 Z" fill="#232358" stroke={BODY_STROKE} strokeWidth={0.7} />

      {/* ── HEAD DETAILS ── */}
      {view === 'front' && (
        <>
          <Path d="M 78,18 C 78,5 86,2 100,2 C 114,2 122,5 122,18 C 116,10 108,8 100,8 C 92,8 84,10 78,18 Z" fill="#141430" />
          <Circle cx={92} cy={28} r={3.5} fill="#0E0E28" />
          <Circle cx={108} cy={28} r={3.5} fill="#0E0E28" />
          <Circle cx={91.4} cy={27} r={1.4} fill="#4040A0" />
          <Circle cx={107.4} cy={27} r={1.4} fill="#4040A0" />
          <Path d="M 88,23 Q 92,21 96,23" stroke="#202050" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          <Path d="M 104,23 Q 108,21 112,23" stroke="#202050" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          <Path d="M 99,33 Q 100,36 101,33" stroke="#202050" strokeWidth={1.0} fill="none" />
          <Path d="M 94,40 Q 100,44 106,40" stroke="#202050" strokeWidth={1.4} fill="none" strokeLinecap="round" />
        </>
      )}
      {view === 'back' && (
        <Path d="M 78,18 C 78,5 86,2 100,2 C 114,2 122,5 122,18 C 116,10 108,8 100,8 C 92,8 84,10 78,18 Z" fill="#141430" />
      )}

      {/* ── MUSCLES ── */}
      {view === 'front' ? (
        <>
          {/* Shoulders */}
          <G onPress={() => onMusclePress('shoulders')}>
            <MP id="shoulders" d={mShoulderL} />
            <MP id="shoulders" d={mShoulderR} />
          </G>

          {/* Chest */}
          <G onPress={() => onMusclePress('chest')}>
            <MP id="chest" d={mChestL} />
            <MP id="chest" d={mChestR} />
            <Line x1={100} y1={72} x2={100} y2={122} stroke={defLine('chest')} strokeWidth={0.8} />
            <Path d="M 67,100 Q 100,108 133,100" stroke={defLine('chest')} strokeWidth={0.6} fill="none" />
          </G>

          {/* Biceps */}
          <G onPress={() => onMusclePress('biceps')}>
            <MP id="biceps" d={mBicepL} />
            <MP id="biceps" d={mBicepR} />
          </G>

          {/* Forearms */}
          <G onPress={() => onMusclePress('forearms')}>
            <MP id="forearms" d={mForearmL} />
            <MP id="forearms" d={mForearmR} />
          </G>

          {/* Abs */}
          <G onPress={() => onMusclePress('abs')}>
            <MP id="abs" d={mAbs} />
            <Line x1={100} y1={128} x2={100} y2={221} stroke={defLine('abs')} strokeWidth={0.8} />
            <Line x1={74} y1={152} x2={126} y2={152} stroke={defLine('abs')} strokeWidth={0.6} />
            <Line x1={74} y1={175} x2={126} y2={175} stroke={defLine('abs')} strokeWidth={0.6} />
            <Line x1={74} y1={198} x2={126} y2={198} stroke={defLine('abs')} strokeWidth={0.6} />
          </G>

          {/* Obliques */}
          <G onPress={() => onMusclePress('obliques')}>
            <MP id="obliques" d={mObliqueL} />
            <MP id="obliques" d={mObliqueR} />
          </G>

          {/* Quads */}
          <G onPress={() => onMusclePress('quads')}>
            <MP id="quads" d={mQuadL} />
            <MP id="quads" d={mQuadR} />
          </G>

          {/* Calves */}
          <G onPress={() => onMusclePress('calves')}>
            <MP id="calves" d={mCalfL} />
            <MP id="calves" d={mCalfR} />
          </G>

          {/* ── FRONT LABELS ── */}
          <Label id="shoulders" text="Shoulders" tx={36} ty={78}  dx={48}  dy={94}  />
          <Label id="chest"     text="Chest"     tx={158} ty={96}  dx={132} dy={98}  right />
          <Label id="biceps"    text="Biceps"    tx={36} ty={130} dx={46}  dy={136} />
          <Label id="forearms"  text="Forearms"  tx={36} ty={194} dx={44}  dy={200} />
          <Label id="abs"       text="Abs"       tx={158} ty={162} dx={128} dy={168} right />
          <Label id="obliques"  text="Obliques"  tx={158} ty={182} dx={134} dy={178} right />
          <Label id="quads"     text="Quads"     tx={158} ty={276} dx={132} dy={284} right />
          <Label id="calves"    text="Calves"    tx={158} ty={400} dx={132} dy={404} right />
        </>
      ) : (
        <>
          {/* Traps */}
          <G onPress={() => onMusclePress('traps')}>
            <MP id="traps" d={mTrap} />
            <Line x1={100} y1={60} x2={100} y2={102} stroke={defLine('traps')} strokeWidth={0.8} />
          </G>

          {/* Rear Delts */}
          <G onPress={() => onMusclePress('rearDelts')}>
            <MP id="rearDelts" d={mRearDeltL} />
            <MP id="rearDelts" d={mRearDeltR} />
          </G>

          {/* Lats */}
          <G onPress={() => onMusclePress('lats')}>
            <MP id="lats" d={mLatL} />
            <MP id="lats" d={mLatR} />
          </G>

          {/* Lower Back */}
          <G onPress={() => onMusclePress('lowerBack')}>
            <MP id="lowerBack" d={mLowerBack} />
            <Line x1={100} y1={174} x2={100} y2={224} stroke={defLine('lowerBack')} strokeWidth={0.8} />
          </G>

          {/* Triceps */}
          <G onPress={() => onMusclePress('triceps')}>
            <MP id="triceps" d={mTricepL} />
            <MP id="triceps" d={mTricepR} />
          </G>

          {/* Forearms (back) */}
          <G onPress={() => onMusclePress('forearms')}>
            <MP id="forearms" d={mForearmL} />
            <MP id="forearms" d={mForearmR} />
          </G>

          {/* Glutes */}
          <G onPress={() => onMusclePress('glutes')}>
            <MP id="glutes" d={mGluteL} />
            <MP id="glutes" d={mGluteR} />
          </G>

          {/* Hamstrings */}
          <G onPress={() => onMusclePress('hamstrings')}>
            <MP id="hamstrings" d={mHamL} />
            <MP id="hamstrings" d={mHamR} />
          </G>

          {/* Calves (back) */}
          <G onPress={() => onMusclePress('calves')}>
            <MP id="calves" d={mCalfBackL} />
            <MP id="calves" d={mCalfBackR} />
          </G>

          {/* ── BACK LABELS ── */}
          <Label id="rearDelts"  text="Rear Delts"  tx={36}  ty={82}  dx={48}  dy={96}  />
          <Label id="traps"      text="Traps"        tx={158} ty={74}  dx={120} dy={80}  right />
          <Label id="triceps"    text="Triceps"      tx={36}  ty={130} dx={47}  dy={136} />
          <Label id="lats"       text="Lats"         tx={158} ty={130} dx={132} dy={138} right />
          <Label id="forearms"   text="Forearms"     tx={36}  ty={194} dx={46}  dy={202} />
          <Label id="lowerBack"  text="Lower Back"   tx={158} ty={194} dx={118} dy={200} right />
          <Label id="glutes"     text="Glutes"       tx={158} ty={246} dx={132} dy={254} right />
          <Label id="hamstrings" text="Hamstrings"   tx={158} ty={310} dx={132} dy={318} right />
          <Label id="calves"     text="Calves"       tx={158} ty={398} dx={134} dy={404} right />
        </>
      )}
    </Svg>
  );
}
