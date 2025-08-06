/**
 * 職位描述生成器元件
 * 
 * 為選中的員工生成專業的職位描述，包括：
 * - 員工選擇介面
 * - 職位描述生成
 * - 結果編輯和匯出功能
 */

'use client';

import React, { useState } from 'react';
import { FileText, User, Edit3, Download, Loader2, AlertCircle } from 'lucide-react';
import useOrgChartStore, { type Employee } from '../OrgChart/useOrgChartStore';

interface JobDescriptionResult {
  employee: {
    name: string;
    position: string;
    department: string;
  };
  jobDescription: string;
  timestamp: string;
}

const JobDescriptionGenerator = () => {
  const { nodes, selectedNode } = useOrgChartStore();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(selectedNode || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<JobDescriptionResult | null>(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedEmployee = nodes.find(node => node.id === selectedEmployeeId)?.data;

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setResult(null);
    setError(null);
    setIsEditing(false);
  };

  const handleGenerate = async () => {
    if (!selectedEmployee) {
      setError('請選擇一位員工');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/llm/job-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee: selectedEmployee,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '職位描述生成失敗');
      }

      setResult(data);
      setEditedDescription(data.jobDescription);
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    if (!result) return;

    const content = `${result.employee.name} - ${result.employee.position}
部門：${result.employee.department}
生成時間：${new Date(result.timestamp).toLocaleString('zh-TW')}

${isEditing ? editedDescription : result.jobDescription}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `職位描述-${result.employee.name}-${result.employee.position}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    // 可以在這裡加入保存到資料庫的邏輯
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedDescription(result?.jobDescription || '');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">職位描述生成器</h3>
            <p className="text-sm text-gray-600">為員工生成專業的職位描述</p>
          </div>
        </div>
      </div>

      {/* 員工選擇 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          選擇員工
        </label>
        <div className="flex gap-3">
          <select
            value={selectedEmployeeId}
            onChange={(e) => handleEmployeeChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">請選擇員工...</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.data.name} - {node.data.position} ({node.data.department})
              </option>
            ))}
          </select>
          
          <button
            onClick={handleGenerate}
            disabled={!selectedEmployee || isGenerating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                生成描述
              </>
            )}
          </button>
        </div>
      </div>

      {/* 選中員工資訊 */}
      {selectedEmployee && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              {selectedEmployee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{selectedEmployee.name}</h4>
              <p className="text-sm text-gray-600">{selectedEmployee.position}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">部門：</span>
              <span className="text-gray-900">{selectedEmployee.department}</span>
            </div>
            <div>
              <span className="text-gray-500">層級：</span>
              <span className="text-gray-900">Level {selectedEmployee.level}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">電子郵件：</span>
              <span className="text-gray-900">{selectedEmployee.email}</span>
            </div>
          </div>
        </div>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-800">生成失敗</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* 職位描述結果 */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4" />
              {result.employee.name} 的職位描述
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {new Date(result.timestamp).toLocaleString('zh-TW')}
              </span>
              <button
                onClick={isEditing ? handleSaveEdit : handleEdit}
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title={isEditing ? "儲存編輯" : "編輯內容"}
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="匯出職位描述"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="編輯職位描述..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  儲存
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div 
                className="prose prose-sm max-w-none text-gray-800 whitespace-pre-line"
                style={{ lineHeight: '1.6' }}
              >
                {editedDescription}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 初始狀態 */}
      {!result && !isGenerating && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">選擇員工並生成職位描述</h4>
          <p className="text-gray-600 mb-4">
            AI 將根據員工的職位、部門和層級生成專業的職位描述
          </p>
          <ul className="text-sm text-gray-500 space-y-1 text-left max-w-md mx-auto">
            <li>• 職位概述與責任</li>
            <li>• 技能與資格要求</li>
            <li>• 工作內容詳述</li>
            <li>• 可編輯與匯出</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default JobDescriptionGenerator;