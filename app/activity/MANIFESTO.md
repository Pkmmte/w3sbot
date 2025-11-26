# 📚 StudyTogether — Product Manifesto

> A Discord Activity for collaborative learning on W3Schools tutorials.
> "Learning alone is fine. Learning together is unforgettable."

---

## Table of Contents

1. [Vision & Philosophy](#vision--philosophy)
2. [Core Principles](#core-principles)
3. [Design Language](#design-language)
4. [Platform Considerations](#platform-considerations)
5. [Feature Phases](#feature-phases)
   - [Phase 1: Foundation](#phase-1-foundation--presence--core-experience)
   - [Phase 2: Collaboration](#phase-2-collaboration--learning-together)
   - [Phase 3: Gamification](#phase-3-gamification--progress--motivation)
   - [Phase 4: Events](#phase-4-events--weekly-challenges)
6. [Feature Deep Dives](#feature-deep-dives)
7. [Animation & Sound Design](#animation--sound-design)
8. [Technical Requirements](#technical-requirements)
9. [Success Metrics](#success-metrics)

---

## Vision & Philosophy

### The Problem
Learning to code online is lonely. You're staring at tutorials, copying examples, and hoping something sticks. Even when you're in a Discord call with friends "studying together," you're really just alone—together.

### The Solution
StudyTogether transforms passive tutorial consumption into an active, social, game-like experience. It's the feeling of sitting in a study room with friends, pointing at each other's screens, asking "wait, what?" and having someone explain it right there.

### Core Experience Statement
> **The content is the star. The collaboration is the magic. The game feel is the glue.**

We are NOT building:
- A chat app (Discord handles that)
- A social network
- A gamified distraction from learning

We ARE building:
- A multiplayer viewport into W3Schools tutorials
- A shared space where confusion is visible and help is instant
- A study tool that makes the grind feel like a co-op game

---

## Core Principles

### 1. Content First, Always
The W3Schools tutorial content is the primary focus. Every feature we build should enhance understanding of that content—not distract from it. UI elements should frame the content, not compete with it.

### 2. Presence is Powerful
Simply seeing that others are there—their cursors moving, their focus indicators, their progress—creates accountability and connection without requiring constant interaction.

### 3. Confusion is Valuable
In traditional learning, confusion is hidden (embarrassing). Here, confusion is surfaced and celebrated. Every "I'm stuck" is an opportunity for someone else to teach—and teaching is the deepest form of learning.

### 4. Solo is Valid
Not every session is a group session. The app must feel complete and valuable for someone studying alone. Group features enhance but don't define the experience.

### 5. Game Feel, Not Games
We use animations, sounds, and feedback loops from video games to make studying feel satisfying—not to turn studying into a game that distracts from the material.

### 6. Respect the Flow State
When someone is deep in focus, don't interrupt them. Notifications, animations, and social features should have "quiet" modes during focus periods.

---

## Design Language

### Visual Identity

#### Color Philosophy
```
Primary:      Deep navy/slate      — The "study room" feeling
Accent:       Electric cyan/teal   — Energy, interactivity, "online" feeling
Success:      Soft green           — Understanding, progress, "got it"
Struggle:     Warm amber           — Attention needed, not alarming
Focus:        Muted purple         — Concentration, pomodoro active
```

#### Aesthetic Keywords
- **Cozy productivity** — Like a well-lit library at night
- **Soft futurism** — Modern, clean, slightly sci-fi without being cold
- **Tactile feedback** — Everything you interact with responds
- **Spatial awareness** — You always know where others are

### Animation Principles

#### Timing
| Action Type | Duration | Easing |
|-------------|----------|--------|
| Micro-interactions (buttons, hovers) | 100-150ms | ease-out |
| State changes (mode switches) | 200-300ms | ease-in-out |
| Entrance animations | 300-400ms | ease-out with slight bounce |
| Cursor movements (others) | 50-100ms | linear (interpolated) |
| Celebration moments | 500-800ms | spring physics |

#### Motion Philosophy
- **Cursors**: Smooth interpolation, never teleport (unless reconnecting)
- **UI Elements**: Subtle scale/fade transitions, never jarring
- **Celebrations**: Particle effects, confetti—but contained and brief
- **Focus Mode**: Animations reduce in intensity, colors mute slightly

### Sound Design

#### Sound Categories
```
UI Sounds (subtle, satisfying):
├── Button clicks         — Soft "pop" or "tick"
├── Toggle switches       — Satisfying "click"
├── Navigation            — Gentle "whoosh"
└── Text input            — Optional soft keystrokes

Social Sounds (noticeable but not annoying):
├── User joins            — Warm chime (ascending)
├── User leaves           — Soft tone (descending)
├── Someone stuck         — Gentle "?" sound
├── Help offered          — Positive ding
└── Highlight/ping        — Attention sound (customizable)

Achievement Sounds (celebratory):
├── Lesson complete       — Success fanfare (short)
├── Quiz correct          — Bright "ding!"
├── Quiz wrong            — Soft "bonk" (not punishing)
├── Streak milestone      — Level-up sound
└── Session complete      — Satisfying "completion" tone

Pomodoro Sounds:
├── Focus start           — Deep, grounding tone
├── 5 min warning         — Subtle alert
├── Break time            — Relieving chime
└── Break ending          — Gentle "back to work" tone
```

#### Sound Principles
- All sounds optional (respect for those who hate sounds)
- Volume separate from Discord/system volume
- "Focus Mode" auto-mutes non-essential sounds
- Sounds should be short (< 1 second for most)
- Never use sounds that could be mistaken for Discord notifications

---

## Platform Considerations

### Discord Activity Constraints
- Runs in an iframe within Discord
- Access to Discord SDK (user info, voice state, activity participants)
- Must work within Discord's CSP (Content Security Policy)
- Limited to Discord's activity viewport size

### Responsive Design Requirements

#### Breakpoints
```
Mobile (Discord mobile app):    320px - 480px
Tablet (Discord on tablet):     481px - 768px
Desktop (Discord desktop app):  769px+
```

#### Layout Strategy

**Mobile (320-480px)**
```
┌─────────────────────┐
│ [Header: Minimal]   │
├─────────────────────┤
│                     │
│   Content Area      │
│   (W3Schools)       │
│   Full width        │
│                     │
├─────────────────────┤
│ [Code Editor]       │
│ (Collapsible)       │
├─────────────────────┤
│ [👤👤👤] [?] [✓]   │
│ Participant bar     │
└─────────────────────┘

- Cursors shown as small avatars at screen edge when off-viewport
- Tap avatar to jump to their position
- Editor slides up from bottom
- Pomodoro timer in header (compact)
```

**Tablet (481-768px)**
```
┌─────────────────────────────┐
│ [Header + Timer + Controls] │
├─────────────────────────────┤
│                             │
│   Content Area              │
│   (W3Schools)               │
│                             │
├─────────────────────────────┤
│   Code Editor (resizable)   │
│                             │
├─────────────────────────────┤
│ [Participants] [Actions]    │
└─────────────────────────────┘

- Cursors fully visible
- Side panel available but hidden by default
- Split view: content + editor
```

**Desktop (769px+)**
```
┌───────────────────────────────────────────────┐
│ [Logo] [Lesson Nav] [Timer] [Mode] [Settings] │
├───────────────────────────────────────────────┤
│                           │                   │
│   Content Area            │   Side Panel      │
│   (W3Schools Tutorial)    │   - Participants  │
│                           │   - Progress      │
│   Cursors visible         │   - Chat/Notes    │
│   Highlights visible      │                   │
│                           │                   │
├───────────────────────────┴───────────────────┤
│   Code Editor (full width, resizable height)  │
│                                               │
└───────────────────────────────────────────────┘

- Full cursor visibility with names
- Side panel always visible (collapsible)
- Keyboard shortcuts active
```

### Touch vs Mouse Considerations

| Feature | Mouse | Touch |
|---------|-------|-------|
| Cursor presence | Real-time cursor | Tap indicator (fades) |
| Highlighting | Click-drag | Long press + drag |
| Code selection | Standard | Touch handles |
| Ping location | Double-click | Double-tap |
| Context menus | Right-click | Long press |

---

## Feature Phases

---

### Phase 1: Foundation — Presence & Core Experience

**Timeline Goal**: MVP — The app is usable and valuable

**Theme**: "You're not alone"

#### Features

##### 1.1 Content Viewer
The W3Schools tutorial viewer is the heart of the application.

**Requirements:**
- [ ] Embed/render W3Schools tutorial content
- [ ] Smooth scrolling with scroll position sync (optional)
- [ ] Proper text rendering and code syntax highlighting
- [ ] Responsive layout that doesn't break tutorial formatting
- [ ] Navigation between lessons/sections
- [ ] Remember last position per user

**Technical Notes:**
- Investigate W3Schools content API or scraping strategy
- May need to proxy/transform content for embedding
- Preserve all interactive elements if possible

##### 1.2 Shared Cursors + Presence
See everyone. Be seen.

**Requirements:**
- [ ] Real-time cursor positions broadcast to all participants
- [ ] Cursor represented by Discord avatar (circular, ~28px)
- [ ] Name label near cursor (toggleable, auto-hide after inactivity)
- [ ] Smooth interpolation of cursor movement (no teleporting)
- [ ] Cursor "ghost" when user is on different section (shows at edge)
- [ ] Cursor fades after 30s of inactivity (returns on movement)
- [ ] Speaking indicator on cursor (glow/ring) when user is talking in Discord voice

**Mobile Adaptation:**
- [ ] Show last-tap position as temporary ping
- [ ] Avatar indicators at screen edge for off-screen users
- [ ] Tap indicator shows cursor briefly, then fades

**Animations:**
- Cursor entrance: Fade in with subtle scale (0.8 → 1.0)
- Cursor exit: Fade out
- Speaking state: Pulsing glow ring
- Inactivity fade: Gradual opacity reduction

**Sounds:**
- User joins: Warm ascending chime
- User leaves: Soft descending tone
- (Both optional, off by default)

##### 1.3 Participant Awareness
Always know who's in the room.

**Requirements:**
- [ ] Participant bar showing all users (avatar + name)
- [ ] Visual indicator for: active, idle, in focus mode
- [ ] Click/tap avatar to jump to their viewport position
- [ ] Show voice activity status (from Discord SDK)
- [ ] Maximum ~8 avatars visible, "+N" overflow with dropdown

**Layout:**
- Desktop: Side panel (persistent)
- Mobile: Bottom bar (compact)

##### 1.4 Settings & Preferences
Respect user preferences from day one.

**Requirements:**
- [ ] Sound on/off (master toggle)
- [ ] Individual sound category toggles
- [ ] Sound volume slider
- [ ] Animation intensity (full, reduced, minimal)
- [ ] Show/hide cursor names
- [ ] Show/hide own cursor to others (stealth mode?)
- [ ] Theme preference (if multiple themes later)

**Storage:**
- Persist to localStorage
- Eventually sync to user profile (Discord-linked)

---

### Phase 2: Collaboration — Learning Together

**Timeline Goal**: Social features that deepen learning

**Theme**: "Confusion is visible. Help is instant."

#### Features

##### 2.1 "I'm Stuck" / "I Get It" System
Surface confusion, enable help.

**Requirements:**
- [ ] Two-button system always accessible: [?] and [✓]
- [ ] Pressing [?] marks user as stuck
  - Visual: Amber glow around their cursor
  - Visual: Optional marker at their scroll position
  - Persists until cleared or [✓] is pressed
- [ ] Pressing [✓] marks concept as understood
  - Clears stuck state if active
  - Brief celebration animation (subtle)
- [ ] Optional: Attach stuck state to specific content/line

**Group Awareness:**
- [ ] Counter showing "2/5 people stuck on this section"
- [ ] Heat indication on progress bar showing struggle points
- [ ] History of stuck points (for session summary)

**Animations:**
- Stuck activation: Cursor pulses amber, "?" icon appears
- Stuck clear: Icon dissolves with sparkle
- Got it: Brief green flash, optional micro-confetti

**Sounds:**
- Stuck: Soft questioning tone (gentle "hm?")
- Got it: Bright, short success sound

##### 2.2 Explain It / Help System
Enable peer teaching.

**Requirements:**
- [ ] When someone is stuck, others see a "Help" button
- [ ] Clicking "Help" indicates you're offering to explain
- [ ] Visual: Your cursor gets a "teacher" indicator
- [ ] One-click "Jump to them" to go to their position
- [ ] After helping, both parties can confirm resolution
- [ ] Track: Who helped whom (for achievements, stats)

**Animations:**
- Help offered: Helper cursor gets subtle star/badge
- Help accepted: Brief connection line animation between cursors
- Resolution: Mutual success animation

**Sounds:**
- Help offered: Positive notification ping
- Resolution: Satisfying "success" tone

##### 2.3 Shared Code Sandbox
Multiplayer coding environment.

**Requirements:**
- [ ] Code editor that syncs in real-time (operational transformation or CRDT)
- [ ] Multiple cursor support (see where others are typing)
- [ ] Syntax highlighting (match W3Schools languages: HTML, CSS, JS, Python, SQL, etc.)
- [ ] "Run" button to execute code
- [ ] Output panel showing results
- [ ] Individual mode: Everyone has their own sandbox
- [ ] Shared mode: One sandbox, everyone edits together
- [ ] Toggle between modes

**Run & Compare Feature:**
- [ ] In individual mode, "Compare" button shows everyone's solutions
- [ ] Side-by-side or carousel view of different approaches
- [ ] Great for "there's more than one way" moments

**Technical Notes:**
- Consider Yjs or Automerge for CRDT
- Monaco editor or CodeMirror for editing
- Sandboxed iframe for code execution (security!)

**Mobile Adaptation:**
- [ ] Full-screen editor mode (slides up)
- [ ] Simplified toolbar
- [ ] External keyboard support

**Animations:**
- Code run: Button shows loading state, output slides in
- Compare reveal: Cards fan out or carousel animation
- Cursor typing: Subtle caret with user color

**Sounds:**
- Code run: Soft "execute" click
- Success output: Brief positive tone
- Error: Soft "bonk" (not harsh)

##### 2.4 Highlight & Ping
Point at things while talking.

**Requirements:**
- [ ] Select any text/code to highlight it
- [ ] Highlight visible to all participants
- [ ] Highlight fades after ~10 seconds (or manual clear)
- [ ] Double-click/double-tap to ping a location
- [ ] Ping shows animated ripple, draws attention
- [ ] Multiple highlights can coexist (different colors per user)

**Animations:**
- Highlight: Fade in with user's color, soft glow
- Highlight fade: Gradual opacity reduction
- Ping: Ripple effect expanding from point

**Sounds:**
- Ping: Attention-getting but not jarring (like a soft "pop")

---

### Phase 3: Gamification — Progress & Motivation

**Timeline Goal**: Make the grind satisfying

**Theme**: "Every session counts"

#### Features

##### 3.1 Synced Pomodoro Timer
Shared focus, shared breaks.

**Requirements:**
- [ ] Configurable timer (default: 25 min focus, 5 min break)
- [ ] Synced across all participants OR individual timers
- [ ] Visual: Prominent timer display, progress ring
- [ ] Focus mode: Slightly dims non-essential UI, quiets notifications
- [ ] Break mode: UI returns to normal, celebratory moment
- [ ] Pause/skip options (with confirmation)
- [ ] Session counter: "Focus 2 of 4"

**Auto-Adjustments During Focus:**
- [ ] Cursor names auto-hide
- [ ] Sound volume reduces
- [ ] "Stuck" signals still work (muted)
- [ ] No achievement popups

**Animations:**
- Timer start: Ring fills in, satisfying initiation
- Focus mode activation: UI elements subtly dim/shift
- Break time: Burst of energy, ring resets
- Final minute: Subtle pulse warning

**Sounds:**
- Focus start: Deep, grounding tone (meditation bell style)
- 5 minute warning: Gentle alert
- Break time: Relieving, uplifting chime
- Break ending: Soft "returning" sound

##### 3.2 Progress Trails
See where everyone's been.

**Requirements:**
- [ ] Visual progress bar for tutorial/lesson
- [ ] Your progress: Solid line
- [ ] Others' progress: Lighter/dotted lines or markers
- [ ] "Struggle zones": Sections where people spent time or got stuck (heat map)
- [ ] Click/tap to jump to any position
- [ ] Group progress summary: "4/5 people have reached Section 3"

**Animations:**
- Progress update: Smooth line extension
- Struggle zone: Subtle pulsing warmth
- Catching up: Satisfying "snap" when you reach others

**Sounds:**
- Milestone reached: Brief achievement sound
- (Most progress updates are silent to avoid noise)

##### 3.3 Quiz Battles
Active recall, together.

**Requirements:**
- [ ] Quiz mode: Multiple choice or fill-in-blank questions
- [ ] Questions based on current tutorial content
- [ ] Real-time: See others' cursors hovering over answers
- [ ] Timer per question (creates urgency)
- [ ] Reveal: Show everyone's answers simultaneously
- [ ] Scoring: Points for correct, bonus for speed
- [ ] Leaderboard for the session

**Solo Mode:**
- [ ] Same quiz experience, just no competition
- [ ] Track personal best times/scores

**Mobile Adaptation:**
- [ ] Large tap targets for answers
- [ ] Simplified leaderboard view

**Animations:**
- Question reveal: Card flips in
- Answer hover (others): Subtle indicator near option
- Reveal moment: Dramatic pause, then results
- Correct answer: Green flash, points animate up
- Wrong answer: Red flash (brief), correct answer highlights

**Sounds:**
- Question appear: Alert sound
- Timer running low: Subtle ticking (optional)
- Answer locked in: Click
- Correct: Bright "ding!"
- Wrong: Soft "bonk"
- Round winner: Fanfare (short)

##### 3.4 Debugging Sessions
Collaborative bug hunts.

**Requirements:**
- [ ] "Debug Challenge" mode
- [ ] Paste or load broken code
- [ ] Everyone hunts for the bug
- [ ] "Found it!" button to claim discovery
- [ ] Must explain the bug to confirm (prevents guessing)
- [ ] Points/achievements for finding bugs
- [ ] Can create custom challenges for friends

**Flow:**
1. Host starts debug challenge
2. Broken code appears in shared sandbox
3. Everyone investigates (cursors visible)
4. First to find can claim it
5. Explainer highlights the bug and explains
6. Others confirm understanding
7. Optional: Fix together

**Animations:**
- Challenge start: Code "breaks" in with glitch effect
- Investigation: Normal cursor behavior
- Found it: Spotlight effect on the claimer
- Bug reveal: Highlighted with dramatic zoom

**Sounds:**
- Challenge start: Alert/siren (playful)
- "Found it" claim: Achievement sound
- Correct identification: Victory fanfare

##### 3.5 Achievements & XP
Long-term motivation.

**Requirements:**
- [ ] XP earned for:
  - Completing lessons
  - Time spent studying
  - Helping others (confirmed)
  - Quiz performance
  - Debugging challenges
  - Streaks
- [ ] Levels based on XP (visual progression)
- [ ] Achievements for milestones:
  - "First Steps" — Complete your first lesson
  - "Helper" — Helped 5 people
  - "Bug Hunter" — Found 10 bugs
  - "Marathon" — 5-hour study week
  - "Streak Master" — 7-day streak
  - etc.
- [ ] Achievement display in profile
- [ ] Server leaderboard (opt-in, toggleable by server)

**Animations:**
- XP gain: Numbers float up, satisfying
- Level up: Full-screen celebration (brief)
- Achievement unlock: Badge slides in with fanfare

**Sounds:**
- XP gain: Soft coin/chime
- Level up: Triumphant fanfare
- Achievement: Unique achievement sound

---

### Phase 4: Events — Weekly Challenges

**Timeline Goal**: Recurring engagement drivers

**Theme**: "Special moments that bring everyone together"

#### Features

##### 4.1 Weekly Challenges
Time-limited events.

**Requirements:**
- [ ] One featured challenge per week
- [ ] Types of challenges:
  - Speed run: Complete X lessons fastest
  - Bug bash: Special debugging challenges
  - Quiz tournament: Bracket-style competition
  - Collaboration challenge: Group must complete together
- [ ] Global leaderboard for the event
- [ ] Exclusive badges/rewards for top performers
- [ ] Announced in Discord (via bot or activity notification)

**Event Schedule:**
```
Monday:    Challenge announced
Mon-Sat:   Challenge active
Sunday:    Results announced, rewards distributed
```

**Participation:**
- [ ] Can participate solo or with group
- [ ] Group scores aggregate (encourages playing together)
- [ ] Participation rewards (not just winners)

##### 4.2 Event Minigames
Special modes only available during events.

**Ideas for Minigames:**
- **Code Golf**: Solve problem in fewest characters
- **Speed Coding**: Complete function fastest
- **Memory Match**: Match code snippets to outputs
- **Debug Rush**: Bug hunt with time pressure
- **Teach Race**: First to help 3 stuck people

**Requirements:**
- [ ] Separate from main study experience
- [ ] Clear "Event" branding/theming
- [ ] Special visual treatment (different color scheme, particles, etc.)
- [ ] Limited availability creates urgency
- [ ] Spectator mode for finished participants

**Animations:**
- Event mode: Special intro animation, themed UI
- Minigame countdown: Dramatic 3-2-1
- Victory: Extra-celebratory effects
- Event end: Results cascade in

**Sounds:**
- Event music: Optional background music (toggleable)
- Event sounds: More dramatic versions of standard sounds
- Victory: Grand fanfare

##### 4.3 Seasonal Events
Major events tied to real-world timing.

**Ideas:**
- **Hacktober**: Halloween-themed debugging
- **New Year Challenge**: Complete X lessons to start the year
- **Summer Study Jam**: Extended challenge during summer
- **Back to School**: Special beginner-friendly events

**Requirements:**
- [ ] Themed visual treatments
- [ ] Exclusive seasonal badges
- [ ] Longer duration (1-4 weeks)
- [ ] Story/narrative element (optional)

---

## Feature Deep Dives

### Cursor System Technical Specification

#### Data Model
```typescript
interface CursorState {
  odId: string;           // Uuser ID
  position: {
    x: number;            // 0-1 relative to viewport
    y: number;            // 0-1 relative to viewport
    scrollY: number;      // Absolute scroll position
    section: string;      // Current section ID
  };
  state: 'active' | 'idle' | 'focused' | 'stuck';
  speaking: boolean;      // From Discord voice state
  lastUpdate: number;     // Timestamp for staleness
}
```

#### Sync Strategy
- **Broadcast rate**: 30fps max (throttled)
- **Interpolation**: Client-side smoothing between updates
- **Stale detection**: Cursor fades if no update for 30s
- **Reconnection**: Cursors re-appear smoothly (no pop)

#### Rendering
- Use CSS transforms for performance
- Hardware-accelerated animations
- Batch DOM updates
- Consider canvas rendering for many cursors (10+)

---

### Code Sandbox Technical Specification

#### Requirements
- **Real-time sync**: < 100ms latency for edits
- **Conflict resolution**: CRDT-based (Yjs recommended)
- **Supported languages**: HTML, CSS, JavaScript, Python, SQL, PHP
- **Execution**: Sandboxed iframe with postMessage communication
- **Security**: No network access from sandbox, memory limits, execution timeout

#### Editor Features
- Syntax highlighting
- Basic autocomplete
- Error highlighting (lint)
- Line numbers
- Multiple cursor support
- Minimap (desktop only)

---

### Quiz System Technical Specification

#### Question Types
1. **Multiple Choice**: 4 options, one correct
2. **Multiple Select**: 4+ options, multiple correct
3. **Fill in Blank**: Code completion
4. **True/False**: Simple binary
5. **Order**: Arrange steps correctly

#### Timing
- Per-question timer: 15-60 seconds (configurable)
- Bonus points: Faster correct answers = more points
- Grace period: 2s after timer for mobile latency

#### Scoring
```
Base points:      100
Speed bonus:      +50 (first 25% of time)
                  +25 (first 50% of time)
Streak bonus:     +10 per consecutive correct
Wrong answer:     0 points (no penalty)
```

---

## Animation & Sound Design

### Animation Library Recommendation
- **Framer Motion** for React-based UI animations
- **GSAP** for complex timeline animations
- **CSS transitions** for simple state changes
- **Lottie** for pre-rendered complex animations (achievements, celebrations)

### Sound Implementation
- **Howler.js** for audio management
- Preload all sounds on app init
- Sound sprite for multiple short sounds
- Respect system mute/do-not-disturb

### Performance Budget
- Animations should not drop below 60fps
- Sound loading should not block app init
- Disable animations if `prefers-reduced-motion` is set
- Cursor rendering should handle 10+ simultaneous cursors

---

## Technical Requirements

### Stack Recommendations
```
Frontend:
├── Framework:        React (or Solid.js for performance)
├── State:            Zustand or Jotai
├── Styling:          Tailwind CSS + CSS Modules
├── Animations:       Framer Motion
├── Audio:            Howler.js
├── Code Editor:      Monaco or CodeMirror 6
└── Real-time:        Yjs + WebSocket provider

Backend:
├── Runtime:          Node.js or Bun
├── Framework:        Fastify or Hono
├── Real-time:        WebSockets (native or Socket.io)
├── Database:         PostgreSQL (users, progress, achievements)
├── Cache:            Redis (sessions, real-time state)
└── Auth:             Discord OAuth (via Discord SDK)

Infrastructure:
├── Hosting:          Cloudflare Workers / Vercel / Railway
├── WebSockets:       PartyKit or Cloudflare Durable Objects
├── CDN:              Cloudflare
└── Monitoring:       Sentry, LogTail
```

### Discord SDK Integration
```typescript
// Key integrations needed:
- discordSdk.ready()                    // Init
- discordSdk.commands.authenticate()    // Auth
- discordSdk.subscribe('VOICE_STATE_UPDATE')  // Voice state
- discordSdk.subscribe('ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE')  // Participants
```

### Performance Targets
| Metric | Target |
|--------|--------|
| Initial load | < 2s |
| Time to interactive | < 3s |
| Cursor latency | < 100ms |
| Code sync latency | < 150ms |
| Animation FPS | 60fps |

---

## Success Metrics

### Engagement
- **Session length**: Average time spent per session
- **Sessions per week**: How often users return
- **Group vs solo ratio**: % of sessions with multiple users

### Learning
- **Lessons completed**: Per user, per session
- **Stuck → Understood conversion**: How often stuck signals resolve
- **Help interactions**: Frequency and success rate
- **Quiz scores**: Improvement over time

### Social
- **Help given**: How often users help others
- **Cursor interactions**: Pings, highlights, jumps
- **Voice activity correlation**: Are people talking while using?

### Retention
- **D1, D7, D30 retention**: Return rates
- **Streak maintenance**: % maintaining 3+ day streaks
- **Event participation**: % of active users in weekly events

---

## Appendices

### A. Glossary
| Term | Definition |
|------|------------|
| **Focus Mode** | Pomodoro work period, reduced distractions |
| **Stuck State** | User has indicated confusion, needs help |
| **Presence** | Awareness of other users (cursors, status) |
| **Progress Trail** | Visual representation of tutorial progress |
| **Ping** | Temporary attention marker at a location |

### B. Accessibility Considerations
- [ ] All sounds have visual equivalents
- [ ] Color is not the only indicator of state
- [ ] Keyboard navigation throughout
- [ ] Screen reader support for core functions
- [ ] Respect `prefers-reduced-motion`
- [ ] High contrast mode option

### C. Localization Notes
- UI text should be externalized from day one
- Consider RTL layout support
- Time formats should be locale-aware
- Quiz content may need localization

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | [DATE] | Initial manifesto |

---

*This is a living document. Update as decisions are made and learnings emerge.*

**Remember: Content first. Presence is powerful. Game feel, not games.**

🚀 Let's build something people actually want to study with.
