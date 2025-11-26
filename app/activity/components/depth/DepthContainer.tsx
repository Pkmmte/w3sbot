'use client';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, useRef, useCallback } from 'react';
import { useResponsiveDepth } from '../../hooks/useResponsiveDepth';

interface Props { children: ReactNode; className?: string; enableTilt?: boolean; }

export function DepthContainer({ children, className = '', enableTilt = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { perspective, tiltIntensity } = useResponsiveDepth();
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]), { stiffness: 150, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!enableTilt || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [enableTilt, mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => { mouseX.set(0); mouseY.set(0); }, [mouseX, mouseY]);

  return (
    <div ref={containerRef} className={`w-full h-full overflow-hidden ${className}`} style={{ perspective }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <motion.div className="w-full h-full" style={{ transformStyle: "preserve-3d", rotateX: enableTilt ? rotateX : 0, rotateY: enableTilt ? rotateY : 0 }}>
        {children}
      </motion.div>
    </div>
  );
}
