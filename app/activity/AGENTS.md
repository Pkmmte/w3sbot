# CLAUDE.md — Agent Reference Guide

> Quick reference for AI coding agents working on StudyTogether
> For full details, see the companion documents listed below

---

## 📁 Documentation Index

| Document | Purpose | When to Read |
|----------|---------|--------------|
| `MANIFESTO.md` | Vision, principles, feature phases, success metrics | Understanding "why" and feature scope |
| `DESIGN_SYSTEM.md` | Visual design, spatial metaphors, animations, layouts | UI/UX implementation details |
| `IMPLEMENTATION_GUIDE.md` | Code patterns, components, hooks, performance | Writing actual code |

**Rule:** If a task touches UI/animation, read DESIGN_SYSTEM.md first. If it touches architecture/state, read IMPLEMENTATION_GUIDE.md first.

---

## 🎯 Project Overview

**StudyTogether** is a Discord Activity for collaborative learning on W3Schools tutorials. Users study together in a shared virtual "study space" with real-time presence, cursors, and collaboration features.

### Core Concept

The app is NOT a webpage—it's a **place**. A desk with a textbook and study tools. Users don't "navigate pages," they "open the book" or "pick up the laptop."

```
┌─────────────────────────────────────────────────────────────┐
│                      THE STUDY SPACE                        │
│                                                             │
│   ┌─────────┐    ┌──────────────────┐    ┌─────────────┐   │
│   │  Event  │    │                  │    │   Tools     │   │
│   │  Poster │    │    TEXTBOOK      │    │   Tray      │   │
│   │         │    │   (W3Schools)    │    │             │   │
│   └─────────┘    │                  │    │  [Timer]    │   │
│                  │   📌 Alice       │    │  [Notes]    │   │
│   ┌─────┐┌─────┐ │   📌 Ben         │    │  [Help]     │   │
│   │ </> ││ Quiz│ │                  │    │             │   │
│   │Code ││     │ └──────────────────┘    └─────────────┘   │
│   └─────┘└─────┘                                           │
│                                                             │
│   [ 🔵 Alice  🟣 Ben  🟢 Carol ]           [ ? ] [ ✓ ]     │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles (Condensed)

1. **Objects, not interfaces** — A textbook, not a content panel
2. **Depth through layers** — CSS 3D transforms create visual hierarchy
3. **Context-appropriate presence** — Cursors when relevant, pins when not
4. **Content first** — The W3Schools content is the star
5. **Game feel, not games** — Satisfying animations, not gamification overload
6. **Solo is valid** — Works great alone, better with friends

---

## 🛠️ Tech Stack

```
Framework:        Next.js (SPA behavior within Discord Activity)
Platform:         Discord Activity (Discord SDK)
Sync:             Robo.js with @robojs/sync
Animation:        Framer Motion
3D Depth:         CSS 3D Transforms (perspective, preserve-3d, translateZ)
Styling:          Tailwind CSS
State:            React state + useSyncState for shared state
```

### Key Dependencies

```json
{
  "framer-motion": "^11.x",
  "@use-gesture/react": "^10.x",
  "@robojs/sync": "workspace dependency"
}
```

---

## 🔄 State Synchronization

### useSyncState API

**CRITICAL:** `useSyncState` from `@robojs/sync` has a final array parameter that determines sync scope. Clients with matching array values share state.

```tsx
import { useSyncState } from '@robojs/sync';

// Synced across ALL clients in the activity
const [globalState, setGlobalState] = useSyncState('key', defaultValue, []);

// Synced only with clients viewing the same lesson
const [lessonState, setLessonState] = useSyncState('cursors', {}, [lessonId]);

// Synced with clients in the same lesson AND channel
const [channelState, setChannelState] = useSyncState('chat', [], [lessonId, visChannelId]);
```

### Common Sync Patterns

```tsx
// Cursor positions - synced by current context
const [cursors, setCursors] = useSyncState<Record<string, CursorData>>(
  'cursors', 
  {}, 
  [currentView, lessonId] // Only see cursors of people in same view
);

// User locations - synced globally to show where everyone is
const [userLocations, setUserLocations] = useSyncState<Record<string, UserLocation>>(
  'locations',
  {},
  [] // Global - everyone sees where everyone is
);

