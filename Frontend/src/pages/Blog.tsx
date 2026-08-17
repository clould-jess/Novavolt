import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, BookOpenIcon, ClockIcon, SearchIcon } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { mockBlogPosts } from '../data/blog';
import { Card } from '../components/ui/Card';
import { Reveal } from '../components/ui/Reveal';
import { CtaBanner } from '../components/marketing/CtaBanner';
import { PageHero } from '../components/marketing/PageHero';

export function Blog() {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', labelKey: 'blog.catAll' },
    { id: 'rentability', labelKey: 'blog.catRentability' },
    { id: 'tips', labelKey: 'blog.catTips' },
    { id: 'ev', labelKey: 'blog.catEv' }
  ];

  const filteredPosts = mockBlogPosts.filter((post) => {
    const matchesCat = selectedCategory === 'all' || post.category === selectedCategory;
    const title = t(post.titleKey).toLowerCase();
    const excerpt = t(post.excerptKey).toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase()) || excerpt.includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
      <PageHero
        eyebrow={t('blog.eyebrow')}
        title={t('blog.heroTitle')}
        subtitle={t('blog.heroSubtitle')}
        variant={1}
      />

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-content">
          {/* Controls: Search & Category Pills */}
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map(({ id, labelKey }) => (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`rounded-full px-4 py-1.5 text-2xs font-semibold transition-all ${
                    selectedCategory === id
                      ? 'bg-action text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder={t('blog.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-line bg-soft pl-10 pr-4 py-2 text-2xs font-medium text-ink focus:border-action focus:outline-none"
              />
            </div>
          </div>

          {/* Posts Grid */}
          {filteredPosts.length > 0 ? (
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post, idx) => (
                <Reveal key={post.id} index={idx}>
                  <Card tone="white" className="group flex h-full flex-col overflow-hidden transition-all duration-200 hover:shadow-lg">
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      <img
                        src={post.image}
                        alt={t(post.titleKey)}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <div className="flex items-center justify-between text-[0.7rem] font-semibold text-muted">
                          <span>{post.date}</span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {post.readTime}
                          </span>
                        </div>

                        <h3 className="mt-3 font-display text-lg font-bold text-ink transition-colors group-hover:text-action">
                          <Link to={`/blogue/${post.slug}`}>
                            {t(post.titleKey)}
                          </Link>
                        </h3>

                        <p className="mt-2 line-clamp-3 text-2xs leading-relaxed text-muted">
                          {t(post.excerptKey)}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                        <span className="text-[0.75rem] font-medium text-slate-500">{post.author}</span>
                        <Link
                          to={`/blogue/${post.slug}`}
                          className="inline-flex items-center gap-1 text-2xs font-bold text-action transition-transform group-hover:translate-x-1"
                        >
                          {t('blog.readMore')}
                          <ArrowRightIcon className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <BookOpenIcon className="mx-auto h-10 w-10 text-muted" />
              <p className="mt-3 font-display text-base font-semibold text-ink">{t('blog.noResults')}</p>
            </div>
          )}
        </div>
      </section>

      <CtaBanner
        title={t('blog.ctaTitle')}
        primary={{ label: t('nav.vehicles'), to: '/vehicules' }}
        secondary={{ label: t('common.contactUs'), to: '/contact' }}
      />
    </>
  );
}
