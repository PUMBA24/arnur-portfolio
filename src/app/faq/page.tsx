import type { Metadata } from 'next';
import { faq } from '@/data/site';

export const metadata: Metadata = {
  title: 'Частые вопросы',
  description: 'Ответы о стоимости сайта, сроках, работе и моём опыте.',
};

export default function FAQPage() {
  return (
    <div className="page">
      <p className="eyebrow">Короткие ответы</p>
      <h1>Частые вопросы</h1>
      <div className="faq-list">
        {faq.map((item) => (
          <details className="faq-item" key={item.question}>
            <summary>{item.question}</summary>
            <p className="faq-answer">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
