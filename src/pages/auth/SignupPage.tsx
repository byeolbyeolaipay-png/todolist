import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthProvider';
import { migrateGuestData } from '@/lib/sync/migrateGuestData';
import db from '@/lib/db/dexie';
import { supabase } from '@/lib/db/supabase';

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return; }
    setLoading(true); setError('');
    const { error: err } = await signUp(email, password);
    if (err) { setError(err); setLoading(false); return; }

    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const localCount = await db.tasks.count();
      if (localCount > 0) await migrateGuestData(data.session.user.id);
      navigate('/');
    } else {
      setDone(true);
    }
  };

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">이메일을 확인해 주세요</h2>
        <p className="text-sm text-gray-500 mb-6">{email} 로 인증 메일을 보냈습니다.</p>
        <Link to="/login" className="text-blue-500 text-sm hover:underline">로그인 페이지로 →</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">회원가입</h1>
        <p className="text-sm text-gray-500 mb-6">이미 계정이 있으신가요? <Link to="/login" className="text-blue-500 hover:underline">로그인</Link></p>

        {error && <p className="text-sm text-red-500 mb-4 bg-red-50 rounded-lg p-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 <span className="text-gray-400 font-normal">(8자 이상)</span></label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>
        <p className="text-center mt-4 text-xs text-gray-400">
          <Link to="/" className="hover:underline">← 게스트로 계속</Link>
        </p>
      </div>
    </div>
  );
}
