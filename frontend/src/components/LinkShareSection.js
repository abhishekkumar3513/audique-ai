import { motion } from 'motion/react';
import { Link2, Copy, QrCode, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function LinkShareSection() {
  const [copied, setCopied] = useState(false);
  const shareLink = 'https://classroom.app/join/abc123'; // later replace with real link

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="relative p-6 rounded-3xl bg-white/5 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10"
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-xl -z-10" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-purple-500/20 backdrop-blur-sm">
          <Link2 className="w-6 h-6 text-purple-400" />
        </div>
        <h2 className="text-2xl font-semibold text-white">Share Link</h2>
      </div>

      <p className="text-gray-400 mb-4">
        Students can join the recording session by scanning the QR code or using the link below.
      </p>

      <div className="flex justify-center mb-6">
        <motion.div
          className="p-6 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center">
            <QrCode className="w-20 h-20 text-purple-600" />
          </div>
        </motion.div>
      </div>

      <div className="relative">
        <input
          type="text"
          value={shareLink}
          readOnly
          className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 dark:bg-white/5 border border-white/20 dark:border-white/10 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
        />
        <motion.button
          onClick={copyToClipboard}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <Copy className="w-5 h-5 text-purple-400" />
          )}
        </motion.button>
      </div>

      {copied && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-green-400 text-sm mt-2 text-center"
        >
          Link copied to clipboard!
        </motion.p>
      )}
    </motion.div>
  );
}
