import { motion } from "motion/react";
import { Home, BookOpen, FileText, StickyNote, Download, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ThemeToggle } from "./ThemeToggle";
import { FlashcardsView } from "./FlashcardsView";
import { SummaryView } from "./SummaryView";
import { NotesView } from "./NotesView";
import { TranscriptView } from "./TranscriptView";

export function DashboardPage({
  onNavigateToHome,
  hasRecordingData,
  transcript,
  summary,
  notes,
  flashcards,
  onSummarize,
  isSummarizing,
  onDownloadPdf,
  onLogout,
  onRefreshFlashcards,
}) {
  return (
    <div className="min-h-screen relative z-10 bg-gradient-to-b from-[#050116] via-[#08001f] to-[#140032] text-white">
      {/* Header */}
      <header className="relative z-20 p-6 border-b border-white/5 backdrop-blur-2xl bg-black/30">
  <div className="max-w-7xl mx-auto flex justify-between items-center">
    <motion.div
      className="flex items-center gap-4"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, type: "spring" }}
    >
      <motion.button
        onClick={onNavigateToHome}
        className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
        <Home className="w-6 h-6 text-white relative z-10 shrink-0" />
      </motion.button>

      <div className="flex items-center gap-3">
        <motion.div
          className="relative"
          whileHover={{ scale: 1.1, rotate: 180 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur-xl opacity-70" />
          <div className="relative p-3 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white shrink-0" />
          </div>
        </motion.div>
        <div>
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200">
            Learning Dashboard
          </h1>
          <p className="text-gray-400 text-sm">AI-Generated Study Materials</p>
        </div>
      </div>
    </motion.div>

    {/* RIGHT SIDE BUTTONS */}
    <div className="flex items-center gap-3">

      {/* Export PDF button */}
      <motion.button
        onClick={onDownloadPdf}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white relative overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed"
        whileHover={{ scale: summary ? 1.05 : 1 }}
        whileTap={{ scale: summary ? 0.95 : 1 }}
        disabled={!summary}
      >
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.5 }}
          style={{ opacity: 0.2 }}
        />
        <span className="flex items-center gap-2 relative z-10">
          <Download className="w-5 h-5 shrink-0" />
          Export Notes
        </span>
      </motion.button>

      <ThemeToggle />

      {/* ✅ SIGN OUT BUTTON */}
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
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Tabs defaultValue="flashcards" className="w-full">
            {/* Tab List */}
            <motion.div
              className="relative mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-2xl opacity-20" />

                <TabsList className="relative grid w-full max-w-4xl mx-auto grid-cols-4 gap-4 bg-white/5 backdrop-blur-2xl p-3 border border-white/10 rounded-3xl">
                  <TabsTrigger
                    value="flashcards"
                    className="flex items-center justify-center relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white gap-2 py-4 rounded-2xl transition-all duration-300 text-gray-400 hover:text-white data-[state=active]:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                  >
                    <BookOpen className="w-5 h-5 shrink-0" />
                    <span className="hidden sm:inline">Flashcards</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="summary"
                    className="flex items-center justify-center relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white gap-2 py-4 rounded-2xl transition-all duration-300 text-gray-400 hover:text-white data-[state=active]:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                  >
                    <FileText className="w-5 h-5 shrink-0" />
                    <span className="hidden sm:inline">Summary</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="notes"
                    className="flex items-center justify-center relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white gap-2 py-4 rounded-2xl transition-all duration-300 text-gray-400 hover:text-white data-[state=active]:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                  >
                    <StickyNote className="w-5 h-5 shrink-0" />
                    <span className="hidden sm:inline">Notes</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="transcript"
                    className="flex items-center justify-center relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white gap-2 py-4 rounded-2xl transition-all duration-300 text-gray-400 hover:text-white data-[state=active]:shadow-[0_0_30px_rgba(236,72,153,0.5)]"
                  >
                    <FileText className="w-5 h-5 shrink-0" />
                    <span className="hidden sm:inline">Transcript</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </motion.div>

            {/* Tabs Content */}
            <TabsContent value="flashcards">
              <FlashcardsView
                hasData={hasRecordingData}
                flashcards={flashcards}
                onRefresh={onRefreshFlashcards}
              />
            </TabsContent>

            <TabsContent value="summary">
              <SummaryView
                hasData={hasRecordingData}
                summary={summary}
                onSummarize={onSummarize}
                isSummarizing={isSummarizing}
                onDownloadPdf={onDownloadPdf}
              />
            </TabsContent>

            <TabsContent value="notes">
              <NotesView hasData={hasRecordingData} notes={notes} />
            </TabsContent>

            <TabsContent value="transcript">
              <TranscriptView hasData={hasRecordingData} transcript={transcript} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
