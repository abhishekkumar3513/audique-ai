import { motion } from 'motion/react';

export function WaveformVisualizer() {
  const bars = Array.from({ length: 40 }, (_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex items-center justify-center gap-1 h-24 px-8"
    >
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-purple-600 via-pink-500 to-blue-500 rounded-full"
          animate={{
            height: [
              Math.random() * 60 + 20,
              Math.random() * 60 + 20,
              Math.random() * 60 + 20,
            ],
          }}
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  );
}
