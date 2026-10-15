import Image from 'next/image';
import { Link } from '@/components/Link';
import styles from './ProjectCard.module.css';
import type { Project } from '@/data/site';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className={styles.card}>
      <Link
        aria-label={`Открыть проект «${project.title}»`}
        className={styles.imageLink}
        href={`/projects/${project.slug}`}
        style={{ backgroundColor: project.accent }}
      >
        <Image
          alt={project.imageAlt}
          className={styles.image}
          height={480}
          sizes="(max-width: 480px) 100vw, (max-width: 700px) 50vw, 33vw"
          src={project.image}
          width={720}
        />
      </Link>
      <div className={styles.copy}>
        <p className={styles.category}>{project.category} · учебный проект</p>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div aria-label="Технологии" className={styles.tags}>
          {project.stack.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>
        <Link className={styles.detailLink} href={`/projects/${project.slug}`}>
          Разобрать проект <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
