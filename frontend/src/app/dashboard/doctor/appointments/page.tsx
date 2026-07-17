'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FullPageSpinner } from '@/components/LoadingSpinner';
import { Calendar, ArrowLeft, Hash, User, ClipboardList, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function DoctorAppointmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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
      setUpdatingId(id);
      await api.put(`/api/appointments/${id}/status`, { status });
      toast(`Appointment ${status.toLowerCase()}`, 'success');
      fetchData();
    } catch (err) {
      toast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading || !user) return <FullPageSpinner />;

  // Group by date
  const grouped = appointments.reduce((acc: any, apt: any) => {
    const dateKey = new Date(apt.APPOINTMENT_DATE).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(apt);
    return acc;
  }, {});

  const statusColors: Record<string, string> = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Cancelled: 'bg-red-50 text-red-500 border-red-200',
    Waiting: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className="min-h-screen bg-gray-50/80">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/dashboard/doctor" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-blue-600" /> My Schedule
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {fetching ? (
          <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium">You have no appointments scheduled.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([dateKey, apts]: [string, any]) => (
              <div key={dateKey}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock size={14} /> {dateKey}
                </h2>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
                  {apts.map((apt: any) => (
                    <div key={apt.APPOINTMENT_ID} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-600 shrink-0">
                          <Hash size={12} />
                          <span className="text-lg font-bold leading-tight">{apt.QUEUE_NUMBER}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <User size={14} className="text-gray-400" /> {apt.PATIENT_NAME}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">ID #{apt.APPOINTMENT_ID}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${statusColors[apt.STATUS] || 'bg-gray-50 text-gray-500'}`}>
                          {apt.STATUS}
                        </span>

                        {apt.STATUS === 'Pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(apt.APPOINTMENT_ID, 'Confirmed')}
                              disabled={updatingId === apt.APPOINTMENT_ID}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              <CheckCircle2 size={13} /> Confirm
                            </button>
                            <button
                              onClick={() => updateStatus(apt.APPOINTMENT_ID, 'Cancelled')}
                              disabled={updatingId === apt.APPOINTMENT_ID}
                              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              <XCircle size={13} /> Cancel
                            </button>
                          </>
                        )}

                        {apt.STATUS === 'Confirmed' && (
                          <Link
                            href={`/dashboard/doctor/consultation/${apt.APPOINTMENT_ID}`}
                            className="px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <ClipboardList size={13} /> Start Consult
                          </Link>
                        )}

                        {apt.STATUS === 'Waiting' && (
                          <Link
                            href={`/dashboard/doctor/consultation/${apt.APPOINTMENT_ID}`}
                            className="px-3 py-1.5 bg-purple-600 text-white hover:bg-purple-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <ClipboardList size={13} /> Resume
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
