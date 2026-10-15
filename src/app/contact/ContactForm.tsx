'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { contactDraftSchema, contactSchema, type ContactRequest } from '@/lib/contact-schema';

const draftKey = 'arnur-portfolio-contact-draft-v1';

const defaultValues: ContactRequest = {
  type: 'unsure',
  description: '',
  budget: 'discuss',
  customBudget: '',
  deadline: 'flexible',
  contactChannel: 'telegram',
  contactValue: '',
  website: '',
};

const steps = [
  { title: 'Тип сайта', fields: ['type'] as const },
  { title: 'Описание', fields: ['description'] as const },
  { title: 'Бюджет', fields: ['budget', 'customBudget'] as const },
  { title: 'Контакт', fields: ['deadline', 'contactChannel', 'contactValue'] as const },
];

export function ContactForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState('');
  const [deliveryNotice, setDeliveryNotice] = useState('');
  const [draftMessage, setDraftMessage] = useState('Черновик сохраняется в этом браузере.');
  const {
    clearErrors,
    control,
    register,
    handleSubmit,
    subscribe,
    trigger,
    reset,
    formState: { errors },
  } = useForm<ContactRequest>({
    resolver: zodResolver(contactSchema),
    defaultValues,
  });
  const budget = useWatch({ control, name: 'budget' });
  const contactChannel = useWatch({ control, name: 'contactChannel' });

  useEffect(() => {
    try {
      const savedDraft = window.localStorage.getItem(draftKey);
      if (!savedDraft) return;

      const parsed: unknown = JSON.parse(savedDraft);
      const result = contactDraftSchema.safeParse(parsed);
      if (!result.success) {
        window.localStorage.removeItem(draftKey);
        return;
      }

      reset({ ...defaultValues, ...result.data });
    } catch (error) {
      console.error('Не удалось восстановить черновик формы:', error);
    }
  }, [reset]);

  useEffect(() => {
    const subscription = subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        try {
          window.localStorage.setItem(draftKey, JSON.stringify(values));
          setDraftMessage('Черновик сохранён на этом устройстве.');
        } catch (error) {
          console.error('Не удалось сохранить черновик формы:', error);
          setDraftMessage('Не удалось сохранить черновик в этом браузере.');
        }
      },
    });
    return subscription;
  }, [subscribe]);

  async function goToNextStep() {
    const isCurrentStepValid = await trigger(steps[currentStep].fields);
    if (isCurrentStepValid) {
      clearErrors();
      setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    }
  }

  async function submitContact(values: ContactRequest) {
    setSending(true);
    setServerError('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result: unknown = await response.json();
      const message =
        typeof result === 'object' && result !== null && 'error' in result
          ? result.error
          : undefined;
      if (!response.ok) {
        throw new Error(typeof message === 'string' ? message : 'Не удалось отправить заявку.');
      }
      try {
        window.localStorage.removeItem(draftKey);
      } catch (error) {
        console.error('Не удалось удалить отправленный черновик:', error);
      }
      if (
        typeof result === 'object' &&
        result !== null &&
        'stored' in result &&
        result.stored === true &&
        'emailAccepted' in result &&
        result.emailAccepted === false
      ) {
        setDeliveryNotice(
          'Заявка сохранена, но почтовое уведомление временно не отправилось. Я проверю её в админке.',
        );
      }
      setSent(true);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Произошла ошибка. Попробуйте ещё раз.',
      );
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="notice" role="status">
        <h2>Спасибо!</h2>
        <p>Заявка отправлена. Я свяжусь с вами по указанному контакту.</p>
        {deliveryNotice && <p>{deliveryNotice}</p>}
      </div>
    );
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit(submitContact)}>
      <ol className="steps" aria-label="Шаги формы">
        {steps.map((step, index) => (
          <li
            aria-current={index === currentStep ? 'step' : undefined}
            className={index === currentStep ? 'current' : ''}
            key={step.title}
          >
            {index + 1}. {step.title}
          </li>
        ))}
      </ol>

      {currentStep === 0 && (
        <label>
          Что нужно сделать?
          <select {...register('type')}>
            <option value="unsure">Пока не знаю</option>
            <option value="landing">Лендинг</option>
            <option value="multi-page">Многостраничный сайт</option>
            <option value="store">Магазин / каталог</option>
            <option value="changes">Доработки</option>
          </select>
          {errors.type && <small>{errors.type.message}</small>}
        </label>
      )}

      {currentStep === 1 && (
        <label>
          Коротко о задаче
          <textarea
            aria-invalid={Boolean(errors.description)}
            placeholder="Для кого сайт, что на нём важно и есть ли примеры?"
            rows={6}
            {...register('description')}
          />
          {errors.description && <small>{errors.description.message}</small>}
        </label>
      )}

      {currentStep === 2 && (
        <>
          <label>
            На какой бюджет ориентируетесь?
            <select {...register('budget')}>
              <option value="discuss">Обсудим</option>
              <option value="under-50">До 50 000 ₸</option>
              <option value="50-100">50 000–100 000 ₸</option>
              <option value="100-200">100 000–200 000 ₸</option>
              <option value="over-200">Больше 200 000 ₸</option>
              <option value="custom">Своя сумма</option>
            </select>
          </label>
          {budget === 'custom' && (
            <label>
              Сумма в тенге
              <input
                aria-invalid={Boolean(errors.customBudget)}
                inputMode="numeric"
                {...register('customBudget')}
              />
              {errors.customBudget && <small>{errors.customBudget.message}</small>}
            </label>
          )}
        </>
      )}

      {currentStep === 3 && (
        <>
          <label>
            Когда нужен результат?
            <select {...register('deadline')}>
              <option value="flexible">Срок гибкий</option>
              <option value="two-weeks">В течение двух недель</option>
              <option value="month">В течение месяца</option>
              <option value="date">Есть конкретная дата</option>
            </select>
          </label>
          <label>
            Способ связи
            <select {...register('contactChannel')}>
              <option value="telegram">Telegram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </select>
          </label>
          <label>
            {contactChannel === 'email'
              ? 'Адрес электронной почты'
              : contactChannel === 'whatsapp'
                ? 'Номер WhatsApp с кодом страны'
                : 'Имя пользователя Telegram'}
            <input
              aria-invalid={Boolean(errors.contactValue)}
              autoComplete={contactChannel === 'email' ? 'email' : 'off'}
              placeholder={
                contactChannel === 'email'
                  ? 'name@example.com'
                  : contactChannel === 'whatsapp'
                    ? '+7 700 000 00 00'
                    : '@username'
              }
              {...register('contactValue')}
            />
            {errors.contactValue && <small>{errors.contactValue.message}</small>}
          </label>
        </>
      )}

      <label className="honeypot" aria-hidden="true">
        Оставьте это поле пустым
        <input autoComplete="off" tabIndex={-1} {...register('website')} />
      </label>

      <div className="button-row">
        {currentStep > 0 && (
          <button
            className="text-link"
            onClick={() => {
              clearErrors();
              setCurrentStep((step) => step - 1);
            }}
            type="button"
          >
            ← Назад
          </button>
        )}
        {currentStep < steps.length - 1 ? (
          <button className="button" onClick={goToNextStep} type="button">
            Далее →
          </button>
        ) : (
          <button className="button" disabled={sending} type="submit">
            {sending ? 'Отправляю…' : 'Отправить заявку'}
          </button>
        )}
      </div>
      <p aria-live="polite" className="draft-status">
        {draftMessage}
      </p>
      {serverError && (
        <p className="error-box" role="alert">
          {serverError}
        </p>
      )}
    </form>
  );
}
