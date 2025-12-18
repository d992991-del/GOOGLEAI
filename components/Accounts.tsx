
import React, { useState } from 'react';
import { BankAccount } from '../types';
import { storageService } from '../services/storageService';
import { ACCOUNT_COLORS } from '../constants';

interface AccountsProps {
  userId: string;
  accounts: BankAccount[];
  onUpdate: () => void;
}

const Accounts: React.FC<AccountsProps> = ({ userId, accounts, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '儲蓄帳戶',
    balance: 0,
    color: ACCOUNT_COLORS[0]
  });

  const handleOpenModal = (account?: BankAccount) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance,
        color: account.color
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: '',
        type: '儲蓄帳戶',
        balance: 0,
        color: ACCOUNT_COLORS[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const accountData: BankAccount = {
      id: editingAccount?.id || Date.now().toString(),
      ...formData
    };
    storageService.saveAccount(userId, accountData);
    onUpdate();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除此帳戶嗎？這將無法復原。')) {
      storageService.deleteAccount(userId, id);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">帳戶管理</h1>
          <p className="text-slate-500">管理您的銀行帳號、信用卡與現金資產。</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all font-medium"
        >
          <i className="fas fa-plus"></i>
          新增帳戶
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group">
            <div className="h-2" style={{ backgroundColor: acc.color }}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{acc.type}</span>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">{acc.name}</h3>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(acc)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => handleDelete(acc.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-slate-500 text-sm">當前餘額</p>
                <p className="text-2xl font-bold text-slate-900">NT$ {acc.balance.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingAccount ? '編輯帳戶' : '新增帳戶'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">帳戶名稱</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  placeholder="例如：台新銀行 Richart"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">帳戶類型</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all bg-white"
                  >
                    <option>儲蓄帳戶</option>
                    <option>薪資帳戶</option>
                    <option>信用卡</option>
                    <option>現金</option>
                    <option>投資帳戶</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">初始餘額</label>
                  <input 
                    required
                    type="number" 
                    value={formData.balance}
                    onChange={(e) => setFormData({...formData, balance: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">代表色</label>
                <div className="flex gap-3">
                  {ACCOUNT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({...formData, color: c})}
                      className={`w-8 h-8 rounded-full border-2 ${formData.color === c ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  儲存帳戶
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
