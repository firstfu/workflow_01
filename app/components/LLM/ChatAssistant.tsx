/**
 * 智能問答助手元件
 * 
 * 提供關於組織架構的智能問答功能，包括：
 * - 聊天介面
 * - 歷史記錄管理
 * - 常見問題快捷按鈕
 * - 自動滾動和輸入狀態
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, HelpCircle, User, Bot } from 'lucide-react';
import useOrgChartStore from '../OrgChart/useOrgChartStore';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  '組織架構有什麼問題嗎？',
  '哪些部門人員最多？',
  '管理層級是否過深？',
  '有哪些優化建議？',
  '各部門的職責分配如何？',
];

const ChatAssistant = () => {
  const { nodes, edges } = useOrgChartStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          nodes: nodes,
          edges: edges,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '問答服務暫時無法使用');
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `抱歉，發生錯誤：${error instanceof Error ? error.message : '未知錯誤'}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-TW', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-[500px]">
      {/* 標題列 */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <div className="p-2 bg-green-100 rounded-lg">
          <MessageSquare className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI 助手</h3>
          <p className="text-sm text-gray-600">詢問關於組織架構的問題</p>
        </div>
      </div>

      {/* 聊天內容區域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">AI 助手準備就緒</h4>
            <p className="text-gray-600 mb-6">
              我可以回答關於您組織架構的各種問題，快來試試看吧！
            </p>
            
            {/* 快捷問題 */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">常見問題：</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.type === 'assistant' && (
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-green-600" />
              </div>
            )}
            
            <div className={`max-w-[80%] ${
              message.type === 'user' ? 'order-1' : 'order-2'
            }`}>
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="whitespace-pre-line">{message.content}</div>
              </div>
              <div className={`text-xs text-gray-500 mt-1 ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
            
            {message.type === 'user' && (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 order-2">
                <User className="w-4 h-4 text-blue-600" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-green-600" />
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
              <span className="text-gray-600">正在思考...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 輸入區域 */}
      <div className="border-t border-gray-200 p-4">
        {nodes.length === 0 && (
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-700">請先建立組織架構才能使用問答功能</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={nodes.length === 0 ? "請先建立組織架構..." : "輸入您的問題..."}
            disabled={isLoading || nodes.length === 0}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading || nodes.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAssistant;