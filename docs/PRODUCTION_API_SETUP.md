# 本番API（Anthropic Claude）セットアップガイド

## 概要
このガイドでは、本番環境でAnthropic Claude APIを使用するための設定手順を説明します。

## 前提条件
- Anthropic Console（https://console.anthropic.com/）のアカウント
- Vercelプロジェクトへのアクセス権限

## Step 1: Anthropic APIキーの取得

### 1.1 Anthropicアカウントの作成
1. https://console.anthropic.com/ にアクセス
2. 「Sign Up」をクリックしてアカウントを作成
3. メール認証を完了

### 1.2 APIキーの生成
1. Anthropic Consoleにログイン
2. 左メニューから「API Keys」を選択
3. 「Create Key」ボタンをクリック
4. キー名を入力（例: `card-game-platform-production`）
5. 生成されたAPIキーをコピー（⚠️ 一度しか表示されません）

### 1.3 使用量アラートの設定（推奨）
1. 左メニューから「Settings」→「Billing」を選択
2. 「Usage Limits」セクションで予算を設定
3. 推奨設定: Monthly limit $10

## Step 2: Vercelへの環境変数設定

### 2.1 Vercel Dashboardでの設定
1. https://vercel.com/dashboard にアクセス
2. プロジェクト「card-game-platform」を選択
3. 「Settings」タブをクリック
4. 左メニューから「Environment Variables」を選択
5. 以下の環境変数を追加:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: コピーしたAPIキー
   - **Environment**: `Production`, `Preview`, `Development` すべてにチェック
6. 「Save」をクリック

### 2.2 再デプロイ
環境変数を追加した後、再デプロイが必要です：
1. 「Deployments」タブに移動
2. 最新のデプロイメントの右側にある「...」メニューをクリック
3. 「Redeploy」を選択

## Step 3: 動作確認

### 3.1 モードの切り替え
1. アプリケーションを開く
2. ゲーム選択画面の右上にある「API モード切り替え」スイッチを確認
3. デフォルトは「🤖 モックAPI（無料）」になっているはず

### 3.2 本番APIのテスト
1. スイッチをONにする
2. 確認ダイアログで「OK」をクリック
3. 「✨ 本番API（課金あり）」に変わることを確認
4. 警告メッセージが表示されることを確認

### 3.3 実際にゲームをプレイ
1. 任意のゲームを選択
2. カードを選択
3. 入力フィールドに情報を入力
4. 「成果物を生成」をクリック
5. 成果物が生成されることを確認（⚠️ 課金発生）
6. 「評価を実施」をクリック
7. 評価結果が表示されることを確認（⚠️ 課金発生）

### 3.4 使用量の確認
1. Anthropic Consoleにログイン
2. 「Usage」タブで使用量を確認
3. トークン数とコストを確認

## Step 4: ログの確認（トラブルシューティング）

### 4.1 Vercelログの確認
1. Vercelダッシュボードの「Logs」タブを開く
2. 「Serverless Function」のログを確認
3. `[generate]` や `[evaluate]` で始まるログを探す

### 4.2 正常なログの例
```
[generate] 本番API呼び出し開始
[generate] gameId: city-dx
[generate] プロンプト長: 1234 文字
[generate] 成功
[generate] 使用トークン: { input: 1000, output: 3000 }
[generate] 推定コスト: $ 0.0480
```

### 4.3 エラーログの例
```
[generate] ANTHROPIC_API_KEY が設定されていません
```
→ 環境変数が正しく設定されているか確認

```
[generate] Anthropic APIエラー: { error: { type: "authentication_error" } }
```
→ APIキーが正しいか確認

## コスト管理

### トークン使用量の目安
| 操作 | 入力トークン | 出力トークン | コスト |
|------|------------|------------|--------|
| 成果物生成 | 約1,000 | 約3,000 | $0.048 |
| 評価 | 約2,000 | 約1,000 | $0.021 |
| **1ゲーム合計** | 約3,000 | 約4,000 | **$0.069** |

### 料金体系（Claude Sonnet 4.5）
- 入力トークン: $3.00 / 1M tokens
- 出力トークン: $15.00 / 1M tokens

### コスト削減のヒント
1. **基本はモックAPI** - 開発・テストはモックAPIを使用
2. **デモ時のみ本番** - プレゼンテーションやデモ時のみ本番APIを有効化
3. **学生には非推奨** - 学生が使用する場合はモックAPIのみに制限
4. **使用後はOFF** - テスト完了後は必ずモックAPIに戻す

## トラブルシューティング

### Q1: 環境変数が反映されない
**A**: Vercelでは環境変数を追加した後、再デプロイが必要です。
- Deploymentsタブから最新のデプロイメントを「Redeploy」してください。

### Q2: APIキーが無効と表示される
**A**: APIキーが正しくコピーされているか確認してください。
- 先頭や末尾に空白が入っていないか
- キーが完全にコピーされているか（途中で切れていないか）

### Q3: レート制限エラーが出る
**A**: Anthropicのレート制限に達しています。
- 数分待ってから再試行してください
- Anthropic Consoleでプランを確認してください

### Q4: コストが心配
**A**: 使用量アラートを設定してください。
- Anthropic Consoleの「Settings」→「Billing」→「Usage Limits」
- 推奨: Monthly limit $10

## 注意事項

⚠️ **本番APIは必ず必要な時だけ使用してください**
⚠️ **テスト後は必ずモックAPIに戻してください**
⚠️ **APIキーは絶対に公開しないでください**
⚠️ **使用量は定期的に確認してください**

## 参考リンク

- [Anthropic Console](https://console.anthropic.com/)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [API切り替え機能の使い方](./API_SWITCHING.md)
