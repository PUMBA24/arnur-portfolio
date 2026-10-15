import type { Metadata } from 'next';
import { PricingCalculator } from '@/components/PricingCalculator';

export const metadata: Metadata = {
  title: 'Цены и калькулятор',
  description: 'Ориентировочная стоимость сайтов и правок в тенге. Бюджет и объём обсуждаем.',
};

export default function PricingPage() {
  return (
    <div className="page">
      <p className="eyebrow">Понятные ориентиры · Казахстан</p>
      <h1>Сколько стоит сайт?</h1>
      <p className="lead">
        Выберите нужные функции — калькулятор покажет примерный диапазон цены в тенге и срок.
        Финальную сумму согласуем вместе.
      </p>
      <PricingCalculator />
      <p className="field-hint">
        Базовые ориентиры: лендинг — от 40 000 ₸, многостраничный сайт — от 80 000 ₸,
        магазин/каталог — от 150 000 ₸, правки — от 5 000 ₸/час. Цена ориентировочная; готов
        обсудить бюджет и фиксированную сумму.
      </p>
    </div>
  );
}
