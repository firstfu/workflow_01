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
    onNodesChange,
    onEdgesChange,
    onConnect,
    addEmployee,
  } = useOrgChartStore();
  
  const reactFlowInstance = useReactFlow();
  const [showGrid, setShowGrid] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  
  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = nodes.map((node) => {
      const level = node.data.level;
      const nodesAtLevel = nodes.filter(n => n.data.level === level);
      const indexAtLevel = nodesAtLevel.findIndex(n => n.id === node.id);
      const spacing = 300;
      const ySpacing = 200;
      
      return {
        ...node,
        position: {
          x: (indexAtLevel - (nodesAtLevel.length - 1) / 2) * spacing + 500,
          y: (level - 1) * ySpacing + 100,
        },
      };
    });
    
    useOrgChartStore.getState().setNodes(layoutedNodes);
  }, [nodes]);
  
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
  }, [nodes, addEmployee]);
  
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
          animated: true,
          style: {
            strokeWidth: 2,
            stroke: '#94a3b8',
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