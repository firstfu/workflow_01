# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開發指令

### 常用指令
- `npm run dev` - 啟動開發伺服器 (使用 Turbopack)
- `npm run build` - 建置專案
- `npm run start` - 啟動生產環境伺服器
- `npm run lint` - 執行 ESLint 檢查

### 測試開發
開發伺服器預設在 http://localhost:3000 執行

## 專案架構

這是一個組織架構圖應用程式，使用 Next.js 15.4.5 與 App Router，技術棧包含 TypeScript、React 19 和 Tailwind CSS v4。

### 主要功能
- 互動式組織架構圖，支援拖拽、縮放、自動排版
- 員工資料管理 (新增、編輯、刪除)
- 匯入/匯出 JSON 格式資料
- 深淺主題切換、格線顯示控制
- 小地圖導航和節點統計

### 核心架構
- `app/page.tsx` - 主頁面，渲染 OrgChart 元件
- `app/components/OrgChart/` - 組織架構圖核心模組
  - `OrgChart.tsx` - 主要元件，整合 ReactFlow 與工具列功能
  - `CustomNode.tsx` - 自定義節點元件，用於顯示員工資訊
  - `useOrgChartStore.ts` - Zustand 狀態管理，處理節點/邊資料與操作

### 狀態管理
- 使用 Zustand 管理全域狀態
- Employee 介面定義員工資料結構 (包含 id, name, position, department, email, level)
- 節點操作：新增、更新、刪除員工，以及節點/邊的變更處理
- 支援父子層級關係建立

### 自動排版系統
- `handleAutoLayout` 函數實作智能樹狀布局算法
- 預先計算子樹寬度，確保節點不重疊
- 支援多根節點情況，父節點自動居中於子節點上方
- 布局參數：水平間距 650px，垂直間距 280px
- 連線類型使用 `smoothstep` (borderRadius: 0) 產生垂直-水平-垂直的直角連線

### 主要依賴
- `@xyflow/react` - 流程圖/組織圖框架
- `zustand` - 輕量級狀態管理
- `lucide-react` - 圖示庫
- TypeScript 設定使用 `@/*` 路徑別名對應到專案根目錄

## 連線樣式配置

組織圖使用特定的連線樣式：
- 類型：`smoothstep` 
- 樣式：`borderRadius: 0, offset: 20` 產生直角轉折
- 連線路徑：先垂直向下，再水平移動，最後垂直向上到目標節點
- 避免使用 `step`, `straight`, 或 `default` 類型以維持一致的組織圖外觀