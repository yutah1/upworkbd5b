import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';

export const LotteryPage = () => {
  const { user, appUser } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [buying, setBuying] = useState(false);

  const handleBuyTicket = async () => {
    if (!user || !appUser || buying) return;

    if ((appUser.balance || 0) < 20) {
      setMessage('লটারি টিকিট কেনার জন্য আপনার অ্যাকাউন্টে কমপক্ষে ৳২০ থাকতে হবে।');
      return;
    }

    setBuying(true);
    setMessage('');

    try {
      // Deduct 20 tk for ticket
      await updateDoc(doc(db, 'users', user.uid), {
        balance: (appUser.balance || 0) - 20
      });

      // Add ticket to lottery collection
      await addDoc(collection(db, 'lotteryTickets'), {
        userId: user.uid,
        userName: appUser.name,
        createdAt: new Date(),
        ticketNumber: Math.floor(100000 + Math.random() * 900000).toString()
      });

      setMessage('সফলভাবে লটারি টিকিট কেনা হয়েছে!');
    } catch (error) {
      console.error("Error buying ticket:", error);
      setMessage('একটি ত্রুটি হয়েছে।');
      handleFirestoreError(error, OperationType.WRITE, 'lotteryTickets');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-purple-600 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-purple-500 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">লটারি</h1>
      </div>

      <div className="p-4 max-w-md mx-auto mt-8 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-purple-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6">
            <Ticket size={48} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">মেগা লটারি</h2>
          <p className="text-gray-600 mb-8">প্রতিটি টিকিটের মূল্য ৳২০। কিনে নিন আপনার ভাগ্য পরিবর্তনের চাবিকাঠি!</p>

          {message && (
            <div className={`w-full p-4 rounded-xl mb-6 text-sm font-medium ${message.includes('সফলভাবে') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message}
            </div>
          )}

          <button 
            onClick={handleBuyTicket}
            disabled={buying}
            className={`w-full py-4 rounded-xl font-bold text-lg transition ${buying ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200'}`}
          >
            {buying ? 'কেনা হচ্ছে...' : 'টিকিট কিনুন (৳২০)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LotteryPage;
