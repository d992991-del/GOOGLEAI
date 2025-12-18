
import React, { useState } from 'react';
import { Transaction, BankAccount, Category } from '../types';
import { storageService } from '../services/storageService';

interface TransactionsProps {
  userId: string;
  transactions: Transaction[];
  accounts: BankAccount[];
  categories: Category[];
  onUpdate: () => void;
}

const Transactions: React.FC<TransactionsProps> = ({ userId, transactions, accounts, categories, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [formData, setFormData] = useState({
    accountId: accounts[0]?.id || '',
    categoryId: categories[0]?.id || '',
    amount: 0,
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const handleOpenModal = (trans?: Transaction) => {
    if (trans) {
      setEditingTransaction(trans);
      setFormData({
        accountId: trans.accountId,
        categoryId: trans.categoryId,
        amount: trans.amount,
        type: trans.type,
        date: trans.date.split('T')[0],
        note: trans.note
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        accountId: accounts[0]?.id || '',
        categoryId: categories.find(c => c.type === 'EXPENSE')?.id || categories[0]?.id || '',
        amount: 0,
        type: 'EXPENSE',
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transData: Transaction = {
      id: editingTransaction?.id || Date.now().toString(),
      ...formData,
      date: new Date(formData.date).toISOString()
    };
    storageService.saveTransaction(userId, transData);
    onUpdate();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除此筆紀錄嗎？')) {
      storageService.deleteTransaction(userId, id);
      onUpdate();
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">收支紀錄</h1>
          <p className="text-slate-500">追蹤您的每一筆金流支出與收入。</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all font-medium"
        >
          <i className="fas fa-plus"></i>
          記一筆
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">日期</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">分類</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">說明</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">帳戶</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">金額</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTransactions.map((t) => {
                const cat = categories.find(c => c.id === t.categoryId);
                const acc = accounts.find(a => a.id === t.accountId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs" style={{ backgroundColor: `${cat?.color}15`, color: cat?.color }}>
                          <i className={`fas ${cat?.icon}`}></i>
                        </div>
                        <span className="text-sm font-medium text-slate-800">{cat?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 italic">
                      {t.note || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                        {acc?.name}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right text-sm font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-slate-800'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}NT$ {t.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(t)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                    目前沒有任何紀錄。點擊右上角新增第一筆！
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingTransaction ? '編輯紀錄' : '記一筆收支'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData, 
                      type: 'EXPENSE', 
                      categoryId: categories.find(c => c.type === 'EXPENSE')?.id || categories[0]?.id
                    });
                  }}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${formData.type === 'EXPENSE' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500'}`}
                >
                  支出
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData, 
                      type: 'INCOME', 
                      categoryId: categories.find(c => c.type === 'INCOME')?.id || categories[0]?.id
                    });
                  }}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${formData.type === 'INCOME' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'}`}
                >
                  收入
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">日期</label>
                  <input 
                    required
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">金額</label>
                  <input 
                    required
                    type="number" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">分類</label>
                  <select 
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all bg-white"
                  >
                    {categories.filter(c => c.type === formData.type).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">帳戶</label>
                  <select 
                    value={formData.accountId}
                    onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all bg-white"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">說明 (選填)</label>
                <input 
                  type="text" 
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
                  placeholder="輸入消費備註..."
                />
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
                  className={`flex-1 px-4 py-3 rounded-xl text-white font-semibold shadow-lg transition-all ${formData.type === 'INCOME' ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-red-500 hover:bg-red-600 shadow-red-100'}`}
                >
                  儲存紀錄
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
