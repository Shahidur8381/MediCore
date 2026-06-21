'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FullPageSpinner } from '@/components/LoadingSpinner';
import {
  LogOut, Heart, Stethoscope, Calendar, FileText, ClipboardList,
  Phone, Mail, Award, Building2, Clock, User
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Doctor')) {
      router.push('/login');
    }
  }, [user, loading]);

  if (loading || !user) return <FullPageSpinner />;

  const profile = user.profile;

  const quickStats = [
    { label: 'Appointments Today', value: '—', icon: Calendar, color: 'blue', note: 'Phase 3' },
    { label: 'Prescriptions', value: '—', icon: FileText, color: 'violet', note: 'Phase 3' },
    { label: 'Lab Orders', value: '—', icon: ClipboardList, color: 'emerald', note: 'Phase 3' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/80 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-white rounded-full filter blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Heart size={22} className="text-white/80" fill="currentColor" />
              <span className="text-lg font-bold text-white">MediCore</span>
            </div>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-sm font-medium backdrop-blur-sm transition-all">
              <LogOut size={16} /> Sign Out
            </button>
          </div>

          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
              <Stethoscope size={36} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Dr. {profile?.NAME || user.username}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 text-sm text-white/80 bg-white/10 px-3 py-1 rounded-full">
                  <Award size={14} /> {profile?.SPECIALIZATION || 'Specialist'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-white/80 bg-white/10 px-3 py-1 rounded-full">
                  <Building2 size={14} /> {profile?.DEPARTMENT_NAME || 'Department'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 -mt-6 pb-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 stagger-children">
          {quickStats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                  <stat.icon size={20} className={`text-${stat.color}-600`} />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">{stat.note}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <User size={20} className="text-gray-400" /> Profile Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Specialization', value: profile?.SPECIALIZATION, icon: Stethoscope },
                { label: 'Qualification', value: profile?.QUALIFICATION, icon: Award },
                { label: 'Phone', value: profile?.PHONE, icon: Phone },
                { label: 'Email', value: profile?.EMAIL, icon: Mail },
                { label: 'Consultation Fee', value: profile?.CONSULTATION_FEE ? `৳${profile.CONSULTATION_FEE}` : null, icon: FileText },
                { label: 'Status', value: profile?.STATUS, icon: Clock },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
