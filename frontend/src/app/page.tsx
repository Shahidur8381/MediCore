import Link from 'next/link';
import { Shield, Calendar, FileText, Activity, Users, Clock, ArrowRight, Heart } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={24} className="text-blue-600" fill="currentColor" />
            <span className="text-xl font-bold gradient-text">MediCore</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.97]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 gradient-mesh overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated blobs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute top-40 right-[15%] w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-[35%] w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
              <Activity size={14} />
              Smart Hospital Management
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              Healthcare<br />
              Made <span className="gradient-text">Effortless</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-xl leading-relaxed">
              Streamline your hospital operations with MediCore. From patient registration to billing — manage everything through one intelligent platform.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/register" className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/30 active:scale-[0.97]">
                Start Free
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-gray-800 font-semibold hover:bg-gray-50 transition-all shadow-lg shadow-gray-200/50 border border-gray-200">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Secure Records', icon: Shield, value: 'HIPAA Ready' },
            { label: 'Smart Scheduling', icon: Calendar, value: 'Real-time' },
            { label: 'Digital Prescriptions', icon: FileText, value: 'Paperless' },
            { label: 'Uptime', icon: Activity, value: '24/7' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <stat.icon size={22} />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Built for Every Role
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              MediCore adapts to your needs — whether you&apos;re an administrator, a physician, or a patient.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {[
              {
                title: 'Admin Portal',
                description: 'Manage departments, onboard doctors, oversee billing, and monitor hospital-wide analytics from a single command center.',
                icon: Shield,
                gradient: 'from-blue-600 to-indigo-600',
                bg: 'bg-blue-50',
              },
              {
                title: 'Doctor Dashboard',
                description: 'View your appointment schedule, write prescriptions, order lab tests, and track patient histories at a glance.',
                icon: Users,
                gradient: 'from-violet-600 to-purple-600',
                bg: 'bg-violet-50',
              },
              {
                title: 'Patient Portal',
                description: 'Book appointments, view medical records, check lab results, and manage your billing — all from your phone or desktop.',
                icon: Heart,
                gradient: 'from-emerald-500 to-teal-600',
                bg: 'bg-emerald-50',
              },
            ].map((feature, i) => (
              <div key={i} className="group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                  <feature.icon size={26} className={`bg-gradient-to-r ${feature.gradient} bg-clip-text`} style={{ color: feature.gradient.includes('blue') ? '#2563eb' : feature.gradient.includes('violet') ? '#7c3aed' : '#10b981' }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Hospital?
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-xl mx-auto">
            Join MediCore today and experience healthcare management built for the modern age.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-blue-700 font-semibold hover:bg-gray-50 transition-all shadow-xl active:scale-[0.97]">
            Get Started Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-blue-400" fill="currentColor" />
            <span className="text-lg font-bold text-white">MediCore</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} />
            <span>© {new Date().getFullYear()} MediCore Hospital Management System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
