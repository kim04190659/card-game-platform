
---

## プラットフォームの汎用性設計

### 設計思想

このカードゲーム基盤は、**設定ファイル（JSON）の変更だけで、様々な業界・テーマに対応できる汎用プラットフォーム**として設計します。

#### 汎用化の3原則

1. **コードはゲームに依存しない**
   - OutputGenerator.js、Evaluator.jsは、どのゲームでも同じコードで動作
   
2. **ゲーム固有の要素は設定ファイルに集約**
   - プロンプトテンプレート、ガイドライン、成果物の構成など
   
3. **拡張性の確保**
   - 新しいゲームを追加する際、既存コードへの影響ゼロ

---

### ゲーム設定JSONの拡張仕様

#### 追加フィールド一覧
```json
{
  "gameId": "string",
  "gameName": "string",
  
  // ========== 新規追加 ==========
  
  // 成果物の種類
  "outputType": "string",
  // 例: "スマートシティ構想書", "運用改善計画書", "RFP提案書"
  
  // プロンプトテンプレート（成果物生成用）
  "outputPromptTemplate": "string",
  // テンプレート変数: {role}, {outputType}, {cardInfo}, {userInputs}, 
  //                  {guidelines}, {requirements}, {structure}
  
  // ガイドライン（ゲームごとの哲学・方針）
  "guidelines": [
    "string"
  ],
  // 例: ["エクセレントサービスの視点を持つこと", "ITIL/SIAMに基づくこと"]
  
  // 要求事項（成果物の品質基準）
  "requirements": [
    "string"
  ],
  // 例: ["具体的で実行可能であること", "コスト削減効果を定量的に示すこと"]
  
  // 成果物の構成（章立て）
  "outputStructure": [
    "string"
  ],
  // 例: ["概要", "背景・課題", "提案内容", "実施計画", "期待効果"]
  
  // 役割（AIに与える役割）
  "role": "string",
  // 例: "自治体DXコンサルタント", "IT運用スペシャリスト"
  
  // 評価プロンプトテンプレート
  "evaluationPromptTemplate": "string",
  // テンプレート変数: {outputType}, {output}, {criteria}, {cardInfo}, {userInputs}
  
  // ========== 既存フィールド ==========
  
  "cardCategories": [...],
  "cards": [...],
  "inputFields": [...],
  "evaluationCriteria": [...]
}
```

---

### プロンプトテンプレートの変数仕様

#### 変数一覧

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `{role}` | AIに与える役割 | 自治体DXコンサルタント |
| `{outputType}` | 成果物の種類 | スマートシティ構想書 |
| `{cardInfo}` | 選択されたカードの情報 | （自動生成） |
| `{userInputs}` | ユーザー入力の情報 | （自動生成） |
| `{guidelines}` | ガイドライン | （設定ファイルから） |
| `{requirements}` | 要求事項 | （設定ファイルから） |
| `{structure}` | 成果物の構成 | （設定ファイルから） |
| `{criteria}` | 評価基準 | （設定ファイルから） |
| `{output}` | 生成された成果物 | （評価時に使用） |

#### テンプレート例

##### 成果物生成用テンプレート
```
あなたは経験豊富な{role}です。
以下の情報に基づいて、実践的な{outputType}を作成してください。

【選択されたカード】
{cardInfo}

【ユーザー入力情報】
{userInputs}

【ガイドライン】
{guidelines}

【要求事項】
{requirements}

【出力形式】
以下の構成で作成してください:
{structure}
```

##### 評価用テンプレート
```
あなたは公平な評価者です。
以下の{outputType}を評価基準に基づいて評価してください。

【{outputType}】
{output}

【選択されたカード】
{cardInfo}

【ユーザー入力情報】
{userInputs}

【評価基準】
{criteria}

【評価方法】
1. 各評価基準について0-100点で採点
2. 採点理由を簡潔に説明（100-200文字）
3. 改善提案を3つ挙げる
4. JSON形式で返答

返答形式:
{
  "scores": { ... },
  "reasons": { ... },
  "improvements": [ ... ],
  "overallScore": ...,
  "feedback": "..."
}
```

---

