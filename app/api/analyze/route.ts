import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { findExerciseByName, EXERCISE_LIBRARY } from '@/lib/data/exercise-library';

// Add video URLs to exercises by matching with our library
function enrichExercisesWithVideos(exercises: any[]): any[] {
  return exercises.map(exercise => {
    const libraryMatch = findExerciseByName(exercise.name);
    if (libraryMatch) {
      return {
        ...exercise,
        videoUrl: libraryMatch.videoUrl,
        muscleGroup: libraryMatch.muscleGroup,
      };
    }
    // If no match found, provide a YouTube search link as fallback
    const searchQuery = encodeURIComponent(`${exercise.name} exercise how to`);
    return {
      ...exercise,
      videoUrl: `https://www.youtube.com/results?search_query=${searchQuery}`,
      videoUrlType: 'search', // Indicates this is a search link, not a direct video
    };
  });
}

export async function POST(request: Request) {
  try {
    const { images, fitnessLevel, duration, workoutTypes } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server API key not configured' }, { status: 500 });
    }

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });

    // Include exercise library names to help AI use exercises we have videos for
    const exerciseNames = EXERCISE_LIBRARY.map(ex => ex.name).join(', ');

    const prompt = `You are an expert personal trainer. Analyze these ${images.length} photo(s) of a workout environment.

TASK 1 - EQUIPMENT DETECTION:
Identify ALL workout equipment, furniture, or environmental features that could be used for exercise. Be creative and thorough. Include:
- Traditional gym equipment (dumbbells, barbells, machines, etc.)
- Bodyweight workout areas (open floor space, walls, stairs, etc.)
- Improvised equipment (chairs, tables, countertops, sturdy furniture, etc.)
- Outdoor features (benches, bars, hills, etc.)

TASK 2 - WORKOUT ROUTINE:
Create a detailed ${duration}-minute workout routine for a ${fitnessLevel} level fitness enthusiast.
Focus on: ${workoutTypes}

IMPORTANT: When possible, use exercises from this list (we have demo videos for these):
${exerciseNames}

Include:
- Warm-up (3-5 minutes)
- Main workout with specific exercises
- For each exercise: name, sets, reps/duration, and brief form tips
- Cool-down/stretch (3-5 minutes)

Respond in this EXACT JSON format:
{
    "equipment": ["item1", "item2", ...],
    "workout": {
        "warmup": [
            {"name": "exercise name", "duration": "X minutes", "description": "brief description"}
        ],
        "main": [
            {"name": "exercise name", "sets": X, "reps": "X reps or X seconds", "equipment": "what to use", "tips": "form tips"}
        ],
        "cooldown": [
            {"name": "stretch name", "duration": "X seconds", "description": "brief description"}
        ]
    },
    "notes": "Any important safety notes or modifications"
}

CRITICAL: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation text.`;

    const content = [
      ...images,
      { type: 'text' as const, text: prompt },
    ];

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content }],
    });

    const responseText = (message.content[0] as { type: 'text'; text: string }).text;
    const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const workoutPlan = JSON.parse(cleanedResponse);

    // Enrich all exercises with video URLs from our library
    if (workoutPlan.workout) {
      if (workoutPlan.workout.warmup) {
        workoutPlan.workout.warmup = enrichExercisesWithVideos(workoutPlan.workout.warmup);
      }
      if (workoutPlan.workout.main) {
        workoutPlan.workout.main = enrichExercisesWithVideos(workoutPlan.workout.main);
      }
      if (workoutPlan.workout.cooldown) {
        workoutPlan.workout.cooldown = enrichExercisesWithVideos(workoutPlan.workout.cooldown);
      }
    }

    return NextResponse.json(workoutPlan);
  } catch (error) {
    console.error('Error analyzing environment:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse workout plan from AI response' },
        { status: 500 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
