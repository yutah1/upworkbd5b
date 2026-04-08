import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Lock, Copy, CheckCircle, Share2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db, auth } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updatePassword, updateEmail, updateProfile } from 'firebase/auth';

export const ProfilePage = () => {
  const { user, appUser } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(appUser?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(appUser?.phone || '');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [copied, setCopied] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Update Firestore data
      if (appUser) {
        await updateDoc(doc(db, 'users', appUser.uid), {
          name,
          phone
        });
      }
      
      // Update Auth Profile (Name)
      if (user && name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }
      
      // Update Email
      if (user && email !== user.email) {
        await updateEmail(user, email);
        await updateDoc(doc(db, 'users', appUser!.uid), { email });
      }
      
      // Update Password
      if (user && password) {
        await updatePassword(user, password);
      }
      
      setMessage({ text: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!', type: 'success' });
      setPassword(''); // Clear password field after successful update
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        setMessage({ text: 'নিরাপত্তার কারণে ইমেইল বা পাসওয়ার্ড পরিবর্তন করতে আপনাকে পুনরায় লগইন করতে হবে।', type: 'error' });
      } else {
        setMessage({ text: 'একটি ত্রুটি হয়েছে: ' + error.message, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const referLink = `https://upworkbd5.com/ref/${appUser?.referId || ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-emerald-600 text-white p-4 sticky top-0 z-20 shadow-md flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-emerald-500 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">আমার প্রোফাইল</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto mt-4">
        {/* Refer Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Share2 size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">আপনার রেফার কোড ও লিংক</h2>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
            <p className="text-sm text-gray-500 mb-1">রেফার কোড</p>
            <p className="text-xl font-black text-emerald-600 tracking-wider">{appUser?.referId}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
              {referLink}
            </div>
            <button 
              onClick={handleCopy}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition flex items-center gap-2 font-medium"
            >
              {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
              {copied ? 'কপি হয়েছে' : 'কপি করুন'}
            </button>
          </div>
        </div>

        {/* Profile Update Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <User size={20} className="text-emerald-600" /> প্রোফাইল আপডেট করুন
          </h2>

          {message.text && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">আপনার নাম</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="আপনার নাম"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল ঠিকানা</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="ইমেইল ঠিকানা"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নম্বর</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Phone size={18} />
                </div>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="ফোন নম্বর"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">নতুন পাসওয়ার্ড (পরিবর্তন করতে চাইলে)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="নতুন পাসওয়ার্ড লিখুন"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">পাসওয়ার্ড পরিবর্তন না করতে চাইলে ফাঁকা রাখুন।</p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-200 disabled:opacity-70"
            >
              {loading ? 'আপডেট হচ্ছে...' : 'প্রোফাইল আপডেট করুন'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
