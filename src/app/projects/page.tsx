import type { Metadata } from 'next';
import { ProjectsExplorer } from '@/components/ProjectsExplorer';
import { projects } from '@/data/site';

export const metadata: Metadata = {
  title: 'Проекты',
  description: 'Учебные веб-проекты Арнура: задача, решение, стек и честные выводы по каждому.',
};

export default function ProjectsPage() {
  return (
    <div className="page">
      <p className="eyebrow">Демо и учебные концепты</p>
      <h1>Проекты</h1>
      <p className="lead">
        Здесь я практикую интерфейсы и адаптивную вёрстку. Каждая работа помечена как учебная.
      </p>
      <ProjectsExplorer projects={projects} />
    </div>
  );
}
