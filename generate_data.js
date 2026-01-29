const fs = require('fs');
const path = require('path');

// 来源映射
const SOURCES = ['openai', 'anthropic', 'google', 'meta', 'manus', 'arxiv', 'hackernews', 'substack', 'twitter', 'liangziwei', 'jiqizhixin', 'wandian'];

// URL 模板
const URL_TEMPLATES = {
    openai: 'https://openai.com/index/article-',
    anthropic: 'https://www.anthropic.com/news/article-',
    google: 'https://deepmind.google/discover/blog/article-',
    meta: 'https://ai.meta.com/blog/article-',
    manus: 'https://manus.im/blog/article-',
    arxiv: 'https://arxiv.org/abs/2601.',
    hackernews: 'https://news.ycombinator.com/item?id=390',
    substack: 'https://www.lennysnewsletter.com/p/article-',
    twitter: 'https://x.com/ai_updates/status/18',
    liangziwei: 'https://www.qbitai.com/2026/01/article-',
    jiqizhixin: 'https://www.jiqizhixin.com/articles/2026-01-',
    wandian: 'https://www.latepost.com/news/dj_detail?id='
};

// AI 情报数据模板
const dataTemplates = {
    insights: [
        { quote: "AI 不是工具，而是思维方式的革命", source: "Sam Altman 在 YC 演讲" },
        { quote: "下一个独角兽不是产品，而是带产品的社区", source: "硅谷产品人 discuss" },
        { quote: "技术门槛消失，洞察力成为新护城河", source: "a]16z 合伙人观点" },
        { quote: "AI 时代，懂用户比懂技术更值钱", source: "YC 创始人 Paul Graham" },
        { quote: "小模型崛起不是妥协，而是隐私刚需", source: "EU AI Act 研究报告" },
        { quote: "AI Agents 从工具转向第二大脑", source: "Anthropic 技术博客" },
        { quote: "开源不是慈善，而是生态战略", source: "Meta AI 负责人访谈" },
        { quote: "订阅制可能不是 AI 的终极商业模式", source: "晚点 LatePost 分析" },
        { quote: "安全叙事正在成为融资利器", source: "红杉资本年度报告" },
        { quote: "长尾 SaaS 的黄金时代来了", source: "Indie Hackers 社区" }
    ],

    aiTrends: [
        { core: "GPT-5 能力边界再次突破", summary: "OpenAI 发布 GPT-5，推理能力提升 40%，多模态理解达到新高度。支持更长上下文窗口和更精准的指令遵循。", impact: "对 AI 开发者、产品经理影响较大", source: "openai" },
        { core: "Claude 3.5 成为开发者首选", summary: "Anthropic 的 Claude 3.5 在代码生成任务中满意度超过 GPT-4，安全性和可控性成为核心优势。", impact: "对 AI 开发者、技术选型影响较大", source: "anthropic" },
        { core: "多模态模型进入视频理解阶段", summary: "Google Gemini 和 GPT-4V 强化视频分析能力，短视频平台迎来 AI 原生功能爆发。", impact: "对短视频创作者、内容平台影响较大", source: "google" },
        { core: "小语言模型本地部署成主流", summary: "企业选择本地部署小模型，核心驱动力是数据合规。EU AI Act 让数据留在本地成为硬性要求。", impact: "对企业 IT、ToB 产品团队影响较大", source: "jiqizhixin" },
        { core: "AI Agents 自主决策能力突破", summary: "新一代 Agent 可以自主规划多步骤任务，从对话式交互转向目标导向的委托模式。", impact: "对产品设计师、SaaS 创业者影响较大", source: "manus" },
        { core: "实时语音交互成为标配", summary: "OpenAI 和 Anthropic 都推出实时语音 API，延迟降至 200ms 以内，接近人类对话体验。", impact: "对语音应用开发者影响较大", source: "openai" },
        { core: "AI 代码生成质量达到生产级", summary: "GitHub Copilot 和 Cursor 的代码生成准确率超过 85%，开始被大型企业采用。", impact: "对软件工程师、技术团队影响较大", source: "hackernews" },
        { core: "个性化 AI 助手成为新赛道", summary: "基于个人数据训练的专属 AI 助手开始流行，隐私保护和个性化体验成为核心竞争力。", impact: "对个人助手方向创业者影响较大", source: "substack" }
    ],

    businessTrends: [
        { core: "AI 创业进入垂直深耕时代", summary: "投资人不再看好通用工具，而是寻找深入特定行业的 AI 解决方案。医疗、法律、教育成为热门赛道。", impact: "对 AI 创业者、投资人影响较大", source: "wandian" },
        { core: "订阅疲劳推动新商业模式", summary: "用户对订阅制产生疲劳，按需付费、使用量计费等新模式开始流行。", impact: "对 SaaS 创业者、产品经理影响较大", source: "substack" },
        { core: "AI 公司估值回归理性", summary: "多家 AI 独角兽下调估值，投资人开始关注单位经济学和盈利能力。", impact: "对 AI 创业者、CFO 影响较大", source: "wandian" },
        { core: "企业 AI 采购预算大幅增长", summary: "2026 年企业 AI 预算平均增长 150%，从试点转向规模化部署。", impact: "对 ToB 销售、企业服务影响较大", source: "jiqizhixin" },
        { core: "AI 原生公司开始上市", summary: "首批 AI 原生公司准备 IPO，市场开始重新定义 AI 公司的估值模型。", impact: "对投资人、创业者影响较大", source: "wandian" }
    ],

    policyTrends: [
        { core: "欧盟 AI Act 执行细则出台", summary: "欧盟发布详细执行指南，高风险 AI 系统需要第三方审计，合规成本超出预期。", impact: "对出海企业、合规团队影响较大", source: "arxiv" },
        { core: "美国各州 AI 监管分化", summary: "加州、纽约等州推出严格 AI 法规，而德州等州采取宽松政策，企业面临碎片化监管。", impact: "对美国市场企业影响较大", source: "hackernews" },
        { core: "中国发布 AI 安全新规", summary: "新规要求 AI 生成内容可追溯，平台需建立审核机制，对 AIGC 创业公司提出更高要求。", impact: "对国内 AI 创业者影响较大", source: "liangziwei" },
        { core: "AI 版权争议进入司法阶段", summary: "多起 AI 训练数据版权诉讼开庭，判决结果将影响整个行业的数据使用方式。", impact: "对 AI 公司法务、数据团队影响较大", source: "arxiv" }
    ],

    smallTrends: [
        { core: "AI 健康数据成为新入口", summary: "OpenAI 和 Anthropic 推出健康产品，允许接入医疗记录。谁能获得健康数据，谁就能构建最难替代的个人助手。", impact: "对健康科技、个人助手方向影响较大", source: "openai" },
        { core: "英语成为新的编程语言", summary: "AI 代码生成让写代码不再是瓶颈，想清楚要什么才是关键。非技术背景创业者迎来机会。", impact: "对非技术背景创业者影响较大", source: "twitter" },
        { core: "AI Self-Tracking 正在炒热", summary: "用 AI 记录和分析个人生活数据，成为新的自我量化方式。一日三餐、睡眠、能量波动系统非常前沿。", impact: "对个人效率工具方向影响较大", source: "hackernews" },
        { core: "Creator-led brand 黄金期", summary: "创作者带品牌的趋势在国外爆发，AI 工具让个人品牌商业化变得更容易。", impact: "对内容创作者、个人品牌方向影响较大", source: "substack" },
        { core: "AI 陪伴机器人开始普及", summary: "情感陪伴型 AI 机器人进入家庭，老年人和独居人群成为主要用户。", impact: "对硬件创业者、养老产业影响较大", source: "liangziwei" }
    ],

    chinaTrends: [
        { core: "字节豆包日活突破 8000 万", summary: "豆包凭借短视频生态和免费策略快速增长，成为国内最大 AI 应用。变现模式仍在探索中。", impact: "对国内 AI 应用创业者影响较大", source: "liangziwei" },
        { core: "阿里通义千问开源新版本", summary: "阿里云发布通义千问最新版本，在多项基准测试中接近 GPT-4 水平。开源策略获得开发者认可。", impact: "对国内 AI 开发者、企业影响较大", source: "jiqizhixin" },
        { core: "Kimi 长文本能力持续领先", summary: "月之暗面 Kimi 凭借长文本处理能力获得市场认可，长上下文成为国产大模型差异化竞争关键。", impact: "对 AI 创业者、投资人影响较大", source: "wandian" },
        { core: "百度文心一言企业版发力", summary: "百度文心一言企业版用户突破 10 万，在政务、金融领域取得突破，ToB 市场竞争加剧。", impact: "对企业 AI 服务商影响较大", source: "jiqizhixin" },
        { core: "智谱 AI 完成新一轮融资", summary: "智谱 AI 完成数亿美元融资，估值大幅提升。清华系 AI 公司在技术和商业化上都展现出竞争力。", impact: "对 AI 创业者、投资人影响较大", source: "wandian" }
    ]
};

