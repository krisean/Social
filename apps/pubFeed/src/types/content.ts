// Content types for the feed system
// Registry pattern for extensibility

import type { FeedUser } from './user';

// Extensible content type union
export type ContentType = 'comment'; // | 'song' | 'poll' | 'challenge' (future)

// Base interface for all content types
export interface BaseContent {
  id: string;
  contentType: ContentType;
  content: string;
  author: FeedUser;
  venueId: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  commentCount?: number;
  metadata?: Record<string, unknown>;
}

// Comment content type
export interface CommentContent extends BaseContent {
  contentType: 'comment';
}

// Future extension examples (commented for reference):
/*
export interface SongContent extends BaseContent {
  contentType: 'song';
  metadata: {
    title: string;
    genre: string;
    mood: string;
    audioUrl?: string;
    lyrics?: string;
  };
}

export interface PollContent extends BaseContent {
  contentType: 'poll';
  metadata: {
    question: string;
    options: Array<{ id: string; text: string; votes: number }>;
    allowMultiple: boolean;
    endsAt?: string;
  };
}

export interface ChallengeContent extends BaseContent {
  contentType: 'challenge';
  metadata: {
    prompt: string;
    category: string;
    timeLimit?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}
*/

// Union type of all content (extensible)
export type Content = CommentContent; // | SongContent | PollContent | ChallengeContent (future)

// Helper type for content creation
export interface CreateContentInput {
  contentType: ContentType;
  content: string;
  venueId: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// COMMENTS
// =============================================================================

// Comment type - for comments on posts
export interface Comment {
  id: string;
  postId: string;
  author: FeedUser;
  parentCommentId?: string;
  content: string;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[]; // For nested comments
}

// Helper type for creating comments
export interface CreateCommentData {
  postId: string;
  content: string;
  parentCommentId?: string;
}
