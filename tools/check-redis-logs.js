#!/usr/bin/env node

/**
 * check-redis-logs.js
 * Redisに保存されているログデータを確認するスクリプト
 *
 * 使用方法:
 *   1. .env.local ファイルに環境変数を設定
 *   2. 以下のコマンドを実行:
 *      node tools/check-redis-logs.js
 *      または
 *      npm run check:logs
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// .env.local を読み込み
config({ path: resolve(process.cwd(), '.env.local') });

// 環境変数チェック
console.log('='.repeat(60));
console.log('Redis ログデータ確認');
console.log('='.repeat(60));
console.log('');

const requiredEnvVars = ['KV_REST_API_URL', 'KV_REST_API_TOKEN'];
const missingVars = [];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
}

if (missingVars.length > 0) {
  console.error('❌ エラー: 以下の環境変数が設定されていません:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\n.env.local ファイルを作成して環境変数を設定してください。');
  process.exit(1);
}

// @vercel/kv を動的インポート
let kv;
try {
  const kvModule = await import('@vercel/kv');
  kv = kvModule.kv;
} catch (error) {
  console.error('❌ @vercel/kv パッケージの読み込みに失敗しました:', error.message);
  process.exit(1);
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
 * タイムスタンプを日時文字列にフォーマット
 */
function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * ログデータを確認
 */
async function checkLogs() {
  try {
    const today = formatDate(new Date());

    console.log('【1】利用履歴（最新20件）');
    console.log('-'.repeat(60));

    // 利用履歴を取得
    const historyData = await kv.lrange('stats:history', 0, 19);

    if (!historyData || historyData.length === 0) {
      console.log('  ℹ️  利用履歴はまだありません');
    } else {
      console.log(`  📊 ${historyData.length}件の履歴が見つかりました\n`);

      historyData.forEach((entry, index) => {
        try {
          const log = JSON.parse(entry);
          console.log(`  [${index + 1}] ${formatTimestamp(log.timestamp)}`);
          console.log(`      イベント: ${log.eventType}`);
          if (log.gameId) console.log(`      ゲームID: ${log.gameId}`);
          if (log.accessKey) console.log(`      アクセスキー: ${log.accessKey}`);
          if (log.success !== undefined) console.log(`      成功: ${log.success ? 'はい' : 'いいえ'}`);
          if (log.error) console.log(`      エラー: ${log.error}`);
          if (log.location) console.log(`      場所: ${log.location}`);
          console.log('');
        } catch (e) {
          console.log(`  [${index + 1}] ⚠️  パース失敗: ${entry.substring(0, 50)}...`);
        }
      });
    }

    console.log('');
    console.log('【2】本日の統計');
    console.log('-'.repeat(60));

    // 本日の統計を取得
    const todayCount = await kv.get(`stats:daily:${today}`);
    console.log(`  本日の総利用回数: ${todayCount || 0}`);

    // ゲーム別統計
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

    console.log('\n  ゲーム別統計:');
    for (const gameId of gameIds) {
      const count = await kv.get(`stats:game:${gameId}:${today}`);
      if (count) {
        console.log(`    - ${gameNames[gameId]}: ${count}回`);
      }
    }

    console.log('');
    console.log('【3】イベントタイプ別統計（本日）');
    console.log('-'.repeat(60));

    const eventTypes = [
      'game_selection',
      'output_generation',
      'evaluation',
      'error'
    ];

    const eventTypeNames = {
      'game_selection': 'ゲーム選択',
      'output_generation': '成果物生成',
      'evaluation': '評価',
      'error': 'エラー'
    };

    for (const eventType of eventTypes) {
      const count = await kv.get(`stats:eventType:${eventType}:${today}`);
      if (count) {
        console.log(`  ${eventTypeNames[eventType]}: ${count}回`);
      }
    }

    console.log('');
    console.log('【4】エラーログ（本日）');
    console.log('-'.repeat(60));

    const errorLogs = await kv.lrange(`stats:errors:${today}`, 0, -1);

    if (!errorLogs || errorLogs.length === 0) {
      console.log('  ✅ 本日のエラーはありません');
    } else {
      console.log(`  ⚠️  ${errorLogs.length}件のエラーが見つかりました\n`);

      errorLogs.forEach((entry, index) => {
        try {
          const log = JSON.parse(entry);
          console.log(`  [${index + 1}] ${formatTimestamp(log.timestamp)}`);
          console.log(`      場所: ${log.location || log.eventType}`);
          if (log.gameId) console.log(`      ゲームID: ${log.gameId}`);
          if (log.error) {
            console.log(`      エラー: ${log.error.message || log.error}`);
            if (log.error.name) console.log(`      種類: ${log.error.name}`);
          }
          console.log('');
        } catch (e) {
          console.log(`  [${index + 1}] ⚠️  パース失敗`);
        }
      });
    }

    console.log('');
    console.log('【5】アクセスキー別統計');
    console.log('-'.repeat(60));

    // 既知のアクセスキー（マスク済み）のパターンで検索
    const knownPrefixes = ['demo', 'work', 'TEST', 'DEMO'];

    console.log('  📝 注: アクセスキーは最初の4文字+****の形式で保存されています\n');

    let foundKeys = false;
    for (const prefix of knownPrefixes) {
      const maskedKey = prefix + '****';
      const count = await kv.get(`stats:accessKey:${maskedKey}:count`);
      const lastUsed = await kv.get(`stats:accessKey:${maskedKey}:lastUsed`);

      if (count) {
        foundKeys = true;
        console.log(`  ${maskedKey}:`);
        console.log(`    利用回数: ${count}回`);
        if (lastUsed) {
          console.log(`    最終利用: ${formatTimestamp(Number(lastUsed))}`);
        }
        console.log('');
      }
    }

    if (!foundKeys) {
      console.log('  ℹ️  アクセスキー別の統計はまだありません');
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ ログデータの確認が完了しました');
    console.log('='.repeat(60));
    console.log('');
    console.log('💡 ヒント:');
    console.log('  - ゲーム選択画面でゲームを選択すると、ログが記録されます');
    console.log('  - api/stats/get.js を使用すると、より詳細な統計を取得できます');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ エラーが発生しました:', error.message);
    console.error('');
    console.error('スタックトレース:');
    console.error(error.stack);
    process.exit(1);
  }
}

// ログ確認を実行
checkLogs();
