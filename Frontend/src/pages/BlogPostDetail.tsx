import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, Share2Icon, UserIcon } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { mockBlogPosts } from '../data/blog';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHero } from '../components/marketing/PageHero';
import { NotFound } from './NotFound';

export function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useI18n();

  const post = mockBlogPosts.find((p) => p.slug === slug);

  if (!post) {
    return <NotFound />;
  }

  return (
    <>
      <div className="bg-slate-950 px-4 pt-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-content">
          <Link
            to="/blogue"
            className="inline-flex items-center gap-2 text-2xs font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            {t('blog.backToList')}
          </Link>
        </div>
      </div>

      <PageHero
        title={t(post.titleKey)}
        subtitle={t(post.excerptKey)}
        variant={1}
      />

      <article className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl">
          {/* Metadata bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6 text-2xs font-medium text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <UserIcon className="h-4 w-4 text-action" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4 text-action" />
                {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4 text-action" />
                {post.readTime}
              </span>
            </div>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: t(post.titleKey), url: window.location.href });
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-soft px-3 py-1 text-ink transition-colors hover:bg-slate-200"
            >
              <Share2Icon className="h-3.5 w-3.5" />
              {t('blog.share')}
            </button>
          </div>

          {/* Featured Image */}
          <div className="my-8 aspect-video overflow-hidden rounded-2xl shadow-md">
            <img
              src={post.image}
              alt={t(post.titleKey)}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Article Body Content */}
          <div className="prose prose-slate max-w-none text-body leading-relaxed">
            <p className="text-sm font-medium leading-relaxed text-ink">
              {t(post.contentKey)}
            </p>
          </div>

          {/* Bottom CTA Box */}
          <Card tone="soft" className="mt-12 p-6 text-center sm:p-8">
            <h4 className="font-display text-xl font-bold text-ink">
              {t('blog.ctaBoxTitle')}
            </h4>
            <p className="mt-2 text-2xs text-muted">
              {t('blog.ctaBoxDesc')}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button to="/vehicules" variant="primary">
                {t('nav.vehicles')}
              </Button>
              <Button to="/contact" variant="secondary">
                {t('nav.contact')}
              </Button>
            </div>
          </Card>
        </div>
      </article>
    </>
  );
}
