'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FullPageSpinner } from '@/components/LoadingSpinner';
import { ArrowLeft, FileText, TestTubes, CheckCircle2, User, Clock, Calendar } from 'lucide-react';
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
  const [fetching, setFetching] = useState(true);

  // Prescription Form
  const [rxForm, setRxForm] = useState({
    Diagnosis: '',
    Medicines: '',
    Notes: ''
  });
  const [submittingRx, setSubmittingRx] = useState(false);

  // Lab Form
  const [selectedTest, setSelectedTest] = useState('');
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
      // We need appointment details to get Patient_ID. 
      // Re-using GET /api/appointments and filtering since we don't have a GET /api/appointments/:id route yet.
      const aptRes = await api.get('/api/appointments');
      const currentApt = aptRes.data.find((a: any) => a.APPOINTMENT_ID.toString() === appointmentId);
      
      if (!currentApt) {
        toast('Appointment not found', 'error');
        router.push('/dashboard/doctor/appointments');
        return;
      }
      setAppointment(currentApt);

      const labRes = await api.get('/api/lab/tests');
      setLabTests(labRes.data);
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
      toast('Prescription saved and appointment completed!', 'success');
      router.push('/dashboard/doctor/appointments');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to save prescription', 'error');
    } finally {
      setSubmittingRx(false);
    }
  };

  const handleOrderLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;
    try {
      setOrderingLab(true);
      await api.post('/api/lab/records', {
        Patient_ID: appointment.PATIENT_ID,
        Test_ID: selectedTest
      });
      toast('Lab test ordered successfully', 'success');
      setSelectedTest('');
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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/doctor/appointments" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Consultation: {appointment.PATIENT_NAME}
              </h1>
              <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                <Calendar size={12} /> {new Date(appointment.APPOINTMENT_DATE).toLocaleDateString()}
                <Clock size={12} className="ml-2" /> {appointment.APPOINTMENT_TIME}
              </p>
            </div>
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
                  placeholder="1. Paracetamol 500mg - 1+0+1 (After meal)&#10;2. Antacid - 1+0+1 (Before meal)"
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

              <div className="pt-4 border-t border-gray-100 flex justify-end">
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
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <TestTubes className="text-amber-600" size={20} />
              <h2 className="font-bold text-gray-900">Order Lab Tests</h2>
            </div>
            <form onSubmit={handleOrderLab} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Test</label>
                <select 
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none"
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                >
                  <option value="">Choose a test...</option>
                  {labTests.map(test => (
                    <option key={test.TEST_ID} value={test.TEST_ID}>{test.TEST_NAME} - ৳{test.TEST_FEE}</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                disabled={orderingLab || !selectedTest}
                className="w-full py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {orderingLab ? 'Ordering...' : 'Order Test'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
             <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                 <User size={20} />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">Patient Details</h3>
                 <p className="text-xs text-gray-500">ID: {appointment.PATIENT_ID}</p>
               </div>
             </div>
          </div>
        </div>

      </main>
    </div>
  );
}
