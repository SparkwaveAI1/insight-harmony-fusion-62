export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date string e.g. "2026-03-14"
  author: string;
  category?: string;
  tags?: string[];
  /** HTML content for the article body */
  content: string;
  /** Optional hero image URL */
  coverImage?: string;
  /** Reading time in minutes (auto-calculated if omitted) */
  readingTime?: number;
}
