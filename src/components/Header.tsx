import React from 'react';
import { Bell, Plane, User, Clock, BriefcaseBusiness } from 'lucide-react';

interface HeaderProps {
  onToggleTaskCenter: () => void;
  onToggleToolbox: () => void;
  hasTasks: boolean;
  toolboxOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleTaskCenter, onToggleToolbox, hasTasks, toolboxOpen }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white h-14 flex items-center px-6 justify-between">
      <div className="flex items-center gap-8">
        <div className="text-2xl font-bold tracking-tight">CSTI</div>
        <nav className="flex gap-6">
          <a href="#" className="text-white/90 hover:text-white transition-colors">数据概览</a>
          <a href="#" className="text-white/90 hover:text-white transition-colors">数据汇聚</a>
          <a href="#" className="text-white font-medium">数据管理</a>
          <a href="#" className="text-white/90 hover:text-white transition-colors">资产目录</a>
          <a href="#" className="text-white/90 hover:text-white transition-colors">系统管理</a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-sm">
          系统租户
        </button>
        <Plane size={20} />
        <Bell size={20} />
        
        {/* 任务管理中心按钮 */}
        <button
          onClick={onToggleTaskCenter}
          className={`relative p-2 rounded hover:bg-white/20 transition-colors ${hasTasks ? 'bg-white/10' : ''}`}
          title="任务管理中心"
        >
          <Clock size={20} />
          {hasTasks && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              ●
            </span>
          )}
        </button>
        
        {/* 工具箱按钮 */}
        <button
          onClick={onToggleToolbox}
          className={`relative p-2 rounded hover:bg-white/20 transition-colors ${toolboxOpen ? 'bg-white/10' : ''}`}
          title="工具箱"
        >
          <BriefcaseBusiness size={20} />
        </button>
        
        <User size={20} />
      </div>
    </header>
  );
};

export default Header;
