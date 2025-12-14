/**
 * AuthManager.js
 * アクセスキー認証とセッション管理を担当するクラス
 * 
 * 責務:
 * - アクセスキーの検証
 * - セッション管理
 * - 認証状態の確認
 */

class AuthManager {
  constructor() {
    this.sessionKey = 'card_game_access_key';
    this.sessionExpiryKey = 'card_game_session_expiry';
    this.defaultSessionDuration = 8 * 60 * 60 * 1000; // 8時間（ミリ秒）
  }

  /**
   * アクセスキーを検証
   * @param {string} accessKey アクセスキー
   * @returns {Promise<Object>} 検証結果
   */
  async validateAccessKey(accessKey) {
    // 形式チェック
    if (!this.isValidFormat(accessKey)) {
      throw new Error('正しい形式で入力してください（例: ABCD-1234-EFGH-5678）');
    }

    try {
      // 現在はダミー認証、将来的にAPI連携
      const result = await this.authenticateWithAPI(accessKey);
      
      if (result.valid) {
        // セッションに保存
        this.saveSession(accessKey, result.expiresIn);
        return result;
      } else {
        throw new Error('無効なアクセスキーです');
      }
    } catch (error) {
      console.error('認証エラー:', error);
      throw error;
    }
  }

  /**
   * アクセスキーの形式をチェック
   * @param {string} accessKey アクセスキー
   * @returns {boolean} 形式が正しいか
   */
  isValidFormat(accessKey) {
    // 3つのフォーマットに対応:
    // 1. 長い形式: XXXX-XXXX-XXXX-XXXX (例: TEST-1234-ABCD-5678)
    // 2. 短い形式: xxxx-xxxx-xxxx (例: demo-key-2024)
    // 3. シンプル形式: 英数字のみ (例: okaasan)
    const longPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    const shortPattern = /^[a-z0-9]+-[a-z0-9]+-[0-9]{4}$/;
    const simplePattern = /^[a-z0-9]{4,20}$/;

    return longPattern.test(accessKey) || shortPattern.test(accessKey) || simplePattern.test(accessKey);
  }

  /**
   * API経由でアクセスキーを認証（将来実装）
   * @param {string} accessKey アクセスキー
   * @returns {Promise<Object>} 認証結果
   */
  async authenticateWithAPI(accessKey) {
    // ⚠️ 現在はダミー実装、将来的にUpstash RedisまたはバックエンドAPIと連携
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // テスト用キー（大文字・小文字を区別しない）
        const validKeys = [
          'TEST-1234-ABCD-5678',
          'DEMO-9876-WXYZ-5432',
          'demo-key-2024',
          'workshop-key-2024',
          'okaasan'  // 高齢者向け「おたすけさん」用アクセスキー
        ];

        // 大文字・小文字を区別しない比較
        const normalizedKey = accessKey.toLowerCase();
        const normalizedValidKeys = validKeys.map(k => k.toLowerCase());

        if (normalizedValidKeys.includes(normalizedKey)) {
          resolve({
            valid: true,
            accessKey: accessKey,
            expiresIn: this.defaultSessionDuration
          });
        } else {
          reject(new Error(`無効なアクセスキーです（有効なキー例: demo-key-2024, workshop-key-2024）`));
        }
      }, 1000); // 1秒待機してAPI呼び出しをシミュレート
    });

    // 将来的な実装例:
    /*
    const response = await fetch('/api/auth/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ accessKey })
    });

    if (!response.ok) {
      throw new Error('認証サーバーとの通信に失敗しました');
    }

    const result = await response.json();
    return result;
    */
  }

  /**
   * セッションに保存
   * @param {string} accessKey アクセスキー
   * @param {number} expiresIn 有効期間（ミリ秒）
   */
  saveSession(accessKey, expiresIn = null) {
    const duration = expiresIn || this.defaultSessionDuration;
    const expiryTime = Date.now() + duration;

    sessionStorage.setItem(this.sessionKey, accessKey);
    sessionStorage.setItem(this.sessionExpiryKey, expiryTime.toString());

    console.log('セッションを保存しました（有効期限:', new Date(expiryTime).toLocaleString(), '）');
  }

  /**
   * 現在のセッションを取得
   * @returns {string|null} アクセスキー
   */
  getSession() {
    const accessKey = sessionStorage.getItem(this.sessionKey);
    const expiryTime = sessionStorage.getItem(this.sessionExpiryKey);

    if (!accessKey || !expiryTime) {
      return null;
    }

    // 有効期限チェック
    if (Date.now() > parseInt(expiryTime)) {
      console.log('セッションの有効期限が切れました');
      this.clearSession();
      return null;
    }

    return accessKey;
  }

  /**
   * セッションが有効かチェック
   * @returns {boolean} セッションが有効か
   */
  isAuthenticated() {
    return this.getSession() !== null;
  }

  /**
   * セッションをクリア
   */
  clearSession() {
    sessionStorage.removeItem(this.sessionKey);
    sessionStorage.removeItem(this.sessionExpiryKey);
    console.log('セッションをクリアしました');
  }

  /**
   * 認証が必要な場合、アクセスキー入力画面へリダイレクト
   * @param {string} returnUrl リダイレクト後の戻り先URL
   */
  requireAuth(returnUrl = null) {
    if (!this.isAuthenticated()) {
      if (returnUrl) {
        sessionStorage.setItem('auth_return_url', returnUrl);
      }
      window.location.href = '/access-key.html';
    }
  }

  /**
   * 認証後の戻り先URLを取得
   * @returns {string|null} 戻り先URL
   */
  getReturnUrl() {
    const url = sessionStorage.getItem('auth_return_url');
    sessionStorage.removeItem('auth_return_url');
    return url || '/game-selection.html';
  }

  /**
   * セッションの残り時間を取得（分単位）
   * @returns {number|null} 残り時間（分）
   */
  getRemainingTime() {
    const expiryTime = sessionStorage.getItem(this.sessionExpiryKey);
    
    if (!expiryTime) {
      return null;
    }

    const remaining = parseInt(expiryTime) - Date.now();
    
    if (remaining <= 0) {
      return 0;
    }

    return Math.ceil(remaining / 60000); // ミリ秒を分に変換
  }

  /**
   * セッションの有効期限を延長
   * @param {number} additionalTime 追加時間（ミリ秒）
   */
  extendSession(additionalTime = null) {
    const accessKey = this.getSession();
    
    if (!accessKey) {
      console.warn('セッションが存在しないため、延長できません');
      return;
    }

    const extension = additionalTime || this.defaultSessionDuration;
    const newExpiryTime = Date.now() + extension;

    sessionStorage.setItem(this.sessionExpiryKey, newExpiryTime.toString());
    console.log('セッションを延長しました（新しい有効期限:', new Date(newExpiryTime).toLocaleString(), '）');
  }
}

// グローバルインスタンスとして export
if (typeof window !== 'undefined') {
  window.AuthManager = AuthManager;
}
