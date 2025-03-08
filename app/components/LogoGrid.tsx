'use client';
import { ReactElement } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

type Props = {
  logos: string[];
};

export default function LogoGrid({ logos }: Props): ReactElement {
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
      className="grid grid-cols-6 gap-12 logo-grid max-w-3xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {logos.map((logo: string) => (
        <motion.div key={logo} variants={item}>
          <Image
            src={`/logos/${logo}`}
            alt={logo.replace('.svg', '')}
            width={200}
            height={200}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
