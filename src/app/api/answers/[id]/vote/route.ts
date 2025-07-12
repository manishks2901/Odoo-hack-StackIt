import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await req.json();

    if (!type || (type !== 'up' && type !== 'down')) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the answer
    const answer = await prisma.answer.findUnique({
      where: { id: params.id }
    });

    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
    }

    // Check if user has already voted on this answer
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_answerId: {
          userId: user.id,
          answerId: params.id
        }
      }
    });

    if (existingVote) {
      // If user is trying to vote the same way again, remove the vote
      if ((existingVote.type === 'UP' && type === 'up') || 
          (existingVote.type === 'DOWN' && type === 'down')) {
        await prisma.vote.delete({
          where: {
            userId_answerId: {
              userId: user.id,
              answerId: params.id
            }
          }
        });
        return NextResponse.json({ 
          success: true, 
          message: 'Vote removed successfully'
        });
      } else {
        // User is switching vote type, update the existing vote
        await prisma.vote.update({
          where: {
            userId_answerId: {
              userId: user.id,
              answerId: params.id
            }
          },
          data: {
            type: type === 'up' ? 'UP' : 'DOWN'
          }
        });
        return NextResponse.json({ 
          success: true, 
          message: 'Vote updated successfully'
        });
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          type: type === 'up' ? 'UP' : 'DOWN',
          userId: user.id,
          answerId: params.id
        }
      });
      return NextResponse.json({ 
        success: true, 
        message: 'Vote recorded successfully'
      });
    }

  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
