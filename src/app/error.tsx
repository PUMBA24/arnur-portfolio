'use client';

import { Link } from '@/components/Link';
import { useEffect } from 'react';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Ошибка страницы портфолио:', error);
  }, [error]);

  return (
    <div className="page">
      <p className="eyebrow">Что-то пошло не так</p>
      <h1>Страница не загрузилась.</h1>
      <p>Попробуйте ещё раз. Если ошибка повторится, вернитесь на главную.</p>
      <div className="button-row">
        <button className="button" onClick={reset} type="button">
          Попробовать снова
        </button>
        <Link className="text-link" href="/">
          На главную
        </Link>
      </div>
    </div>
  );
}
