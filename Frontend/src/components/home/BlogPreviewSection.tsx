import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CalendarIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { mockBlogPosts } from '../../data/blog';
import { Reveal } from '../ui/Reveal';

export function BlogPreviewSection() {
  const { t } = useI18n();
  const posts = mockBlogPosts.slice(0, 3);

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-content">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-2xs font-semibold text-action">
              <span className="h-px w-6 bg-action" aria-hidden="true" />
              {t('blog.eyebrow')}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">
              {t('blog.heroTitle')}
            </h2>
          </div>
          <Link
            to="/blogue"
            className="group inline-flex shrink-0 items-center gap-1.5 text-2xs font-semibold text-action hover:text-action-dark transition-colors"
          >
            {t('blog.readMore')} tous les articles
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        {/* Cards */}
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Reveal as="li" key={post.id} index={index}>
              <Link
                to={`/blogue/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-xs hover:shadow-card transition-shadow duration-200"
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={post.image}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Category badge */}
                  <span className="absolute left-3 top-3 rounded-full bg-action px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-white shadow-sm">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-sm font-bold leading-snug tracking-[-0.02em] text-ink group-hover:text-action transition-colors duration-150 line-clamp-2">
                    {t(post.titleKey)}
                  </h3>
                  <p className="mt-2 flex-1 text-2xs leading-relaxed text-muted line-clamp-3">
                    {t(post.excerptKey)}
                  </p>
                  {/* Meta */}
                  <div className="mt-4 flex items-center gap-4 border-t border-line pt-4 text-2xs text-muted">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {new Date(post.date).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
