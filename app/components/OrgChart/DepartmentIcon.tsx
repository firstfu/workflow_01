/**
 * 動態部門圖示元件
 * 
 * 根據部門資料動態渲染對應的 Lucide 圖示
 */

"use client";

import React from 'react';
import { 
  Crown, 
  Code, 
  DollarSign, 
  Users, 
  Megaphone,
  Building2,
  Briefcase,
  Settings,
  Globe,
  Palette,
  LucideProps
} from 'lucide-react';

// 圖示映射
const iconMap = {
  Crown,
  Code,
  DollarSign,
  Users,
  Megaphone,
  Building2,
  Briefcase,
  Settings,
  Globe,
  Palette,
} as const;

interface DepartmentIconProps extends Omit<LucideProps, 'size'> {
  iconName?: string;
  size?: number;
}

const DepartmentIcon: React.FC<DepartmentIconProps> = ({ 
  iconName = 'Building2', 
  size = 16, 
  className = '',
  ...props 
}) => {
  // 獲取對應的圖示組件
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || Building2;
  
  return (
    <IconComponent 
      size={size}
      className={className}
      {...props}
    />
  );
};

export default DepartmentIcon;