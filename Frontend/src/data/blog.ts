export interface BlogPost {
  id: string;
  slug: string;
  titleKey: string;
  excerptKey: string;
  contentKey: string;
  category: 'vtc' | 'ev' | 'rentability' | 'tips';
  date: string;
  image: string;
  author: string;
}

export const mockBlogPosts: BlogPost[] = [
  {
    id: 'b1',
    slug: 'rentabilite-uber-electrique-canada',
    titleKey: 'blog.b1.title',
    excerptKey: 'blog.b1.excerpt',
    contentKey: 'blog.b1.content',
    category: 'rentability',
    date: '2026-08-10',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    author: 'Équipe Novavolt'
  },
  {
    id: 'b2',
    slug: 'autonomie-ev-hiver-canada',
    titleKey: 'blog.b2.title',
    excerptKey: 'blog.b2.excerpt',
    contentKey: 'blog.b2.content',
    category: 'tips',
    date: '2026-08-02',
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    author: 'Marc-André Tremblay'
  },
  {
    id: 'b3',
    slug: 'guide-recharge-rapide-vtc',
    titleKey: 'blog.b3.title',
    excerptKey: 'blog.b3.excerpt',
    contentKey: 'blog.b3.content',
    category: 'ev',
    date: '2026-07-24',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
    author: 'Sophie Lavoie'
  },
  {
    id: 'b4',
    slug: 'rentabiliser-son-vehicule-sur-novavolt',
    titleKey: 'blog.b4.title',
    excerptKey: 'blog.b4.excerpt',
    contentKey: 'blog.b4.content',
    category: 'rentability',
    date: '2026-07-15',
    image: 'https://images.unsplash.com/photo-1554744512-d6c603f27c54?auto=format&fit=crop&w=1200&q=80',
    author: 'Jean-Philippe Gagnon'
  },
  {
    id: 'b5',
    slug: 'choisir-entre-tesla-model-3-et-model-y',
    titleKey: 'blog.b5.title',
    excerptKey: 'blog.b5.excerpt',
    contentKey: 'blog.b5.content',
    category: 'tips',
    date: '2026-07-01',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
    author: 'Équipe Novavolt'
  },
  {
    id: 'b6',
    slug: 'subventions-et-incitatifs-ev-canada-2026',
    titleKey: 'blog.b6.title',
    excerptKey: 'blog.b6.excerpt',
    contentKey: 'blog.b6.content',
    category: 'ev',
    date: '2026-06-18',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
    author: 'Sophie Lavoie'
  }
];
