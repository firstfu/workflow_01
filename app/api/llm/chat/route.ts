/**
 * 智能問答 API 端點
 * 
 * 處理關於組織架構的問答請求
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLLMService } from '../../../lib/llm/service';
import type { Node, Edge } from '@xyflow/react';
import type { Employee } from '../../../components/OrgChart/useOrgChartStore';

interface ChatRequest {
  question: string;
  nodes: Node<Employee>[];
  edges: Edge[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { question, nodes, edges } = body;

    // 驗證請求資料
    if (!question?.trim()) {
      return NextResponse.json(
        { error: '請輸入問題' },
        { status: 400 }
      );
    }

    if (!nodes || !Array.isArray(nodes) || !edges || !Array.isArray(edges)) {
      return NextResponse.json(
        { error: '請提供有效的組織架構資料' },
        { status: 400 }
      );
    }

    // 呼叫 LLM 服務回答問題
    const llmService = getLLMService();
    const answer = await llmService.answerOrganizationQuestion(question, nodes, edges);

    return NextResponse.json({
      success: true,
      question,
      answer,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('智能問答 API 錯誤:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '問答服務暫時無法使用',
        success: false
      },
      { status: 500 }
    );
  }
}