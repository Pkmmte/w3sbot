'use client';

import { useState } from 'react';
import { DepthContainer } from './components/depth';
import { 
  DeskSurface, 
  Textbook, 
  EventPoster, 
  SandboxLaptop, 
  QuizNotepad, 
  ToolsTray 
} from './components/desk';
import { CursorData } from './lib/types';

export default function ActivityPage() {
  const [usersInBook] = useState<CursorData[]>([
    { odId: '1', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png', displayName: 'Alice', position: { x: 0, y: 0 }, context: 'book', state: 'active', lastUpdate: Date.now() },
    { odId: '2', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/1.png', displayName: 'Ben', position: { x: 0, y: 0 }, context: 'book', state: 'idle', lastUpdate: Date.now() }
  ]);
  const [isTimerActive, setIsTimerActive] = useState(false);

  return (
    <main className="w-full h-screen bg-[#050508] overflow-hidden">
      <DepthContainer>
        {/* 
          The Desk Plane 
          Everything moves together. We rotate the whole world to look down at the desk.
        */}
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: 'rotateX(25deg) translateY(50px)', // The "Camera Angle"
          }}
        >
          {/* The Desk Surface & Objects Container */}
          <div 
            className="relative"
            style={{ 
              width: 1000, 
              height: 600, 
              transformStyle: 'preserve-3d',
            }}
          >
            {/* 1. The Desk Surface (Background) */}
            <DeskSurface />

            {/* 2. Objects on the Desk */}
            {/* We use a grid-like absolute positioning relative to the 1000x600 desk */}
            
            {/* Center: Textbook */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: 'translateZ(0px)' }}>
              <Textbook usersInBook={usersInBook} onOpen={() => console.log('Open Book')} />
            </div>

            {/* Top Left: Event Poster (Pinned to desk or leaning?) Let's lay it flat-ish */}
            <div className="absolute top-12 left-12" style={{ transform: 'translateZ(0px) rotateZ(-5deg)' }}>
              <EventPoster onJoin={() => console.log('Join Event')} />
            </div>

            {/* Bottom Left: Laptop */}
            <div className="absolute bottom-12 left-12" style={{ transform: 'translateZ(0px) rotateZ(5deg)' }}>
              <SandboxLaptop onOpen={() => console.log('Open Sandbox')} />
            </div>

            {/* Bottom Right: Notepad */}
            <div className="absolute bottom-12 right-12" style={{ transform: 'translateZ(0px) rotateZ(-3deg)' }}>
              <QuizNotepad onOpen={() => console.log('Open Quiz')} />
            </div>

            {/* Top Right: Tools Tray (Maybe floating slightly?) */}
            <div className="absolute top-12 right-12" style={{ transform: 'translateZ(20px)' }}>
              <ToolsTray 
                onTimerClick={() => setIsTimerActive(!isTimerActive)}
                isTimerActive={isTimerActive}
              />
            </div>

          </div>
        </div>
      </DepthContainer>
    </main>
  );
}
