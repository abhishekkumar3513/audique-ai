import { motion } from 'motion/react';
import { Card } from './ui/card';

// No TypeScript types – just plain JS objects
const colorClasses = {
  purple: {
    bg: 'from-purple-500 to-purple-600',
    hover: 'group-hover:from-purple-600 group-hover:to-purple-700',
    glow: 'group-hover:shadow-purple-500/50',
    icon: 'text-purple-600 dark:text-purple-400',
  },
  blue: {
    bg: 'from-blue-500 to-blue-600',
    hover: 'group-hover:from-blue-600 group-hover:to-blue-700',
    glow: 'group-hover:shadow-blue-500/50',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'from-green-500 to-green-600',
    hover: 'group-hover:from-green-600 group-hover:to-green-700',
    glow: 'group-hover:shadow-green-500/50',
    icon: 'text-green-600 dark:text-green-400',
  },
  pink: {
    bg: 'from-pink-500 to-pink-600',
    hover: 'group-hover:from-pink-600 group-hover:to-pink-700',
    glow: 'group-hover:shadow-pink-500/50',
    icon: 'text-pink-600 dark:text-pink-400',
  },
};

export function ActionButton({ icon: Icon, label, onClick, disabled, color }) {
  const colors = colorClasses[color];

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.05, y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ duration: 0.2 }}
    >
      <Card
        onClick={disabled ? undefined : onClick}
        className={`
          group relative overflow-hidden cursor-pointer p-6
          backdrop-blur-lg bg-white/70 dark:bg-gray-800/70
          border-2 border-gray-200 dark:border-gray-700
          transition-all duration-300
          ${!disabled ? `hover:border-transparent ${colors.glow} hover:shadow-2xl` : 'opacity-50 cursor-not-allowed'}
        `}
      >
        {!disabled && (
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${colors.bg} ${colors.hover} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          />
        )}

        <div className="relative flex flex-col items-center gap-3">
          <motion.div
            className={`p-3 rounded-full bg-gradient-to-br ${colors.bg} ${!disabled ? colors.hover : ''}`}
            whileHover={!disabled ? { rotate: 360 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
          <span className={`${colors.icon} transition-colors`}>
            {label}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
