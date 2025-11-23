# 新ゲーム作成チェックリスト

このドキュメントは、カードゲーム基盤システムに新しいゲームを追加する際の手順とチェックリストです。

## 📋 目次

1. [事前準備](#事前準備)
2. [JSONファイル作成](#jsonファイル作成)
3. [バリデーション](#バリデーション)
4. [モックAPI対応](#モックapi対応)
5. [UI統合](#ui統合)
6. [テスト](#テスト)
7. [トラブルシューティング](#トラブルシューティング)

---

## 1. 事前準備

### ゲーム企画の確認

以下の項目を明確にしてください：

- [ ] ゲームの目的・テーマ
- [ ] 対象ユーザー（誰が使うのか）
- [ ] 生成する成果物（何を作るのか）
- [ ] カードカテゴリの種類（3-5種類推奨）
- [ ] 各カテゴリのカード数（各カテゴリ3-5枚推奨）
- [ ] ユーザー入力項目（2-5項目推奨）
- [ ] 評価基準（3-5項目推奨）

### 必要な情報の整理

| 項目 | 説明 | 例 |
|------|------|-----|
| ゲームID | 英数字とハイフン | `new-business-plan` |
| ゲーム名 | 日本語表示名 | `新規事業企画ゲーム` |
| 役割 | AIが担う役割 | `ビジネスコンサルタント` |
| 成果物 | 生成するドキュメント | `事業計画書` |

---

## 2. JSONファイル作成

### ステップ1: テンプレートをコピー

```bash
cp tools/game-template.json public/data/games/your-game-id.json
```

### ステップ2: 基本情報を編集

```json
{
  "gameId": "your-game-id",          // ユニークなID（英数字とハイフン）
  "gameName": "あなたのゲーム名",
  "description": "ゲームの説明",
  "version": "1.0.0",
  "author": "あなたの名前",
  "role": "AIの役割",
  "outputType": "成果物の種類"
}
```

**チェックポイント：**
- [ ] `gameId` は他のゲームと重複していない
- [ ] `gameName` は分かりやすい名前になっている
- [ ] `role` と `outputType` が明確に定義されている

### ステップ3: カードカテゴリを定義

```json
"cardCategories": [
  {
    "categoryId": "persona",           // カテゴリID
    "categoryName": "ペルソナ",         // 表示名
    "description": "対象ユーザー",      // 説明
    "minSelect": 1,                    // 最小選択数
    "maxSelect": 1,                    // 最大選択数
    "displayOrder": 1                  // 表示順序
  }
]
```

**チェックポイント：**
- [ ] 各カテゴリに `categoryId`, `categoryName`, `description` が設定されている
- [ ] `minSelect` ≤ `maxSelect` になっている
- [ ] `displayOrder` が重複していない

### ステップ4: カードを作成

```json
"cards": [
  {
    "cardId": "persona-001",           // ユニークなカードID
    "categoryId": "persona",           // どのカテゴリに属するか
    "cardName": "カード名",
    "description": "カードの説明",
    "icon": "😊"                       // 絵文字アイコン
  }
]
```

**チェックポイント：**
- [ ] すべてのカードに `cardId`, `categoryId`, `cardName`, `description` が設定されている
- [ ] `cardId` が重複していない
- [ ] `categoryId` が `cardCategories` に定義されている
- [ ] 各カテゴリに最低 `maxSelect` 枚以上のカードがある

### ステップ5: 入力フィールドを定義

```json
"inputFields": [
  {
    "fieldId": "project_name",
    "fieldName": "プロジェクト名",
    "fieldType": "text",              // text, textarea, number, select
    "description": "説明",
    "placeholder": "例: プロジェクトA",
    "required": true,
    "validation": {
      "maxLength": 100
    },
    "displayOrder": 1
  }
]
```

**チェックポイント：**
- [ ] `fieldType` が `text`, `textarea`, `number`, `select` のいずれか
- [ ] `required` フィールドに適切な検証ルールがある
- [ ] `displayOrder` が設定されている

### ステップ6: 評価基準を定義

```json
"evaluationCriteria": [
  {
    "criteriaId": "feasibility",      // 評価基準ID（英数字）
    "criteriaName": "実現可能性",      // 表示名
    "description": "技術的・予算的に実現可能か",
    "weight": 0.3                     // 重み（合計1.0）
  }
]
```

**チェックポイント：**
- [ ] `criteriaId` が英数字（日本語不可）
- [ ] `weight` の合計が 1.0 になっている
- [ ] 最低1つ以上の評価基準がある

### ステップ7: プロンプトテンプレートを設定

```json
"outputPromptTemplate": "あなたは{role}です。\n以下の情報に基づいて、{outputType}を作成してください。\n\n【選択されたカード】\n{cardInfo}\n\n【ユーザー入力情報】\n{userInputs}\n\n...",

"evaluationPromptTemplate": "あなたは公平な評価者です。\n以下の{outputType}を評価してください。\n\n【{outputType}】\n{output}\n\n【評価基準】\n{criteria}\n\n..."
```

**チェックポイント：**
- [ ] `{role}`, `{outputType}` などのプレースホルダーが適切に使われている
- [ ] 評価プロンプトに評価方法が明記されている

---

## 3. バリデーション

### ステップ1: バリデーション実行

```bash
node tools/validate-game.js public/data/games/your-game-id.json
```

### ステップ2: エラー修正

エラーが表示された場合は、メッセージに従って修正してください。

**よくあるエラー：**
- `必須フィールドが不足しています` → JSONに必要なフィールドを追加
- `categoryId が cardCategories に存在しません` → カードの `categoryId` を修正
- `weight の合計が 1.0 ではありません` → 評価基準の `weight` を調整

### ステップ3: 全ゲームバリデーション

```bash
npm run validate-all
```

すべてのゲームが正常に動作することを確認します。

---

## 4. モックAPI対応

開発・テスト用のモックAPIに新ゲームを追加します。

### ステップ1: generate-mock.js に追加

`api/generate-mock.js` を編集：

```javascript
const mockOutputs = {
  // ... 既存のゲーム
  'your-game-id': `【生成される成果物のサンプル】

概要:
...

詳細:
...
  `
};
```

### ステップ2: evaluate-mock.js に追加

`api/evaluate-mock.js` を編集：

```javascript
const mockEvaluations = {
  // ... 既存のゲーム
  'your-game-id': {
    scores: {
      'feasibility': 85,    // criteriaId と一致させる
      'innovation': 90
    },
    reasons: {
      'feasibility': '実現可能性に関するコメント',
      'innovation': '革新性に関するコメント'
    },
    improvements: [
      '改善提案1',
      '改善提案2',
      '改善提案3'
    ],
    overallScore: 87,
    feedback: '総合的なフィードバック',
    mockMode: true
  }
};
```

**重要:** `scores` と `reasons` のキーは、ゲームJSONの `evaluationCriteria` の `criteriaId` と完全に一致させてください。

---

## 5. UI統合

### ステップ1: GameManager.js に登録

`public/js/core/GameManager.js` の `loadGames()` メソッドを編集：

```javascript
const gameList = [
  { id: 'city-dx', name: '自治体DX推進ゲーム', file: 'city-dx.json' },
  { id: 'robot-solution', name: 'ロボットソリューション創出ゲーム', file: 'robot-solution.json' },
  { id: 'it-operations-excellence', name: 'IT運用エクセレンスゲーム', file: 'it-operations-excellence.json' },
  { id: 'your-game-id', name: 'あなたのゲーム名', file: 'your-game-id.json' }  // 追加
];
```

### ステップ2: game-selection.html に追加

`public/game-selection.html` を編集してゲーム選択カードを追加：

```html
<div class="grid-item" onclick="selectGame('your-game-id')">
  <h2>🎮 あなたのゲーム名</h2>
  <p style="color: #666; margin-bottom: 15px;">
    ゲームの説明
  </p>
  <div style="background: #f0f0f0; padding: 10px; border-radius: 8px; font-size: 14px;">
    <strong>対象:</strong> 対象ユーザー<br>
    <strong>所要時間:</strong> 2-3時間<br>
    <strong>難易度:</strong> ★★★☆☆
  </div>
</div>
```

---

## 6. テスト

### ローカルテスト

1. **ゲーム選択**
   - [ ] ゲーム選択画面に新ゲームが表示される
   - [ ] クリックするとカード選択画面に遷移する

2. **カード選択**
   - [ ] すべてのカテゴリが表示される
   - [ ] カードが正しく表示される
   - [ ] 選択制限（min/max）が機能する
   - [ ] 次へボタンが適切に有効/無効になる

3. **入力画面**
   - [ ] すべての入力フィールドが表示される
   - [ ] 入力検証が機能する
   - [ ] プレースホルダーが表示される

4. **成果物生成**
   - [ ] 成果物が正しく生成される
   - [ ] 選択したカードと入力内容が反映されている

5. **評価**
   - [ ] 総合評価が表示される
   - [ ] 各評価軸のスコアが表示される
   - [ ] 改善提案が表示される

### 本番デプロイ前チェック

- [ ] バリデーションがすべて通過する
- [ ] モックAPIが正しく動作する
- [ ] ローカルテストがすべて成功する
- [ ] コミットメッセージが明確
- [ ] Pull Requestに説明を追加

---

## 7. トラブルシューティング

### よくあるエラーと対処法

#### 「ゲームデータが取得できませんでした」
- ファイル名と `gameId` が一致しているか確認
- JSONの構文エラーがないか確認
- バリデーションを実行して問題を特定

#### 「評価軸のスコアが0点になる」
- `evaluate-mock.js` の `scores` キーが `criteriaId` と一致しているか確認
- 日本語名ではなく英語IDを使用しているか確認

#### 「カードが表示されない」
- `cards` の `categoryId` が `cardCategories` に存在するか確認
- JSON構文エラーがないか確認

#### 「もう一度挑戦ボタンでエラーになる」
- セッションストレージに `currentGameData` が保存されているか確認
- ゲームIDがURLパラメータとして渡されているか確認

### デバッグ方法

1. **ブラウザのコンソールを開く（F12キー）**
2. **Console タブでエラーメッセージを確認**
3. **Network タブでAPI呼び出しを確認**
4. **Application タブで SessionStorage を確認**

### サポート

問題が解決しない場合は、以下の情報を添えて報告してください：

- エラーメッセージ全文
- ブラウザのコンソールログ
- 実行した手順
- 期待される動作と実際の動作

---

## 付録: チェックリスト要約

### 作成段階

- [ ] テンプレートをコピー
- [ ] 基本情報を編集
- [ ] カードカテゴリを定義
- [ ] カードを作成（各カテゴリ3-5枚）
- [ ] 入力フィールドを定義
- [ ] 評価基準を定義（weight合計1.0）
- [ ] プロンプトテンプレートを設定

### バリデーション段階

- [ ] `node tools/validate-game.js` を実行
- [ ] すべてのエラーを修正
- [ ] `npm run validate-all` を実行

### 統合段階

- [ ] `generate-mock.js` に追加
- [ ] `evaluate-mock.js` に追加（criteriaIdを使用）
- [ ] `GameManager.js` に登録
- [ ] `game-selection.html` に追加

### テスト段階

- [ ] ゲーム選択が動作する
- [ ] カード選択が動作する
- [ ] 入力画面が動作する
- [ ] 成果物生成が動作する
- [ ] 評価が動作する
- [ ] もう一度挑戦が動作する

### デプロイ段階

- [ ] コミット・プッシュ
- [ ] Pull Request作成
- [ ] レビュー・マージ
- [ ] 本番環境で動作確認

---

これで新ゲームの追加作業は完了です！
