'use client';
import { ReactElement, useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import '@/styles/logo-grid.sass';

type Props = {
  logos: string[];
};

export default function LogoGrid({ logos }: Props): ReactElement {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      className="grid grid-cols-6 gap-12 logo-grid max-w-3xl mx-auto"
      variants={container}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
    >
      {logos.map((logo: string) => (
        <motion.div key={logo} variants={item}>
          <Image
            src={`/logos/${logo}`}
            alt={logo.replace('.svg', '')}
            width={200}
            height={200}
            sizes="(max-width: 640px) 14vw, (max-width: 1024px) 12vw, 128px"
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
