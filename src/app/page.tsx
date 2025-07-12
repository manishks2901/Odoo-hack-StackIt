"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  _count: {
    answers: number;
  };
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return; // Still loading session
    
    if (!session) {
      router.push("/signin");
      return;
    }

    // Fetch questions
    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQuestions(data.questions);
        }
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Welcome, {session.user?.name || session.user?.email || "User"}!
        </h1>
        <Link href="/ask-question">
          <Button>Ask a Question</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">No questions yet. Be the first to ask!</p>
              <Link href="/ask-question">
                <Button>Ask Your First Question</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          questions.map((question) => (
            <Card key={question.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Link href={`/question/${question.id}`}>
                    <CardTitle className="text-xl text-blue-600 hover:text-blue-800 cursor-pointer">
                      {question.title}
                    </CardTitle>
                  </Link>
                  <span className="text-sm text-gray-500">
                    {new Date(question.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none mb-4 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: question.description.substring(0, 200) + '...' }}
                />
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((qt) => (
                      <Badge key={qt.id} variant="secondary">
                        {qt.tag.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{question._count.answers} answers</span>
                    <span>Asked by {question.user.name || question.user.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {questions.length > 0 && (
        <div className="mt-8 text-center">
          <Button variant="outline">Load More Questions</Button>
        </div>
      )}
    </div>
  );
}
