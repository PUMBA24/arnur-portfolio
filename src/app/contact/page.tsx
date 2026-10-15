import type { Metadata } from 'next';
import { ContactForm } from '@/app/contact/ContactForm';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: 'Обсудим ваш сайт',
  description: 'Расскажите о задаче, бюджете и сроках — я отвечу лично.',
};

const messageText = encodeURIComponent('Здравствуйте, хочу обсудить сайт.');
const telegramHandle = site.telegram.startsWith('@') ? site.telegram.slice(1) : '';
const whatsappNumber = site.whatsapp.replace(/\D/g, '');

export default function ContactPage() {
  return (
    <div className="page">
      <p className="eyebrow">Связь без лишних формальностей</p>
      <h1>Обсудим ваш сайт</h1>
      <p className="lead">
        Опишите задачу в нескольких шагах. Это ни к чему не обязывает — сначала разберёмся, чем я
        могу помочь.
      </p>

      <div className="contact-layout">
        <section aria-label="Форма заявки" className="contact-form-panel">
          <ContactForm />
        </section>
        <aside className="contact-aside">
          <p className="eyebrow">Или напишите напрямую</p>
          <p>
            Email — <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
          <div className="quick-contact-links">
            {telegramHandle && !telegramHandle.includes('[') && (
              <a
                href={`https://t.me/${telegramHandle}?text=${messageText}`}
                rel="noreferrer"
                target="_blank"
              >
                Telegram ↗
              </a>
            )}
            {whatsappNumber.length >= 8 && (
              <a
                href={`https://wa.me/${whatsappNumber}?text=${messageText}`}
                rel="noreferrer"
                target="_blank"
              >
                WhatsApp ↗
              </a>
            )}
            <a href={`mailto:${site.email}?subject=${encodeURIComponent('Обсудим ваш сайт')}`}>
              Написать email ↗
            </a>
          </div>
          {(!telegramHandle || !whatsappNumber) && (
            <p className="field-hint">
              Добавьте свои Telegram и WhatsApp в `src/data/site.ts`, чтобы показать быстрые ссылки.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
