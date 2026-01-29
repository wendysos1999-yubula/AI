/**
 * AI 情报站 - 卡片网格渲染
 */

const SOURCES = [
    { name: "OpenAI", icon: "🤖", class: "openai", frequency: "每日监控", badge: "官方" },
    { name: "Anthropic", icon: "🧠", class: "anthropic", frequency: "每日监控", badge: "官方" },
    { name: "Google DeepMind", icon: "🔬", class: "google", frequency: "每日监控", badge: "官方" },
    { name: "Meta AI", icon: "Ⓜ️", class: "meta", frequency: "每周监控", badge: "官方" },
    { name: "Manus", icon: "🦾", class: "manus", frequency: "每日监控", badge: "Agent" },
    { name: "arXiv", icon: "📄", class: "arxiv", frequency: "每日热门论文", badge: "学术" },
    { name: "Hacker News", icon: "📰", class: "hackernews", frequency: "每日 AI 热帖", badge: "社区" },
    { name: "Substack", icon: "✉️", class: "substack", frequency: "精选订阅", badge: "深度" },
    { name: "X / Twitter", icon: "𝕏", class: "twitter", frequency: "KOL 动态", badge: "实时" },
    { name: "量子位", icon: "⚛️", class: "liangziwei", frequency: "每日监控", badge: "产业" },
    { name: "机器之心", icon: "🔮", class: "jiqizhixin", frequency: "每日监控", badge: "研究" },
    { name: "晚点LatePost", icon: "🌙", class: "wandian", frequency: "深度报道", badge: "商业" }
];

// AI 发展历史时间线数据 - 分为 ChatGPT 前后两部分
const AI_TIMELINE_EXPLORE = [
    { date: "1956", title: "达特茅斯会议", desc: "人工智能作为学科正式诞生", major: true, progress: 5 },
    { date: "1966", title: "ELIZA 聊天机器人", desc: "首个自然语言处理程序", major: false, progress: 8 },
    { date: "1997", title: "深蓝击败卡斯帕罗夫", desc: "AI 首次在国际象棋击败世界冠军", major: true, progress: 15 },
    { date: "2006", title: "深度学习复兴", desc: "Hinton 提出深度信念网络", major: true, progress: 20 },
    { date: "2012", title: "AlexNet 突破", desc: "深度学习在 ImageNet 大放异彩", major: true, progress: 30 },
    { date: "2014", title: "GAN 生成对抗网络", desc: "Goodfellow 提出革命性生成模型", major: true, progress: 35 },
    { date: "2016", title: "AlphaGo 击败李世石", desc: "AI 攻克围棋，震惊世界", major: true, progress: 45 },
    { date: "2017", title: "Transformer 架构", desc: "Attention Is All You Need 论文发布", major: true, progress: 50 },
    { date: "2018", title: "BERT 预训练模型", desc: "NLP 进入预训练时代", major: false, progress: 55 },
    { date: "2020", title: "GPT-3 发布", desc: "1750 亿参数，涌现能力初现", major: true, progress: 65 },
    { date: "2022.11", title: "ChatGPT 发布", desc: "AI 进入大众视野，改变世界", major: true, progress: 80 }
];

