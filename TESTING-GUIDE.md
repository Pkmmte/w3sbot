# @robojs/mock Testing Guide

> Comprehensive reference for writing integration tests with the @robojs/mock Discord Gateway mock server.

This document provides everything an AI agent needs to implement Discord bot tests using the mock server.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Core Concepts](#core-concepts)
5. [API Reference](#api-reference)
6. [Event Dispatching](#event-dispatching)
7. [Interaction Testing](#interaction-testing)
8. [Action Recording & Assertions](#action-recording--assertions)
9. [User Management](#user-management)
10. [Advanced Patterns](#advanced-patterns)
11. [Jest Configuration](#jest-configuration)
12. [Troubleshooting](#troubleshooting)

---

## Overview

`@robojs/mock` is a complete Discord Gateway v10 mock server for testing Discord bots in isolation. It provides:

- **Full Discord Gateway WebSocket implementation** (v10)
- **Complete REST API emulation** (100+ endpoints)
- **Session-based isolation** for parallel testing
- **Action recording** for assertions
- **Voice Gateway support** (port 50001)
- **Stage UI** for visual debugging

### Key Benefits

- No real Discord connection required
- Isolated sessions for parallel test execution
- Full control over Discord events
- Record and replay capabilities
- Compatible with Discord.js and other libraries

---

## Architecture

```
┌─────────────────────────────────────────┐
│           Test Process                   │
│  (Jest + your test code)                 │
└──────────────┬──────────────────────────┘
               │ HTTP Control API
               │ Token: mock:sess_xxx
               ▼
┌─────────────────────────────────────────┐
│       @robojs/mock Server               │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Session A: sess_123               │  │
│  │ • Gateway WebSocket connection    │  │
│  │ • State (guilds, channels, etc)   │  │
│  │ • Action recorder                 │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Session B: sess_456               │  │
│  │ (completely isolated from A)      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Token Format

All tokens follow the pattern `mock:<session_id>`:
```
mock:sess_abc123def456
```

The session ID is extracted from the token during IDENTIFY and used to route the connection.

---

## Getting Started

### Installation

```bash
npm install @robojs/mock --save-dev
```

### Basic Test Structure

```typescript
import {
  createTestSession,
  dispatchEvent,
  expectAction,
  startMockRobo
} from '@robojs/mock/testing'

describe('My Bot Tests', () => {
  let session: TestSession
  let bot: MockRoboHandle

  beforeAll(async () => {
    // Start the bot connected to the mock server
    bot = await startMockRobo({
      name: 'my-test',
      testFilePath: __filename
    })

    // Get session info from the bot handle
    session = {
      id: bot.sessionId,
      guildId: bot.guildId,
      channels: bot.channels
    }
  })

  afterAll(async () => {
    await bot.stop()
  })

  it('should respond to messages', async () => {
    // Dispatch an event to the bot
    await dispatchEvent(bot.sessionId, 'MESSAGE_CREATE', {
      id: '123456789',
      channel_id: bot.channels[0].id,
      guild_id: bot.guildId,
      content: 'Hello bot!',
      author: {
        id: '987654321',
        username: 'TestUser',
        discriminator: '0',
        avatar: null
      },
      timestamp: new Date().toISOString()
    })

    // Assert the bot responded
    await expectAction(bot.sessionId, {
      description: 'Bot should reply with greeting',
      type: 'REST_CREATE_MESSAGE',
      expected: {
        content: expect.stringContaining('Hello')
      }
    })
  })
})
```

---

## Core Concepts

### Sessions

A **session** is an isolated test environment containing:
- A bot user identity
- One or more guilds with channels
- State for members, roles, messages, etc.
- Action recording history

Sessions are completely isolated from each other, enabling parallel test execution.

### Actions

**Actions** are recorded events from the bot, including:
- `gateway_identify` - Bot connection
- `gateway_heartbeat` - Keepalive pings
- `gateway_presence_update` - Status changes
- `gateway_voice_state_update` - Voice channel events
- `message_sent` - Messages created via REST API
- `REST_CREATE_MESSAGE` - REST API message creation
- `interaction_response` - Slash command/component responses
- `interaction_followup` - Follow-up messages
- `rest_request` - Any REST API call

### Events

**Events** are Discord Gateway events dispatched TO the bot:
- `MESSAGE_CREATE` - New message
- `INTERACTION_CREATE` - Slash command, button click, etc.
- `GUILD_MEMBER_ADD` - Member joined
- `VOICE_STATE_UPDATE` - Voice channel changes
- And all other Discord Gateway events

---

## API Reference

### Session Management

#### `startMockRobo(options)`

Start a Robo.js bot connected to the mock server. This is the primary way to start a bot for testing.

```typescript
interface StartMockRoboOptions {
  /** Session name for identification */
  name?: string
  /** Mock server port (auto-discovered) */
  port?: number
  /** Connection timeout in ms (default: 30000) */
  timeout?: number
  /** Show console logs */
  verbose?: boolean
  /** Test file path for registry tracking (use __filename) */
  testFilePath?: string
  /** Enable file logging */
  logFile?: boolean | string
  /** Log level for file output */
  logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error'
  /** Enable HMR mode (spawns robo dev --hmr) */
  hmr?: boolean
}

interface MockRoboHandle {
  sessionId: string
  token: string
  botUser: { id: string; username: string }
  guilds: Array<{ id: string; name: string }>
  channels: Array<{ id: string; name: string; guildId?: string; type: number }>
  guildId: string
  client: unknown  // Discord.js Client (null in HMR mode)
  stop: () => Promise<void>
  // HMR mode only:
  process?: ChildProcess
  getHmrCount?: () => number
  getRestartCount?: () => number
  waitForHmrReload?: (timeout?: number, fromCount?: number) => Promise<void>
  waitForFullRestart?: (timeout?: number, fromCount?: number) => Promise<void>
}
```

**Example:**
```typescript
const bot = await startMockRobo({
  name: 'ping-test',
  testFilePath: __filename,
  verbose: true
})

// Use bot.sessionId, bot.guildId, bot.channels[0].id, etc.

await bot.stop()
```

#### `createTestSession(testFilePath, config)`

Create a test session with automatic registry tracking. Use this when you need a session without starting a full Robo.js bot.

```typescript
interface CreateTestSessionConfig {
  name?: string
  ttl?: number  // Time to live in ms
  config?: {
    botUser?: { username?: string; id?: string }
    guilds?: Array<{
      id?: string
      name?: string
      channels?: Array<{ name?: string; type?: number }>
    }>
    enforceIntents?: boolean
    approvedPrivilegedIntents?: bigint
  }
}

interface TestSession {
  id: string
  token: string
  name?: string
  botUser: { id: string; username: string }
  guilds: Array<{ id: string; name: string }>
  channels: Array<{ id: string; name: string; guildId?: string; type: number }>
  guildId: string
  testFilePath?: string
  destroy(): Promise<void>
}
```

**Example:**
```typescript
const session = await createTestSession(__filename, {
  name: 'custom-session',
  config: {
    guilds: [{
      name: 'Test Guild',
      channels: [
        { name: 'general', type: 0 },  // Text channel
        { name: 'voice', type: 2 }     // Voice channel
      ]
    }]
  }
})

// Use session.id, session.guildId, session.channels, etc.

await session.destroy()
```

#### `createSession(config)`

Low-level session creation without test registry tracking.

```typescript
const session = await createSession({
  name: 'my-session',
  config: { guilds: [{ name: 'Test' }] }
})
// Returns: { id, token, botUser, guilds, channels, guildId }
```

#### `deleteSession(sessionId)`

Delete a session and clean up resources.

```typescript
await deleteSession(session.id)
```

#### `resetSession(sessionId)`

Reset a session to its initial state (clears messages, actions, etc.).

```typescript
await resetSession(session.id)
```

#### `getSessionState(sessionId)`

Get a snapshot of the current session state.

```typescript
const state = await getSessionState(session.id)
// Returns: { botUser, guilds, channels }
```

### Event Dispatching

#### `dispatchEvent(sessionId, event, data)`

Dispatch a Discord Gateway event to all connections in a session.

```typescript
await dispatchEvent(sessionId, 'MESSAGE_CREATE', {
  id: '123456789',
  channel_id: channelId,
  guild_id: guildId,
  content: 'Hello!',
  author: {
    id: 'user_123',
    username: 'TestUser',
    discriminator: '0',
    avatar: null
  },
  timestamp: new Date().toISOString()
})
```

#### `dispatchInteraction(sessionId, interaction)`

Dispatch an interaction (slash command, button click, etc.).

```typescript
interface InteractionData {
  /** 2=APPLICATION_COMMAND, 3=MESSAGE_COMPONENT, 5=MODAL_SUBMIT */
  type: number
  data: {
    name?: string              // Command name
    type?: number              // Command type (1=CHAT_INPUT, 2=USER, 3=MESSAGE)
    options?: Array<{...}>     // Command options
    custom_id?: string         // Component custom ID
    component_type?: number    // Component type
    values?: string[]          // Select menu values
    components?: Array<{...}>  // Modal components
  }
  guild_id?: string
  channel_id?: string
  user_id?: string  // Defaults to test user
}
```

### Action Recording

#### `getSessionActions(sessionId, options)`

Get recorded actions from a session.

```typescript
const { actions } = await getSessionActions(sessionId, {
  type: 'REST_CREATE_MESSAGE',  // Filter by type
  limit: 10,                     // Max results
  since: Date.now() - 5000       // Actions after timestamp
})
```

#### `clearSessionActions(sessionId)`

Clear all recorded actions for a session.

```typescript
await clearSessionActions(sessionId)
```

#### `getHistoricalActions(sessionId, options)`

Get all actions including those from before the test started (useful for lifecycle events).

```typescript
const actions = await getHistoricalActions(sessionId, {
  type: 'gateway_presence_update'
})
```

### Wait Helpers

#### `waitForAction(sessionId, options)`

Wait for a specific action type to be recorded.

```typescript
const actions = await waitForAction(sessionId, {
  type: 'REST_CREATE_MESSAGE',
  timeout: 5000,
  filter: (action) => action.data.content?.includes('hello')
})
```

Or with just the type:
```typescript
const actions = await waitForAction(sessionId, 'REST_CREATE_MESSAGE')
```

#### `waitForAnyAction(sessionId, filter, timeout)`

Wait for any action matching a custom filter.

```typescript
const action = await waitForAnyAction(
  sessionId,
  (action) => action.type === 'message_sent' && action.data.embeds?.length > 0,
  5000
)
```

#### `waitForMessage(sessionId, options)`

Wait for a message to be sent by the bot.

```typescript
const action = await waitForMessage(sessionId, {
  channelId: channelId,
  content: /hello/i,  // String or RegExp
  timeout: 5000
})
```

#### `waitForInteractionResponse(sessionId, options)`

Wait for an interaction response.

```typescript
const action = await waitForInteractionResponse(sessionId, {
  type: 4,  // CHANNEL_MESSAGE_WITH_SOURCE
  timeout: 5000
})
```

#### `waitForMockServer(options)`

Wait for the mock server to be ready.

```typescript
await waitForMockServer({
  url: 'http://localhost:3000/api/control',
  timeout: 30000,
  interval: 500
})
```

### Assertion Helpers

#### `expectAction(sessionId, options)`

Wait for an action and assert it matches expected data. Records the assertion for UI display.

```typescript
interface ExpectActionOptions {
  description: string   // Human-readable description
  type: string          // Action type to wait for
  expected: unknown     // Expected data (supports Jest matchers)
  timeout?: number      // Timeout in ms
}

await expectAction(sessionId, {
  description: 'Bot should reply with welcome message',
  type: 'REST_CREATE_MESSAGE',
  expected: {
    content: expect.stringContaining('Welcome'),
    embeds: expect.arrayContaining([
      expect.objectContaining({ title: 'Getting Started' })
    ])
  }
})
```

#### `expectNoAction(sessionId, options)`

Assert that no action of a type was recorded.

```typescript
await expectNoAction(sessionId, {
  description: 'Bot should not respond to invalid command',
  type: 'REST_CREATE_MESSAGE',
  waitMs: 1000  // Time to wait before asserting
})
```

#### `deepEquals(actual, expected)`

Deep equality check that supports Jest matchers.

```typescript
const matches = deepEquals(
  { content: 'Hello world' },
  { content: expect.stringContaining('Hello') }
)
```

#### `generateDiff(expected, actual)`

Generate a diff string for debugging.

```typescript
const diff = generateDiff(expected, actual)
console.log(diff)
```

### Utility Functions

#### `sleep(ms)`

Promise-based sleep utility.

```typescript
await sleep(1000)  // Wait 1 second
```

#### `generateSnowflake()`

Generate a valid Discord snowflake ID.

```typescript
const id = generateSnowflake()  // '1234567890123456789'
```

### Configuration

#### `getMockConfig()`

Get the current mock server configuration.

```typescript
const config = getMockConfig()
// Returns: { baseUrl, controlUrl, restUrl, gatewayUrl, defaultTimeout }
```

#### `configureMock(config)`

Override mock configuration.

```typescript
configureMock({
  baseUrl: 'http://localhost:4000',
  defaultTimeout: 10000
})
```

#### `resetMockConfig()`

Reset to default configuration.

```typescript
resetMockConfig()
```

---

## Event Dispatching

### Common Discord Events

#### MESSAGE_CREATE

```typescript
await dispatchEvent(sessionId, 'MESSAGE_CREATE', {
  id: generateSnowflake(),
  channel_id: channelId,
  guild_id: guildId,
  author: {
    id: 'user_123',
    username: 'TestUser',
    discriminator: '0',
    avatar: null,
    bot: false
  },
  content: 'Hello bot!',
  timestamp: new Date().toISOString(),
  edited_timestamp: null,
  tts: false,
  mention_everyone: false,
  mentions: [],
  mention_roles: [],
  attachments: [],
  embeds: [],
  pinned: false,
  type: 0
})
```

#### GUILD_MEMBER_ADD

```typescript
await dispatchEvent(sessionId, 'GUILD_MEMBER_ADD', {
  guild_id: guildId,
  user: {
    id: generateSnowflake(),
    username: 'NewMember',
    discriminator: '0',
    avatar: null
  },
  roles: [],
  joined_at: new Date().toISOString(),
  deaf: false,
  mute: false
})
```

#### GUILD_MEMBER_REMOVE

```typescript
await dispatchEvent(sessionId, 'GUILD_MEMBER_REMOVE', {
  guild_id: guildId,
  user: {
    id: memberId,
    username: 'LeavingMember',
    discriminator: '0',
    avatar: null
  }
})
```

#### VOICE_STATE_UPDATE

```typescript
await dispatchEvent(sessionId, 'VOICE_STATE_UPDATE', {
  guild_id: guildId,
  channel_id: voiceChannelId,  // null to leave
  user_id: userId,
  session_id: 'voice-session-123',
  deaf: false,
  mute: false,
  self_deaf: false,
  self_mute: false,
  suppress: false
})
```

#### GUILD_ROLE_CREATE

```typescript
await dispatchEvent(sessionId, 'GUILD_ROLE_CREATE', {
  guild_id: guildId,
  role: {
    id: generateSnowflake(),
    name: 'New Role',
    color: 0xFF0000,
    hoist: false,
    position: 1,
    permissions: '0',
    managed: false,
    mentionable: false
  }
})
```

#### CHANNEL_CREATE

```typescript
await dispatchEvent(sessionId, 'CHANNEL_CREATE', {
  id: generateSnowflake(),
  type: 0,  // GUILD_TEXT
  guild_id: guildId,
  name: 'new-channel',
  position: 0,
  permission_overwrites: [],
  topic: null,
  nsfw: false,
  rate_limit_per_user: 0,
  parent_id: null
})
```

---

## Interaction Testing

### Slash Commands

```typescript
await dispatchInteraction(sessionId, {
  type: 2,  // APPLICATION_COMMAND
  data: {
    name: 'ping',
    type: 1,  // CHAT_INPUT
    options: []
  },
  guild_id: guildId,
  channel_id: channelId
})
```

#### With Options

```typescript
await dispatchInteraction(sessionId, {
  type: 2,
  data: {
    name: 'ban',
    type: 1,
    options: [
      { name: 'user', type: 6, value: 'user_123' },      // USER type
      { name: 'reason', type: 3, value: 'Spam' },        // STRING type
      { name: 'days', type: 4, value: 7 }                // INTEGER type
    ]
  },
  guild_id: guildId,
  channel_id: channelId
})
```

#### Subcommands

```typescript
await dispatchInteraction(sessionId, {
  type: 2,
  data: {
    name: 'config',
    type: 1,
    options: [{
      name: 'set',        // Subcommand
      type: 1,
      options: [
        { name: 'key', type: 3, value: 'prefix' },
        { name: 'value', type: 3, value: '!' }
      ]
    }]
  },
  guild_id: guildId,
  channel_id: channelId
})
```

### Button Clicks

```typescript
await dispatchInteraction(sessionId, {
  type: 3,  // MESSAGE_COMPONENT
  data: {
    custom_id: 'confirm_button',
    component_type: 2  // Button
  },
  guild_id: guildId,
  channel_id: channelId
})
```

### Select Menus

```typescript
await dispatchInteraction(sessionId, {
  type: 3,
  data: {
    custom_id: 'role_select',
    component_type: 3,  // String Select
    values: ['role_123', 'role_456']
  },
  guild_id: guildId,
  channel_id: channelId
})
```

### Modal Submissions

```typescript
await dispatchInteraction(sessionId, {
  type: 5,  // MODAL_SUBMIT
  data: {
    custom_id: 'feedback_modal',
    components: [{
      type: 1,  // Action Row
      components: [{
        type: 4,  // Text Input
        custom_id: 'feedback_text',
        value: 'Great bot!'
      }]
    }, {
      type: 1,
      components: [{
        type: 4,
        custom_id: 'rating',
        value: '5'
      }]
    }]
  },
  guild_id: guildId,
  channel_id: channelId
})
```

### Autocomplete

```typescript
await dispatchInteraction(sessionId, {
  type: 4,  // APPLICATION_COMMAND_AUTOCOMPLETE
  data: {
    name: 'search',
    type: 1,
    options: [{
      name: 'query',
      type: 3,
      value: 'hel',
      focused: true
    }]
  },
  guild_id: guildId,
  channel_id: channelId
})
```

---

## Action Recording & Assertions

### Action Types

| Action Type | Description |
|-------------|-------------|
| `gateway_identify` | Bot sent IDENTIFY payload |
| `gateway_heartbeat` | Bot sent heartbeat |
| `gateway_presence_update` | Bot updated its presence |
| `gateway_voice_state_update` | Bot updated voice state |
| `REST_CREATE_MESSAGE` | Bot created a message via REST |
| `message_sent` | Alias for message creation |
| `interaction_response` | Bot responded to interaction |
| `interaction_followup` | Bot sent follow-up message |
| `rest_request` | Generic REST API request |

### Assertion Patterns

#### Basic Message Assertion

```typescript
await expectAction(sessionId, {
  description: 'Bot should reply with pong',
  type: 'REST_CREATE_MESSAGE',
  expected: { content: 'Pong!' }
})
```

#### Partial Matching with Jest Matchers

```typescript
await expectAction(sessionId, {
  description: 'Bot should send embed',
  type: 'REST_CREATE_MESSAGE',
  expected: {
    embeds: expect.arrayContaining([
      expect.objectContaining({
        title: expect.stringMatching(/welcome/i),
        color: expect.any(Number)
      })
    ])
  }
})
```

#### Checking Embeds

```typescript
await expectAction(sessionId, {
  description: 'Bot should send help embed',
  type: 'REST_CREATE_MESSAGE',
  expected: {
    embeds: [{
      title: 'Help',
      description: expect.stringContaining('Commands'),
      fields: expect.arrayContaining([
        { name: '/ping', value: expect.any(String), inline: true }
      ])
    }]
  }
})
```

#### Checking Components

```typescript
await expectAction(sessionId, {
  description: 'Bot should send button',
  type: 'REST_CREATE_MESSAGE',
  expected: {
    components: [{
      type: 1,  // Action Row
      components: [{
        type: 2,  // Button
        style: 1, // Primary
        label: 'Click Me',
        custom_id: 'my_button'
      }]
    }]
  }
})
```

---

## User Management

The `TestUsers` and `TestInteractions` classes provide utilities for managing multiple users in tests.

### Creating Test Users

```typescript
import { createTestUtils } from '@robojs/mock/testing'

const utils = createTestUtils(session)

// Create single user
const alice = utils.users.create('Alice')

// Create multiple users
const [bob, charlie] = utils.users.createMany(['Bob', 'Charlie'])

// Create bot user
const botUser = utils.users.create('TestBot', { bot: true })
```

### User Lookup

```typescript
// By name
const user = utils.users.byName('Alice')

// By ID
const user = utils.users.byId('123456789')

// Current acting user
const current = utils.users.current()

// All humans
const humans = utils.users.allHumans()

// All bots
const bots = utils.users.allBots()
```

### Acting as Different Users

```typescript
// Switch permanently
utils.users.switchTo('Alice')

// Or by user object
utils.users.switchTo(alice)

// Act as user temporarily
await utils.users.as('Bob', async () => {
  // All actions here are performed as Bob
  await utils.interactions.sendMessage('Bob', channelId, 'Hello!')
})
// Back to previous user
```

### Simulating Interactions

```typescript
// Send message as user
await utils.interactions.sendMessage('Alice', channelId, 'Hello bot!')

// Invoke command as user
await utils.interactions.invokeCommand('Alice', 'ping', { option: 'value' })

// Click button as user
await utils.interactions.clickButton('Alice', messageId, 'button_custom_id')

// Simulate conversation
await utils.interactions.conversation(channelId, [
  { user: 'Alice', content: 'Hello!' },
  { user: 'Bob', content: 'Hi there!' },
  { user: 'Alice', content: 'How are you?' }
])
```

---

## Advanced Patterns

### Testing Lifecycle Events

Test events that fire during bot startup:

```typescript
it('should set presence on ready', async () => {
  // Start the bot
  const bot = await startMockRobo({ name: 'lifecycle-test', testFilePath: __filename })

  // Check historical actions (includes startup)
  const actions = await getHistoricalActions(bot.sessionId, {
    type: 'gateway_presence_update'
  })

  expect(actions.length).toBeGreaterThan(0)
  expect(actions[0].data).toMatchObject({
    status: 'online'
  })

  await bot.stop()
})
```

### Testing with Discord.js Client

Access the Discord.js client directly:

```typescript
it('should have guilds cached', async () => {
  const bot = await startMockRobo({ name: 'client-test', testFilePath: __filename })

  const client = bot.client as Client

  expect(client.guilds.cache.size).toBe(1)
  expect(client.guilds.cache.first()?.name).toBe('Test Guild')

  await bot.stop()
})
```

### Testing HMR (Hot Module Replacement)

```typescript
const bot = await startMockRobo({
  name: 'hmr-test',
  testFilePath: __filename,
  hmr: true  // Spawns robo dev --hmr
})

// Capture count before changes
const hmrCount = bot.getHmrCount!()

// Modify a handler file...
await fs.writeFile(handlerPath, newContent)

// Wait for HMR to complete
await bot.waitForHmrReload!(15000, hmrCount)

// Test the updated behavior
await dispatchInteraction(bot.sessionId, { ... })

await bot.stop()
```

### Parallel Test Execution

Each test file gets its own isolated session:

```typescript
// test-a.test.ts
const bot = await startMockRobo({ name: 'test-a', testFilePath: __filename })

// test-b.test.ts (runs in parallel)
const bot = await startMockRobo({ name: 'test-b', testFilePath: __filename })
```

### Custom Event Sequences

```typescript
it('should handle member join flow', async () => {
  // Member joins
  await dispatchEvent(sessionId, 'GUILD_MEMBER_ADD', {
    guild_id: guildId,
    user: { id: userId, username: 'NewMember', ... },
    ...
  })

  // Bot should send welcome message
  await expectAction(sessionId, {
    description: 'Welcome message sent',
    type: 'REST_CREATE_MESSAGE',
    expected: { content: expect.stringContaining('Welcome') }
  })

  // Member reacts to rules
  await dispatchEvent(sessionId, 'MESSAGE_REACTION_ADD', {
    message_id: rulesMessageId,
    channel_id: rulesChannelId,
    guild_id: guildId,
    user_id: userId,
    emoji: { name: '✅' }
  })

  // Bot should assign role
  await expectAction(sessionId, {
    description: 'Member role assigned',
    type: 'rest_request',
    expected: expect.objectContaining({
      method: 'PUT',
      path: expect.stringContaining('/roles/')
    })
  })
})
```

---

## Jest Configuration

### Recommended Setup

```typescript
// jest.config.ts
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',

  // Integration tests need special handling
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
      testPathIgnorePatterns: ['integration/']
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/__tests__/integration/**/*.test.ts'],
      globalSetup: '<rootDir>/__tests__/integration/global-setup.js',
      globalTeardown: '<rootDir>/__tests__/integration/global-teardown.js',
      setupFilesAfterEnv: ['<rootDir>/__tests__/integration/test-setup.js'],
      runInBand: true,      // Run sequentially
      forceExit: true       // Force exit on completion
    }
  ],

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },

  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true
    }]
  }
}
```

### Running Tests

```bash
# Run with ESM support
NODE_OPTIONS="--experimental-vm-modules --disable-warning=ExperimentalWarning" npx jest

# Run specific test
NODE_OPTIONS="--experimental-vm-modules" npx jest --testPathPattern=my-test

# Run with verbose output
NODE_OPTIONS="--experimental-vm-modules" npx jest --verbose
```

---

## Troubleshooting

### Common Issues

#### "Timeout waiting for action"

The bot didn't perform the expected action within the timeout.

**Solutions:**
- Increase the timeout: `{ timeout: 10000 }`
- Check the action type is correct (e.g., `REST_CREATE_MESSAGE` vs `message_sent`)
- Verify the event was dispatched correctly
- Check the bot's event handlers are working

#### "Session not found"

The session ID doesn't exist on the server.

**Solutions:**
- Ensure the mock server is running
- Check if the session was already destroyed
- Verify the session ID is correct

#### "Bot not connected after timeout"

The bot failed to connect to the gateway.

**Solutions:**
- Check the mock server is running on the expected port
- Verify `ROBO_MOCK_PORT` environment variable
- Check for errors in bot startup logs
- Increase connection timeout

#### "Module not found" errors

ESM import issues with Jest.

**Solutions:**
- Ensure `NODE_OPTIONS="--experimental-vm-modules"` is set
- Check `moduleNameMapper` in Jest config
- Verify file extensions in imports

### Debug Tips

1. **Enable verbose logging:**
   ```typescript
   const bot = await startMockRobo({
     verbose: true,
     logLevel: 'debug'
   })
   ```

2. **Check recorded actions:**
   ```typescript
   const { actions } = await getSessionActions(sessionId)
   console.log('Recorded actions:', JSON.stringify(actions, null, 2))
   ```

3. **Inspect session state:**
   ```typescript
   const state = await getSessionState(sessionId)
   console.log('Session state:', JSON.stringify(state, null, 2))
   ```

4. **Use longer timeouts during debugging:**
   ```typescript
   await expectAction(sessionId, {
     description: 'Debug test',
     type: 'REST_CREATE_MESSAGE',
     expected: { content: 'test' },
     timeout: 30000  // 30 seconds
   })
   ```

---

## Quick Reference

### Imports

```typescript
import {
  // Session management
  createTestSession,
  createSession,
  deleteSession,
  resetSession,
  getSessionState,
  startMockRobo,

  // Event dispatch
  dispatchEvent,
  dispatchInteraction,

  // Action recording
  getSessionActions,
  clearSessionActions,
  getHistoricalActions,

  // Wait helpers
  waitForAction,
  waitForAnyAction,
  waitForMessage,
  waitForInteractionResponse,
  waitForMockServer,

  // Assertions
  expectAction,
  expectNoAction,
  deepEquals,
  generateDiff,
  recordAssertion,

  // Utilities
  sleep,
  generateSnowflake,

  // Configuration
  getMockConfig,
  configureMock,
  resetMockConfig,

  // User utilities
  createTestUtils,
  TestUsers,
  TestInteractions
} from '@robojs/mock/testing'

// Types
import type {
  TestSession,
  CreateTestSessionConfig,
  MockRoboHandle,
  StartMockRoboOptions,
  RecordedAction,
  ExpectActionOptions,
  WaitForActionOptions,
  InteractionData,
  MockConfig,
  SessionState,
  SessionResponse,
  TestUtils
} from '@robojs/mock/testing'
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `ROBO_MOCK_PORT` | Mock server port |
| `ROBO_MOCK_MODE` | Enable mock mode |
| `ROBO_MOCK_SESSION_ID` | Session ID to connect to |
| `ROBO_MOCK_VERBOSE` | Enable verbose logging |
| `ROBO_MOCK_TEST_MODE` | Running under `robo mock test` |
| `DISCORD_TOKEN` | Bot token (set automatically) |
| `DISCORD_REST_API` | REST API URL (set automatically) |

---

## Example Test File

Complete example showing common patterns:

```typescript
import {
  startMockRobo,
  dispatchEvent,
  dispatchInteraction,
  expectAction,
  expectNoAction,
  waitForAction,
  generateSnowflake,
  sleep,
  type MockRoboHandle
} from '@robojs/mock/testing'
import { ChannelType } from 'discord.js'

describe('My Discord Bot', () => {
  let bot: MockRoboHandle

  beforeAll(async () => {
    bot = await startMockRobo({
      name: 'my-bot-tests',
      testFilePath: __filename,
      timeout: 30000
    })
  }, 60000)

  afterAll(async () => {
    await bot.stop()
  })

  describe('Ping Command', () => {
    it('should respond with Pong!', async () => {
      await dispatchInteraction(bot.sessionId, {
        type: 2,
        data: { name: 'ping', type: 1 },
        guild_id: bot.guildId,
        channel_id: bot.channels[0].id
      })

      await expectAction(bot.sessionId, {
        description: 'Should reply with Pong!',
        type: 'interaction_response',
        expected: {
          type: 4,
          data: { content: 'Pong!' }
        }
      })
    })
  })

  describe('Welcome Messages', () => {
    it('should welcome new members', async () => {
      const userId = generateSnowflake()

      await dispatchEvent(bot.sessionId, 'GUILD_MEMBER_ADD', {
        guild_id: bot.guildId,
        user: {
          id: userId,
          username: 'NewUser',
          discriminator: '0',
          avatar: null
        },
        roles: [],
        joined_at: new Date().toISOString(),
        deaf: false,
        mute: false
      })

      await expectAction(bot.sessionId, {
        description: 'Should send welcome message',
        type: 'REST_CREATE_MESSAGE',
        expected: {
          content: expect.stringContaining('Welcome'),
          embeds: expect.any(Array)
        }
      })
    })
  })

  describe('Message Handling', () => {
    it('should ignore messages from bots', async () => {
      await dispatchEvent(bot.sessionId, 'MESSAGE_CREATE', {
        id: generateSnowflake(),
        channel_id: bot.channels[0].id,
        guild_id: bot.guildId,
        content: 'Hello!',
        author: {
          id: generateSnowflake(),
          username: 'OtherBot',
          discriminator: '0',
          avatar: null,
          bot: true  // Bot message
        },
        timestamp: new Date().toISOString()
      })

      await expectNoAction(bot.sessionId, {
        description: 'Should not respond to bot messages',
        type: 'REST_CREATE_MESSAGE',
        waitMs: 1000
      })
    })
  })
})
```

---

This documentation was generated for @robojs/mock v0.11.x. For the latest updates, check the source code in `packages/@robojs/mock/src/testing/`.
