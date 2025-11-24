/**
 * StatsLogger.js
 * 統計データを記録するクラス
 *
 * 使用例:
 * const logger = new StatsLogger();
 * logger.logGameSelection('city-dx', 'demo-key-2024');
 */

class StatsLogger {
  constructor() {
    this.apiEndpoint = '/api/stats/log';
  }

  /**
   * ゲーム選択を記録
   * @param {string} gameId - ゲームID
   * @param {string} accessKey - アクセスキー
   */
  async logGameSelection(gameId, accessKey) {
    return this._sendLog({
      eventType: 'game_selection',
      gameId,
      accessKey: this._maskAccessKey(accessKey),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 成果物生成を記録
   * @param {string} gameId - ゲームID
   * @param {string} accessKey - アクセスキー
   * @param {boolean} success - 成功したか
   * @param {Error|null} error - エラーオブジェクト（失敗時）
   */
  async logOutputGeneration(gameId, accessKey, success, error = null) {
    return this._sendLog({
      eventType: 'output_generation',
      gameId,
      accessKey: this._maskAccessKey(accessKey),
      success,
      error: error ? {
        message: error.message,
        stack: error.stack?.substring(0, 500) // スタックトレースは500文字まで
      } : null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 評価を記録
   * @param {string} gameId - ゲームID
   * @param {string} accessKey - アクセスキー
   * @param {boolean} success - 成功したか
   * @param {Error|null} error - エラーオブジェクト（失敗時）
   */
  async logEvaluation(gameId, accessKey, success, error = null) {
    return this._sendLog({
      eventType: 'evaluation',
      gameId,
      accessKey: this._maskAccessKey(accessKey),
      success,
      error: error ? {
        message: error.message,
        stack: error.stack?.substring(0, 500)
      } : null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * エラーを記録
   * @param {string} location - エラー発生箇所
   * @param {Error} error - エラーオブジェクト
   * @param {string|null} gameId - ゲームID（任意）
   */
  async logError(location, error, gameId = null) {
    return this._sendLog({
      eventType: 'error',
      location,
      gameId,
      error: {
        message: error.message,
        stack: error.stack?.substring(0, 500),
        name: error.name
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * アクセスキーをマスク（最初の4文字のみ表示）
   * @param {string} accessKey - アクセスキー
   * @returns {string} マスクされたアクセスキー
   * @private
   */
  _maskAccessKey(accessKey) {
    if (!accessKey || accessKey.length <= 4) {
      return 'unknown';
    }
    return accessKey.substring(0, 4) + '*'.repeat(Math.min(accessKey.length - 4, 8));
  }

  /**
   * 統計ログをAPIに送信
   * @param {Object} data - ログデータ
   * @returns {Promise<boolean>} 成功したか
   * @private
   */
  async _sendLog(data) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        console.warn('Failed to send stats log:', response.status, response.statusText);
        return false;
      }

      return true;
    } catch (error) {
      // 統計記録失敗はゲーム続行に影響しないよう、エラーは握りつぶす
      console.warn('Failed to send stats log (network error):', error.message);
      return false;
    }
  }
}

// ブラウザでグローバルに利用可能にする
if (typeof window !== 'undefined') {
  window.StatsLogger = StatsLogger;
}
