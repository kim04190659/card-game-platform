#!/usr/bin/env node

/**
 * ゲームJSON定義ファイルのバリデーションスクリプト
 *
 * 使用方法:
 *   node tools/validate-game.js <filepath>
 *
 * 例:
 *   node tools/validate-game.js public/data/games/city-dx.json
 */

const fs = require('fs');
const path = require('path');

// カラーコード
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

class GameValidator {
  constructor(filepath) {
    this.filepath = filepath;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * エラーを追加
   */
  addError(message) {
    this.errors.push(`${colors.red}✗${colors.reset} ${message}`);
  }

  /**
   * 警告を追加
   */
  addWarning(message) {
    this.warnings.push(`${colors.yellow}⚠${colors.reset} ${message}`);
  }

  /**
   * バリデーション実行
   */
  validate() {
    console.log(`${colors.blue}バリデーション開始:${colors.reset} ${this.filepath}\n`);

    // ファイル存在チェック
    if (!this.checkFileExists()) {
      return false;
    }

    // JSON読み込み
    const gameData = this.loadJSON();
    if (!gameData) {
      return false;
    }

    // 各種バリデーション
    this.validateRequiredFields(gameData);
    this.validateCardCategories(gameData);
    this.validateCards(gameData);
    this.validateInputFields(gameData);
    this.validateEvaluationCriteria(gameData);
    this.validateOutputTemplate(gameData);

    // 結果表示
    this.showResults();

    return this.errors.length === 0;
  }

  /**
   * ファイル存在チェック
   */
  checkFileExists() {
    if (!fs.existsSync(this.filepath)) {
      this.addError(`ファイルが見つかりません: ${this.filepath}`);
      return false;
    }
    return true;
  }

  /**
   * JSON読み込み
   */
  loadJSON() {
    try {
      const content = fs.readFileSync(this.filepath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.addError(`JSON構文エラー: ${error.message}`);
      } else {
        this.addError(`ファイル読み込みエラー: ${error.message}`);
      }
      return null;
    }
  }

  /**
   * 必須フィールドチェック
   */
  validateRequiredFields(data) {
    const required = [
      'gameId',
      'gameName',
      'cardCategories',
      'cards',
      'inputFields',
      'evaluationCriteria'
    ];

    required.forEach(field => {
      if (!data[field]) {
        this.addError(`必須フィールドが不足しています: ${field}`);
      }
    });

    // outputPromptTemplate または outputTemplate のいずれかが必要
    if (!data.outputPromptTemplate && !data.outputTemplate) {
      this.addError('outputPromptTemplate または outputTemplate のいずれかが必要です');
    }
  }

  /**
   * cardCategories検証
   */
  validateCardCategories(data) {
    if (!Array.isArray(data.cardCategories)) {
      this.addError('cardCategories は配列である必要があります');
      return;
    }

    if (data.cardCategories.length === 0) {
      this.addWarning('cardCategories が空です');
    }

    data.cardCategories.forEach((category, index) => {
      const required = ['categoryId', 'categoryName', 'description', 'minSelect', 'maxSelect'];
      required.forEach(field => {
        if (category[field] === undefined) {
          this.addError(`cardCategories[${index}]: 必須フィールド ${field} が不足しています`);
        }
      });

      // minSelect <= maxSelect チェック
      if (category.minSelect > category.maxSelect) {
        this.addError(`cardCategories[${index}]: minSelect (${category.minSelect}) が maxSelect (${category.maxSelect}) より大きいです`);
      }
    });
  }

  /**
   * cards検証
   */
  validateCards(data) {
    if (!Array.isArray(data.cards)) {
      this.addError('cards は配列である必要があります');
      return;
    }

    if (data.cards.length === 0) {
      this.addWarning('cards が空です');
      return;
    }

    const categoryIds = new Set(data.cardCategories?.map(c => c.categoryId) || []);
    const cardIds = new Set();

    data.cards.forEach((card, index) => {
      const required = ['cardId', 'categoryId', 'cardName', 'description'];
      required.forEach(field => {
        if (!card[field]) {
          this.addError(`cards[${index}]: 必須フィールド ${field} が不足しています`);
        }
      });

      // categoryId存在チェック
      if (card.categoryId && !categoryIds.has(card.categoryId)) {
        this.addError(`cards[${index}]: categoryId "${card.categoryId}" は cardCategories に存在しません`);
      }

      // cardId重複チェック
      if (card.cardId) {
        if (cardIds.has(card.cardId)) {
          this.addError(`cards[${index}]: cardId "${card.cardId}" が重複しています`);
        }
        cardIds.add(card.cardId);
      }
    });
  }

  /**
   * inputFields検証
   */
  validateInputFields(data) {
    if (!Array.isArray(data.inputFields)) {
      this.addError('inputFields は配列である必要があります');
      return;
    }

    if (data.inputFields.length === 0) {
      this.addWarning('inputFields が空です');
    }

    const fieldIds = new Set();

    data.inputFields.forEach((field, index) => {
      const required = ['fieldId', 'fieldName', 'fieldType'];
      required.forEach(requiredField => {
        if (!field[requiredField]) {
          this.addError(`inputFields[${index}]: 必須フィールド ${requiredField} が不足しています`);
        }
      });

      // fieldType検証
      const validTypes = ['text', 'textarea', 'number', 'select'];
      if (field.fieldType && !validTypes.includes(field.fieldType)) {
        this.addWarning(`inputFields[${index}]: fieldType "${field.fieldType}" は推奨されません。推奨: ${validTypes.join(', ')}`);
      }

      // fieldId重複チェック
      if (field.fieldId) {
        if (fieldIds.has(field.fieldId)) {
          this.addError(`inputFields[${index}]: fieldId "${field.fieldId}" が重複しています`);
        }
        fieldIds.add(field.fieldId);
      }
    });
  }

  /**
   * evaluationCriteria検証
   */
  validateEvaluationCriteria(data) {
    if (!Array.isArray(data.evaluationCriteria)) {
      this.addError('evaluationCriteria は配列である必要があります');
      return;
    }

    if (data.evaluationCriteria.length === 0) {
      this.addError('evaluationCriteria が空です（最低1つ必要）');
      return;
    }

    const criteriaIds = new Set();
    let totalWeight = 0;

    data.evaluationCriteria.forEach((criteria, index) => {
      const required = ['criteriaId', 'criteriaName', 'description', 'weight'];
      required.forEach(field => {
        if (criteria[field] === undefined) {
          this.addError(`evaluationCriteria[${index}]: 必須フィールド ${field} が不足しています`);
        }
      });

      // weight範囲チェック
      if (criteria.weight !== undefined) {
        if (criteria.weight < 0 || criteria.weight > 1) {
          this.addError(`evaluationCriteria[${index}]: weight は 0.0 〜 1.0 の範囲である必要があります（現在: ${criteria.weight}）`);
        }
        totalWeight += criteria.weight;
      }

      // criteriaId重複チェック
      if (criteria.criteriaId) {
        if (criteriaIds.has(criteria.criteriaId)) {
          this.addError(`evaluationCriteria[${index}]: criteriaId "${criteria.criteriaId}" が重複しています`);
        }
        criteriaIds.add(criteria.criteriaId);
      }
    });

    // weightの合計チェック
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      this.addWarning(`evaluationCriteria: weight の合計が 1.0 ではありません（現在: ${totalWeight.toFixed(2)}）`);
    }
  }

