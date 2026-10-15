import type { MetadataRoute } from 'next';
import { posts } from '@/data/posts';
import { projects } from '@/data/site';

export const dynamic = 'force-static';

const publicPages = [
  '',
  '/projects',
  '/pricing',
  '/contact',
  '/about',
  '/blog',
  '/faq',
  '/sources',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arnurmedetuly777-portfolio.pages.dev';
  const paths = [
    ...publicPages,
    ...projects.map((project) => `/projects/${project.slug}`),
    ...posts.map((post) => `/blog/${post.slug}`),
  ];

  return paths.map((path) => ({
    url: new URL(path, baseUrl).toString(),
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path.includes('/') ? 0.7 : 0.5,
  }));
}
