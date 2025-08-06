/**
 * 員工詳細資料模態窗口
 * 
 * 顯示員工的完整詳細資訊，包括基本資料、技能、經驗等
 */

"use client";

import React from 'react';
import { Employee } from './useOrgChartStore';
import useOrgChartStore from './useOrgChartStore';
import DepartmentIcon from './DepartmentIcon';
import { getDepartmentColor, getDepartmentBadgeClasses, getDepartmentColorDot } from './departmentUtils';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  Briefcase,
  Star,
  Edit,
  Building2
} from 'lucide-react';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onEdit?: (employee: Employee) => void;
}

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ 
  isOpen, 
  employee, 
  onClose, 
  onEdit 
}) => {
  const { getDepartmentByName, theme } = useOrgChartStore();

  if (!isOpen || !employee) return null;

  const department = getDepartmentByName(employee.department);

  // 根據層級返回頭銜顏色
  const getLevelColor = (level: number) => {
    const levelColors = {
      1: "from-purple-500 to-pink-500",
      2: "from-blue-500 to-cyan-500", 
      3: "from-green-500 to-emerald-500",
      4: "from-orange-500 to-yellow-500",
    };
    return levelColors[level as keyof typeof levelColors] || "from-gray-500 to-gray-600";
  };

  const themeClasses = {
    modal: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: theme === 'dark' ? 'text-gray-200' : 'text-gray-800',
    textSecondary: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    section: theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50',
    skillTag: theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${themeClasses.modal} rounded-lg shadow-xl border max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
        {/* 標題欄 */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} gap-4`}>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* 頭像 */}
            <div className={`w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br ${getLevelColor(employee.level)} flex items-center justify-center text-white font-bold text-lg sm:text-2xl shadow-lg flex-shrink-0`}>
              {employee.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={employee.avatar} alt={employee.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                employee.name.charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h2 className={`text-lg sm:text-2xl font-bold ${themeClasses.text} truncate`}>{employee.name}</h2>
              <p className={`text-base sm:text-lg ${themeClasses.textSecondary} truncate`}>{employee.position}</p>
              
              {/* 部門標籤 */}
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-3 h-3 rounded-full ${getDepartmentColorDot(department)} flex-shrink-0`}></div>
                <DepartmentIcon iconName={department?.icon} size={14} className={`${themeClasses.textSecondary} flex-shrink-0`} />
                <span className={`${getDepartmentBadgeClasses(department)} text-xs sm:text-sm truncate`}>
                  {employee.department}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(employee)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
                title="編輯員工"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* 內容區域 */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* 基本資訊 */}
            <div className={`${themeClasses.section} rounded-lg p-4 h-fit`}>
              <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4 flex items-center gap-2`}>
                <User className="w-5 h-5" />
                基本資訊
              </h3>
              
              <div className="space-y-3">
                {employee.email && (
                  <div className="flex items-center gap-3">
                    <Mail className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                    <div>
                      <span className={`text-sm ${themeClasses.textSecondary}`}>電子郵件</span>
                      <p className={themeClasses.text}>{employee.email}</p>
                    </div>
                  </div>
                )}
                
                {employee.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                    <div>
                      <span className={`text-sm ${themeClasses.textSecondary}`}>電話</span>
                      <p className={themeClasses.text}>{employee.phone}</p>
                    </div>
                  </div>
                )}
                
                {employee.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                    <div>
                      <span className={`text-sm ${themeClasses.textSecondary}`}>辦公地點</span>
                      <p className={themeClasses.text}>{employee.location}</p>
                    </div>
                  </div>
                )}
                
                {employee.hireDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                    <div>
                      <span className={`text-sm ${themeClasses.textSecondary}`}>到職日期</span>
                      <p className={themeClasses.text}>{employee.hireDate}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Briefcase className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                  <div>
                    <span className={`text-sm ${themeClasses.textSecondary}`}>職級</span>
                    <p className={themeClasses.text}>Level {employee.level}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 技能與專長 */}
            {employee.skills && employee.skills.length > 0 && (
              <div className={`${themeClasses.section} rounded-lg p-4 h-fit`}>
                <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4 flex items-center gap-2`}>
                  <Star className="w-5 h-5" />
                  技能與專長
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((skill, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${themeClasses.skillTag}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 個人簡介 */}
          {employee.bio && (
            <div className={`${themeClasses.section} rounded-lg p-4 mt-4 sm:mt-6 xl:col-span-2`}>
              <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4 flex items-center gap-2`}>
                <Building2 className="w-5 h-5" />
                個人簡介
              </h3>
              <p className={`${themeClasses.text} leading-relaxed`}>
                {employee.bio}
              </p>
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className={`flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          {onEdit && (
            <button
              onClick={() => onEdit(employee)}
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              編輯資料
            </button>
          )}
          <button
            onClick={onClose}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;