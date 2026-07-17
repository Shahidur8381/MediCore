'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FullPageSpinner } from '@/components/LoadingSpinner';
import { Calendar, ArrowLeft, Plus, X, Hash, User as UserIcon, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { DummySSLCommerz } from '@/components/DummySSLCommerz';

export default function AppointmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  const [formData, setFormData] = useState({
    Doctor_ID: '',
    Appointment_Date: ''
  });
  const [booking, setBooking] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

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
      const [aptRes, deptRes, docRes] = await Promise.all([
        api.get('/api/appointments'),
        api.get('/api/departments'),
        api.get('/api/doctors')
      ]);
      setAppointments(aptRes.data);
      setDepartments(deptRes.data);
      setDoctors(docRes.data);
    } catch (err) {
      toast('Failed to fetch data', 'error');
    } finally {
      setFetching(false);
    }
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find(d => d.DOCTOR_ID.toString() === formData.Doctor_ID.toString());
    if (doc) {
      setPaymentAmount(doc.CONSULTATION_FEE);
      setShowPayment(true);
      setIsModalOpen(false);
    }
  };

  const processBooking = async () => {
    try {
      setShowPayment(false);
      setBooking(true);
      const res = await api.post('/api/appointments', formData);
      toast(`Appointment booked! You are queue #${res.data.queueNumber}`, 'success');
      setFormData({ Doctor_ID: '', Appointment_Date: '' });
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to book appointment', 'error');
    } finally {
      setBooking(false);
    }
  };

  if (loading || !user || fetching) return <FullPageSpinner />;

  const filteredDoctors = doctors.filter(d => !selectedDept || d.DEPARTMENT_ID === parseInt(selectedDept));

  const statusColors: Record<string, string> = {
    Pending: 'bg-amber-50 text-amber-600 border-amber-100',
    Confirmed: 'bg-blue-50 text-blue-600 border-blue-100',
    Completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Cancelled: 'bg-red-50 text-red-500 border-red-100',
    Waiting: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="min-h-screen bg-gray-50/80">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/patient" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-blue-600" /> My Appointments
            </h1>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <Plus size={16} /> Book New
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {appointments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="font-medium">You have no appointments scheduled.</p>
              <p className="text-sm text-gray-400 mt-1">Click "Book New" to schedule one.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map((apt) => (
                <div key={apt.APPOINTMENT_ID} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Date badge */}
                    <div className="w-14 h-14 rounded-xl bg-blue-50 flex flex-col items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                      <span className="text-[10px] font-bold uppercase leading-none">
                        {new Date(apt.APPOINTMENT_DATE).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-xl font-bold leading-tight">
                        {new Date(apt.APPOINTMENT_DATE).getDate()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Dr. {apt.DOCTOR_NAME}</h3>
                      <p className="text-sm text-gray-500">{apt.DEPARTMENT_NAME}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Hash size={11} /> Queue #{apt.QUEUE_NUMBER}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusColors[apt.STATUS] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                    {apt.STATUS === 'Completed' && <CheckCircle2 size={12} className="mr-1" />}
                    {apt.STATUS}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Book Appointment</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleBook} className="p-5 space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  value={selectedDept}
                  onChange={(e) => { setSelectedDept(e.target.value); setFormData({...formData, Doctor_ID: ''}); }}
                >
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d.DEPARTMENT_ID} value={d.DEPARTMENT_ID}>{d.DEPARTMENT_NAME}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
                <select 
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  value={formData.Doctor_ID}
                  onChange={(e) => setFormData({...formData, Doctor_ID: e.target.value})}
                >
                  <option value="">Select Doctor</option>
                  {filteredDoctors.map(d => (
                    <option key={d.DOCTOR_ID} value={d.DOCTOR_ID}>Dr. {d.NAME} — ৳{d.CONSULTATION_FEE}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input 
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  value={formData.Appointment_Date}
                  onChange={(e) => setFormData({...formData, Appointment_Date: e.target.value})}
                />
              </div>

              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Hash size={11} /> You will be assigned a queue number automatically.
              </p>

              <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={booking}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70"
                >
                  {booking ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPayment && (
        <DummySSLCommerz 
          amount={paymentAmount}
          title="Doctor Consultation Fee"
          onSuccess={processBooking}
          onCancel={() => { setShowPayment(false); setIsModalOpen(true); }}
        />
      )}
    </div>
  );
}
