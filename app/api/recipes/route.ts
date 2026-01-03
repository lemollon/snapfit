import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { recipes, savedRecipes } from '@/lib/db/schema';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';

// GET - Fetch recipes with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const diet = searchParams.get('diet');
    const saved = searchParams.get('saved');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const session = await getServerSession();
    const userId = session?.user ? (session.user as any).id : null;

    // Build query conditions
    let conditions: any[] = [eq(recipes.isPublic, true)];

    if (category && category !== 'all') {
      conditions.push(eq(recipes.category, category));
    }

    if (search) {
      conditions.push(
        or(
          ilike(recipes.name, `%${search}%`),
          ilike(recipes.description, `%${search}%`)
        )
      );
    }

    // Get recipes
    let query = db
      .select()
      .from(recipes)
      .where(and(...conditions))
      .orderBy(desc(recipes.isFeatured), desc(recipes.rating))
      .limit(limit)
      .offset(offset);

    const recipeList = await query;

    // If user is logged in, get their saved recipes
    let savedRecipeIds: string[] = [];
    if (userId) {
      const userSaved = await db
        .select({ recipeId: savedRecipes.recipeId })
        .from(savedRecipes)
        .where(eq(savedRecipes.userId, userId));
      savedRecipeIds = userSaved.map(s => s.recipeId);
    }

    // Combine recipes with saved status
    const recipesWithSaved = recipeList.map(recipe => ({
      ...recipe,
      isSaved: savedRecipeIds.includes(recipe.id),
    }));

    // Filter by saved if requested
    if (saved === 'true' && userId) {
      const savedOnly = recipesWithSaved.filter(r => r.isSaved);
      return NextResponse.json(savedOnly);
    }

    return NextResponse.json(recipesWithSaved);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}

// POST - Create new recipe (trainer only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.isTrainer) {
      return NextResponse.json({ error: 'Only trainers can create recipes' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name, description, imageUrl, category, cuisine, tags,
      prepTime, cookTime, servings, difficulty,
      calories, protein, carbs, fat, fiber,
      ingredients, instructions, tips, videoUrl, isPublic
    } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }

    const [recipe] = await db
      .insert(recipes)
      .values({
        trainerId: user.id,
        name,
        description,
        imageUrl,
        category,
        cuisine,
        tags,
        prepTime,
        cookTime,
        servings: servings || 1,
        difficulty: difficulty || 'easy',
        calories,
        protein,
        carbs,
        fat,
        fiber,
        ingredients,
        instructions,
        tips,
        videoUrl,
        isPublic: isPublic !== false,
      })
      .returning();

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 });
  }
}
