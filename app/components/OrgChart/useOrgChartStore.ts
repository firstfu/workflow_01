/**
 * 組織架構圖狀態管理器
 * 
 * 這個檔案使用 Zustand 實現全域狀態管理，負責處理組織架構圖的所有狀態和操作：
 * 
 * 核心功能：
 * - 節點和邊的狀態管理
 * - 員工資料的 CRUD 操作
 * - 拖拽狀態和回調函數管理
 * - 自動排版系統整合
 * - ReactFlow 事件處理
 * 
 * 資料結構：
 * - Employee: 員工基本資料介面，包含 id、name、position、department、email、level
 * - Node<Employee>: ReactFlow 節點，包含位置資訊和員工資料
 * - Edge: ReactFlow 邊，表示員工之間的層級關係
 * 
 * 狀態管理：
 * - nodes: 所有員工節點的陣列
 * - edges: 所有連線關係的陣列
 * - selectedNode: 當前選中的節點 ID
 * - isDraggingNode: 全域拖拽狀態標記
 * - autoLayoutCallback: 自動排版回調函數
 * - _onNodeDropCallback: 節點拖拽完成回調函數（私有）
 * 
 * 主要操作：
 * - setNodes/setEdges: 批量更新節點/邊資料
 * - addEmployee: 新增員工並自動創建節點和連線
 * - updateEmployee: 更新現有員工資料
 * - deleteEmployee: 刪除員工及相關連線，觸發自動排版
 * - onNodesChange/onEdgesChange: ReactFlow 變更事件處理
 * - onConnect: 處理新連線創建
 * 
 * 拖拽機制：
 * - 使用 _onNodeDropCallback 實現拖拽操作回調
 * - 透過 isDraggingNode 狀態控制視圖交互行為
 * - 支援替換和交換兩種拖拽操作模式
 * 
 * 自動排版整合：
 * - 透過 autoLayoutCallback 與排版系統解耦
 * - 在新增/刪除操作後自動觸發重新排版
 * - 確保視圖始終保持整齊的樹狀結構
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import { create } from 'zustand';
import { Node, Edge, Connection, NodeChange, EdgeChange, addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

export interface Employee extends Record<string, unknown> {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  avatar?: string;
  level: number;
}

interface OrgChartState {
  nodes: Node<Employee>[];
  edges: Edge[];
  selectedNode: string | null;
  isDraggingNode: boolean;
  collapsedNodes: Set<string>;
  
  setNodes: (nodes: Node<Employee>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  addEmployee: (employee: Employee, parentId?: string) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  replaceNodeData: (sourceId: string, targetId: string) => void;
  
  setSelectedNode: (id: string | null) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  autoLayout: () => void;
  setAutoLayoutCallback: (callback: () => void) => void;
  setIsDraggingNode: (isDragging: boolean) => void;
  setOnNodeDropCallback: (callback: (sourceId: string, targetId: string) => void) => void;
  
  toggleNodeCollapse: (nodeId: string) => void;
  isNodeCollapsed: (nodeId: string) => boolean;
  getVisibleNodes: () => Node<Employee>[];
  getVisibleEdges: () => Edge[];
  
  // 私有屬性
  _onNodeDropCallback: ((sourceId: string, targetId: string) => void) | null;
}

const useOrgChartStore = create<OrgChartState>((set, get) => ({
  nodes: [
    {
      id: '1',
      type: 'custom',
      position: { x: 400, y: 50 },
      data: {
        id: '1',
        name: '張明華',
        position: 'CEO',
        department: '執行長室',
        email: 'ceo@company.com',
        level: 1,
      },
    },
    {
      id: '2',
      type: 'custom',
      position: { x: 200, y: 200 },
      data: {
        id: '2',
        name: '李美玲',
        position: 'CTO',
        department: '技術部',
        email: 'cto@company.com',
        level: 2,
      },
    },
    {
      id: '3',
      type: 'custom',
      position: { x: 600, y: 200 },
      data: {
        id: '3',
        name: '王大偉',
        position: 'CFO',
        department: '財務部',
        email: 'cfo@company.com',
        level: 2,
      },
    },
    {
      id: '4',
      type: 'custom',
      position: { x: 100, y: 350 },
      data: {
        id: '4',
        name: '陳小明',
        position: '前端主管',
        department: '技術部',
        email: 'frontend.lead@company.com',
        level: 3,
      },
    },
    {
      id: '5',
      type: 'custom',
      position: { x: 300, y: 350 },
      data: {
        id: '5',
        name: '林志強',
        position: '後端主管',
        department: '技術部',
        email: 'backend.lead@company.com',
        level: 3,
      },
    },
  ],
  
  edges: [
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
    { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
    { id: 'e2-4', source: '2', target: '4', type: 'smoothstep' },
    { id: 'e2-5', source: '2', target: '5', type: 'smoothstep' },
  ],
  
  selectedNode: null,
  isDraggingNode: false,
  collapsedNodes: new Set<string>(),
  
  // 儲存自動排版的回調函數
  _autoLayoutCallback: null as (() => void) | null,
  _onNodeDropCallback: null as ((sourceId: string, targetId: string) => void) | null,
  
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node<Employee>[],
    });
  },
  
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, type: 'smoothstep' }, get().edges),
    });
  },
  
  addEmployee: (employee, parentId) => {
    const newNode: Node<Employee> = {
      id: employee.id,
      type: 'custom',
      position: { x: Math.random() * 500, y: (employee.level - 1) * 150 + 50 },
      data: employee,
    };
    
    const newNodes = [...get().nodes, newNode];
    const newEdges = [...get().edges];
    
    if (parentId) {
      newEdges.push({
        id: `e${parentId}-${employee.id}`,
        source: parentId,
        target: employee.id,
        type: 'smoothstep',
      });
    }
    
    set({ nodes: newNodes, edges: newEdges });
  },
  
  updateEmployee: (id, data) => {
    const nodes = get().nodes.map((node) => {
      if (node.id === id) {
        return {
          ...node,
          data: {
            ...node.data,
            ...data,
          },
        };
      }
      return node;
    });
    set({ nodes });
  },
  
  deleteEmployee: (id) => {
    const { nodes, edges } = get();
    
    // 遞歸找出所有需要刪除的子節點
    const findAllChildren = (nodeId: string): string[] => {
      const children = edges
        .filter(edge => edge.source === nodeId)
        .map(edge => edge.target);
      
      const allDescendants = [nodeId];
      children.forEach(childId => {
        allDescendants.push(...findAllChildren(childId));
      });
      
      return allDescendants;
    };
    
    const nodesToDelete = findAllChildren(id);
    
    // 刪除所有相關節點
    const filteredNodes = nodes.filter((node) => !nodesToDelete.includes(node.id));
    
    // 刪除所有相關連線
    const filteredEdges = edges.filter(
      (edge) => !nodesToDelete.includes(edge.source) && !nodesToDelete.includes(edge.target)
    );
    
    set({ nodes: filteredNodes, edges: filteredEdges });
    
    // 刪除後自動重新排版
    const state = get() as OrgChartState & { _autoLayoutCallback: (() => void) | null };
    const callback = state._autoLayoutCallback;
    if (callback) {
      setTimeout(() => {
        callback();
      }, 100);
    }
  },
  
  setSelectedNode: (id) => set({ selectedNode: id }),
  
  getEmployeeById: (id) => {
    const node = get().nodes.find((n) => n.id === id);
    return node?.data;
  },

  setAutoLayoutCallback: (callback) => {
    set({ _autoLayoutCallback: callback } as Partial<OrgChartState & { _autoLayoutCallback: (() => void) | null }>);
  },

  autoLayout: () => {
    const state = get() as OrgChartState & { _autoLayoutCallback: (() => void) | null };
    const callback = state._autoLayoutCallback;
    if (callback) {
      setTimeout(() => {
        callback();
      }, 100);
    }
  },

  replaceNodeData: (sourceId, targetId) => {
    const { nodes } = get();
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);
    
    if (!sourceNode || !targetNode) return;
    
    // 儲存來源節點的資料
    const sourceData = { ...sourceNode.data };
    
    // 更新節點：目標節點取代為來源節點的資料，來源節點變成空的
    const updatedNodes = nodes.map(node => {
      if (node.id === targetId) {
        // 目標節點獲得來源節點的資料，但保持自己的 id
        return {
          ...node,
          data: {
            ...sourceData,
            id: targetId,
          }
        };
      }
      if (node.id === sourceId) {
        // 來源節點變成空的員工資料
        return {
          ...node,
          data: {
            id: sourceId,
            name: '空職位',
            position: '待分配',
            department: '待分配',
            email: '',
            level: sourceData.level, // 保持原有層級
          }
        };
      }
      return node;
    });
    
    set({ nodes: updatedNodes });
  },

  setIsDraggingNode: (isDragging) => set({ isDraggingNode: isDragging }),
  
  setOnNodeDropCallback: (callback) => {
    set({ _onNodeDropCallback: callback } as Partial<OrgChartState & { _onNodeDropCallback: ((sourceId: string, targetId: string) => void) | null }>);
  },

  toggleNodeCollapse: (nodeId) => {
    set((state) => {
      const newCollapsedNodes = new Set(state.collapsedNodes);
      if (newCollapsedNodes.has(nodeId)) {
        newCollapsedNodes.delete(nodeId);
      } else {
        newCollapsedNodes.add(nodeId);
      }
      return { collapsedNodes: newCollapsedNodes };
    });
  },

  isNodeCollapsed: (nodeId) => {
    return get().collapsedNodes.has(nodeId);
  },

  getVisibleNodes: () => {
    const { nodes, edges, collapsedNodes } = get();
    
    // 找出所有被收縮節點的後代節點
    const getDescendants = (nodeId: string): Set<string> => {
      const descendants = new Set<string>();
      const children = edges.filter(edge => edge.source === nodeId).map(edge => edge.target);
      
      children.forEach(childId => {
        descendants.add(childId);
        // 遞歸獲取子節點的後代
        const childDescendants = getDescendants(childId);
        childDescendants.forEach(desc => descendants.add(desc));
      });
      
      return descendants;
    };
    
    const hiddenNodes = new Set<string>();
    
    // 對每個收縮的節點，找出其所有後代
    collapsedNodes.forEach(collapsedNodeId => {
      const descendants = getDescendants(collapsedNodeId);
      descendants.forEach(desc => hiddenNodes.add(desc));
    });
    
    // 返回不在隱藏列表中的節點
    return nodes.filter(node => !hiddenNodes.has(node.id));
  },

  getVisibleEdges: () => {
    const { edges } = get();
    const visibleNodes = get().getVisibleNodes();
    const visibleNodeIds = new Set(visibleNodes.map(node => node.id));
    
    // 只返回兩端都是可見節點的邊
    return edges.filter(edge => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  },
}));

export default useOrgChartStore;