  /**
   * outputTemplate検証
   */
  validateOutputTemplate(data) {
    // outputPromptTemplate と outputTemplate のどちらかがあればOK
    if (data.outputPromptTemplate) {
      if (typeof data.outputPromptTemplate !== 'string') {
        this.addError('outputPromptTemplate は文字列である必要があります');
      }
      return;
    }

    if (data.outputTemplate) {
      if (typeof data.outputTemplate !== 'object') {
        this.addError('outputTemplate はオブジェクトである必要があります');
        return;
      }

      const required = ['template'];
      required.forEach(field => {
        if (!data.outputTemplate[field]) {
          this.addError(`outputTemplate: 必須フィールド ${field} が不足しています`);
        }
      });
    }
  }

  /**
   * 結果表示
   */
  showResults() {
    console.log('\n' + '='.repeat(60));
    console.log('バリデーション結果');
    console.log('='.repeat(60) + '\n');

    if (this.errors.length > 0) {
      console.log(`${colors.red}エラー: ${this.errors.length}件${colors.reset}`);
      this.errors.forEach(error => console.log(`  ${error}`));
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log(`${colors.yellow}警告: ${this.warnings.length}件${colors.reset}`);
      this.warnings.forEach(warning => console.log(`  ${warning}`));
      console.log('');
    }

    if (this.errors.length === 0) {
      console.log(`${colors.green}✅ すべてのチェックに合格しました${colors.reset}\n`);
      if (this.warnings.length > 0) {
        console.log('※ 警告がありますが、動作に支障はありません\n');
      }
    } else {
      console.log(`${colors.red}❌ バリデーションに失敗しました${colors.reset}\n`);
    }
  }
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('使用方法: node tools/validate-game.js <filepath>');
    console.error('例: node tools/validate-game.js public/data/games/city-dx.json');
    process.exit(1);
  }

  const filepath = args[0];
  const validator = new GameValidator(filepath);
  const success = validator.validate();

  process.exit(success ? 0 : 1);
}

main();
