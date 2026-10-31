import { motion } from 'motion/react';

export function PremiumButton({ icon: Icon, label, gradient, onClick, disabled }) {
  return (
    <motion.div
      className="relative group"
      whileHover={!disabled ? { scale: 1.05, y: -8 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
    >
      {/* Glow effect */}
      <motion.div
        className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-0 ${
          !disabled && 'group-hover:opacity-70'
        } transition-opacity duration-500`}
      />

      {/* Main button */}
      <motion.button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`
          relative w-full p-8 rounded-2xl overflow-hidden
          bg-white/5 backdrop-blur-xl border border-white/10
          transition-all duration-500
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{ perspective: '1000px' }}
      >
        {/* Animated background gradient */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
        />

        {/* Shimmer effect */}
        {!disabled && (
          <motion.div
            className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            }}
          />
        )}

        <div className="relative flex flex-col items-center gap-4">
          {/* Icon container */}
          <motion.div
            className={`relative p-4 rounded-xl bg-gradient-to-br ${gradient}`}
            whileHover={
              !disabled
                ? {
                    rotate: [0, -10, 10, -10, 0],
                    scale: 1.1,
                  }
                : {}
            }
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-black/20 rounded-xl" />
            <Icon className="relative w-8 h-8 text-white" />
          </motion.div>

          {/* Label */}
          <motion.span
            className="text-white text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all duration-300"
            style={{
              backgroundImage: `linear-gradient(to right, ${gradient
                .split(' ')
                .slice(1)
                .join(' ')})`,
            }}
          >
            {label}
          </motion.span>
        </div>

        {/* Corner accent */}
        {!disabled && (
          <motion.div
            className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500`}
          />
        )}
      </motion.button>
    </motion.div>
  );
}
