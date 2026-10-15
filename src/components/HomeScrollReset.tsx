'use client';

import { useLayoutEffect } from 'react';

export function HomeScrollReset() {
  useLayoutEffect(() => {
    if (window.location.hash) return;
    window.history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return null;
}
