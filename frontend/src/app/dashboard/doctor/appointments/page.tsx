'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FullPageSpinner } from '@/components/LoadingSpinner';
import { Calendar, ArrowLeft, Clock, User, ClipboardList } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function DoctorAppointmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Doctor')) {
      router.push('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, loading]);

  const fetchData = async () => {
    try {
      setFetching(true);
      const res = await api.get('/api/appointments');
      setAppointments(res.data);
    } catch (err) {
      toast('Failed to fetch appointments', 'error');
    } finally {
      setFetching(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/api/appointments/${id}/status`, { status });
      toast(`Appointment marked as ${status}`, 'success');
      fetchData();
    } catch (err) {
      toast('Failed to update status', 'error');
    }
  };

  if (loading || !user || fetching) return <FullPageSpinner />;

  return (
    <div className="min-h-screen bg-gray-50/80">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/doctor" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-blue-600" /> My Schedule
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {appointments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p>You have no appointments scheduled.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map((apt) => (
                <div key={apt.APPOINTMENT_ID} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center text-blue-600 border border-blue-100">
                      <span className="text-xs font-bold uppercase">{new Date(apt.APPOINTMENT_DATE).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-lg font-bold leading-none">{new Date(apt.APPOINTMENT_DATE).getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <User size={16} className="text-gray-400" /> {apt.PATIENT_NAME}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                        <Clock size={14} /> {apt.APPOINTMENT_TIME}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      apt.STATUS === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      apt.STATUS === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {apt.STATUS}
                    </span>
                    
                    {apt.STATUS === 'Pending' && (
                      <button 
                        onClick={() => updateStatus(apt.APPOINTMENT_ID, 'Confirmed')}
                        className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-semibold transition-colors"
                      >
                        Confirm
                      </button>
                    )}
                    
                    {(apt.STATUS === 'Pending' || apt.STATUS === 'Confirmed') && (
                      <Link 
                        href={`/dashboard/doctor/consultation/${apt.APPOINTMENT_ID}`}
                        className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        <ClipboardList size={16} /> Consult
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
