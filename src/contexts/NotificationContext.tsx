"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { pusherClient } from '@/lib/pusher';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'answer' | 'reply' | 'vote';
  message: string;
  questionId: string;
  answerId?: string;
  createdAt: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Only initialize Pusher after session is loaded and user is authenticated
    if (status === "loading" || !session?.user?.email) return;

    // Subscribe to user-specific channel
    const channel = pusherClient.subscribe(`user-${session.user.email}`);

    // Listen for new answer notifications
    channel.bind('new-answer', (data: {
      userName: string;
      questionTitle: string;
      questionId: string;
      answerId: string;
    }) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'answer',
        message: `${data.userName} answered your question: "${data.questionTitle}"`,
        questionId: data.questionId,
        answerId: data.answerId,
        createdAt: new Date().toISOString(),
        read: false,
      };
      
      setNotifications(prev => [notification, ...prev]);
      toast.success(notification.message);
    });

    // Listen for new reply notifications
    channel.bind('new-reply', (data: {
      userName: string;
      questionId: string;
      answerId: string;
      isQuestionOwner: boolean;
    }) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'reply',
        message: `${data.userName} replied to your ${data.isQuestionOwner ? 'question' : 'answer'}`,
        questionId: data.questionId,
        answerId: data.answerId,
        createdAt: new Date().toISOString(),
        read: false,
      };
      
      setNotifications(prev => [notification, ...prev]);
      toast.success(notification.message);
    });

    // Listen for vote notifications
    channel.bind('new-vote', (data: {
      voteType: string;
      contentType: string;
      questionId: string;
      answerId?: string;
    }) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'vote',
        message: `Someone ${data.voteType === 'up' ? 'upvoted' : 'downvoted'} your ${data.contentType}`,
        questionId: data.questionId,
        answerId: data.answerId,
        createdAt: new Date().toISOString(),
        read: false,
      };
      
      setNotifications(prev => [notification, ...prev]);
      toast.info(notification.message);
    });

    return () => {
      if (session?.user?.email) {
        pusherClient.unsubscribe(`user-${session.user.email}`);
      }
    };
  }, [session?.user?.email, status]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
