import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Image as ImageIcon, Link as LinkIcon, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

export const JobPostPage = () => {
  const { user, appUser } = useAuth();
  const navigate = useNavigate();
  
  // Post Job Form
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [description, setDescription] = useState('');
  const [taskLink, setTaskLink] = useState('');
  const [price, setPrice] = useState('');
  const [userLimit, setUserLimit] = useState('');
  const [postMessage, setPostMessage] = useState('');

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !appUser) return;

    const priceNum = Number(price);
    const limitNum = Number(userLimit);
    const totalCost = priceNum * limitNum;

    if (totalCost > (appUser.balance || 0)) {
      setPostMessage('আপনার ব্যালেন্স অপর্যাপ্ত।');
      return;
    }

    try {
      await addDoc(collection(db, 'userMicroJobs'), {
        title,
        thumbnail,
        description,
        taskLink,
        price: priceNum,
        limit: limitNum,
        completedCount: 0,
        posterId: user.uid,
        posterName: appUser.name,
        posterReferCode: appUser.referId,
        createdAt: new Date()
      });

      // Deduct balance
      await updateDoc(doc(db, 'users', user.uid), {
        balance: (appUser.balance || 0) - totalCost
      });

      setPostMessage('জব সফলভাবে পোস্ট করা হয়েছে!');
      setTitle('');
      setThumbnail('');
      setDescription('');
      setTaskLink('');
      setPrice('');
      setUserLimit('');
      setTimeout(() => {
        setPostMessage('');
        navigate('/micro-jobs');
      }, 2000);
    } catch (error) {
      console.error("Error posting job:", error);
      setPostMessage('একটি ত্রুটি হয়েছে।');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-blue-500 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">জব পোস্ট করুন</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Plus className="text-blue-600" /> নতুন জব পোস্ট করুন
          </h2>

          {postMessage && (
            <div className={`p-4 rounded-lg mb-6 ${postMessage.includes('সফলভাবে') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {postMessage}
            </div>
          )}

          <form onSubmit={handlePostJob} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">জবের শিরোনাম</label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="যেমন: YouTube Video Watch" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><ImageIcon size={16} /> থাম্বনেইল URL</label>
              <input required type="url" value={thumbnail} onChange={e => setThumbnail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="https://example.com/image.jpg" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">কাজের বিবরণ</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="কাজের বিস্তারিত বিবরণ লিখুন..." />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><LinkIcon size={16} /> কাজের লিংক</label>
              <input required type="url" value={taskLink} onChange={e => setTaskLink(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="https://youtube.com/..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><DollarSign size={16} /> প্রতি কাজে পেমেন্ট (৳)</label>
                <input required type="number" min="0.1" step="0.1" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="যেমন: 2" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Users size={16} /> কতজন করতে পারবে</label>
                <input required type="number" min="1" value={userLimit} onChange={e => setUserLimit(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="যেমন: 100" />
              </div>
            </div>

            {price && userLimit && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                <span className="text-blue-800 font-medium">মোট খরচ হবে:</span>
                <span className="text-xl font-bold text-blue-700">৳{(Number(price) * Number(userLimit)).toFixed(2)}</span>
              </div>
            )}

            <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              জব পোস্ট করুন
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default JobPostPage;
