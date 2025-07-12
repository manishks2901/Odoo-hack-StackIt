import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const questions = await prisma.question.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    const total = await prisma.question.count();

    return NextResponse.json({
      success: true,
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, tags } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create the question
    const question = await prisma.question.create({
      data: {
        title,
        description,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Handle tags if provided
    if (tags && tags.length > 0) {
      // Process each tag
      for (const tagName of tags) {
        // Find or create tag
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName }
        });

        // Create question-tag relationship
        await prisma.questionTag.create({
          data: {
            questionId: question.id,
            tagId: tag.id
          }
        });
      }
    }

    // Fetch the complete question with tags
    const completeQuestion = await prisma.question.findUnique({
      where: { id: question.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Question submitted successfully',
      question: completeQuestion
    });

  } catch (error) {
    console.error('Error submitting question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
