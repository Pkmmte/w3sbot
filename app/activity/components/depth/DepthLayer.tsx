'use client';
import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface Props extends MotionProps { children: ReactNode; z?: number; className?: string; }

export function DepthLayer({ children, z = 0, className = '', ...props }: Props) {
  return (
    <motion.div className={className} style={{ transformStyle: "preserve-3d", transform: `translateZ(${z}px)` }} {...props}>
      {children}
    </motion.div>
  );
}
