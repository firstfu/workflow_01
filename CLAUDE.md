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

這是一個使用 Next.js 15.4.5 與 App Router 的專案，使用 TypeScript、React 19 和 Tailwind CSS v4。

### 主要結構
- `app/` - Next.js App Router 目錄
  - `layout.tsx` - 根佈局，包含字體設定 (Geist 字體) 和全域樣式
  - `page.tsx` - 首頁元件
  - `globals.css` - 全域 CSS 樣式
- TypeScript 設定使用 `@/*` 路徑別名對應到專案根目錄

### 技術配置
- 使用 ESLint 9 與 Next.js 推薦配置
- PostCSS 處理 Tailwind CSS
- TypeScript strict mode 啟用