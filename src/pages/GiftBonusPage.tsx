import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, DollarSign } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';

export const GiftBonusPage = () => {
  const { user, appUser } = useAuth();
  const navigate = useNavigate();
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [redeemCode, setRedeemCode] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'giftBonuses'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBonuses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'giftBonuses');
    });
    return () => unsubscribe();
  }, []);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !appUser) return;

    if (!redeemCode.trim()) {
      setMessage('দয়া করে রিডিম কোড দিন।');
      return;
    }

    const bonus = bonuses.find(b => b.redeemCode === redeemCode.trim());
    if (!bonus) {
      setMessage('ভুল রিডিম কোড।');
      return;
    }

    try {
      // Check if already claimed
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.claimedGiftBonuses && userData.claimedGiftBonuses.includes(bonus.id)) {
          setMessage('আপনি ইতিমধ্যে এই বোনাসটি ক্লেম করেছেন।');
          return;
        }

        // Claim bonus
        await updateDoc(userDocRef, {
          balance: (userData.balance || 0) + bonus.amount,
          claimedGiftBonuses: arrayUnion(bonus.id)
        });
        setMessage(`অভিনন্দন! আপনি ৳${bonus.amount} বোনাস পেয়েছেন।`);
        setRedeemCode('');
      }
    } catch (error) {
      console.error("Error claiming bonus:", error);
      setMessage('একটি ত্রুটি হয়েছে।');
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-pink-600 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-pink-500 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">গিফট বোনাস</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6 mt-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Gift className="text-pink-600" /> রিডিম কোড ব্যবহার করুন
          </h2>
          {message && (
            <div className={`p-3 rounded-lg text-sm mb-4 ${message.includes('অভিনন্দন') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleRedeem} className="flex gap-2">
            <input 
              type="text" 
              value={redeemCode} 
              onChange={e => setRedeemCode(e.target.value)} 
              placeholder="রিডিম কোড লিখুন..." 
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
            />
            <button type="submit" className="bg-pink-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-pink-700 transition">
              ক্লেম
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-800">ক্লেম হিস্ট্রি</h3>
          {bonuses.filter(b => appUser?.claimedGiftBonuses?.includes(b.id)).length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500">
              আপনি এখনও কোনো গিফট বোনাস ক্লেম করেননি।
            </div>
          ) : (
            bonuses.filter(b => appUser?.claimedGiftBonuses?.includes(b.id)).map(bonus => (
              <div key={bonus.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-gray-100 text-gray-400">
                    <Gift size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-gray-600">{bonus.title}</h3>
                    <div className="flex items-center gap-4 text-sm mt-2">
                      <span className="flex items-center gap-1 font-bold px-2 py-1 rounded-md text-gray-500 bg-gray-100">
                        <DollarSign size={16} /> ৳{bonus.amount}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">ক্লেম করা হয়েছে</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftBonusPage;
