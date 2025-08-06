/**
 * 員工編輯彈窗元件
 * 
 * 提供與拖拽選項彈窗一致的設計風格，用於員工資料的編輯功能
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Employee } from './useOrgChartStore';
import useOrgChartStore from './useOrgChartStore';
import { ChevronDown, Plus } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onSave: (data: Partial<Employee>) => void;
  onCancel: () => void;
}

const EditModal = ({ isOpen, employee, onSave, onCancel }: EditModalProps) => {
  const { departments, addDepartment } = useOrgChartStore();
  const [editData, setEditData] = useState({
    name: '',
    position: '',
    department: '',
    email: '',
  });
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');

  useEffect(() => {
    if (employee) {
      setEditData({
        name: employee.name,
        position: employee.position,
        department: employee.department,
        email: employee.email,
      });
    }
  }, [employee]);

  const handleSave = () => {
    onSave(editData);
  };

  const handleDepartmentSelect = (departmentName: string) => {
    setEditData({ ...editData, department: departmentName });
    setShowDepartmentDropdown(false);
  };

  const handleAddNewDepartment = () => {
    if (newDepartmentName.trim()) {
      // 生成部門顏色和圖標（簡化版）
      const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'indigo'];
      const icons = ['Building2', 'Users', 'Briefcase', 'Settings', 'Globe'];
      const newDepartment = {
        id: `dept-${Date.now()}`,
        name: newDepartmentName.trim(),
        color: colors[Math.floor(Math.random() * colors.length)],
        icon: icons[Math.floor(Math.random() * icons.length)],
      };
      
      addDepartment(newDepartment);
      setEditData({ ...editData, department: newDepartmentName.trim() });
      setNewDepartmentName('');
      setShowAddDepartment(false);
      setShowDepartmentDropdown(false);
    }
  };

  const getColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      purple: 'bg-purple-100 text-purple-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      orange: 'bg-orange-100 text-orange-800',
      pink: 'bg-pink-100 text-pink-800',
      indigo: 'bg-indigo-100 text-indigo-800'
    };
    return colorMap[colorName] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[320px] max-w-md w-full mx-4">
        <h3 className="text-base font-medium text-gray-800 mb-4 text-center">
          編輯員工資料
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              姓名
            </label>
            <input
              type="text"
              value={editData.name}
              onChange={e => setEditData({ ...editData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              職位
            </label>
            <input
              type="text"
              value={editData.position}
              onChange={e => setEditData({ ...editData, position: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              部門
            </label>
            <button
              type="button"
              onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {departments.find(d => d.name === editData.department) && (
                  <span className={`inline-block w-3 h-3 rounded-full ${getColorClass(departments.find(d => d.name === editData.department)?.color || '').replace('text-', 'bg-').split(' ')[0]}`}></span>
                )}
                <span>{editData.department || '選擇部門'}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {showDepartmentDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleDepartmentSelect(dept.name)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span className={`inline-block w-3 h-3 rounded-full bg-${dept.color}-500`}></span>
                    <span>{dept.name}</span>
                    {dept.description && (
                      <span className="text-xs text-gray-500 ml-auto truncate">{dept.description}</span>
                    )}
                  </button>
                ))}
                
                <div className="border-t border-gray-200">
                  {!showAddDepartment ? (
                    <button
                      type="button"
                      onClick={() => setShowAddDepartment(true)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                      <span>新增部門</span>
                    </button>
                  ) : (
                    <div className="p-2">
                      <input
                        type="text"
                        value={newDepartmentName}
                        onChange={e => setNewDepartmentName(e.target.value)}
                        placeholder="輸入部門名稱"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewDepartment();
                          } else if (e.key === 'Escape') {
                            setShowAddDepartment(false);
                            setNewDepartmentName('');
                          }
                        }}
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={handleAddNewDepartment}
                          className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          新增
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddDepartment(false);
                            setNewDepartmentName('');
                          }}
                          className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              電子郵件
            </label>
            <input
              type="email"
              value={editData.email}
              onChange={e => setEditData({ ...editData, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="space-y-2 mt-4">
          <button
            onClick={handleSave}
            className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
          >
            儲存
          </button>
          
          <button
            onClick={onCancel}
            className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;