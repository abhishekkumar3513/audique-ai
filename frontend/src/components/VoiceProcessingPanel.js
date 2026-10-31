import { motion } from 'motion/react';
import { Brain, Sparkles, Zap } from 'lucide-react';

export function VoiceProcessingPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto mb-12"
    >
      <div className="relative p-6 rounded-2xl bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-blue-500/10 blur-xl -z-10" />
        
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            className="p-2 rounded-lg bg-green-500/20"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Brain className="w-5 h-5 text-green-400" />
          </motion.div>
          <h3 className="text-lg font-semibold text-white">Real-time Voice Processing</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Words Detected</span>
            </div>
            <p className="text-2xl font-bold text-white">1,247</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Accuracy</span>
            </div>
            <p className="text-2xl font-bold text-white">98.5%</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Duration</span>
            </div>
            <p className="text-2xl font-bold text-white">12:34</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

