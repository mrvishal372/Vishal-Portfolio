export interface YouTubeVideo {
  id: string;
  youtubeId: string;
  youtubeUrl: string;
  title: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  duration?: string;
  isFeatured?: boolean;
  publishedDate?: string;
  viewsCount?: string;
  likesCount?: number;
  addedAt: number;
}
