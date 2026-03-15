import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { getAllPosts, estimateReadingTime } from '@/data/blog/posts';
import { Calendar, Clock, Tag } from 'lucide-react';

const BlogIndex: React.FC = () => {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container px-4 mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-plasmik">
              PersonaAI Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Research insights, product updates, and practical guides for AI-powered market research.
            </p>
          </div>
        </section>

        {/* Posts */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            {posts.length === 0 ? (
              <div className="text-center py-24 text-muted-foreground">
                <p className="text-lg">No articles yet — check back soon.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {posts.map((post) => {
                  const readTime = post.readingTime ?? estimateReadingTime(post.content);
                  return (
                    <article
                      key={post.slug}
                      className="border border-border rounded-xl p-6 bg-white/50 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground mb-3">
                        {post.category && (
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                            {post.category}
                          </span>
                        )}
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

                      <h2 className="text-2xl font-bold mb-2 leading-tight">
                        <Link
                          to={`/blog/${post.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {post.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {post.tags?.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Link
                          to={`/blog/${post.slug}`}
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          Read more →
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogIndex;