const AI_TIMELINE_BOOM = [
    { date: "2023.01", title: "ChatGPT 用户破亿", desc: "史上最快达到 1 亿用户的应用", major: false, progress: 82 },
    { date: "2023.03", title: "GPT-4 发布", desc: "多模态能力，通过律师考试", major: true, progress: 85 },
    { date: "2023.07", title: "Claude 2 发布", desc: "Anthropic 推出安全导向大模型", major: false, progress: 87 },
    { date: "2023.11", title: "GPT-4 Turbo", desc: "128K 上下文，成本降低 3 倍", major: false, progress: 88 },
    { date: "2024.02", title: "Sora 视频生成", desc: "OpenAI 展示惊艳视频生成能力", major: true, progress: 90 },
    { date: "2024.03", title: "Claude 3 Opus", desc: "首次在多项基准超越 GPT-4", major: true, progress: 91 },
    { date: "2024.05", title: "GPT-4o 发布", desc: "原生多模态，实时语音交互", major: true, progress: 92 },
    { date: "2024.06", title: "Claude 3.5 Sonnet", desc: "性价比之王，开发者首选", major: false, progress: 93 },
    { date: "2024.09", title: "o1 推理模型", desc: "OpenAI 推出深度推理模型", major: true, progress: 94 },
    { date: "2024.12", title: "Gemini 2.0", desc: "Google 发布原生多模态模型", major: false, progress: 95 },
    { date: "2025.01", title: "DeepSeek R1", desc: "中国开源推理模型震惊业界", major: true, progress: 96 },
    { date: "2025.02", title: "Claude 3.5 升级", desc: "Computer Use 能力开放", major: false, progress: 96.5 },
    { date: "2025.05", title: "GPT-5 发布", desc: "AGI 能力边界再次突破", major: true, progress: 97 },
    { date: "2025.08", title: "Llama 4 开源", desc: "Meta 开源最强模型", major: false, progress: 97.5 },
    { date: "2026.01", title: "AI Agent 元年", desc: "自主 Agent 开始大规模商用", major: true, progress: 98 }
];

// 数据缓存
const dataCache = {};

// 数据起始日期
const DATA_START_DATE = "2026-01-01";

// 使用外部加载的 ALL_DATA 作为备用数据（在 data.js 中定义）

