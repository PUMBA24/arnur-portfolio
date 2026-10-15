import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/components/Link';
import { notFound } from 'next/navigation';
import { projects } from '@/data/site';

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);

  return {
    title: project?.title ?? 'Проект',
    description: project?.description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);

  if (!project) notFound();

  const projectSections = [
    { title: 'Задача', description: project.challenge },
    { title: 'Решение', description: project.solution },
    { title: 'Что получилось', description: project.outcome },
    { title: 'Что я бы улучшил', description: project.improve },
  ];

  return (
    <article className="page reading">
      <header className="project-detail-header">
        <p className="eyebrow">{project.category} · учебный проект</p>
        <h1>{project.title}</h1>
        <p className="lead">{project.description}</p>
        <div aria-label="Использованные технологии" className="project-tags">
          {project.stack.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>
      </header>

      <Image
        alt={project.imageAlt}
        className="project-detail-image"
        height={800}
        priority
        sizes="(max-width: 700px) 100vw, 1160px"
        src={project.image}
        width={1200}
      />

      <div className="project-detail-grid">
        {projectSections.map((section) => (
          <section className="card" key={section.title}>
            <p className="eyebrow">{section.title}</p>
            <p>{section.description}</p>
          </section>
        ))}
      </div>

      <p>
        <Link className="text-link" href="/projects">
          ← Все проекты
        </Link>
      </p>
    </article>
  );
}
