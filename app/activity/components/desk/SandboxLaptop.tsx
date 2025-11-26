'use client';

import { DeskObject } from './DeskObject';

interface SandboxLaptopProps {
  onOpen?: () => void;
}

export function SandboxLaptop({ onOpen }: SandboxLaptopProps) {
  return (
    <DeskObject 
      onClick={onOpen}
      hoverLift={10}
      disabled={!onOpen}
      className="sandbox-laptop"
    >
      <div 
        className="relative"
        style={{
          width: 130,
          height: 100,
        }}
      >
        {/* Screen */}
        <div 
          className="absolute top-0 left-0 right-0 rounded-t-lg overflow-hidden"
          style={{
            height: 75,
            background: 'linear-gradient(180deg, #1e1e2e 0%, #2d2d3d 100%)',
            border: '3px solid #3d3d4d',
            borderBottom: 'none',
          }}
        >
          {/* Code preview */}
          <div className="p-2 font-mono text-xs">
            <div style={{ color: '#569CD6' }}>{'<div>'}</div>
            <div className="pl-2" style={{ color: '#CE9178' }}>"Hello"</div>
            <div style={{ color: '#569CD6' }}>{'</div>'}</div>
          </div>
          
          {/* Code icon */}
          <div 
            className="absolute bottom-2 right-2 text-2xl opacity-30"
          >
            {'</>'}
          </div>
        </div>
        
        {/* Base/keyboard */}
        <div 
          className="absolute bottom-0 left-0 right-0 rounded-b-lg"
          style={{
            height: 30,
            background: 'linear-gradient(180deg, #4d4d5d 0%, #3d3d4d 100%)',
            borderRadius: '0 0 8px 8px',
          }}
        >
          {/* Touchpad hint */}
          <div 
            className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded"
            style={{
              width: 30,
              height: 6,
              background: 'rgba(0,0,0,0.3)',
            }}
          />
        </div>
        
        {/* Label */}
        <div 
          className="absolute -bottom-6 left-0 right-0 text-center text-xs text-white/60 font-medium"
        >
          Sandbox
        </div>
      </div>
    </DeskObject>
  );
}