const App = {
    currentDate: "2026-01-29",

    init() {
        this.bindEvents();
        this.loadData(this.currentDate);
        this.updateDateDisplay();
        this.renderSources();
        this.renderTimeline();
    },

    bindEvents() {
        document.getElementById('prev-day').addEventListener('click', () => this.changeDate(-1));
        document.getElementById('next-day').addEventListener('click', () => this.changeDate(1));

        // 日期选择器
        const datePicker = document.getElementById('date-picker');
        if (datePicker) {
            datePicker.value = this.currentDate;
            datePicker.addEventListener('change', (e) => {
                const selectedDate = e.target.value;
                if (selectedDate >= DATA_START_DATE && selectedDate <= new Date().toISOString().split('T')[0]) {
                    this.currentDate = selectedDate;
                    this.updateDateDisplay();
                    this.loadData(this.currentDate);
                }
            });
        }

        // 模态框关闭
        document.getElementById('close-article-modal').addEventListener('click', () => this.closeModal('article-modal'));
        document.getElementById('close-cards-modal').addEventListener('click', () => this.closeModal('cards-modal'));

        // 复制文章
        document.getElementById('copy-article').addEventListener('click', () => this.copyArticle());

        // 下载图片
        document.getElementById('download-all-cards').addEventListener('click', () => this.downloadAllCards());

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.changeDate(-1);
            if (e.key === 'ArrowRight') this.changeDate(1);
        });
    },

    changeDate(delta) {
        const date = new Date(this.currentDate);
        date.setDate(date.getDate() + delta);
        const newDate = date.toISOString().split('T')[0];

        // 检查是否在有效范围内
        if (newDate < DATA_START_DATE) {
            return; // 不能早于数据起始日期
        }

        const today = new Date().toISOString().split('T')[0];
        if (newDate > today) {
            return; // 不能晚于今天
        }

        this.currentDate = newDate;
        this.updateDateDisplay();
        this.loadData(this.currentDate);
    },

    updateDateDisplay() {
        document.getElementById('current-date').textContent = this.currentDate;

        // 更新日期选择器的值
        const datePicker = document.getElementById('date-picker');
        if (datePicker) {
            datePicker.value = this.currentDate;
        }

        // 更新按钮状态
        const prevBtn = document.getElementById('prev-day');
        const nextBtn = document.getElementById('next-day');
        const today = new Date().toISOString().split('T')[0];

        prevBtn.disabled = this.currentDate <= DATA_START_DATE;
        nextBtn.disabled = this.currentDate >= today;
    },

    async loadData(date) {
        const container = document.getElementById('content-container');
        const emptyState = document.getElementById('empty-state');

        // 显示加载状态
        container.innerHTML = '<div class="loading-state">加载中...</div>';
        container.style.display = 'block';
        emptyState.style.display = 'none';

        try {
            let data;

            // 检查缓存
            if (dataCache[date]) {
                data = dataCache[date];
            } else {
                // 尝试从外部 JSON 文件加载
                try {
                    const response = await fetch(`data/${date}.json`);
                    if (response.ok) {
                        data = await response.json();
                        dataCache[date] = data;
                    }
                } catch (fetchError) {
                    // fetch 失败（可能是 file:// 协议），使用备用数据
                    console.log('使用内嵌备用数据');
                }

                // 如果 fetch 失败，尝试使用备用数据（ALL_DATA 在 data.js 中定义）
                if (!data && typeof ALL_DATA !== 'undefined' && ALL_DATA[date]) {
                    data = ALL_DATA[date];
                    dataCache[date] = data;
                }
            }

            if (data) {
                let html = '';
                html += this.renderInsight(data.dailyInsight);
                html += this.renderSections(data.sections);
                html += this.renderWechatTopic(data.wechatTopic);
                container.innerHTML = html;
                container.style.display = 'block';
                emptyState.style.display = 'none';
                this.bindGenerateButtons();
            } else {
                container.style.display = 'none';
                emptyState.style.display = 'block';
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            container.style.display = 'none';
            emptyState.style.display = 'block';
        }
    },

    renderInsight(insight) {
        return `
            <div class="daily-insight">
                <div class="insight-quote">"${insight.quote}"</div>
                <div class="insight-source">—— ${insight.source}</div>
            </div>
        `;
    },

    renderSections(sections) {
        return sections.map(section => this.renderSection(section)).join('');
    },

    renderSection(section) {
        const cardsHtml = section.cards.map(c => this.renderCard(c)).join('');
        return `
            <div class="section">
                <h2 class="section-title">${section.title}</h2>
                <div class="cards-grid">${cardsHtml}</div>
            </div>
        `;
    },

    renderCard(card) {
        // 来源图标映射
        const sourceIcons = {
            openai: '🤖',
            anthropic: '🧠',
            google: '🔬',
            meta: 'Ⓜ️',
            manus: '🦾',
            arxiv: '📄',
            hackernews: '📰',
            substack: '✉️',
            twitter: '𝕏',
            liangziwei: '⚛️',
            jiqizhixin: '🔮',
            wandian: '🌙'
        };

        const sourceNames = {
            openai: 'OpenAI',
            anthropic: 'Anthropic',
            google: 'DeepMind',
            meta: 'Meta AI',
            manus: 'Manus',
            arxiv: 'arXiv',
            hackernews: 'HN',
            substack: 'Substack',
            twitter: 'X',
            liangziwei: '量子位',
            jiqizhixin: '机器之心',
            wandian: '晚点'
        };

        const source = card.source || 'hackernews';
        const icon = sourceIcons[source] || '📰';
        const name = sourceNames[source] || '来源';

        return `
            <div class="card">
                <div class="card-source">
                    <span class="card-source-icon ${source}">${icon}</span>
                    <span class="card-source-name">${name}</span>
                </div>
                <div class="card-core">${card.core}</div>
                <div class="card-summary">${card.summary}</div>
                <div class="card-impact">${card.impact}</div>
                <a href="${card.url}" target="_blank" class="card-link">查看原文 →</a>
            </div>
        `;
    },

    renderWechatTopic(topic) {
        const contentHtml = topic.content.replace(/\n/g, '<br>');
        return `
            <div class="wechat-topic">
                <h2 class="section-title">公众号选题建议</h2>
                <div class="wechat-card">
                    <div class="wechat-title">${topic.title}</div>
                    <div class="wechat-viewpoint">${topic.viewpoint}</div>
                    <div class="wechat-content">${contentHtml}</div>
                    <div class="wechat-actions">
                        <button class="btn-generate primary" id="btn-gen-article">生成公众号文章</button>
                        <button class="btn-generate secondary" id="btn-gen-xhs">生成小红书图文</button>
                    </div>
                </div>
            </div>
        `;
    },

    renderSources() {
        const grid = document.getElementById('sources-grid');
        grid.innerHTML = SOURCES.map(s => `
            <div class="source-item">
                <div class="source-icon ${s.class}">${s.icon}</div>
                <div class="source-info">
                    <div class="source-name">${s.name}</div>
                    <div class="source-frequency">${s.frequency}</div>
                </div>
                <span class="source-badge">${s.badge}</span>
            </div>
        `).join('');
    },

    renderTimeline() {
        this.currentPeriod = 'explore';
        this.currentBoomYear = '2023';

        // 绑定标签切换事件
        document.querySelectorAll('.timeline-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const period = e.currentTarget.dataset.period;
                this.switchTimelinePeriod(period);
            });
        });

        // 绑定年份选择事件
        document.querySelectorAll('.year-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const year = e.currentTarget.dataset.year;
                this.switchBoomYear(year);
            });
        });

        // 初始渲染探索期
        this.renderTimelineData('explore');
    },

    switchTimelinePeriod(period) {
        this.currentPeriod = period;

        // 更新标签状态
        document.querySelectorAll('.timeline-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.period === period);
        });

        // 隐藏年份选择器（不再使用）
        const yearSelector = document.getElementById('year-selector');
        if (yearSelector) {
            yearSelector.style.display = 'none';
        }

        // 渲染对应数据
        this.renderTimelineData(period);
    },

    switchBoomYear(year) {
        // 已弃用 - 爆发期现在使用连续曲线
    },

    renderTimelineData(period) {
        const wrapper = document.getElementById('timeline-wrapper');
        const yearsContainer = document.getElementById('timeline-years');

        if (!wrapper || !yearsContainer) return;

        let timelineData, startYear, endYear, yearMarks;

        if (period === 'explore') {
            // 探索期: 1956-2022
            timelineData = AI_TIMELINE_EXPLORE;
            startYear = 1956;
            endYear = 2022;
            yearMarks = [1960, 1980, 2000, 2010, 2020, 2022];
        } else {
            // 爆发期: 2023-2026 连续曲线
            timelineData = AI_TIMELINE_BOOM;
            startYear = 2023;
            endYear = 2026.5;
            yearMarks = [2023, 2024, 2025, 2026];
        }

        const totalRange = endYear - startYear;
        const wrapperWidth = 1120;

        // 渲染年份标记
        yearsContainer.innerHTML = yearMarks.map(year => {
            const pos = ((year - startYear) / totalRange) * 100;
            return `<span class="timeline-year" style="position: absolute; left: ${pos}%">${year}</span>`;
        }).join('');

        // 渲染事件节点
        let eventsHtml = '';
        timelineData.forEach(event => {
            let pos;
            if (period === 'explore') {
                const year = parseFloat(event.date);
                pos = ((year - startYear) / totalRange) * 100;
            } else {
                // 爆发期：解析 "2023.01" 格式
                const parts = event.date.split('.');
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]);
                const dateValue = year + (month - 1) / 12;
                pos = ((dateValue - startYear) / totalRange) * 100;
            }
            const majorClass = event.major ? 'major' : '';

            eventsHtml += `
                <div class="timeline-event ${majorClass}" style="left: ${pos}%">
                    <div class="event-dot"></div>
                    <div class="event-card">
                        <div class="event-date">${event.date}</div>
                        <div class="event-title">${event.title}</div>
                        <div class="event-desc">${event.desc}</div>
                    </div>
                </div>
            `;
        });

        // 清除旧节点并添加新节点
        const existingEvents = wrapper.querySelectorAll('.timeline-event');
        existingEvents.forEach(el => el.remove());
        wrapper.insertAdjacentHTML('beforeend', eventsHtml);

        // 绘制曲线
        this.drawTimelineCurve(wrapperWidth, startYear, endYear, timelineData, period);
    },

    drawTimelineCurve(width, startYear, endYear, data, period) {
        const curvePath = document.getElementById('curve-path');
        const curveArea = document.getElementById('curve-area');

        if (!curvePath || !curveArea) return;

        const totalRange = endYear - startYear;
        const height = 250;
        const baseY = height;

        // 生成曲线点
        let points = [];

        data.forEach(event => {
            let dateValue;
            if (period === 'explore') {
                dateValue = parseFloat(event.date);
            } else {
                // 爆发期：解析 "2023.01" 格式
                const parts = event.date.split('.');
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]);
                dateValue = year + (month - 1) / 12;
            }
            const x = ((dateValue - startYear) / totalRange) * width;
            const y = baseY - (event.progress / 100) * (height - 20);
            points.push({ x, y });
        });

        if (points.length < 2) {
            curvePath.setAttribute('d', '');
            curveArea.setAttribute('d', '');
            return;
        }

        // 生成平滑曲线路径
        let pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx = (prev.x + curr.x) / 2;
            pathD += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
        }

        // 生成填充区域路径
        let areaD = pathD + ` L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;

        curvePath.setAttribute('d', pathD);
        curveArea.setAttribute('d', areaD);
    },

    bindGenerateButtons() {
        const btnArticle = document.getElementById('btn-gen-article');
        const btnXhs = document.getElementById('btn-gen-xhs');
        if (btnArticle) {
            btnArticle.addEventListener('click', () => this.generateArticle());
        }
        if (btnXhs) {
            btnXhs.addEventListener('click', () => this.generateXhsCards());
        }
    },

    openModal(id) {
        document.getElementById(id).classList.add('active');
    },

    closeModal(id) {
        document.getElementById(id).classList.remove('active');
    },

    copyArticle() {
        const content = document.getElementById('article-content').innerText;
        navigator.clipboard.writeText(content).then(() => {
            alert('文章已复制到剪贴板');
        });
    },

    async generateArticle() {
        const data = dataCache[this.currentDate];
        if (!data) return;

        const allCards = data.sections.flatMap(s => s.cards);
        const cardCount = allCards.length;

        let article = this.buildArticleHtml(data, allCards, cardCount);

        document.getElementById('article-content').innerHTML = article;
        this.openModal('article-modal');
    },

    buildArticleHtml(data, allCards, cardCount) {
        const topic = data.wechatTopic;
        let html = '<div class="article-content">';

        // 标题
        html += `<h1>${topic.title}</h1>`;

        // 开头（300字以内）
        html += `<p>每天关于 AI 的信息很多，但真正值得花时间理解的并不多。</p>`;
        html += `<p>这不是新闻汇总，也不是行业报告。这是我作为一个长期 AI 观察者，对「今天有什么变化值得你更新认知」的回答。</p>`;
        html += `<p>以下内容经过筛选和思考。如果你今天只有 10 分钟了解 AI，这些是我认为最重要的。</p>`;

        // 正文：重新组织，不逐条照抄
        html += `<h2>今天的核心变化</h2>`;
        html += `<p><strong>${topic.viewpoint}</strong></p>`;
        html += `<p>${topic.content.split('\n\n').slice(0, 3).join('</p><p>')}</p>`;

        // 值得关注的信号
        html += `<h2>值得关注的信号</h2>`;
        const keyCards = allCards.slice(0, 4);
        keyCards.forEach(card => {
            html += `<p><strong>${card.core}</strong>——${card.summary}</p>`;
        });

        // 趋势洞察
        html += `<h2>对普通人意味着什么</h2>`;
        html += `<p>${topic.content.split('\n\n').slice(3).join('</p><p>')}</p>`;

        // 结尾
        html += `<h2>写在最后</h2>`;
        html += `<p>重要的不是你看了多少 AI 新闻，而是哪些信息真正改变了你的判断。</p>`;
        html += `<p>明天见。</p>`;
        html += '</div>';

        return html;
    },

    generateXhsCards() {
        const data = dataCache[this.currentDate];
        if (!data) return;

        const allCards = data.sections.flatMap(s => s.cards);
        const container = document.getElementById('xhs-cards-container');

        // 只生成 3-6 张精选卡片
        const selectedCards = this.selectXhsCards(allCards, data);

        let html = '';
        selectedCards.forEach((card, i) => {
            html += this.renderXhsCard(card, i + 1, selectedCards.length);
        });

        container.innerHTML = html;
        this.openModal('cards-modal');
    },

    selectXhsCards(allCards, data) {
        // 精选 3-6 张，提炼金句
        const xhsCards = [
            {
                headline: "今日 AI 洞察",
                quote: data.dailyInsight.quote,
                tip: "保持好奇，持续学习"
            }
        ];

        // 从卡片中提炼金句
        const topCards = allCards.slice(0, 4);
        topCards.forEach(card => {
            xhsCards.push({
                headline: this.extractHeadline(card.core),
                quote: this.createQuote(card),
                tip: this.createTip(card)
            });
        });

        // 结尾卡片
        xhsCards.push({
            headline: "今日小结",
            quote: data.wechatTopic.viewpoint,
            tip: "关注 AI 情报站，每日更新"
        });

        return xhsCards.slice(0, 6);
    },

    extractHeadline(core) {
        // 提取简短标题
        if (core.includes("：")) return core.split("：")[0];
        if (core.includes("，")) return core.split("，")[0];
        return core.slice(0, 15);
    },

    createQuote(card) {
        // 创造金句
        const core = card.core;
        if (core.length <= 30) return core;
        return core.slice(0, 30) + "...";
    },

    createTip(card) {
        // 生成普通人指导
        const impact = card.impact;
        if (impact.includes("创业者")) return "创业者需要关注这个方向";
        if (impact.includes("产品")) return "产品思维正在被重新定义";
        if (impact.includes("普通用户")) return "这会改变你使用 AI 的方式";
        return "值得持续关注的趋势";
    },

    renderXhsCard(card, index, total) {
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
        ];
        const bg = gradients[(index - 1) % gradients.length];

        return `
            <div class="xhs-card" id="xhs-card-${index}" style="background: ${bg}">
                <div class="xhs-card-header">
                    <span class="xhs-card-number">${index}/${total}</span>
                    <span class="xhs-card-headline">${card.headline}</span>
                </div>
                <div class="xhs-card-quote">"${card.quote}"</div>
                <div class="xhs-card-tip">${card.tip}</div>
                <div class="xhs-card-footer">AI 情报站 · ${this.currentDate}</div>
            </div>
        `;
    },

    async downloadAllCards() {
        const data = dataCache[this.currentDate];
        if (!data) return;

        const allCards = data.sections.flatMap(s => s.cards);
        const btn = document.getElementById('download-all-cards');
        btn.textContent = '正在生成...';
        btn.disabled = true;

        for (let i = 1; i <= allCards.length; i++) {
            await this.downloadCard(i);
        }

        btn.textContent = '下载全部图片';
        btn.disabled = false;
    },

    async downloadCard(index) {
        const card = document.getElementById(`xhs-card-${index}`);
        if (!card) return;

        const canvas = await html2canvas(card, {
            scale: 2,
            backgroundColor: null
        });

        const link = document.createElement('a');
        link.download = `ai-card-${this.currentDate}-${index}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        await new Promise(r => setTimeout(r, 300));
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
