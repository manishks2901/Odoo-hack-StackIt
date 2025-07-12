import { pusherServer } from '@/lib/pusher';

export interface NotificationData {
  userEmail: string;
  type: 'new-answer' | 'new-reply' | 'new-vote';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export async function sendNotification({ userEmail, type, data }: NotificationData) {
  try {
    await pusherServer.trigger(`user-${userEmail}`, type, data);
    console.log(`Sent ${type} notification to ${userEmail}`);
  } catch (error) {
    console.error(`Failed to send ${type} notification to ${userEmail}:`, error);
  }
}

// Helper functions for specific notification types
export async function sendAnswerNotification(
  questionOwnerEmail: string,
  answerUserName: string,
  questionTitle: string,
  questionId: string,
  answerId: string
) {
  await sendNotification({
    userEmail: questionOwnerEmail,
    type: 'new-answer',
    data: {
      userName: answerUserName,
      questionTitle,
      questionId,
      answerId,
    }
  });
}

export async function sendReplyNotification(
  targetUserEmail: string,
  replyUserName: string,
  questionId: string,
  answerId: string,
  isQuestionOwner: boolean
) {
  await sendNotification({
    userEmail: targetUserEmail,
    type: 'new-reply',
    data: {
      userName: replyUserName,
      questionId,
      answerId,
      isQuestionOwner,
    }
  });
}

export async function sendVoteNotification(
  contentOwnerEmail: string,
  voteType: 'up' | 'down',
  contentType: 'answer' | 'question',
  questionId: string,
  answerId?: string
) {
  await sendNotification({
    userEmail: contentOwnerEmail,
    type: 'new-vote',
    data: {
      voteType,
      contentType,
      questionId,
      answerId,
    }
  });
}
