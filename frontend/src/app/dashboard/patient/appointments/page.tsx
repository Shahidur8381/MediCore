'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FullPageSpinner } from '@/components/LoadingSpinner';
import { Calendar, ArrowLeft, Plus, X, Clock, User as UserIcon } from 'lucide-react';
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
    Appointment_Date: '',
    Appointment_Time: ''
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
      await api.post('/api/appointments', formData);
      toast('Appointment booked successfully!', 'success');
      fetchData(); // Refresh list
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to book appointment', 'error');
    } finally {
      setBooking(false);
    }
  };

  if (loading || !user || fetching) return <FullPageSpinner />;

  // Filter doctors based on selected department
  const filteredDoctors = doctors.filter(d => !selectedDept || d.DEPARTMENT_ID === parseInt(selectedDept));

  // Time slots for the dropdown (9 AM to 5 PM)
  const timeSlots = [];
  for (let i = 9; i <= 17; i++) {
    timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${i.toString().padStart(2, '0')}:30`);
  }

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
              <p>You have no appointments scheduled.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map((apt) => (
                <div key={apt.APPOINTMENT_ID} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center text-blue-600 border border-blue-100">
                      <span className="text-xs font-bold uppercase">{new Date(apt.APPOINTMENT_DATE).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-lg font-bold leading-none">{new Date(apt.APPOINTMENT_DATE).getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Dr. {apt.DOCTOR_NAME}</h3>
                      <p className="text-sm text-gray-500">{apt.DEPARTMENT_NAME}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5 justify-end">
                        <Clock size={14} className="text-gray-400" /> {apt.APPOINTMENT_TIME}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mt-1 ${
                        apt.STATUS === 'Pending' ? 'bg-amber-50 text-amber-600' :
                        apt.STATUS === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {apt.STATUS}
                      </span>
                    </div>
                  </div>
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
                    <option key={d.DOCTOR_ID} value={d.DOCTOR_ID}>Dr. {d.NAME} - ৳{d.CONSULTATION_FEE}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input 
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]} // Cannot book past dates
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    value={formData.Appointment_Date}
                    onChange={(e) => setFormData({...formData, Appointment_Date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <select 
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    value={formData.Appointment_Time}
                    onChange={(e) => setFormData({...formData, Appointment_Time: e.target.value})}
                  >
                    <option value="">Select Time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

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
                  {booking ? 'Booking...' : 'Confirm Book'}
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
