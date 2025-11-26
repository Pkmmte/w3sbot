# 🏗️ Implementation Plan: StudyTogether Homepage Foundation

> Phase 1 Implementation Guide for AI Coding Agents
> Reference: CLAUDE.md, DESIGN_SYSTEM.md, IMPLEMENTATION_GUIDE.md

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [Sub-Phase 1.1: Depth System](#sub-phase-11-depth-system)
5. [Sub-Phase 1.2: Desk Environment](#sub-phase-12-desk-environment)
6. [Sub-Phase 1.3: The Textbook (Closed State)](#sub-phase-13-the-textbook-closed-state)
7. [Sub-Phase 1.4: Secondary Desk Objects](#sub-phase-14-secondary-desk-objects)
8. [Sub-Phase 1.5: Presence System](#sub-phase-15-presence-system)
9. [Sub-Phase 1.6: Participant Bar](#sub-phase-16-participant-bar)
10. [Sub-Phase 1.7: Responsive Adaptation](#sub-phase-17-responsive-adaptation)
11. [Sub-Phase 1.8: Sound Foundation](#sub-phase-18-sound-foundation)
12. [Testing Checklist](#testing-checklist)
13. [File Manifest](#file-manifest)

---

## Overview

### Goal

Transform the blank `<DiscordActivity>` component into a fully functional "study space" homepage—a 2.5D desk environment with interactive objects, real-time presence, and the foundation for all future features.

### End State Visual

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ░░░░░░░░░░░░░░░░░░░░ AMBIENT BACKGROUND ░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                                         │
│   ┌───────────────────────────────────────────────────────────────────┐ │
│   │                                                                   │ │
│   │                        DESK SURFACE                               │ │
│   │                   (wood texture, depth layer -100)                │ │
│   │                                                                   │ │
│   │   ┌───────────┐   ┌─────────────────────────┐   ┌─────────────┐   │ │
│   │   │   EVENT   │   │                         │   │   TOOLS     │   │ │
│   │   │   POSTER  │   │       TEXTBOOK          │   │   ┌───────┐ │   │ │
│   │   │           │   │      ┌───────────┐      │   │   │ 25:00 │ │   │ │
│   │   │   🏆      │   │      │ W3Schools │      │   │   │ START │ │   │ │
│   │   │  Weekly   │   │      │   📚      │      │   │   └───────┘ │   │ │
│   │   │ Challenge │   │      └───────────┘      │   │   ┌───────┐ │   │ │
│   │   │           │   │                         │   │   │  📝   │ │   │ │
│   │   │  [Join]   │   │   📌 Alice  📌 Ben      │   │   │ Notes │ │   │ │
│   │   │           │   │                         │   │   └───────┘ │   │ │
│   │   └───────────┘   │    [Click to Open]      │   │   ┌───────┐ │   │ │
│   │                   │                         │   │   │   ?   │ │   │ │
│   │                   └─────────────────────────┘   │   │ Help  │ │   │ │
│   │   ┌───────────┐   ┌───────────┐                 │   └───────┘ │   │ │
│   │   │    </>    │   │    ?!     │                 └─────────────┘   │ │
│   │   │  SANDBOX  │   │   QUIZ    │                                   │ │
│   │   │  Laptop   │   │  Notepad  │          🔵 ← Your cursor         │ │
│   │   └───────────┘   └───────────┘          🟣 ← Alice's cursor      │ │
│   │                                                                   │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│   ┌───────────────────────────────────────────────────────────────────┐ │
│   │  🔵 You  🟣 Alice  🟢 Ben  ⚫ Carol (idle)      [  ?  ] [  ✓  ]   │ │
│   │                                         "I'm Stuck"  "Got It"     │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### What We're NOT Building Yet

- Book open state / content viewer (Phase 1 continued)
- Sandbox / Code editor (Phase 2)
- Quiz system (Phase 3)
- Events / Challenges (Phase 4)
- Pomodoro timer logic (Phase 3, but we build the UI shell)

---

## Prerequisites

### Assumed Existing Structure

```
app/
├── activity/
│   ├── page.tsx              # Entry point with <DiscordActivity />
│   ├── layout.tsx            # Providers already set up
│   ├── CLAUDE.md             # Agent reference (exists)
│   ├── MANIFESTO.md          # (exists)
│   ├── DESIGN_SYSTEM.md      # (exists)
│   └── IMPLEMENTATION_GUIDE.md  # (exists)
```

### Assumed Provider Setup

```tsx
// layout.tsx (already exists)
export default function ActivityLayout({ children }) {
  return (
    <RoboSyncProvider>
      <DiscordSdkProvider>
        {children}
      </DiscordSdkProvider>
    </RoboSyncProvider>
  );
}
```

### Required Packages

Verify these are installed:

```bash
pnpm add framer-motion @use-gesture/react
```

### Design Tokens

Create these first (or verify they exist):

```tsx
// app/activity/lib/tokens.ts

export const colors = {
  desk: {
    surface: '#8B7355',      // Warm wood
    surfaceDark: '#6B5344',  // Darker wood grain
    shadow: 'rgba(0,0,0,0.3)',
  },
  book: {
    cover: '#8B4513',        // Saddle brown
    coverDark: '#6B3410',    // Darker brown
    spine: '#5D2E0C',        // Dark spine
    pages: '#FAF0E6',        // Linen (page edges)
    title: '#FFD700',        // Gold text
  },
  ui: {
    primary: '#3B82F6',      // Blue
    success: '#22C55E',      // Green
    warning: '#F59E0B',      // Amber
    idle: '#6B7280',         // Gray
    focus: '#8B5CF6',        // Purple
  },
  ambient: {
    background: '#1a1a2e',   // Deep navy
    glow: 'rgba(59,130,246,0.1)',
  },
};

export const depth = {
  background: -100,
  desk: -50,
  objects: 0,
  objectsHover: 20,
  foreground: 30,
  ui: 50,
};

export const timing = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  dramatic: 0.8,
};

export const springs = {
  snappy: { type: "spring" as const, stiffness: 400, damping: 30 },
  gentle: { type: "spring" as const, stiffness: 200, damping: 20 },
  bouncy: { type: "spring" as const, stiffness: 300, damping: 15 },
};
```

---

## Architecture

### Component Hierarchy

```
<DiscordActivity>
└── <StudySpace>                    # Main container
    ├── <DepthContainer>            # 3D perspective wrapper
    │   ├── <DepthLayer z={-100}>   # Background
    │   │   └── <DeskSurface />
    │   │
    │   ├── <DepthLayer z={0}>      # Objects
    │   │   ├── <EventPoster />
    │   │   ├── <Textbook />        # Central, largest
    │   │   ├── <SandboxLaptop />
    │   │   └── <QuizNotepad />
    │   │
    │   └── <DepthLayer z={30}>     # Foreground
    │       └── <ToolsTray />
    │
    ├── <CursorLayer />             # Fixed position, renders all cursors
    │
    └── <ParticipantBar />          # Fixed bottom bar
```

### State Architecture

```tsx
// Global state (synced across ALL activity participants)
useSyncState('userLocations', {}, [])  // Where everyone is

// Scoped state (synced with people in same view)
useSyncState('cursors', {}, [currentView])  // Cursor positions

// Local state (not synced)
useState()  // UI state like hover, animation states
```

### File Structure (End State)

```
app/activity/
├── page.tsx                      # Entry: <StudySpace />
├── components/
│   ├── StudySpace.tsx            # Main orchestrator
│   ├── depth/
│   │   ├── DepthContainer.tsx    # Perspective + tilt
│   │   ├── DepthLayer.tsx        # Z-positioned wrapper
│   │   └── index.ts              # Barrel export
│   ├── desk/
│   │   ├── DeskSurface.tsx       # Background texture
│   │   ├── DeskObject.tsx        # Base interactive object
│   │   ├── Textbook.tsx          # The book
│   │   ├── SandboxLaptop.tsx     # Code sandbox entry
│   │   ├── QuizNotepad.tsx       # Quiz entry
│   │   ├── EventPoster.tsx       # Weekly events
│   │   ├── ToolsTray.tsx         # Timer, notes, help
│   │   └── index.ts
│   ├── presence/
│   │   ├── Cursor.tsx            # Single remote cursor
│   │   ├── CursorLayer.tsx       # All cursors container
│   │   ├── BookPin.tsx           # Pin on closed book
│   │   ├── ParticipantBar.tsx    # Bottom user list
│   │   └── index.ts
│   └── ui/
│       ├── ActionButton.tsx      # "I'm Stuck" / "Got It"
│       └── index.ts
├── hooks/
│   ├── useCursorSync.ts          # Cursor state management
│   ├── useUserLocation.ts        # Track where users are
│   ├── useSound.ts               # Audio playback
│   ├── useResponsiveDepth.ts     # Adjust depth for device
│   └── useDiscordUser.ts         # Get current user info
├── lib/
│   ├── tokens.ts                 # Design tokens
│   ├── variants.ts               # Framer Motion variants
│   └── types.ts                  # TypeScript types
└── assets/
    ├── textures/
    │   └── wood-grain.png        # Desk texture (optional)
    └── sounds/
        ├── hover.mp3
        ├── click.mp3
        └── whoosh.mp3
```

---

## Sub-Phase 1.1: Depth System

### Goal

Create the foundational 3D perspective system that all visual elements will live within.

### Tasks

#### 1.1.1 Create Type Definitions

```tsx
// app/activity/lib/types.ts

import { MotionValue } from 'framer-motion';

export interface Position {
  x: number;
  y: number;
}

export interface CursorData {
odId: string;
  avatarUrl: string;
  displayName: string;
  position: Position;
  context: 'desk' | 'book' | 'sandbox' | 'quiz';
  state: 'active' | 'idle' | 'stuck' | 'focused';
  lastUpdate: number;
}

export interface UserLocation {
  odId: string;
  view: 'desk' | 'book' | 'sandbox' | 'quiz';
  lessonId?: string;
  lastUpdate: number;
}

export type ViewContext = 'desk' | 'book' | 'sandbox' | 'quiz';
```

#### 1.1.2 Create DepthContainer Component

```tsx
// app/activity/components/depth/DepthContainer.tsx

'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, useRef, useCallback } from 'react';
import { useResponsiveDepth } from '../../hooks/useResponsiveDepth';

interface DepthContainerProps {
  children: ReactNode;
  className?: string;
  enableTilt?: boolean;
}

export function DepthContainer({ 
  children, 
  className = '',
  enableTilt = true,
}: DepthContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { perspective, tiltIntensity } = useResponsiveDepth();
  
  // Mouse position for parallax tilt (normalized -0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring-based rotation
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]), 
    { stiffness: 150, damping: 20 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]), 
    { stiffness: 150, damping: 20 }
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!enableTilt || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  }, [enableTilt, mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div 
      ref={containerRef}
      className={`depth-container w-full h-full overflow-hidden ${className}`}
      style={{ perspective }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="depth-scene w-full h-full"
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

#### 1.1.3 Create DepthLayer Component

```tsx
// app/activity/components/depth/DepthLayer.tsx

'use client';

import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface DepthLayerProps extends MotionProps {
  children: ReactNode;
  z?: number;
  className?: string;
}

export function DepthLayer({ 
  children, 
  z = 0, 
  className = '',
  ...motionProps 
}: DepthLayerProps) {
  return (
    <motion.div
      className={`depth-layer ${className}`}
      style={{
        transformStyle: "preserve-3d",
        transform: `translateZ(${z}px)`,
      }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
```

#### 1.1.4 Create useResponsiveDepth Hook

```tsx
// app/activity/hooks/useResponsiveDepth.ts

'use client';

import { useEffect, useState } from 'react';

interface DepthConfig {
  perspective: number;
  tiltIntensity: number;
  enableParallax: boolean;
  enableParticles: boolean;
}

export function useResponsiveDepth(): DepthConfig {
  const [config, setConfig] = useState<DepthConfig>({
    perspective: 1200,
    tiltIntensity: 8,
    enableParallax: true,
    enableParticles: true,
  });

  useEffect(() => {
    const updateConfig = () => {
      const width = window.innerWidth;
      
      if (width <= 480) {
        // Mobile
        setConfig({
          perspective: 800,
          tiltIntensity: 0, // Disable tilt on mobile
          enableParallax: false,
          enableParticles: false,
        });
      } else if (width <= 768) {
        // Tablet
        setConfig({
          perspective: 1000,
          tiltIntensity: 5,
          enableParallax: true,
          enableParticles: false,
        });
      } else {
        // Desktop
        setConfig({
          perspective: 1200,
          tiltIntensity: 8,
          enableParallax: true,
          enableParticles: true,
        });
      }
    };

    updateConfig();
    window.addEventListener('resize', updateConfig);
    return () => window.removeEventListener('resize', updateConfig);
  }, []);

  return config;
}
```

#### 1.1.5 Create Barrel Export

```tsx
// app/activity/components/depth/index.ts

export { DepthContainer } from './DepthContainer';
export { DepthLayer } from './DepthLayer';
```

### Acceptance Criteria

- [ ] `<DepthContainer>` renders with perspective
- [ ] Mouse movement causes subtle 3D tilt (desktop only)
- [ ] Tilt is disabled on mobile
- [ ] Children can be positioned at different Z depths
- [ ] No visible jank or performance issues

---

## Sub-Phase 1.2: Desk Environment

### Goal

Create the desk surface background with appropriate texturing and lighting effects.

### Visual Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ╔═══════════════════════════════════════════════════════════╗ │
│   ║                                                           ║ │
│   ║              DESK SURFACE (z: -100)                       ║ │
│   ║                                                           ║ │
│   ║   • Wood grain texture (subtle)                          ║ │
│   ║   • Warm lighting from above                              ║ │
│   ║   • Soft vignette at edges                                ║ │
│   ║   • Objects cast shadows DOWN onto this                   ║ │
│   ║                                                           ║ │
│   ╚═══════════════════════════════════════════════════════════╝ │
│                                                                 │
│   Background gradient behind desk (z: -200)                     │
│   Deep navy → slightly lighter                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tasks

#### 1.2.1 Create DeskSurface Component

```tsx
// app/activity/components/desk/DeskSurface.tsx

'use client';

import { motion } from 'framer-motion';
import { colors } from '../../lib/tokens';

export function DeskSurface() {
  return (
    <div className="desk-surface absolute inset-0 flex items-center justify-center">
      {/* Ambient background (furthest back) */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${colors.ambient.background} 0%, #0f0f1a 100%)`,
          transform: 'translateZ(-200px)',
        }}
      />
      
      {/* Desk surface */}
      <motion.div 
        className="desk-top relative rounded-2xl"
        style={{
          width: '90%',
          maxWidth: '1200px',
          height: '80%',
          maxHeight: '700px',
          background: `linear-gradient(145deg, ${colors.desk.surface} 0%, ${colors.desk.surfaceDark} 100%)`,
          boxShadow: `
            0 50px 100px -20px rgba(0,0,0,0.5),
            0 30px 60px -30px rgba(0,0,0,0.4),
            inset 0 2px 4px rgba(255,255,255,0.1),
            inset 0 -2px 4px rgba(0,0,0,0.2)
          `,
          transform: 'translateZ(-100px) rotateX(5deg)',
          transformOrigin: 'center bottom',
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Wood grain overlay (optional texture) */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />
        
        {/* Vignette */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.3) 100%)',
          }}
        />
        
        {/* Light reflection */}
        <div 
          className="absolute top-0 left-1/4 right-1/4 h-1/3 rounded-2xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 70%)',
          }}
        />
      </motion.div>
    </div>
  );
}
```

#### 1.2.2 Create DeskObject Base Component

This is the foundation for all interactive objects on the desk.

```tsx
// app/activity/components/desk/DeskObject.tsx

'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode, useState, useCallback } from 'react';
import { springs } from '../../lib/tokens';

interface DeskObjectProps {
  children: ReactNode;
  onClick?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  className?: string;
  hoverLift?: number;
  hoverScale?: number;
  disabled?: boolean;
}

export function DeskObject({ 
  children, 
  onClick, 
  onHoverStart,
  onHoverEnd,
  className = '',
  hoverLift = 15,
  hoverScale = 1.02,
  disabled = false,
}: DeskObjectProps) {
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
    idle: {
      y: 0,
      scale: 1,
      rotateX: 0,
      filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.25))",
    },
    hover: {
      y: -hoverLift,
      scale: hoverScale,
      rotateX: -3,
      filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.35))",
      transition: springs.snappy,
    },
    tap: {
      scale: hoverScale * 0.98,
      y: -hoverLift * 0.5,
      transition: { duration: 0.1 },
    },
  };

  return (
    <motion.div
      className={`desk-object ${disabled ? 'cursor-default' : 'cursor-pointer'} ${className}`}
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
```

### Acceptance Criteria

- [ ] Desk surface renders with wood-like appearance
- [ ] Subtle 3D tilt applied to desk (rotateX)
- [ ] Vignette and lighting effects visible
- [ ] Desk is responsive (scales with viewport)
- [ ] DeskObject base component lifts on hover with shadow change

---

## Sub-Phase 1.3: The Textbook (Closed State)

### Goal

Create the central textbook as a 3D CSS object with cover, spine, and page edges.

### Visual Reference

```
                    FRONT VIEW                         SIDE VIEW
                    
              ┌────────────────────┐                    ┌──┐
              │ ╔════════════════╗ │                    │██│ ← Cover
              │ ║                ║ │                    │░░│
              │ ║  ┌──────────┐  ║ │                    │░░│ ← Pages
              │ ║  │ W3Schools│  ║ │                    │░░│
              │ ║  │    📚    │  ║ │                    │░░│
              │ ║  │ TUTORIALS│  ║ │                    │░░│
              │ ║  └──────────┘  ║ │                    │██│ ← Back
              │ ║                ║ │                    └──┘
              │ ║ 📌Alice 📌Ben  ║ │                      ↑
              │ ║                ║ │                    Spine
              │ ║[Click to Open] ║ │
              │ ╚════════════════╝ │
        Spine →│████████████████████│← Pages edge
              └────────────────────┘
                       ↑
                 Shadow on desk
```

### Tasks

#### 1.3.1 Create Textbook Component

```tsx
// app/activity/components/desk/Textbook.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { DeskObject } from './DeskObject';
import { BookPin } from '../presence/BookPin';
import { colors, springs } from '../../lib/tokens';
import { CursorData } from '../../lib/types';
import { useSound } from '../../hooks/useSound';

interface TextbookProps {
  usersInBook: CursorData[];
  onOpen: () => void;
}

export function Textbook({ usersInBook, onOpen }: TextbookProps) {
  const { play } = useSound();

  const handleClick = () => {
    play('click');
    onOpen();
  };

  const handleHoverStart = () => {
    play('hover');
  };

  return (
    <DeskObject 
      onClick={handleClick} 
      onHoverStart={handleHoverStart}
      hoverLift={20} 
      hoverScale={1.03}
      className="textbook-wrapper"
    >
      <div 
        className="textbook relative"
        style={{ 
          transformStyle: "preserve-3d",
          width: 280,
          height: 380,
        }}
      >
        {/* ============ BOOK COVER (FRONT FACE) ============ */}
        <div 
          className="book-cover absolute inset-0 rounded-r-lg overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colors.book.cover} 0%, ${colors.book.coverDark} 100%)`,
            boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.3)',
            transform: 'translateZ(20px)',
          }}
        >
          {/* Cover texture */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Cover content */}
          <div className="relative h-full flex flex-col items-center justify-center p-6">
            {/* Title block */}
            <div 
              className="text-center p-4 rounded-lg mb-4"
              style={{
                background: 'rgba(0,0,0,0.2)',
                border: `2px solid ${colors.book.title}`,
              }}
            >
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: colors.book.title }}
              >
                W3Schools
              </div>
              <div className="text-3xl mb-2">📚</div>
              <div 
                className="text-sm font-medium tracking-wider"
                style={{ color: colors.book.title }}
              >
                TUTORIALS
              </div>
            </div>
            
            {/* User pins (who's reading) */}
            {usersInBook.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {usersInBook.slice(0, 5).map((user) => (
                  <BookPin 
                    key={user.odId}
                    avatarUrl={user.avatarUrl}
                    displayName={user.displayName}
                  />
                ))}
                {usersInBook.length > 5 && (
                  <div className="text-white/70 text-sm self-center">
                    +{usersInBook.length - 5} more
                  </div>
                )}
              </div>
            )}
            
            {/* Call to action */}
            <motion.div 
              className="text-white/60 text-sm"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              Click to open
            </motion.div>
          </div>
        </div>
        
        {/* ============ BOOK SPINE (LEFT SIDE) ============ */}
        <div 
          className="book-spine absolute top-0 h-full rounded-l-sm"
          style={{
            width: 40,
            left: 0,
            background: `linear-gradient(90deg, ${colors.book.spine} 0%, ${colors.book.coverDark} 100%)`,
            transform: 'rotateY(-90deg) translateZ(0px) translateX(-20px)',
            transformOrigin: 'right center',
            boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.3)',
          }}
        >
          {/* Spine text */}
          <div 
            className="h-full flex items-center justify-center"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              color: colors.book.title,
              fontSize: 12,
              fontWeight: 'bold',
              letterSpacing: 2,
            }}
          >
            W3SCHOOLS
          </div>
        </div>
        
        {/* ============ PAGE EDGES (RIGHT SIDE) ============ */}
        <div 
          className="book-pages absolute top-2 bottom-2"
          style={{
            width: 35,
            right: 0,
            background: `linear-gradient(90deg, ${colors.book.pages} 0%, #E8E0D5 100%)`,
            transform: 'rotateY(90deg) translateZ(17px) translateX(17.5px)',
            transformOrigin: 'left center',
            // Page lines effect
            backgroundImage: `repeating-linear-gradient(
              to bottom,
              transparent,
              transparent 3px,
              rgba(0,0,0,0.05) 3px,
              rgba(0,0,0,0.05) 4px
            )`,
          }}
        />
        
        {/* ============ BOTTOM PAGES ============ */}
        <div 
          className="book-bottom absolute left-0 right-0"
          style={{
            height: 35,
            bottom: 0,
            background: colors.book.pages,
            transform: 'rotateX(90deg) translateZ(17px) translateY(17.5px)',
            transformOrigin: 'bottom center',
          }}
        />
        
        {/* ============ BACK COVER ============ */}
        <div 
          className="book-back absolute inset-0 rounded-r-lg"
          style={{
            background: colors.book.coverDark,
            transform: 'translateZ(-20px)',
          }}
        />
      </div>
    </DeskObject>
  );
}
```

#### 1.3.2 Create BookPin Component

```tsx
// app/activity/components/presence/BookPin.tsx

