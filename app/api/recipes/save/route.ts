import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { savedRecipes, recipes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// POST - Save a recipe
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipeId } = body;

    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Check if already saved
    const existing = await db
      .select()
      .from(savedRecipes)
      .where(and(eq(savedRecipes.userId, userId), eq(savedRecipes.recipeId, recipeId)));

    if (existing.length > 0) {
      // Unsave
      await db
        .delete(savedRecipes)
        .where(eq(savedRecipes.id, existing[0].id));

      // Decrement save count
      const recipe = await db.select().from(recipes).where(eq(recipes.id, recipeId));
      if (recipe.length > 0) {
        await db
          .update(recipes)
          .set({ saveCount: Math.max(0, (recipe[0].saveCount || 0) - 1) })
          .where(eq(recipes.id, recipeId));
      }

      return NextResponse.json({ saved: false, message: 'Recipe unsaved' });
    } else {
      // Save
      await db
        .insert(savedRecipes)
        .values({ userId, recipeId });

      // Increment save count
      const recipe = await db.select().from(recipes).where(eq(recipes.id, recipeId));
      await db
        .update(recipes)
        .set({ saveCount: (recipe[0]?.saveCount || 0) + 1 })
        .where(eq(recipes.id, recipeId));

      return NextResponse.json({ saved: true, message: 'Recipe saved' }, { status: 201 });
    }
  } catch (error) {
    console.error('Error saving recipe:', error);
    return NextResponse.json({ error: 'Failed to save recipe' }, { status: 500 });
  }
}
