# AGENTS.md - AI Agent Guide for W3Schools Discord Bot

> **Self-Update Clause**: If you are an AI agent working on this codebase and you notice that the information in this file is outdated (e.g., new plugins, changed architecture, new environment variables), **you are required to update this file** to reflect the current state of the project. This ensures that future agents (including your future self) have accurate context.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Key Features & Deep Dive](#4-key-features--deep-dive)
5. [StudyTogether Activity](#5-studytogether-activity) ⭐ NEW
6. [Database Schema](#6-database-schema-prisma)
7. [Development Workflow](#7-development-workflow)
8. [Environment Variables](#8-environment-variables)
9. [Quirks & Gotchas](#9-quirks--gotchas)

---

## 1. Project Overview

This project is the **W3Schools Discord Bot**, a comprehensive bot built with **Robo.js** that integrates AI, authentication, XP systems, and web capabilities. It serves the W3Schools Discord community with tutoring, moderation, and engagement features.

The project also includes **StudyTogether**, a Discord Activity for collaborative learning on W3Schools tutorials (see [Section 5](#5-studytogether-activity)).

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Robo.js](https://robojs.dev/) (Note: Currently using bleeding-edge/PR builds) |
| **Language** | TypeScript |
| **Runtime** | Node.js |
| **Database** | Prisma ORM with `better-sqlite3` (SQLite) |
| **Web Framework** | Next.js (integrated via Robo.js App Router) |
| **AI** | OpenAI (GPT-5.1, GPT-Realtime) via `@robojs/ai` |
| **Authentication** | `@robojs/auth` supporting Discord and Email/Password |
| **Real-time Sync** | `@robojs/sync` (for Activity state synchronization) |
| **Documentation** | OpenAPI / Redoc |

---

## 3. Project Structure

```
├── config/                    # Robo.js configuration
│   ├── plugins/               # Plugin-specific configs
│   │   ├── robojs/
│   │   │   ├── ai.ts          # AI config + custom reply hook
│   │   │   └── auth.ts        # Auth providers + Prisma adapter
│   └── robo.ts                # Main Robo.js config
│
├── src/                       # Bot source code
│   ├── api/                   # Backend API routes
│   ├── commands/              # Slash commands
│   ├── events/                # Discord event handlers
│   ├── modules/               # Feature-specific logic
│   │   ├── audit-log/         # Event logging
│   │   └── quotes/            # Quote management
│   └── services/              # Business logic
│
├── app/                       # Next.js application + Discord Activity
│   ├── api/                   # Next.js API routes
│   ├── activity/              # ⭐ StudyTogether Discord Activity
│   │   ├── AGENTS.md          # Agent guide for Activity
│   │   ├── MANIFESTO.md       # Vision, principles, features
│   │   ├── DESIGN_SYSTEM.md   # Visual design, animations
│   │   ├── IMPLEMENTATION_GUIDE.md  # Code patterns
│   │   └── components/        # Activity React components
│   └── ...                    # Other Next.js pages
│
└── prisma/                    # Database schema
```

---

## 4. Key Features & Deep Dive

### 4.1. AI Tutoring (`@robojs/ai`)

- **Model**: Uses `gpt-5.1` (Chat) and `gpt-realtime` (Voice).
- **MCP Integration**: Uses `context7` MCP server to fetch W3Schools documentation.
- **Source Parsing**: A custom `reply` hook in `config/plugins/robojs/ai.ts` intercepts the AI response.
  - It looks for `<sources>\nSource: <link>\n</sources>` tags.
  - These are parsed and converted into **Discord Components V2** (a container with links) instead of plain text.
  - **IMPORTANT**: Do not modify this hook unless you understand how it affects the UI.

### 4.2. "Learn Together" (Study Groups)

This feature allows W3Schools users to join Discord study groups seamlessly.

- **Flow**:
  1. **Handoff (`src/api/handoff.ts`)**: W3Schools calls this endpoint with `w3sUserId`, `groupId`, and `groupName`. It generates a temporary `handoffId` stored in Flashcore.
  2. **Auth Start (`src/api/auth-start.ts`)**: The user is redirected here with the `handoffId`. It initiates the Discord OAuth flow via `@robojs/auth`.
  3. **Join Group (`src/api/join-group.ts`)**: After OAuth, the user is redirected here. The system:
     - Validates the `handoffId`.
     - Adds the user to the `StudyGroup` and `GroupMember` tables in Prisma.
     - Creates a private Voice Channel (if needed) via `StudyGroupService`.
     - Notifies W3Schools via webhook.
- **Service**: `src/services/study-groups.ts` handles the logic for creating channels, managing permissions, and database operations.

### 4.3. Authentication (`@robojs/auth`)

- **Providers**: Discord and Email/Password.
- **Persistence**: Uses `PrismaBetterSqlite3` adapter.
- **Integration**: The Next.js app shares the session with the bot.
- **Cookies**: Special handling in `auth-start.ts` ensures cookies (CSRF, Session) are correctly passed during the handoff flow.

### 4.4. Modules System

- **`audit-log`**: Listens for events (e.g., `messageDelete`) and logs them to a channel defined in Flashcore (`audit-log-channel`).
- **`quotes`**: Allows users to save quotes. Includes a CRON job system (`quotes-start.ts`) to post quotes at specific intervals.

---

## 5. StudyTogether Activity

> ⭐ **If you are working on the StudyTogether Activity, read `app/activity/CLAUDE.md` first.**

### 5.1. What Is It?

**StudyTogether** is a Discord Activity (embedded app) for collaborative learning on W3Schools tutorials. Users launch it from a voice channel and study together in a shared virtual "study space" with real-time cursors, presence, and collaboration features.

### 5.2. Activity Documentation

The Activity has its own comprehensive documentation:

| Document | Location | Purpose |
|----------|----------|---------|
| **CLAUDE.md** | `app/activity/CLAUDE.md` | Quick reference for agents (start here) |
| **MANIFESTO.md** | `app/activity/MANIFESTO.md` | Vision, principles, feature phases |
| **DESIGN_SYSTEM.md** | `app/activity/DESIGN_SYSTEM.md` | Visual design, spatial metaphors, animations |
| **IMPLEMENTATION_GUIDE.md** | `app/activity/IMPLEMENTATION_GUIDE.md` | Code patterns, components, hooks |

**Rule:** Always read `app/activity/CLAUDE.md` before working on Activity code. It will point you to the right detailed document.

### 5.3. Activity Overview (Condensed)

The Activity is NOT a webpage—it's a **place**. A virtual desk with a textbook and study tools.

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

### 5.4. Activity Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (SPA within Discord Activity iframe) |
| Platform | Discord Activity SDK |
| State Sync | `@robojs/sync` with `useSyncState` |
| Animation | Framer Motion |
| 3D Depth | CSS 3D Transforms (not WebGL) |
| Styling | Tailwind CSS |

### 5.5. Critical: useSyncState Scope

The `useSyncState` hook from `@robojs/sync` has a **final array parameter** that determines sync scope. Clients with matching array values share state.

```tsx
import { useSyncState } from '@robojs/sync';

// Synced across ALL clients in the activity
const [globalState, setGlobalState] = useSyncState('key', defaultValue, []);

// Synced only with clients viewing the same lesson
const [lessonState, setLessonState] = useSyncState('cursors', {}, [lessonId]);

// Synced with clients in same lesson AND channel
const [channelState, setChannelState] = useSyncState('chat', [], [lessonId, channelId]);
```

### 5.6. Activity Feature Phases

| Phase | Theme | Key Features |
|-------|-------|--------------|
| **Phase 1** | Foundation | Shared cursors, presence, content viewer, book metaphor |
| **Phase 2** | Collaboration | "I'm stuck" signals, help system, shared sandbox, highlights |
| **Phase 3** | Gamification | Pomodoro timer, progress trails, quizzes, XP/achievements |
| **Phase 4** | Events | Weekly challenges, timed events, special minigames |

### 5.7. When Working on Activity Code

1. **Read** `app/activity/CLAUDE.md` first
2. **Check sync scope** — Verify `useSyncState` array parameter is correct
3. **Use transforms** — Animate `x`, `y`, `scale`, `rotate` not `left`, `top`, `width`
4. **Test mobile** — Touch targets ≥44px, gestures work
5. **Respect reduced motion** — Check `useReducedMotion()` for accessibility

---

## 6. Database Schema (Prisma)

- **User**: Core user record.
- **Account**: OAuth accounts (Discord).
- **Session**: Auth sessions.
- **StudyGroup**: Represents a "Learn Together" group. Links to a Discord Channel ID.
- **GroupMember**: Links `User` to `StudyGroup`.

---

## 7. Development Workflow

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (runs `robo dev`) |
| `npm run build` | Build for production (Prisma + `robo build`) |
| `npm run prisma:dev` | Migrate dev database |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run generate:openapi` | Regenerate API docs |

---

## 8. Environment Variables

Ensure these are set in `.env`:

### Discord
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_TOKEN`
- `DISCORD_DEBUG_CHANNEL_ID`
- `DISCORD_GUILD_ID`
- `DISCORD_CATEGORY_ID`
- `DISCORD_INVITE_URL`
- `LEVEL_ANNOUNCEMENTS_CHANNEL_ID`

### AI
- `OPENAI_API_KEY`
- `CONTEXT7_API_KEY`
- `AI_WHITELIST_CHANNEL_IDS`

### Auth
- `AUTH_SECRET`
- `NEXTAUTH_URL`

### Database
- `DATABASE_URL` (e.g., `file:./dev.db`)

### Learn Together
- `LEARN_TOGETHER_API_KEY`
- `W3SCHOOLS_WEBHOOK_URL`

### Logging
- `LOGGER_LEVEL`

---

## 9. Quirks & Gotchas

### Bot-Level Gotchas

1. **PR Builds**: The project uses specific PR builds for `@robojs/*` packages. **Do not update these to standard versions** unless you are sure they are compatible.

2. **Flashcore**: Used for temporary state (handoffs) and configuration (audit log channels).

3. **Next.js Integration**: Next.js is embedded. Routes in `app/` are served by the Robo.js server.

4. **Prisma Adapter**: Uses `PrismaBetterSqlite3` for compatibility with Robo.js's runtime environment.

5. **Cookie Handling**: The `auth-start.ts` endpoint manually handles cookie forwarding. Be very careful when modifying this logic as it can break the auth flow.

### Activity-Level Gotchas

6. **useSyncState Scope**: The array parameter in `useSyncState` determines WHO shares state. Empty array = global. Populated array = scoped to matching values. Getting this wrong causes cursors to appear everywhere or nowhere.

7. **Book Is a Container**: The textbook metaphor is for open/close transitions and spatial presence—NOT for pagination. Content inside scrolls normally, it's not a flip-book.

8. **CSS 3D, Not WebGL**: The depth system uses CSS `perspective` and `translateZ`, not React Three Fiber. Only use R3F for special events (like the Interview minigame).

9. **Framer Motion for All Animation**: Don't mix animation libraries. Use Framer Motion everywhere in the Activity.

10. **Mobile Cursors**: On mobile, there are no persistent cursors—use tap indicators that fade out.

---

## 🚦 Quick Navigation

| I need to work on... | Go to... |
|---------------------|----------|
| Bot commands | `src/commands/` |
| Bot events | `src/events/` |
| AI tutoring | `config/plugins/robojs/ai.ts` |
| Learn Together flow | `src/api/handoff.ts`, `src/services/study-groups.ts` |
| Auth | `config/plugins/robojs/auth.ts` |
| **StudyTogether Activity** | **`app/activity/CLAUDE.md`** ⭐ |
| Activity UI/Animation | `app/activity/DESIGN_SYSTEM.md` |
| Activity Code Patterns | `app/activity/IMPLEMENTATION_GUIDE.md` |
| Database schema | `prisma/schema.prisma` |

---

*Last updated: [auto-update on commit]*
