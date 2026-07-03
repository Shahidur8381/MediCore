'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FullPageSpinner } from '@/components/LoadingSpinner';
import { FileText, ArrowLeft, Pill, AlertCircle, Calendar } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function PrescriptionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Patient')) {
      router.push('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, loading]);

  const fetchData = async () => {
    try {
      setFetching(true);
      const res = await api.get('/api/prescriptions/patient/all');
      setPrescriptions(res.data);
    } catch (err) {
      toast('Failed to fetch prescriptions', 'error');
    } finally {
      setFetching(false);
    }
  };

  if (loading || !user || fetching) return <FullPageSpinner />;

  return (
    <div className="min-h-screen bg-gray-50/80">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/patient" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-violet-600" /> My Prescriptions
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid gap-6">
          {prescriptions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm">
              <Pill size={48} className="mx-auto mb-4 text-gray-300" />
              <p>You have no prescriptions on record.</p>
            </div>
          ) : (
            prescriptions.map((px) => (
              <div key={px.PRESCRIPTION_ID} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="border-b border-gray-100 p-5 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Dr. {px.DOCTOR_NAME}</h3>
                      <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                        <Calendar size={12} /> {new Date(px.PRESCRIPTION_DATE).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Diagnosis</span>
                    <p className="text-sm font-semibold text-gray-800">{px.DIAGNOSIS || 'N/A'}</p>
                  </div>
                </div>
                <div className="p-5 grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1 mb-2">
                      <Pill size={14} /> Medicines
                    </h4>
                    <div className="bg-violet-50/50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap border border-violet-100">
                      {px.MEDICINES || 'No medicines prescribed.'}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1 mb-2">
                      <AlertCircle size={14} /> Doctor's Notes
                    </h4>
                    <div className="bg-amber-50/50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap border border-amber-100 h-full">
                      {px.NOTES || 'No additional notes.'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
