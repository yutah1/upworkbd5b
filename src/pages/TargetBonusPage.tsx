import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, DollarSign, Users } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export const TargetBonusPage = () => {
  const navigate = useNavigate();
  const [bonuses, setBonuses] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'targetBonuses'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBonuses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'targetBonuses');
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-purple-600 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-purple-500 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">টার্গেট বোনাস</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4 mt-4">
        {bonuses.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500">
            এখনও কোনো টার্গেট বোনাস পোস্ট করা হয়নি।
          </div>
        ) : (
          bonuses.map(bonus => (
            <div key={bonus.id} className="bg-white p-5 rounded-xl shadow-sm border border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{bonus.title}</h3>
                  <div className="flex items-center gap-4 text-sm mt-2">
                    <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">
                      <DollarSign size={16} /> ৳{bonus.amount}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                      <Users size={16} /> টার্গেট: {bonus.referralsNeeded}
                    </span>
                  </div>
                </div>
              </div>
              <button className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition whitespace-nowrap">
                ক্লেম করুন
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
