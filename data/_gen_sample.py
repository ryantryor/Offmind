"""One-shot generator: writes ~30 bilingual personal journal entries
into ./sample/ as markdown-with-frontmatter files.

Themes are intentionally personal & emotional so the Time Machine demo
has obvious "talk to your past self" payoff — career anxiety, breakups,
late-night reflections, small wins, family, health, travel.
"""
from pathlib import Path
import textwrap

OUT = Path(__file__).parent / "sample"
OUT.mkdir(exist_ok=True)

# (date, slug, lang, title, category, tags, body)
ENTRIES = [
    # ── 2024 ───────────────────────────────────────────────────
    ("2024-01-03", "new-year-resolutions", "en", "New year — and I'm scared",
     "journal", ["career", "anxiety", "reflection"],
     """It's 1am on January 3rd and I can't sleep. The new year is supposed to feel hopeful but I just feel tired. I keep thinking about how I'm 28 and still don't know what I want to be when I grow up. Everyone at the party last night seemed so sure of themselves.

I keep telling myself I'll start the side project this week. I won't. I never do.

Resolution this year: less pretending, more honesty. Even with myself. Especially with myself."""),

    ("2024-01-15", "shipped-the-redesign", "en", "We shipped it",
     "work", ["work", "win", "team"],
     """We shipped the redesign today. Eight months of work, three near-cancellations, one designer quit halfway through. And it's live.

Numbers are early but engagement is up 14% on day one. The product manager hugged me. I've never been hugged at work before. It was weird and nice.

I'm going to allow myself to feel proud for at least 24 hours before I start picking it apart."""),

    ("2024-02-09", "妈妈住院了", "zh", "妈妈住院了",
     "family", ["家人", "焦虑", "健康"],
     """妈今天突然晕倒,送进了医院。医生说是低血糖加上血压问题,问题不大,观察两天就行。可我从接到电话到现在,手都在抖。

坐在医院走廊的椅子上,我突然意识到一件特别荒谬的事:我已经三个月没回家吃饭了。三个月。

她躺在那里看着我,笑着说"没事别担心,你忙你的"。我点头,然后跑去厕所哭了十分钟。

爸说"以后周末多回来吧"。我说"好"。这次我必须做到。"""),

    ("2024-03-02", "cant-stop-comparing", "en", "Why can't I stop comparing?",
     "journal", ["anxiety", "social-media", "reflection"],
     """Spent three hours on LinkedIn tonight. Three hours. Reading other people's promotions, launches, "I'm thrilled to announce" posts.

Walked away feeling worse than when I started. Why do I do this to myself? It's like picking at a scab — I know it'll bleed but I can't stop.

The worst part is I know none of those posts are the real story. Everyone's quietly struggling. But the brain doesn't care about that. The brain just wants to compare.

Going to delete the app for a week. Let's see."""),

    ("2024-03-18", "周末跑步", "zh", "周末早晨的奥森",
     "health", ["跑步", "平静", "周末"],
     """今天早上六点起床去奥森跑步。没什么特别的原因,就是想出去走走。

跑了八公里,中途在湖边停下来喝水,看见一只老人在打太极,动作慢得像是水里游泳。我突然觉得很平静。城市还没醒,空气是甜的。

工作的事、感情的事、未来的事 — 全部留在了家里那个躺着没洗的杯子旁边。

回家之后我做了煎蛋,放了很多胡椒。这就是我今天最幸福的一刻。"""),

    ("2024-04-05", "promo-denied", "en", "Promo denied",
     "work", ["career", "disappointment", "anger"],
     """Performance review today. I didn't get the promotion. Manager gave me a list of "growth areas" that read like she pulled them from a template. Strategic thinking. Cross-functional influence. Whatever that means.

I'm so angry I can taste it. I worked weekends for a year. I shipped the redesign. I trained two new hires.

I know I should "use this as fuel" or whatever the LinkedIn people say. Right now I just want to throw my laptop in a river."""),

    ("2024-04-12", "interview-prep", "en", "Started interviewing again",
     "work", ["career", "job-search", "hope"],
     """Updated my resume tonight. First time in two years. It felt strange — like writing about someone else.

Reached out to three recruiters. One responded within an hour. Apparently the market for senior engineers is hot right now. Apparently I'm a senior engineer.

A small flicker of hope. The kind I haven't felt in months. Won't tell anyone yet — don't want to jinx it."""),

    ("2024-05-20", "和小雨分手了", "zh", "和小雨分手了",
     "relationships", ["分手", "难过", "孤独"],
     """今晚和小雨说了分手。三年了。

不是因为吵架,也不是因为谁做错了什么。就是 — 我们彼此都知道,关系已经在慢慢死去,只是没人愿意先承认。她哭了。我没有。可是回到家,我坐在沙发上一动不动坐了两个小时。

冰箱里还有她上次买的那盒草莓。我没有勇气扔掉,也没有勇气吃。

明天还要上班,还要假装一切正常。"""),

    ("2024-06-02", "first-week-alone", "en", "First week living alone",
     "life", ["lonely", "transition", "growth"],
     """Moved into the new apartment last weekend. Smaller. Cheaper. Mine.

The first night was rough. I didn't realize how much background noise another person makes — the kettle, the footsteps, the closing doors. The silence here is loud.

But I made dinner for myself tonight. Pasta. Nothing fancy. Ate it at the table instead of in front of the TV. Felt like a small ceremony.

Maybe this is what they mean by "rebuilding". You don't do it in a day. You do it one bowl of pasta at a time."""),

    ("2024-07-14", "got-the-offer", "en", "I got the offer",
     "work", ["career", "win", "excited"],
     """They sent the offer letter at 4pm. I read it three times to make sure I wasn't hallucinating.

Title: Staff Engineer. Comp: 35% above current. Remote OK. Start in September.

I called Mom. She cried. I told her I'd take her on a trip with the signing bonus. She told me I should save it. We're both right.

I haven't celebrated yet. I think I'm waiting for it to feel real. Maybe tomorrow."""),

    ("2024-08-03", "暑假回家", "zh", "回家的第三天",
     "family", ["家人", "幸福", "回忆"],
     """回家第三天了。妈每天问我想吃什么,然后做四个我没说要的菜。爸坐在阳台上抽烟,看见我就问 "工作累不累"。

晚上一起看电视。是个特别老的电视剧,他们看过十几遍的那种。我躺在沙发上,妈靠在我旁边织毛衣,爸在旁边打瞌睡。

突然觉得 — 这就是我每次熬夜加班、被同事激怒、为了KPI焦虑时,真正在守护的东西。这个安静的、平凡的、晚上八点的客厅。

我会记住今晚的。"""),

    ("2024-09-10", "first-week-new-job", "en", "First week at the new job",
     "work", ["career", "imposter", "anxiety"],
     """Day five at the new place. Everyone here is so much smarter than me. There's a Slack channel where they discuss compiler internals for fun.

Today I asked what felt like a stupid question in a code review and got a really kind answer. "Great catch — I always forget about that edge case." It wasn't even that good of a question.

I think I might survive here. Slowly."""),

    ("2024-10-21", "深夜的代码", "zh", "凌晨三点的 bug",
     "work", ["工作", "深夜", "成就感"],
     """凌晨三点。终于把那个困了我一周的 bug 修好了。

是个 race condition,藏在两个异步调用之间,只在生产环境特定流量下才会触发。本地没法复现,日志也几乎没线索。

我盯着屏幕,把每一行可能相关的代码都读了一遍。读到第四遍的时候,突然就看见了。就在那里,一直在那里。

修好之后,我没有立刻去睡。我泡了杯茶,打开窗户。秋天的风吹进来,凉的。我感觉自己活着。这种感觉很久没有了。"""),

    ("2024-11-08", "burnout-creeping", "en", "Burnout is back",
     "work", ["burnout", "anxiety", "warning"],
     """I noticed it this morning. Coffee tasted like nothing. Standup felt underwater. Got irritated at a teammate over something trivial.

I know this feeling. I've had it before. It's the early warning system — the one I usually ignore until I crash hard.

This time I'm going to try something different. I'm going to take Friday off. Not to do anything productive. Just to be horizontal somewhere.

It feels almost transgressive to admit I need rest before I've earned it. But the rule "earn rest first" is exactly what got me here last time."""),

    ("2024-12-31", "year-in-review", "en", "Year in review",
     "journal", ["reflection", "growth", "year-end"],
     """At the start of this year I wrote that I felt scared. Reading that now, I want to give past-me a hug.

What actually happened in 2024:
- Mom got sick. She got better.
- I broke up with someone I loved. I'm still here.
- I got passed over for promotion. Then I got a better job.
- I learned that loneliness isn't a punishment — sometimes it's just what growth feels like.

I don't have a tidy resolution for next year. Just one sentence, lifted from a poem I read last week:

"Be soft. Do not let the world make you hard.\""""),

    # ── 2025 ───────────────────────────────────────────────────
    ("2025-01-19", "新年第一次旅行", "zh", "京都的雪",
     "travel", ["旅行", "雪", "幸福"],
     """京都下雪了。

清水寺的台阶上,我和妈一起站在那里看雪落在屋檐上。她穿着我去年圣诞节给她买的那件红色羽绒服,在白茫茫一片里特别显眼。

她说她活了五十多年第一次看到这么大的雪。她小时候在四川长大,一年也下不了几场。

我没有说什么。只是把她的手握得更紧了一些。她的手很小,很冷。

今年要带她去更多地方。"""),

    ("2025-02-14", "valentines-alone", "en", "Valentine's, by myself",
     "relationships", ["lonely", "growth", "self-love"],
     """Valentine's Day. First one in years where I'm not in a relationship.

I expected to feel sad. Instead I bought myself flowers (peonies, expensive), made a steak (overcooked it slightly), and watched a documentary about deep-sea creatures (terrifying and beautiful).

Around 9pm I noticed something strange: I wasn't waiting for anyone to text me. The phone was silent and that was OK.

Maybe this is what self-respect feels like when no one's around to perform for. Not loud. Not triumphant. Just — quiet."""),

    ("2025-03-11", "new-running-pr", "en", "Half-marathon PR",
     "health", ["running", "win", "discipline"],
     """1:42:18. Knocked four minutes off my old PR. Didn't think I had it in me today — woke up tired, body felt heavy in the warmup.

Around km 14 there was this moment where I almost quit. Legs were screaming. Brain was bargaining. And then I just… didn't quit.

Crossed the line and immediately sat on the curb and laughed for no reason. A volunteer asked if I was OK. I think I was the most OK I've been in a long time."""),

    ("2025-04-02", "the-call-i-was-dreading", "en", "The call I'd been dreading",
     "family", ["family", "fear", "love"],
     """Dad called this morning to say his test results came back. Benign. Not cancer.

I sat on my kitchen floor for twenty minutes after we hung up. Just sat there. The fridge hummed. The neighbor's dog barked. The world kept moving.

I had been carrying the worst-case scenario in my chest for three weeks without realizing how heavy it was. Now it's gone and I feel hollow and grateful all at once.

I'm flying home next weekend. No more excuses."""),

    ("2025-04-28", "团队解散了", "zh", "团队解散了",
     "work", ["工作", "失望", "迷茫"],
     """今天 leadership 宣布我们整个团队要重组。说得很好听 — "战略重新定位"、"提升组织效率"。说白了就是产品方向变了,我们做的东西不再重要。

我盯着 Zoom 上 leadership 那张笑脸,突然不知道自己过去八个月加的班是为了什么。

下班之后没有马上回家。坐在公司楼下的咖啡馆里,点了杯黑咖啡,看着窗外。

不哭。也不愤怒。只是 — 累。一种很深的、骨头里的累。"""),

    ("2025-05-15", "friend-from-college", "en", "Coffee with M",
     "friendship", ["friendship", "joy", "reconnection"],
     """Had coffee with M today. We hadn't seen each other since college — six years. I was nervous. What if we had nothing to say?

Turns out: three hours flew by. We talked about everything and nothing. Her divorce. My new job. The friend from our class who became a monk. The cafe owner kept refilling our cups.

When we hugged goodbye she said "let's not let it be six years again." I said yes and meant it.

Some friendships are like seeds — they can lie dormant for years and still come back to life when watered."""),

    ("2025-06-08", "六月的雨夜", "zh", "六月的雨夜",
     "journal", ["独处", "平静", "回忆"],
     """晚上下雨。北京的雨总是来得急,走得也急。

我坐在窗边,什么也没做,就听雨。手里端着一杯凉了的茶。

突然想起小时候,夏天打雷的时候妈会把我搂在怀里说"别怕"。那时候觉得她无所不能。现在我比她还高了,可还是会想念那种被保护的感觉。

人是怎么长大的呢?好像就是在某一个瞬间,突然意识到能保护你的人也会老。然后你就开始,试着自己做那个能保护别人的人。

雨还在下。"""),

    ("2025-07-19", "side-project-launch", "en", "Launched the side project",
     "creative", ["side-project", "win", "exhausted"],
     """Pushed it live tonight. The thing I've been chipping away at for ten months between meetings and weekends.

Got 3 users in the first hour. Two of them were friends. One was a stranger. THE STRANGER LEFT A NICE COMMENT.

I know 3 users is nothing. I know most of these things go nowhere. But for one hour tonight, somebody I don't know used something I made and it helped them. That's a feeling I want to chase for the rest of my life."""),

    ("2025-08-05", "回到老家", "zh", "回到我长大的小镇",
     "travel", ["回忆", "故乡", "感慨"],
     """回老家待了三天。

我小时候上学的那条路,现在两边的店都换光了。文具店变成了奶茶店。游戏厅变成了房产中介。只有那棵歪脖子的老槐树还在原地。

我在树下站了很久。脑子里全是 12 岁的我,背着书包,吃着五毛钱一根的老冰棍,觉得这个世界大得没有边。

回家的路上突然明白:故乡不是一个地方,是一段时间。它已经回不去了,因为我已经不是当时的那个我。

但是没关系。能记得就好。"""),

    ("2025-09-12", "anxiety-attack", "en", "Anxiety attack at the airport",
     "health", ["anxiety", "fear", "self-compassion"],
     """Had an anxiety attack at the airport this morning. Out of nowhere. I was just standing in the security line and suddenly couldn't breathe right. Heart racing. Vision narrowing.

Last time this happened was two years ago. I thought I was past this.

A woman behind me noticed and asked if I was OK. I lied. Said I was fine. She nodded and pretended to believe me. That tiny act of kindness from a stranger almost made me cry.

Made the flight. Wrote this from seat 24A.

Note to self: you are not broken because the old patterns came back. You are a human being in a body that remembers things. Be gentle."""),

    ("2025-10-04", "突然的告白", "zh", "他说他喜欢我",
     "relationships", ["心动", "犹豫", "希望"],
     """阿哲昨晚跟我说他喜欢我。我们认识快一年了,从来没想过他会有这种感觉。

我没立刻回答。我说我需要一点时间。他说"好,不急"。

今天一整天我都在想这件事。我喜欢他吗?我不知道。我很喜欢和他在一起的感觉 — 安心,不用表演。但是从那种"喜欢"到这种"喜欢",中间是有距离的。

我告诉自己:不要因为害怕错过就答应。也不要因为害怕受伤就拒绝。

慢慢来。今年我学到的最重要的事就是:慢一点没关系。"""),

    ("2025-11-11", "double-eleven-shopping", "en", "Double 11 — and I bought nothing",
     "life", ["minimalism", "growth", "small-win"],
     """First time in years I made it through Singles' Day without buying anything. Didn't even open the app.

It's a small thing. Almost embarrassing to write down. But this time last year I spent three hours scrolling and dropped ¥2,400 on stuff I never used.

I think the difference is: I'm not trying to fill anything right now. The hole I used to shop into is just… smaller. Or maybe I just stopped pouring into it.

Tomorrow I'll cook the dinner I planned. Wash the dishes. Read for an hour. Sleep. That's the whole evening. That's enough."""),

    ("2025-12-03", "promotion-this-time", "en", "Promotion — this time",
     "work", ["career", "win", "validation"],
     """Got promoted to Senior Staff today. The thing I wanted so badly two years ago at the old place. The thing I cried about not getting.

It feels different than I thought it would. Quieter. Less triumphant. More like — yeah, of course. I did the work. The work was seen.

Maybe that's what real validation feels like. Not fireworks. Just a steady "yes."

Going to take Mom out for dinner this weekend. The fancy place she always points at when we walk by."""),

    ("2025-12-25", "圣诞节一个人", "zh", "圣诞节,一个人",
     "journal", ["独处", "平静", "年末"],
     """圣诞节。一个人在家。

去年这时候,我会觉得这是一种失败。今年只觉得是一种安静。

煮了一碗速冻饺子。看了一部老电影。给妈打了视频电话,她在镜头那边给我看她新买的盆栽。

晚上九点,坐在窗前看楼下的灯。每扇窗户后面都是一个故事,一个人,一个家庭。我也是其中之一。

我不知道明年会怎么样。但今晚,我是平静的。这就够了。"""),

    ("2025-12-31", "two-years-later", "en", "Two years later",
     "journal", ["reflection", "growth", "year-end"],
     """Two years ago I wrote that I felt scared and lost. I want to talk to that version of me.

I want to tell her: you'll get sick of being scared before scared is done with you. The job thing works out. The breakup hurts and then it teaches. Mom is OK. Dad is OK. You learn to be alone without being lonely.

You also don't become someone new. That's the thing nobody tells you. You just become more yourself, and slowly, slowly, you stop apologizing for it.

Going into 2026 with no resolutions. Just one quiet promise: keep being honest. Keep being soft. Keep showing up.

Past me — thanks for not giving up. Future me — see you next year.\n"""),
]


def write_all():
    written = 0
    for date, slug, lang, title, category, tags, body in ENTRIES:
        fname = f"{date}-{slug}.md"
        path = OUT / fname
        tag_str = ", ".join(tags)
        fm = textwrap.dedent(f"""\
        ---
        title: "{title}"
        date: {date}
        category: {category}
        tags: [{tag_str}]
        lang: {lang}
        ---
        """)
        path.write_text(fm + "\n" + body.strip() + "\n", encoding="utf-8")
        written += 1
    return written


if __name__ == "__main__":
    n = write_all()
    print(f"wrote {n} entries to {OUT}")
