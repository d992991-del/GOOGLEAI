
import { User, BankAccount, Transaction, Category, Budget } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

const STORAGE_KEYS = {
  USERS: 'fin_users',
  CURRENT_USER: 'fin_current_user',
  ACCOUNTS: 'fin_accounts_',
  TRANSACTIONS: 'fin_transactions_',
  CATEGORIES: 'fin_categories_',
  BUDGETS: 'fin_budgets_',
};

export const storageService = {
  // Auth simulation
  register: (email: string, password: string, name: string): User => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    if (users.find((u: any) => u.email === email)) {
      throw new Error('此電子郵件已註冊');
    }
    const newUser: User = { id: Date.now().toString(), email, name };
    users.push({ ...newUser, password });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  login: (email: string, password: string): User => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      throw new Error('電子郵件或密碼錯誤');
    }
    const { password: _, ...userData } = user;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
    return userData;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
  },

  // Bank Accounts
  getAccounts: (userId: string): BankAccount[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS + userId);
    if (!data) {
      const defaultAccounts: BankAccount[] = [
        { id: 'acc1', name: '台新 Richart', balance: 50000, type: '儲蓄帳戶', color: '#3B82F6' },
        { id: 'acc2', name: '現金', balance: 3500, type: '現金', color: '#10B981' },
      ];
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS + userId, JSON.stringify(defaultAccounts));
      return defaultAccounts;
    }
    return JSON.parse(data);
  },

  saveAccount: (userId: string, account: BankAccount) => {
    const accounts = storageService.getAccounts(userId);
    const index = accounts.findIndex(a => a.id === account.id);
    if (index > -1) {
      accounts[index] = account;
    } else {
      accounts.push(account);
    }
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS + userId, JSON.stringify(accounts));
  },

  deleteAccount: (userId: string, accountId: string) => {
    let accounts = storageService.getAccounts(userId);
    accounts = accounts.filter(a => a.id !== accountId);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS + userId, JSON.stringify(accounts));
  },

  // Transactions
  getTransactions: (userId: string): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS + userId);
    if (!data) {
      const now = new Date();
      const defaultTransactions: Transaction[] = [
        { id: 't1', accountId: 'acc1', categoryId: 'cat7', amount: 45000, type: 'INCOME', date: now.toISOString(), note: '本月薪資' },
        { id: 't2', accountId: 'acc2', categoryId: 'cat1', amount: 150, type: 'EXPENSE', date: now.toISOString(), note: '午餐便當' },
        { id: 't3', accountId: 'acc1', categoryId: 'cat5', amount: 12000, type: 'EXPENSE', date: now.toISOString(), note: '房租' },
      ];
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS + userId, JSON.stringify(defaultTransactions));
      return defaultTransactions;
    }
    return JSON.parse(data);
  },

  saveTransaction: (userId: string, transaction: Transaction) => {
    const transactions = storageService.getTransactions(userId);
    const index = transactions.findIndex(t => t.id === transaction.id);
    if (index > -1) {
      transactions[index] = transaction;
    } else {
      transactions.push(transaction);
    }
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS + userId, JSON.stringify(transactions));
  },

  deleteTransaction: (userId: string, transactionId: string) => {
    let transactions = storageService.getTransactions(userId);
    transactions = transactions.filter(t => t.id !== transactionId);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS + userId, JSON.stringify(transactions));
  },

  // Categories
  getCategories: (userId: string): Category[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES + userId);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  },

  // Budgets
  getBudgets: (userId: string): Budget[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS + userId);
    if (!data) {
        const defaultBudgets: Budget[] = [
            { categoryId: 'cat1', amount: 8000 },
            { categoryId: 'cat2', amount: 3000 },
        ];
        localStorage.setItem(STORAGE_KEYS.BUDGETS + userId, JSON.stringify(defaultBudgets));
        return defaultBudgets;
    }
    return JSON.parse(data);
  },

  saveBudgets: (userId: string, budgets: Budget[]) => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS + userId, JSON.stringify(budgets));
  }
};
