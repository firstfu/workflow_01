/**
 * 組織分析面板元件
 * 
 * 提供組織架構分析功能的用戶介面，包括：
 * - 分析結果顯示
 * - 載入狀態管理
 * - 錯誤處理
 * - 結果匯出功能
 */

'use client';

import React, { useState } from 'react';
import { BarChart3, FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import useOrgChartStore from '../OrgChart/useOrgChartStore';

interface AnalysisResult {
  analysis: string;
  timestamp: string;
}

const AnalysisPanel = () => {
  const { nodes, edges } = useOrgChartStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (nodes.length === 0) {
      setError('請先建立組織架構');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/llm/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes: nodes,
          edges: edges,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '分析失敗');
      }

      setAnalysisResult({
        analysis: data.analysis,
        timestamp: data.timestamp,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportAnalysis = () => {
    if (!analysisResult) return;

    const content = `組織架構分析報告
分析時間：${new Date(analysisResult.timestamp).toLocaleString('zh-TW')}
組織規模：${nodes.length} 位員工

${analysisResult.analysis}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `組織分析報告-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">智能組織分析</h3>
            <p className="text-sm text-gray-600">AI 分析組織架構並提供優化建議</p>
          </div>
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || nodes.length === 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              分析中...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4" />
              開始分析
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-800">分析失敗</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              分析結果
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {new Date(analysisResult.timestamp).toLocaleString('zh-TW')}
              </span>
              <button
                onClick={handleExportAnalysis}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="匯出分析報告"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div 
              className="prose prose-sm max-w-none text-gray-800 whitespace-pre-line"
              style={{ lineHeight: '1.6' }}
            >
              {analysisResult.analysis}
            </div>
          </div>
        </div>
      )}

      {!analysisResult && !isAnalyzing && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">準備進行分析</h4>
          <p className="text-gray-600 mb-4">
            AI 將分析您的組織架構，提供專業的優化建議和風險評估
          </p>
          <ul className="text-sm text-gray-500 space-y-1 text-left max-w-md mx-auto">
            <li>• 組織結構評估</li>
            <li>• 人力配置分析</li>
            <li>• 管理效率評估</li>
            <li>• 改善建議提供</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;