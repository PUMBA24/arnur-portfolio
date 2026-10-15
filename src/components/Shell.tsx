'use client';

import { Link } from '@/components/Link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { site } from '@/data/site';

const navigationItems = [
  { label: 'Обо мне', href: '/#about' },
  { label: 'Проекты', href: '/#projects' },
  { label: 'Цены', href: '/pricing' },
  { label: 'Вопросы', href: '/#faq' },
];

const commandItems = [
  { label: 'Главная', href: '/' },
  ...navigationItems,
  { label: 'Заметки', href: '/#notes' },
  { label: 'Все проекты', href: '/projects' },
  { label: 'Обо мне подробно', href: '/about' },
  { label: 'Все ответы', href: '/faq' },
  { label: 'Обсудить ваш сайт', href: '/#contact' },
];

export function Header() {
  const pathname = usePathname();
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [paletteIsOpen, setPaletteIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCommand, setSelectedCommand] = useState(0);
  const searchInput = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLElement>(null);
  const { resolvedTheme, setTheme } = useTheme();

  const matchingCommands = commandItems.filter((item) =>
    item.label.toLocaleLowerCase('ru').includes(search.toLocaleLowerCase('ru')),
  );

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearch('');
        setSelectedCommand(0);
        setPaletteIsOpen(true);
      }

      if (event.key === 'Escape') {
        setPaletteIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    if (!paletteIsOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    searchInput.current?.focus();
    return () => previousFocus?.focus();
  }, [paletteIsOpen]);

  function closeMenu() {
    setMenuIsOpen(false);
  }

  function openPalette() {
    setSearch('');
    setSelectedCommand(0);
    setPaletteIsOpen(true);
  }

  const handlePaletteKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (matchingCommands.length > 0) {
        setSelectedCommand((index) => Math.min(index + 1, matchingCommands.length - 1));
      }
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedCommand((index) => Math.max(index - 1, 0));
    }

    if (event.key === 'Enter' && matchingCommands[selectedCommand]) {
      window.location.assign(matchingCommands[selectedCommand].href);
      setPaletteIsOpen(false);
    }
  };

  const keepFocusInPalette = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;

    const focusableItems = paletteRef.current?.querySelectorAll<HTMLElement>(
      'input, a[href], button:not([disabled])',
    );
    if (!focusableItems?.length) return;

    const firstItem = focusableItems[0];
    const lastItem = focusableItems[focusableItems.length - 1];
    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem.focus();
    }
  };

  return (
    <>
      <header className="site-header">
        <Link className="brand-logo" href="/" aria-label="Арнур — главная">
          <span aria-hidden="true" className="brand-logo-mark">
            А
          </span>
          arnur<span>.</span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuIsOpen}
          aria-label={menuIsOpen ? 'Закрыть меню' : 'Открыть меню'}
          onClick={() => setMenuIsOpen((isOpen) => !isOpen)}
        >
          {menuIsOpen ? '×' : '☰'}
        </button>
        <nav
          className={menuIsOpen ? 'navigation is-open' : 'navigation'}
          aria-label="Основная навигация"
        >
          {navigationItems.map((item) => (
            <Link
              aria-current={pathname === item.href ? 'page' : undefined}
              href={item.href}
              key={item.href}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
          <Link className="nav-contact" href="/#contact" onClick={closeMenu}>
            Обсудим сайт <span aria-hidden="true">↗</span>
          </Link>
          <button
            aria-label="Переключить цветовую тему"
            className="theme-toggle"
            type="button"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            ◐
          </button>
        </nav>
      </header>

      <button
        aria-label="Открыть поиск по сайту"
        className="command-hint"
        onClick={openPalette}
        type="button"
      >
        Поиск <kbd>⌘ / Ctrl K</kbd>
      </button>

      {paletteIsOpen && (
        <div
          className="palette-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPaletteIsOpen(false);
          }}
        >
          <section
            aria-label="Командная палитра"
            aria-modal="true"
            className="command-palette"
            onKeyDown={keepFocusInPalette}
            ref={paletteRef}
            role="dialog"
          >
            <label className="sr-only" htmlFor="command-search">
              Найти страницу
            </label>
            <input
              autoComplete="off"
              id="command-search"
              onChange={(event) => {
                setSearch(event.target.value);
                setSelectedCommand(0);
              }}
              onKeyDown={handlePaletteKeyDown}
              placeholder="Куда перейти?"
              ref={searchInput}
              type="search"
              value={search}
            />
            <ul>
              {matchingCommands.length > 0 ? (
                matchingCommands.map((item, index) => (
                  <li key={item.href}>
                    <Link
                      aria-current={index === selectedCommand ? 'true' : undefined}
                      href={item.href}
                      onClick={() => setPaletteIsOpen(false)}
                    >
                      {item.label}
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="palette-empty">Не нашёл такую страницу.</li>
              )}
            </ul>
            <p>Нажмите Esc, чтобы закрыть.</p>
          </section>
        </div>
      )}
    </>
  );
}

export function Footer() {
  const [almatyTime, setAlmatyTime] = useState('--:--');
  const [copyStatus, setCopyStatus] = useState('');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const updateTime = () => {
      setAlmatyTime(
        new Intl.DateTimeFormat('ru-KZ', {
          timeZone: 'Asia/Almaty',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date()),
      );
    };

    updateTime();
    const intervalId = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopyStatus('Email скопирован');
    } catch (error) {
      console.error('Не удалось скопировать email:', error);
      setCopyStatus('Скопировать не получилось — напишите на email ниже.');
    }
  };

  return (
    <footer className="site-footer">
      <Link className="brand-logo" href="/" aria-label="Арнур — главная">
        arnur<span>.</span>
      </Link>
      <span>
        Казахстан · Алматы <time>{almatyTime}</time>
      </span>
      <a href={`mailto:${site.email}`}>{site.email}</a>
      <button className="footer-copy" onClick={copyEmail} type="button">
        {copyStatus || 'Скопировать email'}
      </button>
      <Link href="/sources">Лицензии и источники</Link>
      <Link className="admin-entry" href="/admin">
        Вход в админку
      </Link>
      <a className="back-to-top" href="#top">
        Наверх ↑
      </a>
      <small>© {currentYear} · Junior-разработчик</small>
    </footer>
  );
}

export function Extras() {
  const [readingProgress, setReadingProgress] = useState(0);
  const [easterEggIsVisible, setEasterEggIsVisible] = useState(false);
  const cursor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let scrollFrame = 0;
    const updateProgress = () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        setReadingProgress(scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0);
      });
    };

    const konamiCode = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];
    let pressedKeys: string[] = [];
    const handleKeyDown = (event: KeyboardEvent) => {
      pressedKeys = [...pressedKeys, event.key].slice(-konamiCode.length);
      if (pressedKeys.join('|') === konamiCode.join('|')) {
        setEasterEggIsVisible(true);
        window.setTimeout(() => setEasterEggIsVisible(false), 3_500);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      cursor.current?.style.setProperty(
        'transform',
        `translate3d(${event.clientX}px, ${event.clientY}px, 0)`,
      );
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    updateProgress();

    return () => {
      window.cancelAnimationFrame(scrollFrame);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className="reading-progress"
        style={{ transform: `scaleX(${readingProgress / 100})` }}
      />
      <span aria-hidden="true" className="custom-cursor" ref={cursor} />
      {easterEggIsVisible && (
        <p className="easter-egg" role="status">
          Секрет найден. Спасибо, что заглянули!
        </p>
      )}
    </>
  );
}
