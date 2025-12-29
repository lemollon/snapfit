// Comprehensive Equipment Library for Recognition and Workout Planning
// Used for identifying equipment in photos and matching to appropriate exercises

export interface EquipmentData {
  id: string;
  name: string;
  category: EquipmentCategory;
  aliases: string[];  // Alternative names for recognition
  visualCues: string[];  // Visual characteristics to help AI identify
  description: string;
  muscleGroups: string[];  // What muscle groups can be trained
  compatibleExercises: string[];  // Exercises that use this equipment
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCommon: boolean;  // Found in most gyms
  canBeImprovised: boolean;  // Can be substituted with household items
  improvisedAlternatives?: string[];  // Household alternatives
}

export type EquipmentCategory =
  | 'free_weights'
  | 'machines'
  | 'cable_machines'
  | 'cardio'
  | 'bodyweight'
  | 'resistance'
  | 'functional'
  | 'recovery'
  | 'accessories'
  | 'outdoor'
  | 'improvised';

// Category display names and descriptions
export const EQUIPMENT_CATEGORIES: Record<EquipmentCategory, { name: string; description: string }> = {
  free_weights: { name: 'Free Weights', description: 'Dumbbells, barbells, kettlebells, and weight plates' },
  machines: { name: 'Weight Machines', description: 'Guided resistance machines for isolated exercises' },
  cable_machines: { name: 'Cable Machines', description: 'Adjustable cable systems for varied movements' },
  cardio: { name: 'Cardio Equipment', description: 'Treadmills, bikes, and other cardiovascular machines' },
  bodyweight: { name: 'Bodyweight Stations', description: 'Pull-up bars, dip stations, and similar' },
  resistance: { name: 'Resistance Tools', description: 'Bands, tubes, and other resistance equipment' },
  functional: { name: 'Functional Training', description: 'Boxes, sleds, battle ropes, and similar' },
  recovery: { name: 'Recovery & Mobility', description: 'Foam rollers, massage tools, stretching aids' },
  accessories: { name: 'Accessories', description: 'Benches, mats, and supporting equipment' },
  outdoor: { name: 'Outdoor Equipment', description: 'Park equipment and outdoor training gear' },
  improvised: { name: 'Improvised/Home', description: 'Household items that can be used for exercise' },
};

