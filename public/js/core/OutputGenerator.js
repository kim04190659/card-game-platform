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
   * モック/本番API切り替え判定
   */
  shouldUseMock() {
    // LocalStorageで制御（デフォルトはモック）
    const useMock = localStorage.getItem('use_mock_api');
    if (useMock === 'false') {
      console.log('🔴 本番API使用中（課金あり）');
      return false;  // 本番API使用
    }
    console.log('🟢 モックAPI使用中（無料）');
    return true;  // モック使用
  }

  /**
   * 成果物生成（AI呼び出し）
   * 注: 現在はモックAPIを使用（クレジット節約のため）
   */
  async generate() {
    const prompt = this.buildPrompt();

    try {
      // モード判定してAPIエンドポイントを選択
      const apiEndpoint = this.shouldUseMock() ? '/api/generate-mock' : '/api/generate';

      // Vercel Serverless Function経由でClaude API呼び出し
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          gameId: this.game.gameId  // ゲームIDを追加
        })
      });

      if (!response.ok) {
        throw new Error(`API呼び出しエラー: ${response.status}`);
      }

      const data = await response.json();

      // 成功時の統計記録
      await this._logStats(true, null);

      return data.content;

    } catch (error) {
      console.error('成果物生成エラー:', error);

      // 失敗時の統計記録
      await this._logStats(false, error);

      throw error;
    }
  }

  /**
   * 統計記録（エラーが発生してもgenerateは継続）
   */
  async _logStats(success, error) {
    try {
      if (typeof StatsLogger !== 'undefined') {
        const statsLogger = new StatsLogger();
        const accessKey = sessionStorage.getItem('accessKey') || 'unknown';
        await statsLogger.logOutputGeneration(this.game.gameId, accessKey, success, error);
        console.log('統計記録完了 (output generation)');
      }
    } catch (statsError) {
      console.warn('統計記録に失敗しました:', statsError);
    }
  }
}
