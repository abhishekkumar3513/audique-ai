import { supabase } from '../supabaseClient';

// API base URL - in Docker/production, Nginx proxies /api to the backend
// In development, CRA proxy handles it
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

// Get the current Supabase session token
const getAuthToken = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
};

// Build headers with auth token
const getHeaders = async (contentType = 'application/json') => {
  const token = await getAuthToken();
  const headers = {};
  if (contentType) headers['Content-Type'] = contentType;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// Generic fetch wrapper with auth
const apiFetch = async (url, options = {}) => {
  const headers = await getHeaders(options.contentType);
  // If body is FormData, remove Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorJson = await response.json();
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch (e) {
      try {
        const errorText = await response.text();
        if (errorText) {
          if (errorText.includes('<title>')) {
            const titleMatch = errorText.match(/<title>(.*?)<\/title>/i);
            if (titleMatch) errorMessage = `${errorMessage} - ${titleMatch[1]}`;
          } else {
            errorMessage = `${errorMessage} - ${errorText.slice(0, 150)}`;
          }
        }
      } catch (t) {}
    }
    console.error(`API Error [${response.status}] on ${url}:`, errorMessage);
    throw new Error(errorMessage);
  }
  
  // Handle different response types
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/pdf')) {
    return response.blob();
  }
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response;
};

// ==================== LECTURE APIs ====================

export const createLecture = async (title) => {
  return apiFetch('/api/lectures', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
};

export const getLectures = async () => {
  return apiFetch('/api/lectures');
};

export const getLecture = async (id) => {
  return apiFetch(`/api/lectures/${id}`);
};

export const updateLecture = async (id, title) => {
  return apiFetch(`/api/lectures/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title }),
  });
};

export const deleteLecture = async (id) => {
  return apiFetch(`/api/lectures/${id}`, {
    method: 'DELETE',
  });
};

// ==================== TRANSCRIPTION APIs ====================

export const transcribeAudio = async (lectureId, audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  
  return apiFetch(`/api/lectures/${lectureId}/transcribe`, {
    method: 'POST',
    body: formData,
  });
};

export const getTranscript = async (lectureId) => {
  return apiFetch(`/api/lectures/${lectureId}/transcript`);
};

// ==================== SUMMARY APIs ====================

export const generateSummary = async (lectureId) => {
  return apiFetch(`/api/lectures/${lectureId}/summarize`, {
    method: 'POST',
  });
};

export const getSummary = async (lectureId) => {
  return apiFetch(`/api/lectures/${lectureId}/summary`);
};

// ==================== NOTES APIs ====================

export const generateNotes = async (lectureId) => {
  return apiFetch(`/api/lectures/${lectureId}/notes/generate`, {
    method: 'POST',
  });
};

export const getNotes = async (lectureId) => {
  return apiFetch(`/api/lectures/${lectureId}/notes`);
};

export const createNote = async (lectureId, heading, content) => {
  return apiFetch(`/api/lectures/${lectureId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ heading, content }),
  });
};

export const updateNote = async (noteId, heading, content) => {
  return apiFetch(`/api/notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify({ heading, content }),
  });
};

export const deleteNoteApi = async (noteId) => {
  return apiFetch(`/api/notes/${noteId}`, {
    method: 'DELETE',
  });
};

// ==================== FLASHCARD APIs ====================

export const generateFlashcards = async (lectureId) => {
  return apiFetch(`/api/lectures/${lectureId}/flashcards/generate`, {
    method: 'POST',
  });
};

export const getFlashcards = async (lectureId) => {
  return apiFetch(`/api/lectures/${lectureId}/flashcards`);
};

export const createFlashcardApi = async (lectureId, question, answer) => {
  return apiFetch(`/api/lectures/${lectureId}/flashcards`, {
    method: 'POST',
    body: JSON.stringify({ question, answer }),
  });
};

export const updateFlashcard = async (flashcardId, question, answer) => {
  return apiFetch(`/api/flashcards/${flashcardId}`, {
    method: 'PUT',
    body: JSON.stringify({ question, answer }),
  });
};

export const deleteFlashcardApi = async (flashcardId) => {
  return apiFetch(`/api/flashcards/${flashcardId}`, {
    method: 'DELETE',
  });
};

// ==================== PDF APIs ====================

export const exportLecturePdf = async (lectureId) => {
  const blob = await apiFetch(`/api/lectures/${lectureId}/export/pdf`);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Lecture_Notes.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// ==================== LEGACY FALLBACK APIs (Pure Public, No Auth Required) ====================

export const legacyTranscribe = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  
  const response = await fetch(`${API_BASE_URL}/transcribe`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      errorMessage = errJson.message || errJson.error || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => '');
      if (errorText) errorMessage += ` - ${errorText.slice(0, 100)}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const legacySummarize = async (text) => {
  const response = await fetch(`${API_BASE_URL}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      errorMessage = errJson.message || errJson.error || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => '');
      if (errorText) errorMessage += ` - ${errorText.slice(0, 100)}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const legacyGenerateFlashcards = async (text) => {
  const response = await fetch(`${API_BASE_URL}/flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      errorMessage = errJson.message || errJson.error || errorMessage;
    } catch {
      const errorText = await response.text().catch(() => '');
      if (errorText) errorMessage += ` - ${errorText.slice(0, 100)}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const legacyDownloadPdf = async (summary) => {
  const response = await fetch(`${API_BASE_URL}/download-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary }),
  });
  
  if (!response.ok) {
    throw new Error(`PDF download failed with HTTP ${response.status}`);
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Lecture_Notes.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
