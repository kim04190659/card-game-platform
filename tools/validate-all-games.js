#!/usr/bin/env node

/**
 * 全ゲームJSONファイルの一括バリデーションスクリプト
 *
 * 使用方法:
 *   node tools/validate-all-games.js
 *   または
 *   npm run validate-all
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// カラーコード
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class AllGamesValidator {
  constructor() {
    this.results = [];
    this.gameList = [
      { id: 'city-dx', name: '自治体DX推進ゲーム', file: 'city-dx.json' },
      { id: 'robot-solution', name: 'ロボットソリューション創出ゲーム', file: 'robot-solution.json' },
      { id: 'it-operations-excellence', name: 'IT運用エクセレンスゲーム', file: 'it-operations-excellence.json' },
      { id: 'it-security-solution', name: 'ITセキュリティソリューション創出ゲーム', file: 'it-security-solution.json' },
      { id: 'convenience-store-dx', name: 'コンビニDX革新ゲーム', file: 'convenience-store-dx.json' }
    ];
  }

  /**
   * 全ゲームのバリデーション実行
   */
  async validateAll() {
    console.log(`${colors.cyan}=====================================${colors.reset}`);
    console.log(`${colors.cyan}全ゲーム一括バリデーション${colors.reset}`);
    console.log(`${colors.cyan}=====================================${colors.reset}\n`);

    console.log(`対象ゲーム数: ${this.gameList.length}件\n`);

    for (const game of this.gameList) {
      await this.validateGame(game);
    }

    this.showSummary();
  }

  /**
   * 個別ゲームのバリデーション
   */
  async validateGame(game) {
    const filepath = path.join(__dirname, '..', 'public', 'data', 'games', game.file);

    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.blue}📁 ${game.name}${colors.reset}`);
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

    try {
      // validate-game.js を実行
      const command = `node ${path.join(__dirname, 'validate-game.js')} ${filepath}`;
      execSync(command, { stdio: 'inherit' });

      this.results.push({
        game: game.name,
        status: 'success'
      });
    } catch (error) {
      this.results.push({
        game: game.name,
        status: 'failed'
      });
    }

    console.log('');  // 空行
  }

  /**
   * サマリー表示
   */
  showSummary() {
    console.log(`${colors.cyan}=====================================${colors.reset}`);
    console.log(`${colors.cyan}バリデーション サマリー${colors.reset}`);
    console.log(`${colors.cyan}=====================================${colors.reset}\n`);

    const successCount = this.results.filter(r => r.status === 'success').length;
    const failedCount = this.results.filter(r => r.status === 'failed').length;

    console.log(`総ゲーム数: ${this.results.length}件`);
    console.log(`${colors.green}成功: ${successCount}件${colors.reset}`);
    if (failedCount > 0) {
      console.log(`${colors.red}失敗: ${failedCount}件${colors.reset}`);
    }
    console.log('');

    // 詳細結果
    console.log('詳細:');
    this.results.forEach(result => {
      const icon = result.status === 'success' ? `${colors.green}✅` : `${colors.red}❌`;
      console.log(`  ${icon} ${result.game}${colors.reset}`);
    });
    console.log('');

    if (failedCount === 0) {
      console.log(`${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
      console.log(`${colors.green}🎉 すべてのゲームが正常です！${colors.reset}`);
      console.log(`${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
    } else {
      console.log(`${colors.red}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
      console.log(`${colors.red}⚠️  一部のゲームでエラーがあります${colors.reset}`);
      console.log(`${colors.red}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
    }

    return failedCount === 0;
  }
}

// メイン処理
async function main() {
  const validator = new AllGamesValidator();
  const success = await validator.validateAll();

  process.exit(success ? 0 : 1);
}

main();
