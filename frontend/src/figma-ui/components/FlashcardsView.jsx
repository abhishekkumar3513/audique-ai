import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, RotateCw, Download, Plus, Sparkles } from "lucide-react";

const mockFlashcards = [
  {
    id: 1,
    front: "What is the Pythagorean Theorem?",
    back: "a² + b² = c², where c is the hypotenuse of a right triangle and a and b are the other two sides.",
  },
  {
    id: 2,
    front: "Define Photosynthesis",
    back: "The process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water, producing oxygen as a byproduct.",
  },
  {
    id: 3,
    front: "What is Newton's First Law?",
    back: "An object at rest stays at rest and an object in motion stays in motion with the same speed and direction unless acted upon by an external force.",
  },
];

export function FlashcardsView({ hasData, flashcards, onRefresh }) {
  // Filter out any stale/accidental header cards
  const sanitizedCards = (flashcards || []).filter((c) => {
    const b = (c.back || '').trim().toLowerCase().replace(/^[#*\-•\s\d.:)]+/, '');
    const f = (c.front || '').trim().toLowerCase().replace(/^[#*\-•\s\d.:)]+/, '');
    const isBad = (text) =>
      text.length < 5 ||
      text.startsWith('overview') ||
      text.startsWith('key observation') ||
      text.startsWith('observation') ||
      text.startsWith('key takeaway') ||
      text.startsWith('takeaway') ||
      text.startsWith('lecture summary');
    return !isBad(b) && !isBad(f) && (c.back || '').trim().length > 5;
  });

  const hasRealFlashcards = hasData && sanitizedCards.length > 0;

  // Decide which cards to show
  const cards = hasRealFlashcards ? sanitizedCards : mockFlashcards;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 300);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 300);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // No recording yet -> show CTA
  if (!hasData) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
        <div className="relative max-w-2xl mx-auto">
          <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-3xl opacity-20" />
          <div className="relative p-16 bg-white/5 backdrop-blur-2xl border-2 border-dashed border-white/20 rounded-3xl">
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-xl text-gray-300 mb-2">No flashcards yet</p>
            <p className="text-gray-500">
              Record a lecture to generate flashcards automatically from the transcript.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Had recording but somehow no flashcards
  if (hasData && (!flashcards || flashcards.length === 0)) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
        <div className="relative max-w-2xl mx-auto">
          <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-3xl opacity-20" />
          <div className="relative p-16 bg-white/5 backdrop-blur-2xl border-2 border-dashed border-white/20 rounded-3xl">
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-xl text-gray-300 mb-2">No AI flashcards generated yet</p>
            <p className="text-gray-500">
              Generate a summary or re-record to refresh flashcards based on your lecture.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-gray-400">
          Card <span className="text-purple-400">{currentIndex + 1}</span> of {cards.length}
        </div>
        <div className="flex gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 rounded-xl text-white transition-all duration-300 flex items-center gap-2"
              title="Generate fresh AI flashcards from current lecture"
            >
              <RotateCw className="w-4 h-4 shrink-0" />
              Regenerate
            </button>
          )}
          <button className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Card
          </button>
          <button className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="relative">
        <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-3xl opacity-20" />

        <div className="relative p-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col gap-6">
          <div className="flex justify-between items-center text-gray-400 text-sm">
            <span>{isFlipped ? "Back" : "Front"}</span>
            <button
              onClick={handleFlip}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white"
            >
              <RotateCw className="w-3 h-3" />
              Flip card
            </button>
          </div>

          <div className="relative h-40 flex items-center justify-center perspective-[1200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={isFlipped ? "back" : "front"}
                initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center px-8 text-center text-lg text-gray-100"
              >
                {isFlipped ? currentCard.back : currentCard.front}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-sm"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
