import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, DollarSign, Send } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';

export const GmailSellPage = () => {
  const { user, appUser } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [gmailId, setGmailId] = useState('');
  const [password, setPassword] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'gmailSellPosts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gmailSellPosts');
    });
    return () => unsubscribe();
  }, []);

  const handleSubmitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !appUser || !selectedPost) return;

    try {
      await addDoc(collection(db, 'gmailSellSubmissions'), {
        postId: selectedPost.id,
        postTitle: selectedPost.title,
        userId: user.uid,
        userName: appUser.name,
        gmailId,
        password,
        status: 'pending',
        createdAt: new Date()
      });

      setSubmitMessage('অ্যাকাউন্ট সফলভাবে জমা দেওয়া হয়েছে!');
      setGmailId('');
      setPassword('');
      setTimeout(() => {
        setSubmitMessage('');
        setSelectedPost(null);
      }, 3000);
    } catch (error) {
      console.error("Error submitting account:", error);
      setSubmitMessage('একটি ত্রুটি হয়েছে।');
      handleFirestoreError(error, OperationType.WRITE, 'gmailSellSubmissions');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-red-500 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-red-400 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">জিমেইল সেল</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4 mt-4">
        {posts.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500">
            এখনও কোনো জিমেইল সেল পোস্ট করা হয়নি।
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white p-5 rounded-xl shadow-sm border border-red-100">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{post.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md text-sm">
                      <DollarSign size={16} /> ৳{post.amount}
                    </span>
                    <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-sm">
                      পাসওয়ার্ড: {post.requiredPassword}
                    </span>
                  </div>
                </div>
              </div>

              {selectedPost?.id === post.id ? (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in">
                  <h4 className="font-bold text-gray-800 mb-3">অ্যাকাউন্ট জমা দিন</h4>
                  {submitMessage && (
                    <div className={`p-3 rounded-lg text-sm mb-3 ${submitMessage.includes('সফলভাবে') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {submitMessage}
                    </div>
                  )}
                  <form onSubmit={handleSubmitAccount} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">জিমেইল আইডি</label>
                      <input required type="email" value={gmailId} onChange={e => setGmailId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="example@gmail.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
                      <input required type="text" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                      <p className="text-xs text-red-500 mt-1">অবশ্যই '{post.requiredPassword}' পাসওয়ার্ড ব্যবহার করতে হবে।</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setSelectedPost(null)} className="flex-1 bg-gray-200 text-gray-800 font-medium py-2 rounded-md hover:bg-gray-300 transition">বাতিল</button>
                      <button type="submit" className="flex-1 bg-red-500 text-white font-medium py-2 rounded-md hover:bg-red-600 transition flex items-center justify-center gap-2">
                        <Send size={16} /> জমা দিন
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button 
                  onClick={() => setSelectedPost(post)}
                  className="w-full mt-2 bg-red-50 text-red-700 font-bold py-2 rounded-lg hover:bg-red-100 transition border border-red-200"
                >
                  অ্যাকাউন্ট সেল করুন
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
