'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import LoadingSpinner, { FullPageSpinner } from '@/components/LoadingSpinner';
import {
  Users, Building2, LogOut, Plus, X, Trash2, Heart, Pencil,
  LayoutDashboard, UserCircle, Menu
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [departments, setDepartments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [stats, setStats] = useState({ departments: 0, doctors: 0, patients: 0 });
  const [activeTab, setActiveTab] = useState('overview');
  const [dataLoading, setDataLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal states
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showEditDeptModal, setShowEditDeptModal] = useState(false);
  const [showEditDocModal, setShowEditDocModal] = useState(false);

  const [deptForm, setDeptForm] = useState({ name: '', head: '' });
  const [docForm, setDocForm] = useState({
    username: '', password: '', departmentId: '', name: '', gender: 'Male',
    dob: '', specialization: '', qualification: '', phone: '', email: '', fee: ''
  });
  const [editDeptForm, setEditDeptForm] = useState({ id: 0, name: '', head: '' });
  const [editDocForm, setEditDocForm] = useState({
    id: 0, departmentId: '', name: '', gender: 'Male', dob: '',
    specialization: '', qualification: '', phone: '', email: '', fee: '', status: 'Active'
  });
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Admin')) {
      router.push('/login');
    }
    if (user?.role === 'Admin') {
      fetchData();
    }
  }, [user, loading]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [deptRes, docRes, statsRes] = await Promise.all([
        api.get('/api/departments'),
        api.get('/api/doctors'),
        api.get('/api/stats'),
      ]);
      setDepartments(deptRes.data);
      setDoctors(docRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setDataLoading(false);
    }
  };

  // ===== Department CRUD =====
  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await api.post('/api/departments', deptForm);
      toast('Department created successfully', 'success');
      setShowDeptModal(false);
      setDeptForm({ name: '', head: '' });
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to create department', 'error');
    } finally { setModalLoading(false); }
  };

  const openEditDept = (dept: any) => {
    setEditDeptForm({ id: dept.DEPARTMENT_ID, name: dept.DEPARTMENT_NAME, head: dept.DEPARTMENT_HEAD || '' });
    setShowEditDeptModal(true);
  };

  const handleUpdateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await api.put(`/api/departments/${editDeptForm.id}`, { name: editDeptForm.name, head: editDeptForm.head });
      toast('Department updated', 'success');
      setShowEditDeptModal(false);
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to update', 'error');
    } finally { setModalLoading(false); }
  };

  const handleDeleteDept = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.delete(`/api/departments/${id}`);
      toast('Department deleted', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to delete department', 'error');
    }
  };

  // ===== Doctor CRUD =====
  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await api.post('/api/auth/register-doctor', docForm);
      toast('Doctor registered successfully', 'success');
      setShowDocModal(false);
      setDocForm({ username: '', password: '', departmentId: '', name: '', gender: 'Male', dob: '', specialization: '', qualification: '', phone: '', email: '', fee: '' });
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to register doctor', 'error');
    } finally { setModalLoading(false); }
  };

  const openEditDoc = (doc: any) => {
    const rawDob = doc.DATE_OF_BIRTH;
    let dob = '';
    if (rawDob) {
      const d = new Date(rawDob);
      dob = d.toISOString().split('T')[0];
    }
    setEditDocForm({
      id: doc.DOCTOR_ID, departmentId: String(doc.DEPARTMENT_ID || ''), name: doc.NAME || '',
      gender: doc.GENDER || 'Male', dob, specialization: doc.SPECIALIZATION || '',
      qualification: doc.QUALIFICATION || '', phone: doc.PHONE || '', email: doc.EMAIL || '',
      fee: String(doc.CONSULTATION_FEE || ''), status: doc.STATUS || 'Active'
    });
    setShowEditDocModal(true);
  };

  const handleUpdateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await api.put(`/api/doctors/${editDocForm.id}`, editDocForm);
      toast('Doctor updated', 'success');
      setShowEditDocModal(false);
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to update', 'error');
    } finally { setModalLoading(false); }
  };

  if (loading || !user) return <FullPageSpinner />;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'doctors', label: 'Doctors', icon: Users },
  ];

  const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white/70 transition-all";

  return (
    <div className="min-h-screen bg-gray-50/80 flex">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/30 md:hidden animate-overlay-in" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 md:translate-x-0 md:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Heart size={22} className="text-blue-600" fill="currentColor" />
            <span className="text-xl font-bold gradient-text">MediCore</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 font-medium">Admin Portal</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === item.id ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}>
              <item.icon size={18} />{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">{user.username?.[0]?.toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.username}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"><LogOut size={16} /> Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600"><Menu size={22} /></button>
            <h1 className="text-xl font-bold text-gray-800">{activeTab === 'overview' ? 'Dashboard' : activeTab === 'departments' ? 'Departments' : 'Doctors'}</h1>
          </div>
          {activeTab !== 'overview' && (
            <button onClick={() => activeTab === 'departments' ? setShowDeptModal(true) : setShowDocModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-md shadow-blue-600/20 transition-all active:scale-[0.97]">
              <Plus size={16} /> Add {activeTab === 'departments' ? 'Department' : 'Doctor'}
            </button>
          )}
        </header>

        <main className="flex-1 p-6 overflow-auto custom-scrollbar">
          {/* ===== Overview ===== */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 stagger-children">
                {[
                  { label: 'Total Departments', value: stats.departments, icon: Building2, color: 'blue' },
                  { label: 'Total Doctors', value: stats.doctors, icon: Users, color: 'violet' },
                  { label: 'Total Patients', value: stats.patients, icon: UserCircle, color: 'emerald' },
                ].map((card) => (
                  <div key={card.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-${card.color}-50 flex items-center justify-center`}><card.icon size={22} className={`text-${card.color}-600`} /></div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{dataLoading ? <span className="skeleton inline-block w-12 h-8 rounded" /> : card.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{card.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Departments</h3>
                    <button onClick={() => setActiveTab('departments')} className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {departments.slice(0, 5).map((dept: any) => (
                      <div key={dept.DEPARTMENT_ID} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                        <div><p className="text-sm font-medium text-gray-800">{dept.DEPARTMENT_NAME}</p><p className="text-xs text-gray-400">{dept.DEPARTMENT_HEAD || 'No head assigned'}</p></div>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">#{dept.DEPARTMENT_ID}</span>
                      </div>
                    ))}
                    {departments.length === 0 && !dataLoading && <p className="px-6 py-8 text-center text-gray-400 text-sm">No departments yet</p>}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Doctors</h3>
                    <button onClick={() => setActiveTab('doctors')} className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {doctors.slice(0, 5).map((doc: any) => (
                      <div key={doc.DOCTOR_ID} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{doc.NAME?.[0]}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-800 truncate">{doc.NAME}</p><p className="text-xs text-gray-400 truncate">{doc.SPECIALIZATION}</p></div>
                        <span className="text-xs bg-violet-50 text-violet-700 px-2 py-1 rounded-full font-medium shrink-0">{doc.DEPARTMENT_NAME || 'N/A'}</span>
                      </div>
                    ))}
                    {doctors.length === 0 && !dataLoading && <p className="px-6 py-8 text-center text-gray-400 text-sm">No doctors yet</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== Departments Table ===== */}
          {activeTab === 'departments' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department Name</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Head</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {departments.map((dept: any) => (
                      <tr key={dept.DEPARTMENT_ID} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-400 font-mono">#{dept.DEPARTMENT_ID}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{dept.DEPARTMENT_NAME}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{dept.DEPARTMENT_HEAD || <span className="text-gray-300">—</span>}</td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                          <button onClick={() => openEditDept(dept)} className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-all"><Pencil size={16} /></button>
                          <button onClick={() => handleDeleteDept(dept.DEPARTMENT_ID)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {departments.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">No departments found. Click &quot;Add Department&quot; to create one.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== Doctors Table ===== */}
          {activeTab === 'doctors' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialization</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fee</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {doctors.map((doc: any) => (
                      <tr key={doc.DOCTOR_ID} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{doc.NAME?.[0]}</div>
                            <div><p className="text-sm font-semibold text-gray-800">{doc.NAME}</p><p className="text-xs text-gray-400">{doc.QUALIFICATION}</p></div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">{doc.DEPARTMENT_NAME || 'Unassigned'}</span></td>
                        <td className="px-6 py-4 text-sm text-gray-600">{doc.SPECIALIZATION}</td>
                        <td className="px-6 py-4"><p className="text-sm text-gray-600">{doc.PHONE}</p><p className="text-xs text-gray-400">{doc.EMAIL}</p></td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">৳{doc.CONSULTATION_FEE}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openEditDoc(doc)} className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-all"><Pencil size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {doctors.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">No doctors found. Click &quot;Add Doctor&quot; to register one.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===== CREATE DEPARTMENT MODAL ===== */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 animate-overlay-in" onClick={() => setShowDeptModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-modal-in">
            <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-gray-900">Add Department</h2><button onClick={() => setShowDeptModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
            <form onSubmit={handleCreateDept} className="space-y-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Department Name</label><input type="text" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} required className={inputCls} placeholder="e.g. Cardiology" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Department Head</label><input type="text" value={deptForm.head} onChange={(e) => setDeptForm({ ...deptForm, head: e.target.value })} className={inputCls} placeholder="Head of department (optional)" /></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowDeptModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
                <button type="submit" disabled={modalLoading} className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md disabled:opacity-70 flex items-center gap-2">
                  {modalLoading ? <LoadingSpinner size="sm" className="border-white/30 border-t-white" /> : <Plus size={16} />} Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT DEPARTMENT MODAL ===== */}
      {showEditDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 animate-overlay-in" onClick={() => setShowEditDeptModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-modal-in">
            <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-gray-900">Edit Department</h2><button onClick={() => setShowEditDeptModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
            <form onSubmit={handleUpdateDept} className="space-y-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Department Name</label><input type="text" value={editDeptForm.name} onChange={(e) => setEditDeptForm({ ...editDeptForm, name: e.target.value })} required className={inputCls} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Department Head</label><input type="text" value={editDeptForm.head} onChange={(e) => setEditDeptForm({ ...editDeptForm, head: e.target.value })} className={inputCls} /></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowEditDeptModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
                <button type="submit" disabled={modalLoading} className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md disabled:opacity-70 flex items-center gap-2">
                  {modalLoading ? <LoadingSpinner size="sm" className="border-white/30 border-t-white" /> : <Pencil size={16} />} Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== CREATE DOCTOR MODAL ===== */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 animate-overlay-in" onClick={() => setShowDocModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-modal-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-gray-900">Register Doctor</h2><button onClick={() => setShowDocModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
            <form onSubmit={handleCreateDoctor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label><input type="text" value={docForm.username} onChange={(e) => setDocForm({ ...docForm, username: e.target.value })} required className={inputCls} placeholder="Login username" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label><input type="password" value={docForm.password} onChange={(e) => setDocForm({ ...docForm, password: e.target.value })} required className={inputCls} placeholder="Min. 6 characters" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label><input type="text" value={docForm.name} onChange={(e) => setDocForm({ ...docForm, name: e.target.value })} required className={inputCls} placeholder="Dr. Full Name" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
                  <select value={docForm.departmentId} onChange={(e) => setDocForm({ ...docForm, departmentId: e.target.value })} required className={inputCls}>
                    <option value="">Select department...</option>
                    {departments.map((d: any) => <option key={d.DEPARTMENT_ID} value={d.DEPARTMENT_ID}>{d.DEPARTMENT_NAME}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
                  <select value={docForm.gender} onChange={(e) => setDocForm({ ...docForm, gender: e.target.value })} className={inputCls}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select>
                </div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth</label><input type="date" value={docForm.dob} onChange={(e) => setDocForm({ ...docForm, dob: e.target.value })} required className={inputCls} /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Specialization</label><input type="text" value={docForm.specialization} onChange={(e) => setDocForm({ ...docForm, specialization: e.target.value })} required className={inputCls} placeholder="e.g. Cardiologist" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Qualification</label><input type="text" value={docForm.qualification} onChange={(e) => setDocForm({ ...docForm, qualification: e.target.value })} className={inputCls} placeholder="e.g. MBBS, MD" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label><input type="tel" value={docForm.phone} onChange={(e) => setDocForm({ ...docForm, phone: e.target.value })} required className={inputCls} placeholder="01XXXXXXXXX" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label><input type="email" value={docForm.email} onChange={(e) => setDocForm({ ...docForm, email: e.target.value })} required className={inputCls} placeholder="doctor@example.com" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Consultation Fee (৳)</label><input type="number" value={docForm.fee} onChange={(e) => setDocForm({ ...docForm, fee: e.target.value })} required className={inputCls} placeholder="500" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowDocModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
                <button type="submit" disabled={modalLoading} className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md disabled:opacity-70 flex items-center gap-2">
                  {modalLoading ? <LoadingSpinner size="sm" className="border-white/30 border-t-white" /> : <Plus size={16} />} Register Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT DOCTOR MODAL ===== */}
      {showEditDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 animate-overlay-in" onClick={() => setShowEditDocModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-modal-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-gray-900">Edit Doctor</h2><button onClick={() => setShowEditDocModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
            <form onSubmit={handleUpdateDoc} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label><input type="text" value={editDocForm.name} onChange={(e) => setEditDocForm({ ...editDocForm, name: e.target.value })} required className={inputCls} /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
                  <select value={editDocForm.departmentId} onChange={(e) => setEditDocForm({ ...editDocForm, departmentId: e.target.value })} required className={inputCls}>
                    <option value="">Select...</option>
                    {departments.map((d: any) => <option key={d.DEPARTMENT_ID} value={d.DEPARTMENT_ID}>{d.DEPARTMENT_NAME}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
                  <select value={editDocForm.gender} onChange={(e) => setEditDocForm({ ...editDocForm, gender: e.target.value })} className={inputCls}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select>
                </div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth</label><input type="date" value={editDocForm.dob} onChange={(e) => setEditDocForm({ ...editDocForm, dob: e.target.value })} required className={inputCls} /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Specialization</label><input type="text" value={editDocForm.specialization} onChange={(e) => setEditDocForm({ ...editDocForm, specialization: e.target.value })} required className={inputCls} /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Qualification</label><input type="text" value={editDocForm.qualification} onChange={(e) => setEditDocForm({ ...editDocForm, qualification: e.target.value })} className={inputCls} /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label><input type="tel" value={editDocForm.phone} onChange={(e) => setEditDocForm({ ...editDocForm, phone: e.target.value })} required className={inputCls} /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label><input type="email" value={editDocForm.email} onChange={(e) => setEditDocForm({ ...editDocForm, email: e.target.value })} required className={inputCls} /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Consultation Fee (৳)</label><input type="number" value={editDocForm.fee} onChange={(e) => setEditDocForm({ ...editDocForm, fee: e.target.value })} required className={inputCls} /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                  <select value={editDocForm.status} onChange={(e) => setEditDocForm({ ...editDocForm, status: e.target.value })} className={inputCls}><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditDocModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
                <button type="submit" disabled={modalLoading} className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md disabled:opacity-70 flex items-center gap-2">
                  {modalLoading ? <LoadingSpinner size="sm" className="border-white/30 border-t-white" /> : <Pencil size={16} />} Update Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
