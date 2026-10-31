import { motion } from 'motion/react';
import { useState } from 'react';

export function WaveformVisualizer({ isActive }) {
  const [bars] = useState(40);

  return (
    <div className="w-full h-32 flex items-center justify-center gap-1">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="flex-1 max-w-2 rounded-full bg-gradient-to-t from-purple-600 via-pink-500 to-blue-500"
          animate={
            isActive
              ? {
                  height: [
                    Math.random() * 60 + 20,
                    Math.random() * 100 + 30,
                    Math.random() * 60 + 20,
                  ],
                  opacity: [0.5, 1, 0.5],
                }
              : {
                  height: 4,
                  opacity: 0.3,
                }
          }
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.02,
          }}
        />
      ))}
    </div>
  );
}
