'use client';
import { motion } from 'framer-motion';
import { DeskObject } from './DeskObject';
import { BookPin } from '../presence/BookPin';
import { colors } from '../../lib/tokens';
import { CursorData } from '../../lib/types';

interface Props { usersInBook: CursorData[]; onOpen: () => void; }

export function Textbook({ usersInBook, onOpen }: Props) {
  return (
    <DeskObject onClick={onOpen} hoverLift={20} hoverScale={1.03}>
      <div className="relative" style={{ transformStyle: "preserve-3d", width: 280, height: 380 }}>
        {/* COVER (front) */}
        <div className="absolute inset-0 rounded-r-lg overflow-hidden" style={{
          background: `linear-gradient(135deg, ${colors.book.cover} 0%, ${colors.book.coverDark} 100%)`,
          boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.3)',
          transform: 'translateZ(20px)',
        }}>
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }} />
          <div className="relative h-full flex flex-col items-center justify-center p-6">
            <div className="text-center p-4 rounded-lg mb-4" style={{ background: 'rgba(0,0,0,0.2)', border: `2px solid ${colors.book.title}` }}>
              <div className="text-2xl font-bold mb-1" style={{ color: colors.book.title }}>W3Schools</div>
              <div className="text-3xl mb-2">📚</div>
              <div className="text-sm font-medium tracking-wider" style={{ color: colors.book.title }}>TUTORIALS</div>
            </div>
            {usersInBook.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {usersInBook.slice(0, 5).map(u => <BookPin key={u.odId} avatarUrl={u.avatarUrl} displayName={u.displayName} />)}
                {usersInBook.length > 5 && <div className="text-white/70 text-sm self-center">+{usersInBook.length - 5} more</div>}
              </div>
            )}
            <motion.div className="text-white/60 text-sm" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}>
              Click to open
            </motion.div>
          </div>
        </div>
        
        {/* SPINE (left) */}
        <div className="absolute top-0 h-full rounded-l-sm" style={{
          width: 40, left: 0,
          background: `linear-gradient(90deg, ${colors.book.spine} 0%, ${colors.book.coverDark} 100%)`,
          transform: 'rotateY(-90deg) translateZ(0px) translateX(-20px)',
          transformOrigin: 'right center',
        }}>
          <div className="h-full flex items-center justify-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: colors.book.title, fontSize: 12, fontWeight: 'bold', letterSpacing: 2 }}>
            W3SCHOOLS
          </div>
        </div>
        
        {/* PAGE EDGES (right) */}
        <div className="absolute top-2 bottom-2" style={{
          width: 35, right: 0,
          background: `linear-gradient(90deg, ${colors.book.pages} 0%, #E8E0D5 100%)`,
          transform: 'rotateY(90deg) translateZ(17px) translateX(17.5px)',
          transformOrigin: 'left center',
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)',
        }} />
        
        {/* BOTTOM PAGES */}
        <div className="absolute left-0 right-0" style={{
          height: 35, bottom: 0,
          background: colors.book.pages,
          transform: 'rotateX(90deg) translateZ(17px) translateY(17.5px)',
          transformOrigin: 'bottom center',
        }} />
        
        {/* BACK */}
        <div className="absolute inset-0 rounded-r-lg" style={{ background: colors.book.coverDark, transform: 'translateZ(-20px)' }} />
      </div>
    </DeskObject>
  );
}
