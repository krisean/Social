// User types for the feed system

export interface FeedUser {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  isAnonymous: boolean;
  authUserId?: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface AuthState {
  user: FeedUser | null;
  loading: boolean;
  error: Error | null;
}
