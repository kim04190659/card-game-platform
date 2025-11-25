#!/usr/bin/env node

/**
 * test-redis-connection.js
 * Upstash Redis (Vercel KV) 接続テストスクリプト
 *
 * 使用方法:
 *   1. .env.local ファイルを作成し、以下の環境変数を設定:
 *      KV_REST_API_URL=your_url
 *      KV_REST_API_TOKEN=your_token
 *
 *   2. 以下のコマンドを実行:
 *      node tools/test-redis-connection.js
 */

// 環境変数を読み込み
import { config } from 'dotenv';
import { resolve } from 'path';

// .env.local を読み込み
config({ path: resolve(process.cwd(), '.env.local') });

// 環境変数チェック
console.log('='.repeat(60));
console.log('Upstash Redis (Vercel KV) 接続テスト');
console.log('='.repeat(60));
console.log('');

console.log('【1】環境変数の確認');
console.log('-'.repeat(60));

const requiredEnvVars = ['KV_REST_API_URL', 'KV_REST_API_TOKEN'];
const missingVars = [];

for (const varName of requiredEnvVars) {
  const value = process.env[varName];
  if (value) {
    // トークンは最初の10文字のみ表示
    const displayValue = varName.includes('TOKEN')
      ? `${value.substring(0, 10)}...`
      : value;
    console.log(`✓ ${varName}: ${displayValue}`);
  } else {
    console.log(`✗ ${varName}: 未設定`);
    missingVars.push(varName);
  }
}

if (missingVars.length > 0) {
  console.error('\n❌ エラー: 以下の環境変数が設定されていません:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\n.env.local ファイルを作成して環境変数を設定してください。');
  console.error('Vercelダッシュボードから card-game-kv-2 の接続情報を取得できます。');
  process.exit(1);
}

console.log('');
console.log('【2】Redis接続テスト');
console.log('-'.repeat(60));

// @vercel/kv を動的インポート
let kv;
try {
  const kvModule = await import('@vercel/kv');
  kv = kvModule.kv;
  console.log('✓ @vercel/kv パッケージを読み込みました');
} catch (error) {
  console.error('✗ @vercel/kv パッケージの読み込みに失敗しました:', error.message);
  console.error('  npm install を実行してください');
  process.exit(1);
}

console.log('');

// テスト実行
async function runTests() {
  const testKey = 'test:connection';
  const testValue = `テスト実行時刻: ${new Date().toISOString()}`;

  try {
    // 1. PING テスト
    console.log('テスト 1: PING');
    try {
      await kv.ping();
      console.log('  ✓ PING成功 - Redisサーバーに接続できました');
    } catch (error) {
      console.error('  ✗ PING失敗:', error.message);
      throw error;
    }

    // 2. SET テスト
    console.log('\nテスト 2: SET (データ書き込み)');
    try {
      await kv.set(testKey, testValue);
      console.log(`  ✓ SET成功 - キー "${testKey}" にデータを書き込みました`);
    } catch (error) {
      console.error('  ✗ SET失敗:', error.message);
      throw error;
    }

    // 3. GET テスト
    console.log('\nテスト 3: GET (データ読み込み)');
    try {
      const retrieved = await kv.get(testKey);
      if (retrieved === testValue) {
        console.log(`  ✓ GET成功 - データを正しく読み込めました`);
        console.log(`    値: ${retrieved}`);
      } else {
        console.error('  ✗ GET失敗: 読み込んだ値が一致しません');
        console.error(`    期待値: ${testValue}`);
        console.error(`    実際値: ${retrieved}`);
        throw new Error('GET test failed: value mismatch');
      }
    } catch (error) {
      console.error('  ✗ GET失敗:', error.message);
      throw error;
    }

    // 4. DEL テスト
    console.log('\nテスト 4: DEL (データ削除)');
    try {
      await kv.del(testKey);
      console.log(`  ✓ DEL成功 - テストデータを削除しました`);
    } catch (error) {
      console.error('  ✗ DEL失敗:', error.message);
      throw error;
    }

    // 5. 統計記録のテスト（実際の使用ケース）
    console.log('\nテスト 5: 統計記録のシミュレーション');
    try {
      const today = new Date().toISOString().substring(0, 10);
      const testStatsKey = `stats:daily:${today}`;

      // カウンター増加
      await kv.incr(testStatsKey);
      const count = await kv.get(testStatsKey);

      console.log(`  ✓ INCR成功 - 本日の統計カウンターを増加しました`);
      console.log(`    現在のカウント: ${count}`);

      // テストデータを削除
      await kv.del(testStatsKey);
      console.log(`  ✓ テストデータを削除しました`);
    } catch (error) {
      console.error('  ✗ 統計記録テスト失敗:', error.message);
      throw error;
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ すべてのテストに成功しました！');
    console.log('='.repeat(60));
    console.log('');
    console.log('card-game-kv-2 データベースは正常に動作しています。');
    console.log('このデータベースは統計記録機能で使用されます。');
    console.log('');

  } catch (error) {
    console.log('');
    console.log('='.repeat(60));
    console.log('❌ テストに失敗しました');
    console.log('='.repeat(60));
    console.log('');
    console.log('エラー詳細:', error.message);
    console.log('');
    console.log('トラブルシューティング:');
    console.log('1. 環境変数が正しく設定されているか確認してください');
    console.log('2. Vercelダッシュボードでデータベースがアクティブか確認してください');
    console.log('3. REST API URLとトークンが有効か確認してください');
    console.log('');
    process.exit(1);
  }
}

// テスト実行
runTests().catch(error => {
  console.error('予期しないエラー:', error);
  process.exit(1);
});
