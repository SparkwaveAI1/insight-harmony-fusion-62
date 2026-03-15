import type { BlogPost } from './types';

/**
 * Blog post registry for PersonaAI.
 *
 * HOW TO ADD A POST:
 * 1. Create a new entry in this array.
 * 2. Set a unique `slug` (used as URL: /blog/<slug>).
 * 3. Write `content` as an HTML string (use template literals for multi-line).
 * 4. Deploy — the post will appear automatically.
 *
 * Posts are sorted by date descending on the blog index page.
 */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'welcome-to-personaai-blog',
    title: 'Welcome to the PersonaAI Blog',
    description:
      'Introducing the PersonaAI blog — insights on AI research personas, synthetic data, and the future of market research.',
    date: '2026-03-14',
    author: 'PersonaAI Team',
    category: 'Announcements',
    tags: ['announcements', 'personaai', 'ai-research'],
    content: `
      <h2>AI Personas Are Changing Research</h2>
      <p>
        Welcome to the PersonaAI blog. This is where we'll publish research, product updates,
        case studies, and practical guides for teams using AI-powered research personas.
      </p>
      <h2>What PersonaAI Does</h2>
      <p>
        PersonaAI lets you create, interview, and analyze AI personas that behave like real
        human research participants. Instead of waiting weeks for panel recruitment, you can
        run focus groups, surveys, and in-depth interviews in minutes — at any scale.
      </p>
      <p>
        Each persona is grounded in real demographic and psychographic data, giving your
        research the fidelity needed to make confident decisions.
      </p>
      <h2>What You'll Find Here</h2>
      <ul>
        <li>Product updates and new feature releases</li>
        <li>Research methodology guides</li>
        <li>Case studies showing how teams use PersonaAI</li>
        <li>Insights on the future of synthetic market research</li>
        <li>Best practices for working with AI personas</li>
      </ul>
      <p>
        Whether you're a researcher, product manager, or strategist, there's something
        here for you. Stay tuned.
      </p>
    `,
  },
];

/**
 * Get all posts sorted by date (newest first).
 */
export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Get a single post by slug. Returns undefined if not found.
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/**
 * Estimate reading time for a post (assumes ~200 wpm, strips HTML tags).
 */
export function estimateReadingTime(content: string): number {
  const text = content.replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
