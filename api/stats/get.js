/**
 * api/stats/get.js
 * 統計データをVercel KVから取得して集計するServerless Function
 *
 * GET /api/stats/get?password=admin-password-2024
 */

import { kv } from '@vercel/kv';

const ADMIN_PASSWORD = 'admin-password-2024';

export default async function handler(req, res) {
  // CORSヘッダー設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエスト（プリフライト）の処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GETリクエストのみ受け付け
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // パスワード認証
  const { password } = req.query;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 現在日時
    const now = new Date();
    const today = formatDate(now);
    const todayUnix = now.getTime();

    // 1週間前、1ヶ月前の日付
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 【1】概要サマリー
    const summary = await getSummary(today, oneWeekAgo, oneMonthAgo);

    // 【2】ゲーム別統計
    const gameStats = await getGameStats(today, oneMonthAgo);

    // 【3】時系列推移（過去30日間）
    const timeSeries = await getTimeSeries(oneMonthAgo, today);

    // 【4】アクセスキー別統計
    const accessKeyStats = await getAccessKeyStats();

    // 【5】エラーログ（最新10件）
    const errorLogs = await getErrorLogs(10);

    // 【6】詳細データ（最新50件の利用履歴）
    const history = await getHistory(50);

    return res.status(200).json({
      summary,
      gameStats,
      timeSeries,
      accessKeyStats,
      errorLogs,
      history,
      timestamp: todayUnix
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    return res.status(500).json({
      error: 'Failed to retrieve stats',
      message: error.message
    });
  }
}

/**
 * 日付をYYYY-MM-DD形式にフォーマット
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 概要サマリーを取得
 */
async function getSummary(today, oneWeekAgo, oneMonthAgo) {
  try {
    // 並列クエリ実行で高速化
    const [todayCount, totalCount, ...dailyCounts] = await Promise.all([
      kv.get(`stats:daily:${today}`),
      kv.llen('stats:history'),
      // 過去30日分を並列取得
      ...Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = formatDate(date);
        return kv.get(`stats:daily:${dateStr}`);
      })
    ]);

    // 週（過去7日）と月（過去30日）の合計を計算
    const weekCount = dailyCounts.slice(0, 7).reduce((sum, count) => {
      return sum + (Number(count) || 0);
    }, 0);

    const monthCount = dailyCounts.reduce((sum, count) => {
      return sum + (Number(count) || 0);
    }, 0);

    return {
      total: Number(totalCount) || 0,
      today: Number(todayCount) || 0,
      week: weekCount,
      month: monthCount
    };
  } catch (error) {
    console.error('getSummary error:', error);
    // エラーでも空のデータを返す
    return {
      total: 0,
      today: 0,
      week: 0,
      month: 0
    };
  }
}

/**
 * ゲーム別統計を取得
 */
async function getGameStats(today, oneMonthAgo) {
  try {
    const gameIds = [
      'city-dx',
      'robot-solution',
      'it-operations-excellence',
      'it-security-solution',
      'convenience-store-dx',
      'mobile-carrier-dx'
    ];

    const gameNames = {
      'city-dx': '自治体DX推進',
      'robot-solution': 'ロボットソリューション',
      'it-operations-excellence': 'IT運用エクセレンス',
      'it-security-solution': 'ITセキュリティ',
      'convenience-store-dx': 'コンビニDX',
      'mobile-carrier-dx': '携帯キャリアDX'
    };

    // 全ゲーム×30日分のクエリを並列実行
    const allQueries = gameIds.flatMap(gameId =>
      Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = formatDate(date);
        return { gameId, promise: kv.get(`stats:game:${gameId}:${dateStr}`) };
      })
    );

    const results = await Promise.all(allQueries.map(q => q.promise));

    // ゲームごとに集計
    const stats = gameIds.map((gameId, gameIndex) => {
      const startIndex = gameIndex * 30;
      const counts = results.slice(startIndex, startIndex + 30);
      const count = counts.reduce((sum, c) => sum + (Number(c) || 0), 0);

      return {
        gameId,
        gameName: gameNames[gameId],
        count
      };
    });

    // カウントの降順でソート
    stats.sort((a, b) => b.count - a.count);

    return stats;
  } catch (error) {
    console.error('getGameStats error:', error);
    // エラーでも空のデータを返す
    return [];
  }
}

/**
 * 時系列推移を取得（過去30日間）
 */
async function getTimeSeries(startDate, endDate) {
  try {
    // 30日分のクエリを並列実行
    const dateQueries = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
      const dateStr = formatDate(date);
      return {
        dateStr,
        promise: kv.get(`stats:daily:${dateStr}`)
      };
    });

    const results = await Promise.all(dateQueries.map(q => q.promise));

    const series = dateQueries.map((q, index) => ({
      date: q.dateStr,
      count: Number(results[index]) || 0
    }));

    return series;
  } catch (error) {
    console.error('getTimeSeries error:', error);
    // エラーでも空のデータを返す（過去30日間の0データ）
    const series = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = formatDate(date);
      series.push({ date: dateStr, count: 0 });
    }
    return series;
  }
}

/**
 * アクセスキー別統計を取得
 */
async function getAccessKeyStats() {
  try {
    const accessKeys = ['demo****', 'work****']; // 既知のアクセスキー（マスク済み）

    // 全アクセスキーのクエリを並列実行
    const results = await Promise.all(
      accessKeys.flatMap(key => [
        kv.get(`stats:accessKey:${key}:count`),
        kv.get(`stats:accessKey:${key}:lastUsed`)
      ])
    );

    const stats = accessKeys.map((key, index) => ({
      accessKey: key,
      count: Number(results[index * 2]) || 0,
      lastUsed: results[index * 2 + 1] ? Number(results[index * 2 + 1]) : null
    }));

    // カウントの降順でソート
    stats.sort((a, b) => b.count - a.count);

    return stats;
  } catch (error) {
    console.error('getAccessKeyStats error:', error);
    // エラーでも空のデータを返す
    return [];
  }
}

/**
 * エラーログを取得
 */
async function getErrorLogs(limit) {
  try {
    // 過去7日間のエラーログを並列取得
    const logQueries = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = formatDate(date);
      return kv.lrange(`stats:errors:${dateStr}`, 0, -1);
    });

    const allDayLogs = await Promise.all(logQueries);

    const logs = [];
    for (const dayLogs of allDayLogs) {
      if (!dayLogs) continue;

      for (const log of dayLogs) {
        try {
          const parsed = JSON.parse(log);
          logs.push(parsed);
        } catch (e) {
          console.error('Failed to parse error log:', e);
        }
      }
    }

    // タイムスタンプの降順でソート
    logs.sort((a, b) => b.timestamp - a.timestamp);

    // 最新limit件のみ返す
    return logs.slice(0, limit);
  } catch (error) {
    console.error('getErrorLogs error:', error);
    // エラーでも空のデータを返す
    return [];
  }
}

/**
 * 利用履歴を取得
 */
async function getHistory(limit) {
  try {
    const historyData = await kv.lrange('stats:history', 0, limit - 1) || [];
    const history = [];

    for (const entry of historyData) {
      try {
        const parsed = JSON.parse(entry);
        history.push(parsed);
      } catch (e) {
        console.error('Failed to parse history entry:', e);
      }
    }

    return history;
  } catch (error) {
    console.error('getHistory error:', error);
    // エラーでも空のデータを返す
    return [];
  }
}
