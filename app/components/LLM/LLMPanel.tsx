/**
 * LLM 功能面板
 * 
 * 整合所有 LLM 功能的主要容器元件，提供：
 * - 標籤式介面切換
 * - 功能模組管理
 * - 響應式設計
 */

'use client';

import React, { useState } from 'react';
import { Sparkles, BarChart3, MessageSquare, FileText } from 'lucide-react';
import AnalysisPanel from './AnalysisPanel';
import ChatAssistant from './ChatAssistant';
import JobDescriptionGenerator from './JobDescriptionGenerator';

type TabType = 'analysis' | 'chat' | 'jobDescription';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'analysis',
    label: '智能分析',
    icon: BarChart3,
    description: '分析組織架構並提供優化建議'
  },
  {
    id: 'chat',
    label: 'AI 助手',
    icon: MessageSquare,
    description: '智能問答協助您了解組織狀況'
  },
  {
    id: 'jobDescription',
    label: '職位描述',
    icon: FileText,
    description: '自動生成專業的職位描述'
  }
];

const LLMPanel = () => {
  const [activeTab, setActiveTab] = useState<TabType>('analysis');

  const renderContent = () => {
    switch (activeTab) {
      case 'analysis':
        return <AnalysisPanel />;
      case 'chat':
        return <ChatAssistant />;
      case 'jobDescription':
        return <JobDescriptionGenerator />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* 標題區域 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI 智能功能</h2>
            <p className="text-purple-100 text-sm">運用人工智慧提升組織管理效率</p>
          </div>
        </div>
      </div>

      {/* 標籤導航 */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-purple-500 text-purple-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs text-gray-500 hidden sm:block">
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 內容區域 */}
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default LLMPanel;