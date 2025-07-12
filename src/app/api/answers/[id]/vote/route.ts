import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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
      where: { id: id },
      include: {
        user: {
          select: {
            email: true,
          }
        },
        question: {
          select: {
            id: true,
          }
        }
      }
    });

    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
    }

    // Check if user has already voted on this answer
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_answerId: {
          userId: user.id,
          answerId: id
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
              answerId: id
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
              answerId: id
            }
          },
          data: {
            type: type === 'up' ? 'UP' : 'DOWN'
          }
        });
        
        // Send notification for vote change
        if (answer.user.email && answer.user.email !== user.email) {
          try {
            await pusherServer.trigger(`user-${answer.user.email}`, 'new-vote', {
              voteType: type,
              contentType: 'answer',
              questionId: answer.question.id,
              answerId: id,
            });
          } catch (error) {
            console.error('Error sending vote notification:', error);
          }
        }
        
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
          answerId: id
        }
      });
      
      // Send notification for new vote
      if (answer.user.email && answer.user.email !== user.email) {
        try {
          await pusherServer.trigger(`user-${answer.user.email}`, 'new-vote', {
            voteType: type,
            contentType: 'answer',
            questionId: answer.question.id,
            answerId: id,
          });
        } catch (error) {
          console.error('Error sending vote notification:', error);
        }
      }
      
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
