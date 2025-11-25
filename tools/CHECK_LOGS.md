# カード選択ログの確認方法

このドキュメントでは、カード選択などのユーザー操作が正しくRedisに記録されているかを確認する方法を説明します。

## 概要

このシステムでは、以下のイベントがRedisに記録されます：

1. **ゲーム選択** (`game_selection`) - ゲーム選択画面でゲームを選択したとき
2. **成果物生成** (`output_generation`) - AI成果物を生成したとき
3. **評価** (`evaluation`) - 成果物を評価したとき
4. **エラー** (`error`) - システムエラーが発生したとき

## ログ記録の仕組み

### フロントエンド
- **StatsLogger.js** (`public/js/core/StatsLogger.js`)
  - 各イベントを記録するためのクラス
  - `/api/stats/log` APIにPOSTリクエストを送信

### バックエンド
- **api/stats/log.js**
  - POSTリクエストを受け取り、Redisに保存
  - 以下のデータ構造で保存:
    - `stats:history` - 利用履歴（最新500件）
    - `stats:daily:{date}` - 日別統計
    - `stats:game:{gameId}:{date}` - ゲーム別日別統計
    - `stats:eventType:{eventType}:{date}` - イベントタイプ別統計
    - `stats:accessKey:{key}:count` - アクセスキー別カウント
    - `stats:errors:{date}` - エラーログ

### データフロー

```
ユーザー操作
    ↓
StatsLogger.logGameSelection(gameId, accessKey)
    ↓
POST /api/stats/log
    ↓
api/stats/log.js
    ↓
Vercel KV (Upstash Redis)
```

## ログ確認方法

### 1. 環境変数の設定

`.env.local` ファイルが正しく設定されていることを確認してください：

```bash
KV_REST_API_URL=https://xxxxx.upstash.io
KV_REST_API_TOKEN=AXXXXxxxxx...
KV_REST_API_READ_ONLY_TOKEN=AXXXXxxxxx...
```

### 2. ログ確認スクリプトの実行

以下のコマンドでRedisに保存されているログを確認できます：

```bash
npm run check:logs
```

### 3. 出力内容

スクリプトは以下の情報を表示します：

#### 【1】利用履歴（最新20件）
最近の利用履歴を時系列で表示します。

```
[1] 2025/11/25 15:30:45
    イベント: game_selection
    ゲームID: city-dx
    アクセスキー: demo****
```

#### 【2】本日の統計
本日の総利用回数とゲーム別統計を表示します。

```
本日の総利用回数: 5

ゲーム別統計:
  - 自治体DX推進: 2回
  - ロボットソリューション: 1回
```

#### 【3】イベントタイプ別統計（本日）
各イベントタイプの発生回数を表示します。

```
ゲーム選択: 3回
成果物生成: 2回
評価: 2回
```

#### 【4】エラーログ（本日）
本日発生したエラーを表示します。

```
✅ 本日のエラーはありません
```

または

```
⚠️ 2件のエラーが見つかりました

[1] 2025/11/25 15:35:12
    場所: OutputGenerator
    ゲームID: city-dx
    エラー: API rate limit exceeded
```

#### 【5】アクセスキー別統計
マスクされたアクセスキーごとの利用統計を表示します。

```
demo****:
  利用回数: 5回
  最終利用: 2025/11/25 15:30:45
```

## ログが記録されない場合のトラブルシューティング

### 1. Redis接続を確認

```bash
npm run test:redis
```

Redis接続が正常か確認してください。

### 2. ブラウザの開発者ツールで確認

1. ブラウザでゲーム選択画面を開く
2. F12キーで開発者ツールを開く
3. "Network"タブを選択
4. ゲームを選択
5. `/api/stats/log` へのPOSTリクエストが表示されるか確認

**成功時の応答:**
```json
{
  "success": true
}
```

**失敗時の応答:**
```json
{
  "success": false,
  "message": "Stats logging failed, but game can continue"
}
```

### 3. コンソールログを確認

ブラウザの開発者ツールのConsoleタブで以下のログを確認：

```
統計記録完了
```

または

```
統計記録に失敗しました: [エラー内容]
```

### 4. Vercel環境変数を確認

Vercelにデプロイしている場合、以下を確認：

1. [Vercel Dashboard](https://vercel.com/dashboard)
2. プロジェクトを選択
3. "Settings" → "Environment Variables"
4. `KV_REST_API_URL` と `KV_REST_API_TOKEN` が設定されているか確認

## カード選択のログを実際に記録してみる

### 手順

1. アプリケーションを起動（ローカルまたはVercel）
2. アクセスキーでログイン（例: `demo-key-2024`）
3. ゲーム選択画面でゲームを選択
4. ログ確認スクリプトを実行:
   ```bash
   npm run check:logs
   ```

### 期待される結果

利用履歴に以下のようなエントリが表示されるはずです：

```
[1] 2025/11/25 15:45:23
    イベント: game_selection
    ゲームID: city-dx (または選択したゲームID)
    アクセスキー: demo****
```

## ログデータの構造

### game_selection イベント

```json
{
  "eventType": "game_selection",
  "gameId": "city-dx",
  "accessKey": "demo****",
  "timestamp": "2025-11-25T15:45:23.456Z"
}
```

### output_generation イベント

```json
{
  "eventType": "output_generation",
  "gameId": "city-dx",
  "accessKey": "demo****",
  "success": true,
  "error": null,
  "timestamp": "2025-11-25T15:46:12.789Z"
}
```

### evaluation イベント

```json
{
  "eventType": "evaluation",
  "gameId": "city-dx",
  "accessKey": "demo****",
  "success": true,
  "error": null,
  "timestamp": "2025-11-25T15:47:03.123Z"
}
```

## 関連ファイル

### フロントエンド
- `public/js/core/StatsLogger.js` - ログ記録クラス
- `public/game-selection.html` - ゲーム選択画面（250-276行目でログ記録）

### バックエンド
- `api/stats/log.js` - ログ記録API
- `api/stats/get.js` - 統計取得API

### ツール
- `tools/check-redis-logs.js` - ログ確認スクリプト
- `tools/test-redis-connection.js` - Redis接続テスト

## よくある質問

### Q: ログ記録が失敗してもゲームは続行できますか？

A: はい。統計記録の失敗はゲームの続行に影響しません。コンソールに警告が表示されますが、ゲームは正常に動作します。

### Q: アクセスキーはどのように保存されますか？

A: セキュリティのため、アクセスキーは最初の4文字+アスタリスク（例: `demo****`）の形式でマスクされて保存されます。

### Q: ログはいつまで保存されますか？

A:
- 利用履歴: 最新500件まで
- エラーログ: 日別で最新100件まで
- 統計データ: 永続的に保存（Redisの容量上限まで）

### Q: 本番環境でログが記録されているか確認するには？

A: ローカル環境で `.env.local` に本番環境の接続情報を設定し、`npm run check:logs` を実行してください。または、Vercel Logs でAPIリクエストのログを確認できます。

## まとめ

このシステムでは、ユーザーの操作を自動的にRedisに記録し、統計情報として活用できます。`npm run check:logs` コマンドを使用することで、ログが正しく記録されているか簡単に確認できます。
