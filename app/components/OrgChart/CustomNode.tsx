/**
 * 自定義節點元件
 *
 * 這個元件負責渲染組織架構圖中的每個員工節點，提供豐富的互動功能：
 *
 * 主要功能：
 * - 員工資料顯示：姓名、職位、部門、電子郵件
 * - 層級視覺化：根據員工層級顯示不同的顏色和樣式
 * - 拖拽功能：支援節點間的拖拽操作（替換/交換資料）
 * - 內嵌編輯：雙擊節點可直接編輯員工資訊
 * - 操作選單：提供新增、編輯、刪除等操作
 * - 響應式設計：適應不同螢幕尺寸
 *
 * 互動操作：
 * - 單擊：選擇節點
 * - 雙擊：進入編輯模式
 * - 拖拽：觸發節點資料操作選擇彈窗
 * - 右鍵選單：存取完整操作功能
 *
 * 拖拽操作流程：
 * 1. 按住節點開始拖拽
 * 2. 拖拽到目標節點並釋放
 * 3. 彈出操作選擇對話框
 * 4. 選擇「替換」或「交換」操作
 * 5. 執行對應的資料變更
 *
 * 層級顏色系統：
 * - Level 1 (高階主管): 紫色 (#8b5cf6)
 * - Level 2 (中階主管): 藍色 (#3b82f6)
 * - Level 3 (基層主管): 綠色 (#10b981)
 * - Level 4 (一般員工): 橙色 (#f59e0b)
 *
 * 技術實現：
 * - 使用 React.memo 優化渲染性能
 * - HTML5 Drag and Drop API 實現拖拽功能
 * - 全域狀態管理確保拖拽狀態同步
 * - 事件委託處理全域 mouseup 事件
 *
 * @author Claude Code
 * @version 1.0.0
 */

"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Mail, Building2, MoreVertical, Edit, Trash2, UserPlus, Move, ChevronDown, ChevronRight, Eye } from "lucide-react";
import { Employee } from "./useOrgChartStore";
import useOrgChartStore from "./useOrgChartStore";
import EditModal from "./EditModal";
import EmployeeDetailModal from "./EmployeeDetailModal";
import DepartmentIcon from "./DepartmentIcon";
import { getDepartmentColor, getDepartmentBadgeClasses, getDepartmentColorDot } from "./departmentUtils";

// 明確定義 CustomNode 的 Props 型別
interface CustomNodeProps {
  data: Employee;
  selected?: boolean;
}

