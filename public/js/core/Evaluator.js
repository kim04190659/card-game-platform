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
    const cardsByCategory = {};
    
    // カテゴリごとにグループ化
    this.selectedCards.forEach(cardItem => {
      // cardItemがオブジェクトでない場合（cardIdだけの場合）、完全な情報を取得
      let fullCard;
      if (typeof cardItem === 'string') {
        // cardIdの文字列の場合
        fullCard = this.game.cards.find(c => c.cardId === cardItem);
      } else if (cardItem.cardId) {
        // オブジェクトだが不完全な場合
        fullCard = this.game.cards.find(c => c.cardId === cardItem.cardId) || cardItem;
      } else {
        // 既に完全なオブジェクトの場合
        fullCard = cardItem;
      }
      
      if (fullCard) {
        const category = this.game.cardCategories.find(
          c => c.categoryId === fullCard.categoryId
        );
        
        if (category) {
          if (!cardsByCategory[category.categoryName]) {
            cardsByCategory[category.categoryName] = [];
          }
          cardsByCategory[category.categoryName].push(fullCard.cardName);
        }
      }
    });
    
    // 整形して返す
    let result = '';
    for (const [categoryName, cards] of Object.entries(cardsByCategory)) {
      result += `${categoryName}: ${cards.join(', ')}\n`;
    }
    
    return result.trim();
  }
  
  /**
   * ユーザー入力を整形（OutputGeneratorと同じ）
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
   * 評価実施（AI呼び出し）
   * 注: 現在はモックAPIを使用（クレジット節約のため）
   */
  async evaluate() {
    const prompt = this.buildEvaluationPrompt();
    
    try {
      // Vercel Serverless Function経由でClaude API呼び出し（モック版）
      const response = await fetch('/api/evaluate-mock', {
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
