'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FullPageSpinner } from '@/components/LoadingSpinner';
import { TestTubes, ArrowLeft, FileCheck2, Clock, AlertCircle, CheckCircle2, CreditCard } from 'lucide-react';
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
  const [expandedReport, setExpandedReport] = useState<number | null>(null);

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
      toast('Payment successful! Test sent to lab.', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Payment failed', 'error');
      setFetching(false);
    }
  };

  if (loading || !user || fetching) return <FullPageSpinner />;

  const getStatusBadge = (record: any) => {
    const s = record.STATUS;
    const paid = record.PAYMENT_STATUS === 'Paid';
    if (!paid) return { label: 'Unpaid', cls: 'bg-red-50 text-red-600 border-red-100', icon: CreditCard };
    if (s === 'Awaiting Result') return { label: 'Lab Processing', cls: 'bg-purple-50 text-purple-600 border-purple-100', icon: Clock };
    if (s === 'Completed') return { label: 'Report Ready', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 };
    return { label: s, cls: 'bg-gray-50 text-gray-600 border-gray-100', icon: AlertCircle };
  };

  return (
    <div className="min-h-screen bg-gray-50/80">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/dashboard/patient" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TestTubes className="text-amber-600" /> My Lab Results
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {labRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            <TestTubes size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No lab tests ordered yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {labRecords.map((record) => {
              const badge = getStatusBadge(record);
              const Icon = badge.icon;
              const isExpanded = expandedReport === record.RECORD_ID;

              return (
                <div key={record.RECORD_ID} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
                        <TestTubes size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{record.TEST_NAME}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Ordered by Dr. {record.DOCTOR_NAME} · {new Date(record.ORDER_DATE).toLocaleDateString()}
                        </p>
                        <div className="text-xs font-bold text-gray-700 mt-0.5 flex items-center gap-2">
                          {record.WAIVE_COMMISSION === 'Y' ? (
                            <>
                              <span className="line-through text-gray-400 font-medium">৳{record.TEST_FEE}</span>
                              <span className="text-emerald-600">৳{Math.ceil(record.TEST_FEE * 0.75)}</span>
                              <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">Discounted</span>
                            </>
                          ) : (
                            <span>৳{record.TEST_FEE}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badge.cls}`}>
                        <Icon size={12} /> {badge.label}
                      </span>

                      {record.PAYMENT_STATUS !== 'Paid' && (
                        <button
                          onClick={() => handlePayClick(record)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                        >
                          Pay ৳{record.WAIVE_COMMISSION === 'Y' ? Math.ceil(record.TEST_FEE * 0.75) : record.TEST_FEE}
                        </button>
                      )}

                      {record.STATUS === 'Completed' && (
                        <button
                          onClick={() => setExpandedReport(isExpanded ? null : record.RECORD_ID)}
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <FileCheck2 size={14} /> {isExpanded ? 'Hide' : 'View Report'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Report Panel */}
                  {record.STATUS === 'Completed' && isExpanded && (
                    <div className="border-t border-gray-100 bg-emerald-50/40 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <FileCheck2 size={16} className="text-emerald-600" />
                        <h4 className="font-semibold text-gray-900 text-sm">Lab Report</h4>
                        {record.REPORT_DATE && (
                          <span className="ml-auto text-xs text-gray-400">
                            Reported: {new Date(record.REPORT_DATE).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-white rounded-xl p-4 border border-gray-100 font-sans">
                        {record.RESULT_DETAILS}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showPayment && (
        <DummySSLCommerz 
          amount={paymentAmount}
          title={`Lab Test Fee — ${selectedRecord?.TEST_NAME}`}
          onSuccess={processPayment}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