const CustomNode = memo(({ data, selected }: CustomNodeProps) => {
  const { 
    setSelectedNode, 
    deleteEmployee, 
    updateEmployee, 
    addEmployee, 
    nodes, 
    edges,
    autoLayout, 
    setIsDraggingNode,
    toggleNodeCollapse,
    isNodeCollapsed,
    departments,
    getDepartmentByName,
    highlightSearchResults,
    theme
  } = useOrgChartStore();
  const [showMenu, setShowMenu] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  
  const collapsed = isNodeCollapsed(data.id);
  const hasChildren = edges.some(edge => edge.source === data.id);
  const department = getDepartmentByName(data.department);
  const isHighlighted = highlightSearchResults(data.id);

  // 添加全域 mouseup 監聽器以確保狀態正確重置
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDraggingNode(false);
      setIsDragging(false);
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [setIsDraggingNode]);

  const handleNodeClick = () => {
    setSelectedNode(data.id);
  };

  const handleDoubleClick = () => {
    setShowDetailModal(true);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetailModal(true);
    setShowMenu(false);
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
    setShowEditModal(true);
    setShowMenu(false);
  };

  const handleSaveEdit = (editData: Partial<Employee>) => {
    updateEmployee(data.id, editData);
    setShowEditModal(false);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
  };

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNodeCollapse(data.id);
    // 收縮/展開後自動重新排版以保持對稱性
    setTimeout(() => {
      autoLayout();
    }, 100);
  };

  const handleAddSubordinate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newId = (Math.max(...nodes.map(n => parseInt(n.id)), 0) + 1).toString();
    const newEmployee = {
      id: newId,
      name: "新員工",
      position: "職位",
      department: data.department,
      email: "email@company.com",
      level: data.level + 1,
    };
    addEmployee(newEmployee, data.id);
    setTimeout(() => {
      autoLayout();
    }, 300);
    setShowMenu(false);
  };

  // 拖拽處理函數
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation(); // 阻止事件冒泡到畫布
    e.dataTransfer.setData("text/plain", data.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
    // setIsDraggingNode 已在 mousedown 時設置

    // 創建自定義拖曳預覽
    const dragPreview = document.createElement("div");
    dragPreview.innerHTML = `
      <div style="
        background: white;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        padding: 10px;
        min-width: 160px;
        border: 2px solid #60a5fa;
        opacity: 1;
        transform: scale(0.75);
        font-family: ui-sans-serif, system-ui, sans-serif;
      ">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: linear-gradient(to bottom right, ${
              data.level === 1 ? "#8b5cf6, #ec4899" : data.level === 2 ? "#3b82f6, #06b6d4" : data.level === 3 ? "#10b981, #059669" : "#f59e0b, #eab308"
            });
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          ">
            ${data.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div>
          <h3 style="font-weight: bold; color: #111827; font-size: 13px; margin: 0 0 2px 0;">${data.name}</h3>
          <p style="font-size: 11px; font-weight: 500; color: #6b7280; margin: 0;">${data.position}</p>
        </div>
      </div>
    `;

    dragPreview.style.position = "absolute";
    dragPreview.style.top = "-1000px";
    dragPreview.style.left = "-1000px";
    dragPreview.style.pointerEvents = "none";
    document.body.appendChild(dragPreview);

    // 設置拖曳影像
    e.dataTransfer.setDragImage(dragPreview, 60, 40);

    // 清理預覽元素
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragging(false);
    // 全域拖拽狀態由 mouseup 處理
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = e.dataTransfer.getData("text/plain");

    if (sourceId && sourceId !== data.id) {
      // 觸發彈窗選擇
      const state = useOrgChartStore.getState();
      const callback = state._onNodeDropCallback;
      if (callback) {
        callback(sourceId, data.id);
      }
    }

    setDragOver(false);
  };

  const levelColors = {
    1: "from-purple-500 to-pink-500",
    2: "from-blue-500 to-cyan-500",
    3: "from-green-500 to-emerald-500",
    4: "from-orange-500 to-yellow-500",
  };

  const bgGradient = levelColors[data.level as keyof typeof levelColors] || "from-gray-500 to-gray-600";

  return (
    <div
      className={`relative transition-all duration-300 ${selected ? "scale-105" : ""} ${
        isDragging ? "opacity-60 scale-110 shadow-2xl ring-2 ring-blue-400 ring-opacity-50 z-50" : ""
      } ${dragOver ? "ring-2 ring-green-400 ring-opacity-70 scale-105" : ""}`}
      onClick={handleNodeClick}
      onDoubleClick={handleDoubleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseDownCapture={e => {
        // 阻止節點本身觸發拖拽，但允許畫布拖動（除非是拖拽手柄）
        e.stopPropagation();
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-3 !h-3" />

      <div
        className={`rounded-xl shadow-xl p-4 min-w-[240px] border-2 transition-all duration-200 cursor-pointer ${
          theme === 'dark' 
            ? 'bg-gray-800 text-gray-200 shadow-gray-900/50' 
            : 'bg-white text-gray-900'
        } ${
          selected 
            ? "border-blue-400" 
            : isHighlighted 
              ? theme === 'dark'
                ? "border-yellow-400 bg-yellow-900/20 ring-2 ring-yellow-400 ring-opacity-30"
                : "border-yellow-400 bg-yellow-50 ring-2 ring-yellow-300 ring-opacity-50"
              : "border-transparent"
        } hover:shadow-2xl ${
          isHighlighted 
            ? theme === 'dark' ? "shadow-yellow-400/20" : "shadow-yellow-200" 
            : ""
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
            >
              {data.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.avatar} alt={data.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                data.name.charAt(0).toUpperCase()
              )}
            </div>

            {/* 拖拽手柄 */}
            <div
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onPointerDownCapture={e => {
                e.stopPropagation();
                setIsDraggingNode(true);
              }}
              onMouseDownCapture={e => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className={`cursor-move p-2 hover:bg-blue-50 hover:ring-1 hover:ring-blue-300 rounded-lg transition-all duration-200 select-none ${
                isDragging ? "bg-blue-100 ring-2 ring-blue-400 shadow-md" : ""
              }`}
              title="拖拽以替換其他節點"
              style={{ touchAction: "none" }}
            >
              <Move className={`w-4 h-4 pointer-events-none transition-colors ${isDragging ? "text-blue-600" : "text-gray-400 hover:text-blue-500"}`} />
            </div>

            {/* 展開/收縮按鈕 */}
            {hasChildren && (
              <button
                onClick={handleToggleCollapse}
                className="p-2 hover:bg-gray-50 hover:ring-1 hover:ring-gray-300 rounded-lg transition-all duration-200"
                title={collapsed ? "展開子節點" : "收縮子節點"}
              >
                {collapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={e => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {showMenu && (
              <div className={`absolute right-0 top-8 rounded-lg shadow-xl border py-1 z-50 min-w-[140px] ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <button onClick={handleViewDetails} className={`w-full px-3 py-2 text-left text-sm hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  <Eye className="w-3 h-3" />
                  查看詳細
                </button>
                <button onClick={handleEdit} className={`w-full px-3 py-2 text-left text-sm hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  <Edit className="w-3 h-3" />
                  編輯
                </button>
                <button onClick={handleAddSubordinate} className={`w-full px-3 py-2 text-left text-sm hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  <UserPlus className="w-3 h-3" />
                  新增下屬
                </button>
                <button onClick={handleDelete} className={`w-full px-3 py-2 text-left text-sm hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} flex items-center gap-2 text-red-600`}>
                  <Trash2 className="w-3 h-3" />
                  刪除
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <h3 className={`font-bold text-base ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{data.name}</h3>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{data.position}</p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${getDepartmentColorDot(department)}`}></div>
                <DepartmentIcon 
                  iconName={department?.icon} 
                  size={12} 
                  className={`${department ? getDepartmentColor(department, 'textLight') : 'text-gray-500'}`}
                />
              </div>
              <span className={`text-xs font-medium ${department ? getDepartmentColor(department, 'textLight') : 'text-gray-500'}`}>
                {data.department}
              </span>
            </div>
            
            {/* 部門標籤 */}
            <span className={`${getDepartmentBadgeClasses(department)} text-[10px]`}>
              {department?.name || data.department}
            </span>
          </div>

          <div className={`flex items-center gap-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <Mail className="w-3 h-3" />
            <span className="truncate">{data.email}</span>
          </div>
        </div>

        <div className="mt-3 flex gap-2 items-center justify-between">
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${bgGradient} text-white`}>
            Level {data.level}
          </span>
          {hasChildren && (
            <span className="text-xs text-gray-500">
              {collapsed ? "已收縮" : "已展開"}
            </span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-3 !h-3" />
      
      <EditModal
        isOpen={showEditModal}
        employee={data}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
      
      <EmployeeDetailModal
        isOpen={showDetailModal}
        employee={data}
        onClose={() => setShowDetailModal(false)}
        onEdit={(employee) => {
          setShowDetailModal(false);
          setShowEditModal(true);
        }}
      />
    </div>
  );
});

CustomNode.displayName = "CustomNode";

export default CustomNode;
