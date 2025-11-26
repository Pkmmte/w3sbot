'use client';

import { motion } from 'framer-motion';
import { springs } from '../../lib/tokens';

interface ToolsTrayProps {
  onTimerClick?: () => void;
  onNotesClick?: () => void;
  onHelpClick?: () => void;
  timerValue?: string;
  isTimerActive?: boolean;
}

export function ToolsTray({ 
  onTimerClick,
  onNotesClick,
  onHelpClick,
  timerValue = '25:00',
  isTimerActive = false,
}: ToolsTrayProps) {
  return (
    <motion.div 
      className="tools-tray flex flex-col gap-3 p-3 rounded-xl"
      style={{
        background: 'rgba(30, 30, 46, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      }}
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5, ...springs.gentle }}
    >
      {/* Timer Tool */}
      <ToolButton 
        onClick={onTimerClick}
        icon={
          <div className="text-center">
            <div 
              className={`text-sm font-mono font-bold ${isTimerActive ? 'text-purple-400' : 'text-white'}`}
            >
              {timerValue}
            </div>
            <div className="text-[10px] text-white/50 mt-0.5">
              {isTimerActive ? 'FOCUS' : 'START'}
            </div>
          </div>
        }
        label="Timer"
        active={isTimerActive}
      />
      
      {/* Notes Tool */}
      <ToolButton 
        onClick={onNotesClick}
        icon={<span className="text-xl">📝</span>}
        label="Notes"
      />
      
      {/* Help Tool */}
      <ToolButton 
        onClick={onHelpClick}
        icon={<span className="text-xl">❓</span>}
        label="Help"
      />
    </motion.div>
  );
}

interface ToolButtonProps {
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function ToolButton({ onClick, icon, label, active = false }: ToolButtonProps) {
  return (
    <motion.button
      className="tool-button flex flex-col items-center justify-center p-3 rounded-lg transition-colors"
      style={{
        width: 70,
        height: 60,
        background: active 
          ? 'rgba(139, 92, 246, 0.2)' 
          : 'rgba(255,255,255,0.05)',
        border: active 
          ? '1px solid rgba(139, 92, 246, 0.5)' 
          : '1px solid transparent',
      }}
      whileHover={{ 
        background: 'rgba(255,255,255,0.1)',
        scale: 1.05,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {icon}
      <span className="text-[10px] text-white/50 mt-1">{label}</span>
    </motion.button>
  );
}
