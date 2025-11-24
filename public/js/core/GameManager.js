/**
 * GameManager.js
 * ゲーム全体の管理を担当するクラス
 * 
 * 責務:
 * - ゲームデータの読み込み
 * - ゲーム選択
 * - 現在のゲーム状態の管理
 */

class GameManager {
  constructor() {
    this.games = [];
    this.currentGame = null;
  }

  /**
   * ゲームリストを読み込む
   * @returns {Promise<Array>} ゲーム一覧
   */
  async loadGames() {
    try {
      // 利用可能なゲームのリスト
      const gameList = [
        { id: 'city-dx', name: '自治体DX推進ゲーム', file: 'city-dx.json' },
        { id: 'robot-solution', name: 'ロボットソリューション創出ゲーム', file: 'robot-solution.json' },
        { id: 'it-operations-excellence', name: 'IT運用エクセレンスゲーム', file: 'it-operations-excellence.json' },
        { id: 'it-security-solution', name: 'ITセキュリティソリューション創出ゲーム', file: 'it-security-solution.json' },
        { id: 'convenience-store-dx', name: 'コンビニDX革新ゲーム', file: 'convenience-store-dx.json' },
        { id: 'mobile-carrier-dx', name: '携帯キャリアDX革新ゲーム', file: 'mobile-carrier-dx.json' }
      ];

      // 各ゲームの設定ファイルを読み込む
      const loadPromises = gameList.map(async (gameInfo) => {
        try {
          const response = await fetch(`/data/games/${gameInfo.file}`);
          if (!response.ok) {
            console.warn(`ゲーム設定ファイルの読み込みに失敗: ${gameInfo.file}`);
            return null;
          }
          const gameData = await response.json();
          return {
            ...gameInfo,
            data: gameData
          };
        } catch (error) {
          console.warn(`ゲーム設定ファイルの読み込みエラー: ${gameInfo.file}`, error);
          return null;
        }
      });

      const results = await Promise.all(loadPromises);
      
      // 正常に読み込めたゲームのみを保持
      this.games = results.filter(game => game !== null);

      console.log(`${this.games.length}個のゲームを読み込みました`);
      return this.games;

    } catch (error) {
      console.error('ゲームリストの読み込みに失敗しました:', error);
      throw new Error('ゲームリストの読み込みに失敗しました。ページをリロードしてください。');
    }
  }

  /**
   * ゲームを選択
   * @param {string} gameId ゲームID
   * @returns {Object} 選択されたゲーム
   */
  selectGame(gameId) {
    const game = this.games.find(g => g.id === gameId);
    
    if (!game) {
      throw new Error(`ゲームが見つかりません: ${gameId}`);
    }

    this.currentGame = game;
    
    // セッションストレージに保存
    sessionStorage.setItem('currentGameId', gameId);
    sessionStorage.setItem('currentGameData', JSON.stringify(game));

    console.log('ゲームを選択しました:', game.name);
    return game;
  }

  /**
   * 現在のゲームを取得
   * @returns {Object|null} 現在のゲーム
   */
  getCurrentGame() {
    return this.currentGame;
  }

  /**
   * セッションから現在のゲームを復元
   * @returns {Object|null} 復元されたゲーム
   */
  restoreCurrentGame() {
    try {
      const gameId = sessionStorage.getItem('currentGameId');
      const gameDataStr = sessionStorage.getItem('currentGameData');

      if (!gameId || !gameDataStr) {
        console.log('セッションにゲーム情報がありません');
        return null;
      }

      this.currentGame = JSON.parse(gameDataStr);
      console.log('セッションからゲームを復元しました:', this.currentGame.name);
      return this.currentGame;

    } catch (error) {
      console.error('ゲーム情報の復元に失敗しました:', error);
      return null;
    }
  }

  /**
   * ゲーム設定データを取得
   * @returns {Object|null} ゲーム設定データ
   */
  getGameData() {
    if (!this.currentGame) {
      console.warn('現在のゲームが選択されていません');
      return null;
    }
    return this.currentGame.data;
  }

  /**
   * カテゴリ一覧を取得
   * @returns {Array} カテゴリ一覧
   */
  getCategories() {
    const gameData = this.getGameData();
    if (!gameData) return [];
    return gameData.cardCategories || [];
  }

  /**
   * カード一覧を取得
   * @param {string} categoryId カテゴリID（オプション）
   * @returns {Array} カード一覧
   */
  getCards(categoryId = null) {
    const gameData = this.getGameData();
    if (!gameData) return [];

    const allCards = gameData.cards || [];

    if (categoryId) {
      return allCards.filter(card => card.categoryId === categoryId);
    }

    return allCards;
  }

  /**
   * 入力フィールド定義を取得
   * @returns {Array} 入力フィールド定義
   */
  getInputFields() {
    const gameData = this.getGameData();
    if (!gameData) return [];
    return gameData.inputFields || [];
  }

  /**
   * 評価基準を取得
   * @returns {Array} 評価基準
   */
  getEvaluationCriteria() {
    const gameData = this.getGameData();
    if (!gameData) return [];
    return gameData.evaluationCriteria || [];
  }

  /**
   * ゲーム状態をリセット
   */
  reset() {
    this.currentGame = null;
    sessionStorage.removeItem('currentGameId');
    sessionStorage.removeItem('currentGameData');
    console.log('ゲーム状態をリセットしました');
  }
}

// グローバルインスタンスとして export
// ※ このファイルを <script> タグで読み込むと、window.GameManager が利用可能になります
if (typeof window !== 'undefined') {
  window.GameManager = GameManager;
}
