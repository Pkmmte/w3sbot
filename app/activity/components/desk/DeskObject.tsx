'use client';
import { motion, Variants } from 'framer-motion';
import { ReactNode, useState, useCallback } from 'react';
import { springs } from '../../lib/tokens';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  className?: string;
  hoverLift?: number;
  hoverScale?: number;
  disabled?: boolean;
}

export function DeskObject({ children, onClick, onHoverStart, onHoverEnd, className = '', hoverLift = 15, hoverScale = 1.02, disabled = false }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  const handleHoverStart = useCallback(() => {
    if (disabled) return;
    setIsHovered(true);
    onHoverStart?.();
  }, [disabled, onHoverStart]);

  const handleHoverEnd = useCallback(() => {
    setIsHovered(false);
    onHoverEnd?.();
  }, [onHoverEnd]);

  const variants: Variants = {
    idle: { y: 0, scale: 1, rotateX: 0, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.25))" },
    hover: { y: -hoverLift, scale: hoverScale, rotateX: -3, filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.35))", transition: springs.snappy },
    tap: { scale: hoverScale * 0.98, y: -hoverLift * 0.5, transition: { duration: 0.1 } },
  };

  return (
    <motion.div
      className={`${disabled ? 'cursor-default' : 'cursor-pointer'} ${className}`}
      style={{ transformStyle: "preserve-3d" }}
      variants={variants}
      initial="idle"
      animate={isHovered ? "hover" : "idle"}
      whileTap={disabled ? undefined : "tap"}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </motion.div>
  );
}
