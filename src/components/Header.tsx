import React from 'react';
import { Bell, Plane, User } from 'lucide-react';

const Header: React.FC = () => {
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
        <User size={20} />
      </div>
    </header>
  );
};

export default Header;