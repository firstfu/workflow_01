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
  
  setNodes: (nodes: Node<Employee>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  addEmployee: (employee: Employee, parentId?: string) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  setSelectedNode: (id: string | null) => void;
  getEmployeeById: (id: string) => Employee | undefined;
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
    const nodes = get().nodes.filter((node) => node.id !== id);
    const edges = get().edges.filter(
      (edge) => edge.source !== id && edge.target !== id
    );
    set({ nodes, edges });
  },
  
  setSelectedNode: (id) => set({ selectedNode: id }),
  
  getEmployeeById: (id) => {
    const node = get().nodes.find((n) => n.id === id);
    return node?.data;
  },
}));

export default useOrgChartStore;