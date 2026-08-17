export interface BlogPost {
  id: string;
  slug: string;
  titleKey: string;
  excerptKey: string;
  contentKey: string;
  category: 'vtc' | 'ev' | 'rentability' | 'tips';
  date: string;
  readTime: string;
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
    readTime: '5 min',
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
    readTime: '6 min',
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
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
    author: 'Sophie Lavoie'
  }
];
