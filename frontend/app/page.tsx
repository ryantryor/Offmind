'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Upload, Sparkles, Database, Cpu, Zap, FileText,
  ArrowRight, Languages, ShieldCheck, Activity, Layers, X, Check, Loader2,
  MessageCircleQuestion, Clock, Smile, Meh, Frown, BookOpen, Send,
  PenLine, Save, Tag as TagIcon, CalendarHeart, Mail, CloudSun, Printer,
  Mic, Square, Sunrise,
} from 'lucide-react';
import {
  api,
  type SearchResult, type Inspector, type Status, type Facets,
  type AskSource, type TimelineEntry, type LLMHealth, type MorningEcho,
} from '@/lib/api';
import { STR, type Lang } from '@/lib/i18n';

const MODES = ['hybrid', 'rrf', 'dbsf', 'title', 'body', 'sparse'] as const;
type Mode = (typeof MODES)[number];

type Tab = 'ask' | 'timeline' | 'search' | 'write';

export default function Page() {
  const [lang, setLang] = useState<Lang>('en');
  const t = STR[lang];

  const [tab, setTab] = useState<Tab>('ask');
  const [status, setStatus] = useState<Status | null>(null);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [llm, setLlm] = useState<LLMHealth | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<string>('');

  // Morning Reflection — home-screen ritual. Auto-opens once per day after
  // memories exist. Dismissal is stored in localStorage keyed by YYYY-MM-DD.
  const [morningOpen, setMorningOpen] = useState(false);
  const morningTriggeredRef = useRef(false);
  useEffect(() => {
    if (morningTriggeredRef.current) return;
    if ((status?.count ?? 0) === 0) return;
    const key = 'offmind:morning:' + new Date().toISOString().slice(0, 10);
    if (typeof window !== 'undefined' && window.localStorage.getItem(key)) return;
    morningTriggeredRef.current = true;
    setMorningOpen(true);
  }, [status?.count]);
  const closeMorning = () => {
    const key = 'offmind:morning:' + new Date().toISOString().slice(0, 10);
    if (typeof window !== 'undefined') window.localStorage.setItem(key, '1');
    setMorningOpen(false);
  };

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
            <h1 className="font-serif text-5xl md:text-6xl font-extrabold leading-[1.02] tracking-tight">
              {t.heroH1a}<br/>
              <span className="text-violet italic">{t.heroH1b}</span>
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
          <TabButton active={tab === 'write'} onClick={() => setTab('write')}>
            <PenLine className="w-4 h-4" /> {t.tabWrite}
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
          {tab === 'write' && (
            <motion.div key="write" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <WriteView t={t} lang={lang} setSnackbar={setSnackbar} onSaved={refreshStatus} />
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

      {/* ── Morning Reflection (home-screen ritual) ───────── */}
      <AnimatePresence>
        {morningOpen && (
          <MorningReflectionModal
            t={t} lang={lang}
            onClose={closeMorning}
            onReflect={(entry) => {
              closeMorning();
              setTab('ask');
              // Seed the Ask tab with a follow-up about this echo
              const seed = lang === 'zh'
                ? `${entry.years_ago} 年前的今天我写到"${entry.title}" — 那段时间发生了什么?`
                : `${entry.years_ago} ${entry.years_ago === 1 ? 'year' : 'years'} ago today I wrote "${entry.title}" — what was going on in my life then?`;
              // Dispatch a window event that AskView listens for (see below).
              window.dispatchEvent(new CustomEvent('offmind:ask', { detail: seed }));
            }}
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
type AskTurn = { q: string; a: string; sources: AskSource[] };

function AskView({
  t, lang, llm, status, setSnackbar,
}: { t: any; lang: Lang; llm: LLMHealth | null; status: Status | null; setSnackbar: (s: string) => void; }) {
  const [question, setQuestion] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sources, setSources] = useState<AskSource[]>([]);
  const [inspector, setInspector] = useState<Inspector | null>(null);
  const [answer, setAnswer] = useState('');
  const [lastQ, setLastQ] = useState('');
  // Previous completed Q/A pairs in this conversation.
  // Used for (a) rendering the transcript above the current in-progress turn
  // and (b) seeding /api/ask with chat history so follow-ups feel coherent.
  const [turns, setTurns] = useState<AskTurn[]>([]);
  const [onThisDay, setOnThisDay] = useState<Awaited<ReturnType<typeof api.onThisDay>>['entries']>([]);
  // Which source card is expanded to show its full body.
  // null = all collapsed; a string id = that card is open.
  const [openSrc, setOpenSrc] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  const examples: string[] = lang === 'en' ? t.askExamples : t.askExamplesZh;

  // "On this day" — pull entries matching today's MM-DD from past years.
  // Fires once when memories are available.
  useEffect(() => {
    if ((status?.count ?? 0) === 0) return;
    api.onThisDay(7).then(r => setOnThisDay(r.entries)).catch(() => {});
  }, [status?.count]);

  const ask = async (q?: string) => {
    const finalQ = (q ?? question).trim();
    if (!finalQ || streaming) return;
    // Archive the previous completed turn (if any) into the transcript
    // BEFORE starting the new stream. Also capture its Q/A into `history`
    // so the backend can feed it to the model as prior-turn context.
    const nextTurns: AskTurn[] =
      answer && lastQ ? [...turns, { q: lastQ, a: answer, sources }] : turns;
    const history = nextTurns.flatMap((t2) => [
      { role: 'user' as const, content: t2.q },
      { role: 'assistant' as const, content: t2.a },
    ]);
    if (answer && lastQ) setTurns(nextTurns);
    setQuestion('');
    setLastQ(finalQ);
    setStreaming(true);
    setAnswer('');
    setSources([]);
    setInspector(null);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      await api.ask(
        { question: finalQ, k: 6, mode: 'hybrid', history: history.length ? history : undefined },
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

  const resetConversation = () => {
    abortRef.current?.abort();
    setTurns([]);
    setAnswer('');
    setSources([]);
    setInspector(null);
    setLastQ('');
    setQuestion('');
    setStreaming(false);
  };

  // Listen for external "seed an ask" events, e.g. from the Morning Reflection
  // modal's "Reflect on this" button. Keeps the parent from having to thread a
  // ref down into AskView.
  useEffect(() => {
    const h = (e: Event) => {
      const seed = (e as CustomEvent<string>).detail;
      if (typeof seed === 'string' && seed.trim()) ask(seed);
    };
    window.addEventListener('offmind:ask', h as EventListener);
    return () => window.removeEventListener('offmind:ask', h as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll answer panel as tokens arrive
  useEffect(() => {
    if (answerRef.current) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer]);

  // Click a [n] citation chip → scroll the matching source card into view
  // and pulse it for 2s. Uses DOM id="src-N" set on each article below.
  const jumpToSource = (n: number) => {
    const el = document.getElementById(`src-${n}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('citation-flash');
    // Force reflow so the animation restarts on repeat clicks
    void (el as HTMLElement).offsetWidth;
    el.classList.add('citation-flash');
    window.setTimeout(() => el.classList.remove('citation-flash'), 2100);
  };

  const empty = sources.length === 0 && !streaming && !answer && turns.length === 0;
  const hasMemories = (status?.count ?? 0) > 0;
  const inConversation = turns.length > 0 || !!answer;

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
            placeholder={inConversation ? t.askFollowUpPlaceholder : t.askPlaceholder}
            className="flex-1 bg-transparent outline-none py-3 px-1 text-base placeholder:text-muted"
            disabled={streaming}
          />
          {inConversation && !streaming && (
            <button
              onClick={resetConversation}
              className="text-xs text-muted hover:text-violet px-2"
              title={t.askNewConversation}
            >
              {t.askNewConversation}
            </button>
          )}
          <button onClick={() => ask()} disabled={streaming || !question.trim()} className="btn-primary disabled:opacity-50">
            {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {inConversation ? t.askFollowUp : t.askSubmit}
          </button>
        </div>

        {/* LLM health hint */}
        {llm && !llm.available && (
          <div className="mt-3 text-xs text-amber-dark bg-amber/15 border border-amber/30 rounded-pill px-3 py-2 inline-flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> {t.askNoLLM}
          </div>
        )}

        {/* Empty state — On This Day card + example questions */}
        {empty && (
          <div className="mt-6 space-y-6">
            {!hasMemories ? (
              <div className="card p-8 text-center text-muted">
                <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-40" />
                {lang === 'en'
                  ? 'Your time machine is empty. Load the sample dataset (top right) or upload your own notes to begin.'
                  : '时光机是空的。先载入示例数据或上传你自己的笔记。'}
              </div>
            ) : (
              <>
                {onThisDay.length > 0 && (
                  <OnThisDayCard entries={onThisDay} t={t} lang={lang} onAsk={(q) => ask(q)} />
                )}
                <div>
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
                </div>
              </>
            )}
          </div>
        )}

        {/* Conversation transcript — past completed turns */}
        {turns.length > 0 && (
          <div className="mt-6 space-y-3">
            {turns.map((turn, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="card p-5 opacity-80"
              >
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5">
                  {lang === 'en' ? 'You asked' : '你问过'}
                </div>
                <div className="font-display font-semibold text-ink mb-3">{turn.q}</div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-violet/80 mb-1.5">
                  {t.brand}
                </div>
                <div className="prose-journal text-ink whitespace-pre-wrap text-sm leading-relaxed line-clamp-6">
                  <CitationText text={turn.a} sources={turn.sources} onJump={() => {}} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Answer (streaming or latest completed) */}
        {(streaming || answer) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 card p-6 letter-page"
          >
            <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-wider text-violet print:hidden">
              <Sparkles className="w-3.5 h-3.5" />
              {streaming && !answer ? t.askThinking : t.brand}
              {!streaming && answer && (
                <button
                  onClick={() => window.print()}
                  className="ml-auto inline-flex items-center gap-1 text-muted hover:text-violet normal-case tracking-normal text-[11px]"
                  title={t.askExportLetter}
                >
                  <Printer className="w-3 h-3" /> {t.askExportLetter}
                </button>
              )}
            </div>
            {/* Print-only letterhead — hidden on screen, shown on paper */}
            <div className="hidden print:block mb-6 pb-4 border-b border-line">
              <div className="font-serif italic text-muted text-sm">{t.letterFrom}</div>
              {lastQ && (
                <div className="font-serif text-lg mt-1 text-ink">
                  <span className="text-muted italic">{t.letterTo}:</span> {lastQ}
                </div>
              )}
            </div>
            <div
              ref={answerRef}
              className="prose-journal text-ink whitespace-pre-wrap max-h-[460px] overflow-auto pr-2 print:max-h-none print:overflow-visible"
            >
              <CitationText text={answer} sources={sources} onJump={jumpToSource} />
              {streaming && <span className="inline-block w-1.5 h-4 bg-violet ml-0.5 animate-pulse align-middle print:hidden" />}
            </div>
            {/* Print-only footer — signature */}
            <div className="hidden print:block mt-8 pt-4 border-t border-line font-serif italic text-muted text-sm">
              — {t.brand}
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
              {sources.map((s, i) => {
                const open = openSrc === s.id;
                const full = (s as any).body || s.snippet || '';
                return (
                <motion.article
                  key={s.id}
                  id={`src-${i + 1}`}
                  initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setOpenSrc(open ? null : s.id)}
                  className={`card p-4 hover:shadow-lift transition-all scroll-mt-24 cursor-pointer ${open ? 'ring-2 ring-violet/40' : ''}`}
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
                      <AnimatePresence initial={false} mode="wait">
                        {open ? (
                          <motion.div
                            key="full"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 text-sm text-ink whitespace-pre-wrap leading-relaxed prose-journal">
                              {full}
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenSrc(null); }}
                              className="mt-2 text-xs text-violet hover:underline"
                            >
                              {lang === 'zh' ? '收起' : 'Collapse'}
                            </button>
                          </motion.div>
                        ) : (
                          <motion.p
                            key="snip"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="mt-1 text-sm text-muted line-clamp-3"
                          >
                            {s.snippet}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {s.category && <span className="chip-amber">{s.category}</span>}
                        {(s.tags || []).slice(0, 4).map(tag => (
                          <span key={tag} className="chip">#{tag}</span>
                        ))}
                        {!open && (
                          <span className="text-[11px] text-violet/70">
                            {lang === 'zh' ? '· 点击展开全文' : '· click to expand'}
                          </span>
                        )}
                        <span className="ml-auto font-mono text-[11px] text-muted">{s.score.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                </motion.article>
                );
              })}
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

        {/* Mood Weather — weekly sentiment line chart */}
        <MoodWeatherChart entries={data.entries} t={t} />

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

/** Renders text with [n] citations rendered as clickable pills that jump
 *  to the matching source card and pulse it for 2 seconds. */
function CitationText({
  text, sources, onJump,
}: { text: string; sources: AskSource[]; onJump?: (n: number) => void }) {
  if (!text) return null;
  const parts = text.split(/(\[\d+\])/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[(\d+)\]$/);
        if (m) {
          const n = parseInt(m[1], 10);
          const src = sources[n - 1];
          const tip = src ? `Jump to [${n}] — ${src.title}${src.date ? ` · ${src.date}` : ''}` : undefined;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onJump?.(n)}
              title={tip}
              className="inline-flex items-center font-sans text-[11px] font-bold text-violet bg-violet/10 hover:bg-violet hover:text-white active:scale-95 transition-all rounded-pill px-1.5 py-0.5 mx-0.5 align-baseline cursor-pointer"
            >
              {n}
            </button>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Write View — journal entry + live related-memories sidebar  */
/* ─────────────────────────────────────────────────────────── */
type Mood = 'positive' | 'neutral' | 'negative' | '';

function WriteView({
  t, lang, setSnackbar, onSaved,
}: { t: any; lang: Lang; setSnackbar: (s: string) => void; onSaved: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<Mood>('');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [related, setRelated] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [tone, setTone] = useState<{ label: 'positive'|'neutral'|'negative'; score: number; matched: number } | null>(null);
  // Voice capture state — MediaRecorder lives in a ref so React doesn't
  // retry it on re-render, and transcription state is purely for the UI.
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const debounceRef = useRef<number | null>(null);
  const toneDebounceRef = useRef<number | null>(null);
  const lastQRef = useRef<string>('');

  const charCount = body.length;

  // Tone preview — live lexicon classification as you type. Zero LLM cost,
  // pure Python bilingual dictionary on the backend (<1ms). Only shows
  // once you've written a couple lines — nothing feels judgy on a blank page.
  useEffect(() => {
    if (toneDebounceRef.current) window.clearTimeout(toneDebounceRef.current);
    const txt = `${title} ${body}`.trim();
    if (txt.length < 20) { setTone(null); return; }
    toneDebounceRef.current = window.setTimeout(async () => {
      try {
        const r = await api.sentimentPreview(txt);
        setTone(r);
      } catch { /* silent — tone is ambient */ }
    }, 500);
    return () => {
      if (toneDebounceRef.current) window.clearTimeout(toneDebounceRef.current);
    };
  }, [title, body]);

  const tonePhrase = (): string | null => {
    if (!tone || tone.matched === 0) return null;
    const s = tone.score;
    if (s > 0.5) return t.tonePositiveStrong;
    if (s > 0.15) return t.tonePositiveLight;
    if (s < -0.5) return t.toneNegativeStrong;
    if (s < -0.15) return t.toneNegativeLight;
    return t.toneNeutral;
  };
  const toneColor = (): string => {
    if (!tone) return 'text-muted';
    if (tone.score > 0.15) return 'text-emerald-600';
    if (tone.score < -0.15) return 'text-amber-dark';
    return 'text-muted';
  };

  // Debounced related-memory search — fires ~300ms after typing stops.
  // Query = title + body concatenated, trimmed, deduped against last.
  useEffect(() => {
    const q = `${title} ${body}`.trim();
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (q.length < 6) {
      setRelated([]);
      lastQRef.current = '';
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      if (q === lastQRef.current) return;
      lastQRef.current = q;
      setSearching(true);
      try {
        // Use the last 400 chars — keeps the signal tight as the entry grows
        const tailQ = q.length > 400 ? q.slice(-400) : q;
        const r = await api.search({ query: tailQ, k: 5, mode: 'hybrid' });
        setRelated(r.results);
      } catch {
        /* silently ignore — related is an ambient signal, not critical */
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [title, body]);

  // Start recording microphone audio. On stop, blob is POSTed to
  // /api/transcribe which uses faster-whisper locally — no cloud API,
  // no network egress. Transcript is appended to the current body text.
  const startRecording = async () => {
    if (recording || transcribing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (ev) => { if (ev.data.size > 0) chunksRef.current.push(ev.data); };
      mr.onstop = async () => {
        // Stop every track so the browser's mic indicator turns off
        stream.getTracks().forEach(tr => tr.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        if (blob.size === 0) { setTranscribing(false); return; }
        setTranscribing(true);
        try {
          const r = await api.transcribe(blob);
          if (r.text) {
            // Append to body with a leading space so we don't mash words together
            setBody(prev => (prev ? prev.trimEnd() + (prev.trim() ? ' ' : '') + r.text : r.text));
          }
        } catch (e: any) {
          setSnackbar(`${t.voiceFailed} ${e?.message ?? ''}`);
        } finally {
          setTranscribing(false);
        }
      };
      recorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      setSnackbar(t.voiceNoMic);
    }
  };

  const stopRecording = () => {
    const mr = recorderRef.current;
    if (!mr) return;
    try { mr.stop(); } catch { /* already stopped */ }
    setRecording(false);
  };

  const save = async () => {
    if (!title.trim() && !body.trim()) return;
    setSaving(true);
    try {
      const parsedTags = tagsInput
        .split(/[,，]/)
        .map(s => s.trim())
        .filter(Boolean);
      const r = await api.appendJournal({
        title: title.trim(),
        body: body.trim(),
        mood: mood || undefined,
        tags: parsedTags,
      });
      setSnackbar(`${t.writeSaved} · #${r.collection_total ?? '—'}`);
      setTitle('');
      setBody('');
      setTagsInput('');
      setMood('');
      setRelated([]);
      lastQRef.current = '';
      onSaved();
    } catch (e: any) {
      setSnackbar(String(e));
    } finally {
      setSaving(false);
    }
  };

  // Cmd/Ctrl+Enter to save — muscle memory for writers
  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      save();
    }
  };

  return (
    <div className="grid md:grid-cols-[1.6fr_1fr] gap-8">
      {/* Writing surface */}
      <div>
        <div className="card p-7 md:p-9">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="font-serif text-3xl font-bold leading-tight">{t.writeTitle}</h2>
              <p className="text-sm text-muted mt-1.5 max-w-lg">{t.writeSub}</p>
            </div>
            <PenLine className="w-5 h-5 text-violet shrink-0 mt-1" />
          </div>

          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t.writeTitlePlaceholder}
            className="w-full bg-transparent border-0 outline-none font-serif text-2xl font-semibold placeholder:text-muted/60 py-2 border-b border-line focus:border-violet/40 transition-colors"
          />

          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t.writeBodyPlaceholder}
            rows={14}
            className="prose-journal journal-paper mt-5 w-full bg-transparent border-0 outline-none resize-none placeholder:text-muted/70"
          />

          {/* Tone preview — quiet italic hint as you write.
              Debounced 500ms; only shows when text ≥20 chars and lexicon
              actually matched something. Zero LLM cost. */}
          <AnimatePresence>
            {tonePhrase() && (
              <motion.div
                key={tonePhrase()}
                initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`mt-2 text-xs font-serif italic ${toneColor()}`}
              >
                · {tonePhrase()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Meta row: mood + tags + save */}
          <div className="mt-5 pt-5 border-t border-line flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted">{t.writeMoodLabel}</span>
              <MoodButton active={mood === 'positive'} onClick={() => setMood(mood === 'positive' ? '' : 'positive')}
                icon={<Smile className="w-3.5 h-3.5" />} label={t.writeMoodPositive} tone="green" />
              <MoodButton active={mood === 'neutral'} onClick={() => setMood(mood === 'neutral' ? '' : 'neutral')}
                icon={<Meh className="w-3.5 h-3.5" />} label={t.writeMoodNeutral} tone="muted" />
              <MoodButton active={mood === 'negative'} onClick={() => setMood(mood === 'negative' ? '' : 'negative')}
                icon={<Frown className="w-3.5 h-3.5" />} label={t.writeMoodNegative} tone="amber" />
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[180px]">
              <TagIcon className="w-3.5 h-3.5 text-muted shrink-0" />
              <input
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder={t.writeTagsPlaceholder}
                className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted/60 border-b border-line/70 focus:border-violet/40 py-1 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <span className="text-[11px] font-mono text-muted">
                {charCount} {t.writeCharCount}
              </span>
              {/* Mic — fully offline transcription via faster-whisper.
                  Press to start, press again to stop. Transcript is appended
                  to the body. The button also pulses red while listening. */}
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={transcribing || saving}
                className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-2 text-xs font-medium border transition-all ${
                  recording
                    ? 'bg-coral/10 border-coral text-coral animate-pulse'
                    : transcribing
                    ? 'bg-canvas border-line text-muted'
                    : 'bg-canvas border-line text-muted hover:border-violet/40 hover:text-violet'
                }`}
                title={recording ? t.voiceStop : t.voiceStart}
              >
                {transcribing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                  recording ? <Square className="w-3.5 h-3.5 fill-current" /> :
                  <Mic className="w-3.5 h-3.5" />}
                <span>
                  {transcribing ? t.voiceTranscribing :
                   recording ? t.voiceRecording :
                   t.voiceStart}
                </span>
              </button>
              <button
                onClick={save}
                disabled={saving || (!title.trim() && !body.trim())}
                className="btn-primary disabled:opacity-50"
                title={lang === 'en' ? 'Ctrl/⌘ + Enter' : 'Ctrl/⌘ + Enter'}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? t.writeSaving : t.writeSave}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related memories sidebar — live, debounced */}
      <aside className="md:sticky md:top-24 self-start">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-violet" />
            <h3 className="font-display font-bold">{t.writeRelated}</h3>
            {searching && <Loader2 className="w-3 h-3 animate-spin text-muted ml-1" />}
          </div>
          <p className="text-xs text-muted mb-4">{t.writeRelatedHint}</p>

          {related.length === 0 ? (
            <div className="text-sm text-muted py-6 text-center leading-relaxed">
              <Sparkles className="w-5 h-5 mx-auto mb-2 opacity-30" />
              {t.writeRelatedEmpty}
            </div>
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence>
                {related.map((r, i) => (
                  <motion.article
                    key={r.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-3 rounded-xl border border-line hover:border-violet/30 hover:shadow-soft transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4 className="font-display font-semibold text-sm text-ink truncate">{r.title}</h4>
                      {r.date && <span className="text-[10px] text-muted font-mono shrink-0">{r.date}</span>}
                    </div>
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">{r.snippet}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      {r.category && <span className="chip !text-[10px] !py-0.5">{r.category}</span>}
                      <span className="ml-auto font-mono text-[10px] text-violet/80">
                        {r.score.toFixed(3)}
                      </span>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ── On This Day card — Ask-tab landing surface ─────────────
 * Shown on the Ask-tab empty state when memories exist AND entries
 * from past years match today's MM-DD (±window days). A quiet,
 * warm-tinted card: one line per echo, click to auto-ask.
 */
function OnThisDayCard({
  entries, t, lang, onAsk,
}: {
  entries: { id: string; title: string; date: string; snippet: string; years_ago: number; day_diff: number }[];
  t: any; lang: Lang; onAsk: (q: string) => void;
}) {
  const fmtYearsAgo = (n: number) =>
    n === 1 ? t.onThisDayOneYear : `${n} ${t.onThisDayYearsAgo}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl2 border border-amber/30 bg-amber/10 p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <CalendarHeart className="w-4 h-4 text-amber-dark" />
        <h3 className="font-display font-bold text-sm text-ink">{t.onThisDayHeader}</h3>
      </div>
      <ul className="space-y-2.5">
        {entries.map(e => (
          <li
            key={e.id}
            className="group rounded-xl bg-white/60 border border-line/70 p-3 hover:border-amber/40 hover:shadow-soft transition-all"
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-dark bg-amber/20 rounded-pill px-2 py-0.5 shrink-0">
                  {fmtYearsAgo(e.years_ago)}
                </span>
                <h4 className="font-display font-semibold text-sm text-ink truncate">{e.title}</h4>
              </div>
              <span className="text-[10px] font-mono text-muted shrink-0">{e.date}</span>
            </div>
            <p className="text-xs text-muted line-clamp-2 leading-relaxed">{e.snippet}</p>
            <button
              onClick={() => onAsk(
                lang === 'en'
                  ? `Tell me about "${e.title}" — what was going on ${fmtYearsAgo(e.years_ago)}?`
                  : `跟我讲讲「${e.title}」— ${fmtYearsAgo(e.years_ago)}到底发生了什么?`
              )}
              className="mt-2 text-[11px] text-violet hover:underline inline-flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity"
            >
              <ArrowRight className="w-3 h-3" /> {t.onThisDayAskAbout}
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ── Morning Reflection modal — first-screen ritual ─────────
 * Streams /api/morning on mount. Shows the selected past entry as
 * a quote card, then streams the 2–4 sentence reflection beneath it.
 * Two actions:
 *   "Reflect on this" → close + seed Ask tab with a follow-up question
 *   "Skip to today"   → close + remember dismissal for the day
 */
function MorningReflectionModal({
  t, lang, onClose, onReflect,
}: {
  t: any;
  lang: Lang;
  onClose: () => void;
  onReflect: (entry: MorningEcho) => void;
}) {
  const [echo, setEcho] = useState<MorningEcho | null>(null);
  const [text, setText] = useState('');
  const [streaming, setStreaming] = useState(true);
  const [done, setDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    api.morning(
      {
        onEcho: (e) => setEcho(e),
        onToken: (chunk) => setText(prev => prev + chunk),
        onDone: () => { setStreaming(false); setDone(true); },
        onError: () => { setStreaming(false); setDone(true); },
      },
      ctrl.signal,
    ).catch(() => {});
    return () => ctrl.abort();
  }, []);

  const fmtYearsAgo = (n: number) =>
    n === 1 ? t.morningOneYearAgo : `${n} ${t.morningYearsAgo}`;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 12, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-xl overflow-hidden"
      >
        <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-amber/10 to-transparent border-b border-line/60 flex items-center gap-2.5">
          <Sunrise className="w-5 h-5 text-amber-dark" />
          <div className="font-display font-bold text-ink">{t.morningHeader}</div>
          <button
            onClick={onClose}
            className="ml-auto text-muted hover:text-ink p-1 -mr-1"
            aria-label={t.morningDismiss}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {echo === null && !done && (
            <div className="flex items-center gap-2 text-sm text-muted py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t.morningReflecting}</span>
            </div>
          )}

          {echo === null && done && (
            <div className="text-sm text-muted py-4 text-center">{t.morningEmpty}</div>
          )}

          {echo && (
            <>
              <div className="rounded-xl bg-amber/10 border border-amber/25 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-amber-dark bg-amber/20 rounded-pill px-2 py-0.5">
                    {fmtYearsAgo(echo.years_ago)}
                  </span>
                  <span className="font-mono text-[10px] text-muted">{echo.date}</span>
                </div>
                <div className="font-display font-semibold text-ink mb-1.5 text-[15px]">{echo.title}</div>
                <p className="text-sm text-muted leading-relaxed line-clamp-4 whitespace-pre-wrap">
                  {echo.body || echo.snippet}
                </p>
              </div>

              <div
                className="text-[15px] leading-relaxed text-ink whitespace-pre-wrap min-h-[3rem]"
                aria-live="polite"
              >
                {text}
                {streaming && (
                  <motion.span
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="inline-block w-1.5 h-4 align-middle bg-violet/60 ml-0.5 rounded-sm"
                  />
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-line/60 bg-white/60 flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className="text-sm text-muted hover:text-ink px-3 py-1.5"
          >
            {t.morningSkip}
          </button>
          {echo && (
            <button
              onClick={() => onReflect(echo)}
              disabled={streaming}
              className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-pill px-4 py-2 bg-violet text-white hover:bg-violet/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MessageCircleQuestion className="w-4 h-4" />
              {t.morningReflectOn}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Mood Weather — weekly sentiment line chart ─────────────
 * Groups entries by ISO week, averages sentiment_score, plots
 * an SVG polyline + subtle area fill. Hovering a dot shows the
 * week summary. Pure SVG — no chart-lib dependency.
 */
function MoodWeatherChart({
  entries, t,
}: { entries: TimelineEntry[]; t: any }) {
  const buckets = useMemo(() => {
    // Group by ISO year-week key
    const map = new Map<string, { sum: number; n: number; ts: number; label: string }>();
    for (const e of entries) {
      if (!e.date) continue;
      const d = new Date(e.date);
      if (isNaN(d.getTime())) continue;
      // Snap to the Monday of that week (local) for stable keys
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      const key = monday.toISOString().slice(0, 10);
      const b = map.get(key);
      if (b) { b.sum += e.sentiment_score; b.n += 1; }
      else map.set(key, { sum: e.sentiment_score, n: 1, ts: monday.getTime(), label: key });
    }
    return Array.from(map.values()).sort((a, b) => a.ts - b.ts);
  }, [entries]);

  const [hover, setHover] = useState<number | null>(null);

  if (buckets.length < 2) {
    // Not enough weeks to draw a meaningful line — bail quietly.
    return null;
  }

  // Chart geometry
  const W = 720, H = 140, PAD_X = 12, PAD_Y = 18;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;
  const xStep = buckets.length === 1 ? 0 : innerW / (buckets.length - 1);
  // y=0 is midline (score 0), top is +1 (positive), bottom is -1
  const yFor = (score: number) => PAD_Y + innerH / 2 - (score * innerH) / 2;
  const xFor = (i: number) => PAD_X + i * xStep;

  const points = buckets.map((b, i) => {
    const avg = b.n ? b.sum / b.n : 0;
    return { x: xFor(i), y: yFor(avg), avg, ...b };
  });

  const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = `${lineD} L${points[points.length - 1].x.toFixed(1)},${yFor(0).toFixed(1)} L${points[0].x.toFixed(1)},${yFor(0).toFixed(1)} Z`;

  const hovered = hover != null ? points[hover] : null;

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <CloudSun className="w-4 h-4 text-violet" />
        <h3 className="font-display font-bold text-sm">{t.moodWeatherTitle}</h3>
      </div>
      <p className="text-xs text-muted mb-3">{t.moodWeatherSub}</p>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[140px] overflow-visible">
          {/* Midline (score = 0) */}
          <line
            x1={PAD_X} x2={W - PAD_X} y1={yFor(0)} y2={yFor(0)}
            stroke="#E8E5DA" strokeDasharray="4 4" strokeWidth={1}
          />
          {/* Area fill */}
          <path d={areaD} fill="url(#moodGrad)" opacity={0.35} />
          {/* Line */}
          <path d={lineD} fill="none" stroke="#6B4FBB" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {/* Dots */}
          {points.map((p, i) => {
            const col =
              p.avg > 0.15 ? '#10b981' :
              p.avg < -0.15 ? '#F8B739' :
              '#9A9890';
            return (
              <g key={i}>
                <circle
                  cx={p.x} cy={p.y} r={hover === i ? 5 : 3.5}
                  fill={col} stroke="#FBFAF6" strokeWidth={1.5}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(h => (h === i ? null : h))}
                  style={{ cursor: 'pointer', transition: 'r 120ms' }}
                />
              </g>
            );
          })}
          <defs>
            <linearGradient id="moodGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6B4FBB" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#6B4FBB" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#F8B739" stopOpacity="0.35" />
            </linearGradient>
          </defs>
        </svg>
        {/* Tooltip */}
        {hovered && (
          <div
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hovered.x / W) * 100}%`,
              top: `${(hovered.y / H) * 100}%`,
            }}
          >
            <div className="card px-2.5 py-1.5 text-[11px] whitespace-nowrap shadow-lift">
              <div className="font-mono text-muted">{hovered.label}</div>
              <div className="font-semibold text-ink">
                {hovered.avg > 0 ? '+' : ''}{hovered.avg.toFixed(2)}
                <span className="text-muted font-normal ml-1">· {hovered.n}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MoodButton({
  active, onClick, icon, label, tone,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; tone: 'green' | 'muted' | 'amber' }) {
  const toneMap = {
    green:  active ? 'bg-emerald-500 text-white border-emerald-500' : 'border-line text-muted hover:border-emerald-500/40',
    muted:  active ? 'bg-ink text-white border-ink' : 'border-line text-muted hover:border-ink/30',
    amber:  active ? 'bg-amber text-ink border-amber' : 'border-line text-muted hover:border-amber/40',
  } as const;
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-[11px] font-medium border transition-all ${toneMap[tone]}`}
    >
      {icon} {label}
    </button>
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
