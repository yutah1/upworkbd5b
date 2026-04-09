import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, ArrowDownCircle, ArrowUpCircle, Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { AlertModal } from '../components/AlertModal';

export const WalletPage = () => {
  const { user, appUser } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [income24h, setIncome24h] = useState<number | null>(null);
  const [income7d, setIncome7d] = useState<number | null>(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; message: string } | null>(null);
  const showAlert = (message: string) => setAlertDialog({ isOpen: true, message });

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState({
    bkash: '',
    nagad: '',
    rocket: '',
    upay: '',
    binance: ''
  });
  const [isMethodsLocked, setIsMethodsLocked] = useState(false);
  const [isEditingMethods, setIsEditingMethods] = useState(false);
  const [selectedSetupMethod, setSelectedSetupMethod] = useState<string | null>(null);
  const [setupNumber, setSetupNumber] = useState('');
  const [setupName, setSetupName] = useState('');

  // Withdraw form
  const [withdrawMethod, setWithdrawMethod] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMessage, setWithdrawMessage] = useState('');

  useEffect(() => {
    if (appUser) {
      setBalance(appUser.balance || 0);
      if (appUser.paymentMethods) {
        setPaymentMethods(appUser.paymentMethods);
        setIsMethodsLocked(appUser.paymentMethodsLocked || false);
      }
    }
  }, [appUser]);

  const fetchIncome = async (days: number) => {
    if (!user) return 0;
    // Mocking income for now since we don't have a transactions collection fully set up for all earnings
    // In a real app, we would query the transactions collection
    const mockIncome = Math.floor(Math.random() * 500) + (days * 100);
    return mockIncome;
  };

  const handleShow24h = async () => {
    const amount = await fetchIncome(1);
    setIncome24h(amount);
  };

  const handleShow7d = async () => {
    const amount = await fetchIncome(7);
    setIncome7d(amount);
  };

  const handleSaveMethods = async () => {
    if (!user || !selectedSetupMethod) return;
    
    if (!setupNumber.trim() || !setupName.trim()) {
      showAlert('অনুগ্রহ করে নম্বর এবং নাম প্রদান করুন।');
      return;
    }

    const newPaymentMethods = {
      [selectedSetupMethod]: {
        number: setupNumber,
        name: setupName
      }
    };

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        paymentMethods: newPaymentMethods,
        paymentMethodsLocked: true
      });
      setPaymentMethods(newPaymentMethods as any);
      setIsMethodsLocked(true);
      setIsEditingMethods(false);
      showAlert('পেমেন্ট মেথড সফলভাবে সেভ হয়েছে। এটি আর পরিবর্তন করা যাবে না।');
    } catch (error) {
      console.error("Error saving methods:", error);
      showAlert('একটি ত্রুটি হয়েছে।');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !appUser) return;
    
    const amount = Number(withdrawAmount);
    if (amount <= 0 || amount > balance) {
      setWithdrawMessage('অপর্যাপ্ত ব্যালেন্স বা ভুল পরিমাণ।');
      return;
    }
    if (!withdrawMethod) {
      setWithdrawMessage('পেমেন্ট মেথড নির্বাচন করুন।');
      return;
    }

    const fee = amount * 0.05;
    const netAmount = amount - fee;

    try {
      const selectedMethodData = paymentMethods[withdrawMethod as keyof typeof paymentMethods];
      const methodNumber = typeof selectedMethodData === 'object' ? (selectedMethodData as any).number : selectedMethodData;
      const accountName = typeof selectedMethodData === 'object' ? (selectedMethodData as any).name : '';

      await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        userName: appUser.name,
        amount: amount,
        fee: fee,
        netAmount: netAmount,
        method: withdrawMethod,
        number: methodNumber,
        accountName: accountName,
        status: 'pending',
        createdAt: new Date()
      });

      // Deduct balance
      await updateDoc(doc(db, 'users', user.uid), {
        balance: balance - amount
      });

      setBalance(prev => prev - amount);
      setWithdrawMessage('উত্তোলনের অনুরোধ সফলভাবে পাঠানো হয়েছে।');
      setWithdrawAmount('');
      setTimeout(() => setWithdrawMessage(''), 3000);
    } catch (error) {
      console.error("Withdrawal error:", error);
      setWithdrawMessage('একটি ত্রুটি হয়েছে।');
      handleFirestoreError(error, OperationType.WRITE, 'withdrawals');
    }
  };



  return (
    <>
      <AlertModal 
        isOpen={alertDialog?.isOpen || false}
        onClose={() => setAlertDialog(null)}
        message={alertDialog?.message || ''}
      />
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-emerald-600 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-emerald-500 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">আমার ওয়ালেট</h1>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6 mt-4">
        {/* Balance Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <div className="relative z-10">
            <p className="text-gray-500 font-medium mb-2">মোট ব্যালেন্স</p>
            <h2 className="text-4xl font-bold text-emerald-600 mb-6">৳ {balance.toFixed(2)}</h2>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => navigate('/deposit')}
                className="flex-1 bg-emerald-50 text-emerald-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-100 transition"
              >
                <ArrowDownCircle size={20} /> ডিপোজিট
              </button>
              <button 
                onClick={() => { setShowWithdraw(!showWithdraw); }}
                className="flex-1 bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition"
              >
                <ArrowUpCircle size={20} /> উত্তোলন
              </button>
            </div>
          </div>
        </div>

        {/* Income Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <Clock className="mx-auto text-blue-500 mb-2" size={24} />
            <p className="text-xs text-gray-500 mb-2">গত ২৪ ঘন্টার আয়</p>
            {income24h !== null ? (
              <p className="text-lg font-bold text-gray-800">৳ {income24h}</p>
            ) : (
              <button onClick={handleShow24h} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">দেখুন</button>
            )}
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <Calendar className="mx-auto text-purple-500 mb-2" size={24} />
            <p className="text-xs text-gray-500 mb-2">গত ৭ দিনের আয়</p>
            {income7d !== null ? (
              <p className="text-lg font-bold text-gray-800">৳ {income7d}</p>
            ) : (
              <button onClick={handleShow7d} className="text-sm bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-medium">দেখুন</button>
            )}
          </div>
        </div>

        {/* Withdraw Section */}
        {showWithdraw && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Wallet className="text-emerald-500" /> ব্যালেন্স উত্তোলন
            </h3>

            {/* Payment Methods Setup */}
            {(!isMethodsLocked || isEditingMethods) ? (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertCircle size={18} /> পেমেন্ট মেথড সেটআপ
                </h4>
                <p className="text-xs text-yellow-700 mb-4">সতর্কতা: একবার পেমেন্ট মেথড সেভ করলে আর পরিবর্তন করা যাবে না।</p>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {['bkash', 'nagad', 'rocket', 'upay', 'binance'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setSelectedSetupMethod(method)}
                        className={`py-2 px-2 rounded-lg border capitalize text-xs font-medium transition ${selectedSetupMethod === method ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  {selectedSetupMethod && (
                    <div className="space-y-3 bg-white p-3 rounded-lg border border-yellow-200">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">{selectedSetupMethod} Number / Address</label>
                        <input 
                          type="text" 
                          value={setupNumber} 
                          onChange={(e) => setSetupNumber(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder={`${selectedSetupMethod} নম্বর/অ্যাড্রেস`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Account Name</label>
                        <input 
                          type="text" 
                          value={setupName} 
                          onChange={(e) => setSetupName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="অ্যাকাউন্টের নাম"
                        />
                      </div>
                      <button 
                        onClick={handleSaveMethods}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg mt-2 transition"
                      >
                        সেভ করুন
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-xs flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>উত্তোলনের সময় কোম্পানি ৫% চার্জ কাটবে।</p>
                </div>

                {withdrawMessage && (
                  <div className={`p-3 rounded-lg text-sm ${withdrawMessage.includes('সফলভাবে') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {withdrawMessage}
                  </div>
                )}

                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">পেমেন্ট মেথড নির্বাচন করুন</label>
                    <select 
                      required
                      value={withdrawMethod}
                      onChange={(e) => setWithdrawMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">নির্বাচন করুন</option>
                      {Object.entries(paymentMethods).map(([key, val]) => {
                        if (!val) return null;
                        const displayVal = typeof val === 'object' ? (val as any).number : val;
                        return <option key={key} value={key} className="capitalize">{key} ({displayVal})</option>;
                      })}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ (৳)</label>
                    <input 
                      required
                      type="number" 
                      min="10"
                      max={balance}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="কত টাকা তুলতে চান?"
                    />
                    {withdrawAmount && (
                      <p className="text-xs text-gray-500 mt-1">
                        ৫% চার্জ বাদে পাবেন: ৳ {(Number(withdrawAmount) * 0.95).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition"
                  >
                    উত্তোলন করুন
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};
