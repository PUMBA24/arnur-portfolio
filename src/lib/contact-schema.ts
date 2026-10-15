import { z } from 'zod';

const contactChannels = ['email', 'telegram', 'whatsapp'] as const;

// This object schema is also used for partially completed local drafts.
const contactFieldsSchema = z.object({
  type: z.enum(['landing', 'multi-page', 'store', 'changes', 'unsure']),
  description: z.string().trim().min(10, 'Добавьте хотя бы 10 символов.').max(2_000),
  budget: z.enum(['under-50', '50-100', '100-200', 'over-200', 'custom', 'discuss']),
  customBudget: z.string().trim().max(30).optional(),
  deadline: z.enum(['two-weeks', 'month', 'flexible', 'date']),
  contactChannel: z.enum(contactChannels),
  contactValue: z.string().trim().min(4, 'Укажите контакт для связи.').max(254),
  website: z.string().max(200).optional(),
});

export const contactSchema = contactFieldsSchema.superRefine((data, context) => {
  if (data.budget === 'custom') {
    const amount = Number(data.customBudget?.replace(/[^\d]/g, ''));
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      context.addIssue({
        code: 'custom',
        path: ['customBudget'],
        message: 'Укажите сумму больше нуля в тенге.',
      });
    }
  }

  if (data.contactChannel === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactValue)) {
    context.addIssue({
      code: 'custom',
      path: ['contactValue'],
      message: 'Проверьте адрес электронной почты.',
    });
  }

  if (data.contactChannel === 'telegram' && !/^@?[a-zA-Z0-9_]{5,32}$/.test(data.contactValue)) {
    context.addIssue({
      code: 'custom',
      path: ['contactValue'],
      message: 'Укажите имя пользователя Telegram, например @username.',
    });
  }

  if (data.contactChannel === 'whatsapp' && data.contactValue.replace(/\D/g, '').length < 8) {
    context.addIssue({
      code: 'custom',
      path: ['contactValue'],
      message: 'Укажите номер WhatsApp с кодом страны.',
    });
  }
});

export type ContactRequest = z.infer<typeof contactSchema>;

// Drafts may be incomplete; only check data shape, not final-submit requirements.
export const contactDraftSchema = z.object({
  type: contactFieldsSchema.shape.type.optional(),
  description: z.string().max(2_000).optional(),
  budget: contactFieldsSchema.shape.budget.optional(),
  customBudget: z.string().max(30).optional(),
  deadline: contactFieldsSchema.shape.deadline.optional(),
  contactChannel: contactFieldsSchema.shape.contactChannel.optional(),
  contactValue: z.string().max(254).optional(),
  website: z.string().max(200).optional(),
});
