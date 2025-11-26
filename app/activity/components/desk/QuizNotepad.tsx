'use client';

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
