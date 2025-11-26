'use client';
import { motion } from 'framer-motion';

interface Props { avatarUrl: string; displayName: string; }

export function BookPin({ avatarUrl, displayName }: Props) {
  return (
    <motion.div
      className="relative"
      initial={{ scale: 0, y: -10 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0, y: -10 }}
      whileHover={{ scale: 1.1 }}
      title={`${displayName} is reading`}
    >
      <div className="w-0.5 h-2 mx-auto rounded-full bg-red-600" />
      <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-md -mt-0.5">
        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
      </div>
    </motion.div>
  );
}
