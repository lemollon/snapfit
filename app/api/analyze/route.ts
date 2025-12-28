import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

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
