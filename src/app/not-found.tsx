import { Link } from '@/components/Link';

export default function NotFoundPage() {
  return (
    <div className="page">
      <p className="eyebrow">404</p>
      <h1>Похоже, этой страницы нет.</h1>
      <p>Возможно, адрес изменился или в ссылке опечатка.</p>
      <Link className="button" href="/">
        Вернуться на главную
      </Link>
    </div>
  );
}
