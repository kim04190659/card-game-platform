/**
 * api/stats/log.js
 * 統計データをVercel KVに保存するServerless Function
 *
 * POST /api/stats/log
 * Body: { eventType, gameId, accessKey, timestamp, success, error, location }
 */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORSヘッダー設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエスト（プリフライト）の処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POSTリクエストのみ受け付け
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      eventType,
      gameId,
      accessKey,
      timestamp,
      success,
      error,
      location
    } = req.body;

    // バリデーション
    if (!eventType || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields: eventType, timestamp' });
    }

    // 日付文字列取得（YYYY-MM-DD形式）
    const date = timestamp.substring(0, 10);

    // タイムスタンプをUnix時間に変換
    const unixTimestamp = new Date(timestamp).getTime();

    // 1. 個別利用履歴を保存（最新500件まで）
    const historyEntry = {
      timestamp: unixTimestamp,
      eventType,
      gameId,
      accessKey,
      success,
      error: error ? error.message : null,
      location
    };

    await kv.lpush('stats:history', JSON.stringify(historyEntry));

    // リストの長さを500件に制限
    await kv.ltrim('stats:history', 0, 499);

    // 2. 日別統計を更新
    await kv.incr(`stats:daily:${date}`);

    // 3. ゲーム別日別統計を更新
    if (gameId) {
      await kv.incr(`stats:game:${gameId}:${date}`);
    }

    // 4. エラーログを保存（エラーの場合のみ）
    if (error || eventType === 'error') {
      const errorEntry = {
        timestamp: unixTimestamp,
        eventType,
        gameId,
        location,
        error: error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : null
      };

      await kv.lpush(`stats:errors:${date}`, JSON.stringify(errorEntry));

      // エラーログも100件まで
      await kv.ltrim(`stats:errors:${date}`, 0, 99);
    }

    // 5. イベントタイプ別カウント
    await kv.incr(`stats:eventType:${eventType}:${date}`);

    // 6. アクセスキー別統計を更新（最終利用日時を記録）
    if (accessKey) {
      await kv.set(`stats:accessKey:${accessKey}:lastUsed`, unixTimestamp);
      await kv.incr(`stats:accessKey:${accessKey}:count`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to log stats:', error);

    // Vercel KV接続失敗時もエラーを返さない（ゲーム続行を妨げない）
    return res.status(200).json({
      success: false,
      message: 'Stats logging failed, but game can continue'
    });
  }
}
