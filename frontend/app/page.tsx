'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Upload, Sparkles, Database, Cpu, Zap, FileText,
  ArrowRight, Languages, ShieldCheck, Activity, Layers, X, Check, Loader2,
  MessageCircleQuestion, Clock, Smile, Meh, Frown, BookOpen, Send,
} from 'lucide-react';
import {
  api,
  type SearchResult, type Inspector, type Status, type Facets,
  type AskSource, type TimelineEntry, type LLMHealth,
} from '@/lib/api';
import { STR, type Lang } from '@/lib/i18n';

const MODES = ['hybrid', 'rrf', 'dbsf', 'title', 'body', 'sparse'] as const;
type Mode = (typeof MODES)[number];

type Tab = 'ask' | 'timeline' | 'search';

export default function Page() {
  const [lang, setLang] = useState<Lang>('en');
  const t = STR[lang];

  const [tab, setTab] = useState<Tab>('ask');
  const [status, setStatus] = useState<Status | null>(null);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [llm, setLlm] = useState<LLMHealth | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<string>('');

  const refreshStatus = async () => {
    try {
      const [s, f, l] = await Promise.all([
        api.status(), api.facets(), api.llmHealth(),
      ]);
      setStatus(s); setFacets(f); setLlm(l);
    } catch (e: any) { setStatus({ connected: false, error: String(e) }); }
  };
  useEffect(() => { refreshStatus(); }, []);

  const loadSample = async () => {
    setSnackbar(lang === 'en' ? 'Loading sample…' : '正在载入示例…');
    try {
      const r = await api.loadSample();
      setSnackbar(lang === 'en'
        ? `Indexed ${r.upserted} memories.`
        : `已索引 ${r.upserted} 段记忆。`);
      await refreshStatus();
    } catch (e: any) { setSnackbar(String(e)); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-line">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mascot />
            <div>
              <div className="font-display font-extrabold text-ink leading-none">{t.brand}</div>
              <div className="text-[11px] text-muted">{t.tagline}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={status} t={t} />
            <button
              onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
              className="btn-ghost !py-2 !px-3"
              title="Toggle language"
            >
              <Languages className="w-4 h-4" />
              <span className="font-mono text-xs">{lang === 'en' ? 'EN' : '中'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="hero-bg border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid md:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
          <div>
            <motion.div
              initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 chip-amber mb-5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {lang === 'en' ? '100% offline · zero telemetry' : '100% 离线 · 零数据上传'}
            </motion.div>
            <h1 className="font-display text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
              {t.heroH1a}<br/>
              <span className="text-violet">{t.heroH1b}</span>
            </h1>
            <p className="mt-5 text-lg text-muted max-w-xl leading-relaxed">{t.heroSub}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => setUploadOpen(true)} className="btn-primary">
                <Upload className="w-4 h-4" /> {t.ctaUpload}
              </button>
              <button onClick={loadSample} className="btn-ghost">
                <Sparkles className="w-4 h-4" /> {t.ctaDemo}
              </button>
            </div>
            <p className="mt-6 text-xs text-muted max-w-md">{t.privateNote}</p>
          </div>

          {/* Hero stat card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }} className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs uppercase tracking-wider text-muted">{t.poweredBy}</div>
              <span className="chip-violet">Actian VectorAI DB v{status?.version ?? '—'}</span>
            </div>
            <div className="text-5xl font-extrabold text-ink">
              {status?.count ?? '—'}
              <span className="text-base font-normal text-muted ml-2">{t.notes}</span>
            </div>
            <div className="mt-5 pt-5 border-t border-line">
              <div className="text-xs font-semibold text-ink mb-2">{t.featuresTitle}</div>
              <div className="flex flex-wrap gap-1.5">
                {(status?.features ?? []).map(f => (
                  <span key={f} className="chip"><Check className="w-3 h-3 text-violet" />{f}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Tab nav ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 -mt-6 w-full">
        <div className="card p-1.5 flex items-center gap-1 shadow-lift w-fit">
          <TabButton active={tab === 'ask'} onClick={() => setTab('ask')}>
            <MessageCircleQuestion className="w-4 h-4" /> {t.tabAsk}
          </TabButton>
          <TabButton active={tab === 'timeline'} onClick={() => setTab('timeline')}>
            <Clock className="w-4 h-4" /> {t.tabTimeline}
          </TabButton>
          <TabButton active={tab === 'search'} onClick={() => setTab('search')}>
            <Search className="w-4 h-4" /> {t.tabSearch}
          </TabButton>
        </div>
      </section>

      {/* ── Tab content ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mt-6 mb-20 flex-1 w-full">
        <AnimatePresence mode="wait">
          {tab === 'ask' && (
            <motion.div key="ask" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AskView t={t} lang={lang} llm={llm} status={status} setSnackbar={setSnackbar} />
            </motion.div>
          )}
          {tab === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <TimelineView t={t} lang={lang} />
            </motion.div>
          )}
          {tab === 'search' && (
            <motion.div key="search" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <SearchView t={t} lang={lang} facets={facets} status={status} setSnackbar={setSnackbar} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-line py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5" />
            {t.poweredBy} <a href="https://github.com/hackmamba-io/actian-vectorAI-db-beta" className="text-violet hover:underline">Actian VectorAI DB</a>
          </div>
          <div>OffMind · DoraHacks #2097</div>
        </div>
      </footer>

      {/* ── Upload Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {uploadOpen && (
          <UploadModal
            t={t} lang={lang}
            onClose={() => setUploadOpen(false)}
            onIndexed={() => { setUploadOpen(false); refreshStatus(); }}
            setSnackbar={setSnackbar}
          />
        )}
      </AnimatePresence>

      {/* ── Snackbar ───────────────────────────────────────── */}
      <AnimatePresence>
        {snackbar && (
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
            onAnimationComplete={() => setTimeout(() => setSnackbar(''), 3500)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 card px-4 py-3 z-50 text-sm flex items-center gap-2 max-w-md"
          >
            <Activity className="w-4 h-4 text-violet shrink-0" />
            <span className="line-clamp-2">{snackbar}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Ask View — the headline interaction                         */
/* ─────────────────────────────────────────────────────────── */
function AskView({
  t, lang, llm, status, setSnackbar,
}: { t: any; lang: Lang; llm: LLMHealth | null; status: Status | null; setSnackbar: (s: string) => void; }) {
  const [question, setQuestion] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sources, setSources] = useState<AskSource[]>([]);
  const [inspector, setInspector] = useState<Inspector | null>(null);
  const [answer, setAnswer] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  const examples: string[] = lang === 'en' ? t.askExamples : t.askExamplesZh;

  const ask = async (q?: string) => {
    const finalQ = (q ?? question).trim();
    if (!finalQ || streaming) return;
    setQuestion(finalQ);
    setStreaming(true);
    setAnswer('');
    setSources([]);
    setInspector(null);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      await api.ask(
        { question: finalQ, k: 6, mode: 'hybrid' },
        {
          onSources: (s, ins) => { setSources(s); setInspector(ins); },
          onToken: (chunk) => setAnswer(prev => prev + chunk),
          onDone: () => setStreaming(false),
          onError: (msg) => { setSnackbar(msg); setStreaming(false); },
        },
        ctrl.signal,
      );
    } catch (e: any) {
      if (e.name !== 'AbortError') setSnackbar(String(e));
      setStreaming(false);
    }
  };

  // Auto-scroll answer panel as tokens arrive
  useEffect(() => {
    if (answerRef.current) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer]);

  const empty = sources.length === 0 && !streaming && !answer;
  const hasMemories = (status?.count ?? 0) > 0;

  return (
    <div className="grid md:grid-cols-[1.6fr_1fr] gap-8">
      {/* Conversation column */}
      <div>
        {/* Input */}
        <div className="card p-2 flex items-center gap-2 shadow-lift">
          <div className="pl-3 text-violet"><MessageCircleQuestion className="w-5 h-5" /></div>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && ask()}
            placeholder={t.askPlaceholder}
            className="flex-1 bg-transparent outline-none py-3 px-1 text-base placeholder:text-muted"
            disabled={streaming}
          />
          <button onClick={() => ask()} disabled={streaming || !question.trim()} className="btn-primary disabled:opacity-50">
            {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {t.askSubmit}
          </button>
        </div>

        {/* LLM health hint */}
        {llm && !llm.available && (
          <div className="mt-3 text-xs text-amber-dark bg-amber/15 border border-amber/30 rounded-pill px-3 py-2 inline-flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> {t.askNoLLM}
          </div>
        )}

        {/* Empty state — example questions */}
        {empty && (
          <div className="mt-6">
            {!hasMemories ? (
              <div className="card p-8 text-center text-muted">
                <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-40" />
                {lang === 'en'
                  ? 'Your time machine is empty. Load the sample dataset (top right) or upload your own notes to begin.'
                  : '时光机是空的。先载入示例数据或上传你自己的笔记。'}
              </div>
            ) : (
              <>
                <div className="text-xs uppercase tracking-wider text-muted mb-3">{t.askEmpty}</div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {examples.map((q, i) => (
                    <button
                      key={i} onClick={() => ask(q)}
                      className="card p-3 text-left text-sm hover:border-violet/40 hover:shadow-lift transition-all group"
                    >
                      <span className="text-muted group-hover:text-ink transition-colors">{q}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Answer (streaming) */}
        {(streaming || answer) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 card p-6"
          >
            <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-wider text-violet">
              <Sparkles className="w-3.5 h-3.5" />
              {streaming && !answer ? t.askThinking : t.brand}
            </div>
            <div
              ref={answerRef}
              className="prose-answer text-ink leading-relaxed whitespace-pre-wrap text-[15px] max-h-[420px] overflow-auto"
            >
              <CitationText text={answer} sources={sources} />
              {streaming && <span className="inline-block w-1.5 h-4 bg-violet ml-0.5 animate-pulse align-middle" />}
            </div>
          </motion.div>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-violet" />
              <h3 className="font-display font-bold">{t.askSources}</h3>
              <span className="text-xs text-muted">· {sources.length}</span>
            </div>
            <div className="space-y-2.5">
              {sources.map((s, i) => (
                <motion.article
                  key={s.id}
                  initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="card p-4 hover:shadow-lift transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="font-mono text-xs font-bold text-violet bg-violet/10 rounded-pill px-2 py-0.5 shrink-0">
                      [{i + 1}]
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-display font-semibold text-ink truncate">{s.title}</h4>
                        {s.date && <span className="text-xs text-muted shrink-0">{s.date}</span>}
                      </div>
                      <p className="mt-1 text-sm text-muted line-clamp-3">{s.snippet}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {s.category && <span className="chip-amber">{s.category}</span>}
                        {(s.tags || []).slice(0, 4).map(tag => (
                          <span key={tag} className="chip">#{tag}</span>
                        ))}
                        <span className="ml-auto font-mono text-[11px] text-muted">{s.score.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Inspector */}
      <aside className="md:sticky md:top-24 self-start">
        <InspectorPanel inspector={inspector} status={status} t={t} llm={llm} />
      </aside>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Timeline View                                               */
/* ─────────────────────────────────────────────────────────── */
function TimelineView({ t, lang }: { t: any; lang: Lang }) {
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [data, setData] = useState<{
    entries: TimelineEntry[];
    counts: { positive: number; neutral: number; negative: number };
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.timeline({ limit: 500 });
      setData({ entries: r.entries, counts: r.sentiment_counts });
    } catch (e) { /* ignore — empty state will show */ }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => data?.entries.filter(e => filter === 'all' || e.sentiment === filter) ?? [],
    [data, filter],
  );

  if (loading && !data) {
    return (
      <div className="card p-12 text-center text-muted">
        <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin text-violet" />
        {lang === 'en' ? 'Loading your timeline…' : '正在加载你的时间线…'}
      </div>
    );
  }

  if (!data || data.entries.length === 0) {
    return (
      <div className="card p-12 text-center text-muted">
        <Clock className="w-8 h-8 mx-auto mb-3 opacity-40" />
        {t.timelineEmpty}
      </div>
    );
  }

  const total = data.counts.positive + data.counts.neutral + data.counts.negative;

  return (
    <div className="grid md:grid-cols-[1fr_280px] gap-8">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-xl">{t.timelineTitle}</h2>
            <p className="text-xs text-muted mt-0.5">{t.timelineSub}</p>
          </div>
          <div className="text-xs text-muted font-mono">
            {filtered.length} / {data.entries.length}
          </div>
        </div>

        {/* Mood filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <MoodChip active={filter === 'all'} onClick={() => setFilter('all')}
            label={t.moodAll} count={total} icon={<Layers className="w-3 h-3" />} color="violet" />
          <MoodChip active={filter === 'positive'} onClick={() => setFilter('positive')}
            label={t.moodPositive} count={data.counts.positive} icon={<Smile className="w-3 h-3" />} color="green" />
          <MoodChip active={filter === 'neutral'} onClick={() => setFilter('neutral')}
            label={t.moodNeutral} count={data.counts.neutral} icon={<Meh className="w-3 h-3" />} color="muted" />
          <MoodChip active={filter === 'negative'} onClick={() => setFilter('negative')}
            label={t.moodNegative} count={data.counts.negative} icon={<Frown className="w-3 h-3" />} color="amber" />
        </div>

        {/* Timeline list */}
        <ol className="relative space-y-3 ml-3 border-l-2 border-line pl-6">
          <AnimatePresence>
            {filtered.map((e, i) => (
              <motion.li
                key={e.id} layout
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="relative"
              >
                <span className={`absolute -left-[34px] top-3 w-3 h-3 rounded-full ring-4 ring-canvas ${
                  e.sentiment === 'positive' ? 'bg-emerald-500' :
                  e.sentiment === 'negative' ? 'bg-amber' :
                  'bg-line'
                }`} />
                <div className="card p-4 hover:shadow-lift transition-shadow">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h3 className="font-display font-semibold text-ink truncate">{e.title}</h3>
                    <span className="text-xs text-muted font-mono shrink-0">{e.date}</span>
                  </div>
                  <p className="text-sm text-muted line-clamp-2">{e.snippet}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <SentimentPill sentiment={e.sentiment} score={e.sentiment_score} t={t} />
                    {e.category && <span className="chip-amber">{e.category}</span>}
                    {(e.tags || []).slice(0, 3).map(tag => (
                      <span key={tag} className="chip">#{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      </div>

      {/* Mood histogram sidebar */}
      <aside className="md:sticky md:top-24 self-start">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-violet" />
            <h3 className="font-display font-bold text-sm">
              {lang === 'en' ? 'Mood distribution' : '情绪分布'}
            </h3>
          </div>
          <div className="space-y-3">
            <MoodBar label={t.moodPositive} count={data.counts.positive} total={total} color="bg-emerald-500" />
            <MoodBar label={t.moodNeutral} count={data.counts.neutral} total={total} color="bg-line" />
            <MoodBar label={t.moodNegative} count={data.counts.negative} total={total} color="bg-amber" />
          </div>
          <div className="mt-5 pt-5 border-t border-line text-xs text-muted leading-relaxed">
            {lang === 'en'
              ? 'Each memory is scored locally with a bilingual lexicon — no LLM call, no cloud.'
              : '每段记忆都用本地双语词典打分 — 不调用大模型,不上云。'}
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Search View — original power-user interface                 */
/* ─────────────────────────────────────────────────────────── */
function SearchView({
  t, lang, facets, status, setSnackbar,
}: { t: any; lang: Lang; facets: Facets | null; status: Status | null; setSnackbar: (s: string) => void; }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode>('hybrid');
  const [category, setCategory] = useState<string>('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [inspector, setInspector] = useState<Inspector | null>(null);
  const [searching, setSearching] = useState(false);

  const doSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await api.search({
        query, mode, k: 10,
        category: category || undefined,
        tags: activeTags.length ? activeTags : undefined,
      });
      setResults(res.results); setInspector(res.inspector);
    } catch (e: any) { setSnackbar(String(e)); }
    finally { setSearching(false); }
  };

  const toggleTag = (tag: string) =>
    setActiveTags(prev => prev.includes(tag) ? prev.filter(x => x !== tag) : [...prev, tag]);

  return (
    <div className="grid md:grid-cols-[1.6fr_1fr] gap-8">
      <div>
        <div className="card p-2 flex items-center gap-2 shadow-lift">
          <div className="pl-3 text-muted"><Search className="w-5 h-5" /></div>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder={t.searchPlaceholder}
            className="flex-1 bg-transparent outline-none py-3 px-1 text-base placeholder:text-muted"
          />
          <select
            value={mode} onChange={e => setMode(e.target.value as Mode)}
            className="text-xs bg-canvas border border-line rounded-pill px-3 py-2 text-muted"
            title={t.mode}
          >
            {MODES.map(m => <option key={m} value={m}>{(t.modes as any)[m]}</option>)}
          </select>
          <button onClick={doSearch} disabled={searching} className="btn-primary">
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {t.search}
          </button>
        </div>

        {facets && (facets.categories.length > 0 || facets.tags.length > 0) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-xs uppercase tracking-wider text-muted mr-1">{t.filters}:</span>
            {facets.categories.length > 0 && (
              <select
                value={category} onChange={e => setCategory(e.target.value)}
                className="chip cursor-pointer"
              >
                <option value="">{t.category}: {t.none}</option>
                {facets.categories.map(c => (
                  <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
                ))}
              </select>
            )}
            {facets.tags.slice(0, 14).map(tg => (
              <button
                key={tg.name} onClick={() => toggleTag(tg.name)}
                className={activeTags.includes(tg.name) ? 'chip-violet' : 'chip hover:border-violet/30'}
              >
                #{tg.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6">
          <h2 className="font-display font-bold text-lg mb-3">
            {t.results}{results.length > 0 && <span className="text-muted font-normal"> · {results.length}</span>}
          </h2>
          {results.length === 0 && !searching && (
            <div className="card p-10 text-center text-muted">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
              {query ? t.noResults : (lang === 'en'
                ? 'Try a query, or load the sample dataset to play with this tab.'
                : '输入一个查询,或者载入示例数据集来体验。')}
            </div>
          )}
          <div className="space-y-3">
            <AnimatePresence>
              {results.map((r, i) => (
                <motion.article
                  key={r.id} layout
                  initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="card p-5 hover:shadow-lift transition-shadow group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-semibold text-ink group-hover:text-violet transition-colors">
                        {r.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted line-clamp-2">{r.snippet}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {r.category && <span className="chip-amber">{r.category}</span>}
                        {(r.tags || []).slice(0, 4).map(tag => (
                          <span key={tag} className="chip">#{tag}</span>
                        ))}
                        {r.date && <span className="text-xs text-muted ml-auto md:ml-2">{r.date}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-xs text-muted">{t.score}</div>
                      <div className="font-display font-bold text-2xl text-violet">
                        {r.score.toFixed(3)}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <aside className="md:sticky md:top-24 self-start">
        <InspectorPanel inspector={inspector} status={status} t={t} />
      </aside>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Sub-components                                              */
/* ─────────────────────────────────────────────────────────── */

function Mascot() {
  return (
    <div className="relative w-9 h-9 rounded-2xl bg-violet flex items-center justify-center shadow-lift">
      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber animate-blink" />
      <Cpu className="w-4 h-4 text-white" />
    </div>
  );
}

function StatusPill({ status, t }: { status: Status | null; t: any }) {
  const ok = status?.connected;
  return (
    <div className={`chip ${ok ? '!bg-violet/10 !border-violet/20 !text-violet' : '!bg-coral/10 !border-coral/20 !text-coral'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-violet' : 'bg-coral'} ${ok ? 'animate-pulse' : ''}`} />
      {t.dbStatus}: {ok ? t.connected : t.disconnected}
      {ok && status?.count !== undefined && (
        <span className="text-muted ml-1">· {status.count}</span>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium transition-all ${
        active
          ? 'bg-violet text-white shadow-soft'
          : 'text-muted hover:text-ink hover:bg-canvas'
      }`}
    >
      {children}
    </button>
  );
}

function InspectorPanel({
  inspector, status, t, llm,
}: { inspector: Inspector | null; status: Status | null; t: any; llm?: LLMHealth | null }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Layers className="w-4 h-4 text-violet" />
        <h3 className="font-display font-bold">{t.inspector}</h3>
      </div>
      <p className="text-xs text-muted mb-4">{t.inspectorSub}</p>

      {!inspector ? (
        <div className="text-sm text-muted py-6 text-center">
          <Zap className="w-5 h-5 mx-auto mb-2 opacity-30" />
          {t.searchPlaceholder}
        </div>
      ) : (
        <dl className="space-y-3 text-sm">
          <Row label={t.mode} value={<code className="font-mono text-violet">{inspector.mode}</code>} />
          <Row label={t.fusion} value={<span className="text-ink">{inspector.fusion ?? '—'}</span>} />
          <Row label={t.candidates} value={<code className="font-mono">{inspector.candidates_per_arm}</code>} />
          <Row label={t.filterApplied} value={
            <span className={inspector.filter_applied ? 'text-violet font-semibold' : 'text-muted'}>
              {inspector.filter_applied ? t.yes : t.no}
            </span>
          } />
          {inspector.filter_applied && (
            <pre className="mt-2 p-3 bg-canvas rounded-xl text-[11px] font-mono text-muted overflow-auto border border-line">
{JSON.stringify(inspector.filter_summary, null, 2)}
            </pre>
          )}
        </dl>
      )}

      {llm !== undefined && (
        <div className="mt-5 pt-5 border-t border-line">
          <div className="text-xs uppercase tracking-wider text-muted mb-2">LLM</div>
          {llm?.available ? (
            <div className="text-xs text-ink flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <code className="font-mono truncate">{llm.base_url}</code>
            </div>
          ) : (
            <div className="text-xs text-muted">
              <span className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-line" /> offline
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 pt-5 border-t border-line">
        <div className="text-xs uppercase tracking-wider text-muted mb-2">{t.featuresTitle}</div>
        <ul className="space-y-1.5 text-xs">
          {(status?.features ?? []).map(f => (
            <li key={f} className="flex items-center gap-2 text-ink">
              <Check className="w-3 h-3 text-violet shrink-0" /> {f}
            </li>
          ))}
        </ul>
        <button
          onClick={async () => {
            const r = await api.snapshot();
            alert(r.ok ? t.snapshotDone : t.snapshotFail);
          }}
          className="btn-ghost w-full mt-4 !py-2 text-xs"
        >
          <Database className="w-3.5 h-3.5" /> {t.snapshot}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs uppercase tracking-wider text-muted pt-0.5">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function MoodChip({
  active, onClick, label, count, icon, color,
}: { active: boolean; onClick: () => void; label: string; count: number; icon: React.ReactNode; color: 'violet' | 'green' | 'muted' | 'amber' }) {
  const colorMap = {
    violet: active ? 'bg-violet text-white border-violet' : 'border-line text-muted hover:border-violet/40',
    green:  active ? 'bg-emerald-500 text-white border-emerald-500' : 'border-line text-muted hover:border-emerald-500/40',
    muted:  active ? 'bg-line text-ink border-line' : 'border-line text-muted hover:border-ink/30',
    amber:  active ? 'bg-amber text-ink border-amber' : 'border-line text-muted hover:border-amber/40',
  } as const;
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium border transition-all ${colorMap[color]}`}>
      {icon} {label} <span className="opacity-70 font-mono">·{count}</span>
    </button>
  );
}

function MoodBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-ink">{label}</span>
        <span className="font-mono text-muted">{count} · {pct}%</span>
      </div>
      <div className="h-1.5 bg-canvas rounded-pill overflow-hidden border border-line">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

function SentimentPill({ sentiment, score, t }: { sentiment: string; score: number; t: any }) {
  if (sentiment === 'positive') {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
      <Smile className="w-3 h-3" /> {t.moodPositive} {score > 0 && `+${score.toFixed(2)}`}
    </span>;
  }
  if (sentiment === 'negative') {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[11px] bg-amber/15 border border-amber/30 text-amber-dark">
      <Frown className="w-3 h-3" /> {t.moodNegative} {score < 0 && score.toFixed(2)}
    </span>;
  }
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[11px] bg-canvas border border-line text-muted">
    <Meh className="w-3 h-3" /> {t.moodNeutral}
  </span>;
}

/** Renders text with [n] citations highlighted as clickable pills. */
function CitationText({ text, sources }: { text: string; sources: AskSource[] }) {
  if (!text) return null;
  const parts = text.split(/(\[\d+\])/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[(\d+)\]$/);
        if (m) {
          const n = parseInt(m[1], 10);
          const src = sources[n - 1];
          return (
            <span
              key={i}
              title={src ? `${src.title} — ${src.date}` : undefined}
              className="inline-flex items-center font-mono text-[11px] font-bold text-violet bg-violet/10 rounded-pill px-1.5 py-0.5 mx-0.5 align-baseline"
            >
              {n}
            </span>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

/* ── Upload modal with SSE-driven progress ───────────────── */
function UploadModal({
  t, lang, onClose, onIndexed, setSnackbar,
}: {
  t: any; lang: Lang;
  onClose: () => void;
  onIndexed: () => void;
  setSnackbar: (s: string) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number; stage: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped]);
  };

  const startIndex = async () => {
    if (!files.length) return;
    try {
      const parsed = await api.upload(files);
      setProgress({ done: 0, total: parsed.docs.length, stage: 'starting' });
      await api.indexStream(parsed.docs, (e) => {
        if (e.error) { setSnackbar(e.error); return; }
        setProgress({ done: e.done ?? 0, total: e.total ?? parsed.docs.length, stage: e.stage });
        if (e.result) {
          setSnackbar(lang === 'en'
            ? `Indexed ${e.result.upserted} docs.`
            : `已索引 ${e.result.upserted} 篇文档。`);
          onIndexed();
        }
      });
    } catch (e: any) { setSnackbar(String(e)); }
  };

  const pct = progress && progress.total > 0
    ? Math.min(100, Math.round((progress.done / progress.total) * 100))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        onClick={e => e.stopPropagation()}
        className="card max-w-xl w-full p-6"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-display font-extrabold text-xl">{t.ctaUpload}</h3>
            <p className="text-sm text-muted mt-1">{t.uploadHint}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink"><X className="w-5 h-5" /></button>
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
          className="border-2 border-dashed border-line hover:border-violet/40 rounded-xl2 p-8 text-center cursor-pointer transition-colors bg-canvas"
        >
          <FileText className="w-8 h-8 mx-auto mb-2 text-violet" />
          <div className="font-medium text-ink">{t.uploadDrop}</div>
          <div className="text-xs text-muted mt-1">{t.uploadHint}</div>
          <input
            ref={inputRef} type="file" multiple hidden
            accept=".md,.markdown,.txt,.pdf,.docx"
            onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files ?? [])])}
          />
        </div>

        {files.length > 0 && (
          <ul className="mt-4 max-h-40 overflow-auto space-y-1.5 text-sm">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-canvas border border-line">
                <span className="truncate flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted shrink-0" />{f.name}
                </span>
                <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="text-muted hover:text-coral">
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {progress && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-muted mb-1.5">
              <span className="font-mono">{progress.stage}</span>
              <span>{progress.done} {t.of} {progress.total} ({pct}%)</span>
            </div>
            <div className="h-2 bg-canvas rounded-pill overflow-hidden border border-line">
              <motion.div
                className="h-full bg-violet"
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost">{lang === 'en' ? 'Cancel' : '取消'}</button>
          <button onClick={startIndex} disabled={files.length === 0} className="btn-primary disabled:opacity-50">
            <Upload className="w-4 h-4" />
            {lang === 'en' ? `Index ${files.length} file(s)` : `索引 ${files.length} 个文件`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
