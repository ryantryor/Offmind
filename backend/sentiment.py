"""
Lightweight bilingual sentiment classifier for journal entries.

Pure-Python, zero new dependencies. Picks one of three labels:
  positive / neutral / negative
plus a normalized intensity score in [-1.0, +1.0].

This isn't trying to beat a fine-tuned BERT — it just needs to be
reliable enough to color the Timeline view (green / grey / amber dots)
and let the user filter "show me everything I wrote when I was anxious."

Lexicons are intentionally compact and weighted. CJK words are matched
as substrings (no whitespace tokenization needed).
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass
from typing import List, Tuple


# (word, weight). Positive weights → positive sentiment.
LEXICON_EN: List[Tuple[str, float]] = [
    # Positive
    ("happy", 1.0), ("excited", 1.0), ("grateful", 1.0), ("proud", 1.0),
    ("love", 0.9), ("loved", 0.9), ("joy", 1.0), ("amazing", 0.9),
    ("wonderful", 0.9), ("great", 0.6), ("good", 0.4), ("calm", 0.6),
    ("peaceful", 0.7), ("hopeful", 0.8), ("relief", 0.7), ("relaxed", 0.6),
    ("won", 0.7), ("shipped", 0.6), ("finished", 0.4), ("clear", 0.3),
    ("breakthrough", 0.9), ("progress", 0.5), ("better", 0.4),
    ("thanks", 0.5), ("thank you", 0.5), ("celebrate", 0.9),

    # Negative
    ("anxious", -1.0), ("anxiety", -1.0), ("scared", -0.9), ("afraid", -0.9),
    ("worried", -0.8), ("worry", -0.7), ("stressed", -0.9), ("stress", -0.7),
    ("sad", -0.9), ("depressed", -1.0), ("lonely", -0.9), ("alone", -0.4),
    ("angry", -0.9), ("frustrated", -0.8), ("annoyed", -0.5), ("hate", -0.9),
    ("tired", -0.5), ("exhausted", -0.8), ("burned out", -1.0), ("burnt out", -1.0),
    ("stuck", -0.6), ("blocked", -0.5), ("failed", -0.8), ("failure", -0.8),
    ("regret", -0.8), ("ashamed", -0.9), ("guilty", -0.7), ("hopeless", -1.0),
    ("overwhelmed", -0.9), ("can't", -0.2), ("cannot", -0.2),
    ("hard", -0.3), ("difficult", -0.3), ("struggle", -0.6), ("struggling", -0.7),
    ("doubt", -0.4), ("confused", -0.4),
]

LEXICON_ZH: List[Tuple[str, float]] = [
    # Positive
    ("开心", 1.0), ("快乐", 1.0), ("高兴", 0.8), ("兴奋", 1.0),
    ("感激", 1.0), ("感谢", 0.7), ("骄傲", 1.0), ("自豪", 1.0),
    ("爱", 0.6), ("喜欢", 0.5), ("欣慰", 0.7), ("满足", 0.7),
    ("平静", 0.6), ("放松", 0.6), ("安心", 0.7), ("希望", 0.7),
    ("突破", 0.9), ("进步", 0.5), ("成功", 0.8), ("完成", 0.4),
    ("搞定", 0.5), ("赢", 0.7), ("终于", 0.4), ("舒服", 0.5),
    ("温暖", 0.6), ("幸福", 1.0), ("惊喜", 0.7),

    # Negative
    ("焦虑", -1.0), ("紧张", -0.7), ("害怕", -0.9), ("担心", -0.7),
    ("难过", -0.9), ("伤心", -0.9), ("沮丧", -0.9), ("抑郁", -1.0),
    ("孤独", -0.9), ("寂寞", -0.7), ("空虚", -0.7),
    ("生气", -0.8), ("愤怒", -1.0), ("烦", -0.5), ("烦躁", -0.7),
    ("讨厌", -0.6), ("恨", -0.9),
    ("累", -0.5), ("疲惫", -0.7), ("筋疲力尽", -1.0), ("崩溃", -1.0),
    ("卡住", -0.5), ("失败", -0.8), ("失误", -0.5), ("后悔", -0.8),
    ("羞愧", -0.9), ("内疚", -0.7), ("绝望", -1.0), ("无力", -0.7),
    ("压力", -0.6), ("压抑", -0.8), ("迷茫", -0.6), ("困惑", -0.4),
    ("挣扎", -0.7), ("难受", -0.8), ("痛苦", -0.9),
]


# Negation flips the polarity of the next match within a small window.
NEG_EN = re.compile(r"\b(not|no|never|n't|hardly|barely)\b", re.IGNORECASE)
# ZH negation chars. We only check the IMMEDIATELY preceding char so that
# "特别开心" (= "especially happy") doesn't get mis-flipped because "别"
# appears in "特别".
NEG_ZH_CHARS = {"不", "没", "未", "无"}


@dataclass
class Sentiment:
    label: str       # 'positive' | 'neutral' | 'negative'
    score: float     # -1.0 … +1.0
    matched: int     # how many lexicon hits — useful for confidence


def _has_cjk(text: str) -> bool:
    return any("\u4e00" <= ch <= "\u9fff" for ch in text)


def _score_en(text: str) -> Tuple[float, int]:
    lo = text.lower()
    total = 0.0
    hits = 0
    for word, weight in LEXICON_EN:
        # word boundaries on simple ASCII tokens
        pattern = r"\b" + re.escape(word) + r"\b"
        for m in re.finditer(pattern, lo):
            # Look back ~20 chars for a negation
            start = max(0, m.start() - 20)
            window = lo[start : m.start()]
            flip = -1.0 if NEG_EN.search(window) else 1.0
            total += weight * flip
            hits += 1
    return total, hits


def _score_zh(text: str) -> Tuple[float, int]:
    total = 0.0
    hits = 0
    for word, weight in LEXICON_ZH:
        idx = 0
        while True:
            pos = text.find(word, idx)
            if pos < 0:
                break
            # Negation: only the IMMEDIATELY preceding character counts.
            # This avoids "特别开心" being flipped because "别" appears in "特别".
            prev_char = text[pos - 1] if pos > 0 else ""
            flip = -1.0 if prev_char in NEG_ZH_CHARS else 1.0
            total += weight * flip
            hits += 1
            idx = pos + len(word)
    return total, hits


def analyze(text: str) -> Sentiment:
    """Classify a piece of text. Mixes EN + ZH lexicons additively."""
    if not text:
        return Sentiment(label="neutral", score=0.0, matched=0)

    en_score, en_hits = _score_en(text)
    zh_score, zh_hits = (_score_zh(text) if _has_cjk(text) else (0.0, 0))

    raw = en_score + zh_score
    hits = en_hits + zh_hits

    # Squash to [-1, +1] with diminishing returns — one happy word
    # shouldn't max out the meter.
    score = math.tanh(raw / 3.0) if hits else 0.0

    if score > 0.15:
        label = "positive"
    elif score < -0.15:
        label = "negative"
    else:
        label = "neutral"

    return Sentiment(label=label, score=round(score, 3), matched=hits)
