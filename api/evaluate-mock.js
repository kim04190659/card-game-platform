export default async function handler(req, res) {
  try {
    console.log('[evaluate-mock] Request method:', req.method);
    console.log('[evaluate-mock] Request body:', req.body);

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // req.bodyが存在しない場合のエラーハンドリング
    if (!req.body) {
      console.error('[evaluate-mock] req.body is undefined or null');
      return res.status(400).json({
        error: 'Bad request',
        message: 'Request body is missing'
      });
    }

    const { gameId } = req.body;
    console.log('[evaluate-mock] gameId:', gameId);

    // ゲームIDに応じたモック評価
    const mockEvaluations = {
      'city-dx': {
        scores: {
          'feasibility': 88,
          'resident_benefit': 92,
          'sustainability': 85,
          'innovation': 90
        },
        reasons: {
          'feasibility': '既存のコミュニティバスシステムとの統合という現実的なアプローチを取っており、Microsoft製品の活用により技術的な実現性も高い。予算5,000万円は妥当な規模。',
          'resident_benefit': '移動手段の最適化、行政手続きのオンライン化により、住民の利便性向上が明確。特に高齢者や交通弱者への配慮がある。',
          'sustainability': '2年間のフェーズ分けにより段階的な展開が可能。ただし、運用コストの継続的な確保が課題。',
          'innovation': 'AIチャットボットやデータ可視化など、先進技術を適切に活用。ただし、完全に新しいアプローチではない。'
        },
        improvements: [
          '運用フェーズでのコスト試算をより詳細に行い、長期的な財政負担を明確にすると良いでしょう。',
          '住民参加型のワークショップを企画し、実際のニーズをさらに深掘りすることで、より効果的なサービス設計が可能になります。',
          'Phase 1での小さな成功事例（Quick Win）を明示することで、ステークホルダーの理解と支持を早期に獲得できます。'
        ],
        overallScore: 89,
        feedback: '非常に実践的で、実現可能性の高い提案です。既存インフラを活用しつつ、段階的にスマートシティ化を進めるアプローチは堅実です。Microsoft製品の活用も、NECとの親和性を考えると適切な選択です。住民目線でのメリットが明確で、地域課題解決に貢献できる内容になっています。',
        mockMode: true
      },
      'robot-solution': {
        scores: {
          'feasibility': 85,
          'marketNeed': 90,
          'cost': 82,
          'differentiation': 88
        },
        reasons: {
          'feasibility': 'SLAM技術やAMRは既に実用化されており、技術的リスクは低い。ただし、複数台の協調制御は高度な技術が必要。',
          'marketNeed': '物流業界の人手不足は深刻で、ニーズは極めて高い。ターゲット顧客数も現実的で、市場性は非常に高い。',
          'cost': '初期投資3,000万円は中小企業には高額。投資回収期間2.5年は妥当だが、競合との価格競争も想定される。',
          'differentiation': '協働ロボットとAMRの組み合わせは革新的。機械学習による継続的改善も評価できる。'
        },
        improvements: [
          '中小規模の物流企業向けに、初期投資を抑えたエントリーモデルを用意すると市場拡大につながります。',
          '導入後のサポート体制（24時間対応、遠隔監視など）を明示すると、顧客の安心感が高まります。',
          '実証実験の結果データ（生産性向上率、ROIなど）を具体的に示すと、説得力が増します。'
        ],
        overallScore: 86,
        feedback: '市場ニーズを的確に捉えた優れた提案です。技術的にも実現可能性が高く、ROIも明確に示されています。物流業界の深刻な人手不足という社会課題の解決に貢献できる点も高く評価できます。段階的な開発計画も現実的で、リスクを最小限に抑えた戦略です。',
        mockMode: true
      },
      'it-operations-excellence': {
        scores: {
          'feasibility': 90,
          'effectiveness': 88,
          'cost_efficiency': 85,
          'innovation': 82
        },
        reasons: {
          'feasibility': 'ITILは実績のある国際標準フレームワークであり、導入事例も豊富。BIGLOBEでの実践経験を活かせば実現可能性は非常に高い。段階的アプローチも現実的。',
          'effectiveness': '運用プロセスの標準化により、インシデント対応時間50%短縮、運用コスト20%削減など、具体的な効果が期待できる。監視の5つの視点による体系化も効果的。',
          'cost_efficiency': '投資回収期間1.5-2年は妥当。年間20%のコスト削減効果を考えると、ROIは非常に高い。初期投資の配分も適切。',
          'innovation': 'ITILという既存フレームワークの活用が中心のため、革新性はやや控えめ。ただし、「運用のホワイトボックス化」という独自の視点は評価できる。'
        },
        improvements: [
          'Phase 1での現状分析をより詳細に行い、定量的なKPIを設定することで、効果測定をより明確にできます。',
          '運用自動化において、AI/MLを活用した予兆監視や自動復旧など、より先進的な技術の導入検討を追加すると革新性が高まります。',
          'ステークホルダー（経営層、現場オペレーター、ユーザー部門）への説明資料を別途作成し、合意形成プロセスを明確にすると実行がスムーズになります。',
          'BIGLOBEでの具体的な成功事例（数値データ）をより詳細に示すと、説得力がさらに増します。'
        ],
        overallScore: 86,
        feedback: '非常に実践的で、実現可能性の高い提案です。35年のIT運用経験が活かされており、特に「運用のホワイトボックス化」「監視の5つの視点」など、BIGLOBEでの実践知見が随所に反映されています。ITIL/SIAMという国際標準の活用と、現場での実践経験の組み合わせが優れています。段階的アプローチにより、リスクを最小化しながら確実に成果を出せる計画になっています。エクセレントサービスの実現という明確な目的意識も素晴らしいです。',
        mockMode: true
      },
      'it-security-solution': {
        scores: {
          'technical_feasibility': 90,
          'customer_fit': 88,
          'competitiveness': 85,
          'practicality': 87
        },
        reasons: {
          'technical_feasibility': '次世代ファイアウォール（NGFW）とエンドポイント検知・応答（EDR）は既に実用化されている技術で、技術的リスクは低い。Palo Alto Networksの実績も豊富。IoT機器500台規模の管理も現実的な範囲内。',
          'customer_fit': '製造業のIoT機器増加に伴うセキュリティリスクという顧客課題を的確に捉えている。従業員500名規模の企業ニーズに合致しており、セキュリティ担当者の負荷軽減も実現できる。',
          'competitiveness': 'NGFWとEDRの組み合わせは一般的なアプローチだが、NECとの協業による統合管理基盤の提供は差別化要素となる。ただし、競合他社も類似ソリューションを提供しており、価格競争は避けられない。',
          'practicality': '予算3,500万円、導入期間8ヶ月は現実的。投資回収期間1.5年も妥当。段階的な展開計画により、リスクを最小化しながら確実に導入できる体制が整っている。24時間監視体制も実行可能。'
        },
        improvements: [
          'セキュリティインシデント発生時の具体的な対応フロー（エスカレーション手順、復旧プロセス）をより詳細に記載すると、顧客の安心感が高まります。',
          '中小規模の製造業向けに、初期投資を抑えたエントリーモデル（監視範囲を限定、段階的拡張可能）を用意すると市場拡大につながります。',
          '導入後の効果測定指標（セキュリティインシデント削減率、検知時間短縮率など）を具体的に設定し、定期的なレポーティング体制を明示すると説得力が増します。',
          '従業員向けのセキュリティ教育プログラムを組み込むことで、技術的対策と人的対策の両面から包括的なセキュリティ体制を構築できます。'
        ],
        overallScore: 87,
        feedback: '製造業のIoT化に伴うセキュリティリスクという重要な課題に対し、実績のある技術を組み合わせた実践的な提案です。NGFWとEDRの統合により、多層防御を実現できる点が優れています。NECとの協業による統合管理基盤の提供は、顧客の運用負荷軽減に大きく貢献します。投資回収期間も短く、費用対効果が高い提案となっています。段階的な導入計画と24時間監視体制により、安定したサービス提供が期待できます。',
        mockMode: true
      },
      'convenience-store-dx': {
        scores: {
          'feasibility': 88,
          'understanding': 92,
          'differentiation': 85,
          'customer_value': 90
        },
        reasons: {
          'feasibility': 'パナソニックのセルフレジシステムやAIカメラは既に実用化されている技術であり、技術的リスクは低い。段階的な導入計画（パイロット店舗→エリア展開→全国展開）も現実的。初期投資800万円/店舗は中規模のコンビニチェーンでも対応可能な範囲。',
          'understanding': 'セブン-イレブンの課題（人手不足、24時間営業負担、廃棄ロス）を的確に捉えている。競合のローソンやファミリーマートの動向分析も適切で、業界全体のDXトレンドを理解している。「自分の付加価値」（大規模システム構築経験、IoT・AI技術、ITIL/SIAM運用管理）が提案に明確に組み込まれている。',
          'differentiation': 'パナソニックとの技術提携、LINE連携による地域密着、ITIL/SIAMに基づく運用管理など、競合との差別化ポイントは明確。ただし、セルフレジやAI需要予測自体は他社も導入しており、完全に独自とは言えない。',
          'customer_value': 'オーナーの負担軽減（深夜シフト削減、発注業務70%削減）、年間500万円の削減効果、投資回収期間2年など、顧客メリットが具体的で明確。地域密着（高齢者見守り）という社会的価値も評価できる。'
        },
        improvements: [
          'パイロット店舗での検証項目（KPI設定、成功基準）をより詳細に定義することで、Phase 2以降の展開判断基準が明確になります。',
          'セルフレジ導入による「顧客満足度への影響」（操作性、待ち時間短縮など）を具体的に示すと、オーナーの導入判断がしやすくなります。',
          'LINE連携機能のうち、優先度の高い機能（クーポン配信など）とオプション機能を明確に分け、段階的な機能拡張プランを示すと実現性が高まります。',
          '競合他社（ローソン、ファミリーマート）との具体的な比較表を作成すると、差別化ポイントがより明確になります。'
        ],
        overallScore: 89,
        feedback: 'セブン-イレブンの喫緊の課題を的確に捉え、実現可能性の高い技術で解決する優れた提案です。パナソニックの確立されたIoT技術とLINEの国民的プラットフォームを組み合わせることで、競合との差別化を実現しています。特に、「自分の付加価値」（大規模システム構築経験、IoT・AI技術の実装、ITIL/SIAM運用管理）が明確に活かされており、技術導入だけでなく運用まで見据えた持続可能なDXを提供できる点が素晴らしいです。投資回収期間2年、3年目以降は年間380万円/店舗の利益改善という具体的なROIも説得力があります。段階的な導入計画により、リスクを最小化しながら確実に成果を出せる戦略です。',
        mockMode: true
      },
      'mobile-carrier-dx': {
        scores: {
          'technical_feasibility': 88,
          'carrier_understanding': 92,
          'differentiation': 90,
          'business_viability': 86
        },
        reasons: {
          'technical_feasibility': '省電力5Gチップは既存技術の組み合わせで実現可能。TSMC 3nmプロセスは実証済み。エッジAIもNVIDIAとの協業で現実的。開発期間3年も妥当。',
          'carrier_understanding': 'NTTドコモの「5G電力コスト増大」「競合との差別化」「次世代投資」という3大課題を的確に捉えている。キャリア経営層の視点が素晴らしい。',
          'differentiation': '学生チーム独自の「省電力5Gモデムチップ（従来比30%省エネ）」という技術が非常に魅力的。Qualcomm、Huaweiとの差別化も明確。',
          'business_viability': '投資回収期間1.25年は非常に優秀。年間80億円のコスト削減に加え、B2B市場での売上増も見込める。国際展開の可能性も高い。'
        },
        improvements: [
          '省電力チップの具体的な設計手法（回路図レベル）を追加すると、技術的説得力がさらに高まります',
          'Qualcommとの特許紛争リスクをより詳細に分析し、クロスライセンス戦略を具体化すると安心感が増します',
          '6G展開への具体的なロードマップ（テラヘルツ波への応用など）を追加すると、長期ビジョンが見えます'
        ],
        overallScore: 89,
        feedback: '非常に優れた提案です！NTTドコモの課題を的確に捉え、学生チーム独自の省電力5Gチップという革新的な技術で解決しています。特に素晴らしいのは、単なる技術提案ではなく、ROI（投資回収期間1.25年）や国際競争を意識した戦略的な視点。半導体技術を学ぶ学生らしい、技術の深さと事業性のバランスが取れた提案です。Qualcommやサムスンといった国際競合との戦いを意識し、日本の半導体技術の復権という大きなビジョンも描けています。今後、回路設計の詳細や6G展開戦略を詰めれば、実際にNTTドコモに提案できるレベルになります。',
        mockMode: true
      }
    };

    const evaluation = mockEvaluations[gameId] || mockEvaluations['city-dx'];
    console.log('[evaluate-mock] Returning evaluation for gameId:', gameId);

    return res.status(200).json(evaluation);
  } catch (error) {
    console.error('[evaluate-mock] Error:', error);
    console.error('[evaluate-mock] Error stack:', error.stack);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
