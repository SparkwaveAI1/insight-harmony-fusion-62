import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { getPostBySlug, estimateReadingTime } from '@/data/blog/posts';
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  // Update page meta tags for SEO
  useEffect(() => {
    if (!post) return;

    document.title = `${post.title} — PersonaAI Blog`;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
      if (!el) {
        if (selector.startsWith('link')) {
          el = document.createElement('link') as HTMLLinkElement;
        } else {
          el = document.createElement('meta') as HTMLMetaElement;
          const match = selector.match(/\[(\w+[-\w]*)=['"]([^'"]+)['"]\]/);
          if (match) el.setAttribute(match[1], match[2]);
        }
        document.head.appendChild(el);
      }
      (el as HTMLElement).setAttribute(attr, value);
    };

    const articleUrl = `https://personaresearch.ai/blog/${post.slug}`;
    setMeta("link[rel='canonical']", 'href', articleUrl);
    setMeta("meta[property='og:url']", 'content', articleUrl);
    setMeta("meta[property='og:title']", 'content', post.title);
    setMeta("meta[property='og:description']", 'content', post.description);
    setMeta("meta[name='description']", 'content', post.description);

    return () => {
      document.title = 'PersonaAI — AI Research Personas';
    };
  }, [post]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const readTime = post.readingTime ?? estimateReadingTime(post.content);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="container mx-auto max-w-3xl px-4 py-12">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-10">
            {post.category && (
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-4 inline-block">
                {post.category}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 font-plasmik">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">{post.description}</p>

            <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground border-t border-border pt-4">
              <span className="font-medium text-foreground">{post.author}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {readTime} min read
              </span>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Cover image */}
          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full rounded-xl mb-10 object-cover max-h-80"
            />
          )}

          {/* Article content */}
          <article
            className="prose prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer nav */}
          <div className="mt-16 pt-8 border-t border-border">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all articles
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
