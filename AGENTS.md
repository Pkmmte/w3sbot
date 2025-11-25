# AGENTS.md - AI Agent Guide for W3Schools Discord Bot

> **Self-Update Clause**: If you are an AI agent working on this codebase and you notice that the information in this file is outdated (e.g., new plugins, changed architecture, new environment variables), **you are required to update this file** to reflect the current state of the project. This ensures that future agents (including your future self) have accurate context.

## 1. Project Overview
This project is the **W3Schools Discord Bot**, a comprehensive bot built with **Robo.js** that integrates AI, authentication, XP systems, and web capabilities. It serves the W3Schools Discord community with tutoring, moderation, and engagement features.

## 2. Tech Stack
- **Framework**: [Robo.js](https://robojs.dev/) (Note: Currently using bleeding-edge/PR builds for core and plugins).
- **Language**: TypeScript.
- **Runtime**: Node.js.
- **Database**: Prisma ORM with `better-sqlite3` (SQLite).
- **Web Framework**: Next.js (integrated via Robo.js App Router).
- **AI**: OpenAI (GPT-5.1, GPT-Realtime) via `@robojs/ai`.
- **Authentication**: `@robojs/auth` supporting Discord and Email/Password.
- **Documentation**: OpenAPI / Redoc.

## 3. Project Structure
- **`config/`**: Robo.js configuration.
  - **`plugins/`**: Plugin-specific configs.
    - `robojs/ai.ts`: AI configuration, including the custom `reply` hook for source parsing.
    - `robojs/auth.ts`: Authentication provider setup (Discord, Email/Password) and Prisma adapter.
  - **`robo.ts`**: Main Robo.js config (intents, logger).
- **`src/`**: Bot source code.
  - **`api/`**: Backend API routes (e.g., `handoff.ts`, `join-group.ts` for Learn Together).
  - **`commands/`**: Slash commands.
  - **`events/`**: Discord event handlers (e.g., `_start.ts` for module loading).
  - **`modules/`**: Feature-specific logic.
    - `audit-log`: Logs events like message deletions to a configured channel.
    - `quotes`: Manages quote saving and retrieval, including CRON jobs.
  - **`services/`**: Business logic (e.g., `study-groups.ts`).
- **`app/`**: Next.js application (pages, components).
  - `api/`: Next.js API routes (e.g., `auth/[...nextauth]`).
- **`prisma/`**: Database schema (`schema.prisma`).

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
  1.  **Handoff (`src/api/handoff.ts`)**: W3Schools calls this endpoint with `w3sUserId`, `groupId`, and `groupName`. It generates a temporary `handoffId` stored in Flashcore.
  2.  **Auth Start (`src/api/auth-start.ts`)**: The user is redirected here with the `handoffId`. It initiates the Discord OAuth flow via `@robojs/auth`.
  3.  **Join Group (`src/api/join-group.ts`)**: After OAuth, the user is redirected here. The system:
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

## 5. Database Schema (Prisma)
- **User**: Core user record.
- **Account**: OAuth accounts (Discord).
- **Session**: Auth sessions.
- **StudyGroup**: Represents a "Learn Together" group. Links to a Discord Channel ID.
- **GroupMember**: Links `User` to `StudyGroup`.

## 6. Development Workflow
- **Start Dev Server**: `npm run dev` (runs `robo dev`).
- **Build**: `npm run build` (runs Prisma generation + `robo build`).
- **Database**:
  - `npm run prisma:dev`: Migrate dev database.
  - `npm run prisma:studio`: Open Prisma Studio.
- **Docs**: `npm run generate:openapi` to regenerate API docs.

## 7. Environment Variables
Ensure these are set in `.env`:
- **Discord**: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_TOKEN`, `DISCORD_DEBUG_CHANNEL_ID`, `DISCORD_GUILD_ID`, `DISCORD_CATEGORY_ID`, `DISCORD_INVITE_URL`.
- **AI**: `OPENAI_API_KEY`, `CONTEXT7_API_KEY`, `AI_WHITELIST_CHANNEL_IDS`.
- **Auth**: `AUTH_SECRET`, `NEXTAUTH_URL`.
- **Database**: `DATABASE_URL` (e.g., `file:./dev.db`).
- **Learn Together**: `LEARN_TOGETHER_API_KEY`, `W3SCHOOLS_WEBHOOK_URL`.
- **Logging**: `LOGGER_LEVEL`.

## 8. Quirks & Gotchas
1.  **PR Builds**: The project uses specific PR builds for `@robojs/*` packages. **Do not update these to standard versions** unless you are sure they are compatible.
2.  **Flashcore**: Used for temporary state (handoffs) and configuration (audit log channels).
3.  **Next.js Integration**: Next.js is embedded. Routes in `app/` are served by the Robo.js server.
4.  **Prisma Adapter**: Uses `PrismaBetterSqlite3` for compatibility with Robo.js's runtime environment.
5.  **Cookie Handling**: The `auth-start.ts` endpoint manually handles cookie forwarding. Be very careful when modifying this logic as it can break the auth flow.
