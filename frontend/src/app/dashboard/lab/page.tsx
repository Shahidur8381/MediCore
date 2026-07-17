'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FullPageSpinner } from '@/components/LoadingSpinner';
import { TestTubes, LogOut, Heart, CheckCircle2, Clock, FileCheck2, User, Send, Beaker } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function LabDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [records, setRecords] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [reportText, setReportText] = useState<Record<number, string>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Lab')) {
      router.push('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, loading]);

  const fetchData = async () => {
    try {
      setFetching(true);
      const res = await api.get('/api/lab/records');
      setRecords(res.data);
    } catch (err) {
      toast('Failed to fetch lab records', 'error');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmitReport = async (recordId: number) => {
    const report = reportText[recordId]?.trim();
    if (!report) {
      toast('Please enter the result details', 'error');
      return;
    }
    try {
      setSubmittingId(recordId);
      await api.put(`/api/lab/records/${recordId}/complete`, { Result_Details: report });
      toast('Report submitted successfully!', 'success');
      setExpandedId(null);
      setReportText(prev => { const n = {...prev}; delete n[recordId]; return n; });
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to submit report', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading || !user) return <FullPageSpinner />;

  const pendingRecords = records.filter(r => r.STATUS !== 'Completed');
  const completedRecords = records.filter(r => r.STATUS === 'Completed');
  const displayRecords = activeTab === 'pending' ? pendingRecords : completedRecords;

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white rounded-full filter blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-6 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Heart size={20} className="text-white/80" fill="currentColor" />
                <span className="text-base font-bold text-white">MediCore</span>
              </div>
              <div className="w-px h-5 bg-white/30" />
              <div className="flex items-center gap-2 text-white">
                <Beaker size={20} />
                <span className="text-base font-bold">Laboratory Panel</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{user.username}</p>
                <p className="text-xs text-white/70">Lab Technician</p>
              </div>
              <button onClick={logout} className="flex items-center gap-2 px-3 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-sm font-medium backdrop-blur-sm transition-all">
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'pending' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Clock size={15} /> Pending Reports
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === 'pending' ? 'bg-amber-200 text-amber-800' : 'bg-gray-100 text-gray-500'}`}>
              {fetching ? '…' : pendingRecords.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <CheckCircle2 size={15} /> Completed
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === 'completed' ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
              {fetching ? '…' : completedRecords.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-5xl mx-auto p-6">
        {fetching ? (
          <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : displayRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <TestTubes size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium text-gray-500">
              {activeTab === 'pending' ? 'No pending lab tests.' : 'No completed tests yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayRecords.map((record) => {
              const isExpanded = expandedId === record.RECORD_ID;

              return (
                <div key={record.RECORD_ID} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${record.STATUS === 'Completed' ? 'bg-emerald-50 border-emerald-100' : 'bg-teal-50 border-teal-100'}`}>
                        <TestTubes size={20} className={record.STATUS === 'Completed' ? 'text-emerald-600' : 'text-teal-600'} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{record.TEST_NAME}</h3>
                        <div className="flex items-center gap-3 mt-0.5">
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <User size={11} /> {record.PATIENT_NAME}
                          </p>
                          <span className="text-xs text-gray-400">·</span>
                          <p className="text-xs text-gray-500">
                            Dr. {record.DOCTOR_NAME}
                          </p>
                          <span className="text-xs text-gray-400">·</span>
                          <p className="text-xs text-gray-400">
                            {new Date(record.ORDER_DATE).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {record.STATUS === 'Completed' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 size={12} /> Done
                        </span>
                      ) : (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : record.RECORD_ID)}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
                        >
                          <FileCheck2 size={14} /> {isExpanded ? 'Cancel' : 'Enter Report'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Enter report panel */}
                  {!record.RESULT_DETAILS && isExpanded && (
                    <div className="border-t border-gray-100 bg-teal-50/30 p-5">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FileCheck2 size={14} className="text-teal-600" /> Enter Lab Results
                      </h4>
                      <textarea
                        rows={5}
                        placeholder={"Sample: Haemoglobin: 13.5 g/dL (Normal)\nWBC: 8,000 /μL (Normal)\nPlatelet: 200,000 /μL (Normal)\n\nConclusion: All values within normal limits."}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none resize-none text-sm"
                        value={reportText[record.RECORD_ID] || ''}
                        onChange={e => setReportText(prev => ({ ...prev, [record.RECORD_ID]: e.target.value }))}
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          disabled={submittingId === record.RECORD_ID}
                          onClick={() => handleSubmitReport(record.RECORD_ID)}
                          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2 text-sm"
                        >
                          <Send size={14} /> {submittingId === record.RECORD_ID ? 'Submitting...' : 'Submit Report'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Completed report */}
                  {record.STATUS === 'Completed' && isExpanded && record.RESULT_DETAILS && (
                    <div className="border-t border-gray-100 bg-emerald-50/30 p-5">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Report Submitted</h4>
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
    </div>
  );
}
