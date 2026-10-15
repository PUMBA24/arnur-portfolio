'use client';

import { Link } from '@/components/Link';
import { useMemo, useState } from 'react';
import {
  extraFeatures,
  formatTenge,
  websiteTypes,
  type ExtraFeature,
  type WebsiteType,
} from '@/data/pricing';

function getWorkingDaysLabel(days: number) {
  const finalTwoDigits = days % 100;
  const finalDigit = days % 10;
  const noun =
    finalTwoDigits >= 11 && finalTwoDigits <= 14
      ? 'рабочих дней'
      : finalDigit === 1
        ? 'рабочий день'
        : finalDigit >= 2 && finalDigit <= 4
          ? 'рабочих дня'
          : 'рабочих дней';

  return noun;
}

export function PricingCalculator() {
  const [websiteType, setWebsiteType] = useState<WebsiteType>('landing');
  const [pageCount, setPageCount] = useState(3);
  const [hours, setHours] = useState(1);
  const [selectedFeatures, setSelectedFeatures] = useState<ExtraFeature[]>([]);
  const [urgent, setUrgent] = useState(false);

  const selectedType = websiteTypes.find((item) => item.value === websiteType);

  const estimate = useMemo(() => {
    const basePrice =
      websiteType === 'updates'
        ? Math.max(1, hours) * 5_000
        : (selectedType?.startingPrice ?? 40_000);
    const extraPageCost = websiteType === 'multi-page' ? Math.max(0, pageCount - 3) * 8_000 : 0;
    const addedFeatures = extraFeatures.filter(
      (feature) =>
        selectedFeatures.includes(feature.value) &&
        !(websiteType === 'store' && feature.value === 'store'),
    );
    const featureCost = addedFeatures.reduce((total, feature) => total + feature.price, 0);
    const baseDays =
      (selectedType?.startingDays ?? 7) +
      (websiteType === 'multi-page' ? Math.max(0, pageCount - 3) * 2 : 0);
    const featureDays = addedFeatures.reduce((total, feature) => total + feature.days, 0);
    const urgencyMultiplier = urgent ? 1.25 : 1;
    const estimatedTotal = (basePrice + extraPageCost + featureCost) * urgencyMultiplier;
    const lowestPrice = Math.max(
      selectedType?.startingPrice ?? 40_000,
      Math.round(estimatedTotal * 0.9),
    );
    const highestPrice = Math.round(estimatedTotal * 1.2);
    const estimatedDays = Math.ceil((baseDays + featureDays) * (urgent ? 0.8 : 1));

    return {
      lowestPrice,
      highestPrice,
      earliestDays: Math.max(1, estimatedDays),
      latestDays: urgent ? baseDays + featureDays : estimatedDays + 3,
    };
  }, [hours, pageCount, selectedFeatures, selectedType, urgent, websiteType]);

  const toggleFeature = (feature: ExtraFeature) => {
    setSelectedFeatures((currentFeatures) =>
      currentFeatures.includes(feature)
        ? currentFeatures.filter((item) => item !== feature)
        : [...currentFeatures, feature],
    );
  };

  return (
    <div className="pricing-layout">
      <div className="calculator">
        <fieldset className="field-group">
          <legend>1. Что нужно сделать?</legend>
          {websiteTypes.map((type) => (
            <label className="option-card" key={type.value}>
              <input
                checked={websiteType === type.value}
                name="website-type"
                onChange={() => setWebsiteType(type.value)}
                type="radio"
              />
              <span>
                <strong>{type.label}</strong>
                <small>
                  {type.description} От {formatTenge(type.startingPrice)}
                  {type.value === 'updates' ? ' за час' : ''}
                </small>
              </span>
            </label>
          ))}
        </fieldset>

        {(websiteType === 'multi-page' || websiteType === 'updates') && (
          <label className="form-grid">
            {websiteType === 'multi-page' ? 'Число страниц' : 'Сколько часов работы'}
            <input
              max={websiteType === 'multi-page' ? 40 : 80}
              min={1}
              onChange={(event) => {
                const value = Number(event.target.value);
                const safeValue = Math.max(
                  1,
                  Math.min(value || 1, websiteType === 'multi-page' ? 40 : 80),
                );
                if (websiteType === 'multi-page') setPageCount(safeValue);
                else setHours(safeValue);
              }}
              type="number"
              value={websiteType === 'multi-page' ? pageCount : hours}
            />
          </label>
        )}

        <fieldset className="field-group">
          <legend>2. Дополнительные функции</legend>
          {extraFeatures.map((feature) => {
            const isIncluded = websiteType === 'store' && feature.value === 'store';
            const isChecked = isIncluded || selectedFeatures.includes(feature.value);

            return (
              <label className="option-card" key={feature.value}>
                <input
                  checked={isChecked}
                  disabled={isIncluded}
                  onChange={() => toggleFeature(feature.value)}
                  type="checkbox"
                />
                <span>
                  <strong>{feature.label}</strong>
                  <small>
                    {isIncluded
                      ? 'Уже учтено в базовой цене магазина или каталога.'
                      : `Ориентир: +${formatTenge(feature.price)}, ещё ${feature.days} ${
                          feature.days === 1 ? 'день' : 'дней'
                        }.`}
                  </small>
                </span>
              </label>
            );
          })}
        </fieldset>

        <label className="option-card">
          <input
            checked={urgent}
            onChange={(event) => setUrgent(event.target.checked)}
            type="checkbox"
          />
          <span>
            <strong>Нужен ускоренный график</strong>
            <small>
              Добавляет ориентировочно 25% к оценке. Срочность нужно подтвердить отдельно.
            </small>
          </span>
        </label>
      </div>

      <aside aria-live="polite" className="calculator-summary">
        <p className="eyebrow">Ориентировочный расчёт</p>
        <p className="price-range">
          {formatTenge(estimate.lowestPrice)}–{formatTenge(estimate.highestPrice)}
        </p>
        <p>
          По сроку — примерно {estimate.earliestDays}–{estimate.latestDays}{' '}
          {getWorkingDaysLabel(estimate.latestDays)}.
        </p>
        <p className="price-note">
          Это ориентир, а не публичная оферта. Готов обсудить бюджет и зафиксировать сумму после
          уточнения объёма. В магазин включена только согласованная функциональность.
        </p>
        <Link className="button" href="/contact">
          Обсудить задачу <span aria-hidden="true">↗</span>
        </Link>
      </aside>
    </div>
  );
}
