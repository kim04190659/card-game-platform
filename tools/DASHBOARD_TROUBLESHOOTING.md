# ダッシュボードのトラブルシューティング

このドキュメントは、利用統計ダッシュボードで数字が0と表示される問題を解決するためのガイドです。

## 問題: ダッシュボードの数字がすべて0

![Dashboard showing zeros](../docs/images/dashboard-zeros.png)

### 原因の可能性

1. **Redisにデータが記録されていない**
   - まだ誰もゲームを選択していない
   - 環境変数が設定されていない（本番環境）
   - Redisの接続エラー

2. **ダッシュボードがデータを取得できていない**
   - APIエンドポイントのエラー
   - 認証の問題
   - ブラウザのネットワークエラー

## 診断手順

### Step 1: 環境変数を確認

#### ローカル環境

`.env.local` ファイルが存在し、正しく設定されているか確認：

```bash
# プロジェクトルートで実行
cat .env.local
```

必要な環境変数:
```
KV_REST_API_URL=https://xxxxx.upstash.io
KV_REST_API_TOKEN=AXXXXxxxxx...
```

**環境変数がない場合:**
1. Vercelダッシュボード → Storage → card-game-kv-2 → .env.local タブ
2. 表示される環境変数をコピーして `.env.local` ファイルを作成

#### 本番環境（Vercel）