### OutputGenerator.jsの改善版設計

#### クラス構造（汎用化版）
```javascript
class OutputGenerator {
  constructor(game, selectedCards, userInputs) {
    this.game = game;
    this.selectedCards = selectedCards;
    this.userInputs = userInputs;
  }
  
  /**
   * プロンプト生成（ゲーム設定から動的に構築）
   */
  buildPrompt() {
    // 1. テンプレートを取得
    let template = this.game.outputPromptTemplate;
    
    // 2. 変数のマッピングを作成
    const replacements = {
      '{role}': this.game.role || 'ビジネスコンサルタント',
      '{outputType}': this.game.outputType,
      '{cardInfo}': this.formatCardInfo(),
      '{userInputs}': this.formatUserInputs(),
      '{guidelines}': this.formatGuidelines(),
      '{requirements}': this.formatRequirements(),
      '{structure}': this.formatStructure()
    };
    
    // 3. テンプレート内の変数を置換
    for (const [key, value] of Object.entries(replacements)) {
      template = template.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    }
    
    return template;
  }
  
  /**
   * カード情報を整形
   */
  formatCardInfo() {
    const cardsByCategory = {};
    
    // カテゴリごとにグループ化
    this.selectedCards.forEach(card => {
      const category = this.game.cardCategories.find(
        c => c.categoryId === card.categoryId
      );
      
      if (!cardsByCategory[category.categoryName]) {
        cardsByCategory[category.categoryName] = [];
      }
      cardsByCategory[category.categoryName].push(card.cardName);
    });
    
    // 整形して返す
    let result = '';
    for (const [categoryName, cards] of Object.entries(cardsByCategory)) {
      result += `${categoryName}: ${cards.join(', ')}\n`;
    }
    
    return result.trim();
  }
  
  /**
   * ユーザー入力を整形
   */
  formatUserInputs() {
    let result = '';
    
    Object.entries(this.userInputs).forEach(([fieldId, value]) => {
      const field = this.game.inputFields.find(f => f.fieldId === fieldId);
      if (field) {
        result += `${field.fieldName}: ${value}\n`;
      }
    });
    
    return result.trim();
  }
  
  /**
   * ガイドラインを整形
   */
  formatGuidelines() {
    if (!this.game.guidelines || this.game.guidelines.length === 0) {
      return '（特になし）';
    }
    
    return this.game.guidelines
      .map((g, i) => `${i + 1}. ${g}`)
      .join('\n');
  }
  
  /**
   * 要求事項を整形
   */
  formatRequirements() {
    if (!this.game.requirements || this.game.requirements.length === 0) {
      return '（特になし）';
    }
    
    return this.game.requirements
      .map((r, i) => `${i + 1}. ${r}`)
      .join('\n');
  }
  
  /**
   * 成果物構成を整形
   */
  formatStructure() {
    if (!this.game.outputStructure || this.game.outputStructure.length === 0) {
      return '（自由形式）';
    }
    
    return this.game.outputStructure
      .map((s, i) => `${i + 1}. ${s}`)
      .join('\n');
  }
  
  /**
   * 成果物生成（AI呼び出し）
   */
  async generate() {
    const prompt = this.buildPrompt();
    
    try {
      // Vercel Serverless Function経由でClaude API呼び出し
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error(`API呼び出しエラー: ${response.status}`);
      }
      
      const data = await response.json();
      return data.content;
      
    } catch (error) {
      console.error('成果物生成エラー:', error);
      throw error;
    }
  }
}
```

---

### Evaluator.jsの改善版設計