// Book reading positions - synced by lesson
const [readingPositions, setReadingPositions] = useSyncState<Record<string, number>>(
  'reading',
  {},
  [lessonId]
);
```

---

## 📐 Depth System (CSS 3D)

The app uses CSS 3D transforms for depth—NOT WebGL or canvas.

### Layer Architecture

```tsx
// Parent establishes perspective (viewing distance)
<div style={{ perspective: 1200 }}>
  
  // Scene maintains 3D space for children
  <div style={{ transformStyle: "preserve-3d" }}>
    
    // Background layer (further from viewer)
    <div style={{ transform: "translateZ(-100px)" }}>
      {/* Desk surface */}
    </div>
    
    // Object layer (main interactive elements)
    <div style={{ transform: "translateZ(0)" }}>
      {/* Book, laptop, notepad */}
    </div>
    
    // Foreground layer (closer to viewer)
    <div style={{ transform: "translateZ(30px)" }}>
      {/* Tools tray, floating UI */}
    </div>
    
  </div>
</div>
```

### Key Components

```tsx
// DepthContainer - Sets up 3D space with optional tilt
<DepthContainer perspective={1200} enableTilt={true}>
  <DepthLayer z={-100}>{/* Background */}</DepthLayer>
  <DepthLayer z={0}>{/* Objects */}</DepthLayer>
  <DepthLayer z={30}>{/* Foreground */}</DepthLayer>
</DepthContainer>

// DeskObject - Interactive object with hover lift
<DeskObject onClick={handleOpen} hoverLift={15}>
  <BookCover />
</DeskObject>
```

---

## 📚 The Textbook

**IMPORTANT CLARIFICATION:** The textbook is a **container**, not a paginating flip-book. 

- The book "cover" is a 3D CSS object on the desk
- Opening the book transitions to a content viewer
- Content inside is scrollable/navigable but NOT page-flip animated
- The book metaphor is for the open/close transition and spatial presence, not for pagination

### Book States

| State | Representation |
|-------|----------------|
| Closed | 3D book on desk with user pins showing who's reading |
| Opening | Framer Motion animation (lift, rotate, expand) |
| Open | Content viewer fills view, desk dims in background |
| Closing | Reverse animation, return to desk |

### Presence When Book is Open vs Closed

```tsx
// When YOU are on the desk and others are in the book:
// → Show pins on the closed book cover

// When YOU are in the book with others:
// → Show cursors in the content area

// When someone is in a different lesson:
// → Show them in participant bar with lesson indicator
```

---

## 👆 Cursor & Presence

### Cursor States

| State | Visual | When |
|-------|--------|------|
| `active` | Full cursor with avatar | Normal activity |
| `idle` | 50% opacity | No movement for 30s |
| `stuck` | Amber glow + "?" badge | User pressed "I'm stuck" |
| `focused` | Purple ring + 🍅 | In pomodoro focus mode |

### Context-Based Representation

| Your Location | Their Location | How They Appear |
|---------------|----------------|-----------------|
| Desk | Desk | Full cursor |
| Desk | In book | Pin on book cover |
| Book | Book (same lesson) | Full cursor |
| Book | Book (different lesson) | Indicator in participant bar |
| Any | Different mode entirely | Small marker on that mode's icon |

### Cursor Sync Pattern

```tsx
function useCursorSync(context: string, lessonId: string) {
  const { user } = useDiscordSdk();
  
  // Sync with others in same context + lesson
  const [cursors, setCursors] = useSyncState<Record<string, CursorData>>(
    'cursors',
    {},
    [context, lessonId] // ← Sync scope!
  );

  const updateMyCursor = useCallback((position: { x: number; y: number }) => {
    setCursors(prev => ({
      ...prev,
      [user.id]: {
        odId: user.id,
        position,
        context,
        state: 'active',
        lastUpdate: Date.now(),
      }
    }));
  }, [user.id, context, setCursors]);

  return { cursors, updateMyCursor };
}
```

---

## 🎬 Animation Patterns

### Timing Tokens

```tsx
const timings = {
  instant: 0.1,    // Micro-interactions
  fast: 0.2,       // Button responses
  normal: 0.3,     // State changes
  slow: 0.5,       // Major transitions (book open)
  dramatic: 0.8,   // Celebrations
};
```

### Spring Presets

```tsx
const springs = {
  snappy: { type: "spring", stiffness: 400, damping: 30 },
  gentle: { type: "spring", stiffness: 200, damping: 20 },
  bouncy: { type: "spring", stiffness: 300, damping: 15 },
};
```

### Common Variants

```tsx
// Desk object hover
const deskObjectVariants = {
  idle: { y: 0, scale: 1, rotateX: 0 },
  hover: { 
    y: -15, 
    scale: 1.03, 
    rotateX: -5,
    transition: springs.snappy
  },
};

