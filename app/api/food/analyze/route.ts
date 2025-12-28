import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  try {
    const { imageBase64, apiKey } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const anthropicKey = apiKey || process.env.ANTHROPIC_API_KEY;

    if (!anthropicKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: anthropicKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
              },
            },
            {
              type: 'text',
              text: `Analyze this food image and provide nutritional estimates. Return a JSON object with:

{
  "foodName": "Name of the food/meal",
  "description": "Brief description of what you see",
  "servingSize": "Estimated portion size",
  "calories": number (estimated calories),
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams),
  "healthScore": number (1-10, where 10 is healthiest),
  "suggestions": ["array of health tips or suggestions"],
  "ingredients": ["detected ingredients"],
  "confidence": "low" | "medium" | "high"
}

Be realistic with estimates. If you can't identify the food clearly, set confidence to "low" and provide your best estimate.
Return ONLY the JSON object, no additional text.`,
            },
          ],
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the JSON response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      // If parsing fails, return the raw text
      analysis = {
        foodName: 'Unknown Food',
        description: responseText,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        confidence: 'low',
      };
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Food analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze food' }, { status: 500 });
  }
}
