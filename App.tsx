
import React, { useState, useEffect, useCallback } from 'react';
import { User, BankAccount, Transaction, Category, Budget } from './types';
import { storageService } from './services/storageService';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Accounts from './components/Accounts';
import Transactions from './components/Transactions';
import Sidebar from './components/Sidebar';
import Reports from './components/Reports';
import Budgets from './components/Budgets';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'accounts' | 'transactions' | 'reports' | 'budgets'>('dashboard');
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async (userId: string) => {
    try {
      const [accs, trans, cats, buds] = await Promise.all([
        storageService.getAccounts(userId),
        storageService.getTransactions(userId),
        storageService.getCategories(userId),
        storageService.getBudgets(userId)
      ]);
      setAccounts(accs);
      setTransactions(trans);
      setCategories(cats);
      setBudgets(buds);
    } catch (e) {
      console.error("載入數據失敗", e);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const currentUser = await storageService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser.id);
      }
      setIsLoading(false);
    };
    init();
  }, [loadUserData]);

  const handleLogin = async (u: User) => {
    setUser(u);
    await loadUserData(u.id);
  };

  const handleLogout = async () => {
    await storageService.logout();
    setUser(null);
    setView('dashboard');
  };

  const refreshData = () => {
    if (user) loadUserData(user.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeView={view} setView={setView} onLogout={handleLogout} userName={user.name} />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          {view === 'dashboard' && <Dashboard user={user} accounts={accounts} transactions={transactions} categories={categories} budgets={budgets} />}
          {view === 'accounts' && <Accounts userId={user.id} accounts={accounts} onUpdate={refreshData} />}
          {view === 'transactions' && <Transactions userId={user.id} transactions={transactions} accounts={accounts} categories={categories} onUpdate={refreshData} />}
          {view === 'budgets' && <Budgets userId={user.id} transactions={transactions} categories={categories} budgets={budgets} onUpdate={refreshData} />}
          {view === 'reports' && <Reports transactions={transactions} categories={categories} accounts={accounts} />}
        </div>
      </main>
    </div>
  );
};

export default App;
