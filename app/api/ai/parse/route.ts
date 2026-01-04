import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

interface ParsedAction {
  type: 'workout' | 'food' | 'habit' | 'pr' | 'timer' | 'recipe' | 'unknown';
  data: Record<string, any>;
  message: string;
  confidence: number;
}

// Natural language patterns for fitness actions
const PATTERNS = {
  // Water/Hydration
  water: /(?:drank?|had|log(?:ged)?)\s*(\d+)\s*(?:glasses?|cups?|oz|ounces?|ml|liters?|l)\s*(?:of\s*)?water/i,
  waterSimple: /(\d+)\s*(?:glasses?|cups?)\s*(?:of\s*)?water/i,

  // Workout/Exercise
  workout: /(?:did|completed?|finished|log(?:ged)?)\s*(?:a\s*)?(\d+)?\s*(?:minute|min|hour|hr)?\s*(workout|exercise|training|session|cardio|hiit|yoga|run|jog|walk|swim|bike|cycling)/i,
  exercise: /(?:did|completed?|finished)\s*(\d+)\s*(?:sets?\s*(?:of\s*)?)?(\d+)?\s*(?:reps?\s*(?:of\s*)?)?([\w\s]+?)(?:\s*at\s*(\d+)\s*(?:lbs?|kg|pounds?|kilos?))?/i,

  // Personal Records
  pr: /(?:benched?|squatt?ed?|deadlifted?|pressed?|curled?|lifted?)\s*(\d+)\s*(?:lbs?|kg|pounds?|kilos?)?\s*(?:for\s*)?(\d+)?\s*(?:reps?)?/i,
  newPR: /(?:new\s*)?pr[:\s]+(.+)/i,

  // Food/Nutrition
  food: /(?:ate|had|log(?:ged)?|eaten)\s*(?:a\s*)?([\w\s,]+?)(?:\s*for\s*)?(breakfast|lunch|dinner|snack)?/i,
  calories: /(\d+)\s*(?:calories?|cals?|kcal)/i,
  protein: /(\d+)\s*(?:g|grams?)\s*(?:of\s*)?protein/i,

  // Habits
  habit: /(?:completed?|did|finished|log(?:ged)?)\s*(?:my\s*)?([\w\s]+?)\s*habit/i,
  meditation: /(?:meditated?|meditation)\s*(?:for\s*)?(\d+)?\s*(?:minutes?|mins?)?/i,
  sleep: /(?:slept|sleep)\s*(?:for\s*)?(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/i,
  steps: /(?:walked?|took|did)\s*(\d+(?:,\d+)?)\s*steps?/i,

  // Timer
  timer: /(?:start|set|begin)\s*(?:a\s*)?(\d+)\s*(?:minute|min|second|sec|hour|hr)?\s*(timer|countdown|amrap|emom|tabata)/i,

  // Recipe
  recipe: /(?:find|search|show|get)\s*(?:me\s*)?(?:a\s*)?([\w\s]+?)\s*recipe/i,
};

function parseInput(input: string): ParsedAction {
  const text = input.toLowerCase().trim();

  // Check for water logging
  let match = text.match(PATTERNS.water) || text.match(PATTERNS.waterSimple);
  if (match) {
    const amount = parseInt(match[1]);
    return {
      type: 'habit',
      data: {
        habitType: 'water',
        amount,
        unit: 'glasses',
      },
      message: `Log ${amount} glass${amount > 1 ? 'es' : ''} of water?`,
      confidence: 0.95,
    };
  }

  // Check for PR/lifting
  match = text.match(PATTERNS.pr);
  if (match) {
    const exercise = text.match(/(bench|squat|deadlift|press|curl|lift)/i)?.[1] || 'lift';
    const weight = parseInt(match[1]);
    const reps = match[2] ? parseInt(match[2]) : 1;
    const isNewPR = text.includes('pr') || text.includes('personal record') || text.includes('new');

    return {
      type: 'pr',
      data: {
        exerciseName: exercise.charAt(0).toUpperCase() + exercise.slice(1),
        maxWeight: weight,
        maxReps: reps,
        unit: text.includes('kg') ? 'kg' : 'lbs',
        category: 'strength',
      },
      message: `${isNewPR ? '🎉 New PR! ' : ''}Log ${exercise} at ${weight}${text.includes('kg') ? 'kg' : 'lbs'} for ${reps} rep${reps > 1 ? 's' : ''}?`,
      confidence: isNewPR ? 0.98 : 0.9,
    };
  }

  // Check for timer
  match = text.match(PATTERNS.timer);
  if (match) {
    const duration = parseInt(match[1]);
    const type = match[2]?.toLowerCase() || 'timer';
    let unit = 'minutes';
    if (text.includes('sec')) unit = 'seconds';
    if (text.includes('hour') || text.includes('hr')) unit = 'hours';

    return {
      type: 'timer',
      data: {
        duration,
        unit,
        timerType: type.toUpperCase(),
      },
      message: `Start a ${duration} ${unit} ${type.toUpperCase()}?`,
      confidence: 0.95,
    };
  }

  // Check for meditation
  match = text.match(PATTERNS.meditation);
  if (match) {
    const duration = match[1] ? parseInt(match[1]) : 10;
    return {
      type: 'habit',
      data: {
        habitType: 'meditation',
        duration,
        unit: 'minutes',
      },
      message: `Log ${duration} minutes of meditation?`,
      confidence: 0.9,
    };
  }

  // Check for sleep
  match = text.match(PATTERNS.sleep);
  if (match) {
    const hours = parseFloat(match[1]);
    return {
      type: 'habit',
      data: {
        habitType: 'sleep',
        duration: hours,
        unit: 'hours',
      },
      message: `Log ${hours} hours of sleep?`,
      confidence: 0.92,
    };
  }

  // Check for steps
  match = text.match(PATTERNS.steps);
  if (match) {
    const steps = parseInt(match[1].replace(',', ''));
    return {
      type: 'habit',
      data: {
        habitType: 'steps',
        value: steps,
      },
      message: `Log ${steps.toLocaleString()} steps?`,
      confidence: 0.95,
    };
  }

  // Check for workout
  match = text.match(PATTERNS.workout);
  if (match) {
    const duration = match[1] ? parseInt(match[1]) : 30;
    const workoutType = match[2] || 'workout';

    return {
      type: 'workout',
      data: {
        type: workoutType,
        duration,
        unit: text.includes('hour') || text.includes('hr') ? 'hours' : 'minutes',
      },
      message: `Log a ${duration} minute ${workoutType}?`,
      confidence: 0.88,
    };
  }

  // Check for food
  match = text.match(PATTERNS.food);
  if (match) {
    const food = match[1]?.trim();
    const meal = match[2] || 'meal';

    // Try to extract calories
    const calorieMatch = text.match(PATTERNS.calories);
    const proteinMatch = text.match(PATTERNS.protein);

    return {
      type: 'food',
      data: {
        description: food,
        meal,
        calories: calorieMatch ? parseInt(calorieMatch[1]) : null,
        protein: proteinMatch ? parseInt(proteinMatch[1]) : null,
      },
      message: `Log "${food}" as ${meal}?`,
      confidence: 0.75,
    };
  }

  // Check for recipe search
  match = text.match(PATTERNS.recipe);
  if (match) {
    const query = match[1]?.trim();
    return {
      type: 'recipe',
      data: {
        query,
      },
      message: `Search for ${query} recipes?`,
      confidence: 0.85,
    };
  }

  // Check for general habit
  match = text.match(PATTERNS.habit);
  if (match) {
    const habitName = match[1]?.trim();
    return {
      type: 'habit',
      data: {
        name: habitName,
        completed: true,
      },
      message: `Mark "${habitName}" habit as complete?`,
      confidence: 0.7,
    };
  }

  // Unknown - but try to be helpful
  return {
    type: 'unknown',
    data: { rawInput: input },
    message: "I'm not sure what you'd like to log. Try saying something like:\n• \"Drank 8 glasses of water\"\n• \"Benched 225 for 5 reps\"\n• \"30 minute run\"\n• \"Had chicken salad for lunch\"",
    confidence: 0,
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { input } = body;

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    const parsed = parseInput(input);

    return NextResponse.json({
      success: true,
      action: parsed,
      message: parsed.message,
    });
  } catch (error) {
    console.error('Error parsing AI input:', error);
    return NextResponse.json({ error: 'Failed to parse input' }, { status: 500 });
  }
}
