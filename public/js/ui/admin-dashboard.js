/**
 * admin-dashboard.js
 * 管理画面のJavaScript
 */

const ADMIN_PASSWORD = 'admin-password-2024';
let gameStatsChart = null;
let timeSeriesChart = null;

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
  // セッションストレージに認証情報があるか確認
  const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true';

  if (isAuthenticated) {
    showDashboard();
    loadData();
  } else {
    showLoginScreen();
  }
});

/**
 * ログイン処理
 */
function login(event) {
  event.preventDefault();

  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('loginError');

  if (password === ADMIN_PASSWORD) {
    // 認証成功
    sessionStorage.setItem('admin_authenticated', 'true');
    errorEl.textContent = '';
    showDashboard();
    loadData();
  } else {
    // 認証失敗
    errorEl.textContent = 'パスワードが正しくありません';
    document.getElementById('password').value = '';
  }
}

/**
 * ログアウト処理
 */
function logout() {
  if (confirm('ログアウトしますか？')) {
    sessionStorage.removeItem('admin_authenticated');
    showLoginScreen();
  }
}

/**
 * ログイン画面を表示
 */
function showLoginScreen() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('dashboardScreen').style.display = 'none';
}

/**
 * ダッシュボード画面を表示
 */
function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboardScreen').style.display = 'block';
}

/**
 * データ読み込み
 */
async function loadData() {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const contentEl = document.getElementById('dashboardContent');

  // ローディング表示
  loadingEl.style.display = 'block';
  errorEl.style.display = 'none';
  contentEl.style.display = 'none';

  try {
    // API呼び出し
    const response = await fetch(`/api/stats/get?password=${ADMIN_PASSWORD}`);

    if (!response.ok) {
      throw new Error(`API呼び出しエラー: ${response.status}`);
    }

    const data = await response.json();
    console.log('統計データ取得:', data);

    // データ表示
    displaySummary(data.summary);
    displayGameStats(data.gameStats);
    displayTimeSeries(data.timeSeries);
    displayAccessKeyStats(data.accessKeyStats);
    displayErrorLogs(data.errorLogs);
    displayHistory(data.history);

    // 最終更新日時
    const now = new Date();
    document.getElementById('lastUpdated').textContent =
      `最終更新: ${now.toLocaleString('ja-JP')}`;

    // ローディング非表示、コンテンツ表示
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';

  } catch (error) {
    console.error('データ読み込みエラー:', error);

    // エラー表示
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
    document.getElementById('errorMessage').textContent = error.message;
  }
}

/**
 * データ更新
 */
function refreshData() {
  loadData();
}

/**
 * 概要サマリーを表示
 */
function displaySummary(summary) {
  document.getElementById('totalCount').textContent = summary.total;
  document.getElementById('todayCount').textContent = summary.today;
  document.getElementById('weekCount').textContent = summary.week;
  document.getElementById('monthCount').textContent = summary.month;
}

/**
 * ゲーム別統計を表示
 */
function displayGameStats(gameStats) {
  // 人気トップ3
  const topGamesList = document.getElementById('topGamesList');
  topGamesList.innerHTML = '';

  gameStats.slice(0, 3).forEach(game => {
    const li = document.createElement('li');
    li.textContent = `${game.gameName}: ${game.count}回`;
    topGamesList.appendChild(li);
  });

  // グラフ描画
  const ctx = document.getElementById('gameStatsChart').getContext('2d');

  // 既存のチャートを破棄
  if (gameStatsChart) {
    gameStatsChart.destroy();
  }

  gameStatsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: gameStats.map(g => g.gameName),
      datasets: [{
        label: '利用回数',
        data: gameStats.map(g => g.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(96, 165, 250, 0.7)',
          'rgba(147, 197, 253, 0.7)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(96, 165, 250, 0.5)',
          'rgba(147, 197, 253, 0.5)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(96, 165, 250)',
          'rgb(147, 197, 253)',
          'rgb(59, 130, 246)',
          'rgb(96, 165, 250)',
          'rgb(147, 197, 253)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

/**
 * 時系列推移を表示
 */
function displayTimeSeries(timeSeries) {
  const ctx = document.getElementById('timeSeriesChart').getContext('2d');

  // 既存のチャートを破棄
  if (timeSeriesChart) {
    timeSeriesChart.destroy();
  }

  timeSeriesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeSeries.map(d => d.date),
      datasets: [{
        label: '利用回数',
        data: timeSeries.map(d => d.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

/**
 * アクセスキー別統計を表示
 */
function displayAccessKeyStats(accessKeyStats) {
  const tbody = document.querySelector('#accessKeyTable tbody');
  tbody.innerHTML = '';

  if (accessKeyStats.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="3" style="text-align: center;">データがありません</td>';
    tbody.appendChild(tr);
    return;
  }

  accessKeyStats.forEach(stat => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${stat.accessKey}</td>
      <td>${stat.count}</td>
      <td>${stat.lastUsed ? new Date(stat.lastUsed).toLocaleString('ja-JP') : '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * エラーログを表示
 */
function displayErrorLogs(errorLogs) {
  const tbody = document.querySelector('#errorLogTable tbody');
  tbody.innerHTML = '';

  if (errorLogs.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4" style="text-align: center;">エラーなし</td>';
    tbody.appendChild(tr);
    return;
  }

  errorLogs.forEach(log => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(log.timestamp).toLocaleString('ja-JP')}</td>
      <td>${log.location || '-'}</td>
      <td>${log.gameId || '-'}</td>
      <td>${log.error?.message || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * 利用履歴を表示
 */
function displayHistory(history) {
  const tbody = document.querySelector('#historyTable tbody');
  tbody.innerHTML = '';

  if (history.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="5" style="text-align: center;">データがありません</td>';
    tbody.appendChild(tr);
    return;
  }

  history.forEach(entry => {
    const tr = document.createElement('tr');

    // イベントタイプを日本語化
    const eventTypeMap = {
      'game_selection': 'ゲーム選択',
      'output_generation': '成果物生成',
      'evaluation': '評価',
      'error': 'エラー'
    };
    const eventType = eventTypeMap[entry.eventType] || entry.eventType;

    // 成否の表示
    let successBadge = '-';
    if (entry.success !== undefined) {
      successBadge = entry.success
        ? '<span class="badge badge-success">成功</span>'
        : '<span class="badge badge-error">失敗</span>';
    }

    tr.innerHTML = `
      <td>${new Date(entry.timestamp).toLocaleString('ja-JP')}</td>
      <td>${eventType}</td>
      <td>${entry.gameId || '-'}</td>
      <td>${entry.accessKey || '-'}</td>
      <td>${successBadge}</td>
    `;
    tbody.appendChild(tr);
  });
}
