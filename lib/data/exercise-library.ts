// Curated Exercise Library with YouTube Demo Videos
// Each exercise has a verified YouTube video URL for demonstration

export interface ExerciseData {
  name: string;
  description: string;
  videoUrl: string;
  muscleGroup: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Popular fitness YouTube channels with educational content:
// - Athlean-X (Jeff Cavaliere) - https://www.youtube.com/@ataborax
// - Jeremy Ethier - https://www.youtube.com/@JeremyEthier
// - BUFF DUDES - https://www.youtube.com/@BuffDudes
// - ScottHermanFitness - https://www.youtube.com/@ScottHermanFitness

export const EXERCISE_LIBRARY: ExerciseData[] = [
  // ============================================
  // CHEST EXERCISES
  // ============================================
  {
    name: 'Push-ups',
    description: 'Classic bodyweight exercise targeting chest, shoulders, and triceps. Keep your body straight and lower until chest nearly touches the ground.',
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    muscleGroup: ['chest', 'shoulders', 'triceps'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Wide Push-ups',
    description: 'Push-up variation with hands placed wider than shoulder-width to emphasize chest muscles.',
    videoUrl: 'https://www.youtube.com/watch?v=pQUsUHvyoI4',
    muscleGroup: ['chest', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Diamond Push-ups',
    description: 'Push-up variation with hands forming a diamond shape under chest, targeting triceps.',
    videoUrl: 'https://www.youtube.com/watch?v=J0DnG1_S92I',
    muscleGroup: ['triceps', 'chest'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
  },
  {
    name: 'Incline Push-ups',
    description: 'Easier push-up variation with hands elevated on a surface, great for beginners.',
    videoUrl: 'https://www.youtube.com/watch?v=cfns5VDVVvk',
    muscleGroup: ['chest', 'shoulders', 'triceps'],
    equipment: ['bodyweight', 'bench'],
    difficulty: 'beginner',
  },
  {
    name: 'Decline Push-ups',
    description: 'Advanced push-up with feet elevated, targeting upper chest.',
    videoUrl: 'https://www.youtube.com/watch?v=SKPab2YC8BE',
    muscleGroup: ['chest', 'shoulders', 'triceps'],
    equipment: ['bodyweight', 'bench'],
    difficulty: 'intermediate',
  },
  {
    name: 'Bench Press',
    description: 'Compound exercise for chest development. Lie on bench, lower bar to chest, press up.',
    videoUrl: 'https://www.youtube.com/watch?v=gRVjAtPip0Y',
    muscleGroup: ['chest', 'shoulders', 'triceps'],
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
  },
  {
    name: 'Dumbbell Bench Press',
    description: 'Chest press with dumbbells allowing greater range of motion.',
    videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
    muscleGroup: ['chest', 'shoulders', 'triceps'],
    equipment: ['dumbbells', 'bench'],
    difficulty: 'intermediate',
  },
  {
    name: 'Dumbbell Flyes',
    description: 'Isolation exercise for chest. Lie on bench, lower dumbbells out to sides with slight bend in elbows.',
    videoUrl: 'https://www.youtube.com/watch?v=eozdVDA78K0',
    muscleGroup: ['chest'],
    equipment: ['dumbbells', 'bench'],
    difficulty: 'intermediate',
  },
  {
    name: 'Cable Crossover',
    description: 'Cable exercise for chest isolation with constant tension throughout movement.',
    videoUrl: 'https://www.youtube.com/watch?v=taI4XduLpTk',
    muscleGroup: ['chest'],
    equipment: ['cable machine'],
    difficulty: 'intermediate',
  },
  {
    name: 'Chest Dips',
    description: 'Compound movement for lower chest. Lean forward during dip to target chest more.',
    videoUrl: 'https://www.youtube.com/watch?v=dX_nSOOJIs0',
    muscleGroup: ['chest', 'triceps', 'shoulders'],
    equipment: ['dip bars', 'parallel bars'],
    difficulty: 'intermediate',
  },

  // ============================================
  // BACK EXERCISES
  // ============================================
  {
    name: 'Pull-ups',
    description: 'Classic back exercise. Hang from bar with overhand grip, pull until chin is over bar.',
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    muscleGroup: ['back', 'biceps', 'shoulders'],
    equipment: ['pull-up bar'],
    difficulty: 'intermediate',
  },
  {
    name: 'Chin-ups',
    description: 'Pull-up variation with underhand grip, emphasizing biceps more.',
    videoUrl: 'https://www.youtube.com/watch?v=brhRXlOhsAM',
    muscleGroup: ['back', 'biceps'],
    equipment: ['pull-up bar'],
    difficulty: 'intermediate',
  },
  {
    name: 'Assisted Pull-ups',
    description: 'Pull-up with band assistance for beginners building up to full pull-ups.',
    videoUrl: 'https://www.youtube.com/watch?v=pBP4AN6lntc',
    muscleGroup: ['back', 'biceps'],
    equipment: ['pull-up bar', 'resistance band'],
    difficulty: 'beginner',
  },
  {
    name: 'Bent Over Rows',
    description: 'Compound back exercise. Hinge at hips, row weight to lower chest.',
    videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ',
    muscleGroup: ['back', 'biceps', 'rear delts'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
  },
  {
    name: 'Dumbbell Rows',
    description: 'Single-arm row for back. One hand on bench, row dumbbell to hip.',
    videoUrl: 'https://www.youtube.com/watch?v=roCP6wCXPqo',
    muscleGroup: ['back', 'biceps'],
    equipment: ['dumbbells', 'bench'],
    difficulty: 'beginner',
  },
  {
    name: 'Lat Pulldown',
    description: 'Cable exercise for lats. Pull bar down to upper chest, squeeze lats.',
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    muscleGroup: ['back', 'biceps'],
    equipment: ['cable machine', 'lat pulldown'],
    difficulty: 'beginner',
  },
  {
    name: 'Seated Cable Row',
    description: 'Cable row sitting at cable station. Pull handle to torso, squeeze back.',
    videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74',
    muscleGroup: ['back', 'biceps'],
    equipment: ['cable machine'],
    difficulty: 'beginner',
  },
  {
    name: 'Deadlift',
    description: 'Compound lift for entire posterior chain. Hinge at hips, keep back straight, lift bar from floor.',
    videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    muscleGroup: ['back', 'glutes', 'hamstrings', 'core'],
    equipment: ['barbell'],
    difficulty: 'advanced',
  },
  {
    name: 'Superman',
    description: 'Bodyweight back exercise. Lie face down, lift arms and legs simultaneously.',
    videoUrl: 'https://www.youtube.com/watch?v=z6PJMT2y8GQ',
    muscleGroup: ['lower back', 'glutes'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Face Pulls',
    description: 'Cable exercise for rear delts and upper back. Pull rope to face level.',
    videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk',
    muscleGroup: ['rear delts', 'upper back'],
    equipment: ['cable machine', 'rope attachment'],
    difficulty: 'beginner',
  },

  // ============================================
  // SHOULDER EXERCISES
  // ============================================
  {
    name: 'Overhead Press',
    description: 'Compound shoulder exercise. Press barbell overhead from shoulders.',
    videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
    muscleGroup: ['shoulders', 'triceps'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
  },
  {
    name: 'Dumbbell Shoulder Press',
    description: 'Shoulder press with dumbbells, seated or standing.',
    videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
    muscleGroup: ['shoulders', 'triceps'],
    equipment: ['dumbbells'],
    difficulty: 'beginner',
  },
  {
    name: 'Lateral Raises',
    description: 'Isolation for side delts. Raise dumbbells out to sides.',
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    muscleGroup: ['shoulders'],
    equipment: ['dumbbells'],
    difficulty: 'beginner',
  },
  {
    name: 'Front Raises',
    description: 'Isolation for front delts. Raise dumbbells in front of body.',
    videoUrl: 'https://www.youtube.com/watch?v=-t7fuZ0KhDA',
    muscleGroup: ['shoulders'],
    equipment: ['dumbbells'],
    difficulty: 'beginner',
  },
  {
    name: 'Rear Delt Flyes',
    description: 'Isolation for rear delts. Bent over, raise dumbbells out to sides.',
    videoUrl: 'https://www.youtube.com/watch?v=EA7u4Q_8HQ0',
    muscleGroup: ['rear delts', 'upper back'],
    equipment: ['dumbbells'],
    difficulty: 'beginner',
  },
  {
    name: 'Arnold Press',
    description: 'Shoulder press with rotation, targeting all three delt heads.',
    videoUrl: 'https://www.youtube.com/watch?v=6Z15_WdXmVw',
    muscleGroup: ['shoulders'],
    equipment: ['dumbbells'],
    difficulty: 'intermediate',
  },
  {
    name: 'Pike Push-ups',
    description: 'Bodyweight shoulder exercise. Push-up with hips raised high.',
    videoUrl: 'https://www.youtube.com/watch?v=sposDXWEB0A',
    muscleGroup: ['shoulders', 'triceps'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
  },
  {
    name: 'Handstand Push-ups',
    description: 'Advanced bodyweight shoulder exercise against wall.',
    videoUrl: 'https://www.youtube.com/watch?v=eeMwadjY0Ss',
    muscleGroup: ['shoulders', 'triceps', 'core'],
    equipment: ['bodyweight', 'wall'],
    difficulty: 'advanced',
  },
  {
    name: 'Upright Rows',
    description: 'Compound movement for traps and shoulders. Row weight up along body.',
    videoUrl: 'https://www.youtube.com/watch?v=amCU-ziHITM',
    muscleGroup: ['shoulders', 'traps'],
    equipment: ['barbell', 'dumbbells'],
    difficulty: 'intermediate',
  },
  {
    name: 'Shrugs',
    description: 'Trap isolation. Shrug shoulders up toward ears with weight.',
    videoUrl: 'https://www.youtube.com/watch?v=cJRVVxmytaM',
    muscleGroup: ['traps'],
    equipment: ['barbell', 'dumbbells'],
    difficulty: 'beginner',
  },

  // ============================================
  // ARM EXERCISES
  // ============================================
  {
    name: 'Bicep Curls',
    description: 'Classic bicep isolation. Curl dumbbells up, keeping elbows stationary.',
    videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
    muscleGroup: ['biceps'],
    equipment: ['dumbbells'],
    difficulty: 'beginner',
  },
  {
    name: 'Hammer Curls',
    description: 'Bicep curl with neutral grip, targeting brachialis and forearms.',
    videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4',
    muscleGroup: ['biceps', 'forearms'],
    equipment: ['dumbbells'],
    difficulty: 'beginner',
  },
  {
    name: 'Barbell Curls',
    description: 'Bicep curl with barbell for heavier loads.',
    videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
    muscleGroup: ['biceps'],
    equipment: ['barbell'],
    difficulty: 'beginner',
  },
  {
    name: 'Concentration Curls',
    description: 'Seated single-arm curl with elbow braced against thigh.',
    videoUrl: 'https://www.youtube.com/watch?v=0AUGkch3tzc',
    muscleGroup: ['biceps'],
    equipment: ['dumbbells'],
    difficulty: 'beginner',
  },
  {
    name: 'Preacher Curls',
    description: 'Bicep curl on preacher bench for isolation.',
    videoUrl: 'https://www.youtube.com/watch?v=fIWP-FRFNU0',
    muscleGroup: ['biceps'],
    equipment: ['barbell', 'preacher bench'],
    difficulty: 'intermediate',
  },
  {
    name: 'Tricep Dips',
    description: 'Bodyweight tricep exercise on bench or dip bars.',
    videoUrl: 'https://www.youtube.com/watch?v=0326dy_-CzM',
    muscleGroup: ['triceps'],
    equipment: ['bench', 'bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Tricep Pushdowns',
    description: 'Cable exercise for triceps. Push rope or bar down, squeeze triceps.',
    videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
    muscleGroup: ['triceps'],
    equipment: ['cable machine'],
    difficulty: 'beginner',
  },
  {
    name: 'Overhead Tricep Extension',
    description: 'Tricep isolation. Extend dumbbell overhead, lowering behind head.',
    videoUrl: 'https://www.youtube.com/watch?v=YbX7Wd8jQ-Q',
    muscleGroup: ['triceps'],
    equipment: ['dumbbells'],
    difficulty: 'beginner',
  },
  {
    name: 'Skull Crushers',
    description: 'Lying tricep extension. Lower weight toward forehead, extend back up.',
    videoUrl: 'https://www.youtube.com/watch?v=d_KZxkY_0cM',
    muscleGroup: ['triceps'],
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
  },
  {
    name: 'Close-Grip Bench Press',
    description: 'Bench press with narrow grip to target triceps.',
    videoUrl: 'https://www.youtube.com/watch?v=nEF0bv2FW94',
    muscleGroup: ['triceps', 'chest'],
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
  },

  // ============================================
  // LEG EXERCISES
  // ============================================
  {
    name: 'Squats',
    description: 'King of leg exercises. Lower hips back and down, keeping chest up.',
    videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
    muscleGroup: ['quads', 'glutes', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Barbell Squats',
    description: 'Squat with barbell on upper back for added resistance.',
    videoUrl: 'https://www.youtube.com/watch?v=bEv6CCg2BC8',
    muscleGroup: ['quads', 'glutes', 'hamstrings', 'core'],
    equipment: ['barbell', 'squat rack'],
    difficulty: 'intermediate',
  },
  {
    name: 'Goblet Squats',
    description: 'Squat holding dumbbell or kettlebell at chest. Great for learning form.',
    videoUrl: 'https://www.youtube.com/watch?v=MeIiIdhvXT4',
    muscleGroup: ['quads', 'glutes'],
    equipment: ['dumbbell', 'kettlebell'],
    difficulty: 'beginner',
  },
  {
    name: 'Bulgarian Split Squats',
    description: 'Single-leg squat with rear foot elevated.',
    videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
    muscleGroup: ['quads', 'glutes'],
    equipment: ['bodyweight', 'bench'],
    difficulty: 'intermediate',
  },
  {
    name: 'Lunges',
    description: 'Step forward, lower back knee toward ground, push back up.',
    videoUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
    muscleGroup: ['quads', 'glutes', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Walking Lunges',
    description: 'Lunges moving forward continuously.',
    videoUrl: 'https://www.youtube.com/watch?v=L8fvypPrzzs',
    muscleGroup: ['quads', 'glutes', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Reverse Lunges',
    description: 'Lunge stepping backward instead of forward.',
    videoUrl: 'https://www.youtube.com/watch?v=xrPteyQLGAo',
    muscleGroup: ['quads', 'glutes'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Leg Press',
    description: 'Machine exercise for quads. Push platform away with feet.',
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    muscleGroup: ['quads', 'glutes'],
    equipment: ['leg press machine'],
    difficulty: 'beginner',
  },
  {
    name: 'Leg Extensions',
    description: 'Machine isolation for quads. Extend legs against resistance.',
    videoUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
    muscleGroup: ['quads'],
    equipment: ['leg extension machine'],
    difficulty: 'beginner',
  },
  {
    name: 'Leg Curls',
    description: 'Machine isolation for hamstrings. Curl weight toward glutes.',
    videoUrl: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
    muscleGroup: ['hamstrings'],
    equipment: ['leg curl machine'],
    difficulty: 'beginner',
  },
  {
    name: 'Romanian Deadlift',
    description: 'Hip hinge movement targeting hamstrings and glutes.',
    videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM',
    muscleGroup: ['hamstrings', 'glutes', 'lower back'],
    equipment: ['barbell', 'dumbbells'],
    difficulty: 'intermediate',
  },
  {
    name: 'Calf Raises',
    description: 'Raise heels off ground to target calves.',
    videoUrl: 'https://www.youtube.com/watch?v=-M4-G8p8fmc',
    muscleGroup: ['calves'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Hip Thrusts',
    description: 'Glute exercise. Back on bench, drive hips up with barbell on lap.',
    videoUrl: 'https://www.youtube.com/watch?v=SEdqd1n0cvg',
    muscleGroup: ['glutes', 'hamstrings'],
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
  },
  {
    name: 'Glute Bridges',
    description: 'Bodyweight glute exercise. Lie down, drive hips up.',
    videoUrl: 'https://www.youtube.com/watch?v=OUgsJ8-Vi0E',
    muscleGroup: ['glutes'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Step-ups',
    description: 'Step onto elevated surface, driving through lead leg.',
    videoUrl: 'https://www.youtube.com/watch?v=WCFCdxzFBa4',
    muscleGroup: ['quads', 'glutes'],
    equipment: ['bench', 'step'],
    difficulty: 'beginner',
  },

  // ============================================
  // CORE EXERCISES
  // ============================================
  {
    name: 'Plank',
    description: 'Core stability exercise. Hold body straight in push-up position on forearms.',
    videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
    muscleGroup: ['core', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Side Plank',
    description: 'Lateral core stability. Hold on side with one forearm.',
    videoUrl: 'https://www.youtube.com/watch?v=K2VljzCC16g',
    muscleGroup: ['obliques', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Crunches',
    description: 'Basic ab exercise. Curl upper body toward knees.',
    videoUrl: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU',
    muscleGroup: ['abs'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Bicycle Crunches',
    description: 'Crunch with rotation, alternating elbow to opposite knee.',
    videoUrl: 'https://www.youtube.com/watch?v=9FGilxCbdz8',
    muscleGroup: ['abs', 'obliques'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Leg Raises',
    description: 'Lying leg raise for lower abs. Keep legs straight, raise to vertical.',
    videoUrl: 'https://www.youtube.com/watch?v=JB2oyawG9KI',
    muscleGroup: ['abs', 'hip flexors'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
  },
  {
    name: 'Hanging Leg Raises',
    description: 'Hanging from bar, raise legs to parallel or higher.',
    videoUrl: 'https://www.youtube.com/watch?v=hdng3Nm1x_E',
    muscleGroup: ['abs', 'hip flexors'],
    equipment: ['pull-up bar'],
    difficulty: 'advanced',
  },
  {
    name: 'Mountain Climbers',
    description: 'Dynamic core exercise. In plank, alternate driving knees to chest.',
    videoUrl: 'https://www.youtube.com/watch?v=nmwgirgXLYM',
    muscleGroup: ['core', 'hip flexors'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Russian Twists',
    description: 'Seated rotation with or without weight for obliques.',
    videoUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI',
    muscleGroup: ['obliques', 'abs'],
    equipment: ['bodyweight', 'medicine ball'],
    difficulty: 'beginner',
  },
  {
    name: 'Dead Bug',
    description: 'Core stability exercise. Lying down, extend opposite arm and leg.',
    videoUrl: 'https://www.youtube.com/watch?v=I5xbsA71v1A',
    muscleGroup: ['core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Bird Dog',
    description: 'On all fours, extend opposite arm and leg for core stability.',
    videoUrl: 'https://www.youtube.com/watch?v=wiFNA3sqjCA',
    muscleGroup: ['core', 'lower back'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Ab Wheel Rollout',
    description: 'Roll ab wheel out and back for intense core activation.',
    videoUrl: 'https://www.youtube.com/watch?v=rqiTPdK1c_I',
    muscleGroup: ['abs', 'core'],
    equipment: ['ab wheel'],
    difficulty: 'advanced',
  },
  {
    name: 'Cable Woodchop',
    description: 'Rotational core exercise with cable from high to low or vice versa.',
    videoUrl: 'https://www.youtube.com/watch?v=pAplQXk3dkU',
    muscleGroup: ['obliques', 'core'],
    equipment: ['cable machine'],
    difficulty: 'intermediate',
  },

  // ============================================
  // CARDIO EXERCISES
  // ============================================
  {
    name: 'Jumping Jacks',
    description: 'Classic cardio exercise. Jump feet out while raising arms overhead.',
    videoUrl: 'https://www.youtube.com/watch?v=c4DAnQ6DtF8',
    muscleGroup: ['full body'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'High Knees',
    description: 'Run in place, driving knees up high.',
    videoUrl: 'https://www.youtube.com/watch?v=D0RToeYNxlg',
    muscleGroup: ['hip flexors', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Burpees',
    description: 'Full body cardio. Drop to push-up, jump up with hands overhead.',
    videoUrl: 'https://www.youtube.com/watch?v=dZgVxmf6jkA',
    muscleGroup: ['full body'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
  },
  {
    name: 'Box Jumps',
    description: 'Explosive jump onto elevated platform.',
    videoUrl: 'https://www.youtube.com/watch?v=52r_Ul5k03g',
    muscleGroup: ['quads', 'glutes', 'calves'],
    equipment: ['plyo box'],
    difficulty: 'intermediate',
  },
  {
    name: 'Jump Squats',
    description: 'Squat down, explode up into jump.',
    videoUrl: 'https://www.youtube.com/watch?v=A-cFYWvaHr0',
    muscleGroup: ['quads', 'glutes'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
  },
  {
    name: 'Jump Lunges',
    description: 'Lunge with explosive jump, switching legs mid-air.',
    videoUrl: 'https://www.youtube.com/watch?v=y7Iug7eC0dk',
    muscleGroup: ['quads', 'glutes'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
  },
  {
    name: 'Skaters',
    description: 'Lateral jump from foot to foot, mimicking skating motion.',
    videoUrl: 'https://www.youtube.com/watch?v=d1JJjlPgcBA',
    muscleGroup: ['glutes', 'quads'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Battle Ropes',
    description: 'Wave heavy ropes for intense cardio and arm workout.',
    videoUrl: 'https://www.youtube.com/watch?v=4A2Ae4jj4bQ',
    muscleGroup: ['shoulders', 'core', 'arms'],
    equipment: ['battle ropes'],
    difficulty: 'intermediate',
  },
  {
    name: 'Rowing Machine',
    description: 'Full body cardio on rowing ergometer.',
    videoUrl: 'https://www.youtube.com/watch?v=GZlLY3TBB6Q',
    muscleGroup: ['full body', 'back', 'legs'],
    equipment: ['rowing machine'],
    difficulty: 'beginner',
  },
  {
    name: 'Kettlebell Swings',
    description: 'Hip hinge movement swinging kettlebell for cardio and power.',
    videoUrl: 'https://www.youtube.com/watch?v=YSxHifyI6s8',
    muscleGroup: ['glutes', 'hamstrings', 'core'],
    equipment: ['kettlebell'],
    difficulty: 'intermediate',
  },

  // ============================================
  // STRETCHES & MOBILITY
  // ============================================
  {
    name: 'Standing Quad Stretch',
    description: 'Stand on one leg, pull other foot to glutes.',
    videoUrl: 'https://www.youtube.com/watch?v=s_K-sOqbPnA',
    muscleGroup: ['quads'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Standing Hamstring Stretch',
    description: 'Extend one leg forward, hinge at hips to stretch hamstrings.',
    videoUrl: 'https://www.youtube.com/watch?v=FDwpEdxZ4H4',
    muscleGroup: ['hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Hip Flexor Stretch',
    description: 'Kneeling lunge position, push hips forward to stretch hip flexors.',
    videoUrl: 'https://www.youtube.com/watch?v=UGEpQ1BRx-4',
    muscleGroup: ['hip flexors'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Pigeon Pose',
    description: 'Yoga pose for deep hip and glute stretch.',
    videoUrl: 'https://www.youtube.com/watch?v=SrJEpLvGevo',
    muscleGroup: ['glutes', 'hip flexors'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Cat-Cow Stretch',
    description: 'Spinal mobility exercise. Alternate arching and rounding back.',
    videoUrl: 'https://www.youtube.com/watch?v=kqnua4rHVVA',
    muscleGroup: ['spine', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Child\'s Pose',
    description: 'Relaxing stretch for back and hips. Sit back on heels, reach arms forward.',
    videoUrl: 'https://www.youtube.com/watch?v=2MJGg-dUKh0',
    muscleGroup: ['back', 'hips'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Downward Dog',
    description: 'Yoga pose stretching hamstrings, calves, and shoulders.',
    videoUrl: 'https://www.youtube.com/watch?v=j97SSGsnCAQ',
    muscleGroup: ['hamstrings', 'calves', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Shoulder Stretch',
    description: 'Cross arm across body, press with other arm.',
    videoUrl: 'https://www.youtube.com/watch?v=kVdHT7VbHuQ',
    muscleGroup: ['shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Tricep Stretch',
    description: 'Reach arm overhead, bend elbow, press with other hand.',
    videoUrl: 'https://www.youtube.com/watch?v=5_ejpGDOCUw',
    muscleGroup: ['triceps'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
  },
  {
    name: 'Chest Stretch',
    description: 'Stand in doorway, arms on frame, lean forward to stretch chest.',
    videoUrl: 'https://www.youtube.com/watch?v=g-7ZWPCWv0U',
    muscleGroup: ['chest'],
    equipment: ['bodyweight', 'doorway'],
    difficulty: 'beginner',
  },
  {
    name: 'Foam Rolling - IT Band',
    description: 'Roll outer thigh on foam roller for myofascial release.',
    videoUrl: 'https://www.youtube.com/watch?v=ePdPSzOWqWo',
    muscleGroup: ['IT band', 'quads'],
    equipment: ['foam roller'],
    difficulty: 'beginner',
  },
  {
    name: 'Foam Rolling - Back',
    description: 'Roll upper and mid back on foam roller.',
    videoUrl: 'https://www.youtube.com/watch?v=SxQkVR71ehE',
    muscleGroup: ['back'],
    equipment: ['foam roller'],
    difficulty: 'beginner',
  },
];

// Helper function to find exercise by name (case-insensitive fuzzy match)
export function findExerciseByName(name: string): ExerciseData | undefined {
  const normalizedName = name.toLowerCase().trim();

  // Try exact match first
  let match = EXERCISE_LIBRARY.find(
    ex => ex.name.toLowerCase() === normalizedName
  );

  if (match) return match;

  // Try partial match
  match = EXERCISE_LIBRARY.find(
    ex => ex.name.toLowerCase().includes(normalizedName) ||
          normalizedName.includes(ex.name.toLowerCase())
  );

  if (match) return match;

  // Try word-by-word match
  const searchWords = normalizedName.split(/\s+/);
  match = EXERCISE_LIBRARY.find(ex => {
    const exerciseWords = ex.name.toLowerCase().split(/\s+/);
    return searchWords.every(word =>
      exerciseWords.some(exWord => exWord.includes(word) || word.includes(exWord))
    );
  });

  return match;
}

// Get all exercises for a muscle group
export function getExercisesByMuscleGroup(muscleGroup: string): ExerciseData[] {
  return EXERCISE_LIBRARY.filter(ex =>
    ex.muscleGroup.some(mg => mg.toLowerCase().includes(muscleGroup.toLowerCase()))
  );
}

// Get all exercises by equipment
export function getExercisesByEquipment(equipment: string): ExerciseData[] {
  return EXERCISE_LIBRARY.filter(ex =>
    ex.equipment.some(eq => eq.toLowerCase().includes(equipment.toLowerCase()))
  );
}

// Get exercises by difficulty
export function getExercisesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): ExerciseData[] {
  return EXERCISE_LIBRARY.filter(ex => ex.difficulty === difficulty);
}
