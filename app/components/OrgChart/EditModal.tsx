/**
 * 員工編輯彈窗元件
 * 
 * 提供與拖拽選項彈窗一致的設計風格，用於員工資料的編輯功能
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Employee } from './useOrgChartStore';

interface EditModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onSave: (data: Partial<Employee>) => void;
  onCancel: () => void;
}

const EditModal = ({ isOpen, employee, onSave, onCancel }: EditModalProps) => {
  const [editData, setEditData] = useState({
    name: '',
    position: '',
    department: '',
    email: '',
  });

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
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              部門
            </label>
            <input
              type="text"
              value={editData.department}
              onChange={e => setEditData({ ...editData, department: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
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