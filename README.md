# カードゲーム基盤ソフトウェア

## 概要
設定ファイル（JSON）を変更するだけで、様々なテーマ・業界に対応したカードゲームを提供できる汎用教育プラットフォーム。

## 特徴
- ✅ **汎用性**: JSONファイルで新ゲーム追加（コード変更不要）
- ✅ **AI連携**: Claude Sonnet 4.5による成果物生成・評価
- ✅ **品質保証**: 自動バリデーションツール
- ✅ **コスト管理**: モック/本番API切り替え機能
- ✅ **認証機能**: アクセスキーによる利用制限

## 実装済みゲーム

現在、以下の6つのゲームが利用可能です：

### 1. 自治体DX推進ゲーム
- **対象**: 自治体職員、地域活性化に関心のある人
- **内容**: 地方中核市のスマートシティ構想を立案
- **カード数**: 18枚（ペルソナ4 + 課題6 + ソリューション8）
- **評価基準**: 実現可能性、住民メリット、持続可能性、革新性

### 2. ロボットソリューション創出ゲーム
- **対象**: ロボット開発企業、製造業、エンジニア
- **内容**: ロボット技術で顧客課題を解決
- **カード数**: 18枚（業界4 + 課題6 + 技術8）
- **評価基準**: 技術的実現性、市場性、コスト競争力、革新性

### 3. IT運用エクセレンスゲーム
- **対象**: IT運用担当者、システム管理者
- **内容**: BIGLOBE・NEC Cloud IaaS事例で学ぶ運用標準化
- **カード数**: 20枚（組織4 + 課題6 + 改善策10）
- **評価基準**: 実現可能性、効果、コスト効率、革新性

### 4. ITセキュリティソリューション創出ゲーム
- **対象**: 高専ITセキュリティ学生、セキュリティエンジニア
- **内容**: 企業のセキュリティ課題を解決するビジネス提案
- **カード数**: 32枚（ペルソナ4 + 課題6 + 競合6 + パートナー6 + 技術10）
- **評価基準**: 技術的実現性、顧客ニーズ適合、競争力、実行可能性

### 5. コンビニDX革新ゲーム
- **対象**: 高専生、小売業に興味のある学生
- **内容**: 身近なコンビニを題材に、DX技術でビジネス革新を提案
- **カード数**: 52枚（トランプベース: ペルソナ13 + 競合13 + パートナー13 + 技術13）
- **特徴**:
  - **セミランダム選択**: カテゴリごとにカードをシャッフル、毎回異なる組み合わせ
  - **付加価値入力**: 学生が独自の付加価値を考える（創造性を刺激）
  - **身近な題材**: コンビニという誰もが知っている題材で盛り上がる
- **評価基準**: 実現可能性、コンビニ課題の理解、差別化・創造性、顧客価値

### 6. 携帯キャリアDX革新ゲーム 🆕
- **対象**: 半導体・電子工学系の高専生
- **内容**: 携帯電話事業者（NTTドコモ、au、ソフトバンク等）を題材に、半導体技術でネットワーク・サービスを革新
- **カード数**: 52枚（トランプベース: ♠️ペルソナ13 + ♥️競合13 + ♦️パートナー13 + ♣️技術13）
- **特徴**:
  - **♠️ ペルソナ**: 13種の携帯キャリア（NTTドコモ、au、ソフトバンク、楽天モバイル等）
  - **♥️ 競合企業**: 13種の国内外キャリア・テック企業（AT&T、Verizon、Qualcomm等）
  - **♦️ パートナー**: 13種の半導体メーカー・通信機器ベンダー（Qualcomm、TSMC、NEC等）
  - **♣️ 技術**: 13種の5G/6G技術・半導体ソリューション（省電力チップ、エッジAI、O-RAN等）
- **評価基準**: 技術的実現性、キャリア課題理解、差別化、事業性
- **教育的価値**: 半導体技術の社会実装を体験、5G/6Gの技術トレンド理解、国際競争を意識

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

## クイックスタート

### 学生の方へ
[学生向けクイックスタートガイド](docs/STUDENT_QUICK_GUIDE.md)を参照してください。
3分で使い方がわかります。

### 授業担当者の方へ
[ファシリテーターガイド](docs/FACILITATOR_GUIDE.md)を参照してください。
授業の進め方、トラブル対応などを記載しています。

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
- ✅ Phase 9: コンビニDX革新ゲーム追加

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

### 利用者向け
- [学生向けクイックスタートガイド](docs/STUDENT_QUICK_GUIDE.md)
- [ファシリテーターガイド](docs/FACILITATOR_GUIDE.md)

### 開発者向け
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
v1.2.0（Phase 10.5完了 - 携帯キャリアDXゲーム追加、ドキュメント充実）

---

最終更新: 2024-11-24
