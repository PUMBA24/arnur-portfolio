const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(input) {
  const { name, email, message } = input ?? {};

  if (
    typeof name !== 'string'
    || typeof email !== 'string'
    || typeof message !== 'string'
  ) {
    return { error: 'Заполните все поля формы.' };
  }

  const contact = {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  };

  if (!contact.name || contact.name.length > 80) {
    return { error: 'Имя должно содержать от 1 до 80 символов.' };
  }

  if (contact.email.length > 254 || !emailPattern.test(contact.email)) {
    return { error: 'Укажите корректный адрес электронной почты.' };
  }

  if (!contact.message || contact.message.length > 3000) {
    return { error: 'Сообщение должно содержать от 1 до 3000 символов.' };
  }

  return { contact };
}
