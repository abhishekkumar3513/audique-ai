import { motion } from 'motion/react';
import { CheckCircle2, Volume2, VolumeX, Waves } from 'lucide-react';

export function VoiceProcessingPanel({ devices }) {
  const teacherDevice = devices.find((d) => d.type === 'teacher');
  const teacherLevel = teacherDevice?.audioLevel || 0;

  return (
    <div className="relative">
      <motion.div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur-3xl opacity-20" />

      <div className="relative p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Waves className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-2xl text-white">Voice Processing Active</h3>
            <p className="text-gray-400">
              AI-powered noise filtering and voice isolation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Teacher Voice Detected */}
          <motion.div
            className="relative p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20 rounded-2xl overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="absolute inset-0 bg-green-500/5"
              animate={{
                opacity: teacherLevel > 50 ? [0.5, 1, 0.5] : 0.5,
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />

            <div className="relative">
              <motion.div
                className="flex items-center gap-3 mb-4"
                animate={{
                  x: teacherLevel > 50 ? [0, 2, 0] : 0,
                }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                <Volume2 className="w-6 h-6 text-green-400" />
                <span className="text-white">Teacher Voice Detected</span>
              </motion.div>

              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                  animate={{ width: `${teacherLevel}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Background Noise Filtered */}
          <motion.div
            className="relative p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/20 rounded-2xl overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <VolumeX className="w-6 h-6 text-orange-400" />
                <span className="text-white">Background Noise Ignored</span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-orange-400" />
                <span className="text-gray-400">Active filtering</span>
              </div>
            </div>
          </motion.div>

          {/* Merged Audio Quality */}
          <motion.div
            className="relative p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-blue-400" />
                <span className="text-white">Multi-Device Merge</span>
              </div>

              <div className="flex items-center gap-2">
                <motion.div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    animate={{ width: ['60%', '95%', '60%'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.div>
                <span className="text-blue-400">Optimal</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
