const fs = require('fs');
const path = require('path');
const https = require('https');

// 获取今天的日期
function getTodayDate() {
    const now = new Date();
    // 使用北京时间
    const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    return beijingTime.toISOString().split('T')[0];
}

// 调用 Claude API
async function callClaudeAPI(prompt) {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    const requestBody = JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ]
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.anthropic.com',
            port: 443,
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const response = JSON.parse(data);
                    resolve(response.content[0].text);
                } else {
                    reject(new Error(`API error: ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(requestBody);
        req.end();
    });
}

// 生成内容的提示词
function buildPrompt(date) {
    return `你是一个 AI 情报分析师，负责生成每日 AI 领域的情报摘要。

请为 ${date} 生成一份 AI 情报数据，严格按照以下 JSON 格式输出（只输出 JSON，不要其他内容）：

{
    "dailyInsight": {
        "quote": "一句有洞察力的观点（15-30字）",
        "source": "观点来源（如：某某在某某场合说的话）"
    },
    "sections": [
        {
            "title": "AI 方向（模型、应用、趋势）",
            "cards": [
                {
                    "core": "核心观点标题（10-20字）",
                    "summary": "详细摘要（50-100字）",
                    "impact": "影响范围（如：对 AI 开发者、产品经理影响较大）",
                    "source": "openai",
                    "url": "https://openai.com/index/example-article"
                }
                // 共 4 张卡片
            ]
        },
        {
            "title": "创业方向（商业模式 & 融资）",
            "cards": [
                // 共 3-4 张卡片，source 可选：wandian, substack, hackernews
            ]
        },
        {
            "title": "产品 & 政策",
            "cards": [
                // 共 2-3 张卡片，source 可选：arxiv, liangziwei, anthropic
            ]
        },
        {
            "title": "小趋势（给你灵感的部分）",
            "cards": [
                // 共 3-4 张卡片，source 可选：twitter, hackernews, substack
            ]
        },
        {
            "title": "中国动态",
            "cards": [
                // 共 3 张卡片，source 必须是：liangziwei, jiqizhixin, wandian
            ]
        }
    ],
    "wechatTopic": {
        "title": "公众号文章标题",
        "viewpoint": "核心观点",
        "content": "公众号文章正文（300-500字，分段落）"
    }
}

source 字段可选值及对应 URL 格式：
- openai: https://openai.com/index/xxx
- anthropic: https://www.anthropic.com/news/xxx
- google: https://deepmind.google/discover/blog/xxx
- meta: https://ai.meta.com/blog/xxx
- manus: https://manus.im/blog/xxx
- arxiv: https://arxiv.org/abs/xxxx.xxxxx
- hackernews: https://news.ycombinator.com/item?id=xxxxxxxx
- substack: https://www.lennysnewsletter.com/p/xxx
- twitter: https://x.com/xxx/status/xxx
- liangziwei: https://www.qbitai.com/2026/01/xxx
- jiqizhixin: https://www.jiqizhixin.com/articles/xxx
- wandian: https://www.latepost.com/news/dj_detail?id=xxx

要求：
1. 内容要有洞察力，不是简单的新闻罗列
2. 观点要有深度，能给读者启发
3. 每个 section 的卡片数量要符合要求
4. URL 要符合对应 source 的格式
5. 中国动态部分要关注国内 AI 公司和政策

只输出 JSON，不要任何其他文字。`;
}

// 主函数
async function main() {
    const today = getTodayDate();
    const dataDir = path.join(__dirname, '..', 'data');
    const filePath = path.join(dataDir, `${today}.json`);

    // 检查今天的数据是否已存在
    if (fs.existsSync(filePath)) {
        console.log(`Data for ${today} already exists, skipping generation.`);
        return;
    }

    console.log(`Generating content for ${today}...`);

    try {
        const prompt = buildPrompt(today);
        const response = await callClaudeAPI(prompt);

        // 解析 JSON
        let data;
        try {
            // 尝试提取 JSON（处理可能的 markdown 代码块）
            let jsonStr = response;
            if (response.includes('```json')) {
                jsonStr = response.split('```json')[1].split('```')[0];
            } else if (response.includes('```')) {
                jsonStr = response.split('```')[1].split('```')[0];
            }
            data = JSON.parse(jsonStr.trim());
        } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            console.error('Raw response:', response);
            throw parseError;
        }

        // 确保 data 目录存在
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // 写入文件
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        console.log(`Successfully generated ${filePath}`);

    } catch (error) {
        console.error('Error generating content:', error);
        process.exit(1);
    }
}

main();
