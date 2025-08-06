'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, Building2, MoreVertical, Edit, Trash2, UserPlus } from 'lucide-react';
import { Employee } from './useOrgChartStore';
import useOrgChartStore from './useOrgChartStore';

// 明確定義 CustomNode 的 Props 型別
interface CustomNodeProps {
  data: Employee;
  selected?: boolean;
}

const CustomNode = memo(({ data, selected }: CustomNodeProps) => {
  const { setSelectedNode, deleteEmployee, updateEmployee, addEmployee, nodes, autoLayout } = useOrgChartStore();
  const [showMenu, setShowMenu] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState({
    name: data.name,
    position: data.position,
    department: data.department,
    email: data.email,
  });

  const handleNodeClick = () => {
    setSelectedNode(data.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`確定要刪除 ${data.name} 嗎？`)) {
      deleteEmployee(data.id);
    }
    setShowMenu(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditData({
      name: data.name,
      position: data.position,
      department: data.department,
      email: data.email,
    });
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    updateEmployee(data.id, editData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      name: data.name,
      position: data.position,
      department: data.department,
      email: data.email,
    });
  };

  const handleAddSubordinate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newId = (Math.max(...nodes.map(n => parseInt(n.id)), 0) + 1).toString();
    const newEmployee = {
      id: newId,
      name: '新員工',
      position: '職位',
      department: data.department,
      email: 'email@company.com',
      level: data.level + 1,
    };
    addEmployee(newEmployee, data.id);
    setTimeout(() => {
      autoLayout();
    }, 300);
    setShowMenu(false);
  };

  const levelColors = {
    1: 'from-purple-500 to-pink-500',
    2: 'from-blue-500 to-cyan-500',
    3: 'from-green-500 to-emerald-500',
    4: 'from-orange-500 to-yellow-500',
  };

  const bgGradient = levelColors[data.level as keyof typeof levelColors] || 'from-gray-500 to-gray-600';

  return (
    <div
      className={`relative transition-all duration-300 ${
        selected ? 'scale-105' : ''
      }`}
      onClick={!isEditing ? handleNodeClick : undefined}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-0 !w-3 !h-3"
      />
      
      <div className={`bg-white rounded-xl shadow-xl p-4 min-w-[240px] border-2 ${
        selected ? 'border-blue-400' : 'border-transparent'
      } hover:shadow-2xl transition-all duration-200 cursor-pointer`}>
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">編輯員工</h4>
              <div className="flex gap-1">
                <button
                  onClick={handleSaveEdit}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  儲存
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">職位</label>
                <input
                  type="text"
                  value={editData.position}
                  onChange={(e) => setEditData({ ...editData, position: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">部門</label>
                <input
                  type="text"
                  value={editData.department}
                  onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">電子郵件</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                {data.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.avatar} alt={data.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  data.name.charAt(0).toUpperCase()
                )}
              </div>
              
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[140px]">
                    <button
                      onClick={handleEdit}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-3 h-3" />
                      編輯
                    </button>
                    <button
                      onClick={handleAddSubordinate}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <UserPlus className="w-3 h-3" />
                      新增下屬
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                      刪除
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-base">{data.name}</h3>
              <p className="text-sm font-medium text-gray-700">{data.position}</p>
              
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                <Building2 className="w-3 h-3" />
                <span>{data.department}</span>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Mail className="w-3 h-3" />
                <span className="truncate">{data.email}</span>
              </div>
            </div>
            
            <div className="mt-3 flex gap-2">
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${bgGradient} text-white`}>
                Level {data.level}
              </span>
            </div>
          </>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-transparent !border-0 !w-3 !h-3"
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;