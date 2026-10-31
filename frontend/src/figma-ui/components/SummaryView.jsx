import { motion } from "motion/react";
import { FileText, Download, Copy, Check, Sparkles, Clock, BookOpen, Layers, CheckCircle2, Lightbulb } from "lucide-react";
import { useState } from "react";

const mockSummary = {
  title: "Lecture Summary",
  date: "AI Synthesis",
  duration: "Comprehensive Overview",
  summary:
    "No summary generated yet. Click 'Generate Summary' to create an AI summary from your transcript.",
};

function formatInline(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-cyan-200">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-white/10 text-pink-300 font-mono text-xs">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function SummaryView({ hasData, summary, onSummarize, isSummarizing, onDownloadPdf }) {
  const [copied, setCopied] = useState(false);

  const effectiveSummary =
    hasData && summary && summary.trim().length > 0 ? summary : mockSummary.summary;

  const handleCopy = () => {
    navigator.clipboard.writeText(effectiveSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasData) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
        <div className="relative max-w-2xl mx-auto">
          <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-3xl opacity-20" />
          <div className="relative p-16 bg-white/5 backdrop-blur-2xl border-2 border-dashed border-white/20 rounded-3xl">
            <Sparkles className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <p className="text-xl text-gray-300 mb-2">No summary available</p>
            <p className="text-gray-500">Record and transcribe audio to generate an academic summary</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Parse structured sections: Overview, Core Concepts, Key Takeaways
  const sections = {
    overview: [],
    concepts: [],
    takeaways: [],
  };

  const lines = effectiveSummary.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  let currentSection = "overview";

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("executive overview") || lower === "### overview" || lower === "## overview") {
      currentSection = "overview";
      continue;
    }
    if (lower.includes("core concept") || lower.includes("key concept") || lower.includes("conceptual theme")) {
      currentSection = "concepts";
      continue;
    }
    if (lower.includes("key takeaway") || lower.includes("takeaway") || lower.includes("key point")) {
      currentSection = "takeaways";
      continue;
    }

    if (currentSection === "concepts") {
      const conceptMatch = line.match(/^[-*•]?\s*\*\*(.*?)\*\*:\s*(.*)$/);
      if (conceptMatch) {
        sections.concepts.push({
          title: conceptMatch[1].trim(),
          description: conceptMatch[2].trim(),
        });
      } else if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
        const clean = line.replace(/^[-*•]\s*/, "").trim();
        const splitIdx = clean.indexOf(":");
        if (splitIdx > 0 && splitIdx < 40) {
          sections.concepts.push({
            title: clean.slice(0, splitIdx).trim(),
            description: clean.slice(splitIdx + 1).trim(),
          });
        } else {
          sections.concepts.push({
            title: "Key Principle",
            description: clean,
          });
        }
      } else {
        sections.overview.push(line);
      }
    } else if (currentSection === "takeaways") {
      const clean = line.replace(/^[#*\-•\s\d.:)]+/, "").trim();
      if (clean.length > 5) {
        sections.takeaways.push(clean);
      }
    } else {
      if (!line.startsWith("###") && !line.startsWith("##") && !line.startsWith("#")) {
        sections.overview.push(line);
      }
    }
  }

  // Intelligent fallback if sections weren't explicitly delimited
  if (sections.overview.length === 0 && sections.concepts.length === 0 && sections.takeaways.length === 0) {
    const bulletLines = lines.filter((l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("*"));
    if (bulletLines.length > 0) {
      sections.takeaways = bulletLines.map((l) => l.replace(/^[•\-*]\s*/, "").trim());
      sections.overview = lines.filter((l) => !l.startsWith("•") && !l.startsWith("-") && !l.startsWith("*"));
    } else {
      sections.overview = lines;
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
      {/* Top Header Action Card */}
      <motion.div
        className="relative group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />

        <div className="relative p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <motion.div
                className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <FileText className="w-8 h-8 text-white" />
              </motion.div>

              <div>
                <h2 className="text-3xl text-white mb-2">{mockSummary.title}</h2>
                <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {mockSummary.date}
                  </span>
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {mockSummary.duration}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <motion.button
                onClick={onSummarize}
                disabled={isSummarizing}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white hover:brightness-110 transition-all duration-300 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                whileHover={{ scale: isSummarizing ? 1 : 1.05 }}
                whileTap={{ scale: isSummarizing ? 1 : 0.95 }}
              >
                {isSummarizing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Regenerate AI Summary
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={handleCopy}
                className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={onDownloadPdf}
                disabled={!summary}
                className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                whileHover={{ scale: summary ? 1.05 : 1 }}
                whileTap={{ scale: summary ? 0.95 : 1 }}
              >
                <Download className="w-4 h-4" />
                PDF
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 1. Executive Overview Section */}
      {sections.overview.length > 0 && (
        <motion.div
          className="relative group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-3xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

          <div className="relative p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl space-y-4">
            <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-cyan-400" />
              Executive Overview
            </h3>

            <div className="space-y-4">
              {sections.overview.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-lg text-gray-200 leading-relaxed font-normal"
                >
                  {formatInline(paragraph)}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. Core Concepts Section */}
      {sections.concepts.length > 0 && (
        <motion.div
          className="relative group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

          <div className="relative p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl">
            <h3 className="text-2xl text-white mb-6 flex items-center gap-3">
              <Layers className="w-6 h-6 text-purple-400" />
              Core Conceptual Themes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.concepts.map((concept, index) => (
                <div
                  key={index}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all duration-300 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Concept {index + 1}
                    </span>
                    <h4 className="text-lg font-medium text-white">
                      {concept.title}
                    </h4>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {formatInline(concept.description)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Key Takeaways Section */}
      {sections.takeaways.length > 0 && (
        <motion.div
          className="relative group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

          <div className="relative p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl">
            <h3 className="text-2xl text-white mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-cyan-400" />
              Essential Takeaways
            </h3>

            <div className="space-y-4">
              {sections.takeaways.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex gap-4 group/item"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-sm font-semibold">
                    {index + 1}
                  </div>

                  <p className="flex-1 text-gray-200 leading-relaxed pt-1 group-hover/item:text-white transition-colors duration-300">
                    {formatInline(point)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
