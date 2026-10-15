import type { Metadata } from 'next';
import { Link } from '@/components/Link';
import { posts } from '@/data/posts';

export const metadata: Metadata = {
  title: 'Заметки',
  description: 'Короткие заметки о веб-разработке, доступности и моей практике.',
};

function getReadingTimeLabel(minutes: number) {
  const lastDigit = minutes % 10;
  if (lastDigit === 1 && minutes !== 11) return `${minutes} минута`;
  if ([2, 3, 4].includes(lastDigit) && (minutes < 12 || minutes > 14)) {
    return `${minutes} минуты`;
  }
  return `${minutes} минут`;
}

export default function BlogPage() {
  return (
    <div className="page">
      <p className="eyebrow">В процессе обучения</p>
      <h1>Заметки</h1>
      <p className="lead">
        Коротко записываю решения и выводы из собственной практики. Это заметки junior-разработчика,
        не универсальные рецепты.
      </p>
      <div className="article-list">
        {posts.map((post) => (
          <article className="article-row" key={post.slug}>
            <span className="article-date">{getReadingTimeLabel(post.readingTimeMinutes)}</span>
            <div>
              <p className="eyebrow">{post.tags.join(' · ')}</p>
              <h2>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p>{post.description}</p>
              <Link className="text-link" href={`/blog/${post.slug}`}>
                Читать заметку <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
