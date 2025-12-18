
import React, { useState, useEffect } from 'react';
import { Transaction, Category, BankAccount } from '../types';
import { geminiService } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportsProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: BankAccount[];
}

const Reports: React.FC<ReportsProps> = ({ transactions, categories, accounts }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const monthlyData = [
    { name: '餐飲', amount: 1200, type: 'EXPENSE' },
    { name: '交通', amount: 800, type: 'EXPENSE' },
    { name: '薪資', amount: 5000, type: 'INCOME' },
  ]; // Mock data structure

  const getMonthlyStats = () => {
    const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const data = months.map((month, idx) => {
      const monthTrans = transactions.filter(t => new Date(t.date).getMonth() === idx);
      const income = monthTrans.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTrans.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
      return { name: month, 收入: income, 支出: expense };
    });
    return data;
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await geminiService.analyzeFinancialHealth(transactions, categories, accounts);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8 pt-16 lg:pt-0 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">分析報表</h1>
          <p className="text-slate-500">深入了解您的消費習慣，獲取 AI 智慧建議。</p>
        </div>
        <button 
          onClick={handleAIAnalysis}
          disabled={isAnalyzing}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all font-bold"
        >
          {isAnalyzing ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-magic"></i>
          )}
          {isAnalyzing ? '分析中...' : '生成 AI 財務建議'}
        </button>
      </div>

      {/* AI Insight Box */}
      {aiAnalysis && (
        <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5">
            <i className="fas fa-robot text-[200px] text-indigo-600"></i>
          </div>
          <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <i className="fas fa-brain"></i>
            Gemini AI 財務建議
          </h3>
          <div className="prose prose-indigo max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
            {aiAnalysis}
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
          <i className="fas fa-chart-bar text-indigo-600"></i>
          年度收支趨勢
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getMonthlyStats()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => `NT$${val/1000}k`} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{paddingBottom: '20px'}} />
              <Bar dataKey="收入" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="支出" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Analysis Tables or additional charts can go here */}
    </div>
  );
};

export default Reports;
