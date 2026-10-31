import { motion } from "motion/react";
import { StickyNote, Download, Plus, Trash2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const mockNotes = [
  {
    id: 1,
    title: "Wave-Particle Duality",
    content:
      "Key concept: particles exhibit both wave and particle properties depending on how they are observed.",
    timestamp: "",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 2,
    title: "Heisenberg Uncertainty Principle",
    content: "Δx · Δp ≥ ℏ/2 - fundamental limit of measurement in quantum systems.",
    timestamp: "",
    color: "from-blue-500 to-cyan-500",
  },
];

export function NotesView({ hasData, notes }) {
  const [notesState, setNotesState] = useState([]);

  useEffect(() => {
    if (hasData && notes && notes.length > 0) {
      const isStructured = typeof notes[0] === 'object' && (notes[0].content || notes[0].heading);

      if (isStructured) {
        const mapped = notes.map((item, idx) => {
          const base = mockNotes[idx % mockNotes.length];
          return {
            id: idx + 1,
            title: item.heading || `Concept ${idx + 1}`,
            content: item.content || item.heading,
            timestamp: "",
            color: base.color,
          };
        });
        setNotesState(mapped);
      } else {
        // Group sentences discussing related concepts into 2-3 cohesive note boxes instead of 1 sentence per box!
        const rawStrings = notes
          .filter((t) => typeof t === 'string' && t.trim().length > 0)
          .map((t) => t.trim().replace(/^[#*\-•\s\d.:)]+/, ''));

        if (rawStrings.length === 0) {
          setNotesState(mockNotes);
          return;
        }

        // Group 2 to 3 sentences per concept note card
        const groupSize = Math.max(2, Math.ceil(rawStrings.length / 3));
        const grouped = [];

        for (let i = 0; i < rawStrings.length; i += groupSize) {
          const chunk = rawStrings.slice(i, i + groupSize);
          const idx = grouped.length;
          const base = mockNotes[idx % mockNotes.length];

          // Generate an informative conceptual title from the first sentence keywords
          const words = chunk[0].split(/\s+/).slice(0, 4).join(" ");
          const title = words.length > 5 ? `${words}...` : `Key Concept ${idx + 1}`;

          grouped.push({
            id: idx + 1,
            title: title,
            content: chunk.map((s) => (s.endsWith(".") ? s : s + ".")).join(" "),
            timestamp: "",
            color: base.color,
          });

          if (grouped.length >= 4) break;
        }

        setNotesState(grouped.length > 0 ? grouped : mockNotes);
      }
    } else {
      setNotesState(mockNotes);
    }
  }, [hasData, notes]);

  const handleDelete = (id) => {
    setNotesState((prev) => prev.filter((note) => note.id !== id));
  };

  if (!hasData && notesState === mockNotes) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
        <div className="relative max-w-2xl mx-auto">
          <motion.div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur-3xl opacity-20" />
          <div className="relative p-16 bg-white/5 backdrop-blur-2xl border-2 border-dashed border-white/20 rounded-3xl">
            <Sparkles className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-xl text-gray-300 mb-2">No notes available</p>
            <p className="text-gray-500">Start recording to generate AI notes</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-gray-400">
          <span className="text-green-400">{notesState.length}</span> notes captured
        </div>
        <div className="flex gap-3">
          <motion.button
            className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            Add Note
          </motion.button>
          <motion.button
            className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notesState.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring" }}
            className="relative group"
          >
            {/* Glow effect */}
            <motion.div
              className={`absolute -inset-1 bg-gradient-to-r ${note.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}
            />

            <motion.div
              className="relative h-full p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden"
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                }}
              />

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <motion.div
                    className={`p-2 bg-gradient-to-br ${note.color} rounded-xl`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <StickyNote className="w-5 h-5 text-white" />
                  </motion.div>

                  <div className="flex-1">
                    <h3 className="text-lg text-white mb-1">{note.title}</h3>
                    <p className="text-sm text-gray-400">{note.timestamp}</p>
                  </div>
                </div>

                <motion.button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-lg"
                  onClick={() => handleDelete(note.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </motion.button>
              </div>

              {/* Content */}
              <p className="text-gray-300 leading-relaxed mb-1 group-hover:text-white transition-colors duration-300">
                {note.content}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