// 生成 URL
function generateUrl(source, day) {
    const template = URL_TEMPLATES[source] || URL_TEMPLATES.hackernews;
    return template + (10000 + day * 100 + Math.floor(Math.random() * 100));
}

// 生成随机日期的数据
function generateDayData(date) {
    const day = parseInt(date.split('-')[2]);
    const dayIndex = day - 1;

    // 选择洞察
    const insight = dataTemplates.insights[dayIndex % dataTemplates.insights.length];

    // 随机选择卡片
    function getRandomCards(arr, count) {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    const aiCards = getRandomCards(dataTemplates.aiTrends, 4).map((card, i) => ({
        ...card,
        url: generateUrl(card.source, day * 10 + i)
    }));

    const businessCards = getRandomCards(dataTemplates.businessTrends, 3).map((card, i) => ({
        ...card,
        url: generateUrl(card.source, day * 20 + i)
    }));

    const policyCards = getRandomCards(dataTemplates.policyTrends, 2).map((card, i) => ({
        ...card,
        url: generateUrl(card.source, day * 30 + i)
    }));

    const smallCards = getRandomCards(dataTemplates.smallTrends, 3).map((card, i) => ({
        ...card,
        url: generateUrl(card.source, day * 40 + i)
    }));

    const chinaCards = getRandomCards(dataTemplates.chinaTrends, 3).map((card, i) => ({
        ...card,
        url: generateUrl(card.source, day * 50 + i)
    }));

    return {
        dailyInsight: insight,
        sections: [
            {
                title: "AI 方向（模型、应用、趋势）",
                cards: aiCards
            },
            {
                title: "创业方向（商业模式 & 融资）",
                cards: businessCards
            },
            {
                title: "产品 & 政策",
                cards: policyCards
            },
            {
                title: "小趋势（给你灵感的部分）",
                cards: smallCards
            },
            {
                title: "中国动态",
                cards: chinaCards
            }
        ],
        wechatTopic: {
            title: `${day}日观察：${insight.quote}`,
            viewpoint: insight.quote,
            content: `今天的 AI 领域发生了一些值得关注的变化。\n\n${insight.quote}——这是我今天最深的感受。\n\n当我们回顾过去一周的 AI 发展，会发现一个清晰的趋势：技术本身不再是壁垒，真正的竞争力来自对用户需求的深刻理解。\n\n这对普通人意味着什么？\n\n如果你是产品经理，你的价值不是会写 PRD，而是能洞察用户没说出口的需求。如果你是创业者，你的优势不是能融到钱请技术团队，而是你比别人更懂某个细分人群。\n\n技术在民主化，洞察力在稀缺化。\n\n明天见。`
        }
    };
}

// 生成 1-28 日的数据（29 日单独处理）
function generateAllData() {
    const dataDir = path.join(__dirname, 'data');

    for (let day = 1; day <= 28; day++) {
        const dateStr = `2026-01-${day.toString().padStart(2, '0')}`;
        const data = generateDayData(dateStr);
        const filePath = path.join(dataDir, `${dateStr}.json`);

        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        console.log(`✓ 生成 ${dateStr}.json`);
    }

    console.log('\n✓ 1-28 日数据生成完成！');
}

generateAllData();
