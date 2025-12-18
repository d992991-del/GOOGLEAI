
import React, { useState } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent, demoEmail?: string) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (demoEmail) {
        const user = await storageService.login(demoEmail, 'test123456');
        onLogin(user);
        return;
      }

      if (isRegister) {
        const newUser = await storageService.register(email, password, name);
        onLogin(newUser);
      } else {
        const user = await storageService.login(email, password);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || '發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full filter blur-3xl opacity-30"></div>
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 relative z-10 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl mb-4">
            <i className="fas fa-wallet text-white text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">智匯金融</h1>
          <p className="text-slate-500">個人 AI 理財管家</p>
        </div>

        <div className="flex p-1 bg-slate-50 rounded-2xl mb-8 border border-slate-100">
          <button onClick={() => setIsRegister(false)} className={`flex-1 py-3 text-sm font-bold rounded-xl ${!isRegister ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>登入</button>
          <button onClick={() => setIsRegister(true)} className={`flex-1 py-3 text-sm font-bold rounded-xl ${isRegister ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>註冊</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="您的姓名" />
          )}
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="電子郵件" />
          <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all" placeholder="密碼" />

          {error && <div className="text-red-500 text-sm px-4">{error}</div>}

          <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg transition-all">
            {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
            {isRegister ? '建立帳號' : '登入系統'}
          </button>
          
          {!isRegister && (
            <button type="button" onClick={() => handleSubmit(undefined, 'demo@example.com')} className="w-full border-2 border-indigo-50 text-indigo-600 font-bold py-3 rounded-2xl hover:bg-indigo-50 transition-all">
              使用測試帳號登入 (Demo)
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Auth;
