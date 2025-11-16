const { Anthropic } = require('@anthropic-ai/sdk');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'プロンプトが必要です' });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0].text;

    return res.status(200).json({
      success: true,
      content: content
    });

  } catch (error) {
    console.error('評価API呼び出しエラー:', error);
    
    if (error.status === 401) {
      return res.status(401).json({ error: 'API認証エラー' });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ error: 'レート制限に達しました' });
    }
    
    return res.status(500).json({ 
      error: '内部サーバーエラーが発生しました',
      details: error.message 
    });
  }
};