'use client';

import { motion } from 'framer-motion';

interface BookPinProps {
  avatarUrl: string;
  displayName: string;
  className?: string;
}

export function BookPin({ avatarUrl, displayName, className = '' }: BookPinProps) {
  return (
    <motion.div
      className={`book-pin relative ${className}`}
      initial={{ scale: 0, y: -10 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0, y: -10 }}
      whileHover={{ scale: 1.1 }}
      title={`${displayName} is reading`}
    >
      {/* Pin needle */}
      <div 
        className="w-0.5 h-2 mx-auto rounded-full"
        style={{ background: '#DC2626' }}
      />
      
      {/* Pin head (avatar) */}
      <div 
        className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-md -mt-0.5"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
      >
        <img 
          src={avatarUrl} 
          alt={displayName} 
          className="w-full h-full object-cover"
        />
      </div>
    </motion.div>
  );
}
```

### Acceptance Criteria

- [ ] Book renders as a 3D object with visible depth
- [ ] Cover, spine, page edges, and back all visible
- [ ] Spine has vertical text "W3SCHOOLS"
- [ ] Page edges have subtle line texture
- [ ] User pins appear on cover when others are reading
- [ ] Hover lifts the book with enhanced shadow
- [ ] Click calls `onOpen` callback

---

## Sub-Phase 1.4: Secondary Desk Objects

### Goal

Create the supporting interactive objects: Event Poster, Sandbox Laptop, Quiz Notepad, and Tools Tray.

### Visual Reference

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌───────────┐                                      ┌─────────────┐ │
│  │  EVENT    │                                      │   TOOLS     │ │
│  │  POSTER   │       (textbook in center)           │   ┌───────┐ │ │
│  │           │                                      │   │ 25:00 │ │ │
│  │   🏆      │                                      │   │ START │ │ │
│  │  Weekly   │                                      │   └───────┘ │ │
│  │ Challenge │                                      │   ┌───────┐ │ │
│  │           │                                      │   │  📝   │ │ │
│  │  [Join]   │                                      │   │ Notes │ │ │
│  └───────────┘                                      │   └───────┘ │ │
│                                                     │   ┌───────┐ │ │
│  ┌───────────┐   ┌───────────┐                      │   │   ?   │ │ │
│  │    </>    │   │   ????    │                      │   │ Help  │ │ │
│  │  SANDBOX  │   │   QUIZ    │                      │   └───────┘ │ │
│  │  Laptop   │   │  Notepad  │                      └─────────────┘ │
│  └───────────┘   └───────────┘                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Tasks

#### 1.4.1 Create EventPoster Component

```tsx
// app/activity/components/desk/EventPoster.tsx

