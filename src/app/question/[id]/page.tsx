"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import { TiptapEditor } from '@/components/TiptapEditor';
import Link from 'next/link';

interface Answer {
  id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  replies?: Answer[];
}

interface Question {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  tags: Array<{
    id: string;
    tag: {
      id: string;
      name: string;
    };
  }>;
  answers: Answer[];
}

const QuestionDetail = () => {
  const params = useParams();
  const { data: session } = useSession();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setQuestion(data.question);
      } else {
        console.error('Failed to fetch question');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim() || !session) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: answerContent,
          questionId: params.id,
        }),
      });

      if (response.ok) {
        setAnswerContent('');
        fetchQuestion(); // Refresh the question to show the new answer
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (answerId: string, type: 'up' | 'down') => {
    if (!session) {
      alert('Please sign in to vote');
      return;
    }

    try {
      const response = await fetch(`/api/answers/${answerId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        const data = await response.json();
        // Show feedback to user
        if (data.message.includes('removed')) {
          // Vote was removed
        } else if (data.message.includes('updated')) {
          // Vote was changed
        } else {
          // New vote was added
        }
        fetchQuestion(); // Refresh to show updated votes
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  // Recursive component to render answers and their replies
  const AnswerComponent = ({ answer, depth = 0 }: { answer: Answer; depth?: number }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    const handleReplySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!replyText.trim() || !session) return;

      setSubmittingReply(true);
      try {
        const response = await fetch('/api/answers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: replyText,
            questionId: params.id,
            parentId: answer.id,
          }),
        });

        if (response.ok) {
          setReplyText('');
          setShowReplyForm(false);
          fetchQuestion();
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to submit reply');
        }
      } catch (error) {
        console.error('Error submitting reply:', error);
        alert('Failed to submit reply. Please try again.');
      } finally {
        setSubmittingReply(false);
      }
    };

    return (
      <div className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
        <Card key={answer.id} className={`mb-3 ${depth > 0 ? 'bg-gray-50' : ''}`}>
          <CardContent className="p-4">
            <div className="flex gap-3">
              {/* Vote buttons */}
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant={answer.userVote === 'up' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleVote(answer.id, 'up')}
                  className={`p-1 transition-all ${
                    answer.userVote === 'up' 
                      ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md' 
                      : 'hover:bg-orange-50 hover:text-orange-600'
                  }`}
                  title={answer.userVote === 'up' ? 'Click to remove upvote' : 'Click to upvote'}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <span className={`text-xs font-bold ${
                  answer.upvotes - answer.downvotes > 0 ? 'text-orange-600' : 
                  answer.upvotes - answer.downvotes < 0 ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {answer.upvotes - answer.downvotes}
                </span>
                <Button
                  variant={answer.userVote === 'down' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleVote(answer.id, 'down')}
                  className={`p-1 transition-all ${
                    answer.userVote === 'down' 
                      ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md' 
                      : 'hover:bg-blue-50 hover:text-blue-600'
                  }`}
                  title={answer.userVote === 'down' ? 'Click to remove downvote' : 'Click to downvote'}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Answer content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <span className="font-medium text-gray-900">
                    {answer.user.name || answer.user.email}
                  </span>
                  <span>•</span>
                  <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div 
                  className="prose prose-sm max-w-none mb-3 text-gray-800"
                  dangerouslySetInnerHTML={{ __html: answer.content }}
                />
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {session && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReplyForm(!showReplyForm)}
                      className="text-xs text-gray-600 hover:text-gray-800 p-0 h-auto font-bold"
                    >
                      Reply
                    </Button>
                  )}
                  <span>Share</span>
                  <span>Save</span>
                </div>

                {/* Reply form */}
                {showReplyForm && session && (
                  <div className="mt-4 p-3 bg-white rounded-lg border">
                    <form onSubmit={handleReplySubmit} className="space-y-3">
                      <TiptapEditor
                        content={replyText}
                        onChange={setReplyText}
                        placeholder="What are your thoughts?"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={submittingReply || !replyText.trim()}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          {submittingReply ? 'Submitting...' : 'Comment'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowReplyForm(false);
                            setReplyText('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nested replies */}
        {answer.replies && answer.replies.length > 0 && (
          <div className="space-y-2">
            {answer.replies.map((reply) => (
              <AnswerComponent key={reply.id} answer={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Question not found</h1>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">›</span>
        <span>Question</span>
      </nav>

      {/* Question */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{question.title}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Asked by {question.user.name || question.user.email}</span>
            <span>•</span>
            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="prose max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: question.description }}
          />
          <div className="flex flex-wrap gap-2">
            {question.tags.map((qt) => (
              <Badge key={qt.id} variant="secondary">
                {qt.tag.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Answers Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
        </h2>

        {question.answers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-600">
              <p>No answers yet. Be the first to answer!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {question.answers.map((answer) => (
              <AnswerComponent key={answer.id} answer={answer} />
            ))}
          </div>
        )}
      </div>

      {/* Submit Answer Form */}
      {session ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <TiptapEditor
                content={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here..."
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting || !answerContent.trim()}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">
              Please sign in to submit an answer
            </p>
            <Link href="/signin">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionDetail;
