# 🛠️ StudyTogether — Technical Implementation Guide

> Building a 2.5D Depth UI in React Without a Game Engine
> Companion to DESIGN_SYSTEM.md and MANIFESTO.md

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Recommended Stack](#recommended-stack)
3. [The Depth System](#the-depth-system)
4. [Core Components](#core-components)
5. [The Book Implementation](#the-book-implementation)
6. [Animation Patterns](#animation-patterns)
7. [Cursor & Presence System](#cursor--presence-system)
8. [Performance Optimization](#performance-optimization)
9. [Mobile Adaptations](#mobile-adaptations)
10. [When to Use R3F](#when-to-use-r3f)

---

## Architecture Overview

### The Core Insight

You don't need a game engine or WebGL for depth. CSS 3D transforms give you:
- True perspective distortion
- Z-axis positioning (translateZ)
- 3D rotations (rotateX, rotateY)
- Nested 3D spaces (transform-style: preserve-3d)

Combined with Framer Motion's animation system, you get game-quality feel with full HTML/React capabilities.

### Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PERSPECTIVE CONTAINER                        │
│                     perspective: 1200px                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              3D SPACE (preserve-3d)                        │  │
│  │                                                            │  │
│  │   ┌──────────────────────────────────────────────────────┐ │  │
│  │   │ BACKGROUND LAYER (translateZ: -200px)               │ │  │
│  │   │ - Desk surface texture                               │ │  │
│  │   │ - Ambient particles                                  │ │  │
│  │   └──────────────────────────────────────────────────────┘ │  │
│  │                                                            │  │
│  │   ┌──────────────────────────────────────────────────────┐ │  │
│  │   │ OBJECT LAYER (translateZ: 0)                        │ │  │
│  │   │ - Textbook (main interactive element)                │ │  │
│  │   │ - Laptop, Notepad, Poster                            │ │  │
│  │   └──────────────────────────────────────────────────────┘ │  │
│  │                                                            │  │
│  │   ┌──────────────────────────────────────────────────────┐ │  │
│  │   │ FOREGROUND LAYER (translateZ: 50px)                 │ │  │
│  │   │ - Tools tray                                         │ │  │
│  │   │ - Floating UI elements                               │ │  │
│  │   └──────────────────────────────────────────────────────┘ │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ UI OVERLAY (position: fixed, no 3D transforms)            │  │
│  │ - Cursors, tooltips, modals                                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Recommended Stack

### Primary Libraries

| Purpose | Library | Why |
|---------|---------|-----|
| Animation | **Framer Motion** | Best DX, GPU-accelerated, handles 3D transforms beautifully |
| Book flip | **react-pageflip** | Realistic page-turn physics, works with HTML content |
| Gestures | **@use-gesture/react** | Pairs with Framer Motion for drag/pan/pinch |
| State sync | **@robojs/sync** | Already in your stack, useSyncState for cursors |
| Styling | **Tailwind CSS** | Rapid iteration, works great with Framer Motion |

### Installation

```bash
# Core animation
pnpm add framer-motion @use-gesture/react

# Book effect
pnpm add react-pageflip

# Already have via Robo.js
# @robojs/sync
```

### Why Framer Motion over React Spring?

Both are excellent, but for your use case:

| Feature | Framer Motion | React Spring |
|---------|---------------|--------------|
| 3D transforms | ✅ First-class support | ✅ Works, more manual |
| Layout animations | ✅ Built-in | ❌ Not supported |
| Gesture integration | ✅ Built-in | Needs @use-gesture |
| AnimatePresence | ✅ Elegant API | useTransition (more complex) |
| Learning curve | Gentler | Steeper (physics model) |
| Bundle size | ~16kb | ~12kb |

Framer Motion's `motion.div` with 3D transforms just works:

```tsx
<motion.div
  style={{ perspective: 1200 }}
>
  <motion.div
    style={{ transformStyle: "preserve-3d" }}
    animate={{ 
      rotateX: 10, 
      rotateY: isHovered ? 5 : 0,
      translateZ: isHovered ? 20 : 0 
    }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    {/* This div now exists in 3D space */}
  </motion.div>
</motion.div>
```

---

## The Depth System

### CSS 3D Fundamentals

The key properties that create depth:

```css
/* Parent: Establishes the viewing distance */
.perspective-container {
  perspective: 1200px;           /* Distance from viewer to z=0 plane */
  perspective-origin: 50% 50%;   /* Vanishing point */
}

/* Children: Exist in 3D space */
.scene {
  transform-style: preserve-3d;  /* CRITICAL: Children maintain 3D positions */
}

/* Individual elements: Position in Z-space */
.background {
  transform: translateZ(-200px); /* Further from viewer */
}

.foreground {
  transform: translateZ(50px);   /* Closer to viewer */
}
```

### Depth Wrapper Component

```tsx
// components/depth/DepthContainer.tsx
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface DepthContainerProps {
  children: ReactNode;
  perspective?: number;
  enableTilt?: boolean;
  tiltIntensity?: number;
}

export function DepthContainer({ 
  children, 
  perspective = 1200,
  enableTilt = true,
  tiltIntensity = 10
}: DepthContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse position for parallax tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring-based rotation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]), {
    stiffness: 150,
    damping: 20
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]), {
    stiffness: 150,
    damping: 20
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enableTilt || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div 
      ref={containerRef}
      className="depth-container"
      style={{ perspective }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="depth-scene"
        style={{
          transformStyle: "preserve-3d",
          rotateX: enableTilt ? rotateX : 0,
          rotateY: enableTilt ? rotateY : 0,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
```

### Depth Layer Component

```tsx
// components/depth/DepthLayer.tsx
import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface DepthLayerProps extends MotionProps {
  children: ReactNode;
  z?: number;  // translateZ value
  className?: string;
}

export function DepthLayer({ children, z = 0, className, ...motionProps }: DepthLayerProps) {
  return (
    <motion.div
      className={className}
      style={{
        transformStyle: "preserve-3d",
        translateZ: z,
      }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
```

### Usage Example: Desk Scene

```tsx
// components/desk/DeskScene.tsx
import { DepthContainer, DepthLayer } from '../depth';
import { Textbook } from './Textbook';
import { Laptop } from './Laptop';
import { ToolsTray } from './ToolsTray';

export function DeskScene() {
  return (
    <DepthContainer perspective={1200} enableTilt={true} tiltIntensity={5}>
      {/* Background - desk surface */}
      <DepthLayer z={-100} className="absolute inset-0">
        <div className="w-full h-full bg-desk-texture" />
      </DepthLayer>
      
      {/* Middle ground - interactive objects */}
      <DepthLayer z={0} className="relative">
        <Textbook />
        <Laptop />
        <Notepad />
        <EventPoster />
      </DepthLayer>
      
      {/* Foreground - always-visible tools */}
      <DepthLayer z={30} className="absolute right-4 top-1/2 -translate-y-1/2">
        <ToolsTray />
      </DepthLayer>
    </DepthContainer>
  );
}
```

---

## Core Components

### Interactive Desk Object

Every object on the desk (book, laptop, notepad) shares common behaviors:

```tsx
// components/desk/DeskObject.tsx
import { motion, Variants } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface DeskObjectProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  hoverLift?: number;
  hoverScale?: number;
}

const variants: Variants = {
  idle: {
    y: 0,
    scale: 1,
    rotateX: 0,
    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)",
  },
  hover: (custom: { lift: number; scale: number }) => ({
    y: -custom.lift,
    scale: custom.scale,
    rotateX: -5,
    boxShadow: "0 25px 50px -15px rgba(0,0,0,0.4)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }),
  tap: {
    scale: 0.98,
    y: -5,
  }
};

export function DeskObject({ 
  children, 
  onClick, 
  className,
  hoverLift = 15,
  hoverScale = 1.02
}: DeskObjectProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`desk-object cursor-pointer ${className}`}
      style={{ transformStyle: "preserve-3d" }}
      variants={variants}
      initial="idle"
      animate={isHovered ? "hover" : "idle"}
      whileTap="tap"
      custom={{ lift: hoverLift, scale: hoverScale }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
```

### Shadow Component

Dynamic shadows that respond to 3D positioning:

```tsx
// components/depth/DynamicShadow.tsx
import { motion, MotionValue, useTransform } from 'framer-motion';

interface DynamicShadowProps {
  liftAmount: MotionValue<number>;
  className?: string;
}

export function DynamicShadow({ liftAmount, className }: DynamicShadowProps) {
  // Shadow spreads and softens as object lifts
  const blur = useTransform(liftAmount, [0, 30], [10, 40]);
  const spread = useTransform(liftAmount, [0, 30], [-5, -10]);
  const opacity = useTransform(liftAmount, [0, 30], [0.3, 0.15]);
  const offsetY = useTransform(liftAmount, [0, 30], [10, 35]);

  return (
    <motion.div
      className={`absolute inset-0 rounded-lg pointer-events-none ${className}`}
      style={{
        boxShadow: useTransform(
          [blur, spread, opacity, offsetY],
          ([b, s, o, y]) => `0 ${y}px ${b}px ${s}px rgba(0,0,0,${o})`
        )
      }}
    />
  );
}
```

---

## The Book Implementation

The book is the most complex component. We'll use a hybrid approach:
- **react-pageflip** for the page-turning effect when open
- **Framer Motion** for the open/close animation and cover interactions
- **CSS 3D** for the closed book's depth

### Book Structure

```tsx
// components/book/Textbook.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { DeskObject } from '../desk/DeskObject';
import { BookCover } from './BookCover';
import { BookContent } from './BookContent';
import { UserPins } from './UserPins';

interface TextbookProps {
  usersInBook: UserPin[];
  onOpen: () => void;
}

export function Textbook({ usersInBook, onOpen }: TextbookProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const bookRef = useRef(null);

  const handleOpen = async () => {
    setIsOpening(true);
    // Play open animation
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsOpen(true);
    setIsOpening(false);
    onOpen();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="textbook-container relative">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <ClosedBook 
            key="closed"
            usersInBook={usersInBook}
            isOpening={isOpening}
            onOpen={handleOpen}
          />
        ) : (
          <OpenBook 
            key="open"
            bookRef={bookRef}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Closed Book (3D Cover)

```tsx
// components/book/ClosedBook.tsx
import { motion } from 'framer-motion';
import { DeskObject } from '../desk/DeskObject';
import { UserPins } from './UserPins';

interface ClosedBookProps {
  usersInBook: UserPin[];
  isOpening: boolean;
  onOpen: () => void;
}

export function ClosedBook({ usersInBook, isOpening, onOpen }: ClosedBookProps) {
  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.1,
        rotateY: -30,
        transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
      }}
      className="closed-book"
    >
      <DeskObject onClick={onOpen} hoverLift={20}>
        <div 
          className="relative"
          style={{ 
            transformStyle: "preserve-3d",
            transform: "rotateX(10deg)"
          }}
        >
          {/* Book cover (front face) */}
          <div 
            className="book-cover bg-amber-800 rounded-r-lg"
            style={{
              width: 280,
              height: 380,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Cover content */}
            <div className="p-6 text-center">
              <div className="text-white font-bold text-2xl mb-2">W3Schools</div>
              <div className="text-amber-200 text-sm">TUTORIALS</div>
            </div>
            
            {/* User pins */}
            <UserPins users={usersInBook} />
            
            {/* Click to open hint */}
            <motion.div 
              className="absolute bottom-4 left-0 right-0 text-center text-amber-200/70 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Click to open
            </motion.div>
          </div>
          
          {/* Book spine (left side, rotated) */}
          <div 
            className="book-spine absolute left-0 top-0 bg-amber-900 rounded-l-sm"
            style={{
              width: 40,
              height: 380,
              transform: "rotateY(-90deg) translateX(-20px)",
              transformOrigin: "right center",
            }}
          />
          
          {/* Book pages (right side, visible edge) */}
          <div 
            className="book-pages absolute right-0 top-2 bottom-2 bg-amber-50"
            style={{
              width: 35,
              transform: "rotateY(90deg) translateX(17.5px)",
              transformOrigin: "left center",
              backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 2px, #ddd 2px, #ddd 3px)",
            }}
          />
          
          {/* Book bottom (page edges) */}
          <div 
            className="book-bottom absolute bottom-0 left-0 right-0 bg-amber-100"
            style={{
              height: 35,
              transform: "rotateX(90deg) translateY(17.5px)",
              transformOrigin: "bottom center",
            }}
          />
        </div>
      </DeskObject>
    </motion.div>
  );
}
```

### Open Book (with react-pageflip)

```tsx
// components/book/OpenBook.tsx
import { motion } from 'framer-motion';
import { forwardRef, useRef, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';

interface OpenBookProps {
  onClose: () => void;
}

// Page component must use forwardRef for react-pageflip
const Page = forwardRef<HTMLDivElement, { children: React.ReactNode; number: number }>(
  ({ children, number }, ref) => {
    return (
      <div 
        ref={ref} 
        className="book-page bg-amber-50 p-6 shadow-inner"
        style={{
          backgroundImage: "url('/textures/paper-texture.png')",
          backgroundBlendMode: "multiply",
        }}
      >
        <div className="page-content h-full overflow-auto">
          {children}
        </div>
        <div className="page-number absolute bottom-4 right-6 text-amber-400 text-sm">
          {number}
        </div>
      </div>
    );
  }
);

export function OpenBook({ onClose }: OpenBookProps) {
  const flipBookRef = useRef(null);

  const nextPage = useCallback(() => {
    flipBookRef.current?.pageFlip()?.flipNext();
  }, []);

  const prevPage = useCallback(() => {
    flipBookRef.current?.pageFlip()?.flipPrev();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="open-book-container"
    >
      {/* Dimmed background */}
      <motion.div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      
      {/* Book frame */}
      <div 
        className="book-frame relative bg-amber-800 rounded-lg p-4 shadow-2xl"
        style={{ 
          transformStyle: "preserve-3d",
          transform: "perspective(2000px) rotateX(5deg)",
        }}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        >
          ✕
        </button>
        
        {/* Flip book */}
        <HTMLFlipBook
          ref={flipBookRef}
          width={400}
          height={550}
          size="stretch"
          minWidth={300}
          maxWidth={600}
          minHeight={400}
          maxHeight={700}
          drawShadow={true}
          flippingTime={600}
          usePortrait={true}
          showCover={true}
          maxShadowOpacity={0.5}
          className="book-pages-container"
          style={{}}
          startPage={0}
          mobileScrollSupport={true}
        >
          {/* Table of Contents (left page) */}
          <Page number={1}>
            <h2 className="text-xl font-bold mb-4">Table of Contents</h2>
            <nav className="space-y-2">
              <a href="#" className="block text-amber-700 hover:text-amber-900">
                1. HTML Basics
              </a>
              <a href="#" className="block text-amber-700 hover:text-amber-900 pl-4">
                - Headings
              </a>
              <a href="#" className="block text-amber-700 hover:text-amber-900 pl-4">
                - Paragraphs
              </a>
              {/* ... more items */}
            </nav>
          </Page>
          
          {/* Content pages */}
          <Page number={2}>
            <h1 className="text-2xl font-bold mb-4">HTML Headings</h1>
            <p className="mb-4">
              Headings are defined with the &lt;h1&gt; to &lt;h6&gt; tags.
            </p>
            {/* W3Schools content rendered here */}
          </Page>
          
          {/* More pages... */}
        </HTMLFlipBook>
        
        {/* Navigation */}
        <div className="flex justify-between mt-4 px-4">
          <button 
            onClick={prevPage}
            className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600"
          >
            ◀ Previous
          </button>
          <button 
            onClick={nextPage}
            className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600"
          >
            Next ▶
          </button>
        </div>
      </div>
    </motion.div>
  );
}
```

---

## Animation Patterns

### Standard Timing Tokens

```tsx
// lib/animation.ts
export const timings = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  dramatic: 0.8,
};

export const easings = {
  // Standard easings
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  // Bouncy for playful interactions
  bounce: [0.34, 1.56, 0.64, 1],
  // Gentle spring-like
  spring: [0.175, 0.885, 0.32, 1.275],
} as const;

export const springs = {
  // Snappy, responsive
  snappy: { type: "spring", stiffness: 400, damping: 30 },
  // Gentle, flowing
  gentle: { type: "spring", stiffness: 200, damping: 20 },
  // Bouncy, playful
  bouncy: { type: "spring", stiffness: 300, damping: 15 },
  // Heavy, deliberate
  heavy: { type: "spring", stiffness: 100, damping: 20 },
} as const;
```

### Reusable Variants

```tsx
// lib/variants.ts
import { Variants } from 'framer-motion';

// Fade in from various directions
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// Scale with depth
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9, z: -50 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    z: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 } 
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

// Stagger children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Desk object hover states
export const deskObject: Variants = {
  idle: {
    y: 0,
    scale: 1,
    rotateX: 0,
    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.2))",
  },
  hover: {
    y: -15,
    scale: 1.03,
    rotateX: -5,
    filter: "drop-shadow(0 25px 40px rgba(0,0,0,0.3))",
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
  tap: {
    scale: 0.98,
    y: -5,
    transition: { duration: 0.1 },
  },
};
```

### Sound Integration Pattern

```tsx
// hooks/useSound.ts
import { useCallback, useRef } from 'react';

const sounds = {
  bookOpen: '/sounds/book-open.mp3',
  bookClose: '/sounds/book-close.mp3',
  pageFlip: '/sounds/page-flip.mp3',
  click: '/sounds/click.mp3',
  hover: '/sounds/hover.mp3',
  success: '/sounds/success.mp3',
  userJoin: '/sounds/user-join.mp3',
  userLeave: '/sounds/user-leave.mp3',
} as const;

type SoundName = keyof typeof sounds;

export function useSound() {
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());
  const isMuted = useRef(false);
  const volume = useRef(0.5);

  const preload = useCallback((soundNames: SoundName[]) => {
    soundNames.forEach(name => {
      if (!audioCache.current.has(name)) {
        const audio = new Audio(sounds[name]);
        audio.preload = 'auto';
        audioCache.current.set(name, audio);
      }
    });
  }, []);

  const play = useCallback((name: SoundName) => {
    if (isMuted.current) return;
    
    let audio = audioCache.current.get(name);
    if (!audio) {
      audio = new Audio(sounds[name]);
      audioCache.current.set(name, audio);
    }
    
    // Clone for overlapping sounds
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = volume.current;
    clone.play().catch(() => {}); // Ignore autoplay errors
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    isMuted.current = muted;
  }, []);

  const setVolume = useCallback((vol: number) => {
    volume.current = Math.max(0, Math.min(1, vol));
  }, []);

  return { play, preload, setMuted, setVolume };
}
```

---

## Cursor & Presence System

### Cursor Sync with Robo.js

```tsx
// hooks/useCursorSync.ts
import { useSyncState } from '@robojs/sync';
import { useCallback, useEffect, useRef } from 'react';
import { useDiscordSdk } from './useDiscordSdk';

interface CursorData {
  odId: string;
  position: { x: number; y: number };
  context: 'desk' | 'book' | 'sandbox' | 'quiz';
  state: 'active' | 'idle' | 'stuck' | 'focused';
  lastUpdate: number;
}

export function useCursorSync() {
  const { user } = useDiscordSdk();
  const [cursors, setCursors] = useSyncState<Record<string, CursorData>>('cursors', {});
  const lastBroadcast = useRef(0);
  const THROTTLE_MS = 33; // ~30fps

  const updateCursor = useCallback((position: { x: number; y: number }, context: CursorData['context']) => {
    const now = Date.now();
    if (now - lastBroadcast.current < THROTTLE_MS) return;
    lastBroadcast.current = now;

    setCursors(prev => ({
      ...prev,
      [user.id]: {
        odId: user.id,
        position,
        context,
        state: 'active',
        lastUpdate: now,
      }
    }));
  }, [user.id, setCursors]);

  const setStuck = useCallback((stuck: boolean) => {
    setCursors(prev => ({
      ...prev,
      [user.id]: {
        ...prev[user.id],
        state: stuck ? 'stuck' : 'active',
        lastUpdate: Date.now(),
      }
    }));
  }, [user.id, setCursors]);

  // Remove stale cursors
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const STALE_THRESHOLD = 30000; // 30 seconds
      
      setCursors(prev => {
        const updated = { ...prev };
        let changed = false;
        
        Object.entries(updated).forEach(([id, cursor]) => {
          if (now - cursor.lastUpdate > STALE_THRESHOLD) {
            delete updated[id];
            changed = true;
          }
        });
        
        return changed ? updated : prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [setCursors]);

  return {
    cursors,
    updateCursor,
    setStuck,
    myId: user.id,
  };
}
```

### Cursor Component (with interpolation)

```tsx
// components/presence/Cursor.tsx
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface CursorProps {
  userId: string;
  avatarUrl: string;
  displayName: string;
  position: { x: number; y: number };
  state: 'active' | 'idle' | 'stuck' | 'focused';
  isSpeaking: boolean;
  showName: boolean;
}

export function Cursor({ 
  userId, 
  avatarUrl, 
  displayName, 
  position, 
  state, 
  isSpeaking,
  showName 
}: CursorProps) {
  // Smooth interpolation for remote cursor positions
  const springConfig = { stiffness: 300, damping: 30 };
  const x = useSpring(position.x, springConfig);
  const y = useSpring(position.y, springConfig);

  // Update spring targets when position changes
  useEffect(() => {
    x.set(position.x);
    y.set(position.y);
  }, [position.x, position.y, x, y]);

  // Opacity based on state
  const opacity = state === 'idle' ? 0.5 : 1;

  return (
    <motion.div
      className="cursor-container fixed pointer-events-none z-50"
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
    >
      {/* Avatar circle */}
      <div className="relative">
        <motion.div
          className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-lg"
          animate={{
            boxShadow: isSpeaking 
              ? ["0 0 0 0 rgba(34,197,94,0.7)", "0 0 0 8px rgba(34,197,94,0)"]
              : "0 4px 6px rgba(0,0,0,0.1)",
          }}
          transition={{
            repeat: isSpeaking ? Infinity : 0,
            duration: 1,
          }}
        >
          <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
        </motion.div>
        
        {/* Stuck indicator */}
        {state === 'stuck' && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            ?
          </motion.div>
        )}
        
        {/* Focus mode indicator */}
        {state === 'focused' && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-xs"
          >
            🍅
          </motion.div>
        )}
      </div>
      
      {/* Name label */}
      {showName && (
        <motion.div
          className="absolute left-10 top-1/2 -translate-y-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {displayName}
        </motion.div>
      )}
      
      {/* Pointer tail */}
      <svg 
        className="absolute -bottom-1 left-3 w-3 h-3" 
        viewBox="0 0 12 12"
      >
        <path d="M6 12L0 0L12 6L6 12Z" fill="white" />
      </svg>
    </motion.div>
  );
}
```

### Book Pin Component (when cursor is in different context)

```tsx
// components/presence/BookPin.tsx
import { motion } from 'framer-motion';

interface BookPinProps {
  avatarUrl: string;
  displayName: string;
  position: { x: number; y: number }; // Position on book cover
}

export function BookPin({ avatarUrl, displayName, position }: BookPinProps) {
  return (
    <motion.div
      className="book-pin absolute"
      style={{ left: position.x, top: position.y }}
      initial={{ scale: 0, y: -20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0, y: -10 }}
      whileHover={{ scale: 1.1 }}
    >
      {/* Pin needle */}
      <div className="w-0.5 h-3 bg-red-500 mx-auto" />
      
      {/* Pin head (avatar) */}
      <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-white shadow-md -mt-1">
        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
      </div>
      
      {/* Tooltip on hover */}
      <motion.div
        className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 pointer-events-none"
        whileHover={{ opacity: 1 }}
      >
        {displayName} is reading
      </motion.div>
    </motion.div>
  );
}
```

---

## Performance Optimization

### Key Principles

1. **Use transforms, not layout properties**
   ```tsx
   // ❌ Bad - triggers layout
   animate={{ left: 100, top: 50 }}
   
   // ✅ Good - GPU accelerated
   animate={{ x: 100, y: 50 }}
   ```

2. **Avoid animating shadows directly**
   ```tsx
   // ❌ Bad - expensive repaint
   animate={{ boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
   
   // ✅ Good - use pseudo-element with opacity
   // Animate opacity of a pre-rendered shadow layer
   ```

3. **Throttle cursor updates**
   ```tsx
   // Limit to 30fps for network
   const THROTTLE_MS = 33;
   ```

4. **Use `layoutId` sparingly**
   ```tsx
   // Only for true shared element transitions
   // Each layoutId adds measurement overhead
   ```

5. **Lazy load heavy components**
   ```tsx
   const OpenBook = lazy(() => import('./OpenBook'));
   ```

### Will-Change Hint

```tsx
// Apply will-change right before animation, remove after
const [isAnimating, setIsAnimating] = useState(false);

<motion.div
  style={{ willChange: isAnimating ? 'transform' : 'auto' }}
  onAnimationStart={() => setIsAnimating(true)}
  onAnimationComplete={() => setIsAnimating(false)}
/>
```

### Reduce Motion Support

```tsx
// hooks/useReducedMotion.ts
import { useReducedMotion } from 'framer-motion';

export function useAnimationConfig() {
  const shouldReduceMotion = useReducedMotion();
  
  return {
    // Disable springs for reduced motion
    transition: shouldReduceMotion 
      ? { duration: 0 }
      : { type: "spring", stiffness: 300, damping: 25 },
    
    // Skip complex animations
    skipParallax: shouldReduceMotion,
    skipParticles: shouldReduceMotion,
  };
}
```

---

## Mobile Adaptations

### Touch-Friendly Cursor Indicators

On mobile, we don't have persistent cursors. Instead, show tap indicators:

```tsx
// components/presence/TapIndicator.tsx
import { motion, AnimatePresence } from 'framer-motion';

interface TapIndicatorProps {
  position: { x: number; y: number } | null;
  avatarUrl: string;
}

export function TapIndicator({ position, avatarUrl }: TapIndicatorProps) {
  return (
    <AnimatePresence>
      {position && (
        <motion.div
          className="tap-indicator fixed pointer-events-none z-50"
          style={{ left: position.x, top: position.y }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 rounded-full border-4 border-white/50" />
          <div className="absolute inset-1 rounded-full overflow-hidden">
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Responsive Depth

Reduce 3D intensity on mobile:

```tsx
// hooks/useResponsiveDepth.ts
import { useMediaQuery } from './useMediaQuery';

export function useResponsiveDepth() {
  const isMobile = useMediaQuery('(max-width: 480px)');
  const isTablet = useMediaQuery('(max-width: 768px)');
  
  return {
    perspective: isMobile ? 800 : isTablet ? 1000 : 1200,
    tiltIntensity: isMobile ? 3 : isTablet ? 5 : 10,
    enableParallax: !isMobile,
    enableParticles: !isMobile && !isTablet,
  };
}
```

### Gesture Handling

```tsx
// components/book/MobileBookGestures.tsx
import { useDrag } from '@use-gesture/react';
import { useSpring, animated } from '@react-spring/web';

export function MobileBookGestures({ onSwipeLeft, onSwipeRight, children }) {
  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  const bind = useDrag(({ down, movement: [mx], direction: [dx], velocity: [vx] }) => {
    const trigger = vx > 0.2;
    
    if (!down && trigger) {
      if (dx > 0) onSwipeRight();
      else onSwipeLeft();
    }
    
    api.start({
      x: down ? mx : 0,
      immediate: down,
    });
  });

  return (
    <animated.div {...bind()} style={{ x, touchAction: 'pan-y' }}>
      {children}
    </animated.div>
  );
}
```

---

## When to Use R3F (React Three Fiber)

For most of the app, CSS 3D + Framer Motion is sufficient. However, consider React Three Fiber for:

### 1. The Interview Event (Game Engine Feel)

```tsx
// components/events/InterviewScene.tsx
import { Canvas } from '@react-three/fiber';
import { Html, Environment, PresentationControls } from '@react-three/drei';

export function InterviewScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <Environment preset="office" />
      <PresentationControls
        global
        rotation={[0.13, 0.1, 0]}
        polar={[-0.4, 0.2]}
        azimuth={[-0.4, 0.4]}
      >
        {/* 3D Desk model */}
        <InterviewDesk />
        
        {/* HTML embedded in 3D space */}
        <Html
          transform
          position={[0, 1, 0.1]}
          className="interview-ui"
        >
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2>Interview Question</h2>
            <p>What is the difference between == and ===?</p>
          </div>
        </Html>
      </PresentationControls>
    </Canvas>
  );
}
```

### 2. Complex 3D Object Interactions

If you need objects that truly rotate in 3D space with lighting:

```tsx
import { useGLTF } from '@react-three/drei';

function TextbookModel() {
  const { scene } = useGLTF('/models/textbook.gltf');
  return <primitive object={scene} />;
}
```

### 3. Particle Systems

For ambient particles that need to feel truly 3D:

```tsx
import { Points, PointMaterial } from '@react-three/drei';

function DustParticles() {
  // Create random 3D positions
  const positions = useMemo(() => {
    const pos = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  return (
    <Points positions={positions}>
      <PointMaterial size={0.02} color="#fff" transparent opacity={0.3} />
    </Points>
  );
}
```

### Decision Matrix

| Need | Use CSS 3D | Use R3F |
|------|------------|---------|
| Layered depth effect | ✅ | Overkill |
| Object hover/lift | ✅ | Overkill |
| Page flip animation | ✅ (react-pageflip) | Overkill |
| Parallax tilt | ✅ | Overkill |
| 3D model with lighting | ❌ | ✅ |
| True camera movement | ❌ | ✅ |
| Complex particle systems | ❌ | ✅ |
| Mixed HTML + 3D scene | Possible | ✅ (drei Html) |

---

## File Structure Summary

```
src/
├── components/
│   ├── depth/
│   │   ├── DepthContainer.tsx
│   │   ├── DepthLayer.tsx
│   │   └── DynamicShadow.tsx
│   ├── desk/
│   │   ├── DeskScene.tsx
│   │   ├── DeskObject.tsx
│   │   ├── Laptop.tsx
│   │   ├── Notepad.tsx
│   │   └── EventPoster.tsx
│   ├── book/
│   │   ├── Textbook.tsx
│   │   ├── ClosedBook.tsx
│   │   ├── OpenBook.tsx
│   │   └── UserPins.tsx
│   ├── presence/
│   │   ├── Cursor.tsx
│   │   ├── BookPin.tsx
│   │   ├── TapIndicator.tsx
│   │   └── ParticipantBar.tsx
│   └── events/
│       └── InterviewScene.tsx (R3F)
├── hooks/
│   ├── useCursorSync.ts
│   ├── useSound.ts
│   ├── useReducedMotion.ts
│   └── useResponsiveDepth.ts
├── lib/
│   ├── animation.ts (timing tokens, springs)
│   └── variants.ts (reusable Framer variants)
└── styles/
    └── textures.css
```

---

## Summary: The Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Animation | Framer Motion | All animations, 3D transforms |
| Depth | CSS 3D (perspective, preserve-3d) | Layer positioning, parallax |
| Book | react-pageflip | Page turn effect |
| Gestures | @use-gesture/react | Mobile swipes, drag |
| State sync | @robojs/sync | Cursor, presence sync |
| 3D (optional) | React Three Fiber | Interview event, special effects |

This gives you game-quality depth and feel while keeping full HTML/React capabilities for your content. No WebGL required for 95% of the app!

---

*Build incrementally: Start with DepthContainer + DeskObject, then add the book, then cursors.*

🎮 Make it feel like a game. Keep it as simple as HTML.
