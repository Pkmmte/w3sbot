'use client';

import { motion } from 'framer-motion';
import { DeskObject } from './DeskObject';

interface EventPosterProps {
  eventName?: string;
  eventType?: 'challenge' | 'tournament' | 'special';
  endsIn?: string;
  onJoin?: () => void;
}

export function EventPoster({ 
  eventName = 'Weekly Challenge',
  eventType = 'challenge',
  endsIn = '2d 14h',
  onJoin,
}: EventPosterProps) {
  const icons = {
    challenge: '🏆',
    tournament: '⚔️',
    special: '✨',
  };

  return (
    <DeskObject 
      onClick={onJoin} 
      hoverLift={12}
      disabled={!onJoin}
      className="event-poster"
    >
      <div 
        className="relative rounded-lg overflow-hidden"
        style={{
          width: 140,
          height: 180,
          background: 'linear-gradient(135deg, #1E3A5F 0%, #0F1C2E 100%)',
          border: '2px solid rgba(255,215,0,0.3)',
          boxShadow: 'inset 0 0 20px rgba(255,215,0,0.1)',
        }}
      >
        {/* Decorative corner */}
        <div 
          className="absolute top-0 right-0 w-8 h-8"
          style={{
            background: 'linear-gradient(135deg, transparent 50%, rgba(255,215,0,0.2) 50%)',
          }}
        />
        
        {/* Content */}
        <div className="p-3 h-full flex flex-col items-center justify-between text-center">
          {/* Header */}
          <div 
            className="text-xs font-bold tracking-wider"
            style={{ color: 'rgba(255,215,0,0.8)' }}
          >
            ★ EVENT ★
          </div>
          
          {/* Icon */}
          <div className="text-4xl my-2">
            {icons[eventType]}
          </div>
          
          {/* Title */}
          <div className="text-white font-bold text-sm leading-tight">
            {eventName}
          </div>
          
          {/* Timer */}
          <div className="text-xs text-white/60 mt-1">
            Ends in: {endsIn}
          </div>
          
          {/* Join button (if handler provided) */}
          {onJoin && (
            <motion.div
              className="mt-2 px-4 py-1.5 rounded text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#1a1a2e',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Join
            </motion.div>
          )}
        </div>
        
        {/* "NEW" badge if applicable */}
        <motion.div
          className="absolute -top-1 -right-1 px-2 py-0.5 text-xs font-bold rounded"
          style={{
            background: '#EF4444',
            color: 'white',
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          NEW
        </motion.div>
      </div>
    </DeskObject>
  );
}
