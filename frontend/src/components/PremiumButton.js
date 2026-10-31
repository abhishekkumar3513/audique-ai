import { motion } from 'motion/react';

// icon is a React component from lucide-react, passed in as prop
export function PremiumButton({ icon: Icon, title, description, gradient, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative group"
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative p-6 rounded-2xl bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 overflow-hidden transition-all duration-300 group-hover:border-white/40">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
        <div className={`absolute -inset-1 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300 -z-10`} />
        
        <div className="relative z-10 flex flex-col items-start gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
