'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Textbook, 
  EventPoster, 
  SandboxLaptop, 
  QuizNotepad, 
  ToolsTray 
} from './components/desk';
import { colors } from './lib/tokens';
import { CursorData } from './lib/types';

export default function ActivityPage() {
  const [usersInBook] = useState<CursorData[]>([
    { odId: '1', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png', displayName: 'Alice', position: { x: 0, y: 0 }, context: 'book', state: 'active', lastUpdate: Date.now() },
    { odId: '2', avatarUrl: 'https://cdn.discordapp.com/embed/avatars/1.png', displayName: 'Ben', position: { x: 0, y: 0 }, context: 'book', state: 'idle', lastUpdate: Date.now() }
  ]);
  const [isTimerActive, setIsTimerActive] = useState(false);

  return (
    <main className="w-full h-screen overflow-hidden relative bg-[#0a0a14]">
      {/* === BACKGROUND AMBIENCE === */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 120% 80% at 50% 20%, rgba(139,92,246,0.08) 0%, transparent 50%)',
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 100% 60% at 50% 80%, rgba(59,130,246,0.05) 0%, transparent 40%)',
          }}
        />
      </div>

      {/* === MAIN CONTENT AREA === */}
      <div className="relative w-full h-full flex items-center justify-center p-8 pb-28">
        
        {/* === THE DESK === */}
        <motion.div
          className="relative w-full max-w-5xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Desk Surface */}
          <div 
            className="relative rounded-3xl p-8 md:p-12"
            style={{
              background: `linear-gradient(160deg, #9a8066 0%, ${colors.desk.surface} 30%, ${colors.desk.surfaceDark} 100%)`,
              boxShadow: `
                0 50px 100px -20px rgba(0,0,0,0.6),
                0 30px 60px -15px rgba(0,0,0,0.4),
                inset 0 2px 0 rgba(255,255,255,0.15),
                inset 0 -3px 0 rgba(0,0,0,0.2)
              `,
              minHeight: '500px',
            }}
          >
            {/* Wood grain texture */}
            <div 
              className="absolute inset-0 rounded-3xl opacity-30 pointer-events-none"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    92deg,
                    transparent 0px,
                    transparent 3px,
                    rgba(0,0,0,0.05) 3px,
                    rgba(0,0,0,0.05) 6px
                  )
                `,
              }}
            />
            
            {/* Light reflection */}
            <div 
              className="absolute top-0 left-0 right-0 h-1/3 rounded-t-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
              }}
            />
            
            {/* Vignette */}
            <div 
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.3) 100%)',
              }}
            />

            {/* === DESK LAYOUT === */}
            <div className="relative grid grid-cols-12 gap-6 items-center min-h-[400px]">
              
              {/* LEFT COLUMN - Poster & Laptop stacked */}
              <div className="col-span-3 flex flex-col gap-8 items-center">
                <div className="transform -rotate-3">
                  <EventPoster onJoin={() => console.log('Join Event')} />
                </div>
                <div className="transform rotate-2">
                  <SandboxLaptop onOpen={() => console.log('Open Sandbox')} />
                </div>
              </div>

              {/* CENTER - The Textbook (hero) */}
              <div className="col-span-6 flex justify-center">
                <Textbook usersInBook={usersInBook} onOpen={() => console.log('Open Book')} />
              </div>

              {/* RIGHT COLUMN - Tools & Notepad */}
              <div className="col-span-3 flex flex-col gap-8 items-center">
                <ToolsTray 
                  onTimerClick={() => setIsTimerActive(!isTimerActive)}
                  isTimerActive={isTimerActive}
                />
                <div className="transform -rotate-2">
                  <QuizNotepad onOpen={() => console.log('Open Quiz')} />
                </div>
              </div>
              
            </div>
          </div>

          {/* Desk front edge (thickness illusion) */}
          <div 
            className="absolute -bottom-3 left-4 right-4 h-4 rounded-b-xl"
            style={{
              background: 'linear-gradient(180deg, #5a4535 0%, #3d2d22 100%)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            }}
          />
        </motion.div>
      </div>

      {/* === BOTTOM BAR === */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, type: 'spring', damping: 25 }}
      >
        <div className="p-4">
          <div 
            className="mx-auto max-w-3xl px-5 py-3 rounded-2xl flex items-center justify-between gap-4"
            style={{
              background: 'rgba(15, 15, 25, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
            }}
          >
            {/* User section */}
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full p-0.5"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
              >
                <img 
                  src="https://cdn.discordapp.com/embed/avatars/0.png" 
                  className="w-full h-full rounded-full"
                  alt="You"
                />
              </div>
              <div>
                <div className="text-white text-sm font-medium">You</div>
                <div className="text-white/40 text-xs">on desk</div>
              </div>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Other users */}
            <div className="flex-1 flex items-center gap-2">
              {usersInBook.slice(0, 3).map((user, i) => (
                <div 
                  key={user.odId}
                  className="w-8 h-8 rounded-full border-2"
                  style={{ 
                    borderColor: user.state === 'active' ? '#3B82F6' : '#6B7280',
                  }}
                >
                  <img src={user.avatarUrl} className="w-full h-full rounded-full" alt={user.displayName} />
                </div>
              ))}
              <span className="text-white/40 text-xs ml-1">{usersInBook.length} reading</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <motion.button 
                className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#FBBF24',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>?</span>
                <span>Stuck</span>
              </motion.button>
              
              <motion.button 
                className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#4ADE80',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>✓</span>
                <span>Got It</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}