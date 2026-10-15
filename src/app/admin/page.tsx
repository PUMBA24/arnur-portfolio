import type { Metadata } from 'next';
import { AdminPanel } from './AdminPanel';
import styles from './AdminPanel.module.css';

export const metadata: Metadata = {
  title: 'Админка',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <section className={styles.page}>
      <AdminPanel />
    </section>
  );
}
