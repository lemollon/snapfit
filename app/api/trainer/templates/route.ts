import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, workoutTemplates } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET - Fetch trainer's workout templates
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [trainer] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!trainer?.isTrainer) {
      return NextResponse.json({ error: 'Not a trainer account' }, { status: 403 });
    }

    const templates = await db
      .select()
      .from(workoutTemplates)
      .where(eq(workoutTemplates.trainerId, trainer.id))
      .orderBy(desc(workoutTemplates.createdAt));

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST - Create new workout template
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [trainer] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!trainer?.isTrainer) {
      return NextResponse.json({ error: 'Not a trainer account' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      duration,
      fitnessLevel,
      category,
      equipment,
      exercises,
      isPublic,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }

    const [template] = await db
      .insert(workoutTemplates)
      .values({
        trainerId: trainer.id,
        name,
        description,
        duration,
        fitnessLevel,
        category,
        equipment,
        exercises,
        isPublic: isPublic || false,
      })
      .returning();

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

// DELETE - Remove workout template
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const [trainer] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!trainer?.isTrainer) {
      return NextResponse.json({ error: 'Not a trainer account' }, { status: 403 });
    }

    await db
      .delete(workoutTemplates)
      .where(
        and(
          eq(workoutTemplates.id, templateId),
          eq(workoutTemplates.trainerId, trainer.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
