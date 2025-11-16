module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 少し待機して評価をシミュレート
  await new Promise(resolve => setTimeout(resolve, 1500));

  // モックの評価結果
  const mockEvaluation = {
    scores: {
      "実現可能性": 85,
      "住民メリット": 90,
      "持続可能性": 85,
      "革新性": 88
    },
    reasons: {
      "実現可能性": "既存インフラとの統合により実現可能性が高い。予算規模も適切。",
      "住民メリット": "コミュニティバス連携により住民の利便性が大幅に向上。",
      "持続可能性": "地域住民との協働体制が整っており、長期運用が期待できる。",
      "革新性": "温泉観光資源との連携というユニークな視点が評価できる。"
    },
    improvements: [
      "データセキュリティ対策の明確化が必要",
      "段階的な展開計画の詳細化を推奨",
      "費用対効果の定量的な示し方を改善"
    ],
    overallScore: 87,
    feedback: "非常に実現可能性の高い、バランスの取れた提案です。特に既存リソースを活かす視点が優れています。（これはテスト用のモック評価です）"
  };

  return res.status(200).json({
    success: true,
    content: JSON.stringify(mockEvaluation, null, 2)
  });
};
