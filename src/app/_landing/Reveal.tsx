'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

type RevealDelay = 1 | 2 | 3 | 4 | 5 | 6;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: RevealDelay;
  as?: 'div' | 'section' | 'li' | 'article';
}

export function Reveal({ children, className = '', delay, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as;
  const animClass = visible ? `animate-fade-up${delay ? ` delay-${delay}` : ''}` : 'opacity-0';

  return (
    <Tag ref={ref as never} className={`${animClass} ${className}`}>
      {children}
    </Tag>
  );
}
