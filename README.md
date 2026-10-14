# Портфолио Арнура

Адаптивное портфолио на React и Vite. Бесплатная публикация: Cloudflare Pages размещает сайт и API, Cloudflare D1 хранит сообщения формы. Для этого проекта платный Render не нужен.

## Настройка сайта

1. В `src/App.jsx` измените имя, описание и навыки, если нужно.
2. В `shared/projects.js` укажите свои проекты и адреса `demoUrl` / `sourceUrl`.
3. Проверьте адрес электронной почты в контактном блоке.

Демонстрационные проекты сейчас учебные: замените их собственными работами перед отправкой работодателям.

## Локальный запуск

Нужен Node.js версии 22.13 или новее.

```bash
npm install
npm run dev
```

Сайт работает на `http://localhost:5173`, Express API — на `http://localhost:3000`. Локальный backend сохраняет сообщения в SQLite-файл `server/data/portfolio.sqlite`. В интернете Cloudflare Pages Functions подключается к D1.

## Бесплатная публикация через Cloudflare

Нужны бесплатные аккаунты Cloudflare и GitHub. В Cloudflare выбирайте **Free**; не добавляйте способ оплаты и не включайте платные тарифы.

1. В Cloudflare откройте **Workers & Pages** и создайте базу **D1 SQL database** с именем `arnur-portfolio-db`.
2. В меню базы откройте **Console** и выполните SQL из файла [`migrations/0001_create_contact_messages.sql`](./migrations/0001_create_contact_messages.sql). Это создаст таблицу для формы.
3. Откройте **Workers & Pages → Create application → Pages → Connect to Git**. Разрешите Cloudflare доступ к GitHub и выберите `PUMBA24/arnur-portfolio`.
4. В настройках сборки укажите production branch `main`, build command `npm run build` и build output directory `dist`. Корневую директорию оставьте пустой и создайте проект.
5. После первой успешной сборки в проекте Cloudflare Pages откройте **Settings → Bindings → Add → D1 database**. Укажите variable name `DB`, выберите `arnur-portfolio-db`, сохраните изменения и запустите **Redeploy**.

Для проекта используйте имя `arnurmedetuly777-portfolio`, если Cloudflare его принимает. Бесплатный адрес будет `https://arnurmedetuly777-portfolio.pages.dev`; покупать отдельный домен не нужно. Если это имя занято, выберите свободное и замените домен в `index.html`, `public/robots.txt`, `public/sitemap.xml` и этом README.

Проверьте адрес `/api/health`, затем отправьте тест через форму. Последующие `git push` автоматически обновляют сайт.

### Как попасть в поисковую выдачу

Файлы `robots.txt` и `sitemap.xml` уже подготовлены. После публикации добавьте адрес сайта в [Google Search Console](https://search.google.com/search-console) и [Яндекс Вебмастер](https://webmaster.yandex.ru/), подтвердите сайт по инструкции сервиса и отправьте sitemap: `https://arnurmedetuly777-portfolio.pages.dev/sitemap.xml`. Индексация может занять от нескольких дней до нескольких недель; появление сайта и его позиция по запросам не гарантируются.

### Бесплатные лимиты

Cloudflare Free включает Pages (до 500 сборок в месяц) и D1 (до 5 млн прочитанных строк и 100 тыс. записанных строк в день, до 5 ГБ хранилища на аккаунт по текущим лимитам). Для небольшого портфолио обычно этого достаточно; проверьте актуальные условия Cloudflare. Не добавляйте платные продукты или upgrade, если нужен строго бесплатный тариф.

Форма сохраняет сообщения в базе данных, но не отправляет email-уведомления. Проверить состояние API можно по `/api/health`.