Vercelダッシュボードで環境変数を確認：
1. [Vercel Dashboard](https://vercel.com/dashboard)
2. プロジェクトを選択
3. Settings → Environment Variables
4. `KV_REST_API_URL` と `KV_REST_API_TOKEN` が設定されているか確認

**設定されていない場合:**
1. Storage タブ → card-game-kv-2
2. 環境変数を自動的に設定するオプションを選択
3. デプロイを再実行

### Step 2: Redis接続をテスト

```bash
npm run test:redis
```

**期待される出力:**
```
✅ すべてのテストに成功しました！
card-game-kv-2 データベースは正常に動作しています。
```

**エラーが出る場合:**
- 環境変数が正しく設定されているか再確認
- Vercelダッシュボードでデータベースがアクティブか確認
- ネットワーク接続を確認

### Step 3: Redisのデータを確認

```bash
npm run check:logs
```

**データがない場合（利用履歴が0件）:**
```
【1】利用履歴（最新20件）
------------------------------------------------------------
  ℹ️  利用履歴はまだありません
```

→ **Step 4** へ進む

**データがある場合:**
→ **Step 5** へ進む

### Step 4: テストデータを挿入

Redisにテストデータを挿入して、ダッシュボードが正しく動作するか確認：

```bash
npm run insert:test-data
```

**成功時の出力:**
```
✅ テストデータの挿入が完了しました（XX件）

次のステップ:
1. npm run check:logs でデータを確認
2. ダッシュボード（/admin/dashboard.html）にアクセス
   パスワード: admin-password-2024
```

テストデータ挿入後、ダッシュボードを更新して数字が表示されるか確認してください。

### Step 5: ダッシュボードAPIを確認

ブラウザの開発者ツールでAPIリクエストを確認：

1. ダッシュボードを開く（`/admin/dashboard.html`）
2. F12キーで開発者ツールを開く
3. "Network" タブを選択
4. ダッシュボードにログイン（パスワード: `admin-password-2024`）
5. `/api/stats/get` リクエストを探す

**成功時の応答:**
```json
{
  "summary": {
    "total": 15,
    "today": 5,
    "week": 12,
    "month": 15
  },
  "gameStats": [...],
  "timeSeries": [...],
  ...
}
```

**エラー応答:**
```json
{
  "error": "Failed to retrieve stats",
  "message": "..."
}
```

#### エラーの場合:

**401 Unauthorized:**
- パスワードが間違っている
- URLに `?password=admin-password-2024` が含まれているか確認

**500 Internal Server Error:**
- サーバーログを確認（Vercel Dashboard → Deployments → Functions）
- Redisへの接続エラーの可能性

**データは取得できているが数字が0:**
- ブラウザのコンソールでレスポンスを確認
- `console.log('統計データ取得:', data)` の出力を確認
- summary.total が 0 の場合、Redisにデータが記録されていない

### Step 6: ブラウザのコンソールログを確認

開発者ツールの Console タブで以下を確認：

**正常な場合:**
```
統計データ取得: {summary: {...}, gameStats: [...], ...}
```

**エラーの場合:**
```
データ読み込みエラー: ...
```

## 解決方法まとめ

### ケース1: 環境変数が未設定

**症状:**
- `npm run test:redis` で「環境変数が設定されていません」エラー
- または接続エラー

**解決方法:**
1. `.env.local` ファイルを作成
2. Vercelダッシュボードから環境変数をコピー
3. `npm run test:redis` で接続を確認

### ケース2: Redisにデータがない

**症状:**
- `npm run check:logs` で「利用履歴はまだありません」
- ダッシュボードの数字がすべて0

**解決方法:**

**オプション A: テストデータを挿入**
```bash
npm run insert:test-data
```

**オプション B: 実際にゲームを選択**
1. アプリケーションにアクセス
2. アクセスキーでログイン（例: `demo-key-2024`）
3. ゲームを選択
4. ダッシュボードを更新

### ケース3: APIエラー

**症状:**
- ブラウザのNetworkタブで500エラー
- コンソールに「データ読み込みエラー」

**解決方法:**
1. Vercelの環境変数を確認
2. Vercel Logsでエラーログを確認
3. デプロイを再実行

### ケース4: 本番環境で動作しない

**症状:**
- ローカルでは動作するが、Vercelでは0

**解決方法:**
1. Vercel Dashboard → Settings → Environment Variables
2. `KV_REST_API_URL` と `KV_REST_API_TOKEN` が設定されているか確認
3. 環境が「Production」「Preview」「Development」のすべてに設定されているか確認
4. 再デプロイ

## よくある質問

### Q: テストデータを挿入しても数字が変わらない

A: 以下を確認してください：
1. ダッシュボードの「更新」ボタンをクリック
2. ブラウザのキャッシュをクリア（Ctrl+Shift+R / Cmd+Shift+R）
3. `npm run check:logs` でデータが挿入されたか確認

### Q: ローカルと本番で異なるRedisを使用していますか？

A: はい。ローカル環境は `.env.local` の設定、本番環境はVercelの環境変数を使用します。それぞれのRedisインスタンスは独立しています。

### Q: テストデータを削除したい

A: Redisのデータをクリアするスクリプトは現在提供していません。Upstash Dashboardから手動で削除するか、キーを個別に削除してください。

### Q: ダッシュボードのパスワードを変更したい

A:
1. `public/js/ui/admin-dashboard.js` の `ADMIN_PASSWORD` を変更
2. `api/stats/get.js` の `ADMIN_PASSWORD` も同じ値に変更

## トラブルシューティングフロー

```
ダッシュボードの数字が0
    ↓
.env.localは設定されている？
    ├─ NO → Vercelから環境変数を取得して .env.local を作成
    └─ YES → 次へ
         ↓
npm run test:redis は成功する？
    ├─ NO → 環境変数の値が正しいか確認、Vercelでデータベースがアクティブか確認
    └─ YES → 次へ
         ↓
npm run check:logs でデータは表示される？
    ├─ NO → npm run insert:test-data でテストデータを挿入
    └─ YES → ダッシュボードのNetworkタブでAPIレスポンスを確認
         ↓
API は正常なデータを返している？
    ├─ NO → Vercelログを確認、環境変数を確認
    └─ YES → ブラウザキャッシュをクリアして再読み込み
```

## サポート

上記の手順で解決しない場合は、以下の情報を添えてお問い合わせください：

1. `npm run test:redis` の出力
2. `npm run check:logs` の出力
3. ブラウザのコンソールログ
4. ブラウザのNetworkタブの `/api/stats/get` レスポンス
5. 環境（ローカル or Vercel本番）

## 関連ドキュメント

- [Redis接続テスト手順](./REDIS_TEST.md)
- [ログ確認方法](./CHECK_LOGS.md)
- [README](../README.md)
