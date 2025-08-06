# 組織架構圖應用程式 📊

一個現代化的互動式組織架構圖應用程式，採用 Next.js 15 與 React 19 構建，提供直觀的員工關係管理與視覺化展示功能。

## ✨ 專案特色

### 🎯 核心功能
- **互動式組織架構圖**：支援拖拽、縮放、平移等多種操作方式
- **智能拖拽系統**：節點間支援「替換資料」與「交換資料」兩種操作模式
- **員工資料管理**：完整的 CRUD 功能，包含新增、編輯、刪除員工資訊
- **資料匯入匯出**：支援 JSON 格式的組織架構資料匯入與匯出
- **自動排版系統**：智能樹狀布局算法，自動優化節點配置
- **主題切換**：內建深色與淺色主題，提升使用體驗
- **視圖控制**：縮放適應、格線顯示、小地圖導航等完整視圖功能

### 🏗️ 技術架構特色
- **現代化前端技術棧**：Next.js 15.4.5 + React 19 + TypeScript
- **響應式設計**：基於 Tailwind CSS v4 的現代化樣式系統
- **高效狀態管理**：採用 Zustand 輕量級狀態管理方案
- **專業圖形框架**：基於 @xyflow/react 的流程圖解決方案
- **完整開發體驗**：內建 ESLint、TypeScript 支援與 Turbopack 加速開發

## 🛠️ 技術棧

### 前端框架
- **Next.js 15.4.5** - React 元框架，支援 App Router
- **React 19.1.0** - 最新版本的 React 框架
- **TypeScript 5** - 靜態類型檢查，提升程式碼品質

### 核心依賴
- **@xyflow/react 12.8.2** - 專業流程圖與組織圖框架
- **zustand 5.0.7** - 輕量級狀態管理解決方案
- **lucide-react 0.536.0** - 現代化圖示庫
- **Tailwind CSS 4** - 實用程式優先的 CSS 框架

### 開發工具
- **ESLint 9** - 程式碼品質檢查工具
- **Turbopack** - Next.js 內建的快速打包工具
- **PostCSS** - CSS 後處理器

## 🏃‍♂️ 快速開始

### 環境需求
- Node.js 18+ 
- npm 或 yarn 套件管理器

### 安裝與執行

1. **克隆專案**
```bash
git clone <repository-url>
cd workflow_01
```

2. **安裝依賴**
```bash
npm install
```

3. **啟動開發伺服器**
```bash
npm run dev
```

4. **瀏覽應用程式**
開啟瀏覽器訪問 `http://localhost:3000`

### 可用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動開發伺服器（使用 Turbopack 加速） |
| `npm run build` | 建置生產環境版本 |
| `npm run start` | 啟動生產環境伺服器 |
| `npm run lint` | 執行程式碼品質檢查 |

## 📁 專案結構

```
workflow_01/
├── app/                          # Next.js App Router 主目錄
│   ├── components/               # React 元件目錄
│   │   └── OrgChart/            # 組織架構圖核心模組
│   │       ├── OrgChart.tsx     # 主要元件，整合 ReactFlow 功能
│   │       ├── CustomNode.tsx   # 自訂節點元件，員工資訊展示
│   │       └── useOrgChartStore.ts # Zustand 狀態管理中心
│   ├── globals.css              # 全域樣式定義
│   ├── layout.tsx               # 應用程式根布局
│   └── page.tsx                 # 首頁元件
├── public/                      # 靜態資源目錄
├── package.json                 # 專案配置與依賴管理
├── tsconfig.json               # TypeScript 編譯配置
├── tailwind.config.js          # Tailwind CSS 配置
├── next.config.ts              # Next.js 配置文件
└── README.md                   # 專案說明文件
```

## 🎮 使用指南

### 基本操作
1. **新增員工**：點擊工具列的「新增員工」按鈕
2. **編輯員工**：雙擊任一員工節點進行資料編輯
3. **刪除員工**：選中節點後使用刪除功能
4. **拖拽操作**：拖拽節點可選擇「替換資料」或「交換資料」
5. **自動排版**：使用自動排版功能優化節點配置

### 進階功能
- **主題切換**：支援深淺色主題無縫切換
- **視圖控制**：縮放、適應視窗、格線顯示
- **資料管理**：JSON 格式匯入匯出功能
- **小地圖導航**：大型組織架構的快速導航

## 🏛️ 核心架構設計

### 狀態管理系統
採用 Zustand 實現全域狀態管理，主要包含：
- **節點管理**：員工節點的增刪改查操作
- **關係管理**：員工間層級關係的維護
- **拖拽狀態**：拖拽操作的狀態追蹤與回調管理
- **視圖狀態**：主題、縮放、選中狀態等 UI 狀態

### 自動排版算法
實現智能樹狀布局系統：
- **子樹寬度計算**：預先計算避免節點重疊
- **多根節點支援**：處理複雜組織架構場景
- **居中對齊算法**：父節點自動居中於子節點上方
- **連線最佳化**：使用 smoothstep 類型產生直角轉折效果

### 拖拽互動系統
提供豐富的拖拽操作體驗：
- **操作模式選擇**：支援替換與交換兩種資料操作
- **視覺回饋**：拖拽過程的即時視覺提示
- **狀態管理**：完整的拖拽狀態生命週期管理

## 🔧 開發指南

### 程式碼風格
- 使用 TypeScript 進行類型安全開發
- 遵循 ESLint 程式碼規範
- 採用函數式元件與 React Hooks
- 使用 Tailwind CSS 進行樣式開發

### 狀態管理模式
```typescript
// 使用 Zustand store
const { nodes, edges, addEmployee, updateEmployee } = useOrgChartStore();
```

### 元件開發原則
- 單一職責：每個元件專注特定功能
- 可重用性：設計可重用的通用元件
- 類型安全：完整的 TypeScript 介面定義

## 🚀 部署說明

### 建置專案
```bash
npm run build
```

### 生產環境執行
```bash
npm run start
```

### 環境變數配置
目前專案無需特殊環境變數配置，使用預設 Next.js 設定即可。

## 🤝 貢獻指南

1. Fork 本專案
2. 創建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

### 開發工作流程
1. 修改程式碼後執行 `npm run lint` 檢查程式碼品質
2. 執行 `npm run build` 確認建置無誤
3. 使用 `npm run dev` 進行本地測試
4. 提交前確保所有測試通過

## 📝 版本歷史

- **v0.1.0** - 初始版本
  - 基礎組織架構圖功能
  - 員工資料管理系統
  - 拖拽操作支援
  - 自動排版算法
  - 主題切換功能

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件

## 🙋‍♂️ 支援與回饋

如有任何問題或建議，歡迎透過以下方式聯繫：
- 提交 Issue：專案 GitHub 頁面
- 功能建議：歡迎提出新功能需求

---

**建立時間**: 2025  
**技術支援**: Next.js 15 + React 19 + TypeScript  
**開發團隊**: Claude Code AI Assistant