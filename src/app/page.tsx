import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  // Fetch questions from database
  const questions = await prisma.question.findMany({
    take: 10,
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
                  <CardTitle className="text-xl text-blue-600 hover:text-blue-800">
                    {question.title}
                  </CardTitle>
                  <span className="text-sm text-gray-500">
                    {new Date(question.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none mb-4"
                  dangerouslySetInnerHTML={{ __html: question.description }}
                />
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((qt) => (
                      <Badge key={qt.id} variant="secondary">
                        {qt.tag.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Asked by {question.user.name || question.user.email}
                  </p>
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
