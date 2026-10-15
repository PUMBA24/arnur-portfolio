'use client';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import styles from './Reveal.module.css';

export function Reveal({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={styles.reveal}
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reducedMotion ? 0 : 0.45, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
