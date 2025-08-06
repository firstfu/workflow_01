'use client';

import React, { useState } from 'react';
import OrgChart from './components/OrgChart/OrgChart';
import LLMPanel from './components/LLM/LLMPanel';
import { ChevronRight, Sparkles } from 'lucide-react';

export default function Home() {
  const [showLLMPanel, setShowLLMPanel] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50 flex">
      {/* 組織圖主要區域 */}
      <div className={`transition-all duration-300 ${showLLMPanel ? 'w-2/3' : 'w-full'}`}>
        <OrgChart />
        
        {/* LLM 功能切換按鈕 */}
        <button
          onClick={() => setShowLLMPanel(!showLLMPanel)}
          className={`fixed top-1/2 -translate-y-1/2 z-50 bg-white shadow-lg border border-gray-200 rounded-l-lg p-3 transition-all duration-300 hover:bg-purple-50 hover:border-purple-200 ${
            showLLMPanel ? 'right-1/2' : 'right-4'
          }`}
          title={showLLMPanel ? '隱藏 AI 功能面板' : '顯示 AI 功能面板'}
        >
          {showLLMPanel ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">AI</span>
            </div>
          )}
        </button>
      </div>

      {/* LLM 功能面板 */}
      <div className={`transition-all duration-300 border-l border-gray-200 bg-white ${
        showLLMPanel ? 'w-1/2 opacity-100' : 'w-0 opacity-0 overflow-hidden'
      }`}>
        {showLLMPanel && (
          <div className="h-screen overflow-y-auto p-4">
            <LLMPanel />
          </div>
        )}
      </div>
    </main>
  );
}
