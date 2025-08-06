/**
 * LLM 服務核心模組
 * 
 * 提供統一的 LLM API 呼叫介面，包括：
 * - OpenAI API 整合
 * - 錯誤處理和重試機制
 * - 使用量監控
 * - 快取機制（可選）
 */

import OpenAI from 'openai';
import { getLLMConfig, LLMConfig } from './config';
import type { Employee } from '../../components/OrgChart/useOrgChartStore';
import { Node, Edge } from '@xyflow/react';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class LLMService {
  private client: OpenAI;
  private config: LLMConfig;

  constructor() {
    this.config = getLLMConfig();
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries,
    });
  }

  /**
   * 發送聊天請求到 LLM
   */
  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new Error('LLM 回應格式錯誤');
      }

      return {
        content: choice.message.content,
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('LLM API 呼叫失敗:', error);
      
      if (error instanceof Error) {
        // 根據錯誤類型提供更友善的錯誤訊息
        if (error.message.includes('API key')) {
          throw new Error('API 金鑰配置錯誤，請檢查環境變數設定');
        } else if (error.message.includes('rate limit')) {
          throw new Error('API 使用量超過限制，請稍後再試');
        } else if (error.message.includes('timeout')) {
          throw new Error('API 呼叫逾時，請檢查網路連線');
        }
      }
      
      throw new Error('LLM 服務暫時無法使用，請稍後再試');
    }
  }

  /**
   * 分析組織架構並提供建議
   */
  async analyzeOrganization(nodes: Node<Employee>[], edges: Edge[]): Promise<string> {
    const organizationData = this.formatOrganizationData(nodes, edges);
    
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `你是一位專業的組織發展顧問，擅長分析組織架構並提供優化建議。
        請根據提供的組織資料進行深度分析，包括：
        1. 組織結構評估（層級設計、管轄範圍）
        2. 人力配置分析
        3. 可能存在的問題識別
        4. 具體的改善建議
        5. 風險評估和預防措施
        
        請用繁體中文回應，提供專業且實用的建議。`
      },
      {
        role: 'user',
        content: `請分析以下組織架構：\n\n${organizationData}`
      }
    ];

    const response = await this.chat(messages);
    return response.content;
  }

  /**
   * 回答關於組織的問題
   */
  async answerOrganizationQuestion(
    question: string, 
    nodes: Node<Employee>[], 
    edges: Edge[]
  ): Promise<string> {
    const organizationData = this.formatOrganizationData(nodes, edges);
    
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `你是一位專業的HR助手，熟悉組織管理和人力資源。
        你的任務是根據提供的組織架構資料回答使用者的問題。
        請提供準確、實用且專業的回答，使用繁體中文回應。
        
        組織資料：
        ${organizationData}`
      },
      {
        role: 'user',
        content: question
      }
    ];

    const response = await this.chat(messages);
    return response.content;
  }

  /**
   * 生成職位描述
   */
  async generateJobDescription(employee: Employee): Promise<string> {
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `你是一位專業的HR專家，擅長撰寫職位描述。
        請根據提供的員工資料生成完整的職位描述，包括：
        1. 職位概述
        2. 主要職責
        3. 技能要求
        4. 學歷和經驗要求
        5. 任職條件
        
        請用繁體中文撰寫，內容要專業且符合該職位的實際需求。`
      },
      {
        role: 'user',
        content: `請為以下職位生成職位描述：
        姓名: ${employee.name}
        職位: ${employee.position}
        部門: ${employee.department}
        層級: Level ${employee.level}
        電子郵件: ${employee.email}`
      }
    ];

    const response = await this.chat(messages);
    return response.content;
  }

  /**
   * 建議繼任者
   */
  async suggestSuccessors(
    targetEmployee: Employee, 
    nodes: Node<Employee>[], 
    edges: Edge[]
  ): Promise<string> {
    const organizationData = this.formatOrganizationData(nodes, edges);
    
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `你是一位專業的人才管理顧問，擅長繼任規劃。
        請根據組織架構分析並建議適合的繼任候選人，包括：
        1. 內部潛在繼任者分析
        2. 每位候選人的優劣評估
        3. 培訓和發展建議
        4. 繼任時程規劃
        5. 風險評估
        
        請用繁體中文提供專業的繼任規劃建議。`
      },
      {
        role: 'user',
        content: `請為以下職位制定繼任規劃：
        目標職位: ${targetEmployee.name} - ${targetEmployee.position} (${targetEmployee.department})
        
        組織架構資料：
        ${organizationData}`
      }
    ];

    const response = await this.chat(messages);
    return response.content;
  }

  /**
   * 格式化組織資料用於 LLM 分析
   */
  private formatOrganizationData(nodes: Node<Employee>[], edges: Edge[]): string {
    const orgData = {
      總人數: nodes.length,
      部門分佈: this.getDepartmentDistribution(nodes),
      層級分佈: this.getLevelDistribution(nodes),
      組織架構: this.getOrganizationHierarchy(nodes, edges),
    };

    return JSON.stringify(orgData, null, 2);
  }

  /**
   * 計算部門分佈
   */
  private getDepartmentDistribution(nodes: Node<Employee>[]) {
    const distribution: Record<string, number> = {};
    nodes.forEach(node => {
      const dept = node.data.department;
      distribution[dept] = (distribution[dept] || 0) + 1;
    });
    return distribution;
  }

  /**
   * 計算層級分佈
   */
  private getLevelDistribution(nodes: Node<Employee>[]) {
    const distribution: Record<number, number> = {};
    nodes.forEach(node => {
      const level = node.data.level;
      distribution[level] = (distribution[level] || 0) + 1;
    });
    return distribution;
  }

  /**
   * 建立組織階層結構
   */
  private getOrganizationHierarchy(nodes: Node<Employee>[], edges: Edge[]) {
    // 建立父子關係映射
    const childrenMap = new Map<string, string[]>();
    const parentMap = new Map<string, string>();
    
    edges.forEach(edge => {
      if (!childrenMap.has(edge.source)) {
        childrenMap.set(edge.source, []);
      }
      childrenMap.get(edge.source)!.push(edge.target);
      parentMap.set(edge.target, edge.source);
    });

    // 建立節點映射
    const nodeMap = new Map<string, Employee>();
    nodes.forEach(node => nodeMap.set(node.id, node.data));

    // 建立階層結構
    const buildHierarchy = (nodeId: string): Record<string, unknown> | null => {
      const nodeData = nodeMap.get(nodeId);
      if (!nodeData) return null;

      const children = childrenMap.get(nodeId) || [];
      return {
        id: nodeId,
        name: nodeData.name,
        position: nodeData.position,
        department: nodeData.department,
        level: nodeData.level,
        children: children.map(childId => buildHierarchy(childId)).filter(Boolean)
      };
    };

    // 找出根節點並建立完整階層
    const rootNodes = nodes.filter(node => !parentMap.has(node.id));
    return rootNodes.map(root => buildHierarchy(root.id));
  }
}

// 單例模式 - 確保整個應用程式使用同一個 LLM 服務實例
let llmServiceInstance: LLMService | null = null;

export function getLLMService(): LLMService {
  if (!llmServiceInstance) {
    llmServiceInstance = new LLMService();
  }
  return llmServiceInstance;
}