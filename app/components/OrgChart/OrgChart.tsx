'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  ConnectionMode,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  NodeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import useOrgChartStore from './useOrgChartStore';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Layout, 
  Download, 
  Upload,
  UserPlus,
  Settings,
  Palette,
  Grid3x3
} from 'lucide-react';

const OrgChartContent = () => {
  const {
    nodes,
    edges,
    onNodesChange: originalOnNodesChange,
    onEdgesChange,
    onConnect,
    addEmployee,
    setAutoLayoutCallback,
  } = useOrgChartStore();
  
  const reactFlowInstance = useReactFlow();
  const [showGrid, setShowGrid] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    const filteredChanges = changes.filter(change => {
      if (change.type === 'position' && change.dragging) {
        return false;
      }
      return true;
    });
    
    originalOnNodesChange(filteredChanges);
  }, [originalOnNodesChange]);
  
  const handleAutoLayout = useCallback(() => {
    const { nodes: currentNodes, edges: currentEdges } = useOrgChartStore.getState();
    
    // 建立節點映射和關係
    const nodeMap = new Map<string, typeof currentNodes[0]>();
    currentNodes.forEach(node => nodeMap.set(node.id, node));
    
    // 建立父子關係映射
    const childrenMap = new Map<string, string[]>();
    const parentMap = new Map<string, string>();
    
    currentEdges.forEach(edge => {
      if (!childrenMap.has(edge.source)) {
        childrenMap.set(edge.source, []);
      }
      childrenMap.get(edge.source)!.push(edge.target);
      parentMap.set(edge.target, edge.source);
    });
    
    // 找出根節點
    const rootNodes = currentNodes.filter(node => !parentMap.has(node.id));
    if (rootNodes.length === 0) return;
    
    // 布局配置
    const horizontalSpacing = 650; // 同層節點之間的水平間距（大幅增加間距）
    const verticalSpacing = 280;   // 層級之間的垂直間距（大幅增加以避免線條向上彎曲）
    const startY = 100;
    
    // 儲存計算後的位置
    const nodePositions = new Map<string, { x: number; y: number }>();
    
    // 建立層級結構
    interface TreeNode {
      id: string;
      children: TreeNode[];
      width: number;
      x?: number;
      y?: number;
    }
    
    // 建立樹結構
    const buildTree = (nodeId: string): TreeNode => {
      const children = (childrenMap.get(nodeId) || []).map(childId => buildTree(childId));
      return {
        id: nodeId,
        children,
        width: 0, // 稍後計算
      };
    };
    
    // 計算每個節點所需的寬度（包含其子樹）
    const calculateWidth = (treeNode: TreeNode): number => {
      if (treeNode.children.length === 0) {
        treeNode.width = 1; // 葉節點寬度為1個單位
        return 1;
      }
      
      let totalWidth = 0;
      treeNode.children.forEach(child => {
        totalWidth += calculateWidth(child);
      });
      
      treeNode.width = totalWidth;
      return totalWidth;
    };
    
    // 設置節點位置
    const setPositions = (treeNode: TreeNode, left: number, top: number) => {
      const nodeData = nodeMap.get(treeNode.id);
      if (!nodeData) return;
      
      // 計算節點的X位置（在其子樹的中心）
      const nodeX = left + (treeNode.width * horizontalSpacing) / 2;
      treeNode.x = nodeX;
      treeNode.y = top;
      
      nodePositions.set(treeNode.id, { x: nodeX, y: top });
      
      // 定位子節點
      if (treeNode.children.length > 0) {
        let childLeft = left;
        treeNode.children.forEach(child => {
          setPositions(child, childLeft, top + verticalSpacing);
          childLeft += child.width * horizontalSpacing;
        });
      }
    };
    
    // 對根節點執行布局（假設只有一個根節點為主要情況）
    const mainRoot = rootNodes[0];
    const tree = buildTree(mainRoot.id);
    calculateWidth(tree);
    
    // 計算起始位置，使樹居中
    const totalWidth = tree.width * horizontalSpacing;
    const startX = 1200 - totalWidth / 2; // 調整畫布中心點以適應更寬的布局
    
    setPositions(tree, startX, startY);
    
    // 處理其他孤立的根節點（如果有）
    if (rootNodes.length > 1) {
      let offsetX = startX + totalWidth + horizontalSpacing;
      for (let i = 1; i < rootNodes.length; i++) {
        const root = rootNodes[i];
        const rootTree = buildTree(root.id);
        calculateWidth(rootTree);
        setPositions(rootTree, offsetX, startY);
        offsetX += rootTree.width * horizontalSpacing + horizontalSpacing;
      }
    }
    
    // 更新節點位置
    const layoutedNodes = currentNodes.map(node => {
      const position = nodePositions.get(node.id);
      if (position) {
        return {
          ...node,
          position: { x: position.x, y: position.y },
        };
      }
      return node;
    });
    
    useOrgChartStore.getState().setNodes(layoutedNodes);
    
    // 自動調整視圖
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.15, duration: 800 });
    }, 100);
  }, [reactFlowInstance]);

  // 設置自動排版回調並在初始化時執行
  React.useEffect(() => {
    setAutoLayoutCallback(handleAutoLayout);
    // 初始化時自動執行排版
    setTimeout(() => {
      handleAutoLayout();
    }, 500);
  }, [setAutoLayoutCallback, handleAutoLayout]);
  
  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
  }, [reactFlowInstance]);
  
  const handleZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn({ duration: 200 });
  }, [reactFlowInstance]);
  
  const handleZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut({ duration: 200 });
  }, [reactFlowInstance]);
  
  const handleAddEmployee = useCallback(() => {
    const newId = (Math.max(...nodes.map(n => parseInt(n.id)), 0) + 1).toString();
    const newEmployee = {
      id: newId,
      name: '新員工',
      position: '職位',
      department: '部門',
      email: 'email@company.com',
      level: 2,
    };
    addEmployee(newEmployee);
    
    setTimeout(() => {
      handleAutoLayout();
    }, 300);
  }, [nodes, addEmployee, handleAutoLayout]);
  
  const handleExport = useCallback(() => {
    const data = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `org-chart-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);
  
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            useOrgChartStore.getState().setNodes(data.nodes);
            useOrgChartStore.getState().setEdges(data.edges);
          } catch {
            alert('匯入失敗：檔案格式錯誤');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className={theme === 'dark' ? 'dark' : ''}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: {
            strokeWidth: 2,
            stroke: '#374151',
          },
        }}
      >
        <Panel position="top-left" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 m-4">
          <div className="flex gap-2">
            <button
              onClick={handleAddEmployee}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="新增員工"
            >
              <UserPlus className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            </button>
            
            <div className="w-px bg-gray-300" />
            
            <button
              onClick={handleAutoLayout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="自動排版"
            >
              <Layout className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            </button>
            
            <button
              onClick={handleFitView}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="適應視窗"
            >
              <Maximize2 className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            </button>
            
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="放大"
            >
              <ZoomIn className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            </button>
            
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="縮小"
            >
              <ZoomOut className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            </button>
            
            <div className="w-px bg-gray-300" />
            
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 hover:bg-gray-100 rounded-lg transition-colors group ${showGrid ? 'bg-blue-50' : ''}`}
              title="切換格線"
            >
              <Grid3x3 className={`w-5 h-5 ${showGrid ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'}`} />
            </button>
            
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="切換主題"
            >
              <Palette className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            </button>
            
            <div className="w-px bg-gray-300" />
            
            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="匯出"
            >
              <Download className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
            </button>
            
            <button
              onClick={handleImport}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="匯入"
            >
              <Upload className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
            </button>
          </div>
        </Panel>
        
        <Panel position="top-center" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-6 py-3 m-4">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            組織架構圖
          </h1>
        </Panel>
        
        <Panel position="bottom-left" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 m-4">
          <div className="text-sm text-gray-600">
            節點數: <span className="font-semibold">{nodes.length}</span> | 
            連線數: <span className="font-semibold ml-1">{edges.length}</span>
          </div>
        </Panel>
        
        {showGrid && (
          <Background 
            variant={BackgroundVariant.Dots}
            gap={20} 
            size={1}
            color={theme === 'dark' ? '#374151' : '#e5e7eb'}
          />
        )}
        
        <Controls 
          showZoom={false}
          showFitView={false}
          showInteractive={false}
          className="!bg-white/90 !backdrop-blur-sm !shadow-lg !border-0 !rounded-lg"
        />
        
        <MiniMap 
          className="!bg-white/90 !backdrop-blur-sm !shadow-lg !border-0 !rounded-lg"
          nodeColor={(node) => {
            const level = (node.data as Record<string, unknown> & { level?: number })?.level || 1;
            const colors: { [key: number]: string } = {
              1: '#8b5cf6',
              2: '#3b82f6', 
              3: '#10b981',
              4: '#f59e0b',
            };
            return colors[level] || '#6b7280';
          }}
          maskColor={theme === 'dark' ? 'rgb(0, 0, 0, 0.7)' : 'rgb(255, 255, 255, 0.7)'}
        />
      </ReactFlow>
    </div>
  );
};

const OrgChart = () => {
  return (
    <ReactFlowProvider>
      <OrgChartContent />
    </ReactFlowProvider>
  );
};

export default OrgChart;