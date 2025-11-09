/**
 * InputManager.js
 * ユーザー入力データの管理クラス
 */

class InputManager {
  constructor(game) {
    this.game = game;
    this.inputFields = game.inputFields || [];
    this.userInputs = {};
    this.errors = {};
  }

  /**
   * 入力フィールド定義を取得
   * @returns {Array<Object>} 入力フィールド一覧
   */
  getInputFields() {
    return this.inputFields.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /**
   * ユーザー入力を設定
   * @param {string} fieldId フィールドID
   * @param {any} value 入力値
   */
  setInput(fieldId, value) {
    this.userInputs[fieldId] = value;
    // 入力時にそのフィールドのエラーをクリア
    delete this.errors[fieldId];
  }

  /**
   * ユーザー入力を取得
   * @param {string} fieldId フィールドID
   * @returns {any} 入力値
   */
  getInput(fieldId) {
    return this.userInputs[fieldId];
  }

  /**
   * すべての入力を取得
   * @returns {Object} すべての入力データ
   */
  getAllInputs() {
    return { ...this.userInputs };
  }

  /**
   * 入力データをクリア
   */
  clearAll() {
    this.userInputs = {};
    this.errors = {};
  }

  /**
   * バリデーション実行
   * @returns {Object} バリデーション結果 {valid: boolean, errors: Array}
   */
  validate() {
    this.errors = {};
    const errorList = [];

    this.inputFields.forEach(field => {
      const value = this.userInputs[field.fieldId];

      // 必須チェック
      if (field.required && this.isEmpty(value)) {
        const error = {
          fieldId: field.fieldId,
          fieldName: field.fieldName,
          message: `${field.fieldName}は必須項目です`
        };
        this.errors[field.fieldId] = error.message;
        errorList.push(error);
        return;
      }

      // 値が空の場合、それ以降のバリデーションはスキップ
      if (this.isEmpty(value)) {
        return;
      }

      // 文字数チェック（text, textarea）
      if ((field.fieldType === 'text' || field.fieldType === 'textarea') && typeof value === 'string') {
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          const error = {
            fieldId: field.fieldId,
            fieldName: field.fieldName,
            message: `${field.fieldName}は${field.validation.minLength}文字以上で入力してください（現在${value.length}文字）`
          };
          this.errors[field.fieldId] = error.message;
          errorList.push(error);
        }

        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          const error = {
            fieldId: field.fieldId,
            fieldName: field.fieldName,
            message: `${field.fieldName}は${field.validation.maxLength}文字以内で入力してください（現在${value.length}文字）`
          };
          this.errors[field.fieldId] = error.message;
          errorList.push(error);
        }
      }

      // 数値範囲チェック（number）
      if (field.fieldType === 'number') {
        const numValue = Number(value);
        
        if (isNaN(numValue)) {
          const error = {
            fieldId: field.fieldId,
            fieldName: field.fieldName,
            message: `${field.fieldName}は数値で入力してください`
          };
          this.errors[field.fieldId] = error.message;
          errorList.push(error);
          return;
        }

        if (field.validation?.min !== undefined && numValue < field.validation.min) {
          const error = {
            fieldId: field.fieldId,
            fieldName: field.fieldName,
            message: `${field.fieldName}は${field.validation.min}以上で入力してください`
          };
          this.errors[field.fieldId] = error.message;
          errorList.push(error);
        }

        if (field.validation?.max !== undefined && numValue > field.validation.max) {
          const error = {
            fieldId: field.fieldId,
            fieldName: field.fieldName,
            message: `${field.fieldName}は${field.validation.max}以下で入力してください`
          };
          this.errors[field.fieldId] = error.message;
          errorList.push(error);
        }
      }
    });

    return {
      valid: errorList.length === 0,
      errors: errorList
    };
  }

  /**
   * 値が空かどうかを判定
   * @param {any} value 値
   * @returns {boolean} 空ならtrue
   */
  isEmpty(value) {
    if (value === null || value === undefined) {
      return true;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return true;
    }
    if (Array.isArray(value) && value.length === 0) {
      return true;
    }
    return false;
  }

  /**
   * 特定フィールドのエラーを取得
   * @param {string} fieldId フィールドID
   * @returns {string|null} エラーメッセージ
   */
  getError(fieldId) {
    return this.errors[fieldId] || null;
  }

  /**
   * すべてのエラーを取得
   * @returns {Object} エラーオブジェクト
   */
  getAllErrors() {
    return { ...this.errors };
  }

  /**
   * 入力データをJSON形式で取得（保存用）
   * @returns {Object} ユーザー入力データ
   */
  toJSON() {
    return {
      inputId: this.generateId(),
      gameId: this.game.gameId,
      timestamp: new Date().toISOString(),
      fields: Object.entries(this.userInputs).map(([fieldId, value]) => ({
        fieldId: fieldId,
        value: value
      }))
    };
  }

  /**
   * JSON形式のデータから復元
   * @param {Object} jsonData ユーザー入力データ
   */
  fromJSON(jsonData) {
    this.userInputs = {};
    if (jsonData && jsonData.fields) {
      jsonData.fields.forEach(field => {
        this.userInputs[field.fieldId] = field.value;
      });
    }
  }

  /**
   * ユニークIDを生成
   * @returns {string} ID
   */
  generateId() {
    return 'input_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 入力データのサマリーを取得（デバッグ用）
   * @returns {string} サマリー文字列
   */
  getSummary() {
    let summary = '【ユーザー入力情報】\n';
    
    this.inputFields.forEach(field => {
      const value = this.userInputs[field.fieldId];
      if (value !== undefined && value !== null && value !== '') {
        summary += `${field.fieldName}: ${value}\n`;
      }
    });

    return summary;
  }
}

// グローバルスコープに公開（ES6モジュールを使わない場合）
if (typeof window !== 'undefined') {
  window.InputManager = InputManager;
}
