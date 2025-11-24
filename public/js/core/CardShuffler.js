/**
 * CardShuffler.js
 *
 * カードのシャッフル機能を提供するクラス。
 * セミランダム選択機能として、ゲームのカードを事前にシャッフルし、
 * セッションストレージで管理することで、ページ遷移後も順序を保持します。
 *
 * 主な機能:
 * - Fisher-Yatesアルゴリズムによるカードシャッフル
 * - カテゴリごとに独立したシャッフル
 * - セッションストレージによる状態管理
 * - シャッフル状態のリセット
 */

class CardShuffler {
  constructor() {
    this.sessionKeyPrefix = 'shuffled_cards_';
  }

  /**
   * Fisher-Yatesアルゴリズムで配列をシャッフル
   * @param {Array} array - シャッフルする配列
   * @returns {Array} - シャッフル済みの配列（新しい配列）
   */
  fisherYatesShuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * ゲームの全カードをカテゴリごとにシャッフル
   * @param {string} gameId - ゲームID
   * @param {Object} gameData - ゲームデータ（cards配列を含む）
   * @returns {Object} - カテゴリIDごとのシャッフル済みカードID配列のマップ
   */
  shuffleAllCards(gameId, gameData) {
    if (!gameData || !gameData.cards || !gameData.cardCategories) {
      console.error('[CardShuffler] Invalid game data:', gameId);
      return {};
    }

    const shuffledMap = {};

    // カテゴリごとにカードを分類してシャッフル
    gameData.cardCategories.forEach(category => {
      const categoryId = category.categoryId;

      // このカテゴリに属するカードのIDを取得
      const categoryCardIds = gameData.cards
        .filter(card => card.categoryId === categoryId)
        .map(card => card.cardId);

      // シャッフル実行
      const shuffled = this.fisherYatesShuffle(categoryCardIds);
      shuffledMap[categoryId] = shuffled;

      console.log(`[CardShuffler] Shuffled category "${categoryId}": ${shuffled.length} cards`);
    });

    // セッションストレージに保存
    this.saveToSession(gameId, shuffledMap);

    return shuffledMap;
  }

  /**
   * シャッフル結果をセッションストレージに保存
   * @param {string} gameId - ゲームID
   * @param {Object} shuffledMap - カテゴリIDごとのシャッフル済みカードID配列のマップ
   */
  saveToSession(gameId, shuffledMap) {
    const key = this.sessionKeyPrefix + gameId;
    try {
      sessionStorage.setItem(key, JSON.stringify(shuffledMap));
      console.log(`[CardShuffler] Saved shuffle state for game: ${gameId}`);
    } catch (error) {
      console.error('[CardShuffler] Failed to save to sessionStorage:', error);
    }
  }

  /**
   * セッションストレージからシャッフル結果を取得
   * @param {string} gameId - ゲームID
   * @returns {Object|null} - カテゴリIDごとのシャッフル済みカードID配列のマップ、または null
   */
  loadFromSession(gameId) {
    const key = this.sessionKeyPrefix + gameId;
    try {
      const data = sessionStorage.getItem(key);
      if (data) {
        console.log(`[CardShuffler] Loaded shuffle state for game: ${gameId}`);
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[CardShuffler] Failed to load from sessionStorage:', error);
    }
    return null;
  }

  /**
   * シャッフル済みカードを取得（存在しない場合は新規シャッフル）
   * @param {string} gameId - ゲームID
   * @param {Object} gameData - ゲームデータ
   * @returns {Object} - カテゴリIDごとのシャッフル済みカードID配列のマップ
   */
  getShuffledCards(gameId, gameData) {
    // セッションストレージから既存のシャッフル結果を取得
    let shuffledMap = this.loadFromSession(gameId);

    // 存在しない、または無効な場合は新規シャッフル
    if (!shuffledMap || Object.keys(shuffledMap).length === 0) {
      console.log(`[CardShuffler] No existing shuffle found, creating new shuffle for: ${gameId}`);
      shuffledMap = this.shuffleAllCards(gameId, gameData);
    }

    return shuffledMap;
  }

  /**
   * シャッフル済みの順序でカードオブジェクトの配列を取得
   * @param {string} gameId - ゲームID
   * @param {Object} gameData - ゲームデータ
   * @param {string} categoryId - カテゴリID
   * @returns {Array} - シャッフル済みカードオブジェクトの配列
   */
  getShuffledCardsForCategory(gameId, gameData, categoryId) {
    const shuffledMap = this.getShuffledCards(gameId, gameData);
    const shuffledCardIds = shuffledMap[categoryId] || [];

    // カードIDの順序に従ってカードオブジェクトを並び替え
    const cardsMap = {};
    gameData.cards.forEach(card => {
      cardsMap[card.cardId] = card;
    });

    return shuffledCardIds
      .map(cardId => cardsMap[cardId])
      .filter(card => card !== undefined);
  }

  /**
   * 特定ゲームのシャッフル状態をリセット
   * @param {string} gameId - ゲームID
   */
  reset(gameId) {
    const key = this.sessionKeyPrefix + gameId;
    try {
      sessionStorage.removeItem(key);
      console.log(`[CardShuffler] Reset shuffle state for game: ${gameId}`);
    } catch (error) {
      console.error('[CardShuffler] Failed to reset shuffle state:', error);
    }
  }

  /**
   * 全ゲームのシャッフル状態をクリア
   */
  resetAll() {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.sessionKeyPrefix)) {
          sessionStorage.removeItem(key);
        }
      });
      console.log('[CardShuffler] Reset all shuffle states');
    } catch (error) {
      console.error('[CardShuffler] Failed to reset all shuffle states:', error);
    }
  }
}

// グローバルスコープに公開（他のスクリプトから利用可能にする）
if (typeof window !== 'undefined') {
  window.CardShuffler = CardShuffler;
}
