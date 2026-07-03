'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FullPageSpinner } from '@/components/LoadingSpinner';
import { TestTubes, ArrowLeft, Calendar, FileCheck2, Clock } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function LabResultsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [labRecords, setLabRecords] = useState<any[]>([]);
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
      const res = await api.get('/api/lab/records');
      setLabRecords(res.data);
    } catch (err) {
      toast('Failed to fetch lab results', 'error');
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
              <TestTubes className="text-amber-600" /> My Lab Results
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {labRecords.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <TestTubes size={48} className="mx-auto mb-4 text-gray-300" />
              <p>You have no lab tests ordered.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {labRecords.map((record) => (
                <div key={record.RECORD_ID} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100">
                        <TestTubes size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{record.TEST_NAME}</h3>
                        <p className="text-sm text-gray-500">Ordered by Dr. {record.DOCTOR_NAME}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <Calendar size={12} /> Ordered: {new Date(record.ORDER_DATE).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        record.STATUS === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {record.STATUS === 'Completed' ? <FileCheck2 size={14} /> : <Clock size={14} />}
                        {record.STATUS}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Test Results</h4>
                    {record.STATUS === 'Completed' ? (
                      <div>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{record.RESULT_DETAILS}</p>
                        <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
                          Reported on: {new Date(record.REPORT_DATE).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Results are pending and will be available once the lab processes the test.</p>
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
