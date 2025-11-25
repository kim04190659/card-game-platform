# Upstash Redis (card-game-kv-2) 接続テスト手順

このドキュメントは、新しく作成された `card-game-kv-2` Redisデータベースへの接続をテストする手順を説明します。

## 前提条件

- Node.js がインストールされていること
- `npm install` を実行済みであること
- Vercelダッシュボードで `card-game-kv-2` データベースが作成済みであること

## 手順

### 1. 接続情報の取得

Vercelダッシュボードから `card-game-kv-2` データベースの接続情報を取得します：

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクトを選択
3. "Storage" タブを選択
4. `card-game-kv-2` をクリック
5. `.env.local` タブを選択して、以下の環境変数をコピー:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN` (オプション)

### 2. .env.local ファイルの作成

プロジェクトのルートディレクトリに `.env.local` ファイルを作成し、上記の環境変数を貼り付けます：

```bash
# プロジェクトルートで実行
touch .env.local
```

`.env.local` の内容例：
```
KV_REST_API_URL=https://xxxxxx.upstash.io
KV_REST_API_TOKEN=AXXXXxxx...
KV_REST_API_READ_ONLY_TOKEN=AXXXXxxx...
```

**重要:** `.env.local` ファイルは `.gitignore` に含まれているため、Gitにコミットされません。

### 3. テストの実行

以下のコマンドでRedis接続テストを実行します：

```bash
npm run test:redis
```

### 4. テスト内容

このテストスクリプトは以下の項目を確認します：

1. **環境変数の確認**: 必要な環境変数が設定されているかチェック
2. **PING テスト**: Redisサーバーへの基本的な接続確認
3. **SET テスト**: データの書き込みが正常に動作するか確認
4. **GET テスト**: データの読み込みが正常に動作するか確認
5. **DEL テスト**: データの削除が正常に動作するか確認
6. **統計記録のシミュレーション**: 実際の使用ケース（INCRコマンド）の動作確認

### 5. 成功時の出力例

```
============================================================
Upstash Redis (Vercel KV) 接続テスト
============================================================

【1】環境変数の確認
------------------------------------------------------------
✓ KV_REST_API_URL: https://xxx...
✓ KV_REST_API_TOKEN: AXXXXXxxxx...

【2】Redis接続テスト
------------------------------------------------------------
✓ @vercel/kv パッケージを読み込みました

テスト 1: PING
  ✓ PING成功 - Redisサーバーに接続できました

テスト 2: SET (データ書き込み)
  ✓ SET成功 - キー "test:connection" にデータを書き込みました

テスト 3: GET (データ読み込み)
  ✓ GET成功 - データを正しく読み込めました
    値: テスト実行時刻: 2025-11-25T15:30:00.000Z

テスト 4: DEL (データ削除)
  ✓ DEL成功 - テストデータを削除しました

テスト 5: 統計記録のシミュレーション
  ✓ INCR成功 - 本日の統計カウンターを増加しました
    現在のカウント: 1
  ✓ テストデータを削除しました

============================================================
✅ すべてのテストに成功しました！
============================================================

card-game-kv-2 データベースは正常に動作しています。
このデータベースは統計記録機能で使用されます。
```

### 6. エラーが発生した場合

#### 環境変数が未設定の場合

```
❌ エラー: 以下の環境変数が設定されていません:
   - KV_REST_API_URL
   - KV_REST_API_TOKEN

.env.local ファイルを作成して環境変数を設定してください。
```

**対処方法**: 手順1と2を再確認し、`.env.local` ファイルが正しく作成されているか確認してください。

#### 接続エラーの場合

```
❌ テストに失敗しました
エラー詳細: connect ECONNREFUSED ...
```

**対処方法**:
1. Vercelダッシュボードでデータベースがアクティブか確認
2. REST API URLとトークンが正しいか確認
3. ネットワーク接続を確認

## Redisの使用箇所

このプロジェクトでは、以下のファイルでRedisを使用しています：

- `api/stats/log.js`: 統計データの記録
  - 利用履歴の保存
  - 日別・ゲーム別統計の更新
  - エラーログの保存

- `api/stats/get.js`: 統計データの取得
  - サマリー情報の取得
  - ゲーム別統計の集計
  - 時系列データの取得

## 本番環境での設定

Vercelにデプロイする際は、Vercelが自動的に `card-game-kv-2` の環境変数を設定します。
手動で設定する必要はありません。

### 確認方法

1. [Vercel Dashboard](https://vercel.com/dashboard) でプロジェクトを選択
2. "Settings" → "Environment Variables" を確認
3. `KV_REST_API_URL` と `KV_REST_API_TOKEN` が設定されていることを確認

## トラブルシューティング

### Q: テストは成功したが、本番環境で動作しない

A: Vercelの環境変数が正しく設定されているか確認してください。Storageタブから `card-game-kv-2` を選択し、環境変数が各環境（Production, Preview, Development）に正しく設定されているか確認します。

### Q: ローカル開発環境で統計機能が動作しない

A: `npm run test:redis` を実行して、Redis接続が正常か確認してください。`.env.local` ファイルが正しく設定されているか確認します。

### Q: dotenvパッケージがないというエラーが出る

A: `npm install` を実行して、すべての依存パッケージをインストールしてください。

## 関連リンク

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [@vercel/kv SDK Documentation](https://vercel.com/docs/storage/vercel-kv/using-kv-sdk)
