export default function LoadingPage() {
  return (
    <div aria-label="Загрузка" className="page">
      <div aria-hidden="true" className="grid">
        <div className="card skeleton" />
        <div className="card skeleton" />
      </div>
      <p role="status">Загружаю страницу…</p>
    </div>
  );
}
