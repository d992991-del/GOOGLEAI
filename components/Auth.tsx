
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Artificial delay to simulate Firebase
    setTimeout(() => {
      try {
        if (isRegister) {
          const newUser = storageService.register(email, password, name);
          onLogin(newUser);
        } else {
          const user = storageService.login(email, password);
          onLogin(user);
        }
      } catch (err: any) {
        setError(err.message || '發生錯誤');
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 relative z-10 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 mb-4">
            <i className="fas fa-wallet text-white text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">智匯金融</h1>
          <p className="text-slate-500 font-medium">您的個人 AI 理財管家</p>
        </div>

        <div className="flex p-1 bg-slate-50 rounded-2xl mb-8 border border-slate-100">
          <button 
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isRegister ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            登入
          </button>
          <button 
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isRegister ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            註冊
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 px-1">稱呼</label>
              <div className="relative">
                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                  placeholder="您的姓名"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 px-1">電子郵件</label>
            <div className="relative">
              <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 px-1">密碼</label>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isLoading && <i className="fas fa-spinner fa-spin"></i>}
            {isRegister ? '建立帳號' : '進入系統'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-400 text-sm">
            {isRegister ? '已有帳號？' : '還沒有帳號？'}
            <button 
              onClick={() => setIsRegister(!isRegister)} 
              className="text-indigo-600 font-bold ml-1 hover:underline"
            >
              {isRegister ? '立即登入' : '立即註冊'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
