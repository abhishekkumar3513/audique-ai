import { motion } from 'motion/react';
import { Smartphone, Volume2 } from 'lucide-react';

export function DeviceCard({ device }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative p-4 rounded-xl bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 hover:border-purple-500/50 transition-all duration-300 group"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="p-3 rounded-lg bg-purple-500/20 backdrop-blur-sm group-hover:bg-purple-500/30 transition-colors">
            <Smartphone className="w-5 h-5 text-purple-400" />
          </div>
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-white">{device.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${device.audioLevel}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-xs text-gray-400">{device.audioLevel}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