#### クラス構造（汎用化版）
```javascript
class Evaluator {
  constructor(game, output, selectedCards, userInputs) {
    this.game = game;
    this.output = output;
    this.selectedCards = selectedCards;
    this.userInputs = userInputs;
  }
  
  /**
   * 評価プロンプト生成（ゲーム設定から動的に構築）
   */
  buildEvaluationPrompt() {
    // 1. テンプレートを取得
    let template = this.game.evaluationPromptTemplate;
    
    // 2. 変数のマッピングを作成
    const replacements = {
      '{outputType}': this.game.outputType,
      '{output}': this.output,
      '{cardInfo}': this.formatCardInfo(),
      '{userInputs}': this.formatUserInputs(),
      '{criteria}': this.formatCriteria()
    };
    
    // 3. テンプレート内の変数を置換
    for (const [key, value] of Object.entries(replacements)) {
      template = template.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    }
    
    return template;
  }
  
  /**
   * 評価基準を整形
   */
  formatCriteria() {
    return this.game.evaluationCriteria
      .map((c, i) => {
        const weight = Math.round(c.weight * 100);
        return `${i + 1}. ${c.criteriaName}（重み: ${weight}%）: ${c.description}`;
      })
      .join('\n');
  }
  
  /**
   * カード情報を整形（OutputGeneratorと同じ）
   */
  formatCardInfo() {
    // 実装は OutputGenerator.formatCardInfo() と同じ
  }
  
  /**
   * ユーザー入力を整形（OutputGeneratorと同じ）
   */
  formatUserInputs() {
    // 実装は OutputGenerator.formatUserInputs() と同じ
  }
  
  /**
   * 評価実施（AI呼び出し）
   */
  async evaluate() {
    const prompt = this.buildEvaluationPrompt();
    
    try {
      // Vercel Serverless Function経由でClaude API呼び出し
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error(`API呼び出しエラー: ${response.status}`);
      }
      
      const data = await response.json();
      
      // レスポンスからJSON部分を抽出
      const jsonMatch = data.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('評価結果のパースに失敗しました');
      }
      
      const evaluation = JSON.parse(jsonMatch[0]);
      
      // バリデーション
      this.validateEvaluation(evaluation);
      
      return evaluation;
      
    } catch (error) {
      console.error('評価エラー:', error);
      throw error;
    }
  }
  
  /**
   * 評価結果のバリデーション
   */
  validateEvaluation(evaluation) {
    // 必須フィールドのチェック
    if (!evaluation.scores || !evaluation.reasons || 
        !evaluation.improvements || !evaluation.overallScore) {
      throw new Error('評価結果の形式が不正です');
    }
    
    // スコアの範囲チェック（0-100）
    for (const [key, score] of Object.entries(evaluation.scores)) {
      if (score < 0 || score > 100) {
        throw new Error(`スコアが範囲外です: ${key} = ${score}`);
      }
    }
    
    // 改善提案が3つあるかチェック
    if (!Array.isArray(evaluation.improvements) || 
        evaluation.improvements.length < 3) {
      throw new Error('改善提案が不足しています');
    }
  }
}
```

---

### 他のゲームの設定例

#### 1. 自治体DX推進ゲーム（city-dx.json）
```json
{
  "gameId": "city-dx-promotion",
  "gameName": "自治体DX推進ゲーム",
  "outputType": "スマートシティ構想書",
  "role": "自治体DXコンサルタント",
  
  "outputPromptTemplate": "あなたは経験豊富な{role}です。\n以下の情報に基づいて、実践的な{outputType}を作成してください。\n\n【選択されたカード】\n{cardInfo}\n\n【ユーザー入力情報】\n{userInputs}\n\n【木村好孝からのガイドライン】\n{guidelines}\n\n【要求事項】\n{requirements}\n\n【出力形式】\n以下の構成で作成してください:\n{structure}",
  
  "guidelines": [
    "エクセレントサービスの視点を持つこと",
    "実務経験に基づく実践的な内容にすること",
    "住民視点での価値提供を重視すること",
    "段階的な実施計画を明示すること"
  ],
  
  "requirements": [
    "具体的で実行可能な提案であること",
    "ユーザーが入力した独自の強みを活かすこと",
    "予算や期間の制約を考慮すること",
    "持続可能な運用体制を提案すること"
  ],
  
  "outputStructure": [
    "概要",
    "背景・課題",
    "提案内容",
    "実施計画",
    "期待効果"
  ],
  
  "evaluationPromptTemplate": "あなたは公平な評価者です。\n以下の{outputType}を評価基準に基づいて評価してください。\n\n【{outputType}】\n{output}\n\n【選択されたカード】\n{cardInfo}\n\n【ユーザー入力情報】\n{userInputs}\n\n【評価基準】\n{criteria}\n\n【評価方法】\n1. 各評価基準について0-100点で採点\n2. 採点理由を簡潔に説明（100-200文字）\n3. 改善提案を3つ挙げる\n4. JSON形式で返答",
  
  "evaluationCriteria": [
    {
      "criteriaId": "feasibility",
      "criteriaName": "実現可能性",
      "description": "技術的・予算的に実現可能か",
      "weight": 0.3
    },
    {
      "criteriaId": "resident_benefit",
      "criteriaName": "住民メリット",
      "description": "住民にとっての具体的なメリット",
      "weight": 0.3
    },
    {
      "criteriaId": "sustainability",
      "criteriaName": "持続可能性",
      "description": "長期的に運用・発展できるか",
      "weight": 0.2
    },
    {
      "criteriaId": "innovation",
      "criteriaName": "革新性",
      "description": "新しい価値を生み出すか",
      "weight": 0.2
    }
  ]
}
```

