import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, DollarSign, Users } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export const LeadershipSalaryPage = () => {
  const navigate = useNavigate();
  const [salaries, setSalaries] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'leadershipSalaries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSalaries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leadershipSalaries');
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-rose-600 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-rose-500 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">লিডারশিপ বেতন</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4 mt-4">
        {salaries.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500">
            এখনও কোনো লিডারশিপ বেতন পোস্ট করা হয়নি।
          </div>
        ) : (
          salaries.map(salary => (
            <div key={salary.id} className="bg-white p-5 rounded-xl shadow-sm border border-rose-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
                  <Award size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{salary.title}</h3>
                  <div className="flex items-center gap-4 text-sm mt-2">
                    <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">
                      <DollarSign size={16} /> ৳{salary.amount}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                      <Users size={16} /> টার্গেট: {salary.target}
                    </span>
                  </div>
                </div>
              </div>
              <button className="bg-rose-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-rose-700 transition whitespace-nowrap">
                ক্লেম করুন
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
