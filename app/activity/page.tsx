'use client';

import { DepthContainer, DepthLayer } from './components/depth';
import { colors, depth } from './lib/tokens';

export default function ActivityPage() {
  return (
    <main className="w-full h-screen bg-slate-900 overflow-hidden">
      <DepthContainer className="flex items-center justify-center">
        
        {/* Background Layer - The Desk */}
        <DepthLayer 
          z={depth.desk} 
          className="absolute inset-0 w-full h-full"
        >
          <div 
            className="w-full h-full opacity-80"
            style={{ backgroundColor: colors.desk.surface }}
          />
          {/* Grid pattern to make movement more obvious */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]" />
        </DepthLayer>

        {/* Middle Layer - The Book (Placeholder) */}
        <DepthLayer 
          z={depth.objects}
          className="relative w-64 h-80 rounded-lg"
        >
          <div 
            className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-2xl border-l-8 border-white/10"
            style={{ 
              backgroundColor: colors.book.cover,
              boxShadow: `0 20px 50px ${colors.desk.shadow}`
            }}
          >
            <span style={{ color: colors.book.title }}>W3Schools</span>
          </div>
        </DepthLayer>

        {/* Foreground Layer - Floating UI */}
        <DepthLayer 
          z={depth.foreground}
          className="absolute top-20 right-20"
        >
          <div 
            className="px-6 py-3 rounded-2xl text-white font-medium shadow-xl border border-white/20 backdrop-blur-md"
            style={{ backgroundColor: colors.ui.primary }}
          >
            Active Users: 3
          </div>
        </DepthLayer>

        {/* Foreground Layer - Instructions */}
        <DepthLayer
            z={depth.ui}
            className="absolute bottom-20 left-1/2 -translate-x-1/2"
        >
            <div className="text-white text-lg font-medium bg-black/40 px-8 py-4 rounded-full backdrop-blur-md border border-white/10 shadow-2xl">
                Move cursor to test 3D depth
            </div>
        </DepthLayer>

      </DepthContainer>
    </main>
  );
}

