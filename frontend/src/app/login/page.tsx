'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await api.post('/api/auth/login', { username, password });
      await login(res.data.token, res.data.user);
      
      const role = res.data.user.role;
      if (role === 'Admin') router.push('/dashboard/admin');
      else if (role === 'Doctor') router.push('/dashboard/doctor');
      else if (role === 'Patient') router.push('/dashboard/patient');
      else router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center gradient-mesh relative overflow-hidden px-4 py-12">
      {/* Animated blobs */}
      <div className="absolute top-10 left-[15%] w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
      <div className="absolute top-20 right-[10%] w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-[40%] w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md glass-card p-8 animate-fade-in-up z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Heart size={28} className="text-blue-600" fill="currentColor" />
          </Link>
          <h1 className="text-3xl font-bold gradient-text">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to your MediCore account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium animate-slide-down">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/70 disabled:opacity-50"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/70 disabled:opacity-50"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="border-white/30 border-t-white" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider + Register */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
          New patient?{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
