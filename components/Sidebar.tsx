
import React, { useState } from 'react';

interface SidebarProps {
  activeView: string;
  setView: (view: any) => void;
  onLogout: () => void;
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setView, onLogout, userName }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: '總覽面板', icon: 'fa-chart-pie' },
    { id: 'accounts', label: '帳戶管理', icon: 'fa-university' },
    { id: 'transactions', label: '收支紀錄', icon: 'fa-exchange-alt' },
    { id: 'budgets', label: '預算規劃', icon: 'fa-bullseye' },
    { id: 'reports', label: '分析報表', icon: 'fa-file-invoice-dollar' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-wallet text-white"></i>
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">智匯金融</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
        </button>
      </div>

      {/* Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          {/* Logo Section */}
          <div className="hidden lg:flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <i className="fas fa-wallet text-white text-lg"></i>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-slate-900 leading-none">智匯金融</span>
              <span className="text-xs text-slate-500 font-medium">Smart Finance</span>
            </div>
          </div>

          {/* User Profile */}
          <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                {userName.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800 truncate">{userName}</span>
                <span className="text-xs text-slate-500">個人帳戶</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeView === item.id 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <i className={`fas ${item.icon} w-5 text-center`}></i>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-slate-100 space-y-2">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <i className="fas fa-sign-out-alt w-5 text-center"></i>
              登出系統
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
