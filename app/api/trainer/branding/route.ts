import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { trainerBranding } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch trainer's branding settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.isTrainer) {
      return NextResponse.json({ error: 'Only trainers can access branding settings' }, { status: 403 });
    }

    const branding = await db
      .select()
      .from(trainerBranding)
      .where(eq(trainerBranding.trainerId, user.id));

    if (branding.length === 0) {
      // Return default branding
      return NextResponse.json({
        businessName: '',
        tagline: '',
        logoUrl: '',
        primaryColor: '#8B5CF6',
        secondaryColor: '#EC4899',
        accentColor: '#06B6D4',
        backgroundColor: '#0F172A',
        fontFamily: 'Inter',
        customDomain: '',
        instagramHandle: '',
        tiktokHandle: '',
        youtubeHandle: '',
        twitterHandle: '',
        hideSnapfitBranding: false,
      });
    }

    return NextResponse.json(branding[0]);
  } catch (error) {
    console.error('Error fetching branding:', error);
    return NextResponse.json({ error: 'Failed to fetch branding' }, { status: 500 });
  }
}

// POST/PUT - Create or update branding settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.isTrainer) {
      return NextResponse.json({ error: 'Only trainers can update branding settings' }, { status: 403 });
    }

    const body = await request.json();
    const {
      businessName, tagline, logoUrl, logoLightUrl, faviconUrl,
      primaryColor, secondaryColor, accentColor, backgroundColor,
      fontFamily, headingFont, customDomain, emailFromName, emailFooter,
      instagramHandle, tiktokHandle, youtubeHandle, twitterHandle, hideSnapfitBranding, customCss
    } = body;

    // Check if branding exists
    const existing = await db
      .select()
      .from(trainerBranding)
      .where(eq(trainerBranding.trainerId, user.id));

    if (existing.length > 0) {
      // Update existing
      const [updated] = await db
        .update(trainerBranding)
        .set({
          businessName,
          tagline,
          logoUrl,
          logoLightUrl,
          faviconUrl,
          primaryColor,
          secondaryColor,
          accentColor,
          backgroundColor,
          fontFamily,
          headingFont,
          customDomain,
          emailFromName,
          emailFooter,
          instagramHandle,
          tiktokHandle,
          youtubeHandle,
          twitterHandle,
          hideSnapfitBranding,
          customCss,
          updatedAt: new Date(),
        })
        .where(eq(trainerBranding.id, existing[0].id))
        .returning();

      return NextResponse.json(updated);
    } else {
      // Create new
      const [created] = await db
        .insert(trainerBranding)
        .values({
          trainerId: user.id,
          businessName,
          tagline,
          logoUrl,
          logoLightUrl,
          faviconUrl,
          primaryColor: primaryColor || '#8B5CF6',
          secondaryColor: secondaryColor || '#EC4899',
          accentColor: accentColor || '#06B6D4',
          backgroundColor: backgroundColor || '#0F172A',
          fontFamily: fontFamily || 'Inter',
          headingFont,
          customDomain,
          emailFromName,
          emailFooter,
          instagramHandle,
          tiktokHandle,
          youtubeHandle,
          twitterHandle,
          hideSnapfitBranding: hideSnapfitBranding || false,
          customCss,
        })
        .returning();

      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error('Error saving branding:', error);
    return NextResponse.json({ error: 'Failed to save branding' }, { status: 500 });
  }
}
