/**
 * LLM 服務配置
 * 
 * 管理 LLM API 的配置設定，包括：
 * - API 金鑰和端點配置
 * - 模型選擇和參數設定
 * - 使用量限制和監控設定
 * - 錯誤重試機制配置
 */

export interface LLMConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  apiVersion?: string;
  baseURL?: string;
  timeout: number;
  maxRetries: number;
}

// 預設配置
export const DEFAULT_LLM_CONFIG: Omit<LLMConfig, 'apiKey'> = {
  model: 'gpt-3.5-turbo',
  maxTokens: 2000,
  temperature: 0.7,
  timeout: 30000, // 30秒
  maxRetries: 3,
};

// 取得配置（從環境變數或預設值）
export function getLLMConfig(): LLMConfig {
  const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
  
  if (!apiKey) {
    throw new Error('請在環境變數中設定 OPENAI_API_KEY 或 LLM_API_KEY');
  }

  return {
    ...DEFAULT_LLM_CONFIG,
    apiKey,
    model: process.env.LLM_MODEL || DEFAULT_LLM_CONFIG.model,
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || DEFAULT_LLM_CONFIG.maxTokens.toString()),
    temperature: parseFloat(process.env.LLM_TEMPERATURE || DEFAULT_LLM_CONFIG.temperature.toString()),
    baseURL: process.env.LLM_BASE_URL,
    timeout: parseInt(process.env.LLM_TIMEOUT || DEFAULT_LLM_CONFIG.timeout.toString()),
    maxRetries: parseInt(process.env.LLM_MAX_RETRIES || DEFAULT_LLM_CONFIG.maxRetries.toString()),
  };
}