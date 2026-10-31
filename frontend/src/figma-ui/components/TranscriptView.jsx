import { useState } from "react";
import { motion } from "motion/react";
import {
  FileText,
  Download,
  Search,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
} from "lucide-react";
import { Input } from "./ui/input";

const mockTranscript = [
  {
    id: 1,
    speaker: "Professor",
    time: "00:00",
    text: "Demo transcript line. Record to see your own transcript here.",
    isSpeaking: false,
    isPrimary: true,
  },
];

export function TranscriptView({ hasData, transcript }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFiltered, setShowFiltered] = useState(false);

  let transcriptItems = mockTranscript;

  if (hasData && transcript && transcript.trim().length > 0) {
    const rawParagraphs = transcript.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length > 0);

    let blocks = [];
    if (rawParagraphs.length > 1) {
      blocks = rawParagraphs;
    } else {
      // Group sentences into natural multi-sentence speech blocks instead of 1 box per sentence
      const sentences = transcript
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const chunkSize = 3;
      for (let i = 0; i < sentences.length; i += chunkSize) {
        blocks.push(sentences.slice(i, i + chunkSize).join(" "));
      }
    }

    transcriptItems = blocks.map((block, idx) => {
      const minutes = Math.floor((idx * 45) / 60);
      const seconds = (idx * 45) % 60;
      const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      return {
        id: idx + 1,
        speaker: "Teacher",
        time: timeStr,
        text: block,
        isSpeaking: false,
        isPrimary: true,
      };
    });
  }

  const filteredTranscript = transcriptItems.filter((item) => {
    if (!showFiltered && !item.isPrimary) return false;
    if (searchQuery && !item.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (!hasData && transcriptItems === mockTranscript) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="relative max-w-2xl mx-auto">
          <motion.div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-3xl blur-3xl opacity-20" />
          <div className="relative p-16 bg-white/5 backdrop-blur-2xl border-2 border-dashed border-white/20 rounded-3xl">
            <Sparkles className="w-16 h-16 text-pink-400 mx-auto mb-4" />
            <p className="text-xl text-gray-300 mb-2">No transcript available</p>
            <p className="text-gray-500">Start recording to generate AI transcripts</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Controls */}
      <motion.div
        className="relative group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-3xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

        <div className="relative p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-2xl focus:border-pink-500/50 transition-all duration-300"
              />
            </div>

            <div className="flex gap-2">
              <motion.button
                onClick={() => setShowFiltered(!showFiltered)}
                className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showFiltered ? (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span className="hidden sm:inline">All Audio</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span className="hidden sm:inline">Primary</span>
                  </>
                )}
              </motion.button>
              <motion.button
                className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Merged Audio Info */}
      <motion.div
        className="relative group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600 rounded-3xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

        <div className="relative p-6 bg-gradient-to-br from-pink-500/10 to-rose-500/10 backdrop-blur-2xl border border-pink-500/30 rounded-3xl overflow-hidden">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>

            <div className="flex-1">
              <h3 className="text-xl text-white mb-1">AI-Enhanced Transcript</h3>
              <p className="text-gray-400">
                Merged from multiple devices • Focused on{" "}
                <span className="text-pink-400">teacher&apos;s voice</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Transcript */}
      <motion.div
        className="relative group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-3xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

        <div className="relative p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-pink-400" />
            <h3 className="text-2xl text-white">Full Transcript</h3>
          </div>

          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
            {filteredTranscript.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className={`relative p-5 rounded-2xl transition-all duration-300 group/item overflow-hidden ${
                  item.isPrimary
                    ? "bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 hover:border-pink-500/40"
                    : "bg-white/5 border border-white/10 opacity-60"
                }`}
                whileHover={item.isPrimary ? { x: 5, scale: 1.01 } : {}}
              >
                <div className="relative flex items-start gap-4">
                  <motion.div className="flex-shrink-0 w-16 text-center" whileHover={{ scale: 1.1 }}>
                    <span className={`text-sm ${item.isPrimary ? "text-pink-400" : "text-gray-600"}`}>
                      {item.time}
                    </span>
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={item.isPrimary ? "text-pink-400" : "text-gray-600"}>{item.speaker}</span>
                    </div>

                    <p
                      className={`leading-relaxed ${
                        item.isPrimary ? "text-gray-300 group-hover/item:text-white" : "text-gray-600 italic"
                      } transition-colors duration-300`}
                    >
                      {item.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