// Fade in with upward motion
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: springs.snappy 
  },
};
```

---

## 📱 Responsive Breakpoints

```tsx
const breakpoints = {
  mobile: '(max-width: 480px)',
  tablet: '(max-width: 768px)',
  desktop: '(min-width: 769px)',
};
```

### Mobile Adaptations

- **Cursors** → Tap indicators that fade (no persistent cursor)
- **Depth/tilt** → Reduced intensity or disabled
- **Book** → Full-screen when open, swipe to close
- **Tools** → Bottom sheet or floating action button
- **Participants** → Compact bar, expandable

---

## 📂 Project Structure

```
src/
├── components/
│   ├── depth/
│   │   ├── DepthContainer.tsx    # 3D perspective wrapper
│   │   └── DepthLayer.tsx        # Z-positioned layer
│   ├── desk/
│   │   ├── DeskScene.tsx         # Main desk view
│   │   ├── DeskObject.tsx        # Interactive object base
│   │   ├── Textbook.tsx          # The book (open/closed states)
│   │   ├── Laptop.tsx            # Code sandbox entry
│   │   ├── Notepad.tsx           # Quiz entry
│   │   └── ToolsTray.tsx         # Timer, notes, help
│   ├── book/
│   │   ├── BookCover.tsx         # Closed 3D cover
│   │   ├── BookContent.tsx       # Open content viewer
│   │   └── UserPins.tsx          # Pins on closed cover
│   ├── presence/
│   │   ├── Cursor.tsx            # Remote user cursor
│   │   ├── BookPin.tsx           # Pin on book cover
│   │   ├── TapIndicator.tsx      # Mobile tap position
│   │   └── ParticipantBar.tsx    # User list
│   └── ui/
│       ├── Timer.tsx             # Pomodoro timer
│       └── Button.tsx            # Styled button
├── hooks/
│   ├── useCursorSync.ts          # Cursor state sync
│   ├── useUserLocation.ts        # Where users are
│   ├── useSound.ts               # Audio playback
│   └── useDiscordSdk.ts          # Discord SDK wrapper
├── lib/
│   ├── animation.ts              # Timing tokens, springs
│   └── variants.ts               # Reusable Framer variants
└── app/
    └── page.tsx                  # Main entry (Activity root)
```

---

## ✅ Code Checklist

When implementing features, verify:

- [ ] **Sync scope correct?** — Check useSyncState array parameter
- [ ] **Using transforms?** — Use `x`, `y`, `scale`, `rotate` not `left`, `top`, `width`
- [ ] **Mobile considered?** — Touch targets ≥44px, gestures work
- [ ] **Reduced motion?** — Check `useReducedMotion()` for accessibility
- [ ] **Sounds optional?** — All sounds must be toggleable
- [ ] **Context-aware presence?** — Cursors vs pins vs indicators

---

## 🚫 Common Mistakes

### ❌ Wrong: Layout property animation
```tsx
animate={{ left: 100, width: 200 }}
```

### ✅ Right: Transform animation
```tsx
animate={{ x: 100, scaleX: 1.5 }}
```

---

### ❌ Wrong: Global sync for local state
```tsx
const [cursors, setCursors] = useSyncState('cursors', {}, []);
// Everyone sees everyone's cursor everywhere!
```

### ✅ Right: Scoped sync
```tsx
const [cursors, setCursors] = useSyncState('cursors', {}, [view, lessonId]);
// Only see cursors of people in same view + lesson
```

---

### ❌ Wrong: Treating book as paginated flip-book
```tsx
<HTMLFlipBook>
  <Page>Content 1</Page>
  <Page>Content 2</Page>
</HTMLFlipBook>
```

### ✅ Right: Book is a container, content scrolls
```tsx
// Closed state: 3D book cover on desk
// Open state: Full content viewer (scrollable, not paginated)
<motion.div animate={isOpen ? "open" : "closed"}>
  {isOpen ? <ContentViewer /> : <BookCover />}
</motion.div>
```

---

### ❌ Wrong: 3D for everything
```tsx
// Using React Three Fiber for basic UI
<Canvas><Html><Button /></Html></Canvas>
```

### ✅ Right: CSS 3D for depth, R3F only when needed
```tsx
// CSS 3D for depth layers
<div style={{ perspective: 1200, transformStyle: "preserve-3d" }}>
  <div style={{ translateZ: -100 }}>{/* Background */}</div>
</div>

// R3F only for special scenes (Interview event, etc.)
```

---

## 🔗 Quick Reference Links

- **Discord Activity Docs:** https://discord.com/developers/docs/activities/overview
- **Framer Motion:** https://www.framer.com/motion/
- **Robo.js Sync:** Check project's robo.js documentation
- **CSS 3D Transforms:** https://3dtransforms.desandro.com/

---

## 📝 When Starting a Task

1. **Read this file** for quick context
2. **Identify which document** has details you need
3. **Check sync scope** if touching shared state
4. **Check mobile** if touching UI
5. **Test animations** with reduced motion enabled

---

*Last updated: [auto-update on commit]*

*For full details, always refer to the source documents.*
