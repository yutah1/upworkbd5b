import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export const MicroJobsPage = () => {
  const { user, appUser } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'userMicroJobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobsData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-blue-500 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">ছোট কাজ</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500">
              এখনও কোনো জব পোস্ট করা হয়নি।
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {job.thumbnail && (
                  <img src={job.thumbnail} alt={job.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                  
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-1 text-emerald-600 font-bold">
                      <DollarSign size={16} /> ৳{job.price}
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <Users size={16} /> {job.completedCount || 0}/{job.limit}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                    <p className="text-xs text-gray-500 mb-1">পোস্টকারীর রেফার কোড:</p>
                    <p className="font-mono font-bold text-gray-800">{job.posterReferCode}</p>
                  </div>

                  <a 
                    href={job.taskLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    কাজ শুরু করুন
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MicroJobsPage;
