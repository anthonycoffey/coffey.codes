// app/components/AnimatedSection.jsx - Client Component
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const AnimatedSection = ({
  children,
  className = '',
  maxWidth = 'max-w-7xl',
  background = 'bg-transparent',
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  return (
    <motion.div 
      ref={ref}
      className={`w-full ${background} ${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className={`${maxWidth} mx-auto px-4 py-16 md:py-22`}>{children}</div>
    </motion.div>
  );
};

export default AnimatedSection;