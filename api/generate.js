/**
 * 本番API: 成果物生成エンドポイント
 *
 * Anthropic Claude APIを使用して、ゲームの成果物を生成します。
 *
 * 環境変数:
 *   ANTHROPIC_API_KEY: Anthropic APIキー（必須）
 *
 * コスト目安:
 *   入力トークン: 約1,000トークン ($0.003)
 *   出力トークン: 約3,000トークン ($0.015)
 *   合計: 約$0.02/回
 */

export default async function handler(req, res) {
  // POSTメソッドのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 環境変数チェック
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[generate] ANTHROPIC_API_KEY が設定されていません');
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'ANTHROPIC_API_KEY が設定されていません。Vercelの環境変数を確認してください。'
    });
  }

  try {
    const { prompt, gameId } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'プロンプトが指定されていません'
      });
    }

    console.log('[generate] 本番API呼び出し開始');
    console.log('[generate] gameId:', gameId);
    console.log('[generate] プロンプト長:', prompt.length, '文字');

    // Anthropic API呼び出し
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',  // 最新のSonnet 4.5モデル
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.json();
      console.error('[generate] Anthropic APIエラー:', errorData);
      return res.status(anthropicResponse.status).json({
        error: 'API error',
        message: errorData.error?.message || 'Anthropic APIでエラーが発生しました',
        details: errorData
      });
    }

    const data = await anthropicResponse.json();

    // レスポンスの構造をログ出力
    console.log('[generate] 成功');
    console.log('[generate] 使用トークン:', {
      input: data.usage?.input_tokens || 0,
      output: data.usage?.output_tokens || 0
    });

    // コスト計算（目安）
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    const estimatedCost = (inputTokens / 1000000 * 3) + (outputTokens / 1000000 * 15);
    console.log('[generate] 推定コスト: $', estimatedCost.toFixed(4));

    // contentフィールドからテキストを抽出
    const content = data.content?.[0]?.text || '';

    if (!content) {
      console.error('[generate] レスポンスにcontentがありません:', data);
      return res.status(500).json({
        error: 'Invalid response',
        message: 'APIからの応答が不正です'
      });
    }

    // クライアントに返すレスポンス
    return res.status(200).json({
      content,
      usage: data.usage,
      model: data.model,
      mockMode: false  // 本番APIであることを示す
    });

  } catch (error) {
    console.error('[generate] エラー:', error);
    console.error('[generate] エラースタック:', error.stack);

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
