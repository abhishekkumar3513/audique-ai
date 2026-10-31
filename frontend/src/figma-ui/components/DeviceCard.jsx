import { motion } from 'motion/react';
import { Smartphone, Monitor, Wifi } from 'lucide-react';

export function DeviceCard({ device, isRecording }) {
  const isConnected = device.status === 'connected';
  const isTeacher = device.type === 'teacher';
  const hasAudio = device.audioLevel > 30;

  return (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glow effect on audio detection */}
      {isRecording && hasAudio && (
        <motion.div
          className={`absolute -inset-1 rounded-2xl blur-xl ${
            isTeacher
              ? 'bg-gradient-to-r from-purple-600 to-pink-600'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600'
          }`}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <div
        className={`
          relative p-6 rounded-2xl overflow-hidden
          bg-white/5 backdrop-blur-2xl border transition-all duration-300
          ${
            isConnected
              ? 'border-white/20 group-hover:border-white/40'
              : 'border-white/5 opacity-60'
          }
        `}
      >
        {/* Pulse effect when audio detected */}
        {isRecording && hasAudio && (
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at center, rgba(168,85,247,0.1) 0%, transparent 70%)',
                'radial-gradient(circle at center, rgba(236,72,153,0.2) 0%, transparent 70%)',
                'radial-gradient(circle at center, rgba(168,85,247,0.1) 0%, transparent 70%)',
              ],
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        <div className="relative flex items-start gap-4">
          {/* Device Icon */}
          <motion.div
            className={`
              p-3 rounded-xl bg-gradient-to-br
              ${isTeacher ? 'from-purple-600 to-pink-600' : 'from-blue-600 to-cyan-600'}
            `}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            {isTeacher ? (
              <Monitor className="w-6 h-6 text-white" />
            ) : (
              <Smartphone className="w-6 h-6 text-white" />
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            {/* Device Name */}
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-white truncate">{device.name}</h4>
              {isTeacher && (
                <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">
                  Primary
                </span>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
              <Wifi
                className={`w-4 h-4 ${
                  isConnected ? 'text-emerald-400' : 'text-gray-500'
                }`}
              />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              <span>•</span>
              <span className="capitalize">{device.type}</span>
            </div>

            {/* Audio Level Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Audio level</span>
                <span>{device.audioLevel}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    isTeacher
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}
                  animate={{
                    width: `${device.audioLevel}%`,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
