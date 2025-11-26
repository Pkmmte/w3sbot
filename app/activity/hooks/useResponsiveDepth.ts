'use client';
import { useEffect, useState } from 'react';

interface DepthConfig {
  perspective: number;
  tiltIntensity: number;
  enableParallax: boolean;
}

export function useResponsiveDepth(): DepthConfig {
  const [config, setConfig] = useState<DepthConfig>({
    perspective: 1200, tiltIntensity: 8, enableParallax: true,
  });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w <= 480) setConfig({ perspective: 800, tiltIntensity: 0, enableParallax: false });
      else if (w <= 768) setConfig({ perspective: 1000, tiltIntensity: 5, enableParallax: true });
      else setConfig({ perspective: 1200, tiltIntensity: 8, enableParallax: true });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return config;
}
