/**
 * 組織架構分析 API 端點
 * 
 * 接收組織架構資料並返回 LLM 分析結果
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLLMService } from '../../../lib/llm/service';
import type { Node, Edge } from '@xyflow/react';
import type { Employee } from '../../../components/OrgChart/useOrgChartStore';

interface AnalyzeRequest {
  nodes: Node<Employee>[];
  edges: Edge[];
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { nodes, edges } = body;

    // 驗證請求資料
    if (!nodes || !Array.isArray(nodes) || !edges || !Array.isArray(edges)) {
      return NextResponse.json(
        { error: '請提供有效的組織架構資料' },
        { status: 400 }
      );
    }

    // 呼叫 LLM 服務進行分析
    const llmService = getLLMService();
    const analysis = await llmService.analyzeOrganization(nodes, edges);

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('組織分析 API 錯誤:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '分析服務暫時無法使用',
        success: false
      },
      { status: 500 }
    );
  }
}