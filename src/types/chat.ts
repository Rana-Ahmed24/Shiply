export type ChatMessage = {
  id: string;
  matchId: string;
  body: string;
  senderId: string;
  isSystem: boolean;
  attachmentUrls: string[];
  createdAt: string;
  isOwn: boolean;
  readByOther: boolean;
};

export type ConversationPreview = {
  matchId: string;
  href: string;
  title: string;
  subtitle: string;
  counterpartyName: string | null;
  counterpartyAvatarUrl: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};
