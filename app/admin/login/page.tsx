'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { adminLogin, getAdminSession } from '@/lib/storage';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getAdminSession();
    if (session) router.replace('/admin/dashboard');
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const session = adminLogin(username.trim(), password);
      if (session) {
        router.push('/admin/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
      }
      setLoading(false);
    }, 600);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#0a0a0a]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(192,57,43,0.06) 0%, transparent 60%)' }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#c0392b]/10 border border-[#c0392b]/30 mb-4">
            <Lock size={24} className="text-[#c0392b]" />
          </div>
          <h1 className="font-black text-2xl uppercase">Admin Portal</h1>
          <p className="text-gray-600 text-sm mt-1">Lux Automotive — Staff Access</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1.5">Username</label>
            <input
              type="text"
              placeholder="admin / manager"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              className="lux-input"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="lux-input pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded px-3 py-2"
            >
              {error}
            </motion.p>
          )}

          <button type="submit" disabled={loading} className="btn-crown w-full py-3.5">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-700 text-xs mt-6">
          Unauthorized access is strictly prohibited.
        </p>
      </motion.div>
    </div>
  );
}
