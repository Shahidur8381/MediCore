'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FullPageSpinner } from '@/components/LoadingSpinner';
import { ArrowLeft, FileText, TestTubes, CheckCircle2, User, Calendar, Plus, Trash2, Clock, Hash } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function ConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const appointmentId = resolvedParams.id;
  
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [appointment, setAppointment] = useState<any>(null);
  const [labTests, setLabTests] = useState<any[]>([]);
  const [orderedTests, setOrderedTests] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // Prescription Form
  const [rxForm, setRxForm] = useState({
    Diagnosis: '',
    Medicines: '',
    Notes: ''
  });
  const [submittingRx, setSubmittingRx] = useState(false);
  const [waitingForLab, setWaitingForLab] = useState(false);

  // Lab Form
  const [selectedTest, setSelectedTest] = useState('');
  const [waiveCommission, setWaiveCommission] = useState(false);
  const [orderingLab, setOrderingLab] = useState(false);

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
      const [aptRes, labRes, orderedRes] = await Promise.all([
        api.get('/api/appointments'),
        api.get('/api/lab/tests'),
        api.get('/api/lab/records'),
      ]);
      const currentApt = aptRes.data.find((a: any) => a.APPOINTMENT_ID.toString() === appointmentId);
      
      if (!currentApt) {
        toast('Appointment not found', 'error');
        router.push('/dashboard/doctor/appointments');
        return;
      }
      setAppointment(currentApt);
      setLabTests(labRes.data);

      // Filter ordered tests for this patient in this session
      const patientTests = orderedRes.data.filter(
        (r: any) => r.PATIENT_ID === currentApt.PATIENT_ID && r.PAYMENT_STATUS !== 'Paid'
      );
      setOrderedTests(patientTests);
    } catch (err) {
      toast('Failed to fetch data', 'error');
    } finally {
      setFetching(false);
    }
  };

  const handlePrescribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingRx(true);
      await api.post('/api/prescriptions', {
        Appointment_ID: appointment.APPOINTMENT_ID,
        Patient_ID: appointment.PATIENT_ID,
        ...rxForm
      });
      await api.put(`/api/appointments/${appointmentId}/status`, { status: 'Completed' });
      toast('Consultation completed!', 'success');
      router.push('/dashboard/doctor/appointments');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to save prescription', 'error');
    } finally {
      setSubmittingRx(false);
    }
  };

  const handleWaitForLab = async () => {
    try {
      setWaitingForLab(true);
      await api.put(`/api/appointments/${appointmentId}/status`, { status: 'Waiting' });
      toast('Appointment marked as Waiting for Lab Results.', 'success');
      router.push('/dashboard/doctor/appointments');
    } catch (err: any) {
      toast('Failed to update status', 'error');
    } finally {
      setWaitingForLab(false);
    }
  };

  const handleOrderLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;
    try {
      setOrderingLab(true);
      await api.post('/api/lab/records', {
        Patient_ID: appointment.PATIENT_ID,
        Test_ID: selectedTest,
        waiveCommission
      });
      toast('Lab test ordered!', 'success');
      setSelectedTest('');
      setWaiveCommission(false);
      // Refresh ordered tests
      const orderedRes = await api.get('/api/lab/records');
      const patientTests = orderedRes.data.filter(
        (r: any) => r.PATIENT_ID === appointment.PATIENT_ID && r.PAYMENT_STATUS !== 'Paid'
      );
      setOrderedTests(patientTests);
    } catch (err: any) {
      toast('Failed to order lab test', 'error');
    } finally {
      setOrderingLab(false);
    }
  };

  if (loading || !user || fetching || !appointment) return <FullPageSpinner />;

  return (
    <div className="min-h-screen bg-gray-50/80">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/dashboard/doctor/appointments" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Consultation — {appointment.PATIENT_NAME}
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(appointment.APPOINTMENT_DATE).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Hash size={11} /> Queue #{appointment.QUEUE_NUMBER}</span>
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid lg:grid-cols-3 gap-6">
        
        {/* Left Col: Prescription Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <FileText className="text-indigo-600" size={20} />
              <h2 className="font-bold text-gray-900">Write Prescription</h2>
            </div>
            <form onSubmit={handlePrescribe} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Diagnosis</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Viral Fever"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  value={rxForm.Diagnosis}
                  onChange={e => setRxForm({...rxForm, Diagnosis: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Medicines</label>
                <textarea 
                  required
                  rows={4}
                  placeholder={"1. Paracetamol 500mg - 1+0+1 (After meal)\n2. Antacid - 1+0+1 (Before meal)"}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                  value={rxForm.Medicines}
                  onChange={e => setRxForm({...rxForm, Medicines: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Notes</label>
                <textarea 
                  rows={2}
                  placeholder="Rest for 3 days. Drink plenty of water."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                  value={rxForm.Notes}
                  onChange={e => setRxForm({...rxForm, Notes: e.target.value})}
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3 justify-end">
                <button
                  type="button"
                  disabled={waitingForLab || orderedTests.length === 0}
                  onClick={handleWaitForLab}
                  className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-xl transition-colors disabled:opacity-40 flex items-center gap-2"
                >
                  <Clock size={16} />
                  {waitingForLab ? 'Updating...' : 'Wait for Lab Results'}
                </button>
                <button 
                  type="submit" 
                  disabled={submittingRx}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  {submittingRx ? 'Saving...' : 'Complete Consultation'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Lab Orders */}
        <div className="space-y-5">
          {/* Order Form */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <TestTubes className="text-amber-600" size={18} />
              <h2 className="font-bold text-gray-900 text-sm">Order Lab Tests</h2>
            </div>
            <form onSubmit={handleOrderLab} className="p-5 space-y-3">
              <select 
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none text-sm"
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
              >
                <option value="">Choose a test...</option>
                {labTests.map(test => (
                  <option key={test.TEST_ID} value={test.TEST_ID}>{test.TEST_NAME} — ৳{test.TEST_FEE}</option>
                ))}
              </select>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="waiveCommission" 
                  checked={waiveCommission}
                  onChange={(e) => setWaiveCommission(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="waiveCommission" className="text-xs text-gray-600">
                  Waive my 25% commission (free for patient)
                </label>
              </div>

              <button 
                type="submit"
                disabled={orderingLab || !selectedTest}
                className="w-full py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                <Plus size={15} /> {orderingLab ? 'Ordering...' : 'Add Test'}
              </button>
            </form>
          </div>

          {/* Ordered tests for this session */}
          {orderedTests.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-700">Ordered Tests ({orderedTests.length})</h3>
                <p className="text-xs text-gray-400 mt-0.5">Patient needs to pay these</p>
              </div>
              <div className="divide-y divide-gray-50">
                {orderedTests.map((t) => (
                  <div key={t.RECORD_ID} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.TEST_NAME}</p>
                      <p className="text-xs text-gray-400">
                        ৳{t.TEST_FEE} {t.WAIVE_COMMISSION === 'Y' && <span className="text-emerald-500 ml-1">(waived)</span>}
                      </p>
                    </div>
                    <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-medium">Pending</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patient Info */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                <User size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{appointment.PATIENT_NAME}</h3>
                <p className="text-xs text-gray-500">Patient ID: {appointment.PATIENT_ID}</p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
