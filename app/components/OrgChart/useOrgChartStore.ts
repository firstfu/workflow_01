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

export interface Department {
  id: string;
  name: string;
  color: string; // Tailwind color class
  icon: string; // Lucide icon name
  description?: string;
}

export interface Employee extends Record<string, unknown> {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  avatar?: string;
  level: number;
  // 擴展資訊
  phone?: string;
  location?: string;
  hireDate?: string;
  skills?: string[];
  bio?: string;
  manager?: string; // Manager ID
  directReports?: string[]; // Direct report IDs
}

interface OrgChartState {
  nodes: Node<Employee>[];
  edges: Edge[];
  selectedNode: string | null;
  isDraggingNode: boolean;
  collapsedNodes: Set<string>;
  
  // 部門管理
  departments: Department[];
  selectedDepartments: Set<string>; // 篩選選中的部門
  
  // 搜索功能
  searchQuery: string;
  searchResults: string[]; // 匹配的員工 ID 列表
  
  // 主題設定
  theme: 'light' | 'dark';
  
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
  
  // 部門管理方法
  addDepartment: (department: Department) => void;
  updateDepartment: (id: string, data: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  getDepartmentById: (id: string) => Department | undefined;
  getDepartmentByName: (name: string) => Department | undefined;
  toggleDepartmentFilter: (departmentName: string) => void;
  clearDepartmentFilter: () => void;
  getFilteredNodes: () => Node<Employee>[];
  getDepartmentStats: () => Record<string, number>;
  
  // 搜索功能方法
  setSearchQuery: (query: string) => void;
  searchEmployees: (query: string) => string[];
  clearSearch: () => void;
  getSearchFilteredNodes: () => Node<Employee>[];
  highlightSearchResults: (nodeId: string) => boolean;
  
  // 主題方法
  setTheme: (theme: 'light' | 'dark') => void;
  
  // 私有屬性
  _onNodeDropCallback: ((sourceId: string, targetId: string) => void) | null;
}

const useOrgChartStore = create<OrgChartState>((set, get) => ({
  // 預設部門資料 - 中小型軟體公司
  departments: [
    {
      id: 'dept-executive',
      name: '執行長室',
      color: 'purple',
      icon: 'Crown',
      description: '公司最高決策與戰略規劃'
    },
    {
      id: 'dept-tech',
      name: '技術部',
      color: 'blue', 
      icon: 'Code',
      description: '產品開發與技術維護'
    },
    {
      id: 'dept-finance',
      name: '財務部',
      color: 'green',
      icon: 'DollarSign',
      description: '財務管理與會計'
    },
    {
      id: 'dept-hr',
      name: '人資部',
      color: 'orange',
      icon: 'Users',
      description: '人力資源與行政管理'
    },
    {
      id: 'dept-marketing',
      name: '行銷部',
      color: 'pink',
      icon: 'Megaphone',
      description: '市場推廣與品牌經營'
    },
    {
      id: 'dept-sales',
      name: '業務部',
      color: 'indigo',
      icon: 'Briefcase',
      description: '客戶開發與銷售管理'
    },
    {
      id: 'dept-design',
      name: '設計部',
      color: 'pink',
      icon: 'Palette',
      description: 'UI/UX設計與視覺創意'
    },
    {
      id: 'dept-qa',
      name: '品管部',
      color: 'gray',
      icon: 'Settings',
      description: '產品測試與品質保證'
    }
  ],
  selectedDepartments: new Set<string>(),
  
  // 搜索狀態初始化
  searchQuery: '',
  searchResults: [],
  
  // 主題初始化
  theme: 'light',

  nodes: [
    // Level 1 - CEO
    {
      id: '1',
      type: 'custom',
      position: { x: 600, y: 50 },
      data: {
        id: '1',
        name: '張明華',
        position: '執行長',
        department: '執行長室',
        email: 'ceo@techflow.com',
        level: 1,
        phone: '+886-2-1234-5678',
        location: '台北總部 - 12F',
        hireDate: '2019-01-15',
        skills: ['策略規劃', '領導管理', '商務談判', '投資決策'],
        bio: '具有15年軟體業經驗，曾任職於多家知名科技公司，專精於企業數位轉型與策略規劃。',
      },
    },

    // Level 2 - 各部門主管
    {
      id: '2',
      type: 'custom',
      position: { x: 200, y: 200 },
      data: {
        id: '2',
        name: '李美玲',
        position: '技術長',
        department: '技術部',
        email: 'cto@techflow.com',
        level: 2,
        phone: '+886-2-1234-5679',
        location: '台北總部 - 8F',
        hireDate: '2019-03-01',
        skills: ['系統架構', 'Cloud Computing', 'DevOps', '團隊管理', 'React', 'Node.js'],
        bio: '擁有12年全端開發經驗，專精於大規模系統設計與雲端架構，帶領技術團隊打造高效能產品。',
      },
    },
    {
      id: '3',
      type: 'custom',
      position: { x: 400, y: 200 },
      data: {
        id: '3',
        name: '王大偉',
        position: '財務長',
        department: '財務部',
        email: 'cfo@techflow.com',
        level: 2,
      },
    },
    {
      id: '4',
      type: 'custom',
      position: { x: 600, y: 200 },
      data: {
        id: '4',
        name: '陳雅芬',
        position: '人資長',
        department: '人資部',
        email: 'hr.director@techflow.com',
        level: 2,
      },
    },
    {
      id: '5',
      type: 'custom',
      position: { x: 800, y: 200 },
      data: {
        id: '5',
        name: '林志豪',
        position: '行銷長',
        department: '行銷部',
        email: 'cmo@techflow.com',
        level: 2,
      },
    },
    {
      id: '6',
      type: 'custom',
      position: { x: 1000, y: 200 },
      data: {
        id: '6',
        name: '黃建中',
        position: '業務長',
        department: '業務部',
        email: 'sales.director@techflow.com',
        level: 2,
      },
    },

    // Level 3 - 部門主管/資深經理
    {
      id: '7',
      type: 'custom',
      position: { x: 100, y: 350 },
      data: {
        id: '7',
        name: '吳小明',
        position: '前端開發主管',
        department: '技術部',
        email: 'frontend.lead@techflow.com',
        level: 3,
      },
    },
    {
      id: '8',
      type: 'custom',
      position: { x: 250, y: 350 },
      data: {
        id: '8',
        name: '劉志強',
        position: '後端開發主管',
        department: '技術部',
        email: 'backend.lead@techflow.com',
        level: 3,
      },
    },
    {
      id: '9',
      type: 'custom',
      position: { x: 400, y: 350 },
      data: {
        id: '9',
        name: '張淑芬',
        position: '會計經理',
        department: '財務部',
        email: 'accounting@techflow.com',
        level: 3,
      },
    },
    {
      id: '10',
      type: 'custom',
      position: { x: 600, y: 350 },
      data: {
        id: '10',
        name: '許家華',
        position: '招募經理',
        department: '人資部',
        email: 'recruitment@techflow.com',
        level: 3,
      },
    },
    {
      id: '11',
      type: 'custom',
      position: { x: 750, y: 350 },
      data: {
        id: '11',
        name: '楊美慧',
        position: '數位行銷經理',
        department: '行銷部',
        email: 'digital.marketing@techflow.com',
        level: 3,
      },
    },
    {
      id: '12',
      type: 'custom',
      position: { x: 900, y: 350 },
      data: {
        id: '12',
        name: '陳志偉',
        position: '企業客戶經理',
        department: '業務部',
        email: 'enterprise.sales@techflow.com',
        level: 3,
      },
    },
    {
      id: '13',
      type: 'custom',
      position: { x: 1050, y: 350 },
      data: {
        id: '13',
        name: '蔡雅婷',
        position: '設計總監',
        department: '設計部',
        email: 'design.director@techflow.com',
        level: 3,
      },
    },
    {
      id: '14',
      type: 'custom',
      position: { x: 1200, y: 350 },
      data: {
        id: '14',
        name: '洪志明',
        position: 'QA 經理',
        department: '品管部',
        email: 'qa.manager@techflow.com',
        level: 3,
      },
    },

    // Level 4 - 資深工程師/專員
    {
      id: '15',
      type: 'custom',
      position: { x: 50, y: 500 },
      data: {
        id: '15',
        name: '林小華',
        position: '資深前端工程師',
        department: '技術部',
        email: 'frontend.dev1@techflow.com',
        level: 4,
      },
    },
    {
      id: '16',
      type: 'custom',
      position: { x: 150, y: 500 },
      data: {
        id: '16',
        name: '鄭佳音',
        position: '前端工程師',
        department: '技術部',
        email: 'frontend.dev2@techflow.com',
        level: 4,
      },
    },
    {
      id: '17',
      type: 'custom',
      position: { x: 200, y: 500 },
      data: {
        id: '17',
        name: '謝志宏',
        position: '資深後端工程師',
        department: '技術部',
        email: 'backend.dev1@techflow.com',
        level: 4,
      },
    },
    {
      id: '18',
      type: 'custom',
      position: { x: 300, y: 500 },
      data: {
        id: '18',
        name: '周美玲',
        position: 'DevOps 工程師',
        department: '技術部',
        email: 'devops@techflow.com',
        level: 4,
      },
    },
    {
      id: '19',
      type: 'custom',
      position: { x: 400, y: 500 },
      data: {
        id: '19',
        name: '賴志豪',
        position: '會計專員',
        department: '財務部',
        email: 'accounting.staff@techflow.com',
        level: 4,
      },
    },
    {
      id: '20',
      type: 'custom',
      position: { x: 550, y: 500 },
      data: {
        id: '20',
        name: '何雅雯',
        position: '招募專員',
        department: '人資部',
        email: 'hr.staff@techflow.com',
        level: 4,
      },
    },
    {
      id: '21',
      type: 'custom',
      position: { x: 650, y: 500 },
      data: {
        id: '21',
        name: '廖建華',
        position: '行政專員',
        department: '人資部',
        email: 'admin@techflow.com',
        level: 4,
      },
    },
    {
      id: '22',
      type: 'custom',
      position: { x: 750, y: 500 },
      data: {
        id: '22',
        name: '范美慧',
        position: '社群經營專員',
        department: '行銷部',
        email: 'social.media@techflow.com',
        level: 4,
      },
    },
    {
      id: '23',
      type: 'custom',
      position: { x: 850, y: 500 },
      data: {
        id: '23',
        name: '高志偉',
        position: '內容行銷專員',
        department: '行銷部',
        email: 'content.marketing@techflow.com',
        level: 4,
      },
    },
    {
      id: '24',
      type: 'custom',
      position: { x: 900, y: 500 },
      data: {
        id: '24',
        name: '邱雅婷',
        position: '業務專員',
        department: '業務部',
        email: 'sales.rep1@techflow.com',
        level: 4,
      },
    },
    {
      id: '25',
      type: 'custom',
      position: { x: 1000, y: 500 },
      data: {
        id: '25',
        name: '蘇志明',
        position: '客戶成功專員',
        department: '業務部',
        email: 'customer.success@techflow.com',
        level: 4,
      },
    },
    {
      id: '26',
      type: 'custom',
      position: { x: 1050, y: 500 },
      data: {
        id: '26',
        name: '田雅芬',
        position: 'UI 設計師',
        department: '設計部',
        email: 'ui.designer@techflow.com',
        level: 4,
      },
    },
    {
      id: '27',
      type: 'custom',
      position: { x: 1150, y: 500 },
      data: {
        id: '27',
        name: '朱建中',
        position: 'UX 設計師',
        department: '設計部',
        email: 'ux.designer@techflow.com',
        level: 4,
      },
    },
    {
      id: '28',
      type: 'custom',
      position: { x: 1200, y: 500 },
      data: {
        id: '28',
        name: '曾美玲',
        position: '測試工程師',
        department: '品管部',
        email: 'qa.engineer@techflow.com',
        level: 4,
      },
    },
  ],
  
  edges: [
    // CEO 到各部門主管 (Level 1 -> Level 2)
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' }, // CEO -> CTO
    { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' }, // CEO -> CFO
    { id: 'e1-4', source: '1', target: '4', type: 'smoothstep' }, // CEO -> HR Director
    { id: 'e1-5', source: '1', target: '5', type: 'smoothstep' }, // CEO -> CMO
    { id: 'e1-6', source: '1', target: '6', type: 'smoothstep' }, // CEO -> Sales Director

    // 技術部層級 (CTO -> 技術主管)
    { id: 'e2-7', source: '2', target: '7', type: 'smoothstep' }, // CTO -> Frontend Lead
    { id: 'e2-8', source: '2', target: '8', type: 'smoothstep' }, // CTO -> Backend Lead

    // 財務部層級 (CFO -> 會計經理)
    { id: 'e3-9', source: '3', target: '9', type: 'smoothstep' }, // CFO -> Accounting Manager

    // 人資部層級 (HR Director -> 人資經理)
    { id: 'e4-10', source: '4', target: '10', type: 'smoothstep' }, // HR Director -> Recruitment Manager

    // 行銷部層級 (CMO -> 行銷經理)
    { id: 'e5-11', source: '5', target: '11', type: 'smoothstep' }, // CMO -> Digital Marketing Manager

    // 業務部層級 (Sales Director -> 業務經理)
    { id: 'e6-12', source: '6', target: '12', type: 'smoothstep' }, // Sales Director -> Enterprise Sales Manager

    // 設計部 & 品管部直接向 CEO 報告
    { id: 'e1-13', source: '1', target: '13', type: 'smoothstep' }, // CEO -> Design Director
    { id: 'e1-14', source: '1', target: '14', type: 'smoothstep' }, // CEO -> QA Manager

    // 技術部員工 (Level 3 -> Level 4)
    { id: 'e7-15', source: '7', target: '15', type: 'smoothstep' }, // Frontend Lead -> Senior Frontend Dev
    { id: 'e7-16', source: '7', target: '16', type: 'smoothstep' }, // Frontend Lead -> Frontend Dev
    { id: 'e8-17', source: '8', target: '17', type: 'smoothstep' }, // Backend Lead -> Senior Backend Dev
    { id: 'e8-18', source: '8', target: '18', type: 'smoothstep' }, // Backend Lead -> DevOps Engineer

    // 財務部員工
    { id: 'e9-19', source: '9', target: '19', type: 'smoothstep' }, // Accounting Manager -> Accounting Staff

    // 人資部員工
    { id: 'e10-20', source: '10', target: '20', type: 'smoothstep' }, // Recruitment Manager -> HR Staff
    { id: 'e4-21', source: '4', target: '21', type: 'smoothstep' }, // HR Director -> Admin Staff

    // 行銷部員工
    { id: 'e11-22', source: '11', target: '22', type: 'smoothstep' }, // Digital Marketing Manager -> Social Media Specialist
    { id: 'e11-23', source: '11', target: '23', type: 'smoothstep' }, // Digital Marketing Manager -> Content Marketing Specialist

    // 業務部員工
    { id: 'e12-24', source: '12', target: '24', type: 'smoothstep' }, // Enterprise Sales Manager -> Sales Rep
    { id: 'e12-25', source: '12', target: '25', type: 'smoothstep' }, // Enterprise Sales Manager -> Customer Success

    // 設計部員工
    { id: 'e13-26', source: '13', target: '26', type: 'smoothstep' }, // Design Director -> UI Designer
    { id: 'e13-27', source: '13', target: '27', type: 'smoothstep' }, // Design Director -> UX Designer

    // 品管部員工
    { id: 'e14-28', source: '14', target: '28', type: 'smoothstep' }, // QA Manager -> QA Engineer
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

  // 部門管理方法實作
  addDepartment: (department) => {
    set((state) => ({
      departments: [...state.departments, department]
    }));
  },

  updateDepartment: (id, data) => {
    set((state) => ({
      departments: state.departments.map(dept => 
        dept.id === id ? { ...dept, ...data } : dept
      )
    }));
  },

  deleteDepartment: (id) => {
    set((state) => ({
      departments: state.departments.filter(dept => dept.id !== id)
    }));
  },

  getDepartmentById: (id) => {
    return get().departments.find(dept => dept.id === id);
  },

  getDepartmentByName: (name) => {
    return get().departments.find(dept => dept.name === name);
  },

  toggleDepartmentFilter: (departmentName) => {
    set((state) => {
      const newSelectedDepartments = new Set(state.selectedDepartments);
      if (newSelectedDepartments.has(departmentName)) {
        newSelectedDepartments.delete(departmentName);
      } else {
        newSelectedDepartments.add(departmentName);
      }
      return { selectedDepartments: newSelectedDepartments };
    });
  },

  clearDepartmentFilter: () => {
    set({ selectedDepartments: new Set<string>() });
  },

  getFilteredNodes: () => {
    const { nodes, selectedDepartments } = get();
    
    // 如果沒有選擇任何部門，返回所有節點
    if (selectedDepartments.size === 0) {
      return nodes;
    }
    
    // 返回選中部門的節點
    return nodes.filter(node => selectedDepartments.has(node.data.department));
  },

  getDepartmentStats: () => {
    const { nodes } = get();
    const stats: Record<string, number> = {};
    
    nodes.forEach(node => {
      const department = node.data.department;
      stats[department] = (stats[department] || 0) + 1;
    });
    
    return stats;
  },

  // 搜索功能實作
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    if (query.trim()) {
      get().searchEmployees(query);
    } else {
      set({ searchResults: [] });
    }
  },

  searchEmployees: (query) => {
    const { nodes } = get();
    const lowerQuery = query.toLowerCase().trim();
    
    if (!lowerQuery) {
      set({ searchResults: [] });
      return [];
    }

    const matchedIds = nodes
      .filter(node => {
        const employee = node.data;
        return (
          employee.name.toLowerCase().includes(lowerQuery) ||
          employee.position.toLowerCase().includes(lowerQuery) ||
          employee.department.toLowerCase().includes(lowerQuery) ||
          employee.email.toLowerCase().includes(lowerQuery)
        );
      })
      .map(node => node.id);

    set({ searchResults: matchedIds });
    return matchedIds;
  },

  clearSearch: () => {
    set({ searchQuery: '', searchResults: [] });
  },

  getSearchFilteredNodes: () => {
    const { searchResults, searchQuery } = get();
    const visibleNodes = get().getVisibleNodes();
    
    // 如果沒有搜索關鍵字，返回所有可見節點
    if (!searchQuery.trim()) {
      return visibleNodes;
    }
    
    // 如果有搜索關鍵字，只返回匹配的節點
    return visibleNodes.filter(node => searchResults.includes(node.id));
  },

  highlightSearchResults: (nodeId) => {
    const { searchResults, searchQuery } = get();
    return searchQuery.trim() !== '' && searchResults.includes(nodeId);
  },

  // 主題功能實作
  setTheme: (theme) => {
    set({ theme });
  },
}));

export default useOrgChartStore;