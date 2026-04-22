// Tiny typed client for the FastAPI backend.

export type SearchResult = {
  id: string;
  score: number;
  title: string;
  snippet: string;
  category: string;
  tags: string[];
  date: string;
  path: string;
};

export type Inspector = {
  query: string;
  mode: string;
  filter_applied: boolean;
  filter_summary: {
    category: string | null;
    tags: string[];
    date_from: string | null;
    date_to: string | null;
  };
  candidates_per_arm: number;
  fusion: string | null;
};

export type SearchResponse = { results: SearchResult[]; inspector: Inspector };

export type AskSource = SearchResult & { body?: string };

export type TimelineEntry = {
  id: string;
  title: string;
  date: string;
  date_ts: number;
  snippet: string;
  category: string;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_score: number;
};

export type TimelineResponse = {
  count: number;
  sentiment_counts: { positive: number; neutral: number; negative: number };
  entries: TimelineEntry[];
};

export type LLMHealth = {
  available: boolean;
  base_url: string;
  models?: string[];
  error?: string;
};

export type Status = {
  connected: boolean;
  server?: string;
  collection?: string;
  exists?: boolean;
  count?: number;
  version?: string;
  title?: string;
  features?: string[];
  error?: string;
};

export type Facets = {
  categories: { name: string; count: number }[];
  tags: { name: string; count: number }[];
};

const j = <T>(r: Response): Promise<T> => {
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json() as Promise<T>;
};

export const api = {
  status: () => fetch('/api/status').then((r) => j<Status>(r)),
  facets: () => fetch('/api/facets').then((r) => j<Facets>(r)),

  search: (body: {
    query: string;
    k?: number;
    mode?: string;
    tags?: string[];
    category?: string;
    date_from?: string;
    date_to?: string;
  }) =>
    fetch('/api/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => j<SearchResponse>(r)),

  upload: async (files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    const r = await fetch('/api/upload', { method: 'POST', body: fd });
    return j<{ docs: any[]; skipped: any[]; count: number }>(r);
  },

  /** Stream indexing progress via SSE. onEvent fires for every batch. */
  indexStream: async (
    docs: any[],
    onEvent: (e: { stage: string; done: number; total: number; result?: any; error?: string }) => void,
    recreate = false,
  ) => {
    const r = await fetch('/api/index/stream', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ docs, recreate }),
    });
    if (!r.body) throw new Error('no stream');
    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const parts = buf.split('\n\n');
      buf = parts.pop() || '';
      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith('data:')) continue;
        try {
          onEvent(JSON.parse(line.slice(5).trim()));
        } catch {}
      }
    }
  },

  loadSample: () =>
    fetch('/api/sample/load', { method: 'POST' }).then((r) =>
      j<{ upserted: number; collection_total: number }>(r),
    ),

  /** Bilingual-lexicon sentiment for the Write-tab tone preview. */
  sentimentPreview: (text: string) =>
    fetch('/api/sentiment', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    }).then((r) => j<{ label: 'positive' | 'neutral' | 'negative'; score: number; matched: number }>(r)),

  /** "On this day" — entries from today's month-day in past years. */
  onThisDay: (window = 2) =>
    fetch(`/api/on_this_day?window=${window}`).then((r) =>
      j<{
        today: string;
        count: number;
        entries: {
          id: string;
          title: string;
          date: string;
          snippet: string;
          category: string;
          tags: string[];
          years_ago: number;
          day_diff: number;
        }[];
      }>(r),
    ),

  /** Persist a new journal entry and index it live. */
  appendJournal: (body: {
    title: string;
    body: string;
    mood?: string;
    tags?: string[];
    date?: string;
  }) =>
    fetch('/api/journal/append', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) =>
      j<{
        ok: boolean;
        path: string;
        doc: { title: string; date: string; category: string; tags: string[]; snippet: string };
        upserted: number;
        collection_total: number;
      }>(r),
    ),

  snapshot: () =>
    fetch('/api/snapshot', { method: 'POST' }).then((r) => j<{ ok: boolean }>(r)),

  llmHealth: () => fetch('/api/llm/health').then((r) => j<LLMHealth>(r)),

  timeline: (params?: { limit?: number; sentiment?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.sentiment) qs.set('sentiment_filter', params.sentiment);
    return fetch(`/api/timeline?${qs.toString()}`).then((r) => j<TimelineResponse>(r));
  },

  /**
   * SSE-streamed RAG endpoint.
   * Three event types from the backend:
   *   sources → { sources: AskSource[], inspector }
   *   token   → "<text chunk>" (JSON-encoded string)
   *   done    → { ok: true }
   *   error   → { error: "..." }
   */
  /** Transcribe an audio blob. 100% offline (faster-whisper tiny). */
  transcribe: async (blob: Blob) => {
    const fd = new FormData();
    const fileName = blob.type.includes('webm') ? 'clip.webm' : 'clip.wav';
    fd.append('file', new File([blob], fileName, { type: blob.type || 'audio/webm' }));
    const r = await fetch('/api/transcribe', { method: 'POST', body: fd });
    return j<{ text: string; language: string; duration: number }>(r);
  },

  ask: async (
    body: {
      question: string;
      k?: number;
      mode?: string;
      tags?: string[];
      category?: string;
      date_from?: string;
      date_to?: string;
      temperature?: number;
      history?: { role: 'user' | 'assistant'; content: string }[];
    },
    handlers: {
      onSources?: (s: AskSource[], inspector: Inspector | null) => void;
      onToken?: (chunk: string) => void;
      onDone?: () => void;
      onError?: (msg: string) => void;
    },
    signal?: AbortSignal,
  ) => {
    const r = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => r.statusText);
      handlers.onError?.(`${r.status} ${txt}`);
      return;
    }
    if (!r.body) {
      handlers.onError?.('no stream');
      return;
    }
    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      // SSE frames are separated by \n\n
      let idx;
      while ((idx = buf.indexOf('\n\n')) >= 0) {
        const frame = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        let event = 'message';
        let data = '';
        for (const line of frame.split('\n')) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          else if (line.startsWith('data:')) data += line.slice(5).trim();
        }
        try {
          if (event === 'sources') {
            const obj = JSON.parse(data);
            handlers.onSources?.(obj.sources || [], obj.inspector || null);
          } else if (event === 'token') {
            handlers.onToken?.(JSON.parse(data));
          } else if (event === 'done') {
            handlers.onDone?.();
          } else if (event === 'error') {
            const obj = JSON.parse(data);
            handlers.onError?.(obj.error || 'unknown error');
          }
        } catch (e) {
          // tolerate malformed frames — keep streaming
        }
      }
    }
  },
};
