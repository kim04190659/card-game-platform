# カードゲーム基盤ソフトウェア

## 概要
設定ファイル（JSON）を変更するだけで、様々なテーマ・業界に対応したカードゲームを提供できる汎用教育プラットフォーム。

## 特徴
- ✅ **汎用性**: JSONファイルで新ゲーム追加（コード変更不要）
- ✅ **AI連携**: Claude Sonnet 4.5による成果物生成・評価
- ✅ **品質保証**: 自動バリデーションツール
- ✅ **コスト管理**: モック/本番API切り替え機能
- ✅ **認証機能**: アクセスキーによる利用制限

## 実装済みゲーム（4種類）
1. **自治体DX推進ゲーム**: スマートシティ構想の立案
2. **ロボットソリューション創出ゲーム**: 製造業のロボット活用
3. **IT運用エクセレンスゲーム**: ITIL/SIAM実践
4. **ITセキュリティソリューション創出ゲーム**: 企業のセキュリティ課題解決

## 技術スタック
- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **バックエンド**: Vercel Serverless Functions (Node.js 18.x)
- **AI**: Anthropic Claude API (Sonnet 4.5)
- **ホスティング**: Vercel
- **バージョン管理**: Git / GitHub

## プロジェクト構成
```
card-game-platform/
├── public/               # フロントエンド
│   ├── access-key.html
│   ├── game-selection.html
│   ├── card-selection.html
│   ├── input.html
│   ├── output.html
│   ├── evaluation.html
│   ├── js/
│   │   ├── core/        # コアロジック
│   │   └── ui/          # UI処理
│   ├── css/
│   └── data/games/      # ゲーム定義JSON
├── api/                 # Serverless Functions
│   ├── generate.js      # 本番API（成果物生成）
│   ├── evaluate.js      # 本番API（評価）
│   ├── generate-mock.js # モックAPI
│   └── evaluate-mock.js # モックAPI
├── tools/               # 開発ツール
│   ├── validate-game.js
│   ├── validate-all-games.js
│   └── game-template.json
└── docs/                # ドキュメント
```

## セットアップ

### 前提条件
- Node.js 18.x以上
- Vercel CLI
- Anthropic APIキー（本番API使用時のみ）

### ローカル開発
```bash
# リポジトリをクローン
git clone https://github.com/kim04190659/card-game-platform.git
cd card-game-platform

# 依存パッケージをインストール
npm install

# 開発サーバー起動
vercel dev

# ブラウザで開く
open http://localhost:3000/access-key.html
```

### 環境変数（本番API使用時のみ）
```bash
# .env.local を作成
ANTHROPIC_API_KEY=your_api_key_here
```

## 使い方

### アクセスキー
デフォルトのアクセスキー:
- `demo-key-2024`
- `workshop-key-2024`

### API切り替え
- **デフォルト**: モックAPI（無料）
- **本番API**: ゲーム選択画面右上のスイッチでON
- **コスト**: 1ゲームあたり約$0.07

## 新ゲーム追加

### 1. テンプレートをコピー
```bash
cp tools/game-template.json public/data/games/your-game.json
```

### 2. JSONを編集
詳細は `docs/NEW_GAME_CHECKLIST.md` を参照

### 3. バリデーション
```bash
npm run validate public/data/games/your-game.json
```

### 4. GameManager.jsに登録
```javascript
const gameList = [
  // ...
  { id: 'your-game', name: 'あなたのゲーム名', file: 'your-game.json' }
];
```

### 5. モックAPI対応
`api/generate-mock.js` と `api/evaluate-mock.js` に追加

### 6. テスト
```bash
vercel dev
npm run validate-all
```

## 開発ワークフロー

### Phase完了状況
- ✅ Phase 1: 基盤構築
- ✅ Phase 2: UI実装
- ✅ Phase 3: AI連携
- ✅ Phase 4: 複数ゲーム対応
- ✅ Phase 5: エラーハンドリング改善
- ✅ Phase 6: 品質保証の仕組み構築
- ✅ Phase 7: ITセキュリティゲーム追加
- ✅ Phase 8: 本番API連携

### Git運用
- `main`: 本番環境
- `claude/*`: 開発ブランチ

## デプロイ

### Vercel自動デプロイ
```bash
git push origin main
```

Vercelが自動的にビルド・デプロイします。

### 本番URL
https://card-game-platform-five.vercel.app

## ドキュメント
- [開発状況](docs/DEVELOPMENT_STATUS.md)
- [変更履歴](CHANGELOG.md)
- [新ゲーム作成チェックリスト](docs/NEW_GAME_CHECKLIST.md)
- [API切り替えガイド](docs/API_SWITCHING.md)
- [本番APIセットアップ](docs/PRODUCTION_API_SETUP.md)

## トラブルシューティング

### よくある問題
1. **バリデーションエラー**: `npm run validate-all` で確認
2. **本番APIが動かない**: Vercel環境変数を確認
3. **モックに戻らない**: ブラウザのLocalStorageをクリア

詳細は各ドキュメントを参照してください。

## ライセンス
MIT License

## 作成者
木村好孝 × Claude

## バージョン
v1.0.0（Phase 8完了）

---

最終更新: 2024-11-16
