# 📐 StudyTogether — Visual Design System

> The Study Space: A Game-Like Learning Environment
> Companion document to MANIFESTO.md

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [The Study Space Concept](#the-study-space-concept)
3. [The Textbook](#the-textbook)
4. [The Desk Environment](#the-desk-environment)
5. [Cursor & Presence States](#cursor--presence-states)
6. [Screen Layouts](#screen-layouts)
7. [Navigation & Transitions](#navigation--transitions)
8. [Component Specifications](#component-specifications)
9. [Animation Specifications](#animation-specifications)
10. [Technical Implementation](#technical-implementation)

---

## Design Philosophy

### The Problem with "Webpage Feel"

Traditional learning apps feel like tools—clinical, flat, forgettable. Users don't *want* to be there; they *have* to be there. This creates friction against the very thing we're trying to encourage: consistent study habits.

### The Solution: Environmental Design

Instead of building a webpage, we're building a **place**. A study space that users inhabit. When you open StudyTogether, you're not "loading a page"—you're sitting down at your desk, opening your textbook, and getting to work.

This isn't about 3D graphics or game engines. It's about:
- **Spatial metaphors** that make sense intuitively
- **Physical objects** you interact with (book, desk, tools)
- **Depth and layering** that creates visual hierarchy
- **Satisfying interactions** that feel tactile

### Design Principles

```
1. OBJECTS, NOT INTERFACES
   → A textbook, not a content panel
   → A desk, not a dashboard
   → Sticky notes, not notification badges

2. DEPTH THROUGH LAYERS
   → Background (desk surface, ambient environment)
   → Middle ground (main objects: book, tools)
   → Foreground (UI overlays, cursors, tooltips)

3. CONTEXT-APPROPRIATE PRESENCE
   → Full cursors when relevant
   → Pins/markers when cursors don't make sense
   → Ambient awareness when out of view

4. TRANSITIONS ARE MOMENTS
   → Opening the book is an event
   → Closing it reveals the desk
   → Mode changes feel like physical actions
```

---

## The Study Space Concept

### Overview

The app exists in a **study space**—a desk with a textbook and various study tools. This is not a literal 3D room, but a stylized 2.5D environment with layered elements that create depth.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                     ░░░ AMBIENT BACKGROUND ░░░                  │
│                   (subtle gradient, soft particles)             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │                    THE DESK SURFACE                     │    │
│  │               (wood texture, slight shadow)             │    │
│  │                                                         │    │
│  │    ┌──────────────────────────────────┐                 │    │
│  │    │                                  │     ┌────────┐  │    │
│  │    │         THE TEXTBOOK             │     │ TOOLS  │  │    │
│  │    │       (W3Schools content)        │     │        │  │    │
│  │    │                                  │     │ Quiz   │  │    │
│  │    │    [Currently closed or open]    │     │ Timer  │  │    │
│  │    │                                  │     │ Notes  │  │    │
│  │    │                                  │     └────────┘  │    │
│  │    └──────────────────────────────────┘                 │    │
│  │                                                         │    │
│  │         ┌─────────┐    ┌─────────┐                      │    │
│  │         │ Events  │    │ Sandbox │                      │    │
│  │         └─────────┘    └─────────┘                      │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              PARTICIPANT BAR (foreground)               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Stack (z-index hierarchy)

```
z-index: 100  │  Modals, Tooltips, Menus
z-index: 90   │  Cursors (always on top of content)
z-index: 80   │  Foreground UI (participant bar, timer)
z-index: 70   │  Active Object (open book, active mode)
z-index: 50   │  Desk Objects (closed book, tools)
z-index: 30   │  Desk Surface
z-index: 10   │  Ambient Background
z-index: 0    │  Base
```

---

## The Textbook

The textbook is the central object and primary interaction point. It represents the W3Schools tutorial content.

### Textbook States

#### State 1: Closed (Default/Home)

The book sits on the desk, clearly visible, inviting interaction.

```
Desktop View (closed):
                    ┌────────────────────────────────┐
                    │ ╔════════════════════════════╗ │
                    │ ║                            ║ │
                    │ ║      ┌──────────────┐      ║ │
                    │ ║      │   W3Schools  │      ║ │
                    │ ║      │    ┌────┐    │      ║ │
                    │ ║      │    │ W3 │    │      ║ │
                    │ ║      │    └────┘    │      ║ │
                    │ ║      │   TUTORIALS  │      ║ │
                    │ ║      └──────────────┘      ║ │
                    │ ║                            ║ │
              ┌─────│ ║     📌 Alice  📌 Ben      ║ │─────┐
              │ ════│ ║                            ║ │════ │
              │ ════│ ║     [Click to Open]        ║ │════ │
              │ ════│ ║                            ║ │════ │
              └─────│ ╚════════════════════════════╝ │─────┘
                    └────────────────────────────────┘
                    
        Pins on cover show who's currently reading inside
```

**Visual Details:**
- Book has visible thickness (side pages)
- Subtle shadow beneath, grounding it on desk
- Cover has slight texture (leather/cloth feel)
- W3Schools branding prominent but stylized
- User pins clustered on cover (see Cursor States)
- Gentle idle animation (very subtle breathing/float)

**Interactions:**
- Hover: Book lifts slightly, shadow deepens
- Click: Opens with page-turn animation
- Can see at a glance: Who's inside, general activity

#### State 2: Opening (Transition)

```
Opening Animation Sequence (400-600ms):

Frame 1: Book lifts off desk
         ┌──────────────┐
         │   W3Schools  │  ↑ lift
         └──────────────┘

Frame 2: Cover begins to open
         ┌──────────────┐
        ╱               │
       ╱  (cover)       │ (pages)
      ╱                 │
     └──────────────────┘

Frame 3: Full open, pages spread
    ┌─────────────────────────────────────┐
    │ (left page)     │     (right page)  │
    │                 │                   │
    │   Table of      │   Content area    │
    │   Contents      │                   │
    │                 │                   │
    └─────────────────────────────────────┘

Frame 4: Expands to fill reading view
    (content scales up, desk fades to background)
```

**Animation Details:**
- Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` (slight overshoot)
- Duration: 500ms
- Sound: Satisfying book-open sound (page flutter)
- Desk doesn't disappear, but dims/blurs slightly
- Other desk objects slide to periphery or shrink

#### State 3: Open (Reading Mode)

When open, the book becomes the primary focus. The desk is still visible but receded.

```
Desktop View (open):
┌───────────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░ (dimmed desk background) ░░░░░░░░░░░░░░░░░ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ ╔═══════════════════════════╦═══════════════════════════════╗│ │
│  │ ║                           ║                               ║│ │
│  │ ║   TABLE OF CONTENTS       ║   TUTORIAL CONTENT            ║│ │
│  │ ║                           ║                               ║│ │
│  │ ║   ▸ HTML Basics           ║   <h1>HTML Headings</h1>      ║│ │
│  │ ║     ▸ Headings ←          ║                               ║│ │
│  │ ║     ▸ Paragraphs          ║   Headings are defined with   ║│ │
│  │ ║     ▸ Links               ║   the <h1> to <h6> tags.      ║│ │
│  │ ║   ▸ HTML Elements         ║                               ║│ │
│  │ ║   ▸ HTML Attributes       ║   🔵 ← Alice's cursor         ║│ │
│  │ ║                           ║                               ║│ │
│  │ ║   ───────────────         ║   ┌─────────────────────────┐ ║│ │
│  │ ║   Progress: ████░░ 67%    ║   │ <h1>Heading 1</h1>      │ ║│ │
│  │ ║                           ║   │ <h2>Heading 2</h2>      │ ║│ │
│  │ ║                           ║   │        [▶ Try It]       │ ║│ │
│  │ ║                           ║   └─────────────────────────┘ ║│ │
│  │ ║                           ║                               ║│ │
│  │ ╠═══════════════════════════╬═══════════════════════════════╣│ │
│  │ ║  📖 Close Book            ║          Page 3 of 12     ▸   ║│ │
│  │ ╚═══════════════════════════╩═══════════════════════════════╝│ │
│  │                                                              ││ │
│  │  (book spine visible)                                        ││ │
│  └──────────────────────────────────────────────────────────────┘│ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────────┐│
│  │ 🔵 Alice (reading) 🟣 Ben (stuck?) 🟢 Carol ⚫ Dan (idle)     ││
│  └───────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────┘
```

**Visual Details:**
- Book edges visible (maintains object metaphor)
- Page curl hints at edges
- Spine visible on left side
- Content has paper texture (subtle)
- Drop shadow grounds the book
- Corners might be slightly lifted/dog-eared
- Table of contents is left "page"
- Content is right "page(s)"

**Interactive Elements:**
- Page navigation (arrows, swipe, or TOC click)
- "Close Book" clearly accessible
- Code snippets feel like they're printed on the page
- "Try It" opens sandbox (as overlay or page insert)

#### State 4: Closing (Transition)

Reverse of opening, but snappier (300-400ms). Desk objects animate back into view.

### Book Presence Indicators

When the book is **closed**, you can still see who's inside:

```
┌──────────────────────────┐
│                          │
│      ┌──────────────┐    │
│      │   W3Schools  │    │
│      └──────────────┘    │
│                          │
│    📌        📌    📌    │  ← Pins are user avatars
│   Alice     Ben   Carol  │
│                          │
│      [Click to Open]     │
│                          │
└──────────────────────────┘
```

**Pin Details:**
- Small circular avatar (20-24px)
- Subtle drop shadow
- Pin "needle" points into book
- Pins cluster/stack if many users
- Hovering a pin shows: Name, current page/section
- Clicking a pin: Opens book AND jumps to their location

---

## The Desk Environment

When the book is closed, the full desk is visible with various interactive objects.

### Desk Layout

```
Desktop View (full desk, book closed):
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                                                                  │  │
│   │                          DESK SURFACE                            │  │
│   │                    (wood grain, warm lighting)                   │  │
│   │                                                                  │  │
│   │  ┌─────────┐     ┌────────────────────────┐     ┌─────────────┐  │  │
│   │  │  EVENT  │     │                        │     │    TOOLS    │  │  │
│   │  │ POSTER  │     │      THE TEXTBOOK      │     │   ┌─────┐   │  │  │
│   │  │         │     │       (see above)      │     │   │Timer│   │  │  │
│   │  │ 🏆      │     │                        │     │   └─────┘   │  │  │
│   │  │ Weekly  │     │     📌 Alice 📌 Ben    │     │   ┌─────┐   │  │  │
│   │  │Challenge│     │                        │     │   │Notes│   │  │  │
│   │  │         │     │                        │     │   └─────┘   │  │  │
│   │  └─────────┘     └────────────────────────┘     │   ┌─────┐   │  │  │
│   │                                                 │   │Help │   │  │  │
│   │  ┌──────────────┐    ┌──────────────┐           │   └─────┘   │  │  │
│   │  │   SANDBOX    │    │    QUIZ      │           └─────────────┘  │  │
│   │  │   LAPTOP     │    │   NOTEPAD    │                            │  │
│   │  │   ┌──────┐   │    │   ┌──────┐   │           ┌─────────────┐  │  │
│   │  │   │ </>  │   │    │   │ ?!?  │   │           │   FRIENDS   │  │  │
│   │  │   └──────┘   │    │   └──────┘   │           │  🔵🟣🟢⚫   │  │  │
│   │  │              │    │              │           │             │  │  │
│   │  └──────────────┘    └──────────────┘           └─────────────┘  │  │
│   │                                                                  │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      PARTICIPANT BAR                            │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Desk Objects

Each object on the desk represents a feature/mode:

#### 1. The Textbook (Center)
- Primary object, largest
- Contains W3Schools tutorials
- See detailed spec above

#### 2. Sandbox Laptop (Left-Center)
- Small laptop illustration
- Opens the code sandbox mode
- Screen shows code snippet preview
- When active: Laptop "opens" and expands

```
Closed:                    Opening:                   Open:
┌──────────────┐          ┌──────────────┐           Expands to fill
│   ┌──────┐   │          │╱  ┌──────┐   │           view, desk recedes
│   │ </>  │   │    →    ╱│   │ </>  │   │    →     (like book opening)
│   └──────┘   │        ╱ │   └──────┘   │           
│   ═══════════│       ╱  │   ═══════════│           
└──────────────┘      └───┴──────────────┘           
```

#### 3. Quiz Notepad (Right-Center)
- Spiral-bound notepad aesthetic
- Shows "?" symbols, quiz vibes
- Opens quiz mode when clicked
- Flips open with page animation

```
Closed:                    Open (quiz active):
┌──────────────┐           ┌────────────────────────┐
│ ○○○○○○○○○○○○ │  spiral   │ Q: What does <h1> do?  │
│ ┌──────────┐ │    →      │                        │
│ │   ?!?    │ │           │ ○ Creates a header     │
│ │          │ │           │ ○ Creates a paragraph  │
│ │  QUIZ    │ │           │ ○ Creates a link       │
│ └──────────┘ │           │ ○ Creates an image     │
└──────────────┘           └────────────────────────┘
```

#### 4. Event Poster (Far Left)
- Poster/flyer pinned or propped up
- Shows current/upcoming event
- Has "NEW!" badge when fresh event
- Click to see event details/enter event

```
┌─────────────┐
│ ★ WEEKLY ★  │
│  CHALLENGE  │
│             │
│  🏆 DEBUG   │
│    RUSH     │
│             │
│  Ends in:   │
│   2d 14h    │
│             │
│ [Join Now]  │
└─────────────┘
```

#### 5. Tools Tray (Right Side)
- Vertical tray/holder with study tools
- Timer, Notes, Help button
- Always accessible regardless of mode
- Can be minimized

```
┌─────────────┐
│   TOOLS     │
├─────────────┤
│  ┌───────┐  │
│  │ 25:00 │  │  ← Pomodoro Timer
│  │ START │  │
│  └───────┘  │
├─────────────┤
│  ┌───────┐  │
│  │ 📝    │  │  ← Personal Notes
│  │ Notes │  │
│  └───────┘  │
├─────────────┤
│  ┌───────┐  │
│  │  ?    │  │  ← "I'm Stuck" button
│  │ Help  │  │
│  └───────┘  │
└─────────────┘
```

#### 6. Friends Cluster (Bottom Right)
- Shows study session participants
- Avatars clustered like photo frames
- Shows status: active, idle, focused, stuck
- Expands on hover to show names

### Desk Surface Design

The desk isn't just a background—it has character:

```
Visual Properties:
├── Material: Warm wood grain texture
├── Lighting: Soft overhead light, slight vignette at edges
├── Shadow: Objects cast subtle shadows (consistent light source)
├── Ambient: Very subtle dust particles floating (optional, performance permitting)
└── Depth: Slight perspective (desk recedes slightly toward top)
```

---

## Cursor & Presence States

Cursors adapt based on context. A full cursor doesn't make sense everywhere.

### Context-Based Presence

| Context | Presence Representation |
|---------|------------------------|
| Desk view (book closed) | Full cursor with avatar |
| Same mode as you | Full cursor, fully visible |
| In book (you're outside) | Pin on book cover |
| In different mode | Small indicator on that object |
| Idle (30s+ no movement) | Cursor fades to 50% opacity |
| In focus mode | Cursor has "focus" ring |
| Stuck | Cursor has amber glow + ? |

### Cursor Anatomy

```
Standard Cursor (32x32 area):

       ╭─────╮
       │     │   ← Discord avatar (24px circle)
       │ 🙂  │
       │     │
       ╰──┬──╯
          │      ← Pointer tail (subtle)
          ▼

With Name (on hover or if setting enabled):

       ╭─────╮
       │ 🙂  │ Alice
       ╰──┬──╯
          ▼

Speaking State:
       ╭─────╮
     ◜ │ 🙂  │ ◝   ← Pulsing glow ring
     ◟ │     │ ◞
       ╰──┬──╯
          ▼

Stuck State:
       ╭─────╮
       │ 🙂  │ ?    ← Amber "?" badge
       │ ░░░ │      ← Amber glow
       ╰──┬──╯
          ▼

Focus Mode:
       ╭─────╮
       │ 🙂  │ 🍅   ← Tomato badge (pomodoro)
       │     │
       ╰─────╯       ← No pointer (not interactive)
```

### Book Pin Representation

When someone is in the book and you're viewing the desk:

```
Pin on Book Cover:

    📌 ← Pin head (4px)
   ╱
  │     ← Pin needle (8px)
 ╭┴╮
 │🙂│   ← Avatar (20px circle, smaller than cursor)
 ╰─╯

Clustered Pins (multiple users):

     📌 📌
    ╱  ╲╱
   │    │
  ╭┴╮ ╭┴╮
  │🙂││🙂│  ← Slight overlap, staggered
  ╰─╯╰─╯

Many Users (5+):

     📌📌📌
    ╱ │ ╲
   ╭┴┬┴┬┴╮
   │🙂🙂🙂│  +2   ← Overflow count
   ╰─────╯
```

### Presence in Content View (Book Open)

Inside the book, cursors behave more traditionally but with context:

```
Reading Content:

   │ The <h1> tag defines the most important heading. │
   │                                                  │
   │    🔵 ← Alice (cursor over text)                │
   │                                                  │
   │ Example:                                         │
   │ ┌────────────────────────────────────┐          │
   │ │ <h1>This is heading 1</h1>        │          │
   │ │              🟣 ← Ben              │          │
   │ └────────────────────────────────────┘          │

```

When users are in different sections:

```
Table of Contents (left page):

   │ ▸ HTML Basics                       │
   │   ├─ Introduction                   │
   │   ├─ Headings         🔵 Alice      │  ← Reading this section
   │   ├─ Paragraphs       🟣 Ben        │  ← Reading this section
   │   ├─ Links                          │
   │   └─ Images           🟢 Carol      │  ← Reading this section
   │ ▸ HTML Elements                     │
   │ ▸ HTML Attributes     ⚫ Dan (idle)  │

   Dots show position in TOC when in different subsection
```

---

## Screen Layouts

### Mobile Layout (320-480px)

Mobile completely reimagines the spatial layout while keeping the metaphor:

```
Mobile Home (Portrait):
┌─────────────────────┐
│ ┌─────────────────┐ │
│ │     StudyTG     │ │  ← Header (minimal)
│ └─────────────────┘ │
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │  ┌─────────┐  │  │
│  │  │W3Schools│  │  │  ← Book (tappable, hero element)
│  │  │   📚    │  │  │
│  │  │         │  │  │
│  │  │📌📌 📌  │  │  │  ← Pins visible
│  │  └─────────┘  │  │
│  │               │  │
│  └───────────────┘  │
│                     │
│ ┌─────┐┌─────┐┌────┐│
│ │ </> ││ ?!? ││ 🏆 ││  ← Mode buttons (bottom)
│ │Code ││Quiz ││Evnt││
│ └─────┘└─────┘└────┘│
│                     │
│ ┌─────────────────┐ │
│ │🔵🟣🟢⚫  [?][✓]│ │  ← Participant bar + actions
│ └─────────────────┘ │
└─────────────────────┘
```

```
Mobile Book Open (Portrait):
┌─────────────────────┐
│ ┌─────────────────┐ │
│ │ ← │ Headings │🍅 │ │  ← Back, section title, timer
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │                 │ │
│ │ The <h1> tag    │ │
│ │ defines...      │ │
│ │                 │ │
│ │ 🔵 ← Alice      │ │  ← Cursor as tap indicator
│ │                 │ │
│ │ ┌─────────────┐ │ │
│ │ │ <h1>Hello   │ │ │
│ │ │ </h1>       │ │ │
│ │ └─────────────┘ │ │
│ │                 │ │
│ │   [▶ Try It]    │ │
│ │                 │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ ◀ Intro │ Para ▶│ │  ← Page navigation
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │🔵🟣🟢   [?] [✓] │ │
│ └─────────────────┘ │
└─────────────────────┘
```

**Mobile Considerations:**
- Book takes center stage, single tap to open
- Mode buttons are bottom nav icons
- No full cursors, only tap indicators that fade
- Participant avatars along bottom, expandable
- Gestures: Swipe to change page, pull down to close book
- Tools accessible via floating action button or header

### Tablet Layout (481-768px)

```
Tablet Home (Landscape):
┌─────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────┐ │
│ │  StudyTogether          [🍅 25:00]    [⚙️]     │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│   ┌─────────┐    ┌──────────────────┐   ┌───────┐  │
│   │  🏆     │    │                  │   │ Tools │  │
│   │  Event  │    │    TEXTBOOK      │   │       │  │
│   │         │    │                  │   │ [🍅]  │  │
│   └─────────┘    │    📌📌 📌📌     │   │ [📝]  │  │
│                  │                  │   │ [?]   │  │
│   ┌─────┐┌─────┐ │                  │   │       │  │
│   │</>  ││ ?!? │ │                  │   └───────┘  │
│   │Code ││Quiz │ └──────────────────┘              │
│   └─────┘└─────┘                                   │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🔵 Alice  🟣 Ben  🟢 Carol  ⚫ Dan     [?] [✓]  │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Desktop Layout (769px+)

See previous ASCII diagrams in this document. Desktop gets the full desk experience with all objects visible and interactive.

---

## Navigation & Transitions

### Core Transitions

All major view changes should feel like physical actions with objects.

#### 1. Opening the Book

```
Trigger:     Click book on desk
Duration:    500ms
Easing:      cubic-bezier(0.34, 1.56, 0.64, 1)

Sequence:
0ms:    Book lifts (translateY: -10px, scale: 1.02)
100ms:  Cover begins rotating (rotateY: 0 → -160deg)
200ms:  Pages spread, book expands
300ms:  Desk objects fade/slide to edges (opacity, translateX)
400ms:  Book fills main area, content fades in
500ms:  Settle, interactive

Sound: Book opening (page flutter)
```

#### 2. Closing the Book

```
Trigger:     Click "Close Book" or back gesture
Duration:    400ms
Easing:      ease-in-out

Sequence:
0ms:    Content fades, book begins to shrink
100ms:  Cover rotating closed (rotateY: -160deg → 0)
200ms:  Desk objects fade/slide back in
300ms:  Book settles on desk
400ms:  Complete

Sound: Book closing (soft thump)
```

#### 3. Opening Sandbox (Laptop)

```
Trigger:     Click laptop on desk
Duration:    450ms

Sequence:
0ms:    Laptop lifts slightly
100ms:  Lid opens (rotateX animation)
200ms:  Screen expands to fill view
350ms:  Code editor interface fades in
450ms:  Complete

Sound: Laptop opening (mechanical click)
```

#### 4. Opening Quiz (Notepad)

```
Trigger:     Click notepad on desk
Duration:    400ms

Sequence:
0ms:    Notepad lifts
100ms:  Pages flip animation (rapid)
200ms:  Expands to quiz interface
300ms:  First question fades in
400ms:  Complete

Sound: Pages flipping
```

#### 5. Mode Switching (within modes)

When switching between modes without going back to desk:

```
Option A: Quick fade (for related modes)
- Duration: 200ms
- Crossfade between interfaces

Option B: Return to desk first (for unrelated modes)
- Close current → desk visible briefly → open new
- Duration: 600-800ms total
- Maintains spatial consistency
```

### Navigation Patterns

```
Desk (home)
├── Book → Reading Mode
│   ├── Sections (pagination within book)
│   └── Try It → Inline sandbox (overlay on book page)
├── Laptop → Sandbox Mode
│   └── (various sandbox functions)
├── Notepad → Quiz Mode
│   └── (quiz flow)
├── Poster → Event Mode
│   └── (event-specific flows)
└── Tools → (overlays, don't leave desk context)
    ├── Timer (overlay/widget)
    ├── Notes (slide-in panel)
    └── Help (modal or indicator)
```

---

## Component Specifications

### Book Component

```typescript
interface BookProps {
  isOpen: boolean;
  currentSection: string;
  currentPage: number;
  totalPages: number;
  usersInBook: UserPin[];
  onOpen: () => void;
  onClose: () => void;
  onPageChange: (page: number) => void;
  onSectionChange: (section: string) => void;
}

interface UserPin {
  odId: string;
  odAvatarUrl: string;
  odDisplayName: string;
  currentSection: string;
  currentPage: number;
  status: 'active' | 'idle' | 'stuck' | 'focused';
}
```

**Subcomponents:**
- `<BookCover />` - Closed state rendering
- `<BookSpine />` - Side view when open
- `<BookPages />` - Page edges
- `<BookContent />` - Inner content (left: TOC, right: content)
- `<UserPins />` - Pins on closed book
- `<PageNavigation />` - Page flip controls

### Desk Component

```typescript
interface DeskProps {
  participants: Participant[];
  activeEvent: Event | null;
  bookState: BookState;
  unreadNotifications: number;
}
```

**Subcomponents:**
- `<DeskSurface />` - Background, shadows
- `<DeskObject />` - Wrapper for interactive objects
- `<Laptop />` - Sandbox entry
- `<Notepad />` - Quiz entry
- `<EventPoster />` - Event display
- `<ToolsTray />` - Persistent tools

### Cursor Component

```typescript
interface CursorProps {
  user: User;
  position: { x: number; y: number };
  state: CursorState;
  context: 'desk' | 'book' | 'sandbox' | 'quiz';
  isSpeaking: boolean;
  showName: boolean;
}

type CursorState = 'active' | 'idle' | 'stuck' | 'focused' | 'helping';
```

**Variants:**
- `<FullCursor />` - Standard cursor with avatar
- `<BookPin />` - Pin representation on book
- `<TapIndicator />` - Mobile tap position
- `<MiniMarker />` - Small dot for presence on objects

---

## Animation Specifications

### Timing Tokens

```css
:root {
  /* Durations */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-dramatic: 800ms;
  
  /* Easings */
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0.0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### Animation Catalog

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Button hover | 100ms | ease-out | Hover |
| Button press | 80ms | ease-in | Click |
| Object lift | 200ms | ease-bounce | Hover on desk object |
| Book open | 500ms | ease-bounce | Click book |
| Book close | 400ms | ease-in-out | Click close |
| Cursor move | 50-100ms | linear | Position update |
| Cursor fade in | 300ms | ease-out | User joins |
| Cursor fade out | 400ms | ease-in | User leaves |
| Speaking pulse | 1000ms | ease-in-out | Loop while speaking |
| Stuck glow | 2000ms | ease-in-out | Loop while stuck |
| Page turn | 300ms | ease-out | Navigate |
| Pin appear | 200ms | ease-spring | Enter book |
| Achievement | 600ms | ease-bounce | Unlock |

### Framer Motion Examples

```tsx
// Book opening animation
const bookVariants = {
  closed: {
    rotateY: 0,
    scale: 1,
    y: 0,
  },
  opening: {
    rotateY: -15,
    scale: 1.02,
    y: -10,
    transition: { duration: 0.15 }
  },
  open: {
    rotateY: -160,
    scale: 1.5,
    y: 0,
    transition: { 
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1]
    }
  }
};

// Cursor interpolation
const cursorVariants = {
  animate: (position) => ({
    x: position.x,
    y: position.y,
    transition: {
      type: "tween",
      duration: 0.08,
      ease: "linear"
    }
  })
};

// Desk object hover
const deskObjectVariants = {
  idle: { y: 0, scale: 1 },
  hover: { 
    y: -8, 
    scale: 1.03,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17
    }
  }
};
```

---

## Technical Implementation

### Stack Reference

As specified in project:
- **Framework**: React in Next.js (SPA behavior)
- **Platform**: Discord Activity (via Discord SDK)
- **Sync**: Robo.js with @robojs/sync (useSyncState)
- **Styling**: TBD (recommend Tailwind + CSS modules)
- **Animation**: Framer Motion

### Robo.js Sync Integration

```tsx
// Example: Syncing cursor position
import { useSyncState } from '@robojs/sync';

function useCursorSync() {
  const [cursors, setCursors] = useSyncState<Record<string, CursorState>>('cursors', {});
  
  const updateMyCursor = useCallback((position: Position) => {
    setCursors(prev => ({
      ...prev,
      [myUserId]: {
        position,
        state: myState,
        lastUpdate: Date.now()
      }
    }));
  }, [myUserId, myState]);
  
  return { cursors, updateMyCursor };
}

// Example: Syncing book state
function useBookSync() {
  const [bookState, setBookState] = useSyncState<BookSyncState>('book', {
    usersReading: {},
    sharedPage: null, // null = everyone on own page
  });
  
  const enterBook = useCallback((section: string, page: number) => {
    setBookState(prev => ({
      ...prev,
      usersReading: {
        ...prev.usersReading,
        [myUserId]: { section, page }
      }
    }));
  }, [myUserId]);
  
  return { bookState, enterBook, exitBook, changePage };
}
```

### Component Folder Structure

```
src/
├── components/
│   ├── desk/
│   │   ├── Desk.tsx
│   │   ├── DeskSurface.tsx
│   │   ├── DeskObject.tsx
│   │   ├── Laptop.tsx
│   │   ├── Notepad.tsx
│   │   ├── EventPoster.tsx
│   │   └── ToolsTray.tsx
│   ├── book/
│   │   ├── Book.tsx
│   │   ├── BookCover.tsx
│   │   ├── BookContent.tsx
│   │   ├── BookSpine.tsx
│   │   ├── TableOfContents.tsx
│   │   └── PageNavigation.tsx
│   ├── presence/
│   │   ├── Cursor.tsx
│   │   ├── BookPin.tsx
│   │   ├── TapIndicator.tsx
│   │   ├── ParticipantBar.tsx
│   │   └── StatusIndicator.tsx
│   ├── sandbox/
│   │   ├── Sandbox.tsx
│   │   ├── CodeEditor.tsx
│   │   └── OutputPanel.tsx
│   ├── quiz/
│   │   ├── Quiz.tsx
│   │   ├── Question.tsx
│   │   └── Leaderboard.tsx
│   └── shared/
│       ├── Timer.tsx
│       ├── Button.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useCursorSync.ts
│   ├── useBookSync.ts
│   ├── usePresence.ts
│   └── useDiscordSdk.ts
├── contexts/
│   ├── StudyContext.tsx
│   └── PresenceContext.tsx
├── styles/
│   ├── tokens.css
│   └── animations.css
└── assets/
    ├── textures/
    │   ├── wood-grain.png
    │   └── paper-texture.png
    ├── objects/
    │   ├── book-cover.svg
    │   ├── laptop.svg
    │   └── notepad.svg
    └── sounds/
        ├── book-open.mp3
        └── ...
```

### Performance Considerations

```
CURSOR UPDATES:
- Throttle outgoing updates to 30fps max
- Use requestAnimationFrame for incoming interpolation
- Batch state updates

ANIMATIONS:
- Use CSS transforms (GPU accelerated)
- Avoid animating layout properties (width, height, top, left)
- Use will-change sparingly and remove after animation

TEXTURES/IMAGES:
- Preload desk textures on init
- Use WebP with PNG fallback
- Consider CSS gradients for simple textures

MOBILE:
- Reduce animation complexity
- Disable ambient particles
- Simplify shadows (single shadow vs layered)
```

---

## Asset Requirements

### Images/Textures Needed

| Asset | Format | Size | Notes |
|-------|--------|------|-------|
| Desk surface | PNG/WebP | 1920x1080 | Tileable or cover |
| Book cover | SVG | - | Scalable, layered |
| Book pages (side) | SVG | - | For thickness effect |
| Paper texture | PNG | 512x512 | Tileable, overlay |
| Laptop | SVG | - | Open/closed states |
| Notepad | SVG | - | With spiral |
| Event poster | SVG | - | Template, dynamic content |
| Pin | SVG | - | Small, with shadow |

### Sound Assets Needed

| Sound | Duration | Notes |
|-------|----------|-------|
| book-open | ~400ms | Page flutter + thump |
| book-close | ~300ms | Soft close |
| page-turn | ~200ms | Single page flip |
| laptop-open | ~200ms | Mechanical click |
| notepad-flip | ~300ms | Multiple pages |
| cursor-join | ~200ms | Warm chime |
| cursor-leave | ~200ms | Soft fade |
| stuck-ping | ~150ms | Question tone |
| got-it | ~200ms | Success ding |
| timer-start | ~300ms | Bell tone |
| timer-end | ~400ms | Relief chime |

---

## Open Questions

1. **W3Schools Content**: How are we sourcing/embedding this? API? Scraping? Partnership?

2. **Book Pagination**: Match W3Schools page structure or create our own?

3. **Mobile Gestures**: What gestures feel most natural for book navigation on mobile?

4. **Event Complexity**: How visually distinct should events be from the main desk? Separate "room"?

5. **Accessibility**: How do we make the spatial metaphor work with screen readers?

6. **Offline**: Any offline capability, or fully online-only?

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | [DATE] | Initial design system document |

---

*This document should be read alongside MANIFESTO.md. The manifesto covers the "what and why" — this document covers the "how it looks and feels."*

**Remember: It's a study space, not a webpage. Objects, not interfaces. Depth, not flatness.**

📚 Let's build somewhere people want to study.
