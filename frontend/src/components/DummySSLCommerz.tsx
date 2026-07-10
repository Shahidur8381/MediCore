import React, { useState } from 'react';
import { CreditCard, X, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

interface DummySSLCommerzProps {
  amount: number;
  title: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DummySSLCommerz({ amount, title, onSuccess, onCancel }: DummySSLCommerzProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate network request
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
          <button 
            onClick={onCancel}
            disabled={loading || success}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck size={28} className="text-blue-200" />
            <h2 className="text-xl font-bold tracking-wide">SSLCOMMERZ</h2>
          </div>
          <p className="text-blue-100 text-sm opacity-80">Secure Checkout (Test Mode)</p>
        </div>

        {/* Body */}
        {success ? (
          <div className="p-10 text-center flex flex-col items-center justify-center min-h-[320px]">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <CheckCircle2 size={48} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
            <p className="text-gray-500">Redirecting to dashboard...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div>
                <p className="text-sm text-gray-500 font-medium">Paying for</p>
                <p className="font-bold text-gray-800">{title}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium">Amount</p>
                <p className="font-bold text-xl text-blue-600">৳{amount}</p>
              </div>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    required
                    maxLength={19}
                    placeholder="4242 4242 4242 4242"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expiry</label>
                  <input 
                    type="text" 
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono"
                    value={expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                      setExpiry(val);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">CVC</label>
                  <input 
                    type="text" 
                    required
                    maxLength={3}
                    placeholder="123"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || cardNumber.length < 19 || expiry.length < 5 || cvc.length < 3}
                className="w-full mt-6 py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:shadow-lg disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Pay Now'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
