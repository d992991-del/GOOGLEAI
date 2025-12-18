
import React, { useMemo } from 'react';
import { User, BankAccount, Transaction, Category, Budget } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  user: User;
  accounts: BankAccount[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, accounts, transactions, categories, budgets }) => {
  const summary = useMemo(() => {
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    
    // Last 30 days logic
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTrans = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
    const income = recentTrans.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const expense = recentTrans.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    
    return { totalBalance, income, expense };
  }, [accounts, transactions]);

  const categoryData = useMemo(() => {
    const data: any[] = [];
    categories.forEach(cat => {
      if (cat.type === 'EXPENSE') {
        const amount = transactions
          .filter(t => t.categoryId === cat.id)
          .reduce((sum, t) => sum + t.amount, 0);
        if (amount > 0) {
          data.push({ name: cat.name, value: amount, color: cat.color });
        }
      }
    });
    return data.sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const budgetSummary = useMemo(() => {
    const now = new Date();
    const currentMonthTrans = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    let totalBudgeted = 0;
    let totalSpentInBudgets = 0;

    budgets.forEach(b => {
      const spent = currentMonthTrans
        .filter(t => t.categoryId === b.categoryId && t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);
      totalBudgeted += b.amount;
      totalSpentInBudgets += spent;
    });

    return { 
      totalBudgeted, 
      totalSpentInBudgets, 
      percent: totalBudgeted > 0 ? (totalSpentInBudgets / totalBudgeted) * 100 : 0 
    };
  }, [budgets, transactions]);

  const recentActivity = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">歡迎回來, {user.name}!</h1>
          <p className="text-slate-500">以下是您的最新財務狀況概覽。</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <i className="fas fa-calendar-day text-indigo-600"></i>
          <span className="font-medium text-slate-700">{new Date().toLocaleDateString('zh-TW')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <i className="fas fa-vault text-6xl text-indigo-600"></i>
          </div>
          <p className="text-slate-500 font-medium mb-1">總淨資產</p>
          <h2 className="text-3xl font-bold text-slate-900">NT$ {summary.totalBalance.toLocaleString()}</h2>
          <div className="mt-4 flex items-center gap-2 text-green-600 text-sm font-semibold">
            <i className="fas fa-arrow-up"></i>
            <span>比上週成長 2.4%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 font-medium mb-1">本月總收入</p>
          <h2 className="text-3xl font-bold text-green-600">NT$ {summary.income.toLocaleString()}</h2>
          <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-full"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 font-medium mb-1">本月總支出</p>
          <h2 className="text-3xl font-bold text-red-500">NT$ {summary.expense.toLocaleString()}</h2>
          <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 w-[65%]"></div>
          </div>
        </div>
      </div>

      {/* Budget Summary Section */}
      {budgets.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-bullseye text-indigo-600"></i>
              本月預算狀態
            </h3>
            <span className="text-sm font-semibold text-slate-500">
              已使用 {Math.round(budgetSummary.percent)}%
            </span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ${
                budgetSummary.percent > 90 ? 'bg-red-500' : budgetSummary.percent > 70 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(budgetSummary.percent, 100)}%` }}
            ></div>
          </div>
          <div className="mt-3 flex justify-between text-xs font-medium text-slate-400">
            <span>NT$ {budgetSummary.totalSpentInBudgets.toLocaleString()} 已支出</span>
            <span>總預算 NT$ {budgetSummary.totalBudgeted.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-pie text-indigo-600"></i>
            支出分類比
          </h3>
          <div className="h-64">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`NT$ ${value.toLocaleString()}`, '金額']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                尚未有支出紀錄
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {categoryData.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-slate-600 truncate">{item.name}</span>
                <span className="text-xs font-bold text-slate-800 ml-auto">NT$ {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-history text-indigo-600"></i>
            最近活動
          </h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((t) => {
              const cat = categories.find(c => c.id === t.categoryId);
              return (
                <div key={t.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center`} style={{ backgroundColor: `${cat?.color}15`, color: cat?.color }}>
                    <i className={`fas ${cat?.icon}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{t.note || cat?.name}</p>
                    <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-slate-800'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString()}
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-10 text-slate-400">暫無活動紀錄</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
