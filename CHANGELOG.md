# Changelog

## [Unreleased]

## [1.1.0] - 2024-11-24

### Added - Phase 9
- **コンビニDX革新ゲーム追加**: 高専生向けの身近な題材
  - トランプベース（4スート × 13枚 = 52枚）
  - セミランダム選択機能（CardShuffler.js）
  - カテゴリごとにカードをシャッフル表示
  - 「自分の付加価値」入力で創造性を刺激
- CardShuffler.js: Fisher-Yates アルゴリズムによるシャッフル機能
- convenience-store-dx.json: 52枚のカード定義

### Changed
- CardSelector.js: シャッフル機能統合（useCardShuffle対応）
- game-selection.html: CardShuffler.js読み込み追加
- api/generate-mock.js: コンビニDX用モック追加
- api/evaluate-mock.js: コンビニDX用評価追加

### Fixed
- convenience-store-dx.json: 評価基準IDを明示的に指定してスコア表示を修正

## [1.0.0] - 2024-11-16

### Added（Phase 8）
- 本番API連携機能
  - API切り替えスイッチ（モック/本番）
  - 本番APIエンドポイント（generate.js, evaluate.js）
  - Vercel環境変数サポート
  - コスト表示・管理機能
- ドキュメント
  - `docs/API_SWITCHING.md`
  - `docs/PRODUCTION_API_SETUP.md`
  - `docs/DEVELOPMENT_STATUS.md`
  - `CHANGELOG.md`

### Added（Phase 7）
- ITセキュリティソリューション創出ゲーム
  - 5カテゴリ、32枚のカード
  - 高校生・情報系学生向け教育コンテンツ
  - モックAPI対応

### Added（Phase 6）
- 品質保証ツール
  - JSONバリデーションスクリプト（validate-game.js）
  - 全ゲーム一括バリデーション（validate-all-games.js）
  - 新ゲームテンプレート（game-template.json）
- ドキュメント
  - `docs/NEW_GAME_CHECKLIST.md`

### Added（Phase 4-5）
- ゲーム一覧管理（GameManager.js内で管理）
- 2つ目のゲーム（robot-solution）
- 3つ目のゲーム（it-operations-excellence）
- エラーハンドリング改善

### Added（Phase 1-3）
- 基盤システム
  - 認証機能（AuthManager）
  - ゲーム管理（GameManager）
  - カード選択（CardSelector）
  - AI連携（OutputGenerator, Evaluator）
- UI実装（6画面）
- モックAPI

### Changed
- OutputGenerator: localStorage制御を追加（shouldUseMock()）
- Evaluator: localStorage制御を追加（shouldUseMock()）
- game-selection.html: API切り替えUIを追加
- README.md: Phase 8完了版に全面刷新
- package.json: v1.0.0に更新

### Fixed
- evaluation.html: もう一度挑戦ボタンでゲームIDを保持
- evaluate-mock.js: scoresキーをcriteriaIdに統一
- ブラウザキャッシュ問題
- 認証フロー
- エラーハンドリング

---

## [0.9.0] - 2024-11初旬（Phase 1-3）

### Added
- 初期リリース
- 自治体DXゲーム
- 基本機能一式

---

**フォーマット**: [Keep a Changelog](https://keepachangelog.com/)
**バージョニング**: [Semantic Versioning](https://semver.org/)