#### 2. IT運用エクセレンスゲーム（it-operations.json）
```json
{
  "gameId": "it-operations-excellence",
  "gameName": "IT運用エクセレンス",
  "outputType": "運用改善計画書",
  "role": "IT運用スペシャリスト",
  
  "outputPromptTemplate": "あなたは35年の実務経験を持つ{role}です。\n以下の情報に基づいて、実践的な{outputType}を作成してください。\n\n【選択されたカード】\n{cardInfo}\n\n【ユーザー入力情報】\n{userInputs}\n\n【木村好孝からのガイドライン】\n{guidelines}\n\n【要求事項】\n{requirements}\n\n【出力形式】\n以下の構成で作成してください:\n{structure}",
  
  "guidelines": [
    "エクセレントサービスの視点を持つこと",
    "ITIL/SIAMのベストプラクティスに基づくこと",
    "運用の標準化・自動化を重視すること",
    "Make or Buy の判断基準を明示すること",
    "ホワイトボックス化（暗黙知の形式知化）を推進すること"
  ],
  
  "requirements": [
    "具体的で実行可能な改善策であること",
    "現場の運用負荷を考慮すること",
    "コスト削減効果を定量的に示すこと",
    "品質とセキュリティを両立すること"
  ],
  
  "outputStructure": [
    "現状分析（As-Is）",
    "課題の特定",
    "改善提案（To-Be）",
    "実施計画（3-6ヶ月）",
    "期待効果（コスト削減率、品質向上指標）"
  ],
  
  "evaluationPromptTemplate": "あなたは公平な評価者です。\n以下の{outputType}を評価基準に基づいて評価してください。\n\n【{outputType}】\n{output}\n\n【選択されたカード】\n{cardInfo}\n\n【ユーザー入力情報】\n{userInputs}\n\n【評価基準】\n{criteria}\n\n【評価方法】\n1. 各評価基準について0-100点で採点\n2. 採点理由を簡潔に説明（100-200文字）\n3. 改善提案を3つ挙げる\n4. JSON形式で返答",
  
  "evaluationCriteria": [
    {
      "criteriaId": "feasibility",
      "criteriaName": "実現可能性",
      "description": "現場で実際に実施可能か",
      "weight": 0.25
    },
    {
      "criteriaId": "cost_efficiency",
      "criteriaName": "コスト効率",
      "description": "投資対効果が明確か",
      "weight": 0.25
    },
    {
      "criteriaId": "quality_improvement",
      "criteriaName": "品質向上",
      "description": "運用品質が向上するか",
      "weight": 0.25
    },
    {
      "criteriaId": "standardization",
      "criteriaName": "標準化",
      "description": "運用の標準化に貢献するか",
      "weight": 0.25
    }
  ]
}
```

