import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, questionId, parentId } = await req.json();

    if (!content || !questionId) {
      return NextResponse.json({ error: 'Content and question ID are required' }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // If parentId is provided, verify the parent answer exists
    if (parentId) {
      const parentAnswer = await prisma.answer.findUnique({
        where: { id: parentId }
      });

      if (!parentAnswer) {
        return NextResponse.json({ error: 'Parent answer not found' }, { status: 404 });
      }
    }

    // Create the answer
    const answer = await prisma.answer.create({
      data: {
        content,
        questionId,
        userId: user.id,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        question: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              }
            }
          }
        },
        parent: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              }
            }
          }
        }
      }
    });

    // Send real-time notifications
    try {
      if (parentId) {
        // This is a reply to another answer
        const parentAnswerOwner = answer.parent?.user.email;
        const questionOwner = answer.question.user.email;
        
        // Notify the parent answer owner (if not the same person)
        if (parentAnswerOwner && parentAnswerOwner !== user.email) {
          await pusherServer.trigger(`user-${parentAnswerOwner}`, 'new-reply', {
            userName: user.name || user.email,
            questionId: questionId,
            answerId: answer.id,
            isQuestionOwner: false,
          });
        }
        
        // Notify the question owner (if not the same person and not already notified)
        if (questionOwner && questionOwner !== user.email && questionOwner !== parentAnswerOwner) {
          await pusherServer.trigger(`user-${questionOwner}`, 'new-reply', {
            userName: user.name || user.email,
            questionId: questionId,
            answerId: answer.id,
            isQuestionOwner: true,
          });
        }
      } else {
        // This is a direct answer to the question
        const questionOwner = answer.question.user.email;
        if (questionOwner && questionOwner !== user.email) {
          await pusherServer.trigger(`user-${questionOwner}`, 'new-answer', {
            userName: user.name || user.email,
            questionTitle: answer.question.title,
            questionId: questionId,
            answerId: answer.id,
          });
        }
      }
    } catch (error) {
      console.error('Error sending real-time notification:', error);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Answer submitted successfully',
      answer
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
