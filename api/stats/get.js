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
  // 今日の利用回数
  const todayCount = (await kv.get(`stats:daily:${today}`)) || 0;

  // 今週の利用回数（過去7日間の合計）
  let weekCount = 0;
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = formatDate(date);
    const count = (await kv.get(`stats:daily:${dateStr}`)) || 0;
    weekCount += parseInt(count);
  }

  // 今月の利用回数（過去30日間の合計）
  let monthCount = 0;
  for (let i = 0; i < 30; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = formatDate(date);
    const count = (await kv.get(`stats:daily:${dateStr}`)) || 0;
    monthCount += parseInt(count);
  }

  // 総利用回数（履歴リストの長さ）
  const totalCount = await kv.llen('stats:history') || 0;

  return {
    total: totalCount,
    today: parseInt(todayCount),
    week: weekCount,
    month: monthCount
  };
}

/**
 * ゲーム別統計を取得
 */
async function getGameStats(today, oneMonthAgo) {
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

  const stats = [];

  for (const gameId of gameIds) {
    let count = 0;
    // 過去30日間の合計
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = formatDate(date);
      const dayCount = (await kv.get(`stats:game:${gameId}:${dateStr}`)) || 0;
      count += parseInt(dayCount);
    }

    stats.push({
      gameId,
      gameName: gameNames[gameId],
      count
    });
  }

  // カウントの降順でソート
  stats.sort((a, b) => b.count - a.count);

  return stats;
}

/**
 * 時系列推移を取得（過去30日間）
 */
async function getTimeSeries(startDate, endDate) {
  const series = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = formatDate(date);
    const count = (await kv.get(`stats:daily:${dateStr}`)) || 0;

    series.push({
      date: dateStr,
      count: parseInt(count)
    });
  }

  return series;
}

/**
 * アクセスキー別統計を取得
 */
async function getAccessKeyStats() {
  const accessKeys = ['demo****', 'work****']; // 既知のアクセスキー（マスク済み）
  const stats = [];

  for (const key of accessKeys) {
    const count = (await kv.get(`stats:accessKey:${key}:count`)) || 0;
    const lastUsed = await kv.get(`stats:accessKey:${key}:lastUsed`);

    stats.push({
      accessKey: key,
      count: parseInt(count),
      lastUsed: lastUsed ? parseInt(lastUsed) : null
    });
  }

  // カウントの降順でソート
  stats.sort((a, b) => b.count - a.count);

  return stats;
}

/**
 * エラーログを取得
 */
async function getErrorLogs(limit) {
  const logs = [];

  // 過去7日間のエラーログを取得
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = formatDate(date);
    const dayLogs = await kv.lrange(`stats:errors:${dateStr}`, 0, -1) || [];

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
}

/**
 * 利用履歴を取得
 */
async function getHistory(limit) {
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
}
