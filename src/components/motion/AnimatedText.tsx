import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export default function AnimatedText({
  text,
  className = '',
  delay = 0,
  as: Tag = 'h2',
}: AnimatedTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const words = text.split(' ');

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        setSkipAnimation(true);
      }
    }
    setMounted(true);
  }, []);

  if (prefersReducedMotion || !mounted || skipAnimation) {
    return <Tag ref={ref as any} className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className}>
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.04,
              delayChildren: delay,
            },
          },
        }}
        style={{ display: 'inline' }}
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ display: 'inline-block', whiteSpace: 'pre' }}
          >
            {word}{i < words.length - 1 ? ' ' : ''}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
