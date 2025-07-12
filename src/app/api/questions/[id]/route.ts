import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Find the current user if logged in
    let currentUser = null;
    if (session?.user?.email) {
      currentUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
    }

    const { id } = await params;

    const question = await prisma.question.findUnique({
      where: { id: id },
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
        },
        answers: {
          where: {
            parentId: null // Only get top-level answers
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            votes: {
              include: {
                user: {
                  select: {
                    id: true
                  }
                }
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                },
                votes: {
                  include: {
                    user: {
                      select: {
                        id: true
                      }
                    }
                  }
                },
                replies: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      }
                    },
                    votes: {
                      include: {
                        user: {
                          select: {
                            id: true
                          }
                        }
                      }
                    }
                  },
                  orderBy: {
                    createdAt: 'asc'
                  }
                }
              },
              orderBy: {
                createdAt: 'asc'
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Process answers to include vote counts and user's vote status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processAnswer = (answer: any): any => {
      const upvotes = answer.votes.filter((vote: { type: string }) => vote.type === 'UP').length;
      const downvotes = answer.votes.filter((vote: { type: string }) => vote.type === 'DOWN').length;
      
      let userVote = null;
      if (currentUser) {
        const vote = answer.votes.find((vote: { user: { id: string }; type: string }) => vote.user.id === currentUser.id);
        userVote = vote ? vote.type.toLowerCase() : null;
      }

      return {
        id: answer.id,
        content: answer.content,
        createdAt: answer.createdAt,
        user: answer.user,
        upvotes,
        downvotes,
        userVote,
        replies: answer.replies ? answer.replies.map(processAnswer) : []
      };
    };

    const processedAnswers = question.answers.map(processAnswer);

    return NextResponse.json({
      success: true,
      question: {
        ...question,
        answers: processedAnswers
      }
    });

  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
