/**
 * 職位描述生成 API 端點
 * 
 * 根據員工資料生成職位描述
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLLMService } from '../../../lib/llm/service';
import type { Employee } from '../../../components/OrgChart/useOrgChartStore';

interface JobDescriptionRequest {
  employee: Employee;
}

export async function POST(request: NextRequest) {
  try {
    const body: JobDescriptionRequest = await request.json();
    const { employee } = body;

    // 驗證請求資料
    if (!employee || !employee.name || !employee.position) {
      return NextResponse.json(
        { error: '請提供有效的員工資料' },
        { status: 400 }
      );
    }

    // 呼叫 LLM 服務生成職位描述
    const llmService = getLLMService();
    const jobDescription = await llmService.generateJobDescription(employee);

    return NextResponse.json({
      success: true,
      employee: {
        name: employee.name,
        position: employee.position,
        department: employee.department,
      },
      jobDescription,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('職位描述生成 API 錯誤:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '職位描述生成服務暫時無法使用',
        success: false
      },
      { status: 500 }
    );
  }
}