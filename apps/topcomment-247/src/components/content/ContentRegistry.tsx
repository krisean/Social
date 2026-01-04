// Content Registry - Extensible pattern for different content types

import { CommentCard } from './CommentCard';
import type { Content } from '../../types';

// Registry of content card components
const ContentCardRegistry = {
  comment: CommentCard,
  // Future content types can be added here:
  // song: SongCard,
  // poll: PollCard,
  // challenge: ChallengeCard,
} as const;

interface ContentCardProps {
  content: Content;
}

export function ContentCard({ content }: ContentCardProps) {
  const CardComponent = ContentCardRegistry[content.contentType];
  
  if (!CardComponent) {
    console.warn(`No card component for content type: ${content.contentType}`);
    return null;
  }

  return <CardComponent content={content as any} />;
}
