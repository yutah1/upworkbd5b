import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Wallet, CreditCard } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { useAuth } from './AuthContext';
import { AlertModal } from './components/AlertModal';

export const PremiumBuyPage = () => {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; message: string } | null>(null);
  const showAlert = (message: string) => setAlertDialog({ isOpen: true, message });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'premiumJobs'),
      (snapshot) => {
        const jobsData: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Add a demo job if no jobs exist
        if (jobsData.length === 0) {
          jobsData.push({
            id: 'demo-job-1',
            title: 'Demo: Watch YouTube Video & Subscribe',
            description: '1. Search for "Upwork BD 5" on YouTube.\n2. Watch the latest video for at least 3 minutes.\n3. Subscribe to the channel and like the video.\n4. Take a screenshot as proof and submit.',
            expiredDate: '7 Days',
            price: 50,
            buyerLimit: 100,
            buyersCount: 0,
            isActive: true
          });
        }

        // Only show active packages
        setPackages(jobsData.filter((job: any) => job.isActive));
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'premiumJobs');
      }
    );
    return () => unsubscribe();
  }, []);

  const handlePackageClick = (pkg: any) => {
    if (appUser?.unlockedPackages?.includes(pkg.id)) {
      // Already unlocked
      return;
    }
    setSelectedPackage(pkg);
    setShowPaymentOptions(true);
  };

  const handleBuyWithBalance = () => {
    setShowPaymentOptions(false);
    setShowConfirmPopup(true);
  };

  const handleConfirmBuy = async () => {
    if (!appUser || !selectedPackage) return;
    
    setLoading(true);
    setError('');

    if (appUser.balance < selectedPackage.price) {
      setError('Insufficient balance. Please top up your account.');
      setLoading(false);
      return;
    }

    try {
      const userRef = doc(db, 'users', appUser.uid);
      await updateDoc(userRef, {
        balance: appUser.balance - selectedPackage.price,
        unlockedPackages: arrayUnion(selectedPackage.id)
      });
      
      setShowConfirmPopup(false);
      setSelectedPackage(null);
      // Optionally show a success message or redirect
      showAlert('Package unlocked successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to buy package');
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = () => {
    navigate('/deposit');
  };

  return (
    <>
      <AlertModal 
        isOpen={alertDialog?.isOpen || false}
        onClose={() => setAlertDialog(null)}
        message={alertDialog?.message || ''}
      />
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-emerald-600 text-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-md">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-emerald-500 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">প্রিমিয়াম প্যাকেজ</h1>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 mb-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">আপনার ব্যালেন্স</p>
            <p className="text-2xl font-bold text-emerald-700">{appUser?.balance || 0} টাকা</p>
          </div>
          <button onClick={handleTopup} className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-medium hover:bg-emerald-200 transition">
            ব্যালেন্স যোগ করুন
          </button>
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-4">উপলব্ধ প্যাকেজসমূহ</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {packages.map(pkg => {
            const isUnlocked = appUser?.unlockedPackages?.includes(pkg.id);
            
            return (
              <div 
                key={pkg.id} 
                onClick={() => handlePackageClick(pkg)}
                className={`bg-white p-5 rounded-xl border-2 transition cursor-pointer ${isUnlocked ? 'border-emerald-500 opacity-70' : 'border-gray-200 hover:border-emerald-300 shadow-sm hover:shadow-md'}`}
              >
                <div className="flex gap-4">
                  {pkg.thumbnail && (
                    <img src={pkg.thumbnail} alt={pkg.title} className="w-20 h-20 object-cover rounded-lg border border-gray-100 flex-shrink-0" referrerPolicy="no-referrer" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">{pkg.title}</h3>
                      {isUnlocked ? (
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shrink-0 ml-2">
                          <CheckCircle size={12} /> আনলক করা হয়েছে
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full shrink-0 ml-2">
                          {pkg.price} টাকা
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mb-3">
                      <span>⏱ {pkg.expiredDate || pkg.duration}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedPackage(pkg); }}
                      className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition text-sm"
                    >
                      কাজের তথ্য
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {packages.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              এই মুহূর্তে কোনো প্রিমিয়াম প্যাকেজ উপলব্ধ নেই।
            </div>
          )}
        </div>
      </div>

      {/* Job Info Modal */}
      {selectedPackage && !showPaymentOptions && !showConfirmPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-xl font-bold text-gray-900">কাজের তথ্য</h3>
              <button onClick={() => setSelectedPackage(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedPackage.thumbnail && (
                <img src={selectedPackage.thumbnail} alt={selectedPackage.title} className="w-full h-40 object-cover rounded-lg border border-gray-200" referrerPolicy="no-referrer" />
              )}
              <div>
                <h4 className="font-bold text-lg text-gray-900">{selectedPackage.title}</h4>
                <div className="flex gap-3 mt-2 text-xs font-medium">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">⏱ {selectedPackage.expiredDate || selectedPackage.duration}</span>
                  <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded">মূল্য: {selectedPackage.price} টাকা</span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded">ক্রেতা: {selectedPackage.buyersCount || 0} / {selectedPackage.buyerLimit || '∞'}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">বিবরণ</p>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedPackage.description}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <button 
                onClick={() => {
                  if (appUser?.unlockedPackages?.includes(selectedPackage.id)) {
                    navigate('/premium-jobs');
                  } else {
                    setShowPaymentOptions(true);
                  }
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition"
              >
                {appUser?.unlockedPackages?.includes(selectedPackage.id) ? 'প্রিমিয়াম জবস এ যান' : 'প্যাকেজ আনলক করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Options Modal */}
      {showPaymentOptions && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">প্যাকেজ কিনুন</h3>
              <button onClick={() => setShowPaymentOptions(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="font-medium text-gray-800">{selectedPackage.title}</p>
              <p className="text-emerald-600 font-bold text-lg mt-1">{selectedPackage.price} টাকা</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleBuyWithBalance}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition"
              >
                <Wallet size={20} />
                মেইন ব্যালেন্স দিয়ে কিনুন
              </button>
              <button 
                onClick={handleTopup}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition"
              >
                <CreditCard size={20} />
                ব্যালেন্স যোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmPopup && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">ক্রয় নিশ্চিত করুন</h3>
            <p className="text-gray-600 mb-6">
              আপনি কি নিশ্চিত যে আপনি আপনার মেইন ব্যালেন্স থেকে <strong>{selectedPackage.price} টাকা</strong> দিয়ে <strong>{selectedPackage.title}</strong> কিনতে চান?
            </p>
            
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="flex gap-3">
              <button 
                onClick={() => { setShowConfirmPopup(false); navigate('/'); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-lg transition"
              >
                না, বাতিল করুন
              </button>
              <button 
                onClick={handleConfirmBuy}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'প্রক্রিয়াধীন...' : 'হ্যাঁ, কিনুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};
