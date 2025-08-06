/**
 * 部門管理工具函數
 * 
 * 提供統一的部門顏色、圖示和視覺化管理功能
 */

import { Department } from './useOrgChartStore';

// 部門顏色配置
export const departmentColors = {
  purple: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-100',
    text: 'text-purple-800',
    textLight: 'text-purple-600',
    border: 'border-purple-500',
    ring: 'ring-purple-500',
    gradient: 'from-purple-500 to-purple-600'
  },
  blue: {
    bg: 'bg-blue-500', 
    bgLight: 'bg-blue-100',
    text: 'text-blue-800',
    textLight: 'text-blue-600',
    border: 'border-blue-500',
    ring: 'ring-blue-500',
    gradient: 'from-blue-500 to-blue-600'
  },
  green: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-100', 
    text: 'text-green-800',
    textLight: 'text-green-600',
    border: 'border-green-500',
    ring: 'ring-green-500',
    gradient: 'from-green-500 to-green-600'
  },
  orange: {
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-100',
    text: 'text-orange-800', 
    textLight: 'text-orange-600',
    border: 'border-orange-500',
    ring: 'ring-orange-500',
    gradient: 'from-orange-500 to-orange-600'
  },
  pink: {
    bg: 'bg-pink-500',
    bgLight: 'bg-pink-100',
    text: 'text-pink-800',
    textLight: 'text-pink-600', 
    border: 'border-pink-500',
    ring: 'ring-pink-500',
    gradient: 'from-pink-500 to-pink-600'
  },
  indigo: {
    bg: 'bg-indigo-500',
    bgLight: 'bg-indigo-100',
    text: 'text-indigo-800',
    textLight: 'text-indigo-600',
    border: 'border-indigo-500',
    ring: 'ring-indigo-500', 
    gradient: 'from-indigo-500 to-indigo-600'
  },
  gray: {
    bg: 'bg-gray-500',
    bgLight: 'bg-gray-100',
    text: 'text-gray-800',
    textLight: 'text-gray-600',
    border: 'border-gray-500',
    ring: 'ring-gray-500',
    gradient: 'from-gray-500 to-gray-600'
  }
} as const;

export type DepartmentColorName = keyof typeof departmentColors;

// 根據部門名稱獲取顏色配置
export const getDepartmentColor = (department: Department | undefined, variant: keyof typeof departmentColors.purple = 'bg') => {
  if (!department || !department.color) {
    return departmentColors.gray[variant];
  }
  
  const colorConfig = departmentColors[department.color as DepartmentColorName];
  return colorConfig ? colorConfig[variant] : departmentColors.gray[variant];
};

// 根據部門名稱獲取顏色點（用於標記）
export const getDepartmentColorDot = (department: Department | undefined) => {
  const colorName = department?.color as DepartmentColorName || 'gray';
  return departmentColors[colorName]?.bg || departmentColors.gray.bg;
};

// 根據部門名稱獲取標籤樣式
export const getDepartmentBadgeClasses = (department: Department | undefined) => {
  const colorName = department?.color as DepartmentColorName || 'gray';
  const colors = departmentColors[colorName];
  return `${colors.bgLight} ${colors.text} px-2 py-1 rounded-full text-xs font-medium`;
};

// 圖示名稱到組件的映射輔助函數
export const getIconName = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    'Crown': 'Crown',
    'Code': 'Code', 
    'DollarSign': 'DollarSign',
    'Users': 'Users',
    'Megaphone': 'Megaphone',
    'Building2': 'Building2',
    'Briefcase': 'Briefcase',
    'Settings': 'Settings',
    'Globe': 'Globe',
    'Palette': 'Palette'
  };
  
  return iconMap[iconName] || 'Building2';
};

// 預設部門圖示顏色配置（用於節點顯示）
export const getDepartmentNodeColor = (departmentName: string) => {
  // 根據部門名稱返回對應的梯度色彩（用於節點背景）
  const departmentColorMap: Record<string, string> = {
    '執行長室': 'from-purple-500 to-pink-500',
    '技術部': 'from-blue-500 to-cyan-500', 
    '財務部': 'from-green-500 to-emerald-500',
    '人資部': 'from-orange-500 to-yellow-500',
    '行銷部': 'from-pink-500 to-rose-500',
  };
  
  return departmentColorMap[departmentName] || 'from-gray-500 to-gray-600';
};

// 根據部門獲取統計顏色
export const getDepartmentStatsColor = (department: Department | undefined) => {
  const colorName = department?.color as DepartmentColorName || 'gray';
  const colors = departmentColors[colorName];
  return {
    bg: colors.bgLight,
    text: colors.text,
    border: colors.border
  };
};