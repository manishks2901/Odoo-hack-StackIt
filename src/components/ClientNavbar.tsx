"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { NotificationBell } from "@/components/NotificationBell";

export function ClientNavbar() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600 mr-8">
                StackIt
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600 mr-8">
              StackIt
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                Home
              </Link>
              <Link href="/ask-question" className="text-gray-600 hover:text-blue-600">
                Ask Question
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <span className="text-sm text-gray-700">
                  Welcome, {session.user?.name || session.user?.email || "User"}
                </span>
                <SignOutButton />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
