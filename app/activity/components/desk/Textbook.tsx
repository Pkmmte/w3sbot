// app/activity/components/desk/Textbook.tsx
'use client';
import { motion } from 'framer-motion';
import { DeskObject } from './DeskObject';
import { BookPin } from '../presence/BookPin';
import { colors } from '../../lib/tokens';
import { CursorData } from '../../lib/types';

interface Props { 
  usersInBook: CursorData[]; 
  onOpen: () => void; 
}

export function Textbook({ usersInBook, onOpen }: Props) {
  return (
    <DeskObject onClick={onOpen} hoverLift={15} hoverScale={1.02}>
      <div className="relative" style={{ width: 260, height: 360 }}>
        
        {/* === BOOK SHADOW === */}
        <div 
          className="absolute -bottom-4 left-4 right-4 h-8 rounded-full blur-xl"
          style={{ background: 'rgba(0,0,0,0.4)' }}
        />

        {/* === BACK COVER (visible as depth) === */}
        <div 
          className="absolute rounded-lg"
          style={{
            top: 4,
            left: -8,
            right: 8,
            bottom: -4,
            background: colors.book.coverDark,
            boxShadow: '-2px 2px 8px rgba(0,0,0,0.3)',
          }}
        />

        {/* === PAGE EDGES (right side) === */}
        <div 
          className="absolute rounded-r-sm"
          style={{
            top: 8,
            bottom: 8,
            right: -10,
            width: 28,
            background: `linear-gradient(90deg, #e8dcc8 0%, #f5efe4 50%, #e0d4c0 100%)`,
            boxShadow: '2px 0 4px rgba(0,0,0,0.15)',
          }}
        >
          {/* Page lines */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)',
            }}
          />
        </div>

        {/* === PAGE EDGES (bottom) === */}
        <div 
          className="absolute rounded-b-sm"
          style={{
            left: 8,
            right: -2,
            bottom: -8,
            height: 24,
            background: `linear-gradient(180deg, #e8dcc8 0%, #f5efe4 50%, #d8cbb8 100%)`,
            boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
          }}
        />

        {/* === SPINE (left edge) === */}
        <div 
          className="absolute rounded-l-md"
          style={{
            top: 0,
            bottom: 0,
            left: -12,
            width: 18,
            background: `linear-gradient(90deg, ${colors.book.spine} 0%, #4a2810 60%, ${colors.book.coverDark} 100%)`,
            boxShadow: '-3px 0 8px rgba(0,0,0,0.3)',
          }}
        >
          {/* Spine text */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
            }}
          >
            <span 
              className="text-[10px] font-bold tracking-[3px]"
              style={{ color: colors.book.title, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
              W3SCHOOLS
            </span>
          </div>
        </div>

        {/* === FRONT COVER (main) === */}
        <div 
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            background: `linear-gradient(145deg, ${colors.book.cover} 0%, #6b3812 50%, ${colors.book.coverDark} 100%)`,
            boxShadow: `
              inset 3px 0 8px rgba(0,0,0,0.3),
              inset -1px 0 3px rgba(255,255,255,0.1),
              4px 4px 12px rgba(0,0,0,0.3)
            `,
          }}
        >
          {/* Leather texture */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              mixBlendMode: 'overlay',
            }}
          />

          {/* Cover content */}
          <div className="relative h-full flex flex-col items-center justify-center p-6">
            
            {/* Gold embossed title area */}
            <div 
              className="text-center p-5 rounded-lg mb-4"
              style={{ 
                background: 'rgba(0,0,0,0.25)', 
                border: `2px solid ${colors.book.title}`,
                boxShadow: `
                  inset 0 1px 0 rgba(255,255,255,0.1),
                  0 0 20px rgba(255,215,0,0.1)
                `,
              }}
            >
              <div 
                className="text-2xl font-bold mb-2 font-serif"
                style={{ 
                  color: colors.book.title, 
                  textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(255,215,0,0.3)' 
                }}
              >
                W3Schools
              </div>
              <div className="text-4xl mb-3">📚</div>
              <div 
                className="text-xs font-bold tracking-[0.25em]"
                style={{ color: colors.book.title }}
              >
                TUTORIALS
              </div>
            </div>
            
            {/* Users reading indicator */}
            {usersInBook.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {usersInBook.slice(0, 4).map(u => (
                  <BookPin 
                    key={u.odId} 
                    avatarUrl={u.avatarUrl} 
                    displayName={u.displayName} 
                  />
                ))}
                {usersInBook.length > 4 && (
                  <div className="text-white/60 text-xs self-center ml-1">
                    +{usersInBook.length - 4}
                  </div>
                )}
              </div>
            )}
            
            {/* Click prompt */}
            <motion.div 
              className="text-white/50 text-xs tracking-wider mt-2" 
              animate={{ opacity: [0.3, 0.7, 0.3] }} 
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              Click to open
            </motion.div>
          </div>
        </div>
      </div>
    </DeskObject>
  );
}