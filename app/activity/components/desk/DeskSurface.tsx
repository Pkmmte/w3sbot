// app/activity/components/desk/DeskObject.tsx
'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  hoverLift?: number;
  hoverScale?: number;
  disabled?: boolean;
}

export function DeskObject({ 
  children, 
  onClick, 
  className = '', 
  hoverLift = 12, 
  hoverScale = 1.02, 
  disabled = false 
}: Props) {
  return (
    <motion.div
      className={`${disabled ? 'cursor-default' : 'cursor-pointer'} ${className}`}
      initial={{ y: 0, scale: 1 }}
      whileHover={disabled ? {} : { 
        y: -hoverLift, 
        scale: hoverScale,
        transition: { type: 'spring', stiffness: 400, damping: 25 }
      }}
      whileTap={disabled ? {} : { 
        scale: hoverScale * 0.97,
        y: -hoverLift * 0.5,
      }}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </motion.div>
  );
}
