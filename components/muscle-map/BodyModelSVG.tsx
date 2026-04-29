import React from 'react';
import Svg, {
  Ellipse, Path, Circle, Rect, G,
  Text as SvgText, Line, Defs, RadialGradient, Stop,
} from 'react-native-svg';
import { Colors } from '@/constants/colors';

export type BodyView = 'front' | 'back';

interface Props {
  view: BodyView;
  selectedMuscle: string | null;
  onMusclePress: (muscleId: string) => void;
}

// Label definitions: muscle id, label text, label x, label y, anchor, line start x/y
interface LabelDef {
  id: string;
  text: string;
  lx: number; ly: number;
  anchor: 'start' | 'end';
  mx: number; my: number; // muscle center for connector line
}

const FRONT_LABELS: LabelDef[] = [
  { id: 'shoulders', text: 'Shoulders', lx: 196, ly: 88,  anchor: 'end', mx: 159, my: 98  },
  { id: 'chest',     text: 'Chest',     lx: 196, ly: 108, anchor: 'end', mx: 135, my: 116 },
  { id: 'abs',       text: 'Abs',       lx: 196, ly: 162, anchor: 'end', mx: 113, my: 168 },
  { id: 'obliques',  text: 'Obliques',  lx: 196, ly: 185, anchor: 'end', mx: 140, my: 175 },
  { id: 'quads',     text: 'Quads',     lx: 196, ly: 276, anchor: 'end', mx: 138, my: 282 },
  { id: 'calves',    text: 'Calves',    lx: 196, ly: 374, anchor: 'end', mx: 133, my: 378 },
  { id: 'biceps',    text: 'Biceps',    lx: 4,   ly: 143, anchor: 'start', mx: 34, my: 152 },
  { id: 'forearms',  text: 'Forearms',  lx: 4,   ly: 198, anchor: 'start', mx: 30, my: 204 },
];

const BACK_LABELS: LabelDef[] = [
  { id: 'traps',      text: 'Traps',       lx: 196, ly: 82,  anchor: 'end', mx: 140, my: 92  },
  { id: 'lats',       text: 'Lats',        lx: 196, ly: 128, anchor: 'end', mx: 138, my: 130 },
  { id: 'lowerBack',  text: 'Lower Back',  lx: 196, ly: 175, anchor: 'end', mx: 118, my: 175 },
  { id: 'glutes',     text: 'Glutes',      lx: 196, ly: 222, anchor: 'end', mx: 140, my: 225 },
  { id: 'hamstrings', text: 'Hamstrings',  lx: 196, ly: 288, anchor: 'end', mx: 138, my: 292 },
  { id: 'calves',     text: 'Calves',      lx: 196, ly: 376, anchor: 'end', mx: 134, my: 380 },
  { id: 'rearDelts',  text: 'Rear Delts',  lx: 4,   ly: 82,  anchor: 'start', mx: 37, my: 98  },
  { id: 'triceps',    text: 'Triceps',     lx: 4,   ly: 148, anchor: 'start', mx: 32, my: 152 },
];