#### 3. 営業支援ソリューションゲーム（sales-support.json）
```json
{
  "gameId": "sales-support-solution",
  "gameName": "営業支援ソリューション",
  "outputType": "RFP提案書",
  "role": "営業支援コンサルタント",
  
  "outputPromptTemplate": "あなたは経験豊富な{role}です。\n以下の情報に基づいて、実践的な{outputType}を作成してください。\n\n【選択されたカード】\n{cardInfo}\n\n【ユーザー入力情報】\n{userInputs}\n\n【ガイドライン】\n{guidelines}\n\n【要求事項】\n{requirements}\n\n【出力形式】\n以下の構成で作成してください:\n{structure}",
  
  "guidelines": [
    "顧客視点での価値提供を重視すること",
    "競合との差別化ポイントを明確にすること",
    "実現可能性を具体的に示すこと",
    "ROI（投資対効果）を定量的に示すこと"
  ],
  
  "requirements": [
    "顧客の課題を的確に捉えていること",
    "提案内容が具体的で実行可能であること",
    "価格と価値のバランスが取れていること",
    "導入後のサポート体制が明確であること"
  ],
  
  "outputStructure": [
    "提案概要（エグゼクティブサマリー）",
    "顧客課題の理解",
    "ソリューション提案",
    "導入計画",
    "見積もり",
    "期待効果（ROI）"
  ],
  
  "evaluationPromptTemplate": "あなたは公平な評価者です。\n以下の{outputType}を評価基準に基づいて評価してください。\n\n【{outputType}】\n{output}\n\n【選択されたカード】\n{cardInfo}\n\n【ユーザー入力情報】\n{userInputs}\n\n【評価基準】\n{criteria}\n\n【評価方法】\n1. 各評価基準について0-100点で採点\n2. 採点理由を簡潔に説明（100-200文字）\n3. 改善提案を3つ挙げる\n4. JSON形式で返答",
  
  "evaluationCriteria": [
    {
      "criteriaId": "customer_understanding",
      "criteriaName": "顧客理解",
      "description": "顧客の課題を正確に理解しているか",
      "weight": 0.3
    },
    {
      "criteriaId": "solution_quality",
      "criteriaName": "提案品質",
      "description": "提案内容が具体的で実行可能か",
      "weight": 0.3
    },
    {
      "criteriaId": "value_for_money",
      "criteriaName": "価格妥当性",
      "description": "価格と価値のバランスが取れているか",
      "weight": 0.2
    },
    {
      "criteriaId": "differentiation",
      "criteriaName": "差別化",
      "description": "競合との差別化が明確か",
      "weight": 0.2
    }
  ]
}
```

---

### 新規ゲーム追加の手順

#### Step 1: ゲーム設定JSONを作成
```bash
# 新しいゲーム用のJSONを作成
cp data/games/city-dx.json data/games/new-game.json

# 以下の項目を編集:
# - gameId, gameName
# - outputType, role
# - guidelines, requirements, outputStructure
# - evaluationCriteria
# - cardCategories, cards, inputFields
```

#### Step 2: カード画像を準備（オプション）
```bash
# カード画像を配置
public/images/cards/new-game/
  ├── persona-001.png
  ├── issue-001.png
  └── solution-001.png
```

#### Step 3: ゲーム選択画面に追加
```javascript
// game-selection.html内のゲームリストに追加
const games = [
  { id: 'city-dx', name: '自治体DX推進', icon: '🏙️' },
  { id: 'it-operations', name: 'IT運用エクセレンス', icon: '⚙️' },
  { id: 'sales-support', name: '営業支援ソリューション', icon: '📊' },
  { id: 'new-game', name: '新しいゲーム', icon: '🎮' }  // ← 追加
];
```

#### Step 4: 動作確認

1. アクセスキー入力
2. 新しいゲームを選択
3. カード選択
4. テキスト入力
5. 成果物生成
6. 評価実施

---

### プラットフォームの拡張性まとめ

#### コード変更不要で追加できるもの

✅ 新しいゲーム（設定JSONのみ）
✅ カードの内容
✅ 入力フィールド
✅ 評価基準
✅ プロンプトテンプレート
✅ ガイドライン
✅ 成果物の構成

#### コード変更が必要なもの

⚠️ ゲーム選択画面のUI（ゲームリスト）
⚠️ 新しい入力タイプの追加（例: ファイルアップロード）
⚠️ 新しい評価方法の追加（例: 画像評価）

---

**重要**: この汎用性設計により、木村さんは**年間10種類以上のゲームを追加**しても、コアコードへの影響をゼロに保つことができます。

