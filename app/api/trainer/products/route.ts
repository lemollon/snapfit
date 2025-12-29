import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, trainerProducts } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET - Fetch trainer's products (or public products for a trainer profile)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trainerId = searchParams.get('trainerId');

    // If trainerId provided, get that trainer's public products
    if (trainerId) {
      const products = await db
        .select()
        .from(trainerProducts)
        .where(
          and(
            eq(trainerProducts.trainerId, trainerId),
            eq(trainerProducts.isActive, true)
          )
        )
        .orderBy(trainerProducts.sortOrder, desc(trainerProducts.createdAt));

      return NextResponse.json({ products });
    }

    // Otherwise get current user's products (must be trainer)
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

    const products = await db
      .select()
      .from(trainerProducts)
      .where(eq(trainerProducts.trainerId, trainer.id))
      .orderBy(trainerProducts.sortOrder, desc(trainerProducts.createdAt));

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST - Add new product
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
      imageUrl,
      productUrl,
      category,
      price,
      currency,
      isFeatured,
    } = body;

    if (!name || !productUrl || !category) {
      return NextResponse.json(
        { error: 'Name, product URL, and category are required' },
        { status: 400 }
      );
    }

    const [product] = await db
      .insert(trainerProducts)
      .values({
        trainerId: trainer.id,
        name,
        description,
        imageUrl,
        productUrl,
        category,
        price,
        currency: currency || 'USD',
        isFeatured: isFeatured || false,
      })
      .returning();

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// PATCH - Update product
export async function PATCH(req: Request) {
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const [product] = await db
      .update(trainerProducts)
      .set(updates)
      .where(
        and(
          eq(trainerProducts.id, id),
          eq(trainerProducts.trainerId, trainer.id)
        )
      )
      .returning();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - Remove product
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
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
      .delete(trainerProducts)
      .where(
        and(
          eq(trainerProducts.id, productId),
          eq(trainerProducts.trainerId, trainer.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
