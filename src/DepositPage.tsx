import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import { collection, addDoc, doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { useAuth } from './AuthContext';

export const DepositPage = () => {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bKash');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<any>({ 
    bKash: 'Not set', bKashType: 'Personal',
    nagad: 'Not set', nagadType: 'Personal',
    rocket: 'Not set', rocketType: 'Personal',
    upay: 'Not set', upayType: 'Personal'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'paymentMethods'), (docSnap) => {
      if (docSnap.exists()) {
        setPaymentMethods(docSnap.data() as any);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/paymentMethods');
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser) return;
    
    if (Number(amount) < 50) {
      setError('Minimum deposit amount is 50 BDT');
      return;
    }
    if (!senderNumber) {
      setError('Please enter the sender number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'deposits'), {
        userId: appUser.uid,
        userName: appUser.name,
        userEmail: appUser.email,
        amount: Number(amount),
        method,
        senderNumber,
        transactionId,
        status: 'pending',
        createdAt: new Date()
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit deposit request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">রিকোয়েস্ট জমা হয়েছে!</h2>
          <p className="text-gray-600 mb-6">
            আপনার {amount} টাকার ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে। অনুগ্রহ করে অ্যাডমিন অনুমোদনের জন্য অপেক্ষা করুন।
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl hover:bg-emerald-700 transition"
          >
            হোমে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-emerald-600 text-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-md">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-emerald-500 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">ব্যালেন্স যোগ করুন</h1>
      </div>

      <div className="p-4 max-w-md mx-auto mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-2">পেমেন্ট নির্দেশিকা</h3>
            <p className="text-sm text-emerald-700 mb-1">১. আমাদের অফিসিয়াল নম্বরে টাকা পাঠান।</p>
            <p className="text-sm text-emerald-700 mb-1">২. ট্রানজেকশন আইডি কপি করুন।</p>
            <p className="text-sm text-emerald-700">৩. ব্যালেন্স পেতে নিচের ফর্মটি পূরণ করুন।</p>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center bg-white p-2 rounded text-sm">
                <span className="font-medium text-gray-600">বিকাশ ({paymentMethods.bKashType || 'Personal'})</span>
                <span className="font-bold text-gray-900">{paymentMethods.bKash}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-2 rounded text-sm">
                <span className="font-medium text-gray-600">নগদ ({paymentMethods.nagadType || 'Personal'})</span>
                <span className="font-bold text-gray-900">{paymentMethods.nagad}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-2 rounded text-sm">
                <span className="font-medium text-gray-600">রকেট ({paymentMethods.rocketType || 'Personal'})</span>
                <span className="font-bold text-gray-900">{paymentMethods.rocket}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-2 rounded text-sm">
                <span className="font-medium text-gray-600">উপায় ({paymentMethods.upayType || 'Personal'})</span>
                <span className="font-bold text-gray-900">{paymentMethods.upay}</span>
              </div>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">পেমেন্ট মেথড</label>
              <select 
                value={method} 
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-emerald-500"
              >
                <option value="bKash">বিকাশ</option>
                <option value="Nagad">নগদ</option>
                <option value="Rocket">রকেট</option>
                <option value="Upay">উপায়</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ (টাকা)</label>
              <input 
                type="number" 
                required 
                min="50"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-emerald-500"
                placeholder="পরিমাণ লিখুন (সর্বনিম্ন ৫০)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">প্রেরকের নম্বর</label>
              <input 
                type="text" 
                required 
                value={senderNumber} 
                onChange={(e) => setSenderNumber(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-emerald-500"
                placeholder="যেমন: 017XXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ট্রানজেকশন আইডি</label>
              <input 
                type="text" 
                required 
                value={transactionId} 
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-emerald-500"
                placeholder="যেমন: 8HJK9X2P"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              {loading ? 'জমা দেওয়া হচ্ছে...' : 'রিকোয়েস্ট জমা দিন'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
