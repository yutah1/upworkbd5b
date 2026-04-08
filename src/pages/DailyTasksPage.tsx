import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export const DailyTasksPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'dailyTasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-emerald-600 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-emerald-500 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">ডেইলি টাস্ক</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4 mt-4">
        {tasks.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500">
            এখনও কোনো ডেইলি টাস্ক পোস্ট করা হয়নি।
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{task.title}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">
                    <DollarSign size={16} /> ৳{task.amount}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                    <Clock size={16} /> {task.duration}
                  </span>
                </div>
              </div>
              <button className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700 transition whitespace-nowrap">
                কাজ শুরু করুন
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
