import React from 'react';
import { Bell, Plane, User } from 'lucide-react';

interface HeaderProps {
  activeNav?: string;
  onNavChange?: (nav: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeNav = '数据管理', onNavChange }) => {
  const navItems = [
    '数据概览',
    '数据汇聚',
    '数据管理',
    '数据建模',
    '数据治理',
    '数据计算',
    '知识图谱',
    '资产目录',
    '模型计算',
    '数据质量',
    '数据安全',
    '系统管理'
  ];

  const handleNavClick = (item: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!enabledNavItems.includes(item)) return;
    if (onNavChange) {
      onNavChange(item);
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white h-14 flex items-center px-6 justify-between">
      <div className="flex items-center gap-8">
        <div className="text-2xl font-bold tracking-tight">CSTI</div>
        <nav className="flex gap-1">
          {navItems.map((item) => {
            const displayName = item === '模型计算' ? '样本标注' : item;
            const isEnabled = enabledNavItems.includes(item);
            const isActive = activeNav === item;
            return (
              <a
                key={item}
                href="#"
                onClick={(e) => handleNavClick(item, e)}
                className={`px-3 py-2 rounded transition-colors text-sm ${
                  isActive
                    ? 'bg-white/20 text-white font-medium'
                    : isEnabled
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-white/50 cursor-not-allowed'
                }`}
              >
                {displayName}
              </a>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-sm">
          系统租户
        </button>
        <Plane size={20} />
        <Bell size={20} />
        <User size={20} />
      </div>
    </header>
  );
};

export default Header;