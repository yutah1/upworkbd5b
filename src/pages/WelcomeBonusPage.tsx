import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, DollarSign } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';

export const WelcomeBonusPage = () => {
  const { user, appUser } = useAuth();
  const navigate = useNavigate();
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'welcomeBonuses'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBonuses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleClaim = async (bonus: any) => {
    if (!user || !appUser) return;

    // Check if already claimed
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      if (userData.claimedWelcomeBonuses && userData.claimedWelcomeBonuses.includes(bonus.id)) {
        setMessage('আপনি ইতিমধ্যে এই বোনাসটি ক্লেম করেছেন।');
        return;
      }

      // Claim bonus
      try {
        await updateDoc(userDocRef, {
          balance: (userData.balance || 0) + bonus.amount,
          claimedWelcomeBonuses: arrayUnion(bonus.id)
        });
        setMessage(`অভিনন্দন! আপনি ৳${bonus.amount} স্বাগতম বোনাস পেয়েছেন।`);
      } catch (error) {
        console.error("Error claiming bonus:", error);
        setMessage('একটি ত্রুটি হয়েছে।');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-teal-600 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-teal-500 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">স্বাগতম বোনাস</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4 mt-4">
        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('অভিনন্দন') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message}
          </div>
        )}

        {bonuses.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500">
            এখনও কোনো স্বাগতম বোনাস পোস্ট করা হয়নি।
          </div>
        ) : (
          bonuses.map(bonus => {
            const isClaimed = appUser?.claimedWelcomeBonuses?.includes(bonus.id);
            return (
              <div key={bonus.id} className={`bg-white p-5 rounded-xl shadow-sm border ${isClaimed ? 'border-gray-200 opacity-70' : 'border-teal-100'} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isClaimed ? 'bg-gray-100 text-gray-400' : 'bg-teal-100 text-teal-600'}`}>
                    <Gift size={24} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg mb-1 ${isClaimed ? 'text-gray-600' : 'text-gray-900'}`}>{bonus.title}</h3>
                    <div className="flex items-center gap-4 text-sm mt-2">
                      <span className={`flex items-center gap-1 font-bold px-2 py-1 rounded-md ${isClaimed ? 'text-gray-500 bg-gray-100' : 'text-emerald-600 bg-emerald-50'}`}>
                        <DollarSign size={16} /> ৳{bonus.amount}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleClaim(bonus)}
                  disabled={isClaimed}
                  className={`${isClaimed ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700'} font-bold py-2 px-6 rounded-lg transition whitespace-nowrap`}
                >
                  {isClaimed ? 'ক্লেম করা হয়েছে' : 'ক্লেম করুন'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WelcomeBonusPage;
