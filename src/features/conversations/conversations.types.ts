export interface StaffConversation {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
}

export type ConversationGroupKey = 'today' | 'last7Days' | 'last30Days' | 'older';

export interface SearchExcerpt {
  before: string;
  match: string;
  after: string;
}

export interface ConversationGroup {
  key: ConversationGroupKey;
  label: string;
  conversations: StaffConversation[];
}
