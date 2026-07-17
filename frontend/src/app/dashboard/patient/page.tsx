'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FullPageSpinner } from '@/components/LoadingSpinner';
import api from '@/lib/api';
import {
  LogOut, Heart, Calendar, FileText, TestTubes,
  Phone, Mail, MapPin, User, Droplets, AlertCircle, Shield
} from 'lucide-react';

export default function PatientDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({ appointments: 0, labTests: 0, prescriptions: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Patient')) {
      router.push('/login');
    }
    if (user?.role === 'Patient') {
      api.get('/api/appointments/stats')
        .then(r => setStats(r.data))
        .catch(() => {})
        .finally(() => setStatsLoading(false));
    }
  }, [user, loading]);

  if (loading || !user) return <FullPageSpinner />;

  const profile = user.profile;

  const quickActions = [
    { label: 'Book Appointment', description: 'Schedule a visit with a doctor', icon: Calendar, color: 'blue', stat: stats.appointments, statLabel: 'total', href: '/dashboard/patient/appointments' },
    { label: 'My Prescriptions', description: 'View your medical prescriptions', icon: FileText, color: 'violet', stat: stats.prescriptions, statLabel: 'total', href: '/dashboard/patient/prescriptions' },
    { label: 'Lab Results', description: 'Check your test results & pay', icon: TestTubes, color: 'amber', stat: stats.labTests, statLabel: 'total', href: '/dashboard/patient/lab-results' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/80 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full filter blur-3xl" />
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
              <User size={36} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{profile?.NAME || user.username}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {profile?.BLOOD_GROUP && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/90 bg-white/15 px-3 py-1 rounded-full font-semibold">
                    <Droplets size={14} /> {profile.BLOOD_GROUP}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-sm text-white/80 bg-white/10 px-3 py-1 rounded-full">
                  <Shield size={14} /> Patient Portal
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 -mt-6 pb-12">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 stagger-children">
          {quickActions.map((action) => (
            <Link href={action.href} key={action.label} className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 cursor-pointer relative overflow-hidden block">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl bg-${action.color}-50 flex items-center justify-center`}>
                  <action.icon size={20} className={`text-${action.color}-600`} />
                </div>
                <span className={`text-2xl font-bold text-${action.color}-600`}>
                  {statsLoading ? '—' : action.stat}
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-900">{action.label}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
            </Link>
          ))}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <User size={20} className="text-gray-400" /> My Profile
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Gender', value: profile?.GENDER, icon: User },
                { label: 'Blood Group', value: profile?.BLOOD_GROUP, icon: Droplets },
                { label: 'Phone', value: profile?.PHONE, icon: Phone },
                { label: 'Email', value: profile?.EMAIL, icon: Mail },
                { label: 'Address', value: profile?.ADDRESS, icon: MapPin },
                { label: 'Emergency Contact', value: profile?.EMERGENCY_CONTACT, icon: AlertCircle },
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
