import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Calendar } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';

export const DailyBonusPage = () => {
  const { user, appUser } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [canClaim, setCanClaim] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(5);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'dailyBonus'), (docSnap) => {
      if (docSnap.exists()) {
        setBonusAmount(docSnap.data().amount || 5);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/dailyBonus');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (appUser) {
      const lastClaimed = appUser.lastDailyBonusDate;
      const today = new Date().toISOString().split('T')[0];
      setCanClaim(lastClaimed !== today);
    }
  }, [appUser]);

  const handleClaim = async () => {
    if (!user || !appUser || !canClaim) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: (appUser.balance || 0) + bonusAmount,
        lastDailyBonusDate: today
      });
      setMessage(`অভিনন্দন! আপনি ৳${bonusAmount} ডেইলি বোনাস পেয়েছেন।`);
      setCanClaim(false);
    } catch (error) {
      console.error("Error claiming daily bonus:", error);
      setMessage('একটি ত্রুটি হয়েছে।');
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-amber-500 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-amber-400 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">ডেইলি বোনাস</h1>
      </div>

      <div className="p-4 max-w-md mx-auto mt-8 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6">
            <Calendar size={48} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">আজকের বোনাস</h2>
          <p className="text-gray-600 mb-8">প্রতিদিন লগইন করে বোনাস সংগ্রহ করুন!</p>

          {message && (
            <div className={`w-full p-4 rounded-xl mb-6 text-sm font-medium ${message.includes('অভিনন্দন') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message}
            </div>
          )}

          <button 
            onClick={handleClaim}
            disabled={!canClaim}
            className={`w-full py-4 rounded-xl font-bold text-lg transition ${canClaim ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            {canClaim ? 'ক্লেম করুন' : 'আজকের বোনাস ক্লেম করা হয়েছে'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyBonusPage;
