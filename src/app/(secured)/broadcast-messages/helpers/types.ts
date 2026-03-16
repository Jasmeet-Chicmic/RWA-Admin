/**
 * Types for Broadcast Channels API
 */

export interface BroadcastChannel {
  threadId: string;
  title: string;
  iconUrl: string | null;
}

export interface BroadcastChannelsData {
  items: BroadcastChannel[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  pinnedMessageCount: number | null;
  uniqueId: string | null;
  lastPinnedMessage: string | null;
}

export interface BroadcastChannelsResponse {
  statusCode: number;
  status: boolean;
  message: string;
  type: string;
  data: BroadcastChannelsData;
}

export interface GetBroadcastChannelsParams {
  searchString?: string;
  skip?: number;
  limit?: number;
}

/**
 * Types for Messages API
 */

export interface MessageSender {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  userProfilePicture: string | null;
  bio: string | null;
  jobTitle: string | null;
  companyName: string | null;
  isSpotlighted: boolean;
  isActive: boolean;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  sender: MessageSender;
  messageText: string;
  messageType: number;
  status: number;
  createdAt: string;
  mentions: unknown[];
  attachments: unknown[];
  sponsorshipTypes: unknown[];
  parentId: string | null;
  parentData: Message | null;
  reactionCount: number;
  userReaction: unknown | null;
  reactions: unknown[];
  isPin: boolean;
  pinBy: string | null;
  pinByUser: MessageSender | null;
  isForwarded: boolean;
}

export interface MessagesData {
  items: Message[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  pinnedMessageCount: number;
  uniqueId: string | null;
  lastPinnedMessage: string | null;
}

export interface MessagesResponse {
  statusCode: number;
  status: boolean;
  message: string;
  type: string;
  data: MessagesData;
}

export interface GetMessagesParams {
  threadId: string;
  skip?: number;
  limit?: number;
  filterType?: number;
  searchText?: string;
  messageId?: string;
  messageLimit?: number;
  order?: number;
}