export default function BodyModelSVG({ view, selectedMuscle, onMusclePress }: Props) {
  const isSelected = (id: string) => selectedMuscle === id;

  const muscleFill = (id: string) => isSelected(id) ? Colors.accent : Colors.muscleDefault;
  const muscleStroke = (id: string) => isSelected(id) ? Colors.accentLight : Colors.border;
  const muscleOpacity = (id: string) => isSelected(id) ? 1 : 0.85;

  const labels = view === 'front' ? FRONT_LABELS : BACK_LABELS;

  const MG = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <G
      onPress={() => onMusclePress(id)}
      opacity={muscleOpacity(id)}
    >
      {isSelected(id) && (
        <Defs>
          <RadialGradient id={`glow_${id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={Colors.accent} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={Colors.accent} stopOpacity="0" />
          </RadialGradient>
        </Defs>
      )}
      {children}
    </G>
  );

  return (
    <Svg width="200" height="450" viewBox="0 0 200 450">
      {/* ── Body silhouette ── */}
      <Path
        d="M100,8 Q126,8 128,38 Q128,62 116,68 L148,78 Q168,85 170,108 L166,170 Q162,195 160,220 L142,220 Q144,195 148,170 Q153,138 150,108 L145,108 Q140,130 138,200 L125,228 L122,248 Q128,275 126,318 Q124,348 120,375 L128,395 L128,405 L106,405 L106,395 Q108,368 110,318 Q108,285 106,248 L100,238 L94,248 Q92,285 90,318 Q92,368 94,395 L94,405 L72,405 L72,395 L80,375 Q76,348 74,318 Q72,275 78,248 L75,228 L62,200 Q60,130 55,108 L50,108 Q47,138 52,170 Q56,195 58,220 L40,220 Q38,195 34,170 L30,108 Q32,85 52,78 L84,68 Q72,62 72,38 Q74,8 100,8 Z"
        fill="#161622"
        stroke="#252538"
        strokeWidth={1}
      />

      {view === 'front' ? (
        <>
          {/* Head */}
          <Circle cx={100} cy={36} r={27} fill="#252535" stroke="#333348" strokeWidth={1} />
          <Circle cx={91} cy={34} r={3.5} fill="#1C1C2C" />
          <Circle cx={109} cy={34} r={3.5} fill="#1C1C2C" />
          <Path d="M94,44 Q100,48 106,44" stroke="#1C1C2C" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          {/* Neck */}
          <Rect x={90} y={63} width={20} height={16} rx={6} fill="#252535" stroke="#333348" strokeWidth={1} />

          <MG id="shoulders">
            <Ellipse cx={65} cy={100} rx={24} ry={20} fill={muscleFill('shoulders')} stroke={muscleStroke('shoulders')} strokeWidth={1.5} />
            <Ellipse cx={135} cy={100} rx={24} ry={20} fill={muscleFill('shoulders')} stroke={muscleStroke('shoulders')} strokeWidth={1.5} />
          </MG>

          <MG id="chest">
            <Ellipse cx={86} cy={116} rx={21} ry={26} fill={muscleFill('chest')} stroke={muscleStroke('chest')} strokeWidth={1.5} />
            <Ellipse cx={114} cy={116} rx={21} ry={26} fill={muscleFill('chest')} stroke={muscleStroke('chest')} strokeWidth={1.5} />
          </MG>

          <MG id="biceps">
            <Ellipse cx={50} cy={152} rx={16} ry={30} fill={muscleFill('biceps')} stroke={muscleStroke('biceps')} strokeWidth={1.5} />
            <Ellipse cx={150} cy={152} rx={16} ry={30} fill={muscleFill('biceps')} stroke={muscleStroke('biceps')} strokeWidth={1.5} />
          </MG>

          <MG id="forearms">
            <Ellipse cx={43} cy={203} rx={13} ry={25} fill={muscleFill('forearms')} stroke={muscleStroke('forearms')} strokeWidth={1.5} />
            <Ellipse cx={157} cy={203} rx={13} ry={25} fill={muscleFill('forearms')} stroke={muscleStroke('forearms')} strokeWidth={1.5} />
          </MG>

          <MG id="abs">
            <Rect x={87} y={143} width={26} height={62} rx={10} fill={muscleFill('abs')} stroke={muscleStroke('abs')} strokeWidth={1.5} />
          </MG>

          <MG id="obliques">
            <Ellipse cx={73} cy={172} rx={15} ry={32} fill={muscleFill('obliques')} stroke={muscleStroke('obliques')} strokeWidth={1.5} />
            <Ellipse cx={127} cy={172} rx={15} ry={32} fill={muscleFill('obliques')} stroke={muscleStroke('obliques')} strokeWidth={1.5} />
          </MG>

          <MG id="quads">
            <Ellipse cx={84} cy={282} rx={23} ry={54} fill={muscleFill('quads')} stroke={muscleStroke('quads')} strokeWidth={1.5} />
            <Ellipse cx={116} cy={282} rx={23} ry={54} fill={muscleFill('quads')} stroke={muscleStroke('quads')} strokeWidth={1.5} />
          </MG>

          <MG id="calves">
            <Ellipse cx={82} cy={378} rx={15} ry={32} fill={muscleFill('calves')} stroke={muscleStroke('calves')} strokeWidth={1.5} />
            <Ellipse cx={118} cy={378} rx={15} ry={32} fill={muscleFill('calves')} stroke={muscleStroke('calves')} strokeWidth={1.5} />
          </MG>
        </>
      ) : (
        <>
          {/* Head back */}
          <Circle cx={100} cy={36} r={27} fill="#252535" stroke="#333348" strokeWidth={1} />
          <Rect x={90} y={63} width={20} height={16} rx={6} fill="#252535" stroke="#333348" strokeWidth={1} />

          <MG id="rearDelts">
            <Ellipse cx={63} cy={100} rx={24} ry={20} fill={muscleFill('rearDelts')} stroke={muscleStroke('rearDelts')} strokeWidth={1.5} />
            <Ellipse cx={137} cy={100} rx={24} ry={20} fill={muscleFill('rearDelts')} stroke={muscleStroke('rearDelts')} strokeWidth={1.5} />
          </MG>

          <MG id="traps">
            <Path d="M76,78 Q100,70 124,78 L128,100 Q100,110 72,100 Z" fill={muscleFill('traps')} stroke={muscleStroke('traps')} strokeWidth={1.5} />
          </MG>

          <MG id="lats">
            <Path d="M73,100 Q57,118 60,162 L80,158 Q82,128 90,108 Z" fill={muscleFill('lats')} stroke={muscleStroke('lats')} strokeWidth={1.5} />
            <Path d="M127,100 Q143,118 140,162 L120,158 Q118,128 110,108 Z" fill={muscleFill('lats')} stroke={muscleStroke('lats')} strokeWidth={1.5} />
          </MG>

          <MG id="lowerBack">
            <Rect x={82} y={158} width={36} height={42} rx={8} fill={muscleFill('lowerBack')} stroke={muscleStroke('lowerBack')} strokeWidth={1.5} />
          </MG>

          <MG id="triceps">
            <Ellipse cx={48} cy={152} rx={16} ry={30} fill={muscleFill('triceps')} stroke={muscleStroke('triceps')} strokeWidth={1.5} />
            <Ellipse cx={152} cy={152} rx={16} ry={30} fill={muscleFill('triceps')} stroke={muscleStroke('triceps')} strokeWidth={1.5} />
          </MG>

          <MG id="forearms">
            <Ellipse cx={42} cy={203} rx={13} ry={25} fill={muscleFill('forearms')} stroke={muscleStroke('forearms')} strokeWidth={1.5} />
            <Ellipse cx={158} cy={203} rx={13} ry={25} fill={muscleFill('forearms')} stroke={muscleStroke('forearms')} strokeWidth={1.5} />
          </MG>

          <MG id="glutes">
            <Ellipse cx={86} cy={225} rx={27} ry={25} fill={muscleFill('glutes')} stroke={muscleStroke('glutes')} strokeWidth={1.5} />
            <Ellipse cx={114} cy={225} rx={27} ry={25} fill={muscleFill('glutes')} stroke={muscleStroke('glutes')} strokeWidth={1.5} />
          </MG>

          <MG id="hamstrings">
            <Ellipse cx={84} cy={292} rx={22} ry={54} fill={muscleFill('hamstrings')} stroke={muscleStroke('hamstrings')} strokeWidth={1.5} />
            <Ellipse cx={116} cy={292} rx={22} ry={54} fill={muscleFill('hamstrings')} stroke={muscleStroke('hamstrings')} strokeWidth={1.5} />
          </MG>

          <MG id="calves">
            <Ellipse cx={82} cy={380} rx={16} ry={32} fill={muscleFill('calves')} stroke={muscleStroke('calves')} strokeWidth={1.5} />
            <Ellipse cx={118} cy={380} rx={16} ry={32} fill={muscleFill('calves')} stroke={muscleStroke('calves')} strokeWidth={1.5} />
          </MG>
        </>
      )}

      {/* ── Labels + connector lines (rendered last so they sit on top) ── */}
      {labels.map(lbl => {
        const active = isSelected(lbl.id);
        const textColor = active ? Colors.accentLight : '#8888A8';
        const lineColor = active ? Colors.accent : '#3A3A50';
        return (
          <G key={lbl.id} onPress={() => onMusclePress(lbl.id)}>
            <Line
              x1={lbl.lx === 4 ? lbl.lx + (lbl.text.length * 4.2) : lbl.lx - (lbl.text.length * 4.2)}
              y1={lbl.ly - 1}
              x2={lbl.mx}
              y2={lbl.my}
              stroke={lineColor}
              strokeWidth={0.6}
              strokeDasharray={active ? undefined : '2,2'}
            />
            <SvgText
              x={lbl.lx}
              y={lbl.ly}
              fontSize={6.5}
              fontWeight={active ? 'bold' : 'normal'}
              fill={textColor}
              textAnchor={lbl.anchor}
            >
              {lbl.text}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}
