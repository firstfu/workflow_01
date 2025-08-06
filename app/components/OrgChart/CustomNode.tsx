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
  const { setSelectedNode, deleteEmployee } = useOrgChartStore();
  const [showMenu, setShowMenu] = React.useState(false);

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
    setSelectedNode(data.id);
    setShowMenu(false);
  };

  const handleAddSubordinate = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      onClick={handleNodeClick}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-0 !w-3 !h-3"
      />
      
      <div className={`bg-white rounded-xl shadow-xl p-4 min-w-[240px] border-2 ${
        selected ? 'border-blue-400' : 'border-transparent'
      } hover:shadow-2xl transition-all duration-200 cursor-pointer`}>
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