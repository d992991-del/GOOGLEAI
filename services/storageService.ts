
// Fixed Firebase Auth imports to ensure all modular members are correctly recognized by ensuring clean named imports
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  deleteDoc
} from 'firebase/firestore';
import { auth, db, isFirebaseEnabled } from './firebase';
import { User, BankAccount, Transaction, Category, Budget } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

// Local Storage Fallback Keys
const LS_KEYS = { CURRENT_USER: 'fin_current_user_demo' };

export const storageService = {
  // Auth
  register: async (email: string, password: string, name: string): Promise<User> => {
    if (isFirebaseEnabled && auth && db) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user: User = { id: userCredential.user.uid, email, name };
      await setDoc(doc(db, 'users', user.id), user);
      return user;
    } else {
      // 離線模式模擬
      const user = { id: 'demo-' + Date.now(), email, name };
      localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    if (isFirebaseEnabled && auth && db) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) throw new Error("使用者資料不存在。");
      return userDoc.data() as User;
    } else {
      // 離線演示登入 (密碼固定為 test123456)
      if (email === 'demo@example.com' && password === 'test123456') {
        const user = { id: 'demo-user', email, name: '演示使用者' };
        localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(user));
        return user;
      }
      throw new Error("離線模式僅支援 demo@example.com / test123456");
    }
  },

  logout: async () => {
    if (isFirebaseEnabled && auth) await signOut(auth);
    localStorage.removeItem(LS_KEYS.CURRENT_USER);
  },

  getCurrentUser: (): Promise<User | null> => {
    return new Promise((resolve) => {
      if (isFirebaseEnabled && auth && db) {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          unsubscribe();
          if (fbUser) {
            const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
            resolve(userDoc.exists() ? (userDoc.data() as User) : null);
          } else {
            resolve(null);
          }
        });
      } else {
        const userJson = localStorage.getItem(LS_KEYS.CURRENT_USER);
        resolve(userJson ? JSON.parse(userJson) : null);
      }
    });
  },

  // Bank Accounts
  // Fix: Regular function used to bind 'this' correctly to storageService
  async getAccounts(userId: string): Promise<BankAccount[]> {
    if (isFirebaseEnabled && db) {
      const q = query(collection(db, 'accounts'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const accounts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as BankAccount));
      if (accounts.length === 0) return this.initDefaultData(userId);
      return accounts;
    }
    return []; // 演示模式簡化處理
  },

  async initDefaultData(userId: string) {
    if (!db) return [];
    const defaults = [
      { name: '中信儲蓄帳戶', balance: 125000, type: '儲蓄帳戶', color: '#3B82F6', userId },
      { name: '台新 Richart', balance: 45000, type: '薪資帳戶', color: '#EF4444', userId },
    ];
    const created: BankAccount[] = [];
    for (const acc of defaults) {
      const ref = doc(collection(db, 'accounts'));
      const newAcc = { ...acc, id: ref.id };
      await setDoc(ref, newAcc);
      created.push(newAcc);
    }
    return created;
  },

  saveAccount: async (userId: string, account: BankAccount) => {
    if (isFirebaseEnabled && db) {
      await setDoc(doc(db, 'accounts', account.id), { ...account, userId }, { merge: true });
    }
  },

  deleteAccount: async (userId: string, accountId: string) => {
    if (isFirebaseEnabled && db) await deleteDoc(doc(db, 'accounts', accountId));
  },

  getTransactions: async (userId: string): Promise<Transaction[]> => {
    if (isFirebaseEnabled && db) {
      const q = query(collection(db, 'transactions'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
    }
    return [];
  },

  saveTransaction: async (userId: string, transaction: Transaction) => {
    if (isFirebaseEnabled && db) {
      await setDoc(doc(db, 'transactions', transaction.id), { ...transaction, userId }, { merge: true });
    }
  },

  deleteTransaction: async (userId: string, transactionId: string) => {
    if (isFirebaseEnabled && db) await deleteDoc(doc(db, 'transactions', transactionId));
  },

  getCategories: async (userId: string): Promise<Category[]> => DEFAULT_CATEGORIES,

  getBudgets: async (userId: string): Promise<Budget[]> => {
    if (isFirebaseEnabled && db) {
      const budgetDoc = await getDoc(doc(db, 'userBudgets', userId));
      return budgetDoc.exists() ? (budgetDoc.data() as any).budgets : [];
    }
    return [];
  },

  saveBudgets: async (userId: string, budgets: Budget[]) => {
    if (isFirebaseEnabled && db) await setDoc(doc(db, 'userBudgets', userId), { budgets, userId });
  }
};
