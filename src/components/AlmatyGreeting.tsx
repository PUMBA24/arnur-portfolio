'use client';

import { useSyncExternalStore } from 'react';

function getGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat('ru-KZ', {
      hour: '2-digit',
      hourCycle: 'h23',
      timeZone: 'Asia/Almaty',
    }).format(new Date()),
  );

  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

function subscribe(onChange: () => void) {
  window.addEventListener('focus', onChange);
  const intervalId = window.setInterval(onChange, 60_000);

  return () => {
    window.removeEventListener('focus', onChange);
    window.clearInterval(intervalId);
  };
}

export function AlmatyGreeting() {
  const greeting = useSyncExternalStore(subscribe, getGreeting, () => '');

  return (
    <>
      {greeting && <>{greeting} · </>}
      Алматы, Казахстан
    </>
  );
}
