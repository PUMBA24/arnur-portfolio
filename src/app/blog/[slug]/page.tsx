import type { Metadata } from 'next';
import { Link } from '@/components/Link';
import { notFound } from 'next/navigation';
import type { ComponentType } from 'react';
import AccessibleForms from '@/content/blog/accessible-forms.mdx';
import FirstResponsivePage from '@/content/blog/first-responsive-page.mdx';
import LearningReact from '@/content/blog/learning-react.mdx';
import { posts } from '@/data/posts';

const articleBodies: Record<string, ComponentType> = {
  'first-responsive-page': FirstResponsivePage,
  'accessible-forms': AccessibleForms,
  'learning-react': LearningReact,
};

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);

  return {
    title: post?.title ?? 'Заметка',
    description: post?.description,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  const ArticleBody = articleBodies[slug];

  if (!post || !ArticleBody) notFound();

  return (
    <article className="page reading">
      <p className="eyebrow">{post.tags.join(' · ')}</p>
      <h1>{post.title}</h1>
      <p className="article-time">Учебная заметка · {post.readingTimeMinutes} минуты чтения</p>
      <p className="lead">{post.description}</p>
      <div className="mdx-content">
        <ArticleBody />
      </div>
      <p>
        <Link className="text-link" href="/blog">
          ← Все заметки
        </Link>
      </p>
    </article>
  );
}
