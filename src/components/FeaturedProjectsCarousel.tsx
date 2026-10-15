'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from '@/components/Link';
import type { Project } from '@/data/site';
import styles from './FeaturedProjectsCarousel.module.css';

export function FeaturedProjectsCarousel({ projects }: { projects: Project[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const project = projects[activeIndex] ?? projects[0];

  useEffect(() => {
    if (projects.length < 2 || isPaused || reduceMotion) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % projects.length);
    }, 3_000);

    return () => window.clearInterval(intervalId);
  }, [isPaused, projects.length, reduceMotion]);

  if (!project) return <p className={styles.empty}>Пока нет проектов для показа.</p>;

  const changeProject = (offset: number) => {
    setActiveIndex((index) => (index + offset + projects.length) % projects.length);
  };

  return (
    <div
      aria-label="Избранные учебные проекты"
      className={styles.carousel}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
      onFocusCapture={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.article
          animate={{ opacity: 1, y: 0 }}
          aria-live="off"
          className={styles.slide}
          exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          key={project.slug}
          transition={{ duration: reduceMotion ? 0 : 0.24 }}
        >
          <Link
            aria-label={`Открыть проект «${project.title}»`}
            className={`${styles.preview} ${styles[project.preview.theme]}`}
            href={`/projects/${project.slug}`}
            style={{ backgroundColor: project.accent }}
          >
            <div className={styles.website}>
              <div className={styles.siteNav}>
                <span className={styles.logo}>{project.preview.brand}</span>
                <div aria-hidden="true">
                  {project.preview.navigation.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <span className={styles.siteAction}>{project.preview.action}</span>
              </div>
              <div className={styles.siteHero}>
                <Image
                  alt={project.imageAlt}
                  className={styles.photo}
                  fill
                  sizes="(max-width: 760px) 100vw, 60vw"
                  src={project.image}
                />
                <div className={styles.siteCopy}>
                  <p className={styles.siteEyebrow}>{project.preview.eyebrow}</p>
                  <h3>{project.preview.headline}</h3>
                  <p>{project.preview.summary}</p>
                  <span className={styles.siteButton}>
                    {project.preview.action} <span aria-hidden="true">↗</span>
                  </span>
                </div>
                <span className={styles.photoIndex}>
                  {String(activeIndex + 1).padStart(2, '0')} —{' '}
                  {String(projects.length).padStart(2, '0')}
                </span>
              </div>
              <span className={styles.concept}>Учебный концепт</span>
            </div>
          </Link>

          <div className={styles.details}>
            <p className={styles.category}>{project.category}</p>
            <div className={styles.titleRow}>
              <h3>{project.title}</h3>
              <span>
                {String(activeIndex + 1).padStart(2, '0')} /{' '}
                {String(projects.length).padStart(2, '0')}
              </span>
            </div>
            <p className={styles.description}>{project.description}</p>
            <p className={styles.solution}>{project.solution}</p>
            <div aria-label="Технологии" className={styles.tags}>
              {project.stack.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <Link className={styles.detailLink} href={`/projects/${project.slug}`}>
              Разобрать проект <span aria-hidden="true">↗</span>
            </Link>

            <div aria-label="Управление проектами" className={styles.controls}>
              <button
                aria-label="Предыдущий проект"
                className={styles.arrow}
                disabled={projects.length < 2}
                onClick={() => changeProject(-1)}
                type="button"
              >
                ←
              </button>
              <div aria-label="Выбрать проект" className={styles.dots} role="group">
                {projects.map((item, index) => (
                  <button
                    aria-current={index === activeIndex ? 'true' : undefined}
                    aria-label={`Проект ${index + 1}: ${item.title}`}
                    className={index === activeIndex ? styles.activeDot : styles.dot}
                    key={item.slug}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  />
                ))}
              </div>
              <button
                aria-label="Следующий проект"
                className={styles.arrow}
                disabled={projects.length < 2}
                onClick={() => changeProject(1)}
                type="button"
              >
                →
              </button>
            </div>
            <p className={styles.hint}>
              Переключается каждые 3 секунды · наведите курсор, чтобы остановить.
            </p>
          </div>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}
