import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';

export const VideoEarnPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [watchedTasks, setWatchedTasks] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'videoEarnTasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videoEarnTasks');
    });
    return () => unsubscribe();
  }, []);

  const handleWatchVideo = (taskId: string, videoUrl: string) => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
    setWatchedTasks(prev => ({ ...prev, [taskId]: true }));
  };

  const handleSubmitTask = async (task: any) => {
    if (!auth.currentUser) {
      alert('অনুগ্রহ করে লগইন করুন');
      return;
    }

    setSubmitting(task.id);
    try {
      await addDoc(collection(db, 'videoEarnSubmissions'), {
        taskId: task.id,
        taskTitle: task.title,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Unknown User',
        userEmail: auth.currentUser.email,
        amount: task.reward,
        status: 'pending',
        createdAt: new Date()
      });
      alert('আপনার কাজ সফলভাবে জমা দেওয়া হয়েছে! অ্যাডমিন অ্যাপ্রুভ করলে ব্যালেন্স যোগ হবে।');
      // Optionally hide the task or show a success state
      setWatchedTasks(prev => ({ ...prev, [task.id]: 'submitted' }));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'videoEarnSubmissions');
      alert('কাজ জমা দিতে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-orange-500 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-orange-400 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">ভিডিও আর্ন</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4 mt-4">
        {tasks.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500">
            এখনও কোনো ভিডিও টাস্ক পোস্ট করা হয়নি।
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
              {task.videoUrl && (
                <div className="aspect-video w-full bg-gray-900 relative">
                  <iframe 
                    src={task.videoUrl} 
                    title={task.title}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{task.title}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-md">
                      <DollarSign size={16} /> ৳{task.reward}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                      <Clock size={16} /> {task.duration} সেকেন্ড
                    </span>
                  </div>
                </div>
                
                {watchedTasks[task.id] === 'submitted' ? (
                  <button disabled className="bg-green-100 text-green-700 font-bold py-2 px-6 rounded-lg whitespace-nowrap flex items-center gap-2">
                    <CheckCircle size={20} /> জমা দেওয়া হয়েছে
                  </button>
                ) : watchedTasks[task.id] ? (
                  <button 
                    onClick={() => handleSubmitTask(task)}
                    disabled={submitting === task.id}
                    className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting === task.id ? 'জমা হচ্ছে...' : 'সাবমিট করুন'}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleWatchVideo(task.id, task.videoUrl)}
                    className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition whitespace-nowrap flex items-center gap-2"
                  >
                    <PlayCircle size={20} /> ভিডিও দেখুন
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
