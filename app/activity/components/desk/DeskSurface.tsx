'use client';
import { motion } from 'framer-motion';
import { colors } from '../../lib/tokens';

export function DeskSurface() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Ambient background - Deep void with subtle glow */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(circle at 50% 0%, #2a2a40 0%, #1a1a2e 40%, #050508 100%)`,
        transform: 'translateZ(-400px) scale(2)',
      }} />
      
      {/* The Desk Slab */}
      <motion.div 
        className="relative"
        style={{
          width: '1200px', 
          height: '800px',
          transformStyle: 'preserve-3d',
          transform: 'translateZ(-100px) rotateX(20deg)', // More dramatic tilt
          transformOrigin: 'center 60%',
        }}
        initial={{ opacity: 0, y: 100, rotateX: 30 }}
        animate={{ opacity: 1, y: 0, rotateX: 20 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Top Surface */}
        <div className="absolute inset-0 rounded-lg overflow-hidden" style={{
          background: `linear-gradient(180deg, ${colors.desk.surface} 0%, ${colors.desk.surfaceDark} 100%)`,
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)', // Inner vignette
        }}>
          {/* Wood Texture */}
          <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            filter: 'contrast(150%) brightness(90%)',
            backgroundSize: '400px 400px',
          }} />
          
          {/* Scratches/Wear (Procedural) */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.05' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '600px 600px',
          }} />

          {/* Lighting Gradient (Lamp glow effect) */}
          <div className="absolute inset-0 mix-blend-soft-light" style={{
            background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)',
          }} />
        </div>

        {/* Front Edge (Thickness) */}
        <div className="absolute bottom-0 left-0 right-0 h-8 origin-bottom" style={{
          background: '#3e2b22', // Very dark wood
          transform: 'rotateX(-90deg)',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
        }} />

        {/* Side Edges (Thickness) */}
        <div className="absolute top-0 bottom-0 left-0 w-4 origin-left" style={{
          background: '#4a332a',
          transform: 'rotateY(-90deg)',
        }} />
        <div className="absolute top-0 bottom-0 right-0 w-4 origin-right" style={{
          background: '#4a332a',
          transform: 'rotateY(90deg)',
        }} />

        {/* Drop Shadow on the "Floor" */}
        <div className="absolute inset-0 rounded-lg" style={{
          transform: 'translateZ(-100px) scale(0.95)',
          background: 'rgba(0,0,0,0.6)',
          filter: 'blur(40px)',
        }} />
      </motion.div>
    </div>
  );
}
