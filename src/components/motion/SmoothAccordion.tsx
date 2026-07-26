import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface AccordionItem {
  questionDe: string;
  questionEn: string;
  answerDe: string;
  answerEn: string;
}

interface SmoothAccordionProps {
  items: AccordionItem[];
}

export default function SmoothAccordion({ items }: SmoothAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="divide-y divide-[#222222]">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between py-6 text-left group"
              aria-expanded={isOpen}
            >
              <span
                className="font-body text-white font-medium pr-4"
                data-i18n-de={item.questionDe}
                data-i18n-en={item.questionEn}
              >
                {item.questionDe}
              </span>
              <motion.svg
                className="w-5 h-5 text-[#555555] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v12M6 12h12" />
              </motion.svg>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: { duration: prefersReducedMotion ? 0 : 0.35, ease: [0.25, 0.1, 0.25, 1] },
                    opacity: { duration: prefersReducedMotion ? 0 : 0.25, delay: prefersReducedMotion ? 0 : 0.1 },
                  }}
                  className="overflow-hidden"
                >
                  <p
                    className="font-body text-[#999999] text-sm leading-relaxed pb-6"
                    data-i18n-de={item.answerDe}
                    data-i18n-en={item.answerEn}
                  >
                    {item.answerDe}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
