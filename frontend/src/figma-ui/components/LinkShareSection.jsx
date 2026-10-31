import { useState } from 'react';
import { motion } from 'motion/react';
import { Share2, Copy, Check, QrCode, Users } from 'lucide-react';

export function LinkShareSection({ onAddDevice }) {
  const [copied, setCopied] = useState(false);
  const shareLink = 'https://classroom-ai.app/join/xyz789';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateJoin = () => {
    const studentNumber = Math.floor(Math.random() * 100);
    if (onAddDevice) {
      onAddDevice(`Student ${studentNumber}`);
    }
  };

  return (
    <div className="relative">
      <motion.div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-3xl blur-3xl opacity-20" />

      <div className="relative p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden group">
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(236,72,153,0.1) 0%, transparent 70%)',
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="p-3 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Share2 className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-2xl text-white">Share with Students</h3>
              <p className="text-gray-400">Multi-device recording for best quality</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Link Share */}
            <motion.div
              className="relative p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-pink-400" />
                <span className="text-white">Session Link</span>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-gray-300 truncate text-sm">{shareLink}</p>
                </div>

                <motion.button
                  onClick={handleCopy}
                  className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl text-white relative overflow-hidden group/btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                    style={{ opacity: 0.2 }}
                  />

                  <motion.div
                    animate={copied ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </motion.div>
                </motion.button>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Students can join and contribute audio from their devices
              </p>
            </motion.div>

            {/* QR Code */}
            <motion.div
              className="relative p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center justify-center"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center mb-4"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.6 }}
              >
                <QrCode className="w-20 h-20 text-gray-800" />
              </motion.div>

              <p className="text-white mb-1">Scan to Join</p>
              <p className="text-xs text-gray-500 text-center">
                Quick access via mobile camera
              </p>
            </motion.div>
          </div>

          {/* Demo Button */}
          <motion.button
            onClick={handleSimulateJoin}
            className="w-full mt-6 px-6 py-4 bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/20 rounded-2xl text-gray-400 hover:text-white hover:border-white/40 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Simulate Student Joining (Demo)
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
