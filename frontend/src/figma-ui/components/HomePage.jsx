import { motion } from 'motion/react';
import { Mic, MicOff, BookOpen, FileText, StickyNote, Share2, Sparkles } from 'lucide-react';
import { PremiumButton } from './PremiumButton';
import { DeviceCard } from './DeviceCard';
import { LinkShareSection } from './LinkShareSection';
import { ThemeToggle } from './ThemeToggle';
import { VoiceProcessingPanel } from './VoiceProcessingPanel';
import { WaveformVisualizer } from './WaveformVisualizer';

export function HomePage({
  isRecording,
  onStartRecording,
  onStopRecording,
  onNavigateToDashboard,
  connectedDevices,
  onAddDevice,
  hasRecordingData,
  onLogout,
}) {
  return (
    <div
      className="
        min-h-screen relative z-10 transition-colors duration-300
        bg-white text-black
        dark:bg-gradient-to-b dark:from-[#050116] dark:via-[#08001f] dark:to-[#140032]
        dark:text-white
      "
    >

      {/* Header */}
      <header className="relative z-20 p-6 border-b border-gray-200 dark:border-white/10 backdrop-blur-2xl bg-gray-50/80 dark:bg-black/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="flex items-center gap-3"
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1, rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur-xl opacity-70" />
              <div className="relative p-3 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-2xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-purple-200 dark:to-pink-200 tracking-tight">
                Audique 
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">AI-Powered Transcription</p>
            </div>
          </motion.div>

          {/* Right side: theme + logout */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500/80 text-white rounded-xl hover:bg-red-600 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.div
            className="inline-block mb-6"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-3xl opacity-40" />
              <div className="relative px-6 py-2 bg-gray-100/80 dark:bg-white/10 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-full">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400">
                  ✨ Next-Gen Recording Technology
                </span>
              </div>
            </div>
          </motion.div>

          <h2 className="text-6xl md:text-7xl text-gray-900 dark:text-white mb-6 tracking-tight font-bold">
            Record. Transcribe.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400">
              Master Everything.
            </span>
          </h2>

          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Transform classroom lectures into interactive flashcards, smart summaries, and searchable
            transcripts with AI-powered voice recognition.
          </p>
        </motion.div>

        {/* Recording Control Center */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative">
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-3xl opacity-30"
              animate={{ opacity: isRecording ? [0.3, 0.6, 0.3] : 0.3 }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <div className="relative p-8 bg-gray-50/80 dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-3xl">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Recording Button */}
                <div className="flex-shrink-0">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Pulse rings */}
                    {isRecording && (
                      <>
                        <motion.div
                          className="absolute inset-0 bg-red-500 rounded-full"
                          animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute inset-0 bg-red-500 rounded-full"
                          animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        />
                      </>
                    )}

                    <div
                      className={`
                        relative w-40 h-40 rounded-full cursor-pointer
                        bg-gradient-to-br transition-all duration-500
                        ${
                          isRecording
                            ? 'from-red-600 via-red-500 to-pink-600 shadow-[0_0_60px_rgba(239,68,68,0.6)]'
                            : 'from-purple-600 via-pink-600 to-blue-600 shadow-[0_0_60px_rgba(168,85,247,0.4)]'
                        }
                      `}
                      onClick={isRecording ? onStopRecording : onStartRecording}
                    >
                      <div className="absolute inset-2 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center">
                        {isRecording ? (
                          <MicOff className="w-16 h-16 text-white" />
                        ) : (
                          <Mic className="w-16 h-16 text-white" />
                        )}
                      </div>
                    </div>
                  </motion.div>

                  <motion.p
                    className="text-center mt-4 text-gray-900 dark:text-white font-medium"
                    animate={{ opacity: isRecording ? [1, 0.5, 1] : 1 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {isRecording ? '🔴 Recording...' : 'Click to Start'}
                  </motion.p>
                </div>

                {/* Waveform Visualizer */}
                {isRecording && (
                  <motion.div
                    className="flex-1 w-full"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <WaveformVisualizer isActive={isRecording} />
                  </motion.div>
                )}

                {/* Status */}
                {!isRecording && (
                  <motion.div
                    className="flex-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-center lg:text-left">
                      <h3 className="text-2xl text-gray-900 dark:text-white mb-2 font-semibold">Ready to Record</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        Start capturing your classroom lectures with crystal-clear quality
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Voice Processing Panel */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-20"
          >
            <VoiceProcessingPanel devices={connectedDevices} />
          </motion.div>
        )}

        {/* Action Buttons Grid */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-3xl text-gray-900 dark:text-white text-center mb-10 font-bold">Smart Learning Tools</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <PremiumButton
              icon={BookOpen}
              label="Flashcards"
              gradient="from-purple-600 via-purple-500 to-pink-600"
              onClick={onNavigateToDashboard}
              disabled={!hasRecordingData}
            />
            <PremiumButton
              icon={FileText}
              label="Summary"
              gradient="from-blue-600 via-cyan-500 to-teal-600"
              onClick={onNavigateToDashboard}
              disabled={!hasRecordingData}
            />
            <PremiumButton
              icon={StickyNote}
              label="Notes"
              gradient="from-green-600 via-emerald-500 to-teal-600"
              onClick={onNavigateToDashboard}
              disabled={!hasRecordingData}
            />
            <PremiumButton
              icon={FileText}
              label="Transcript"
              gradient="from-pink-600 via-rose-500 to-red-600"
              onClick={onNavigateToDashboard}
              disabled={!hasRecordingData}
            />
          </div>
        </motion.div>

        {/* Link Share Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <LinkShareSection onAddDevice={onAddDevice} />
        </motion.div>

        {/* Connected Devices */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="relative">
            <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20" />
            <div className="relative p-8 bg-gray-50/80 dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl text-gray-900 dark:text-white font-semibold">Connected Devices</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {connectedDevices.length} device
                    {connectedDevices.length !== 1 ? 's' : ''} active
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectedDevices.map((device, index) => (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <DeviceCard device={device} isRecording={isRecording} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
