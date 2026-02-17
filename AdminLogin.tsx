
import React, { useState } from 'react';

interface AdminLoginProps {
  onSuccess: () => void;
  onClose: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // البيانات المعتمدة: omar omar / seidi 557
    if (cleanUsername === 'omar omar' && cleanPassword === 'seidi 557') {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-3xl p-8 border border-gray-100 animate-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-user-lock text-2xl"></i>
          </div>
          <h2 className="text-xl font-black text-gray-900">تسجيل دخول المدير</h2>
          <p className="text-xs text-gray-400 font-bold mt-1">يرجى إدخال البيانات المعتمدة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">اسم المستخدم</label>
            <input 
              type="text" 
              className={`w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-amber-600 font-bold transition-all ${error ? 'ring-2 ring-red-500' : ''}`}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="omar omar"
              required
              autoComplete="off"
              name="admin-user"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">كلمة السر</label>
            <input 
              type="password" 
              className={`w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-amber-600 font-bold transition-all ${error ? 'ring-2 ring-red-500' : ''}`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="off"
              name="admin-pass"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-[10px] font-black text-center flex items-center justify-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              بيانات الدخول غير صحيحة!
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-black active:scale-95 transition-all mt-4"
          >
            تأكيد الدخول
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
