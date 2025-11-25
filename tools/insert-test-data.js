#!/usr/bin/env node

/**
 * insert-test-data.js
 * Redisにテストデータを挿入するスクリプト
 *
 * 使用方法:
 *   1. .env.local ファイルに環境変数を設定
 *   2. 以下のコマンドを実行:
 *      node tools/insert-test-data.js
 *      または
 *      npm run insert:test-data
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// .env.local を読み込み
config({ path: resolve(process.cwd(), '.env.local') });

// 環境変数チェック
console.log('='.repeat(60));
console.log('テストデータ挿入スクリプト');
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
  console.log('✓ @vercel/kv パッケージを読み込みました');
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
 * テストデータを挿入
 */
async function insertTestData() {
  try {
    console.log('');
    console.log('テストデータの挿入を開始します...');
    console.log('-'.repeat(60));

    const today = formatDate(new Date());
    const gameIds = ['city-dx', 'robot-solution', 'it-operations-excellence'];
    const accessKeys = ['demo****', 'work****', 'TEST****'];

    let insertedCount = 0;

    // 1. 本日の統計を設定
    console.log('\n【1】本日の統計データを挿入');
    const todayTotal = 15;
    await kv.set(`stats:daily:${today}`, todayTotal);
    console.log(`  ✓ 本日の総利用回数: ${todayTotal}`);
    insertedCount++;

    // 2. ゲーム別統計を挿入
    console.log('\n【2】ゲーム別統計データを挿入');
    const gameCounts = {
      'city-dx': 5,
      'robot-solution': 7,
      'it-operations-excellence': 3
    };

    for (const [gameId, count] of Object.entries(gameCounts)) {
      await kv.set(`stats:game:${gameId}:${today}`, count);
      console.log(`  ✓ ${gameId}: ${count}回`);
      insertedCount++;
    }

    // 3. イベントタイプ別統計を挿入
    console.log('\n【3】イベントタイプ別統計を挿入');
    const eventCounts = {
      'game_selection': 8,
      'output_generation': 5,
      'evaluation': 2
    };

    for (const [eventType, count] of Object.entries(eventCounts)) {
      await kv.set(`stats:eventType:${eventType}:${today}`, count);
      console.log(`  ✓ ${eventType}: ${count}回`);
      insertedCount++;
    }

    // 4. 利用履歴を挿入
    console.log('\n【4】利用履歴を挿入（10件）');
    const now = Date.now();

    for (let i = 0; i < 10; i++) {
      const timestamp = now - i * 300000; // 5分間隔
      const gameId = gameIds[i % gameIds.length];
      const accessKey = accessKeys[i % accessKeys.length];

      const historyEntry = {
        timestamp,
        eventType: 'game_selection',
        gameId,
        accessKey,
        success: true
      };

      await kv.lpush('stats:history', JSON.stringify(historyEntry));
      insertedCount++;
    }
    console.log(`  ✓ 10件の利用履歴を挿入しました`);

    // historyリストを500件に制限
    await kv.ltrim('stats:history', 0, 499);

    // 5. アクセスキー別統計を挿入
    console.log('\n【5】アクセスキー別統計を挿入');
    const accessKeyCounts = {
      'demo****': 8,
      'work****': 5,
      'TEST****': 2
    };

    for (const [key, count] of Object.entries(accessKeyCounts)) {
      await kv.set(`stats:accessKey:${key}:count`, count);
      await kv.set(`stats:accessKey:${key}:lastUsed`, now);
      console.log(`  ✓ ${key}: ${count}回`);
      insertedCount += 2;
    }

    // 6. 過去30日間の時系列データを挿入
    console.log('\n【6】過去30日間の時系列データを挿入');
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);

      // ランダムな値（0〜5）
      const count = Math.floor(Math.random() * 6);
      if (count > 0) {
        await kv.set(`stats:daily:${dateStr}`, count);
        insertedCount++;
      }
    }
    console.log(`  ✓ 過去30日間のデータを挿入しました`);

    console.log('');
    console.log('='.repeat(60));
    console.log(`✅ テストデータの挿入が完了しました（${insertedCount}件）`);
    console.log('='.repeat(60));
    console.log('');
    console.log('次のステップ:');
    console.log('1. npm run check:logs でデータを確認');
    console.log('2. ダッシュボード（/admin/dashboard.html）にアクセス');
    console.log('   パスワード: admin-password-2024');
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

// テストデータ挿入を実行
insertTestData();
