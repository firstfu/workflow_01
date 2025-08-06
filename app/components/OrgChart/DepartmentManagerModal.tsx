/**
 * 部門管理模態窗口
 * 
 * 提供完整的部門管理功能，包括新增、編輯、刪除部門
 */

"use client";

import React, { useState } from 'react';
import { Department } from './useOrgChartStore';
import useOrgChartStore from './useOrgChartStore';
import DepartmentIcon from './DepartmentIcon';
import { getDepartmentColorDot, getDepartmentBadgeClasses, departmentColors } from './departmentUtils';
import { X, Plus, Edit, Trash2, Save } from 'lucide-react';

interface DepartmentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepartmentManagerModal: React.FC<DepartmentManagerModalProps> = ({ isOpen, onClose }) => {
  const { departments, addDepartment, updateDepartment, deleteDepartment, getDepartmentStats } = useOrgChartStore();
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDept, setNewDept] = useState({
    name: '',
    color: 'blue' as keyof typeof departmentColors,
    icon: 'Building2',
    description: ''
  });

  const stats = getDepartmentStats();

  const handleSaveDepartment = () => {
    if (editingDept) {
      // 更新部門
      updateDepartment(editingDept.id, editingDept);
      setEditingDept(null);
    } else if (showAddForm && newDept.name.trim()) {
      // 新增部門
      const department: Department = {
        id: `dept-${Date.now()}`,
        name: newDept.name.trim(),
        color: newDept.color,
        icon: newDept.icon,
        description: newDept.description.trim() || undefined
      };
      addDepartment(department);
      setNewDept({ name: '', color: 'blue', icon: 'Building2', description: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteDepartment = (dept: Department) => {
    const employeeCount = stats[dept.name] || 0;
    if (employeeCount > 0) {
      if (!confirm(`此部門還有 ${employeeCount} 位員工，確定要刪除嗎？刪除後這些員工的部門資訊將被保留。`)) {
        return;
      }
    }
    
    if (confirm(`確定要刪除「${dept.name}」部門嗎？`)) {
      deleteDepartment(dept.id);
    }
  };

  const colorOptions = Object.keys(departmentColors) as Array<keyof typeof departmentColors>;
  const iconOptions = ['Building2', 'Users', 'Code', 'DollarSign', 'Megaphone', 'Crown', 'Briefcase', 'Settings', 'Globe', 'Palette'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">部門管理</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 內容區域 */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* 新增部門按鈕 */}
          {!showAddForm && !editingDept && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 mb-4"
            >
              <Plus className="w-5 h-5" />
              新增部門
            </button>
          )}

          {/* 新增部門表單 */}
          {showAddForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-3">新增部門</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">部門名稱</label>
                  <input
                    type="text"
                    value={newDept.name}
                    onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                    placeholder="輸入部門名稱"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">顏色</label>
                  <select
                    value={newDept.color}
                    onChange={e => setNewDept({ ...newDept, color: e.target.value as keyof typeof departmentColors })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {colorOptions.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">圖示</label>
                  <select
                    value={newDept.icon}
                    onChange={e => setNewDept({ ...newDept, icon: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">描述 (可選)</label>
                  <input
                    type="text"
                    value={newDept.description}
                    onChange={e => setNewDept({ ...newDept, description: e.target.value })}
                    placeholder="部門描述"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDepartment}
                  disabled={!newDept.name.trim()}
                  className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  儲存
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewDept({ name: '', color: 'blue', icon: 'Building2', description: '' });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* 部門清單 */}
          <div className="space-y-3">
            {departments.map(dept => (
              <div key={dept.id} className="bg-white border border-gray-200 rounded-lg p-4">
                {editingDept && editingDept.id === dept.id ? (
                  // 編輯模式
                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">編輯部門</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">部門名稱</label>
                        <input
                          type="text"
                          value={editingDept.name}
                          onChange={e => setEditingDept({ ...editingDept, name: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">顏色</label>
                        <select
                          value={editingDept.color}
                          onChange={e => setEditingDept({ ...editingDept, color: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {colorOptions.map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">圖示</label>
                        <select
                          value={editingDept.icon}
                          onChange={e => setEditingDept({ ...editingDept, icon: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {iconOptions.map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">描述</label>
                        <input
                          type="text"
                          value={editingDept.description || ''}
                          onChange={e => setEditingDept({ ...editingDept, description: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveDepartment}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" />
                        儲存
                      </button>
                      <button
                        onClick={() => setEditingDept(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  // 顯示模式
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${getDepartmentColorDot(dept)}`}></div>
                      <DepartmentIcon iconName={dept.icon} size={18} className="text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-800">{dept.name}</h4>
                        {dept.description && (
                          <p className="text-xs text-gray-500">{dept.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`${getDepartmentBadgeClasses(dept)}`}>
                        {stats[dept.name] || 0} 人
                      </span>
                      
                      <button
                        onClick={() => setEditingDept(dept)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="編輯部門"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteDepartment(dept)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="刪除部門"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {departments.length === 0 && !showAddForm && (
            <div className="text-center py-8 text-gray-500">
              <p>尚無部門資料</p>
              <p className="text-sm">點擊上方按鈕新增第一個部門</p>
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagerModal;