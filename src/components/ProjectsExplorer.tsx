'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import type { Project } from '@/data/site';

type SortOrder = 'title-asc' | 'title-desc' | 'category';

export function ProjectsExplorer({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Все категории');
  const [technology, setTechnology] = useState('Любая технология');
  const [sortOrder, setSortOrder] = useState<SortOrder>('title-asc');
  const reduceMotion = useReducedMotion();

  const categories = useMemo(
    () => ['Все категории', ...new Set(projects.map((project) => project.category))],
    [projects],
  );
  const technologies = useMemo(
    () => ['Любая технология', ...new Set(projects.flatMap((project) => project.stack))],
    [projects],
  );

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru');

    return projects
      .filter((project) => {
        const matchesCategory = category === 'Все категории' || project.category === category;
        const matchesTechnology =
          technology === 'Любая технология' || project.stack.includes(technology);
        const searchableText = [
          project.title,
          project.category,
          project.description,
          ...project.stack,
        ]
          .join(' ')
          .toLocaleLowerCase('ru');

        return (
          matchesCategory &&
          matchesTechnology &&
          (!normalizedQuery || searchableText.includes(normalizedQuery))
        );
      })
      .sort((first, second) => {
        if (sortOrder === 'category') {
          return first.category.localeCompare(second.category, 'ru');
        }
        const comparison = first.title.localeCompare(second.title, 'ru');
        return sortOrder === 'title-asc' ? comparison : -comparison;
      });
  }, [category, projects, query, sortOrder, technology]);

  return (
    <>
      <div className="projects-toolbar">
        <label>
          <span className="sr-only">Поиск проекта или технологии</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Название или технология"
            type="search"
            value={query}
          />
        </label>
        <label>
          <span className="sr-only">Фильтр по технологии</span>
          <select onChange={(event) => setTechnology(event.target.value)} value={technology}>
            {technologies.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Сортировать проекты</span>
          <select
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            value={sortOrder}
          >
            <option value="title-asc">По названию: А—Я</option>
            <option value="title-desc">По названию: Я—А</option>
            <option value="category">По категории</option>
          </select>
        </label>
      </div>

      <div aria-label="Категории проектов" className="filter-buttons">
        {categories.map((item) => (
          <button
            aria-pressed={category === item}
            className="filter-button"
            key={item}
            onClick={() => setCategory(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <p aria-live="polite" className="project-meta">
        Найдено проектов: {visibleProjects.length}
      </p>

      {visibleProjects.length === 0 ? (
        <p className="empty-state">Ничего не нашлось. Попробуйте изменить фильтры или запрос.</p>
      ) : (
        <div className="grid">
          <AnimatePresence mode="popLayout">
            {visibleProjects.map((project) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 10 }}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                key={project.slug}
                layout={!reduceMotion}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
