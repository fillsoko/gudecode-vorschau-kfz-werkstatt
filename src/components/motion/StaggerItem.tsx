import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right';
}

const variants = {
  up: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0 },
  },
};

export default function StaggerItem({
  children,
  className = '',
  direction = 'up',
}: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before hydration or with reduced motion, render visible
  if (prefersReducedMotion || !mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={variants[direction]}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