'use client';

import { motion } from 'framer-motion';
import { DeskObject } from './DeskObject';
import { colors } from '../../lib/tokens';

interface EventPosterProps {
  eventName?: string;
  eventType?: 'challenge' | 'tournament' | 'special';
  endsIn?: string;
  onJoin?: () => void;
}

export function EventPoster({ 
  eventName = 'Weekly Challenge',
  eventType = 'challenge',
  endsIn = '2d 14h',
  onJoin,
}: EventPosterProps) {
  const icons = {
    challenge: '🏆',
    tournament: '⚔️',
    special: '✨',
  };

  return (
    <DeskObject 
      onClick={onJoin} 
      hoverLift={12}
      disabled={!onJoin}
      className="event-poster"
    >
      <div 
        className="relative rounded-lg overflow-hidden"
        style={{
          width: 140,
          height: 180,
          background: 'linear-gradient(135deg, #1E3A5F 0%, #0F1C2E 100%)',
          border: '2px solid rgba(255,215,0,0.3)',
          boxShadow: 'inset 0 0 20px rgba(255,215,0,0.1)',
        }}
      >
        {/* Decorative corner */}
        <div 
          className="absolute top-0 right-0 w-8 h-8"
          style={{
            background: 'linear-gradient(135deg, transparent 50%, rgba(255,215,0,0.2) 50%)',
          }}
        />
        
        {/* Content */}
        <div className="p-3 h-full flex flex-col items-center justify-between text-center">
          {/* Header */}
          <div 
            className="text-xs font-bold tracking-wider"
            style={{ color: 'rgba(255,215,0,0.8)' }}
          >
            ★ EVENT ★
          </div>
          
          {/* Icon */}
          <div className="text-4xl my-2">
            {icons[eventType]}
          </div>
          
          {/* Title */}
          <div className="text-white font-bold text-sm leading-tight">
            {eventName}
          </div>
          
          {/* Timer */}
          <div className="text-xs text-white/60 mt-1">
            Ends in: {endsIn}
          </div>
          
          {/* Join button (if handler provided) */}
          {onJoin && (
            <motion.div
              className="mt-2 px-4 py-1.5 rounded text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#1a1a2e',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Join
            </motion.div>
          )}
        </div>
        
        {/* "NEW" badge if applicable */}
        <motion.div
          className="absolute -top-1 -right-1 px-2 py-0.5 text-xs font-bold rounded"
          style={{
            background: '#EF4444',
            color: 'white',
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          NEW
        </motion.div>
      </div>
    </DeskObject>
  );
}
```

#### 1.4.2 Create SandboxLaptop Component

```tsx
// app/activity/components/desk/SandboxLaptop.tsx

'use client';

import { motion } from 'framer-motion';
import { DeskObject } from './DeskObject';

interface SandboxLaptopProps {
  onOpen?: () => void;
}

export function SandboxLaptop({ onOpen }: SandboxLaptopProps) {
  return (
    <DeskObject 
      onClick={onOpen}
      hoverLift={10}
      disabled={!onOpen}
      className="sandbox-laptop"
    >
      <div 
        className="relative"
        style={{
          width: 130,
          height: 100,
        }}
      >
        {/* Screen */}
        <div 
          className="absolute top-0 left-0 right-0 rounded-t-lg overflow-hidden"
          style={{
            height: 75,
            background: 'linear-gradient(180deg, #1e1e2e 0%, #2d2d3d 100%)',
            border: '3px solid #3d3d4d',
            borderBottom: 'none',
          }}
        >
          {/* Code preview */}
          <div className="p-2 font-mono text-xs">
            <div style={{ color: '#569CD6' }}>{'<div>'}</div>
            <div className="pl-2" style={{ color: '#CE9178' }}>"Hello"</div>
            <div style={{ color: '#569CD6' }}>{'</div>'}</div>
          </div>
          
          {/* Code icon */}
          <div 
            className="absolute bottom-2 right-2 text-2xl opacity-30"
          >
            {'</>'}
          </div>
        </div>
        
        {/* Base/keyboard */}
        <div 
          className="absolute bottom-0 left-0 right-0 rounded-b-lg"
          style={{
            height: 30,
            background: 'linear-gradient(180deg, #4d4d5d 0%, #3d3d4d 100%)',
            borderRadius: '0 0 8px 8px',
          }}
        >
          {/* Touchpad hint */}
          <div 
            className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded"
            style={{
              width: 30,
              height: 6,
              background: 'rgba(0,0,0,0.3)',
            }}
          />
        </div>
        
        {/* Label */}
        <div 
          className="absolute -bottom-6 left-0 right-0 text-center text-xs text-white/60 font-medium"
        >
          Sandbox
        </div>
      </div>
    </DeskObject>
  );
}
```

#### 1.4.3 Create QuizNotepad Component

```tsx
// app/activity/components/desk/QuizNotepad.tsx

'use client';

import { motion } from 'framer-motion';
import { DeskObject } from './DeskObject';

interface QuizNotepadProps {
  onOpen?: () => void;
}

export function QuizNotepad({ onOpen }: QuizNotepadProps) {
  return (
    <DeskObject 
      onClick={onOpen}
      hoverLift={10}
      disabled={!onOpen}
      className="quiz-notepad"
    >
      <div 
        className="relative"
        style={{
          width: 110,
          height: 140,
        }}
      >
        {/* Spiral binding */}
        <div className="absolute top-0 left-0 right-0 flex justify-around px-2 z-10">
          {[...Array(7)].map((_, i) => (
            <div 
              key={i}
              className="w-2 h-3 rounded-full"
              style={{ 
                background: 'linear-gradient(180deg, #666 0%, #444 100%)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            />
          ))}
        </div>
        
        {/* Notepad pages */}
        <div 
          className="absolute top-3 left-0 right-0 bottom-0 rounded-b-lg overflow-hidden"
          style={{
            background: '#FFF9E6',
            boxShadow: `
              2px 2px 0 #F5EED6,
              4px 4px 0 #EBE3C6,
              6px 6px 10px rgba(0,0,0,0.2)
            `,
          }}
        >
          {/* Lines */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                transparent,
                transparent 20px,
                #E0D6C6 20px,
                #E0D6C6 21px
              )`,
              backgroundPosition: '0 15px',
            }}
          />
          
          {/* Red margin line */}
          <div 
            className="absolute top-0 bottom-0 w-0.5"
            style={{ left: 25, background: '#FFCCCB' }}
          />
          
          {/* Quiz icon */}
          <div className="relative h-full flex flex-col items-center justify-center">
            <div className="text-3xl mb-2">❓</div>
            <div 
              className="text-sm font-bold"
              style={{ color: '#8B4513' }}
            >
              Quiz
            </div>
          </div>
        </div>
        
        {/* Label */}
        <div 
          className="absolute -bottom-6 left-0 right-0 text-center text-xs text-white/60 font-medium"
        >
          Quiz
        </div>
      </div>
    </DeskObject>
  );
}
```

#### 1.4.4 Create ToolsTray Component

```tsx
// app/activity/components/desk/ToolsTray.tsx

'use client';

import { motion } from 'framer-motion';
import { springs } from '../../lib/tokens';

interface ToolsTrayProps {
  onTimerClick?: () => void;
  onNotesClick?: () => void;
  onHelpClick?: () => void;
  timerValue?: string;
  isTimerActive?: boolean;
}

export function ToolsTray({ 
  onTimerClick,
  onNotesClick,
  onHelpClick,
  timerValue = '25:00',
  isTimerActive = false,
}: ToolsTrayProps) {
  return (
    <motion.div 
      className="tools-tray flex flex-col gap-3 p-3 rounded-xl"
      style={{
        background: 'rgba(30, 30, 46, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      }}
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5, ...springs.gentle }}
    >
      {/* Timer Tool */}
      <ToolButton 
        onClick={onTimerClick}
        icon={
          <div className="text-center">
            <div 
              className={`text-sm font-mono font-bold ${isTimerActive ? 'text-purple-400' : 'text-white'}`}
            >
              {timerValue}
            </div>
            <div className="text-[10px] text-white/50 mt-0.5">
              {isTimerActive ? 'FOCUS' : 'START'}
            </div>
          </div>
        }
        label="Timer"
        active={isTimerActive}
      />
      
      {/* Notes Tool */}
      <ToolButton 
        onClick={onNotesClick}
        icon={<span className="text-xl">📝</span>}
        label="Notes"
      />
      
      {/* Help Tool */}
      <ToolButton 
        onClick={onHelpClick}
        icon={<span className="text-xl">❓</span>}
        label="Help"
      />
    </motion.div>
  );
}

interface ToolButtonProps {
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function ToolButton({ onClick, icon, label, active = false }: ToolButtonProps) {
  return (
    <motion.button
      className="tool-button flex flex-col items-center justify-center p-3 rounded-lg transition-colors"
      style={{
        width: 70,
        height: 60,
        background: active 
          ? 'rgba(139, 92, 246, 0.2)' 
          : 'rgba(255,255,255,0.05)',
        border: active 
          ? '1px solid rgba(139, 92, 246, 0.5)' 
          : '1px solid transparent',
      }}
      whileHover={{ 
        background: 'rgba(255,255,255,0.1)',
        scale: 1.05,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {icon}
      <span className="text-[10px] text-white/50 mt-1">{label}</span>
    </motion.button>
  );
}
```

#### 1.4.5 Create Barrel Export for Desk Components

```tsx
// app/activity/components/desk/index.ts

export { DeskSurface } from './DeskSurface';
export { DeskObject } from './DeskObject';
export { Textbook } from './Textbook';
export { EventPoster } from './EventPoster';
export { SandboxLaptop } from './SandboxLaptop';
export { QuizNotepad } from './QuizNotepad';
export { ToolsTray } from './ToolsTray';
```

### Acceptance Criteria

- [ ] EventPoster renders with event info and "NEW" badge
- [ ] SandboxLaptop shows code preview aesthetic
- [ ] QuizNotepad looks like a spiral-bound notepad with lines
- [ ] ToolsTray renders vertically with Timer, Notes, Help
- [ ] All objects lift on hover
- [ ] Objects are disabled (no hover effect) when no onClick provided

---

## Sub-Phase 1.5: Presence System

### Goal

Implement real-time cursor synchronization so users can see each other's cursor positions on the desk.

### Visual Reference

```
Cursor Anatomy:

       ╭─────╮
       │     │   ← Discord avatar (24px circle)
       │ 😊  │
       │     │
       ╰──┬──╯
          │      ← Pointer tail
          ▼

With Name:                    Speaking:                  Stuck:
       ╭─────╮                ╭─────╮                   ╭─────╮
       │ 😊  │ Alice        ◜ │ 😊  │ ◝               │ 😊  │ ?
       ╰──┬──╯              ◟ │     │ ◞               │ ░░░ │
          ▼                   ╰──┬──╯                  ╰──┬──╯
                                ▼                         ▼
                        (pulsing glow)              (amber glow)
```

### Tasks

#### 1.5.1 Create useDiscordUser Hook

```tsx
// app/activity/hooks/useDiscordUser.ts

'use client';

import { useEffect, useState } from 'react';

interface DiscordUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

// This hooks into the Discord SDK provided by the parent layout
export function useDiscordUser(): DiscordUser | null {
  const [user, setUser] = useState<DiscordUser | null>(null);

  useEffect(() => {
    // Access Discord SDK from context/provider
    // This is a placeholder - integrate with your actual Discord SDK setup
    const fetchUser = async () => {
      try {
        // Replace with actual Discord SDK call
        // const sdk = useDiscordSdk();
        // const discordUser = await sdk.commands.authenticate();
        
        // Placeholder for development
        const mockUser: DiscordUser = {
          id: 'dev-user-' + Math.random().toString(36).substr(2, 9),
          username: 'DevUser',
          displayName: 'Developer',
          avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
        };
        
        setUser(mockUser);
      } catch (error) {
        console.error('Failed to get Discord user:', error);
      }
    };

    fetchUser();
  }, []);

  return user;
}
```

#### 1.5.2 Create useCursorSync Hook

```tsx
// app/activity/hooks/useCursorSync.ts

'use client';

import { useSyncState } from '@robojs/sync';
import { useCallback, useEffect, useRef } from 'react';
import { CursorData, ViewContext, Position } from '../lib/types';
import { useDiscordUser } from './useDiscordUser';

const THROTTLE_MS = 33; // ~30fps
const IDLE_TIMEOUT = 30000; // 30 seconds
const STALE_TIMEOUT = 60000; // 60 seconds - remove cursor

interface UseCursorSyncOptions {
  context: ViewContext;
  lessonId?: string;
}

interface UseCursorSyncReturn {
  cursors: Record<string, CursorData>;
  updatePosition: (position: Position) => void;
  setStuck: (stuck: boolean) => void;
  setFocused: (focused: boolean) => void;
  myId: string | null;
}

export function useCursorSync({ context, lessonId }: UseCursorSyncOptions): UseCursorSyncReturn {
  const user = useDiscordUser();
  const lastBroadcast = useRef(0);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Sync scope: only share cursors with users in same context
  const syncScope = lessonId ? [context, lessonId] : [context];
  
  const [cursors, setCursors] = useSyncState<Record<string, CursorData>>(
    'cursors',
    {},
    syncScope
  );

  // Update cursor position (throttled)
  const updatePosition = useCallback((position: Position) => {
    if (!user) return;
    
    const now = Date.now();
    if (now - lastBroadcast.current < THROTTLE_MS) return;
    lastBroadcast.current = now;

    // Reset idle timer
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setCursors(prev => ({
        ...prev,
        [user.id]: {
          ...prev[user.id],
          state: 'idle',
          lastUpdate: Date.now(),
        }
      }));
    }, IDLE_TIMEOUT);

    setCursors(prev => ({
      ...prev,
      [user.id]: {
        ...prev[user.id],
        odId: user.id,
        avatarUrl: user.avatarUrl,
        displayName: user.displayName,
        position,
        context,
        state: prev[user.id]?.state === 'stuck' ? 'stuck' : 'active',
        lastUpdate: now,
      }
    }));
  }, [user, context, setCursors]);

  // Set stuck state
  const setStuck = useCallback((stuck: boolean) => {
    if (!user) return;
    
    setCursors(prev => ({
      ...prev,
      [user.id]: {
        ...prev[user.id],
        state: stuck ? 'stuck' : 'active',
        lastUpdate: Date.now(),
      }
    }));
  }, [user, setCursors]);

  // Set focused state (pomodoro)
  const setFocused = useCallback((focused: boolean) => {
    if (!user) return;
    
    setCursors(prev => ({
      ...prev,
      [user.id]: {
        ...prev[user.id],
        state: focused ? 'focused' : 'active',
        lastUpdate: Date.now(),
      }
    }));
  }, [user, setCursors]);

  // Cleanup stale cursors
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      
      setCursors(prev => {
        const updated = { ...prev };
        let changed = false;
        
        Object.entries(updated).forEach(([id, cursor]) => {
          if (now - cursor.lastUpdate > STALE_TIMEOUT) {
            delete updated[id];
            changed = true;
          }
        });
        
        return changed ? updated : prev;
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(cleanup);
  }, [setCursors]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      
      // Remove self from cursors
      if (user) {
        setCursors(prev => {
          const updated = { ...prev };
          delete updated[user.id];
          return updated;
        });
      }
    };
  }, [user, setCursors]);

  return {
    cursors,
    updatePosition,
    setStuck,
    setFocused,
    myId: user?.id ?? null,
  };
}
```

#### 1.5.3 Create Cursor Component

```tsx
// app/activity/components/presence/Cursor.tsx

'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { CursorData } from '../../lib/types';
import { colors } from '../../lib/tokens';

interface CursorProps {
  data: CursorData;
  showName?: boolean;
  isMe?: boolean;
}

export function Cursor({ data, showName = true, isMe = false }: CursorProps) {
  const { avatarUrl, displayName, position, state } = data;
  
  // Smooth interpolation for cursor movement
  const springConfig = { stiffness: 300, damping: 30 };
  const x = useSpring(position.x, springConfig);
  const y = useSpring(position.y, springConfig);

  // Update spring targets when position changes
  useEffect(() => {
    x.set(position.x);
    y.set(position.y);
  }, [position.x, position.y, x, y]);

  // Don't render own cursor (you see your real mouse)
  if (isMe) return null;

  const opacity = state === 'idle' ? 0.5 : 1;
  
  const stateColors = {
    active: 'transparent',
    idle: 'transparent',
    stuck: colors.ui.warning,
    focused: colors.ui.focus,
  };

  const glowColor = stateColors[state];

  return (
    <motion.div
      className="cursor-container fixed pointer-events-none"
      style={{ 
        x, 
        y,
        zIndex: 1000,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity, scale: 1 }}
      exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
    >
      {/* Main cursor body */}
      <div className="relative">
        {/* Glow ring for states */}
        {(state === 'stuck' || state === 'focused') && (
          <motion.div
            className="absolute -inset-2 rounded-full"
            style={{ 
              background: `${glowColor}33`,
              border: `2px solid ${glowColor}`,
            }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut",
            }}
          />
        )}
        
        {/* Avatar circle */}
        <div 
          className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-lg"
          style={{
            boxShadow: `0 2px 10px rgba(0,0,0,0.3), 0 0 0 2px ${glowColor || 'transparent'}`,
          }}
        >
          <img 
            src={avatarUrl} 
            alt={displayName} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* State badge */}
        {state === 'stuck' && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ 
              background: colors.ui.warning,
              color: 'white',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            ?
          </motion.div>
        )}
        
        {state === 'focused' && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
            style={{ background: colors.ui.focus }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            🍅
          </motion.div>
        )}
        
        {/* Pointer tail */}
        <svg 
          className="absolute -bottom-1 left-3 w-3 h-3"
          viewBox="0 0 12 12"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
        >
          <path d="M6 12L0 0L12 6L6 12Z" fill="white" />
        </svg>
        
        {/* Name label */}
        {showName && (
          <motion.div
            className="absolute left-10 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {displayName}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
```

#### 1.5.4 Create CursorLayer Component

```tsx
// app/activity/components/presence/CursorLayer.tsx

'use client';

import { AnimatePresence } from 'framer-motion';
import { useCallback, useRef, useEffect } from 'react';
import { Cursor } from './Cursor';
import { useCursorSync } from '../../hooks/useCursorSync';
import { ViewContext } from '../../lib/types';

interface CursorLayerProps {
  context: ViewContext;
  lessonId?: string;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function CursorLayer({ context, lessonId, containerRef }: CursorLayerProps) {
  const { cursors, updatePosition, myId } = useCursorSync({ context, lessonId });
  
  // Track mouse position and broadcast
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      
      // Convert to container-relative pixels
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      updatePosition({ x, y });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, [containerRef, updatePosition]);

  return (
    <div className="cursor-layer fixed inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {Object.entries(cursors).map(([id, cursor]) => (
          <Cursor 
            key={id}
            data={cursor}
            isMe={id === myId}
            showName={true}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
```

#### 1.5.5 Create Barrel Export

```tsx
// app/activity/components/presence/index.ts

export { Cursor } from './Cursor';
export { CursorLayer } from './CursorLayer';
export { BookPin } from './BookPin';
export { ParticipantBar } from './ParticipantBar';
```

### Acceptance Criteria

- [ ] Cursors appear for other users in same context
- [ ] Cursor movement is smooth (spring interpolation)
- [ ] Own cursor is NOT rendered (only others')
- [ ] Stuck state shows amber glow + "?" badge
- [ ] Focused state shows purple glow + 🍅 badge
- [ ] Idle cursors fade to 50% opacity
- [ ] Cursors are removed when users leave
- [ ] Name labels appear next to cursors

---

## Sub-Phase 1.6: Participant Bar

### Goal

Create the bottom bar showing all participants, their status, and global action buttons.

### Visual Reference

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  🔵 You       🟣 Alice (reading)    🟢 Ben (quiz)    ⚫ Carol (idle)        │
│  ─────        ──────────────────    ─────────────    ───────────────        │
│  active       book                  quiz             desk                   │
│                                                                             │
│                                                      ┌─────────┐ ┌─────────┐│
│                                                      │    ?    │ │    ✓    ││
│                                                      │ I'm     │ │ Got     ││
│                                                      │ Stuck   │ │ It!     ││
│                                                      └─────────┘ └─────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tasks

#### 1.6.1 Create useUserLocation Hook

```tsx
// app/activity/hooks/useUserLocation.ts

'use client';

import { useSyncState } from '@robojs/sync';
import { useCallback, useEffect } from 'react';
import { UserLocation, ViewContext } from '../lib/types';
import { useDiscordUser } from './useDiscordUser';

interface UseUserLocationReturn {
  locations: Record<string, UserLocation>;
  updateMyLocation: (view: ViewContext, lessonId?: string) => void;
}

export function useUserLocation(): UseUserLocationReturn {
  const user = useDiscordUser();
  
  // Global sync - everyone sees where everyone is
  const [locations, setLocations] = useSyncState<Record<string, UserLocation>>(
    'userLocations',
    {},
    [] // Empty array = global sync
  );

  const updateMyLocation = useCallback((view: ViewContext, lessonId?: string) => {
    if (!user) return;
    
    setLocations(prev => ({
      ...prev,
      [user.id]: {
        odId: user.id,
        view,
        lessonId,
        lastUpdate: Date.now(),
      }
    }));
  }, [user, setLocations]);

  // Set initial location
  useEffect(() => {
    if (user) {
      updateMyLocation('desk');
    }
  }, [user, updateMyLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (user) {
        setLocations(prev => {
          const updated = { ...prev };
          delete updated[user.id];
          return updated;
        });
      }
    };
  }, [user, setLocations]);

  return { locations, updateMyLocation };
}
```

#### 1.6.2 Create ParticipantBar Component

```tsx
// app/activity/components/presence/ParticipantBar.tsx

'use client';

import { motion } from 'framer-motion';
import { useCursorSync } from '../../hooks/useCursorSync';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useDiscordUser } from '../../hooks/useDiscordUser';
import { colors, springs } from '../../lib/tokens';
import { CursorData, ViewContext } from '../../lib/types';

interface ParticipantBarProps {
  currentContext: ViewContext;
  lessonId?: string;
  onStuckToggle: (stuck: boolean) => void;
  isStuck: boolean;
}

export function ParticipantBar({ 
  currentContext, 
  lessonId,
  onStuckToggle,
  isStuck,
}: ParticipantBarProps) {
  const user = useDiscordUser();
  const { cursors } = useCursorSync({ context: currentContext, lessonId });
  const { locations } = useUserLocation();

  // Combine cursor data with location data
  const participants = Object.values(cursors);
  
  return (
    <motion.div 
      className="participant-bar fixed bottom-0 left-0 right-0 z-40"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={springs.gentle}
    >
      <div 
        className="mx-4 mb-4 px-4 py-3 rounded-xl flex items-center justify-between"
        style={{
          background: 'rgba(30, 30, 46, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
        }}
      >
        {/* Participants list */}
        <div className="flex items-center gap-4 overflow-x-auto">
          {/* Current user */}
          {user && (
            <ParticipantPill
              avatarUrl={user.avatarUrl}
              displayName="You"
              status="active"
              view={currentContext}
              isMe={true}
            />
          )}
          
          {/* Divider */}
          {participants.length > 0 && (
            <div className="w-px h-8 bg-white/20" />
          )}
          
          {/* Other participants */}
          {participants
            .filter(p => p.odId !== user?.id)
            .slice(0, 8)
            .map(participant => (
              <ParticipantPill
                key={participant.odId}
                avatarUrl={participant.avatarUrl}
                displayName={participant.displayName}
                status={participant.state}
                view={participant.context}
              />
            ))
          }
          
          {/* Overflow indicator */}
          {participants.length > 9 && (
            <div className="text-white/50 text-sm">
              +{participants.length - 9} more
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-4">
          <ActionButton
            icon="?"
            label="I'm Stuck"
            active={isStuck}
            activeColor={colors.ui.warning}
            onClick={() => onStuckToggle(!isStuck)}
          />
          <ActionButton
            icon="✓"
            label="Got It"
            activeColor={colors.ui.success}
            onClick={() => {
              if (isStuck) onStuckToggle(false);
              // Could trigger celebration animation here
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

interface ParticipantPillProps {
  avatarUrl: string;
  displayName: string;
  status: CursorData['state'];
  view: ViewContext;
  isMe?: boolean;
}

function ParticipantPill({ avatarUrl, displayName, status, view, isMe = false }: ParticipantPillProps) {
  const statusColors = {
    active: colors.ui.primary,
    idle: colors.ui.idle,
    stuck: colors.ui.warning,
    focused: colors.ui.focus,
  };

  const viewLabels = {
    desk: 'desk',
    book: 'reading',
    sandbox: 'coding',
    quiz: 'quiz',
  };

  return (
    <motion.div 
      className="participant-pill flex items-center gap-2"
      whileHover={{ scale: 1.05 }}
    >
      {/* Status ring + avatar */}
      <div className="relative">
        <div 
          className="w-9 h-9 rounded-full p-0.5"
          style={{ background: statusColors[status] }}
        >
          <img 
            src={avatarUrl} 
            alt={displayName}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        
        {/* Status indicator dot */}
        {status === 'stuck' && (
          <div 
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: colors.ui.warning }}
          >
            ?
          </div>
        )}
      </div>
      
      {/* Name and status */}
      <div className="hidden sm:block">
        <div className={`text-sm font-medium ${isMe ? 'text-white' : 'text-white/80'}`}>
          {displayName}
        </div>
        <div className="text-[10px] text-white/50">
          {viewLabels[view]}
        </div>
      </div>
    </motion.div>
  );
}

interface ActionButtonProps {
  icon: string;
  label: string;
  active?: boolean;
  activeColor?: string;
  onClick: () => void;
}

function ActionButton({ icon, label, active = false, activeColor, onClick }: ActionButtonProps) {
  return (
    <motion.button
      className="action-button flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors"
      style={{
        background: active ? `${activeColor}33` : 'rgba(255,255,255,0.05)',
        border: active ? `1px solid ${activeColor}` : '1px solid transparent',
        minWidth: 70,
      }}
      whileHover={{ 
        background: active ? `${activeColor}44` : 'rgba(255,255,255,0.1)',
        scale: 1.05,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <span 
        className="text-lg font-bold"
        style={{ color: active ? activeColor : 'white' }}
      >
        {icon}
      </span>
      <span className="text-[10px] text-white/50 mt-0.5">{label}</span>
    </motion.button>
  );
}
```

### Acceptance Criteria

- [ ] Bar renders at bottom of screen
- [ ] Current user shows first with "You" label
- [ ] Other participants show with avatar + name + view
- [ ] Status ring color matches participant state
- [ ] "I'm Stuck" button toggles stuck state
- [ ] "Got It" button clears stuck state
- [ ] Overflow handled for many participants (8+ shows "+N more")
- [ ] Bar is responsive (names hidden on mobile)

---

## Sub-Phase 1.7: Responsive Adaptation

### Goal

Ensure the desk layout works across mobile, tablet, and desktop sizes.

### Visual Reference

```
DESKTOP (769px+):                  TABLET (481-768px):           MOBILE (≤480px):
┌─────────────────────────┐       ┌─────────────────────┐       ┌─────────────────┐
│  Poster  Book   Tools   │       │     Book    Tools   │       │      Book       │
│                         │       │                     │       │                 │
│  Laptop  Quiz           │       │  Laptop    Quiz     │       │  ┌───┐  ┌───┐  │
│                         │       │                     │       │  │</>│  │???│  │
│   Full cursors          │       │   Full cursors      │       │  └───┘  └───┘  │
│                         │       │                     │       │                 │
│  [Participant Bar    ]  │       │  [Participant Bar]  │       │  [🔵🟣🟢][?][✓]│
└─────────────────────────┘       └─────────────────────┘       └─────────────────┘

- Poster: Hidden on mobile        - Tilt: Reduced                - Tilt: Disabled
- Tools: Smaller on tablet        - Names: Abbreviated           - Cursors: Tap only
- Cursors: Full                   - Cursors: Full                - Tools: FAB menu
```

### Tasks

#### 1.7.1 Create Responsive Layout Constants

```tsx
// app/activity/lib/responsive.ts

export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

export const layouts = {
  mobile: {
    bookWidth: 200,
    bookHeight: 260,
    showPoster: false,
    showSecondaryObjects: true,
    secondaryObjectsLayout: 'row' as const,
    toolsPosition: 'fab' as const,
    cursorMode: 'tap' as const,
    tiltEnabled: false,
  },
  tablet: {
    bookWidth: 240,
    bookHeight: 320,
    showPoster: true,
    showSecondaryObjects: true,
    secondaryObjectsLayout: 'row' as const,
    toolsPosition: 'side' as const,
    cursorMode: 'full' as const,
    tiltEnabled: true,
  },
  desktop: {
    bookWidth: 280,
    bookHeight: 380,
    showPoster: true,
    showSecondaryObjects: true,
    secondaryObjectsLayout: 'row' as const,
    toolsPosition: 'side' as const,
    cursorMode: 'full' as const,
    tiltEnabled: true,
  },
};

export type LayoutConfig = typeof layouts.desktop;
```

#### 1.7.2 Create useResponsiveLayout Hook

```tsx
// app/activity/hooks/useResponsiveLayout.ts

'use client';

import { useEffect, useState } from 'react';
import { breakpoints, layouts, LayoutConfig } from '../lib/responsive';

export function useResponsiveLayout(): LayoutConfig {
  const [layout, setLayout] = useState<LayoutConfig>(layouts.desktop);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      
      if (width <= breakpoints.mobile) {
        setLayout(layouts.mobile);
      } else if (width <= breakpoints.tablet) {
        setLayout(layouts.tablet);
      } else {
        setLayout(layouts.desktop);
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  return layout;
}
```

#### 1.7.3 Update StudySpace with Responsive Layout

This will be covered in the final assembly (Sub-Phase 1.8 leads into assembly).

### Acceptance Criteria

- [ ] Book scales down on smaller screens
- [ ] Event poster hidden on mobile
- [ ] Tools tray position changes (side vs FAB)
- [ ] Participant bar adapts (hides names on mobile)
- [ ] Tilt disabled on mobile
- [ ] No horizontal scroll at any breakpoint

---

## Sub-Phase 1.8: Sound Foundation

### Goal

Set up the audio system for UI feedback sounds.

### Tasks

#### 1.8.1 Create useSound Hook

```tsx
// app/activity/hooks/useSound.ts

'use client';

import { useCallback, useRef, useEffect } from 'react';

const SOUNDS = {
  hover: '/activity/sounds/hover.mp3',
  click: '/activity/sounds/click.mp3',
  whoosh: '/activity/sounds/whoosh.mp3',
  success: '/activity/sounds/success.mp3',
  stuck: '/activity/sounds/stuck.mp3',
  userJoin: '/activity/sounds/user-join.mp3',
  userLeave: '/activity/sounds/user-leave.mp3',
} as const;

type SoundName = keyof typeof SOUNDS;

interface UseSoundReturn {
  play: (name: SoundName) => void;
  preload: () => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
}

export function useSound(): UseSoundReturn {
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());
  const muted = useRef(false);
  const volume = useRef(0.5);

  // Preload all sounds
  const preload = useCallback(() => {
    Object.entries(SOUNDS).forEach(([name, src]) => {
      if (!audioCache.current.has(name)) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = volume.current;
        audioCache.current.set(name, audio);
      }
    });
  }, []);

  // Play a sound
  const play = useCallback((name: SoundName) => {
    if (muted.current) return;
    
    const src = SOUNDS[name];
    let audio = audioCache.current.get(name);
    
    if (!audio) {
      audio = new Audio(src);
      audioCache.current.set(name, audio);
    }
    
    // Clone for overlapping plays
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = volume.current;
    clone.play().catch(() => {
      // Ignore autoplay errors (user hasn't interacted yet)
    });
  }, []);

  const setMuted = useCallback((newMuted: boolean) => {
    muted.current = newMuted;
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    volume.current = Math.max(0, Math.min(1, newVolume));
  }, []);

  // Preload on mount
  useEffect(() => {
    preload();
  }, [preload]);

  return { play, preload, setMuted, setVolume };
}
```

#### 1.8.2 Create Placeholder Sound Files

Create empty/placeholder audio files at:
- `public/activity/sounds/hover.mp3`
- `public/activity/sounds/click.mp3`
- `public/activity/sounds/whoosh.mp3`
- `public/activity/sounds/success.mp3`
- `public/activity/sounds/stuck.mp3`
- `public/activity/sounds/user-join.mp3`
- `public/activity/sounds/user-leave.mp3`

> **Note:** These can be silent 0.1s MP3s initially. Replace with real sounds later.

### Acceptance Criteria

- [ ] useSound hook compiles without errors
- [ ] play() doesn't throw if sound file missing
- [ ] Mute setting prevents playback
- [ ] Volume setting applies to playback

---

## Final Assembly: StudySpace Component

### Goal

Assemble all components into the main `StudySpace` component.

### Tasks

#### Create StudySpace Component

```tsx
// app/activity/components/StudySpace.tsx

'use client';

import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// Depth
import { DepthContainer, DepthLayer } from './depth';

// Desk
import { 
  DeskSurface, 
  Textbook, 
  EventPoster, 
  SandboxLaptop, 
  QuizNotepad, 
  ToolsTray 
} from './desk';

// Presence
import { CursorLayer, ParticipantBar } from './presence';

// Hooks
import { useCursorSync } from '../hooks/useCursorSync';
import { useUserLocation } from '../hooks/useUserLocation';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useResponsiveDepth } from '../hooks/useResponsiveDepth';

// Types
import { ViewContext, CursorData } from '../lib/types';
import { depth } from '../lib/tokens';

export function StudySpace() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState<ViewContext>('desk');
  const [isStuck, setIsStuck] = useState(false);
  
  // Hooks
  const layout = useResponsiveLayout();
  const { tiltIntensity } = useResponsiveDepth();
  const { cursors, setStuck } = useCursorSync({ context: currentView });
  const { updateMyLocation } = useUserLocation();
  
  // Get users who are in the book (for pins on closed book)
  const usersInBook = Object.values(cursors).filter(
    (c): c is CursorData => c.context === 'book'
  );

  // Handlers
  const handleOpenBook = useCallback(() => {
    setCurrentView('book');
    updateMyLocation('book');
    // TODO: Trigger book open animation, navigate to book content view
    console.log('Opening book...');
  }, [updateMyLocation]);

  const handleStuckToggle = useCallback((stuck: boolean) => {
    setIsStuck(stuck);
    setStuck(stuck);
  }, [setStuck]);

  const handleOpenSandbox = useCallback(() => {
    // TODO: Implement sandbox
    console.log('Opening sandbox...');
  }, []);

  const handleOpenQuiz = useCallback(() => {
    // TODO: Implement quiz
    console.log('Opening quiz...');
  }, []);

  const handleJoinEvent = useCallback(() => {
    // TODO: Implement events
    console.log('Joining event...');
  }, []);

  return (
    <div 
      ref={containerRef}
      className="study-space w-full h-full bg-[#1a1a2e] overflow-hidden"
    >
      <DepthContainer enableTilt={layout.tiltEnabled}>
        {/* Background layer */}
        <DepthLayer z={depth.background} className="absolute inset-0">
          <DeskSurface />
        </DepthLayer>
        
        {/* Objects layer */}
        <DepthLayer z={depth.objects} className="absolute inset-0">
          <div className="w-full h-full flex items-center justify-center">
            <div 
              className="desk-objects-container relative"
              style={{
                width: '90%',
                maxWidth: 1100,
                height: '70%',
                maxHeight: 600,
              }}
            >
              {/* Event Poster (left side) */}
              {layout.showPoster && (
                <motion.div 
                  className="absolute left-0 top-1/2 -translate-y-1/2"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <EventPoster onJoin={handleJoinEvent} />
                </motion.div>
              )}
              
              {/* Textbook (center) */}
              <motion.div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Textbook 
                  usersInBook={usersInBook}
                  onOpen={handleOpenBook}
                />
              </motion.div>
              
              {/* Secondary objects (bottom) */}
              <motion.div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-6"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <SandboxLaptop onOpen={handleOpenSandbox} />
                <QuizNotepad onOpen={handleOpenQuiz} />
              </motion.div>
              
              {/* Tools Tray (right side) */}
              {layout.toolsPosition === 'side' && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <ToolsTray />
                </div>
              )}
            </div>
          </div>
        </DepthLayer>
      </DepthContainer>
      
      {/* Cursor layer (fixed, outside depth) */}
      <CursorLayer 
        context={currentView}
        containerRef={containerRef}
      />
      
      {/* Participant bar (fixed bottom) */}
      <ParticipantBar
        currentContext={currentView}
        onStuckToggle={handleStuckToggle}
        isStuck={isStuck}
      />
      
      {/* Mobile FAB for tools (when toolsPosition === 'fab') */}
      {layout.toolsPosition === 'fab' && (
        <MobileToolsFAB />
      )}
    </div>
  );
}

// Placeholder for mobile tools FAB
function MobileToolsFAB() {
  return (
    <motion.button
      className="fixed right-4 bottom-24 w-14 h-14 rounded-full bg-purple-600 text-white shadow-lg flex items-center justify-center text-xl"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      🛠️
    </motion.button>
  );
}
```

#### Update page.tsx

```tsx
// app/activity/page.tsx

import { StudySpace } from './components/StudySpace';

export default function ActivityPage() {
  return (
    <div className="w-screen h-screen">
      <StudySpace />
    </div>
  );
}
```

---

## Testing Checklist

### Visual Tests

- [ ] Desk renders with wood texture and lighting
- [ ] Book appears 3D (visible spine, page edges)
- [ ] All objects lift on hover
- [ ] Shadows respond to hover state
- [ ] Tilt effect works on desktop (moves with mouse)
- [ ] Tilt disabled on mobile
- [ ] Layout adapts at each breakpoint

### Interaction Tests

- [ ] Clicking book triggers `onOpen` callback
- [ ] Clicking other objects triggers their callbacks
- [ ] "I'm Stuck" toggles state and updates cursor
- [ ] "Got It" clears stuck state

### Presence Tests

- [ ] Moving mouse broadcasts cursor position
- [ ] Other users' cursors appear
- [ ] Cursors are smooth (not jumpy)
- [ ] Own cursor is NOT rendered
- [ ] Stuck state shows on cursor
- [ ] Idle state fades cursor

### Performance Tests

- [ ] 60fps during cursor movement
- [ ] 60fps during hover animations
- [ ] No layout thrashing in DevTools
- [ ] No excessive re-renders

---

## File Manifest

After implementation, these files should exist:

```
app/activity/
├── page.tsx
├── components/
│   ├── StudySpace.tsx
│   ├── depth/
│   │   ├── DepthContainer.tsx
│   │   ├── DepthLayer.tsx
│   │   └── index.ts
│   ├── desk/
│   │   ├── DeskSurface.tsx
│   │   ├── DeskObject.tsx
│   │   ├── Textbook.tsx
│   │   ├── EventPoster.tsx
│   │   ├── SandboxLaptop.tsx
│   │   ├── QuizNotepad.tsx
│   │   ├── ToolsTray.tsx
│   │   └── index.ts
│   ├── presence/
│   │   ├── Cursor.tsx
│   │   ├── CursorLayer.tsx
│   │   ├── BookPin.tsx
│   │   ├── ParticipantBar.tsx
│   │   └── index.ts
│   └── ui/
│       └── index.ts
├── hooks/
│   ├── useCursorSync.ts
│   ├── useUserLocation.ts
│   ├── useSound.ts
│   ├── useResponsiveDepth.ts
│   ├── useResponsiveLayout.ts
│   └── useDiscordUser.ts
├── lib/
│   ├── tokens.ts
│   ├── types.ts
│   ├── responsive.ts
│   └── variants.ts
└── public/activity/sounds/
    ├── hover.mp3
    ├── click.mp3
    ├── whoosh.mp3
    ├── success.mp3
    ├── stuck.mp3
    ├── user-join.mp3
    └── user-leave.mp3
```

---

## Success Criteria

The homepage foundation is complete when:

1. ✅ User sees a 3D desk with centered textbook
2. ✅ Secondary objects (poster, laptop, notepad, tools) visible
3. ✅ All objects respond to hover with lift + shadow
4. ✅ Mouse movement causes subtle scene tilt (desktop)
5. ✅ Other users' cursors visible in real-time
6. ✅ Participant bar shows all users with status
7. ✅ "I'm Stuck" / "Got It" buttons functional
8. ✅ Layout adapts to mobile/tablet/desktop
9. ✅ Performance is smooth (60fps)
10. ✅ No console errors

---

*This plan should be executed sequentially. Each sub-phase builds on the previous.*

**Estimated effort:** 8-12 hours of focused development time.
