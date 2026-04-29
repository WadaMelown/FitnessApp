export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  level: Level;
  sets: number;
  reps: string;
  restSeconds: number;
  equipment: string;
  description: string;
  youtubeQuery: string;
}

export interface MuscleGroupData {
  id: string;
  name: string;
  view: 'front' | 'back';
  exercises: Exercise[];
}

const ex = (
  id: string, name: string, level: Level, sets: number, reps: string,
  rest: number, equipment: string, desc: string, ytq: string
): Exercise => ({ id, name, level, sets, reps, restSeconds: rest, equipment, description: desc, youtubeQuery: ytq });

export const MUSCLE_GROUPS: MuscleGroupData[] = [
  {
    id: 'chest',
    name: 'Chest',
    view: 'front',
    exercises: [
      ex('chest_b1', 'Push-Up', 'beginner', 3, '8-12', 60, 'Bodyweight', 'Classic push-up targeting the pectorals.', 'push up proper form beginner'),
      ex('chest_b2', 'Incline Push-Up', 'beginner', 3, '10-15', 60, 'Bench', 'Hands elevated to reduce difficulty.', 'incline push up tutorial'),
      ex('chest_b3', 'Chest Squeeze', 'beginner', 3, '15', 45, 'Resistance Band', 'Squeeze band across chest for constant tension.', 'resistance band chest squeeze tutorial'),
      ex('chest_i1', 'Dumbbell Bench Press', 'intermediate', 4, '8-12', 90, 'Dumbbells + Bench', 'Full range press with dumbbells for pec activation.', 'dumbbell bench press form tutorial'),
      ex('chest_i2', 'Cable Fly', 'intermediate', 3, '12-15', 75, 'Cable Machine', 'Wide arc motion isolating the chest.', 'cable fly chest tutorial'),
      ex('chest_i3', 'Dip (chest lean)', 'intermediate', 3, '8-10', 90, 'Dip Bar', 'Lean forward to emphasise chest over triceps.', 'chest dips form tutorial'),
      ex('chest_a1', 'Barbell Bench Press', 'advanced', 5, '3-6', 180, 'Barbell + Bench', 'Heavy compound press, cornerstone of chest development.', 'barbell bench press powerlifting form'),
      ex('chest_a2', 'Weighted Dip', 'advanced', 4, '6-8', 120, 'Dip Belt + Plates', 'Add load to dips for progressive overload.', 'weighted dips chest tutorial'),
      ex('chest_a3', 'Incline DB Fly', 'advanced', 4, '10-12', 90, 'Dumbbells + Incline Bench', 'Isolates upper chest fibres.', 'incline dumbbell fly upper chest tutorial'),
    ],
  },
  {
    id: 'shoulders',
    name: 'Shoulders',
    view: 'front',
    exercises: [
      ex('sh_b1', 'Seated DB Shoulder Press', 'beginner', 3, '10-12', 75, 'Dumbbells', 'Controlled overhead press seated for stability.', 'seated dumbbell shoulder press beginner'),
      ex('sh_b2', 'Lateral Raise', 'beginner', 3, '12-15', 60, 'Dumbbells', 'Arms out to sides to hit medial delts.', 'lateral raise proper form'),
      ex('sh_b3', 'Front Raise', 'beginner', 3, '12-15', 60, 'Dumbbells', 'Raise arms in front to target anterior delts.', 'front raise tutorial'),
      ex('sh_i1', 'Arnold Press', 'intermediate', 4, '8-10', 90, 'Dumbbells', 'Rotation in the press hits all three delt heads.', 'arnold press tutorial'),
      ex('sh_i2', 'Cable Lateral Raise', 'intermediate', 3, '15', 60, 'Cable Machine', 'Constant tension on medial delt throughout movement.', 'cable lateral raise tutorial'),
      ex('sh_a1', 'Overhead Press (Barbell)', 'advanced', 5, '4-6', 180, 'Barbell', 'Standing strict press, king of shoulder builders.', 'overhead press barbell form'),
      ex('sh_a2', 'Behind Neck Press', 'advanced', 4, '6-8', 120, 'Barbell', 'Targets rear and medial delts, use with caution.', 'behind neck press safely tutorial'),
    ],
  },
  {
    id: 'biceps',
    name: 'Biceps',
    view: 'front',
    exercises: [
      ex('bi_b1', 'Dumbbell Curl', 'beginner', 3, '10-12', 60, 'Dumbbells', 'Classic alternating curl, full range of motion.', 'dumbbell bicep curl beginner form'),
      ex('bi_b2', 'Hammer Curl', 'beginner', 3, '10-12', 60, 'Dumbbells', 'Neutral grip hits brachialis and brachioradialis.', 'hammer curl tutorial'),
      ex('bi_b3', 'Resistance Band Curl', 'beginner', 3, '15', 45, 'Resistance Band', 'Great for home workouts.', 'resistance band bicep curl'),
      ex('bi_i1', 'Barbell Curl', 'intermediate', 4, '8-10', 90, 'Barbell', 'Load more weight for maximum bicep overload.', 'barbell curl form tutorial'),
      ex('bi_i2', 'Incline DB Curl', 'intermediate', 3, '10-12', 75, 'Dumbbells + Incline Bench', 'Stretched position for peak bicep activation.', 'incline dumbbell curl tutorial'),
      ex('bi_a1', 'Spider Curl', 'advanced', 4, '10-12', 75, 'Barbell/Dumbbells + Incline Bench', 'Lying on incline bench, elbows stay fixed.', 'spider curl tutorial'),
      ex('bi_a2', 'Cable Curl', 'advanced', 4, '12-15', 60, 'Cable Machine', 'Constant tension on the bicep.', 'cable bicep curl technique'),
    ],
  },
  {
    id: 'triceps',
    name: 'Triceps',
    view: 'front',
    exercises: [
      ex('tri_b1', 'Tricep Dip (Bench)', 'beginner', 3, '10-15', 60, 'Bench', 'Feet on floor, dip using the bench behind you.', 'bench tricep dip tutorial'),
      ex('tri_b2', 'Overhead Tricep Extension', 'beginner', 3, '12-15', 60, 'Dumbbell', 'Single dumbbell behind the head.', 'overhead tricep extension form'),
      ex('tri_b3', 'Close Grip Push-Up', 'beginner', 3, '10-12', 60, 'Bodyweight', 'Hands close together to emphasise triceps.', 'close grip push up tutorial'),
      ex('tri_i1', 'Skull Crusher', 'intermediate', 4, '8-12', 90, 'Barbell/EZ Bar', 'Lying tricep extension, excellent for mass.', 'skull crusher form tutorial'),
      ex('tri_i2', 'Rope Pushdown', 'intermediate', 3, '12-15', 60, 'Cable Machine + Rope', 'Rope attachment allows full spread at bottom.', 'tricep rope pushdown tutorial'),
      ex('tri_a1', 'Close Grip Bench Press', 'advanced', 5, '4-6', 180, 'Barbell + Bench', 'Heavy compound movement for tricep mass.', 'close grip bench press form'),
      ex('tri_a2', 'Weighted Dip', 'advanced', 4, '6-8', 120, 'Dip Belt + Plates', 'Body upright to target triceps primarily.', 'weighted dips triceps form'),
    ],
  },
  {
    id: 'forearms',
    name: 'Forearms',
    view: 'front',
    exercises: [
      ex('fa_b1', 'Wrist Curl', 'beginner', 3, '15-20', 45, 'Dumbbells', 'Forearm resting on knee, curl wrists up.', 'wrist curl forearm exercise'),
      ex('fa_b2', 'Reverse Wrist Curl', 'beginner', 3, '15-20', 45, 'Dumbbells', 'Pronated grip, targets extensors.', 'reverse wrist curl tutorial'),
      ex('fa_i1', "Farmer's Walk", 'intermediate', 3, '40m', 90, 'Heavy Dumbbells/Kettlebells', 'Walk with heavy load to build grip and forearms.', 'farmers walk forearm grip exercise'),
      ex('fa_i2', 'Barbell Reverse Curl', 'intermediate', 3, '10-12', 75, 'Barbell', 'Overhand grip engages brachioradialis.', 'barbell reverse curl tutorial'),
      ex('fa_a1', 'Dead Hang', 'advanced', 3, '30-60s', 90, 'Pull-Up Bar', 'Simply hang from a bar to build crushing grip.', 'dead hang grip strength tutorial'),
    ],
  },
  {
    id: 'abs',
    name: 'Abs',
    view: 'front',
    exercises: [
      ex('abs_b1', 'Crunch', 'beginner', 3, '15-20', 45, 'Bodyweight', 'Basic crunch targeting upper rectus abdominis.', 'proper crunch form tutorial'),
      ex('abs_b2', 'Plank', 'beginner', 3, '30-60s', 45, 'Bodyweight', 'Isometric core stability exercise.', 'plank proper form tutorial'),
      ex('abs_b3', 'Leg Raise (lying)', 'beginner', 3, '10-15', 60, 'Bodyweight', 'Lower abs emphasis.', 'lying leg raise core tutorial'),
      ex('abs_i1', 'Cable Crunch', 'intermediate', 4, '12-15', 60, 'Cable Machine', 'Add resistance to crunch for overload.', 'cable crunch abs tutorial'),
      ex('abs_i2', 'Hanging Knee Raise', 'intermediate', 3, '12-15', 75, 'Pull-Up Bar', 'Hanging position increases difficulty.', 'hanging knee raise tutorial'),
      ex('abs_a1', 'Ab Wheel Rollout', 'advanced', 4, '10-12', 90, 'Ab Wheel', 'Full core engagement, difficult movement.', 'ab wheel rollout tutorial form'),
      ex('abs_a2', 'Dragon Flag', 'advanced', 3, '6-10', 120, 'Bench', 'Elite core movement pioneered by Bruce Lee.', 'dragon flag tutorial'),
    ],
  },
  {
    id: 'obliques',
    name: 'Obliques',
    view: 'front',
    exercises: [
      ex('obl_b1', 'Side Plank', 'beginner', 3, '30-45s', 45, 'Bodyweight', 'Lateral core stability.', 'side plank form tutorial'),
      ex('obl_b2', 'Russian Twist', 'beginner', 3, '20 reps', 60, 'Bodyweight/Plate', 'Rotational movement for obliques.', 'russian twist abs tutorial'),
      ex('obl_i1', 'Cable Woodchop', 'intermediate', 3, '12-15 each', 60, 'Cable Machine', 'Rotational pull targeting obliques.', 'cable woodchop obliques tutorial'),
      ex('obl_a1', 'Landmine Rotation', 'advanced', 4, '10-12 each', 75, 'Barbell + Landmine', 'Loaded rotational movement for strong obliques.', 'landmine rotation obliques'),
    ],
  },
  {
    id: 'quads',
    name: 'Quads',
    view: 'front',
    exercises: [
      ex('q_b1', 'Bodyweight Squat', 'beginner', 3, '15-20', 60, 'Bodyweight', 'Foundation movement for lower body.', 'bodyweight squat form tutorial'),
      ex('q_b2', 'Leg Extension', 'beginner', 3, '15', 60, 'Leg Extension Machine', 'Isolation exercise for the quadriceps.', 'leg extension machine tutorial'),
      ex('q_b3', 'Walking Lunge', 'beginner', 3, '10 each', 60, 'Bodyweight', 'Unilateral quad and glute training.', 'walking lunge proper form'),
      ex('q_i1', 'Goblet Squat', 'intermediate', 4, '10-12', 90, 'Kettlebell/Dumbbell', 'Upright torso emphasises quads.', 'goblet squat tutorial form'),
      ex('q_i2', 'Bulgarian Split Squat', 'intermediate', 3, '8-10 each', 90, 'Dumbbells + Bench', 'Excellent unilateral quad developer.', 'bulgarian split squat tutorial'),
      ex('q_a1', 'Barbell Back Squat', 'advanced', 5, '3-6', 180, 'Barbell + Rack', 'King of lower body exercises.', 'barbell back squat form'),
      ex('q_a2', 'Hack Squat', 'advanced', 4, '8-10', 120, 'Hack Squat Machine', 'Machine-based quad destroyer.', 'hack squat machine tutorial'),
    ],
  },
  {
    id: 'calves',
    name: 'Calves',
    view: 'front',
    exercises: [
      ex('calf_b1', 'Standing Calf Raise', 'beginner', 3, '15-20', 45, 'Bodyweight', 'Basic raise on edge of step.', 'standing calf raise tutorial'),
      ex('calf_b2', 'Seated Calf Raise', 'beginner', 3, '15-20', 45, 'Seated Calf Machine', 'Targets soleus with bent knee.', 'seated calf raise tutorial'),
      ex('calf_i1', 'Single-Leg Calf Raise', 'intermediate', 3, '15 each', 45, 'Bodyweight + Step', 'Greater stretch and load per calf.', 'single leg calf raise tutorial'),
      ex('calf_a1', 'Donkey Calf Raise', 'advanced', 4, '12-15', 60, 'Calf Raise Machine', 'Back parallel to floor for maximum stretch.', 'donkey calf raise tutorial'),
    ],
  },
  {
    id: 'traps',
    name: 'Traps',
    view: 'back',
    exercises: [
      ex('trap_b1', 'Dumbbell Shrug', 'beginner', 3, '12-15', 60, 'Dumbbells', 'Elevate shoulders with heavy weight.', 'dumbbell shrug tutorial'),
      ex('trap_b2', 'Band Pull-Apart', 'beginner', 3, '15-20', 45, 'Resistance Band', 'Great for upper back and rear delts.', 'band pull apart exercise'),
      ex('trap_i1', 'Barbell Shrug', 'intermediate', 4, '10-12', 90, 'Barbell', 'Heavier load for upper trap mass.', 'barbell shrug form'),
      ex('trap_i2', 'Face Pull', 'intermediate', 3, '15', 60, 'Cable Machine + Rope', 'Targets rear delts and mid traps.', 'face pull proper form tutorial'),
      ex('trap_a1', 'Rack Pull', 'advanced', 5, '4-6', 180, 'Barbell + Rack', 'Partial deadlift for maximum trap overload.', 'rack pull trap exercise tutorial'),
    ],
  },
  {
    id: 'lats',
    name: 'Lats',
    view: 'back',
    exercises: [
      ex('lat_b1', 'Lat Pulldown', 'beginner', 3, '10-12', 75, 'Cable Machine', 'Essential lat building movement.', 'lat pulldown form tutorial'),
      ex('lat_b2', 'Seated Cable Row', 'beginner', 3, '10-12', 75, 'Cable Machine', 'Horizontal pull for lat thickness.', 'seated cable row tutorial'),
      ex('lat_b3', 'Resistance Band Pulldown', 'beginner', 3, '12-15', 60, 'Resistance Band', 'Home-friendly lat exercise.', 'resistance band lat pulldown'),
      ex('lat_i1', 'Pull-Up / Chin-Up', 'intermediate', 4, 'Max reps', 120, 'Pull-Up Bar', 'Best bodyweight lat exercise.', 'pull up chin up tutorial lat'),
      ex('lat_i2', 'Dumbbell Row', 'intermediate', 4, '10-12 each', 75, 'Dumbbell + Bench', 'Single arm row for lat width.', 'single arm dumbbell row form'),
      ex('lat_a1', 'Weighted Pull-Up', 'advanced', 5, '5-8', 180, 'Pull-Up Bar + Dip Belt', 'Add weight to pull-ups for overload.', 'weighted pull up tutorial'),
      ex('lat_a2', 'Barbell Row', 'advanced', 5, '4-6', 150, 'Barbell', 'Bent-over barbell row for maximum mass.', 'barbell row bent over form'),
    ],
  },
  {
    id: 'lowerBack',
    name: 'Lower Back',
    view: 'back',
    exercises: [
      ex('lb_b1', 'Superman', 'beginner', 3, '12-15', 45, 'Bodyweight', 'Lying prone, lift arms and legs.', 'superman exercise lower back'),
      ex('lb_b2', 'Bird Dog', 'beginner', 3, '10 each', 45, 'Bodyweight', 'Opposite arm/leg extension on all fours.', 'bird dog exercise tutorial'),
      ex('lb_i1', 'Good Morning', 'intermediate', 3, '10-12', 90, 'Barbell', 'Hip hinge movement for erector strength.', 'good morning exercise form'),
      ex('lb_i2', 'Hyperextension', 'intermediate', 3, '12-15', 60, 'Roman Chair', 'Classic lower back isolation.', 'hyperextension lower back form'),
      ex('lb_a1', 'Deadlift', 'advanced', 5, '3-5', 180, 'Barbell', 'The ultimate posterior chain exercise.', 'deadlift proper form tutorial'),
    ],
  },
  {
    id: 'rearDelts',
    name: 'Rear Delts',
    view: 'back',
    exercises: [
      ex('rd_b1', 'Reverse Fly', 'beginner', 3, '12-15', 60, 'Dumbbells', 'Bent-over, arms sweep back like wings.', 'dumbbell reverse fly rear delt'),
      ex('rd_b2', 'Face Pull', 'beginner', 3, '15', 60, 'Cable Machine', 'Pull rope to face, elbows high.', 'face pull rear delt tutorial'),
      ex('rd_i1', 'Cable Reverse Fly', 'intermediate', 3, '12-15', 60, 'Cable Machine', 'Cross-cable rear delt isolation.', 'cable reverse fly rear delt'),
      ex('rd_a1', 'Chest-Supported Row', 'advanced', 4, '10-12', 90, 'Incline Bench + Dumbbells', 'Prone position removes lower back from movement.', 'chest supported row rear delt'),
    ],
  },
  {
    id: 'glutes',
    name: 'Glutes',
    view: 'back',
    exercises: [
      ex('gl_b1', 'Glute Bridge', 'beginner', 3, '15-20', 45, 'Bodyweight', 'Lie on back, push hips up.', 'glute bridge tutorial'),
      ex('gl_b2', 'Donkey Kick', 'beginner', 3, '15 each', 45, 'Bodyweight', 'Kick leg back on all fours.', 'donkey kick glutes exercise'),
      ex('gl_i1', 'Hip Thrust', 'intermediate', 4, '10-12', 90, 'Barbell + Bench', 'Best glute-focused exercise with load.', 'hip thrust barbell tutorial'),
      ex('gl_i2', 'Romanian Deadlift', 'intermediate', 4, '8-10', 90, 'Barbell', 'Hip hinge emphasising glute stretch.', 'romanian deadlift form tutorial'),
      ex('gl_a1', 'Barbell Hip Thrust', 'advanced', 5, '6-8', 120, 'Heavy Barbell + Bench + Pad', 'Maximum glute overload with heavy barbell.', 'heavy barbell hip thrust form'),
      ex('gl_a2', 'Cable Kickback', 'advanced', 3, '15 each', 75, 'Cable Machine + Ankle Strap', 'Isolated glute medius work.', 'cable kickback glutes tutorial'),
    ],
  },
  {
    id: 'hamstrings',
    name: 'Hamstrings',
    view: 'back',
    exercises: [
      ex('hm_b1', 'Lying Leg Curl', 'beginner', 3, '12-15', 60, 'Leg Curl Machine', 'Isolation of hamstrings.', 'lying leg curl tutorial'),
      ex('hm_b2', 'Stiff-Leg Deadlift (light)', 'beginner', 3, '12-15', 75, 'Dumbbells', 'Hip hinge with straight legs for hamstring stretch.', 'stiff leg deadlift dumbbell tutorial'),
      ex('hm_i1', 'Nordic Curl', 'intermediate', 3, '6-8', 120, 'Partner/Machine', 'Extremely effective eccentric exercise for hamstrings.', 'nordic hamstring curl tutorial'),
      ex('hm_i2', 'Romanian Deadlift', 'intermediate', 4, '8-10', 90, 'Barbell', 'Hip hinge for hamstring length and strength.', 'romanian deadlift hamstring tutorial'),
      ex('hm_a1', 'Snatch-Grip Deadlift', 'advanced', 5, '4-6', 180, 'Barbell', 'Wide grip increases hamstring range of motion.', 'snatch grip deadlift hamstring'),
    ],
  },
];

export function getExercisesForMuscle(muscleId: string, level: Level): Exercise[] {
  const group = MUSCLE_GROUPS.find(g => g.id === muscleId);
  if (!group) return [];
  return group.exercises.filter(e => e.level === level);
}

export function getAllExercisesForMuscle(muscleId: string): Exercise[] {
  const group = MUSCLE_GROUPS.find(g => g.id === muscleId);
  return group?.exercises ?? [];
}

export function getMuscleGroupName(muscleId: string): string {
  return MUSCLE_GROUPS.find(g => g.id === muscleId)?.name ?? muscleId;
}

export const YOUTUBE_SEARCH_BASE = 'https://www.youtube.com/results?search_query=';
