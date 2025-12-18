
import React, { useState, useMemo } from 'react';
import { Category, Transaction, Budget } from '../types';
import { storageService } from '../services/storageService';

interface BudgetsProps {
  userId: string;
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  onUpdate: () => void;
}

const Budgets: React.FC<BudgetsProps> = ({ userId, transactions, categories, budgets, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [amount, setAmount] = useState<number>(0);

  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [transactions]);

  const budgetItems = useMemo(() => {
    return budgets.map(b => {
      const category = categories.find(c => c.id === b.categoryId);
      const spent = currentMonthTransactions
        .filter(t => t.categoryId === b.categoryId && t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const percent = b.amount > 0 ? (spent / b.amount) * 100 : 0;
      
      return {
        ...b,
        category,
        spent,
        percent,
        remaining: b.amount - spent
      };
    });
  }, [budgets, categories, currentMonthTransactions]);

  const handleOpenModal = (budgetItem?: any) => {
    if (budgetItem) {
      setSelectedCategoryId(budgetItem.categoryId);
      setAmount(budgetItem.amount);
    } else {
      setSelectedCategoryId(categories.find(c => c.type === 'EXPENSE')?.id || '');
      setAmount(0);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existingIndex = budgets.findIndex(b => b.categoryId === selectedCategoryId);
    let newBudgets = [...budgets];
    
    if (existingIndex > -1) {
      newBudgets[existingIndex] = { categoryId: selectedCategoryId, amount };
    } else {
      newBudgets.push({ categoryId: selectedCategoryId, amount });
    }
    
    storageService.saveBudgets(userId, newBudgets);
    onUpdate();
    setIsModalOpen(false);
  };

  const handleDelete = (catId: string) => {
    if (window.confirm('確定要移除此預算規劃嗎？')) {
      const newBudgets = budgets.filter(b => b.categoryId !== catId);
      storageService.saveBudgets(userId, newBudgets);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">預算規劃</h1>
          <p className="text-slate-500">設定每月預算上限，讓每一分錢都花在刀口上。</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all font-medium"
        >
          <i className="fas fa-plus"></i>
          設定預算
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgetItems.map((item) => (
          <div key={item.categoryId} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.category?.color}15`, color: item.category?.color }}>
                  <i className={`fas ${item.category?.icon} text-lg`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{item.category?.name}</h3>
                  <p className="text-xs text-slate-500">每月預算 NT$ {item.amount.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                  <i className="fas fa-edit"></i>
                </button>
                <button onClick={() => handleDelete(item.categoryId)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">當月支出</span>
                <span className="font-bold text-slate-800">NT$ {item.spent.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    item.percent > 90 ? 'bg-red-500' : item.percent > 70 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(item.percent, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className={`font-semibold ${item.remaining < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                  {item.remaining < 0 ? `超支 NT$ ${Math.abs(item.remaining).toLocaleString()}` : `剩餘 NT$ ${item.remaining.toLocaleString()}`}
                </span>
                <span className="text-slate-400">{Math.round(item.percent)}%</span>
              </div>
            </div>
          </div>
        ))}

        {budgetItems.length === 0 && (
          <div className="md:col-span-2 py-20 bg-white border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
            <i className="fas fa-bullseye text-4xl mb-4 opacity-20"></i>
            <p>目前尚未設定任何類別預算</p>
            <button onClick={() => handleOpenModal()} className="mt-4 text-indigo-600 font-bold hover:underline">
              立即開始規劃
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">設定預算</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">支出類別</label>
                <select 
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all bg-white"
                >
                  {categories.filter(c => c.type === 'EXPENSE').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">每月預算金額</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">NT$</span>
                    <input 
                    required
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-14 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
                    placeholder="例如：5000"
                    />
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
                  儲存預算
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
