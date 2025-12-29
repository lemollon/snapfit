import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { findExerciseByName, EXERCISE_LIBRARY } from '@/lib/data/exercise-library';
import {
  EQUIPMENT_LIBRARY,
  EQUIPMENT_CATEGORIES,
  findEquipmentByName,
  matchDetectedEquipment,
  getExercisesForEquipment,
  getImprovisedAlternatives,
} from '@/lib/data/equipment-library';

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

// Enrich detected equipment with library data
function enrichEquipmentWithDetails(detectedEquipment: string[]): any[] {
  return detectedEquipment.map(item => {
    const match = findEquipmentByName(item);
    if (match) {
      return {
        name: match.name,
        id: match.id,
        category: match.category,
        categoryName: EQUIPMENT_CATEGORIES[match.category].name,
        muscleGroups: match.muscleGroups,
        compatibleExercises: match.compatibleExercises.slice(0, 5), // Top 5 exercises
        canBeImprovised: match.canBeImprovised,
        improvisedAlternatives: match.improvisedAlternatives,
        matched: true,
      };
    }
    // Return unmatched item with basic info
    return {
      name: item,
      matched: false,
    };
  });
}

// Build equipment recognition hints for the AI prompt
function getEquipmentRecognitionHints(): string {
  const categories = Object.entries(EQUIPMENT_CATEGORIES).map(([key, value]) => {
    const items = EQUIPMENT_LIBRARY.filter(eq => eq.category === key)
      .map(eq => eq.name)
      .slice(0, 10)
      .join(', ');
    return `${value.name}: ${items}`;
  }).join('\n');

  return categories;
}

// Get visual cues to help AI identify equipment
function getVisualCues(): string {
  return EQUIPMENT_LIBRARY
    .filter(eq => eq.isCommon)
    .slice(0, 30) // Top 30 common items
    .map(eq => `- ${eq.name}: ${eq.visualCues.slice(0, 2).join(', ')}`)
    .join('\n');
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

    // Get equipment recognition hints and visual cues
    const equipmentHints = getEquipmentRecognitionHints();
    const visualCues = getVisualCues();

    const prompt = `You are an expert personal trainer with extensive knowledge of gym equipment. Analyze these ${images.length} photo(s) of a workout environment.

TASK 1 - EQUIPMENT DETECTION:
Carefully identify ALL workout equipment visible in the image(s). Use these categories and visual cues:

EQUIPMENT CATEGORIES:
${equipmentHints}

VISUAL IDENTIFICATION GUIDE:
${visualCues}

Also look for:
- Improvised equipment (chairs, tables, countertops, sturdy furniture)
- Outdoor features (benches, bars, hills, stairs)
- Open floor space for bodyweight exercises
- Walls for wall sits, stretches, etc.

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
    "equipmentDetails": {
        "detected": ["list of equipment you can clearly identify"],
        "possible": ["equipment that might be present but unclear"],
        "suggested": ["equipment that would complement this space"]
    },
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

    // Enrich equipment with detailed library information
    if (workoutPlan.equipment) {
      workoutPlan.equipmentEnriched = enrichEquipmentWithDetails(workoutPlan.equipment);

      // Get all compatible exercises based on detected equipment
      const matchedEquipment = matchDetectedEquipment(workoutPlan.equipment);
      const equipmentIds = matchedEquipment.map(eq => eq.id);
      workoutPlan.compatibleExercises = getExercisesForEquipment(equipmentIds);

      // Add summary stats
      workoutPlan.equipmentSummary = {
        total: workoutPlan.equipment.length,
        matched: workoutPlan.equipmentEnriched.filter((e: any) => e.matched).length,
        categories: Array.from(new Set(matchedEquipment.map(eq => eq.category))),
        muscleGroupsCovered: Array.from(new Set(matchedEquipment.flatMap(eq => eq.muscleGroups))),
      };
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
