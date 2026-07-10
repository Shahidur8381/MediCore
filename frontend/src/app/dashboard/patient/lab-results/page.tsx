'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FullPageSpinner } from '@/components/LoadingSpinner';
import { TestTubes, ArrowLeft, Calendar, FileCheck2, Clock } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { DummySSLCommerz } from '@/components/DummySSLCommerz';

export default function LabResultsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [labRecords, setLabRecords] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

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

  const handlePayClick = (record: any) => {
    setSelectedRecord(record);
    setPaymentAmount(record.TEST_FEE);
    setShowPayment(true);
  };

  const processPayment = async () => {
    try {
      setShowPayment(false);
      setFetching(true);
      await api.post(`/api/lab/records/${selectedRecord.RECORD_ID}/pay`);
      toast('Payment successful!', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Payment failed', 'error');
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
                      <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          record.STATUS === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {record.STATUS === 'Completed' ? <FileCheck2 size={14} /> : <Clock size={14} />}
                          {record.STATUS}
                        </span>
                        
                        {record.PAYMENT_STATUS === 'Pending' ? (
                          <button 
                            onClick={() => handlePayClick(record)}
                            className="text-xs px-3 py-1 bg-gray-900 hover:bg-black text-white rounded-full font-bold shadow-sm transition-colors"
                          >
                            Pay ৳{record.TEST_FEE}
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                            Paid
                          </span>
                        )}
                      </div>
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

      {showPayment && (
        <DummySSLCommerz 
          amount={paymentAmount}
          title={`Lab Test: ${selectedRecord?.TEST_NAME}`}
          onSuccess={processPayment}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
