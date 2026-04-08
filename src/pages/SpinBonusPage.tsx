import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export const SpinBonusPage = () => {
  const { user, appUser } = useAuth();
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('');
  const [rotation, setRotation] = useState(0);
  const [canSpin, setCanSpin] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (appUser) {
      checkSpinEligibility();
    }
  }, [appUser]);

  const checkSpinEligibility = () => {
    if (!appUser) return;
    
    const lastSpinTime = appUser.lastSpinTime ? new Date(appUser.lastSpinTime) : null;
    const now = new Date();

    if (!lastSpinTime) {
      // First time spin (free spin on register)
      setCanSpin(true);
      setTimeRemaining('');
    } else {
      const timeDiff = now.getTime() - lastSpinTime.getTime();
      const hours24 = 24 * 60 * 60 * 1000;
      
      if (timeDiff >= hours24) {
        setCanSpin(true);
        setTimeRemaining('');
      } else {
        setCanSpin(false);
        const remaining = hours24 - timeDiff;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours} ঘণ্টা ${minutes} মিনিট পর আবার স্পিন করতে পারবেন`);
      }
    }
  };

  const handleSpin = async () => {
    if (!user || !appUser || spinning || !canSpin) return;

    setSpinning(true);
    setMessage('');

    const newRotation = rotation + 1440 + Math.floor(Math.random() * 360); // Spin 4 times + random
    setRotation(newRotation);

    setTimeout(async () => {
      const winAmount = 1; // Always win 1 Taka
      
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          balance: (appUser.balance || 0) + winAmount,
          lastSpinTime: new Date().toISOString()
        });
        setMessage(`অভিনন্দন! আপনি ৳${winAmount} জিতেছেন!`);
        setCanSpin(false);
        setTimeRemaining('24 ঘণ্টা 0 মিনিট পর আবার স্পিন করতে পারবেন');
      } catch (error) {
        console.error("Error adding win balance:", error);
        setMessage('একটি ত্রুটি হয়েছে।');
      }
      setSpinning(false);
    }, 3000); // Wait for spin animation
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-indigo-600 text-white p-4 sticky top-0 z-40 shadow-md flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-indigo-500 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">স্পিন বোনাস</h1>
      </div>

      <div className="p-4 max-w-md mx-auto mt-8 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">লাকি স্পিন</h2>
          <p className="text-gray-600 mb-8">প্রতি ২৪ ঘণ্টায় একবার স্পিন করুন।</p>

          <div className="relative w-64 h-64 mb-8">
            <div 
              className="w-full h-full rounded-full border-8 border-indigo-600 flex items-center justify-center bg-indigo-50 transition-transform duration-3000 ease-out overflow-hidden"
              style={{ transform: `rotate(${rotation}deg)`, transitionDuration: '3s' }}
            >
              {/* Visual segments for the wheel */}
              <div className="absolute w-full h-full">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                  <div 
                    key={i}
                    className="absolute w-1/2 h-full origin-right border-r border-indigo-200"
                    style={{ transform: `rotate(${deg}deg)` }}
                  >
                    <span className="absolute top-4 right-4 text-xs font-bold text-indigo-800 transform rotate-90">
                      ৳{Math.floor(Math.random() * 50) + 1}
                    </span>
                  </div>
                ))}
              </div>
              <RefreshCw size={48} className="text-indigo-400 z-10 bg-white rounded-full p-2" />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-0 h-0 border-l-8 border-r-8 border-t-[16px] border-l-transparent border-r-transparent border-t-red-500 z-20"></div>
          </div>

          {message && (
            <div className={`w-full p-4 rounded-xl mb-4 text-sm font-medium ${message.includes('অভিনন্দন') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message}
            </div>
          )}

          {!canSpin && timeRemaining && (
            <div className="w-full p-3 rounded-xl mb-6 text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200">
              {timeRemaining}
            </div>
          )}

          <button 
            onClick={handleSpin}
            disabled={spinning || !canSpin}
            className={`w-full py-4 rounded-xl font-bold text-lg transition ${spinning || !canSpin ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
          >
            {spinning ? 'স্পিন হচ্ছে...' : (!canSpin ? 'স্পিন লকড' : 'স্পিন করুন (ফ্রি)')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpinBonusPage;
