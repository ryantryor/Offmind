export type Lang = 'en' | 'zh';

export const STR = {
  en: {
    brand: 'OffMind',
    tagline: 'Talk with your past time.',
    heroH1a: 'Talk with',
    heroH1b: 'your past time.',
    heroSub:
      'OffMind is a time machine for your mind. Drop in your notes, journals, PDFs and chat logs — then ask your past self anything. 100% offline. Powered by Actian VectorAI DB.',
    ctaUpload: 'Upload your docs',
    ctaDemo: 'Load sample dataset',

    // Tabs
    tabAsk: 'Ask',
    tabTimeline: 'Timeline',
    tabSearch: 'Search',
    tabWrite: 'Write',

    // Write view
    writeTitle: 'Write to your future self',
    writeSub: 'A new page in your private notebook. It becomes searchable the second you save.',
    writeTitlePlaceholder: 'Give this moment a title…',
    writeBodyPlaceholder: 'What happened today? What were you thinking? Write freely — your future self is a good listener.',
    writeMoodLabel: 'How does this feel?',
    writeTagsLabel: 'Tags',
    writeTagsPlaceholder: 'comma, separated, tags',
    writeSave: 'Save to memory',
    writeSaving: 'Saving…',
    writeSaved: 'Saved. Now searchable.',
    writeRelated: 'Related memories',
    writeRelatedEmpty: 'Start typing — your past self will chime in with anything that rhymes.',
    writeRelatedHint: 'These are real entries from your past that semantically match what you\'re writing.',
    writeCharCount: 'characters',
    writeMoodPositive: 'Good',
    writeMoodNeutral: 'Plain',
    writeMoodNegative: 'Heavy',

    // Tone preview (Write tab — fires as you type)
    tonePositiveLight: 'This sounds light today.',
    tonePositiveStrong: 'This sounds bright — good day.',
    toneNeutral: 'Steady tone.',
    toneNegativeLight: 'This sounds a little heavy.',
    toneNegativeStrong: 'This sounds heavy — take care of yourself today.',

    // On This Day (Ask tab)
    onThisDayHeader: 'On this day',
    onThisDayYearsAgo: 'years ago',
    onThisDayOneYear: 'one year ago',
    onThisDayAskAbout: 'Ask about this',

    // Timeline mood-weather chart
    moodWeatherTitle: 'Mood weather',
    moodWeatherSub: 'Your emotional temperature, week by week',
    moodWeatherLoading: 'Drawing your weather…',

    // Ask — export as letter
    askExportLetter: 'Save as a letter',
    letterFrom: 'A letter from your past',
    letterTo: 'to',

    // Ask — conversational follow-up
    askFollowUpPlaceholder: 'Follow up…',
    askFollowUp: 'Follow up',
    askNewConversation: 'Start over',

    // Voice capture (Write tab mic button)
    voiceStart: 'Record your voice',
    voiceStop: 'Stop recording',
    voiceRecording: 'Listening…',
    voiceTranscribing: 'Transcribing offline…',
    voiceNoMic: 'Your browser did not allow microphone access.',
    voiceFailed: 'Transcription failed.',

    // Ask view
    askPlaceholder: 'Ask your past self anything…',
    askSubmit: 'Ask',
    askThinking: 'Reading your past…',
    askEmpty: 'Try: "What was I worried about last spring?" · "When was I happiest?" · "Who did I talk about most?"',
    askSources: 'From your past',
    askNoLLM: 'Local LLM not running. Start Ollama (or set OFFMIND_LLM_BASE_URL) to enable answers — sources still work.',
    askExamples: [
      'What was making me anxious last spring?',
      'When was I happiest?',
      'How did I feel after the breakup?',
      'What did I learn about myself in 2024?',
    ],
    askExamplesZh: [
      '我去年春天在焦虑什么?',
      '我什么时候最幸福?',
      '分手后我是怎么走过来的?',
      '我从2024年学到了什么?',
    ],

    // Timeline view
    timelineTitle: 'Your timeline',
    timelineSub: 'Every moment, color-coded by mood',
    moodAll: 'All',
    moodPositive: 'Positive',
    moodNeutral: 'Neutral',
    moodNegative: 'Negative',
    timelineEmpty: 'No memories yet — load the sample or upload your own.',

    // Search (existing)
    searchPlaceholder: 'Search across your knowledge…',
    search: 'Search',
    mode: 'Mode',
    modes: {
      hybrid: 'Hybrid (dense + sparse)',
      rrf: 'RRF (title + body)',
      dbsf: 'DBSF (distribution fusion)',
      title: 'Title only',
      body: 'Body only',
      sparse: 'Sparse BM25 only',
    },
    filters: 'Filters',
    category: 'Category',
    tags: 'Tags',
    dateFrom: 'From',
    dateTo: 'To',
    inspector: 'Actian Query Inspector',
    inspectorSub: 'Exactly what we asked the database to do',
    fusion: 'Fusion',
    filterApplied: 'Filter applied',
    candidates: 'Candidates per arm',
    none: 'None',
    yes: 'Yes',
    no: 'No',
    results: 'Results',
    noResults: 'No matches. Try widening your filters or a different query.',
    score: 'score',
    sample: 'Sample',
    uploadDrop: 'Drop files here, or click to choose',
    uploadHint: 'Markdown · TXT · PDF · DOCX',
    indexing: 'Indexing',
    of: 'of',
    indexed: 'Indexed',
    notes: 'memories in your private brain',
    poweredBy: 'Powered by',
    dbStatus: 'Database',
    connected: 'Connected',
    disconnected: 'Disconnected',
    featuresTitle: 'Actian features in use',
    snapshot: 'Save snapshot',
    snapshotDone: 'Snapshot saved.',
    snapshotFail: 'Snapshot failed.',
    privateNote:
      'Nothing leaves your laptop. No cloud. No telemetry. Your knowledge stays yours.',
  },
  zh: {
    brand: 'OffMind 离线思维',
    tagline: '和过去的自己对话。',
    heroH1a: '和过去的',
    heroH1b: '自己对话。',
    heroSub:
      'OffMind 是给大脑的时光机。把你的笔记、日记、PDF、聊天记录丢进来 — 然后问问过去的自己任何问题。100% 离线运行,底层由 Actian VectorAI DB 驱动。',
    ctaUpload: '上传你的文档',
    ctaDemo: '载入示例数据集',

    // Tabs
    tabAsk: '问过去的我',
    tabTimeline: '时间线',
    tabSearch: '搜索',
    tabWrite: '写下来',

    // Write view
    writeTitle: '写给未来的自己',
    writeSub: '在你私人笔记本里翻开新的一页。保存的那一刻,它就可以被检索了。',
    writeTitlePlaceholder: '给这个瞬间起个标题…',
    writeBodyPlaceholder: '今天发生了什么?你在想什么?随便写。未来的你是一个很好的倾听者。',
    writeMoodLabel: '此刻的心情',
    writeTagsLabel: '标签',
    writeTagsPlaceholder: '用逗号分隔多个标签',
    writeSave: '存入记忆',
    writeSaving: '保存中…',
    writeSaved: '已保存。现在可以搜到了。',
    writeRelated: '相关的记忆',
    writeRelatedEmpty: '开始打字 — 过去的自己会从记忆深处跳出来和你呼应。',
    writeRelatedHint: '这些是过去你写过的片段,语义上和你现在写的接近。',
    writeCharCount: '字',
    writeMoodPositive: '好',
    writeMoodNeutral: '平',
    writeMoodNegative: '重',

    // Tone preview
    tonePositiveLight: '这段读起来有点轻快。',
    tonePositiveStrong: '这段很亮 — 看起来是好日子。',
    toneNeutral: '平稳。',
    toneNegativeLight: '这段有一点重量。',
    toneNegativeStrong: '这段很沉 — 今天对自己好一点。',

    // On This Day
    onThisDayHeader: '今日回声',
    onThisDayYearsAgo: '年前的今天',
    onThisDayOneYear: '一年前的今天',
    onThisDayAskAbout: '就这个问一下',

    // Mood weather
    moodWeatherTitle: '情绪天气',
    moodWeatherSub: '你的情绪体温,一周一周画出来',
    moodWeatherLoading: '正在画你的天气…',

    // Ask — export as letter
    askExportLetter: '保存成一封信',
    letterFrom: '一封来自过去的信',
    letterTo: '给',

    // Ask — conversational follow-up
    askFollowUpPlaceholder: '接着问…',
    askFollowUp: '继续追问',
    askNewConversation: '重新开始',

    // Voice capture
    voiceStart: '用语音记下来',
    voiceStop: '停止录音',
    voiceRecording: '正在聆听…',
    voiceTranscribing: '离线转写中…',
    voiceNoMic: '浏览器没有获得麦克风权限。',
    voiceFailed: '语音转写失败。',

    // Ask view
    askPlaceholder: '问问过去的自己,任何事…',
    askSubmit: '提问',
    askThinking: '正在翻阅你的过去…',
    askEmpty: '试试: 「我去年春天在焦虑什么?」 · 「我什么时候最幸福?」 · 「我提到最多的人是谁?」',
    askSources: '过去的你写过',
    askNoLLM: '本地大模型没启动。启动 Ollama (或设置 OFFMIND_LLM_BASE_URL) 后就能生成回答 — 引用片段照常显示。',
    askExamples: [
      'What was making me anxious last spring?',
      'When was I happiest?',
      'How did I feel after the breakup?',
      'What did I learn about myself in 2024?',
    ],
    askExamplesZh: [
      '我去年春天在焦虑什么?',
      '我什么时候最幸福?',
      '分手后我是怎么走过来的?',
      '我从2024年学到了什么?',
    ],

    // Timeline view
    timelineTitle: '你的时间线',
    timelineSub: '每一个瞬间,按情绪着色',
    moodAll: '全部',
    moodPositive: '积极',
    moodNeutral: '平静',
    moodNegative: '低落',
    timelineEmpty: '还没有记忆 — 试试载入示例或上传你自己的笔记。',

    // Search (existing)
    searchPlaceholder: '在你的知识库里搜索…',
    search: '搜索',
    mode: '模式',
    modes: {
      hybrid: '混合检索 (稠密 + 稀疏)',
      rrf: 'RRF (标题 + 正文)',
      dbsf: 'DBSF (分布式融合)',
      title: '仅标题',
      body: '仅正文',
      sparse: '仅 BM25 稀疏',
    },
    filters: '筛选',
    category: '分类',
    tags: '标签',
    dateFrom: '从',
    dateTo: '到',
    inspector: 'Actian 查询透视',
    inspectorSub: '我们刚才让数据库做了什么',
    fusion: '融合',
    filterApplied: '已应用筛选',
    candidates: '每路候选数',
    none: '无',
    yes: '是',
    no: '否',
    results: '搜索结果',
    noResults: '没有匹配项。试试放宽筛选,或者换个问法。',
    score: '相关度',
    sample: '示例',
    uploadDrop: '把文件拖到这里,或点击选择',
    uploadHint: 'Markdown · TXT · PDF · DOCX',
    indexing: '索引中',
    of: '/',
    indexed: '已索引',
    notes: '段记忆进入你的私人大脑',
    poweredBy: '底层驱动',
    dbStatus: '数据库',
    connected: '已连接',
    disconnected: '未连接',
    featuresTitle: '正在使用的 Actian 特性',
    snapshot: '保存快照',
    snapshotDone: '快照已保存。',
    snapshotFail: '快照保存失败。',
    privateNote: '没有任何数据离开你的电脑。没有云服务,没有埋点。你的知识只属于你。',
  },
} as const;

export type T = typeof STR['en'];
