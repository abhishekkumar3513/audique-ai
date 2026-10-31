// src/App.js
import React, { useState, useRef, useEffect, useCallback } from "react";
import "./index.css";

import { supabase } from "./supabaseClient";

import { LoginPage } from "./figma-ui/components/LoginPage";
import { HomePage } from "./figma-ui/components/HomePage";
import { DashboardPage } from "./figma-ui/components/DashboardPage";

import {
  createLecture,
  getLectures,
  getLecture,
  transcribeAudio,
  generateSummary as apiGenerateSummary,
  generateNotes as apiGenerateNotes,
  generateFlashcards as apiGenerateFlashcards,
  exportLecturePdf,
  legacyTranscribe,
  legacySummarize,
  legacyGenerateFlashcards,
  legacyDownloadPdf,
} from "./services/apiService";

function App() {
  // App routing: login -> home -> dashboard
  const [currentPage, setCurrentPage] = useState("login");

  // recording + backend state
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecordingData, setHasRecordingData] = useState(false);
  const [currentLectureId, setCurrentLectureId] = useState(null);

  const [connectedDevices, setConnectedDevices] = useState([
    {
      id: "1",
      name: "Teacher Device",
      status: "connected",
      type: "teacher",
      audioLevel: 0,
    },
  ]);

  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const levelIntervalRef = useRef(null);

  // Load existing session and latest lecture on app mount
  const checkSessionAndLoadLatest = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentPage("home");

        // Attempt to fetch most recent lecture
        try {
          const lectures = await getLectures();
          if (Array.isArray(lectures) && lectures.length > 0) {
            const latest = lectures[0];
            const detail = await getLecture(latest.id);
            if (detail) {
              setCurrentLectureId(detail.id);
              if (detail.transcript?.fullText) {
                setTranscript(detail.transcript.fullText);
                setHasRecordingData(true);
              }
              if (detail.summary?.content) {
                setSummary(detail.summary.content);
              }
              if (Array.isArray(detail.notes) && detail.notes.length > 0) {
                setNotes(detail.notes.map((n) => n.content || n.heading));
              }
              if (Array.isArray(detail.flashcards) && detail.flashcards.length > 0) {
                const clean = detail.flashcards
                  .filter((f) => !isHeaderLine(f.question) && !isHeaderLine(f.answer))
                  .map((f, idx) => ({
                    id: idx + 1,
                    front: f.question || f.front,
                    back: f.answer || f.back,
                  }));
                if (clean.length > 0) {
                  setFlashcards(clean);
                } else if (detail.transcript?.fullText) {
                  fetchOrFallbackFlashcards(detail.transcript.fullText);
                }
              }
            }
          }
        } catch (fetchErr) {
          console.warn("Could not load previous lectures from backend:", fetchErr);
        }
      }
    } catch (authErr) {
      console.warn("Auth check warning:", authErr);
    }
  }, []);

  useEffect(() => {
    checkSessionAndLoadLatest();
  }, [checkSessionAndLoadLatest]);

  // --- audio level animation for devices ---
  const startAudioLevelSimulation = () => {
    if (levelIntervalRef.current) return;

    levelIntervalRef.current = setInterval(() => {
      setConnectedDevices((prev) =>
        prev.map((device) => ({
          ...device,
          audioLevel:
            device.type === "teacher"
              ? 60 + Math.random() * 40
              : Math.random() * 40,
        }))
      );
    }, 200);
  };

  const stopAudioLevelSimulation = () => {
    if (levelIntervalRef.current) {
      clearInterval(levelIntervalRef.current);
      levelIntervalRef.current = null;
    }
    setConnectedDevices((prev) =>
      prev.map((device) => ({
        ...device,
        audioLevel: 0,
      }))
    );
  };

  // --- BACKEND CALLS WITH SPRING BOOT + PERSISTENCE ---

  const sendToBackend = async (audioBlob) => {
    let text = "";
    let lectureId = null;

    try {
      // 1. Try modern Spring Boot flow with persistence
      const title = "Lecture " + new Date().toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      try {
        const lecture = await createLecture(title);
        if (lecture?.id) {
          lectureId = lecture.id;
          setCurrentLectureId(lectureId);

          const transcriptRes = await transcribeAudio(lectureId, audioBlob);
          text = transcriptRes?.fullText || "";
        }
      } catch (authOrApiErr) {
        console.warn("Authenticated transcribe failed, falling back to legacy:", authOrApiErr);
      }

      // 2. Fallback to legacy endpoint if not authenticated or failed
      if (!text) {
        const legacyRes = await legacyTranscribe(audioBlob);
        text = legacyRes?.text || legacyRes?.transcript || "";
      }

      if (text) {
        setTranscript(text);
        setHasRecordingData(true);

        // 3. Generate structured AI notes and flashcards
        if (lectureId) {
          try {
            const [notesRes, flashcardsRes] = await Promise.allSettled([
              apiGenerateNotes(lectureId),
              apiGenerateFlashcards(lectureId),
            ]);

            if (notesRes.status === "fulfilled" && Array.isArray(notesRes.value)) {
              setNotes(notesRes.value.map((n) => n.content || n.heading));
            } else {
              applyClientSideNotes(text);
            }

            if (flashcardsRes.status === "fulfilled" && Array.isArray(flashcardsRes.value) && flashcardsRes.value.length > 0) {
              setFlashcards(
                flashcardsRes.value.map((f, idx) => ({
                  id: idx + 1,
                  front: f.question || f.front,
                  back: f.answer || f.back,
                }))
              );
            } else {
              await fetchOrFallbackFlashcards(text);
            }
          } catch (genErr) {
            console.warn("AI generation failed, applying local fallback:", genErr);
            applyClientSideNotes(text);
            await fetchOrFallbackFlashcards(text);
          }
        } else {
          // Anonymous / legacy mode
          applyClientSideNotes(text);
          await fetchOrFallbackFlashcards(text);
        }
      } else {
        alert("Could not transcribe audio. Please check backend connection.");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      alert(err.message || "Could not reach backend for transcription");
    }
  };

  const isHeaderLine = (line) => {
    if (!line) return true;
    const clean = line.replace(/^[#*\-•\s\d.:)]+/, '').trim().toLowerCase();
    return (
      clean.length < 5 ||
      clean.startsWith("overview") ||
      clean.startsWith("key observation") ||
      clean.startsWith("observation") ||
      clean.startsWith("key takeaway") ||
      clean.startsWith("takeaway") ||
      clean.startsWith("lecture summary") ||
      clean.startsWith("summary") ||
      clean.startsWith("introduction") ||
      clean.endsWith(":")
    );
  };

  const fetchOrFallbackFlashcards = async (text) => {
    try {
      const res = await legacyGenerateFlashcards(text);
      if (res && Array.isArray(res.flashcards) && res.flashcards.length > 0) {
        const clean = res.flashcards
          .filter((f) => !isHeaderLine(f.question) && !isHeaderLine(f.answer))
          .map((f, idx) => ({
            id: idx + 1,
            front: f.question || f.front,
            back: f.answer || f.back,
          }));
        if (clean.length > 0) {
          setFlashcards(clean);
          return;
        }
      }
    } catch (e) {
      console.warn("Legacy flashcards generation failed, using intelligent client extraction:", e);
    }
    applyClientSideFlashcards(text);
  };

  const applyClientSideNotes = (text) => {
    const sentences = text
      .split(/[.!?]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);
    setNotes(sentences.slice(0, 6));
  };

  const applyClientSideFlashcards = (text) => {
    if (!text) return;
    const cleanSentences = text
      .split(/[.!?]/)
      .map((s) => s.trim())
      .filter((s) => !isHeaderLine(s) && s.length > 20);

    const flashSentences = cleanSentences.slice(0, 6);
    if (flashSentences.length === 0) return;

    setFlashcards(
      flashSentences.map((s, idx) => {
        const words = s.split(/\s+/);
        const topic = words.length >= 3 ? words.slice(0, 3).join(" ") : `Concept ${idx + 1}`;
        return {
          id: idx + 1,
          front: `What does the lecture explain regarding ${topic}?`,
          back: s + ".",
        };
      })
    );
  };

  const handleSummarize = async () => {
    if (!transcript || isSummarizing) return;
    setIsSummarizing(true);

    try {
      let sumText = "";

      if (currentLectureId) {
        try {
          const sumRes = await apiGenerateSummary(currentLectureId);
          sumText = sumRes?.content || "";
        } catch (apiErr) {
          console.warn("API summarize failed, trying legacy:", apiErr);
        }
      }

      if (!sumText) {
        try {
          const legacyRes = await legacySummarize(transcript);
          sumText = legacyRes?.summary || "";
        } catch (legacyErr) {
          console.warn("Legacy summarize failed, using local extraction fallback:", legacyErr);
        }
      }

      if (!sumText && transcript) {
        const cleanSentences = transcript
          .replace(/\b(um|uh|you know|like|basically|today we are going to talk about)\b/gi, '')
          .split(/[.!?]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 20);

        const overview = cleanSentences.length > 0
          ? `### Executive Overview\nThis lecture explores the foundational concepts and methodologies of ${cleanSentences[0].toLowerCase()}. The session integrates theoretical explanations with contextual analysis to elucidate core mechanisms and academic relevance.`
          : `### Executive Overview\nThis lecture provides a comprehensive academic synthesis of the primary principles and findings established during the session.`;

        let concepts = "";
        if (cleanSentences.length > 1) {
          const cItems = cleanSentences.slice(1, 4).map((s, idx) => {
            const words = s.split(/\s+/);
            const title = words.length >= 3 ? words.slice(0, 3).join(" ") : `Concept ${idx + 1}`;
            return `- **${title}**: ${s}.`;
          }).join("\n");
          concepts = `\n\n### Core Concepts\n${cItems}`;
        }

        const takeaways = cleanSentences.slice(3, 8).map((s) => `• ${s}.`).join("\n");
        sumText = `${overview}${concepts}\n\n### Key Takeaways\n${takeaways || "• Comprehensive understanding of foundational lecture themes."}`;
      }

      if (sumText) {
        setSummary(sumText);

        // Always refresh with real AI questions & answers (never summary headers!)
        if (currentLectureId) {
          try {
            const fcRes = await apiGenerateFlashcards(currentLectureId);
            if (Array.isArray(fcRes) && fcRes.length > 0) {
              const cleanCards = fcRes
                .filter((f) => !isHeaderLine(f.question) && !isHeaderLine(f.answer))
                .map((f, idx) => ({
                  id: idx + 1,
                  front: f.question || f.front,
                  back: f.answer || f.back,
                }));
              if (cleanCards.length > 0) {
                setFlashcards(cleanCards);
                return;
              }
            }
          } catch (fcErr) {
            console.warn("Flashcard generation failed during summarize:", fcErr);
          }
        }
        await fetchOrFallbackFlashcards(transcript);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Could not reach backend for summary");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!summary) {
      alert("Generate a summary first.");
      return;
    }

    try {
      if (currentLectureId) {
        try {
          await exportLecturePdf(currentLectureId);
          return;
        } catch (apiErr) {
          console.warn("API PDF export failed, falling back to legacy:", apiErr);
        }
      }

      await legacyDownloadPdf(summary);
    } catch (err) {
      console.error(err);
      alert(err.message || "Could not download PDF");
    }
  };

  // --- RECORDING HANDLERS ---
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        stream.getTracks().forEach((t) => t.stop());

        if (!audioBlob || audioBlob.size < 100) {
          alert("Recording too short or no audio detected. Please speak into the mic for at least 3 seconds.");
          return;
        }

        await sendToBackend(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      startAudioLevelSimulation();
    } catch (err) {
      alert("Could not access microphone");
    }
  };

  const handleStopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    stopAudioLevelSimulation();
  };

  const handleAddDevice = (deviceName) => {
    setConnectedDevices((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: deviceName,
        status: "connected",
        type: "student",
        audioLevel: 0,
      },
    ]);
  };

  const goToDashboard = () => setCurrentPage("dashboard");
  const goToHome = () => setCurrentPage("home");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentLectureId(null);
    setTranscript("");
    setSummary("");
    setNotes([]);
    setFlashcards([]);
    setHasRecordingData(false);
    setCurrentPage("login");
  };

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white min-h-screen transition-colors duration-300">
      {currentPage === "login" && (
        <LoginPage onLoginSuccess={() => setCurrentPage("home")} />
      )}

      {currentPage === "home" && (
        <HomePage
          isRecording={isRecording}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          connectedDevices={connectedDevices}
          onAddDevice={handleAddDevice}
          hasRecordingData={hasRecordingData}
          onNavigateToDashboard={goToDashboard}
          onLogout={handleLogout}
        />
      )}

      {currentPage === "dashboard" && (
        <DashboardPage
          onNavigateToHome={goToHome}
          hasRecordingData={hasRecordingData}
          transcript={transcript}
          summary={summary}
          notes={notes}
          flashcards={flashcards}
          onSummarize={handleSummarize}
          isSummarizing={isSummarizing}
          onDownloadPdf={handleDownloadPdf}
          onLogout={handleLogout}
          onRefreshFlashcards={() => fetchOrFallbackFlashcards(transcript)}
        />
      )}
    </div>
  );
}

export default App;