export const EQUIPMENT_LIBRARY: EquipmentData[] = [
  // ============================================
  // FREE WEIGHTS
  // ============================================
  {
    id: 'dumbbells',
    name: 'Dumbbells',
    category: 'free_weights',
    aliases: ['dumbbell', 'hand weights', 'free weights', 'db', 'dbs', 'weights'],
    visualCues: ['short bars with weights on each end', 'pairs of equal weights', 'dumbbell rack', 'hexagonal ends'],
    description: 'Handheld weights for unilateral and bilateral exercises',
    muscleGroups: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'],
    compatibleExercises: ['Dumbbell Bench Press', 'Dumbbell Rows', 'Bicep Curls', 'Shoulder Press', 'Lunges', 'Goblet Squats'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['water bottles', 'milk jugs', 'canned goods', 'backpack with books'],
  },
  {
    id: 'barbell',
    name: 'Barbell',
    category: 'free_weights',
    aliases: ['olympic bar', 'bar', 'straight bar', 'oly bar', 'barbell bar'],
    visualCues: ['long metal bar', '7 feet long', 'knurled grip sections', 'rotating sleeves for plates'],
    description: 'Long bar for heavy compound lifts, typically 45 lbs (20 kg)',
    muscleGroups: ['chest', 'back', 'shoulders', 'legs', 'core', 'full body'],
    compatibleExercises: ['Bench Press', 'Squats', 'Deadlift', 'Overhead Press', 'Bent Over Rows', 'Barbell Curls'],
    difficulty: 'intermediate',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'ez_curl_bar',
    name: 'EZ Curl Bar',
    category: 'free_weights',
    aliases: ['ez bar', 'curl bar', 'cambered bar', 'w bar', 'zigzag bar'],
    visualCues: ['curved/wavy bar', 'angled grip positions', 'shorter than olympic bar'],
    description: 'Curved bar reducing wrist strain during curls and extensions',
    muscleGroups: ['biceps', 'triceps', 'forearms'],
    compatibleExercises: ['Barbell Curls', 'Skull Crushers', 'Preacher Curls', 'Upright Rows'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'kettlebell',
    name: 'Kettlebell',
    category: 'free_weights',
    aliases: ['kettlebells', 'kb', 'kettle bell', 'cannon ball with handle', 'russian weight'],
    visualCues: ['ball with handle on top', 'cast iron ball', 'rounded bottom flat top handle'],
    description: 'Cast iron weight with handle for ballistic and grinding exercises',
    muscleGroups: ['full body', 'core', 'shoulders', 'back', 'legs', 'glutes'],
    compatibleExercises: ['Kettlebell Swings', 'Turkish Get-ups', 'Goblet Squats', 'Kettlebell Snatches', 'Farmers Walk'],
    difficulty: 'intermediate',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['gallon jug with handle', 'heavy bag', 'laundry detergent bottle'],
  },
  {
    id: 'weight_plates',
    name: 'Weight Plates',
    category: 'free_weights',
    aliases: ['plates', 'olympic plates', 'bumper plates', 'iron plates', 'weights'],
    visualCues: ['round discs with center hole', 'various sizes', 'plate rack or tree', 'numbered weights'],
    description: 'Round weights that load onto barbells and machines',
    muscleGroups: ['full body'],
    compatibleExercises: ['Plate Carries', 'Plate Front Raises', 'Plate Halos', 'Plate Squats'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'trap_bar',
    name: 'Trap Bar',
    category: 'free_weights',
    aliases: ['hex bar', 'hexagonal bar', 'shrug bar', 'deadlift bar'],
    visualCues: ['hexagonal frame', 'stand inside the bar', 'parallel handles'],
    description: 'Hexagonal bar for deadlifts and shrugs with neutral grip',
    muscleGroups: ['back', 'legs', 'traps', 'glutes', 'hamstrings'],
    compatibleExercises: ['Trap Bar Deadlift', 'Shrugs', 'Farmers Walk', 'Jump Squats'],
    difficulty: 'intermediate',
    isCommon: false,
    canBeImprovised: false,
  },
  {
    id: 'medicine_ball',
    name: 'Medicine Ball',
    category: 'free_weights',
    aliases: ['med ball', 'exercise ball weighted', 'slam ball', 'wall ball'],
    visualCues: ['heavy rubber or leather ball', 'larger than basketball', 'various weights printed'],
    description: 'Weighted ball for throwing, catching, and rotational exercises',
    muscleGroups: ['core', 'shoulders', 'chest', 'full body'],
    compatibleExercises: ['Medicine Ball Slams', 'Wall Balls', 'Russian Twists', 'Chest Pass', 'Rotational Throws'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['basketball with sand', 'heavy ball'],
  },

  // ============================================
  // WEIGHT MACHINES
  // ============================================
  {
    id: 'leg_press',
    name: 'Leg Press Machine',
    category: 'machines',
    aliases: ['leg press', '45 degree leg press', 'seated leg press', 'horizontal leg press'],
    visualCues: ['angled sled platform', 'seat with back support', 'weight stack or plate loaded', 'foot platform'],
    description: 'Machine for pressing heavy weights with legs at an angle',
    muscleGroups: ['quads', 'glutes', 'hamstrings', 'calves'],
    compatibleExercises: ['Leg Press', 'Single Leg Press', 'Calf Press'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'leg_extension',
    name: 'Leg Extension Machine',
    category: 'machines',
    aliases: ['leg extension', 'quad extension', 'knee extension'],
    visualCues: ['seated position', 'padded roller at ankles', 'weight stack behind'],
    description: 'Isolation machine for quadriceps',
    muscleGroups: ['quads'],
    compatibleExercises: ['Leg Extensions'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'leg_curl',
    name: 'Leg Curl Machine',
    category: 'machines',
    aliases: ['leg curl', 'hamstring curl', 'lying leg curl', 'seated leg curl', 'prone leg curl'],
    visualCues: ['lying or seated position', 'padded roller at ankles', 'curl weight toward body'],
    description: 'Isolation machine for hamstrings',
    muscleGroups: ['hamstrings'],
    compatibleExercises: ['Leg Curls', 'Single Leg Curls'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'chest_press_machine',
    name: 'Chest Press Machine',
    category: 'machines',
    aliases: ['chest press', 'machine press', 'seated chest press', 'pec press'],
    visualCues: ['seated with back support', 'handles at chest height', 'push forward motion'],
    description: 'Guided machine for chest pressing movement',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    compatibleExercises: ['Machine Chest Press'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'lat_pulldown',
    name: 'Lat Pulldown Machine',
    category: 'machines',
    aliases: ['lat pulldown', 'pulldown machine', 'lat machine', 'cable pulldown'],
    visualCues: ['seated with thigh pads', 'overhead bar or handles', 'cable system', 'weight stack'],
    description: 'Machine for vertical pulling to work lats',
    muscleGroups: ['back', 'biceps', 'rear delts'],
    compatibleExercises: ['Lat Pulldown', 'Close Grip Pulldown', 'Reverse Grip Pulldown'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'seated_row_machine',
    name: 'Seated Row Machine',
    category: 'machines',
    aliases: ['seated row', 'row machine', 'cable row', 'low row'],
    visualCues: ['seated position', 'foot platform', 'cable with handle', 'horizontal pull'],
    description: 'Machine for horizontal pulling to work middle back',
    muscleGroups: ['back', 'biceps', 'rear delts'],
    compatibleExercises: ['Seated Cable Row', 'Close Grip Row', 'Wide Grip Row'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'shoulder_press_machine',
    name: 'Shoulder Press Machine',
    category: 'machines',
    aliases: ['shoulder press', 'overhead press machine', 'military press machine'],
    visualCues: ['seated with back support', 'handles above shoulders', 'vertical pressing motion'],
    description: 'Guided machine for overhead pressing',
    muscleGroups: ['shoulders', 'triceps'],
    compatibleExercises: ['Machine Shoulder Press'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'pec_deck',
    name: 'Pec Deck / Fly Machine',
    category: 'machines',
    aliases: ['pec deck', 'pec fly', 'butterfly machine', 'chest fly machine', 'pec fly machine'],
    visualCues: ['seated with back pad', 'arm pads at sides', 'bring arms together in front'],
    description: 'Isolation machine for chest fly movement',
    muscleGroups: ['chest'],
    compatibleExercises: ['Pec Deck Fly', 'Machine Fly'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'smith_machine',
    name: 'Smith Machine',
    category: 'machines',
    aliases: ['smith', 'guided barbell', 'fixed barbell rack', 'smith rack'],
    visualCues: ['barbell on vertical rails', 'hooks for racking', 'safety catches', 'fixed path'],
    description: 'Guided barbell on vertical rails for controlled lifts',
    muscleGroups: ['full body'],
    compatibleExercises: ['Smith Squats', 'Smith Bench Press', 'Smith Shoulder Press', 'Smith Lunges'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'hack_squat',
    name: 'Hack Squat Machine',
    category: 'machines',
    aliases: ['hack squat', 'reverse hack squat', 'v squat'],
    visualCues: ['angled platform', 'shoulder pads', 'slide up and down rails'],
    description: 'Machine for squatting at an angle with back support',
    muscleGroups: ['quads', 'glutes'],
    compatibleExercises: ['Hack Squat', 'Reverse Hack Squat'],
    difficulty: 'intermediate',
    isCommon: false,
    canBeImprovised: false,
  },
  {
    id: 'hip_abductor',
    name: 'Hip Abductor Machine',
    category: 'machines',
    aliases: ['abductor', 'outer thigh machine', 'hip abduction', 'good girl bad girl'],
    visualCues: ['seated with pads on outer thighs', 'push legs outward'],
    description: 'Machine for working outer thighs and hip abductors',
    muscleGroups: ['hip abductors', 'glutes'],
    compatibleExercises: ['Hip Abduction'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'hip_adductor',
    name: 'Hip Adductor Machine',
    category: 'machines',
    aliases: ['adductor', 'inner thigh machine', 'hip adduction', 'thigh machine'],
    visualCues: ['seated with pads on inner thighs', 'squeeze legs together'],
    description: 'Machine for working inner thighs',
    muscleGroups: ['hip adductors', 'inner thighs'],
    compatibleExercises: ['Hip Adduction'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'calf_raise_machine',
    name: 'Calf Raise Machine',
    category: 'machines',
    aliases: ['calf machine', 'standing calf raise', 'seated calf raise', 'donkey calf'],
    visualCues: ['shoulder pads or seated position', 'platform for balls of feet', 'raise heels'],
    description: 'Machine for isolating calf muscles',
    muscleGroups: ['calves'],
    compatibleExercises: ['Standing Calf Raises', 'Seated Calf Raises'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'glute_ham_developer',
    name: 'Glute Ham Developer (GHD)',
    category: 'machines',
    aliases: ['ghd', 'glute ham raise', 'roman chair', 'back extension bench'],
    visualCues: ['padded hip support', 'ankle hooks', 'face down position'],
    description: 'Machine for posterior chain development',
    muscleGroups: ['hamstrings', 'glutes', 'lower back', 'core'],
    compatibleExercises: ['GHD Raise', 'Back Extension', 'GHD Sit-ups'],
    difficulty: 'advanced',
    isCommon: false,
    canBeImprovised: false,
  },

  // ============================================
  // CABLE MACHINES
  // ============================================
  {
    id: 'cable_crossover',
    name: 'Cable Crossover Machine',
    category: 'cable_machines',
    aliases: ['cable machine', 'cable crossover', 'dual cable', 'functional trainer', 'cable station'],
    visualCues: ['two tall columns', 'adjustable pulleys', 'various handle attachments', 'weight stacks'],
    description: 'Dual cable system for endless exercise variations',
    muscleGroups: ['full body', 'chest', 'back', 'shoulders', 'arms', 'core'],
    compatibleExercises: ['Cable Crossover', 'Cable Fly', 'Face Pulls', 'Tricep Pushdowns', 'Cable Curls', 'Wood Chops'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'cable_attachments',
    name: 'Cable Attachments',
    category: 'cable_machines',
    aliases: ['rope attachment', 'straight bar', 'v bar', 'd handle', 'ankle strap', 'lat bar'],
    visualCues: ['hooks onto cable', 'various handles', 'rope, bars, or single handles'],
    description: 'Various attachments for cable machines',
    muscleGroups: ['full body'],
    compatibleExercises: ['All cable exercises'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },

  // ============================================
  // CARDIO EQUIPMENT
  // ============================================
  {
    id: 'treadmill',
    name: 'Treadmill',
    category: 'cardio',
    aliases: ['treadmill', 'running machine', 'walking machine'],
    visualCues: ['moving belt', 'handrails', 'display screen', 'incline adjustment'],
    description: 'Motorized belt for walking, jogging, or running indoors',
    muscleGroups: ['legs', 'cardiovascular', 'core'],
    compatibleExercises: ['Walking', 'Jogging', 'Running', 'Incline Walking', 'HIIT Sprints'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['walking outside', 'stairs', 'jump rope'],
  },
  {
    id: 'elliptical',
    name: 'Elliptical Machine',
    category: 'cardio',
    aliases: ['elliptical', 'cross trainer', 'elliptical trainer'],
    visualCues: ['pedals in oval motion', 'moving handles', 'low impact motion'],
    description: 'Low-impact cardio machine simulating walking/running',
    muscleGroups: ['legs', 'arms', 'cardiovascular'],
    compatibleExercises: ['Elliptical Training', 'Interval Training'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'stationary_bike',
    name: 'Stationary Bike',
    category: 'cardio',
    aliases: ['exercise bike', 'spin bike', 'indoor bike', 'cycling machine', 'upright bike', 'recumbent bike'],
    visualCues: ['bicycle seat and pedals', 'handlebars', 'display screen', 'resistance knob'],
    description: 'Indoor cycling machine for cardiovascular training',
    muscleGroups: ['legs', 'cardiovascular', 'glutes'],
    compatibleExercises: ['Cycling', 'Spin Class', 'HIIT Cycling', 'Endurance Ride'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['outdoor cycling', 'jump rope'],
  },
  {
    id: 'rowing_machine',
    name: 'Rowing Machine',
    category: 'cardio',
    aliases: ['rower', 'erg', 'ergometer', 'indoor rower', 'concept 2', 'rowing erg'],
    visualCues: ['sliding seat', 'handle attached to chain/strap', 'foot straps', 'flywheel'],
    description: 'Full-body cardio machine simulating rowing',
    muscleGroups: ['back', 'legs', 'arms', 'core', 'cardiovascular'],
    compatibleExercises: ['Rowing', 'Rowing Intervals', 'Distance Rowing'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'stair_climber',
    name: 'Stair Climber',
    category: 'cardio',
    aliases: ['stair stepper', 'stairmaster', 'step machine', 'stair mill', 'stepper'],
    visualCues: ['rotating stairs or pedals', 'handrails', 'stepping motion'],
    description: 'Machine simulating stair climbing',
    muscleGroups: ['legs', 'glutes', 'cardiovascular'],
    compatibleExercises: ['Stair Climbing', 'Stair Intervals'],
    difficulty: 'intermediate',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['actual stairs', 'step ups on bench'],
  },
  {
    id: 'assault_bike',
    name: 'Assault Bike / Air Bike',
    category: 'cardio',
    aliases: ['assault bike', 'air bike', 'airdyne', 'fan bike', 'echo bike'],
    visualCues: ['large fan wheel', 'moving arm handles', 'no digital resistance'],
    description: 'Full-body bike with air resistance',
    muscleGroups: ['full body', 'cardiovascular'],
    compatibleExercises: ['Air Bike Sprints', 'Steady State Cardio', 'HIIT'],
    difficulty: 'intermediate',
    isCommon: false,
    canBeImprovised: false,
  },
  {
    id: 'ski_erg',
    name: 'Ski Erg',
    category: 'cardio',
    aliases: ['ski erg', 'ski machine', 'skiing machine', 'nordic track'],
    visualCues: ['standing position', 'pull down handles', 'flywheel at top'],
    description: 'Machine simulating cross-country skiing motion',
    muscleGroups: ['back', 'shoulders', 'arms', 'core', 'cardiovascular'],
    compatibleExercises: ['Ski Erg Pulls', 'Interval Training'],
    difficulty: 'intermediate',
    isCommon: false,
    canBeImprovised: false,
  },
  {
    id: 'jump_rope',
    name: 'Jump Rope',
    category: 'cardio',
    aliases: ['skipping rope', 'speed rope', 'weighted rope', 'skip rope'],
    visualCues: ['rope with handles', 'thin cable or thick rope'],
    description: 'Simple cardio tool for jumping exercises',
    muscleGroups: ['calves', 'shoulders', 'cardiovascular', 'coordination'],
    compatibleExercises: ['Jump Rope', 'Double Unders', 'Single Leg Jumps', 'High Knees with Rope'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['imaginary jump rope', 'jumping jacks'],
  },

  // ============================================
  // BODYWEIGHT STATIONS
  // ============================================
  {
    id: 'pull_up_bar',
    name: 'Pull-Up Bar',
    category: 'bodyweight',
    aliases: ['pullup bar', 'chin up bar', 'chinning bar', 'overhead bar', 'hanging bar'],
    visualCues: ['horizontal bar overhead', 'mounted on wall, door, or rack', 'various grip widths'],
    description: 'Overhead bar for pulling exercises',
    muscleGroups: ['back', 'biceps', 'shoulders', 'core', 'forearms'],
    compatibleExercises: ['Pull-ups', 'Chin-ups', 'Hanging Leg Raises', 'Muscle-ups', 'Dead Hang'],
    difficulty: 'intermediate',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['sturdy tree branch', 'playground bars', 'door frame bar', 'rafters'],
  },
  {
    id: 'dip_bars',
    name: 'Dip Bars / Parallel Bars',
    category: 'bodyweight',
    aliases: ['dip station', 'parallel bars', 'dip bars', 'parallettes', 'p bars'],
    visualCues: ['two parallel bars', 'waist height', 'support body weight'],
    description: 'Parallel bars for dips and support holds',
    muscleGroups: ['chest', 'triceps', 'shoulders', 'core'],
    compatibleExercises: ['Dips', 'L-sits', 'Knee Raises', 'Straight Bar Dips'],
    difficulty: 'intermediate',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['two sturdy chairs', 'corner of countertops', 'walker bars'],
  },
  {
    id: 'power_tower',
    name: 'Power Tower',
    category: 'bodyweight',
    aliases: ['power station', 'workout tower', 'captain chair', 'vkr', 'pull up dip station'],
    visualCues: ['tall frame with pull up bar, dip handles, and back pad', 'vertical knee raise station'],
    description: 'Multi-station for pull-ups, dips, and leg raises',
    muscleGroups: ['full upper body', 'core'],
    compatibleExercises: ['Pull-ups', 'Dips', 'Hanging Leg Raises', 'Knee Raises'],
    difficulty: 'intermediate',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'gymnastic_rings',
    name: 'Gymnastic Rings',
    category: 'bodyweight',
    aliases: ['rings', 'gym rings', 'olympic rings', 'training rings', 'suspension rings'],
    visualCues: ['two rings hanging from straps', 'adjustable height', 'wood or plastic rings'],
    description: 'Suspended rings for advanced bodyweight training',
    muscleGroups: ['full body', 'chest', 'back', 'shoulders', 'arms', 'core'],
    compatibleExercises: ['Ring Dips', 'Ring Rows', 'Ring Push-ups', 'Muscle-ups', 'L-sits'],
    difficulty: 'advanced',
    isCommon: false,
    canBeImprovised: false,
  },

  // ============================================
  // RESISTANCE TOOLS
  // ============================================
  {
    id: 'resistance_bands',
    name: 'Resistance Bands',
    category: 'resistance',
    aliases: ['bands', 'exercise bands', 'loop bands', 'pull up bands', 'power bands', 'therabands'],
    visualCues: ['elastic loops or tubes', 'various colors indicating resistance', 'fabric or rubber'],
    description: 'Elastic bands providing variable resistance',
    muscleGroups: ['full body'],
    compatibleExercises: ['Banded Squats', 'Band Pull-aparts', 'Assisted Pull-ups', 'Banded Push-ups', 'Face Pulls'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['bicycle inner tube', 'bungee cords', 'pantyhose'],
  },
  {
    id: 'suspension_trainer',
    name: 'Suspension Trainer (TRX)',
    category: 'resistance',
    aliases: ['trx', 'suspension straps', 'bodyweight trainer', 'suspension system'],
    visualCues: ['two adjustable straps with handles', 'anchor point above', 'yellow and black common'],
    description: 'Adjustable straps for bodyweight resistance training',
    muscleGroups: ['full body', 'core'],
    compatibleExercises: ['TRX Rows', 'TRX Push-ups', 'TRX Squats', 'TRX Pike', 'TRX Fallouts'],
    difficulty: 'intermediate',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['rope with handles', 'towel over door'],
  },
  {
    id: 'resistance_tubes',
    name: 'Resistance Tubes',
    category: 'resistance',
    aliases: ['exercise tubes', 'tube bands', 'cables with handles'],
    visualCues: ['tube with handles on ends', 'door anchor', 'various resistances'],
    description: 'Tubes with handles for resistance exercises',
    muscleGroups: ['full body'],
    compatibleExercises: ['Tube Curls', 'Tube Rows', 'Tube Chest Press', 'Tube Shoulder Press'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },

  // ============================================
  // FUNCTIONAL TRAINING
  // ============================================
  {
    id: 'plyo_box',
    name: 'Plyo Box',
    category: 'functional',
    aliases: ['jump box', 'box', 'plyometric box', 'plyo', 'step up box'],
    visualCues: ['wooden or foam box', 'various heights', 'stable platform'],
    description: 'Box for jumping, stepping, and explosive exercises',
    muscleGroups: ['legs', 'glutes', 'cardiovascular'],
    compatibleExercises: ['Box Jumps', 'Step-ups', 'Box Squats', 'Decline Push-ups', 'Bulgarian Split Squats'],
    difficulty: 'intermediate',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['sturdy bench', 'stairs', 'sturdy chair', 'crate'],
  },
  {
    id: 'battle_ropes',
    name: 'Battle Ropes',
    category: 'functional',
    aliases: ['battling ropes', 'power ropes', 'heavy ropes', 'conditioning ropes'],
    visualCues: ['thick long ropes', 'anchored at center', 'wavy motion'],
    description: 'Heavy ropes for conditioning and upper body endurance',
    muscleGroups: ['shoulders', 'arms', 'core', 'cardiovascular'],
    compatibleExercises: ['Alternating Waves', 'Double Waves', 'Rope Slams', 'Rope Circles'],
    difficulty: 'intermediate',
    isCommon: false,
    canBeImprovised: false,
  },
  {
    id: 'sled',
    name: 'Sled / Prowler',
    category: 'functional',
    aliases: ['prowler', 'push sled', 'pull sled', 'drag sled', 'weight sled'],
    visualCues: ['metal frame on runners', 'weight posts', 'push handles or pull rope'],
    description: 'Weighted sled for pushing and pulling exercises',
    muscleGroups: ['legs', 'glutes', 'core', 'full body', 'cardiovascular'],
    compatibleExercises: ['Sled Push', 'Sled Pull', 'Sled Drag', 'Sled Sprints'],
    difficulty: 'intermediate',
    isCommon: false,
    canBeImprovised: true,
    improvisedAlternatives: ['heavy tire', 'loaded wheelbarrow'],
  },
  {
    id: 'sandbag',
    name: 'Sandbag',
    category: 'functional',
    aliases: ['sand bag', 'training sandbag', 'fitness sandbag', 'heavy bag'],
    visualCues: ['bag filled with sand', 'various handles', 'unstable load'],
    description: 'Unstable weighted bag for functional training',
    muscleGroups: ['full body', 'core', 'grip'],
    compatibleExercises: ['Sandbag Cleans', 'Sandbag Squats', 'Sandbag Carries', 'Sandbag Throws'],
    difficulty: 'intermediate',
    isCommon: false,
    canBeImprovised: true,
    improvisedAlternatives: ['duffel bag with weight', 'heavy backpack'],
  },
  {
    id: 'landmine',
    name: 'Landmine',
    category: 'functional',
    aliases: ['landmine attachment', 'corner barbell', 'landmine press', 't bar row'],
    visualCues: ['barbell anchored at one end', 'pivot point at floor', 'angled movements'],
    description: 'Barbell anchored at one end for rotational exercises',
    muscleGroups: ['shoulders', 'chest', 'core', 'back'],
    compatibleExercises: ['Landmine Press', 'Landmine Rows', 'Landmine Rotations', 'Landmine Squats'],
    difficulty: 'intermediate',
    isCommon: false,
    canBeImprovised: true,
    improvisedAlternatives: ['barbell in corner of room'],
  },
  {
    id: 'ab_wheel',
    name: 'Ab Wheel',
    category: 'functional',
    aliases: ['ab roller', 'rollout wheel', 'core wheel'],
    visualCues: ['wheel with handles on sides', 'roll forward motion'],
    description: 'Wheel for abdominal rollout exercises',
    muscleGroups: ['core', 'shoulders', 'lats'],
    compatibleExercises: ['Ab Rollouts', 'Standing Rollouts'],
    difficulty: 'intermediate',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['barbell with round plates', 'furniture slider'],
  },
  {
    id: 'stability_ball',
    name: 'Stability Ball / Swiss Ball',
    category: 'functional',
    aliases: ['exercise ball', 'swiss ball', 'yoga ball', 'physio ball', 'balance ball'],
    visualCues: ['large inflated ball', 'various sizes', 'sits or lies on'],
    description: 'Inflatable ball for core stability and balance exercises',
    muscleGroups: ['core', 'stabilizers'],
    compatibleExercises: ['Ball Crunches', 'Ball Back Extensions', 'Ball Hamstring Curls', 'Ball Pike'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'bosu_ball',
    name: 'BOSU Ball',
    category: 'functional',
    aliases: ['bosu', 'half ball', 'balance trainer', 'dome ball'],
    visualCues: ['half ball on flat platform', 'blue dome common', 'balance on either side'],
    description: 'Half stability ball for balance training',
    muscleGroups: ['core', 'legs', 'stabilizers'],
    compatibleExercises: ['BOSU Squats', 'BOSU Push-ups', 'BOSU Balance'],
    difficulty: 'intermediate',
    isCommon: true,
    canBeImprovised: false,
  },

  // ============================================
  // RECOVERY & MOBILITY
  // ============================================
  {
    id: 'foam_roller',
    name: 'Foam Roller',
    category: 'recovery',
    aliases: ['roller', 'myofascial roller', 'massage roller', 'self massage'],
    visualCues: ['cylindrical foam tube', 'various densities', 'textured or smooth'],
    description: 'Cylindrical foam for self-myofascial release',
    muscleGroups: ['all muscles'],
    compatibleExercises: ['Foam Rolling - IT Band', 'Foam Rolling - Quads', 'Foam Rolling - Back', 'Thoracic Extensions'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['tennis ball', 'lacrosse ball', 'rolling pin', 'PVC pipe'],
  },
  {
    id: 'lacrosse_ball',
    name: 'Lacrosse Ball / Massage Ball',
    category: 'recovery',
    aliases: ['massage ball', 'trigger point ball', 'muscle ball', 'tennis ball'],
    visualCues: ['small hard ball', 'used against wall or floor'],
    description: 'Small ball for targeted muscle release',
    muscleGroups: ['all muscles'],
    compatibleExercises: ['Trigger Point Release', 'Glute Release', 'Shoulder Release'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['tennis ball', 'golf ball', 'softball'],
  },
  {
    id: 'yoga_blocks',
    name: 'Yoga Blocks',
    category: 'recovery',
    aliases: ['yoga block', 'foam block', 'stretch block'],
    visualCues: ['rectangular foam or cork blocks', 'support for stretches'],
    description: 'Blocks for support during stretching and yoga',
    muscleGroups: ['flexibility support'],
    compatibleExercises: ['Supported Stretches', 'Yoga Poses', 'Elevated Push-ups'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['thick books', 'rolled towel', 'shoe box'],
  },
  {
    id: 'stretching_strap',
    name: 'Stretching Strap',
    category: 'recovery',
    aliases: ['yoga strap', 'stretch strap', 'flexibility strap'],
    visualCues: ['long strap with loops or buckle', 'assists stretches'],
    description: 'Strap to assist with stretching and flexibility',
    muscleGroups: ['flexibility support'],
    compatibleExercises: ['Assisted Hamstring Stretch', 'Shoulder Stretches', 'Hip Flexor Stretches'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['belt', 'towel', 'rope', 'resistance band'],
  },

  // ============================================
  // ACCESSORIES
  // ============================================
  {
    id: 'flat_bench',
    name: 'Flat Bench',
    category: 'accessories',
    aliases: ['weight bench', 'bench', 'utility bench', 'flat weight bench'],
    visualCues: ['padded horizontal surface', 'sturdy frame', 'lies flat'],
    description: 'Horizontal padded bench for various exercises',
    muscleGroups: ['support for all muscles'],
    compatibleExercises: ['Bench Press', 'Dumbbell Rows', 'Step-ups', 'Hip Thrusts', 'Tricep Dips'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['sturdy table', 'piano bench', 'ottoman', 'stairs'],
  },
  {
    id: 'adjustable_bench',
    name: 'Adjustable Bench',
    category: 'accessories',
    aliases: ['incline bench', 'fid bench', 'adjustable weight bench', 'incline decline bench'],
    visualCues: ['bench with adjustable back angle', 'multiple positions', 'incline/decline capable'],
    description: 'Bench with adjustable angles for incline/decline work',
    muscleGroups: ['support for all muscles'],
    compatibleExercises: ['Incline Press', 'Decline Press', 'Seated Shoulder Press', 'Incline Curls'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'squat_rack',
    name: 'Squat Rack / Power Rack',
    category: 'accessories',
    aliases: ['power rack', 'squat cage', 'power cage', 'squat stand', 'half rack'],
    visualCues: ['four vertical posts', 'j hooks for barbell', 'safety bars', 'pull up bar on top'],
    description: 'Safety cage for heavy barbell exercises',
    muscleGroups: ['full body support'],
    compatibleExercises: ['Squats', 'Bench Press', 'Overhead Press', 'Pull-ups', 'Rack Pulls'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'preacher_curl_bench',
    name: 'Preacher Curl Bench',
    category: 'accessories',
    aliases: ['preacher bench', 'curl bench', 'scott bench', 'arm curl bench'],
    visualCues: ['angled pad for arms', 'seat behind', 'barbell or dumbbell rest'],
    description: 'Angled bench for isolated bicep curls',
    muscleGroups: ['biceps'],
    compatibleExercises: ['Preacher Curls', 'Concentration Curls'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['incline bench', 'stability ball'],
  },
  {
    id: 'exercise_mat',
    name: 'Exercise Mat',
    category: 'accessories',
    aliases: ['yoga mat', 'fitness mat', 'floor mat', 'workout mat', 'gym mat'],
    visualCues: ['rectangular padded mat', 'rolled up or flat', 'cushioned surface'],
    description: 'Padded mat for floor exercises',
    muscleGroups: ['support for floor exercises'],
    compatibleExercises: ['All floor exercises', 'Yoga', 'Stretching', 'Core Work'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['carpet', 'towel', 'blanket'],
  },
  {
    id: 'weight_belt',
    name: 'Weight Belt',
    category: 'accessories',
    aliases: ['dip belt', 'weightlifting belt', 'lifting belt', 'chain belt'],
    visualCues: ['belt with chain for adding plates', 'worn around waist'],
    description: 'Belt for adding weight to bodyweight exercises',
    muscleGroups: ['support for weighted exercises'],
    compatibleExercises: ['Weighted Pull-ups', 'Weighted Dips', 'Weighted Chin-ups'],
    difficulty: 'intermediate',
    isCommon: true,
    canBeImprovised: true,
    improvisedAlternatives: ['backpack with weights', 'weight vest'],
  },
  {
    id: 'wrist_straps',
    name: 'Wrist Straps / Lifting Straps',
    category: 'accessories',
    aliases: ['lifting straps', 'pull straps', 'deadlift straps'],
    visualCues: ['fabric straps that wrap around bar and wrist'],
    description: 'Straps to assist grip during heavy lifts',
    muscleGroups: ['grip support'],
    compatibleExercises: ['Deadlifts', 'Rows', 'Pull-ups', 'Shrugs'],
    difficulty: 'intermediate',
    isCommon: true,
    canBeImprovised: false,
  },

  // ============================================
  // OUTDOOR EQUIPMENT
  // ============================================
  {
    id: 'outdoor_pull_up_bar',
    name: 'Outdoor Pull-Up Station',
    category: 'outdoor',
    aliases: ['park pull up bar', 'outdoor bars', 'calisthenics park', 'monkey bars'],
    visualCues: ['metal bars at park', 'playground equipment', 'outdoor fitness station'],
    description: 'Outdoor bars for pull-ups and bodyweight exercises',
    muscleGroups: ['back', 'arms', 'core'],
    compatibleExercises: ['Pull-ups', 'Chin-ups', 'Hanging Exercises', 'Muscle-ups'],
    difficulty: 'intermediate',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'park_bench',
    name: 'Park Bench',
    category: 'outdoor',
    aliases: ['outdoor bench', 'sturdy bench', 'concrete bench'],
    visualCues: ['public bench', 'stable seating surface', 'various heights'],
    description: 'Public bench usable for various exercises',
    muscleGroups: ['full body support'],
    compatibleExercises: ['Step-ups', 'Incline Push-ups', 'Tricep Dips', 'Box Jumps', 'Hip Thrusts'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'stairs',
    name: 'Stairs / Steps',
    category: 'outdoor',
    aliases: ['staircase', 'steps', 'bleachers', 'stadium stairs'],
    visualCues: ['series of steps', 'indoor or outdoor', 'varying heights'],
    description: 'Steps for cardio and leg exercises',
    muscleGroups: ['legs', 'glutes', 'cardiovascular'],
    compatibleExercises: ['Stair Runs', 'Step-ups', 'Stair Lunges', 'Calf Raises on Stairs'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'hill',
    name: 'Hill / Incline',
    category: 'outdoor',
    aliases: ['slope', 'incline', 'grassy hill', 'ramp'],
    visualCues: ['sloped ground', 'natural or man-made incline'],
    description: 'Inclined surface for running and exercises',
    muscleGroups: ['legs', 'glutes', 'cardiovascular'],
    compatibleExercises: ['Hill Sprints', 'Hill Walking', 'Bear Crawls'],
    difficulty: 'intermediate',
    isCommon: true,
    canBeImprovised: false,
  },

  // ============================================
  // IMPROVISED / HOME EQUIPMENT
  // ============================================
  {
    id: 'chair',
    name: 'Sturdy Chair',
    category: 'improvised',
    aliases: ['dining chair', 'kitchen chair', 'office chair without wheels'],
    visualCues: ['stable four-legged chair', 'no wheels', 'flat seat'],
    description: 'Household chair for various exercises',
    muscleGroups: ['full body support'],
    compatibleExercises: ['Chair Dips', 'Step-ups', 'Incline Push-ups', 'Bulgarian Split Squats'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'wall',
    name: 'Wall',
    category: 'improvised',
    aliases: ['flat wall', 'wall space', 'sturdy wall'],
    visualCues: ['any sturdy wall', 'flat vertical surface'],
    description: 'Wall for support and resistance exercises',
    muscleGroups: ['full body'],
    compatibleExercises: ['Wall Sits', 'Wall Push-ups', 'Wall Handstands', 'Wall Angels'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'towel',
    name: 'Towel',
    category: 'improvised',
    aliases: ['bath towel', 'beach towel', 'exercise towel'],
    visualCues: ['fabric towel', 'can be folded or stretched'],
    description: 'Towel for sliding exercises and stretching',
    muscleGroups: ['core', 'legs', 'flexibility'],
    compatibleExercises: ['Towel Rows', 'Towel Slides', 'Towel Stretches', 'Slider Exercises'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'backpack',
    name: 'Weighted Backpack',
    category: 'improvised',
    aliases: ['rucksack', 'loaded backpack', 'book bag', 'heavy backpack'],
    visualCues: ['backpack filled with books or weights'],
    description: 'Backpack loaded with weight for resistance',
    muscleGroups: ['full body'],
    compatibleExercises: ['Weighted Squats', 'Weighted Push-ups', 'Weighted Lunges', 'Rucking'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'gallon_jug',
    name: 'Gallon Jug / Water Bottle',
    category: 'improvised',
    aliases: ['milk jug', 'water jug', 'filled bottle', 'laundry detergent bottle'],
    visualCues: ['plastic jug with handle', 'filled with water or sand'],
    description: 'Filled jugs as improvised weights',
    muscleGroups: ['arms', 'shoulders', 'back'],
    compatibleExercises: ['Jug Curls', 'Jug Rows', 'Jug Carries', 'Jug Shoulder Press'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'floor_space',
    name: 'Open Floor Space',
    category: 'improvised',
    aliases: ['floor', 'ground', 'mat area', 'living room floor'],
    visualCues: ['clear floor area', 'enough room to lie down and move'],
    description: 'Clear floor space for bodyweight exercises',
    muscleGroups: ['full body'],
    compatibleExercises: ['Push-ups', 'Sit-ups', 'Planks', 'Burpees', 'Mountain Climbers'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'door_frame',
    name: 'Door Frame',
    category: 'improvised',
    aliases: ['doorway', 'door opening', 'sturdy door frame'],
    visualCues: ['door opening', 'sturdy frame', 'can mount pull up bar'],
    description: 'Door frame for stretches and mounted equipment',
    muscleGroups: ['chest', 'shoulders', 'back'],
    compatibleExercises: ['Door Frame Rows', 'Chest Stretches', 'Door Pull-ups'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
  {
    id: 'couch',
    name: 'Couch / Sofa',
    category: 'improvised',
    aliases: ['sofa', 'loveseat', 'sturdy couch'],
    visualCues: ['living room couch', 'stable seating'],
    description: 'Couch for decline exercises and step-ups',
    muscleGroups: ['full body'],
    compatibleExercises: ['Decline Push-ups', 'Couch Dips', 'Step-ups', 'Hip Thrusts'],
    difficulty: 'beginner',
    isCommon: true,
    canBeImprovised: false,
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Normalize equipment name for matching
function normalizeEquipmentName(name: string): string {
  let normalized = name.toLowerCase().trim();

  // Remove common articles and filler words
  const fillerWords = ['the', 'a', 'an', 'my', 'your', 'some', 'with', 'and'];
  fillerWords.forEach(word => {
    normalized = normalized.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  });

  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

// Find equipment by name with fuzzy matching
export function findEquipmentByName(name: string): EquipmentData | undefined {
  const normalized = normalizeEquipmentName(name);

  // Try exact match on name first
  let match = EQUIPMENT_LIBRARY.find(eq =>
    eq.name.toLowerCase() === normalized ||
    eq.id === normalized
  );
  if (match) return match;

  // Try alias match
  match = EQUIPMENT_LIBRARY.find(eq =>
    eq.aliases.some(alias =>
      alias.toLowerCase() === normalized ||
      normalized.includes(alias.toLowerCase()) ||
      alias.toLowerCase().includes(normalized)
    )
  );
  if (match) return match;

  // Try partial name match
  match = EQUIPMENT_LIBRARY.find(eq =>
    eq.name.toLowerCase().includes(normalized) ||
    normalized.includes(eq.name.toLowerCase())
  );
  if (match) return match;

  // Try word-by-word match
  const searchWords = normalized.split(/\s+/).filter(w => w.length > 2);
  match = EQUIPMENT_LIBRARY.find(eq => {
    const eqWords = eq.name.toLowerCase().split(/\s+/);
    const aliasWords = eq.aliases.flatMap(a => a.toLowerCase().split(/\s+/));
    const allWords = [...eqWords, ...aliasWords];
    return searchWords.some(word =>
      allWords.some(eqWord => eqWord.includes(word) || word.includes(eqWord))
    );
  });

  return match;
}

// Find all equipment matching a list of detected items
export function matchDetectedEquipment(detectedItems: string[]): EquipmentData[] {
  const matched: EquipmentData[] = [];
  const matchedIds = new Set<string>();

  for (const item of detectedItems) {
    const equipment = findEquipmentByName(item);
    if (equipment && !matchedIds.has(equipment.id)) {
      matched.push(equipment);
      matchedIds.add(equipment.id);
    }
  }

  return matched;
}

// Get equipment by category
export function getEquipmentByCategory(category: EquipmentCategory): EquipmentData[] {
  return EQUIPMENT_LIBRARY.filter(eq => eq.category === category);
}

// Get equipment that can work a specific muscle group
export function getEquipmentForMuscleGroup(muscleGroup: string): EquipmentData[] {
  const normalized = muscleGroup.toLowerCase();
  return EQUIPMENT_LIBRARY.filter(eq =>
    eq.muscleGroups.some(mg =>
      mg.toLowerCase().includes(normalized) ||
      normalized.includes(mg.toLowerCase())
    )
  );
}

// Get improvised alternatives for equipment
export function getImprovisedAlternatives(equipmentId: string): string[] {
  const equipment = EQUIPMENT_LIBRARY.find(eq => eq.id === equipmentId);
  return equipment?.improvisedAlternatives || [];
}

// Get all exercises compatible with given equipment
export function getExercisesForEquipment(equipmentIds: string[]): string[] {
  const exercises = new Set<string>();

  for (const id of equipmentIds) {
    const equipment = EQUIPMENT_LIBRARY.find(eq => eq.id === id);
    if (equipment) {
      equipment.compatibleExercises.forEach(ex => exercises.add(ex));
    }
  }

  return Array.from(exercises);
}

// Get equipment suggestions based on available items
export function suggestAdditionalEquipment(currentEquipment: string[]): EquipmentData[] {
  const currentIds = new Set(currentEquipment.map(e => findEquipmentByName(e)?.id).filter(Boolean));

  // Suggest common equipment that would complement what's available
  return EQUIPMENT_LIBRARY.filter(eq =>
    eq.isCommon &&
    !currentIds.has(eq.id) &&
    eq.canBeImprovised
  ).slice(0, 5);
}

// Format equipment list for AI prompt
export function formatEquipmentForPrompt(): string {
  const categories = new Map<EquipmentCategory, string[]>();

  EQUIPMENT_LIBRARY.forEach(eq => {
    if (!categories.has(eq.category)) {
      categories.set(eq.category, []);
    }
    categories.get(eq.category)!.push(eq.name);
  });

  let result = 'Equipment to look for:\n';
  categories.forEach((items, category) => {
    const categoryInfo = EQUIPMENT_CATEGORIES[category];
    result += `\n${categoryInfo.name}: ${items.join(', ')}`;
  });

  return result;
}

// Get visual cues for AI to help identify equipment
export function getVisualCuesForRecognition(): string {
  return EQUIPMENT_LIBRARY.map(eq =>
    `${eq.name}: ${eq.visualCues.join(', ')}`
  ).join('\n');
}
