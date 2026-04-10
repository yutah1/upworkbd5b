import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Home, CreditCard, Wallet, HelpCircle, MessageCircle, Facebook, Send, X, Briefcase, Search, Target, ShoppingCart, Gift, PlaySquare, Calendar, Sparkles, Banknote, Crown, Ticket, Aperture, Smartphone, Users, Store, LifeBuoy, ArrowLeft, ArrowRight, Bot, Monitor, PartyPopper, ShoppingBag, Youtube, Eye, EyeOff } from 'lucide-react';
import { AuthProvider, useAuth } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { collection, query, orderBy, onSnapshot, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { useGridStore, defaultOptions } from './store/useGridStore';
import { AdminPanel } from './AdminPanel';
import PremiumJobsPage from './pages/PremiumJobsPage';
import { PremiumBuyPage } from './PremiumBuyPage';
import { DepositPage } from './DepositPage';
import { WalletPage } from './pages/WalletPage';
import { MicroJobsPage } from './pages/MicroJobsPage';
import { JobPostPage } from './pages/JobPostPage';
import { DailyTasksPage } from './pages/DailyTasksPage';
import { VideoEarnPage } from './pages/VideoEarnPage';
import { FacebookSellPage } from './pages/FacebookSellPage';
import { GmailSellPage } from './pages/GmailSellPage';
import { TargetBonusPage } from './pages/TargetBonusPage';
import { MonthlySalaryPage } from './pages/MonthlySalaryPage';
import { LeadershipSalaryPage } from './pages/LeadershipSalaryPage';
import { GiftBonusPage } from './pages/GiftBonusPage';
import { WelcomeBonusPage } from './pages/WelcomeBonusPage';
import { DailyBonusPage } from './pages/DailyBonusPage';
import { SpinBonusPage } from './pages/SpinBonusPage';
import { LotteryPage } from './pages/LotteryPage';
import { TeamPage } from './pages/TeamPage';
import { ProfilePage } from './pages/ProfilePage';
import { AlertModal } from './components/AlertModal';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Header = ({ onMenuClick, onNotifClick }: { onMenuClick: () => void, onNotifClick: () => void }) => {
  const navigate = useNavigate();
  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
      <button onClick={onMenuClick} className="p-2 bg-blue-500 rounded-full hover:bg-blue-400 transition">
        <Menu size={24} />
      </button>
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold">
          U
        </div>
        <h1 className="text-xl font-bold">UPWORKBD5.COM</h1>
      </div>
      <button onClick={onNotifClick} className="p-2 relative hover:bg-blue-500 rounded-full transition">
        <Bell size={24} />
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-blue-600"></span>
      </button>
    </header>
  );
};

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { user, appUser, login, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 w-80 bg-white text-gray-900 z-50 overflow-y-auto shadow-2xl flex flex-col"
          >
            <div className="bg-emerald-600 p-6 flex flex-col items-center relative">
              <button onClick={onClose} className="absolute top-4 right-4 p-1 text-white hover:bg-emerald-500 rounded-full">
                <X size={20} />
              </button>
              
              {user ? (
                <>
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-3 border-4 border-emerald-400 overflow-hidden">
                    <User size={40} className="text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{appUser?.name || 'User'}</h2>
                  <div className="mt-2 text-sm bg-emerald-800 text-white px-3 py-1 rounded-full">
                    প্রিমিয়াম মেম্বার
                  </div>
                  <div className="mt-3 text-sm text-emerald-100 flex flex-col items-center gap-1">
                    <p>আইডি: {appUser?.referId || 'N/A'}</p>
                    <p className="text-xs break-all text-center">রেফার: https://upworkbd5.com/ref/{appUser?.referId}</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-6">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <User size={40} className="text-emerald-600" />
                  </div>
                  <button 
                    onClick={() => { onClose(); navigate('/auth'); }}
                    className="bg-white text-emerald-700 font-bold py-2 px-6 rounded-full hover:bg-emerald-50 transition"
                  >
                    লগইন / সাইন আপ
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 flex flex-col gap-1">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">প্রধান মেনু</div>
              <SidebarItem icon={<Home size={20} />} label="হোম" onClick={() => { onClose(); navigate('/'); }} />
              <SidebarItem icon={<User size={20} />} label="প্রোফাইল" onClick={() => { onClose(); navigate('/profile'); }} />
              <SidebarItem icon={<Wallet size={20} />} label="আমার ওয়ালেট" onClick={() => { onClose(); navigate('/wallet'); }} />
              
              {(user?.email === 'islamohi453@gmail.com' || user?.email === 'yuta81134@gmail.com') && (
                <>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">অ্যাডমিন</div>
                  <SidebarItem icon={<Store size={20} />} label="অ্যাডমিন প্যানেল" onClick={() => { onClose(); navigate('/admin'); }} />
                </>
              )}

              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">সাহায্য</div>
              <SidebarItem icon={<HelpCircle size={20} />} label="সাপোর্ট সেন্টার" onClick={onClose} />
              <SidebarItem icon={<MessageCircle size={20} />} label="সাধারণ প্রশ্ন" onClick={onClose} />
              <SidebarItem icon={<Youtube size={20} />} label="ইউটিউব" onClick={onClose} />
              <SidebarItem icon={<Send size={20} />} label="টেলিগ্রাম গ্রুপ" onClick={onClose} />

              {user && (
                <>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">লিগ্যাল</div>
                  <button 
                    onClick={() => { logout(); onClose(); }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition w-full text-left"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">লগআউট</span>
                  </button>
                </>
              )}
            </div>
            <div className="mt-auto text-center text-[10px] text-gray-400 py-4 border-t border-gray-100">
              Developed by Ohio
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const SidebarItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex items-center justify-between p-3 rounded-lg hover:bg-emerald-50 transition w-full text-left"
  >
    <div className="flex items-center gap-3 text-gray-700">
      <div className="text-emerald-500">{icon}</div>
      <span className="font-medium">{label}</span>
    </div>
    <span className="text-gray-400">{'>'}</span>
  </button>
);

const fallbackNotifications = [
  { id: '1', title: "UPWORKBD5.COM এ স্বাগতম!", message: "শিখুন | আয় করুন | বড় হোন", createdAt: { toDate: () => new Date() } },
  { id: '2', title: "অফিসিয়াল ঘোষণা", message: "এএস ওয়ার্ক অ্যাপ এখন লাইভ! আজই আয় শুরু করুন।", createdAt: { toDate: () => new Date() } },
  { id: '3', title: "পরিচিতি", message: "আমাদের নতুন ফিচার এবং আপডেট সম্পর্কে জানুন।", createdAt: { toDate: () => new Date() } }
];

const NotificationsPanel = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    
    try {
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        if (notifs.length > 0) {
          setNotifications(notifs);
        } else {
          setNotifications(fallbackNotifications);
        }
      }, (error) => {
        console.error("Firebase not configured or error fetching notifications:", error);
        setNotifications(fallbackNotifications);
        handleFirestoreError(error, OperationType.LIST, 'notifications');
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Firebase not configured:", e);
      setNotifications(fallbackNotifications);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white text-gray-900 z-50 overflow-y-auto shadow-2xl flex flex-col"
          >
            <div className="bg-emerald-600 text-white p-4 flex items-center gap-4 sticky top-0 z-10">
              <button onClick={onClose} className="p-2 hover:bg-emerald-500 rounded-full transition">
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold">নোটিফিকেশন</h2>
            </div>
            
            <div className="p-4 flex flex-col gap-4">
              {notifications.length > 0 ? notifications.map(notif => (
                <NotificationCard 
                  key={notif.id}
                  title={notif.title} 
                  message={notif.message} 
                  date={notif.createdAt?.toDate().toLocaleString() || 'এইমাত্র'} 
                  isNew={false} 
                />
              )) : (
                <div className="text-center text-gray-500 mt-10">কোনো নোটিফিকেশন নেই।</div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const NotificationCard: React.FC<{ title: string, message: string, date: string, isNew?: boolean }> = ({ title, message, date, isNew = false }) => (
  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex gap-4 items-start">
    <div className="flex-1">
      <h3 className="font-bold text-lg text-emerald-900 flex items-center gap-2">
        {title} {isNew && <span className="text-xl">🎉</span>}
      </h3>
      <p className="text-emerald-700 mt-1">{message}</p>
      <p className="text-xs text-emerald-500 mt-3">{date}</p>
    </div>
    <div className="w-16 h-16 bg-emerald-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
      <div className="text-2xl">📢</div>
    </div>
  </div>
);

// --- Main Pages ---

const AuthPage = () => {
  const { code } = useParams();
  const [isLogin, setIsLogin] = useState(!code);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [referCode, setReferCode] = useState(code || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithEmail, registerWithEmail, login: googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      setIsLogin(false);
      setReferCode(code);
    }
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name, phone, referCode);
      }
      if (email === 'islamohi453@gmail.com' || email === 'yuta81134@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('ইমেইল অথবা পাসওয়ার্ড ভুল হয়েছে।');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে।');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-emerald-100 relative">
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition"
          title="Back to Home"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-500/30">
            U
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">{isLogin ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}</h2>
        
        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1">ইউজারনেম</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-emerald-500" placeholder="আপনার নাম লিখুন" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">ফোন নম্বর</label>
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-emerald-500" placeholder="ফোন নম্বর লিখুন" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">রেফার কোড</label>
                <input required type="text" value={referCode} onChange={e => setReferCode(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-emerald-500" placeholder="রেফার কোড লিখুন" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm text-gray-600 mb-1">ইমেইল ঠিকানা</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-emerald-500" placeholder="আপনার ইমেইল লিখুন" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <input required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 pr-10 text-gray-900 focus:outline-none focus:border-emerald-500" placeholder="পাসওয়ার্ড লিখুন" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50">
            {loading ? 'অনুগ্রহ করে অপেক্ষা করুন...' : (isLogin ? 'লগইন' : 'সাইন আপ')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-600 hover:text-emerald-500 text-sm font-medium">
            {isLogin ? "অ্যাকাউন্ট নেই? সাইন আপ করুন" : "আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন"}
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-100">
          <button onClick={async () => { 
            await googleLogin(); 
            const currentUser = auth.currentUser;
            if (currentUser?.email === 'islamohi453@gmail.com' || currentUser?.email === 'yuta81134@gmail.com') {
              navigate('/admin');
            } else {
              navigate('/');
            }
          }} type="button" className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-3 rounded-lg transition flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            গুগল দিয়ে চালিয়ে যান
          </button>
        </div>
      </div>
    </div>
  );
};

// 2D Illustration Icons
const PremiumJobsIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="24" width="40" height="28" rx="4" fill="#8B5CF6"/>
    <path d="M24 24V16a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8" fill="none" stroke="#6D28D9" strokeWidth="4"/>
    <circle cx="32" cy="38" r="6" fill="#FBBF24"/>
    <path d="M12 32h40" stroke="#6D28D9" strokeWidth="2"/>
  </svg>
);

const MicroJobsIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="12" width="28" height="36" rx="2" fill="#BFDBFE"/>
    <line x1="22" y1="20" x2="38" y2="20" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/>
    <line x1="22" y1="26" x2="32" y2="26" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="36" cy="36" r="10" fill="#3B82F6" fillOpacity="0.2" stroke="#3B82F6" strokeWidth="4"/>
    <line x1="43" y1="43" x2="52" y2="52" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round"/>
  </svg>
);

const AIToolsIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="20" width="32" height="28" rx="6" fill="#818CF8"/>
    <circle cx="24" cy="30" r="4" fill="#FFFFFF"/>
    <circle cx="40" cy="30" r="4" fill="#FFFFFF"/>
    <rect x="26" y="40" width="12" height="4" rx="2" fill="#4F46E5"/>
    <path d="M32 20V12M28 12h8" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="16" cy="34" r="3" fill="#4F46E5"/>
    <circle cx="48" cy="34" r="3" fill="#4F46E5"/>
  </svg>
);

const DigitalServiceIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="16" width="40" height="28" rx="4" fill="#22D3EE"/>
    <rect x="16" y="20" width="32" height="20" rx="2" fill="#FFFFFF"/>
    <rect x="28" y="44" width="8" height="8" fill="#0891B2"/>
    <rect x="20" y="52" width="24" height="4" rx="2" fill="#0891B2"/>
    <path d="M24 30a8 8 0 0 1 16 0" fill="none" stroke="#0891B2" strokeWidth="3"/>
    <circle cx="32" cy="30" r="4" fill="#0891B2"/>
  </svg>
);

const VendorAppIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 32l4-16h32l4 16z" fill="#FDA4AF"/>
    <path d="M16 16h32v4H16z" fill="#F43F5E"/>
    <rect x="16" y="32" width="32" height="20" fill="#FFE4E6"/>
    <rect x="26" y="36" width="12" height="16" fill="#F43F5E"/>
    <circle cx="35" cy="44" r="1.5" fill="#FFFFFF"/>
    <path d="M12 32a4 4 0 0 0 8 0 4 4 0 0 0 8 0 4 4 0 0 0 8 0 4 4 0 0 0 8 0 4 4 0 0 0 8 0" fill="#FDA4AF"/>
  </svg>
);

const WelcomeBonusIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="28" width="32" height="28" rx="2" fill="#FDE047"/>
    <rect x="12" y="20" width="40" height="8" rx="2" fill="#EAB308"/>
    <rect x="30" y="20" width="4" height="36" fill="#EF4444"/>
    <path d="M32 20c0-8-10-10-10-2 0 6 10 2 10 2zm0 0c0-8 10-10 10-2 0 6-10 2-10 2z" fill="#EF4444"/>
  </svg>
);

const PremiumBuyIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="20" width="40" height="28" rx="4" fill="#FEF08A"/>
    <path d="M20 20V16C20 12 24 8 32 8C40 8 44 12 44 16V20" stroke="#EAB308" strokeWidth="4" strokeLinecap="round"/>
    <path d="M32 28L36 36L44 38L38 44L40 52L32 48L24 52L26 44L20 38L28 36L32 28Z" fill="#EAB308"/>
  </svg>
);

const JobPostIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="12" width="32" height="40" rx="4" fill="#E0E7FF"/>
    <path d="M24 12V8C24 6 26 4 28 4H36C38 4 40 6 40 8V12" fill="#818CF8"/>
    <rect x="24" y="24" width="16" height="4" rx="2" fill="#6366F1"/>
    <rect x="24" y="32" width="12" height="4" rx="2" fill="#818CF8"/>
    <rect x="24" y="40" width="16" height="4" rx="2" fill="#A5B4FC"/>
  </svg>
);

const FacebookSellIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="24" fill="#1877F2"/>
    <path d="M36 32H32V48H24V32H20V24H24V20C24 16 26 12 32 12H36V20H34C32 20 32 22 32 24V24H36L36 32Z" fill="#FFFFFF"/>
    <circle cx="44" cy="44" r="12" fill="#FBBF24"/>
    <path d="M44 38V50M40 44H48" stroke="#B45309" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const GmailSellIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="16" width="40" height="28" rx="4" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2"/>
    <path d="M12 20L32 32L52 20" stroke="#EA4335" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 20V40C12 42 14 44 16 44H20V28L32 36L44 28V44H48C50 44 52 42 52 40V20" fill="#EA4335"/>
    <circle cx="48" cy="48" r="12" fill="#FBBF24"/>
    <path d="M48 42V54M44 48H52" stroke="#B45309" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const DailyBonusIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="24" width="32" height="28" rx="4" fill="#FDE047"/>
    <path d="M16 32H48" stroke="#EAB308" strokeWidth="4"/>
    <path d="M32 24V52" stroke="#EAB308" strokeWidth="4"/>
    <path d="M32 24C32 16 24 16 24 24C24 32 32 32 32 32Z" fill="#FBBF24"/>
    <path d="M32 24C32 16 40 16 40 24C40 32 32 32 32 32Z" fill="#F59E0B"/>
  </svg>
);

const DailyWorkIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="16" width="32" height="36" rx="4" fill="#CCFBF1"/>
    <rect x="16" y="16" width="32" height="12" fill="#14B8A6"/>
    <path d="M24 12v8M40 12v8" stroke="#0F766E" strokeWidth="4" strokeLinecap="round"/>
    <path d="M24 36l6 6 12-12" fill="none" stroke="#14B8A6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VideoEarnIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="16" width="40" height="32" rx="4" fill="#FFEDD5"/>
    <rect x="16" y="20" width="32" height="24" rx="2" fill="#FB923C"/>
    <polygon points="28,26 40,32 28,38" fill="#FFFFFF"/>
  </svg>
);

const MonthlySalaryIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="16" width="36" height="24" rx="2" fill="#6EE7B7"/>
    <rect x="12" y="24" width="36" height="24" rx="2" fill="#10B981"/>
    <circle cx="30" cy="36" r="6" fill="#D1FAE5"/>
    <path d="M12 28h4M44 28h4M12 44h4M44 44h4" stroke="#059669" strokeWidth="2"/>
  </svg>
);

const LeadershipSalaryIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 20 C6 16 6 36 18 32" fill="none" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
    <path d="M46 20 C58 16 58 36 46 32" fill="none" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
    <path d="M22 56 L42 56 L38 48 L26 48 Z" fill="#92400E" />
    <rect x="20" y="56" width="24" height="4" rx="2" fill="#78350F" />
    <rect x="28" y="40" width="8" height="8" fill="#B45309" />
    <path d="M16 16 C16 40 24 40 32 40 C40 40 48 40 48 16 Z" fill="#FBBF24" />
    <path d="M32 40 C40 40 48 40 48 16 C48 16 40 22 32 22 C24 22 16 16 16 16 C16 40 24 40 32 40 Z" fill="#F59E0B" />
    <ellipse cx="32" cy="16" rx="16" ry="4" fill="#FDE68A" />
    <ellipse cx="32" cy="16" rx="12" ry="2" fill="#D97706" />
    <path d="M32 24 L33.5 28.5 L38 28.5 L34.5 31.5 L36 36 L32 33.5 L28 36 L29.5 31.5 L26 28.5 L30.5 28.5 Z" fill="#FEF3C7" />
  </svg>
);

const LotteryIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="20" width="40" height="24" rx="4" fill="#FBCFE8"/>
    <circle cx="12" cy="32" r="4" fill="#FFFFFF"/>
    <circle cx="52" cy="32" r="4" fill="#FFFFFF"/>
    <line x1="24" y1="20" x2="24" y2="44" stroke="#DB2777" strokeWidth="2" strokeDasharray="4 4"/>
    <line x1="40" y1="20" x2="40" y2="44" stroke="#DB2777" strokeWidth="2" strokeDasharray="4 4"/>
    <circle cx="32" cy="32" r="4" fill="#F472B6"/>
  </svg>
);

const SpinBonusIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="20" fill="#BAE6FD"/>
    <path d="M32 12A20 20 0 0 1 52 32L32 32Z" fill="#38BDF8"/>
    <path d="M52 32A20 20 0 0 1 32 52L32 32Z" fill="#0284C7"/>
    <path d="M32 52A20 20 0 0 1 12 32L32 32Z" fill="#7DD3FC"/>
    <circle cx="32" cy="32" r="6" fill="#FFFFFF"/>
    <circle cx="32" cy="32" r="2" fill="#0284C7"/>
    <polygon points="32,8 36,14 28,14" fill="#EF4444"/>
  </svg>
);

const TargetBonusIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="24" fill="#FECACA"/>
    <circle cx="32" cy="32" r="16" fill="#F87171"/>
    <circle cx="32" cy="32" r="8" fill="#DC2626"/>
    <path d="M48 16L34 30" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round"/>
    <polygon points="48,16 40,16 48,24" fill="#FBBF24"/>
  </svg>
);

const GiftBonusIcon = () => (
  <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="28" width="32" height="24" rx="2" fill="#FBCFE8"/>
    <rect x="12" y="20" width="40" height="8" rx="2" fill="#F472B6"/>
    <rect x="28" y="20" width="8" height="32" fill="#DB2777"/>
    <path d="M32 20C32 12 22 10 22 18C22 20 32 20 32 20Z" fill="#DB2777"/>
    <path d="M32 20C32 12 42 10 42 18C42 20 32 20 32 20Z" fill="#DB2777"/>
  </svg>
);

const BannerSlideshow = () => {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const images = [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80"
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative rounded-2xl mb-6 shadow-2xl overflow-hidden group min-h-[240px] flex items-center justify-center border border-indigo-100">
      {images.map((img, index) => (
        <div
          key={img}
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out",
            index === currentIndex ? "opacity-100" : "opacity-0"
          )}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-indigo-800/85 to-purple-900/85 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col items-center text-center p-6 w-full">
        <div className="bg-white/20 backdrop-blur-md p-2 rounded-full mb-3 shadow-2xl border border-white/30">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl shadow-inner">
            U
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-3 tracking-widest uppercase drop-shadow-lg">UPWORKBD5.COM</h2>
        
        {!appUser ? (
          <button 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(16,185,129,0.6)] border border-emerald-300/50 text-sm sm:text-base transform transition hover:scale-105 cursor-pointer flex items-center gap-2"
          >
            এখুনি শুরু করুন <ArrowRight size={20} />
          </button>
        ) : !appUser.isVerified ? (
          <button 
            onClick={() => navigate('/deposit')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(245,158,11,0.6)] border border-amber-300/50 text-sm sm:text-base transform transition hover:scale-105 cursor-pointer flex items-center gap-2"
          >
            ৫০ টাকা দিয়ে অ্যাকাউন্ট অ্যাক্টিভ করুন <ArrowRight size={20} />
          </button>
        ) : null}

        <p className="text-indigo-100 mt-4 font-semibold tracking-wide drop-shadow-md bg-black/30 px-4 py-1 rounded-full backdrop-blur-sm text-sm">আয় করুন • শিখুন • বড় হোন</p>
      </div>
      
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
        {images.map((_, idx) => (
          <div key={idx} className={cn("h-1.5 rounded-full transition-all duration-300", idx === currentIndex ? "w-6 bg-white" : "w-2 bg-white/40")} />
        ))}
      </div>
    </div>
  );
};

const iconMap: Record<string, React.ReactNode> = {
  PremiumJobsIcon: <PremiumJobsIcon />,
  PremiumBuyIcon: <PremiumBuyIcon />,
  MicroJobsIcon: <MicroJobsIcon />,
  JobPostIcon: <JobPostIcon />,
  TargetBonusIcon: <TargetBonusIcon />,
  FacebookSellIcon: <FacebookSellIcon />,
  GmailSellIcon: <GmailSellIcon />,
  GiftBonusIcon: <GiftBonusIcon />,
  WelcomeBonusIcon: <WelcomeBonusIcon />,
  DailyWorkIcon: <DailyWorkIcon />,
  DailyBonusIcon: <DailyBonusIcon />,
  VideoEarnIcon: <VideoEarnIcon />,
  MonthlySalaryIcon: <MonthlySalaryIcon />,
  LeadershipSalaryIcon: <LeadershipSalaryIcon />,
  LotteryIcon: <LotteryIcon />,
  SpinBonusIcon: <SpinBonusIcon />,
};

const AnimatedStats = () => {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const [stats, setStats] = useState({ users: 15420, withdrawals: 8530 });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'stats'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats({
          users: data.totalUsers || 15420,
          withdrawals: data.totalWithdrawals || 8530
        });
      }
    }, (error) => {
      console.error("Error fetching stats:", error);
    });
    return () => unsub();
  }, []);

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-20">
            <Users size={80} />
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">মোট ইউজার</p>
          <h3 className="text-2xl font-black">{stats.users.toLocaleString()}+</h3>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-20">
            <Banknote size={80} />
          </div>
          <p className="text-emerald-100 text-sm font-medium mb-1">মোট উইথড্র</p>
          <h3 className="text-2xl font-black">{stats.withdrawals.toLocaleString()}+</h3>
        </div>
      </div>
    </div>
  );
};

const HomeDashboard = ({ showAlert }: { showAlert: (msg: string) => void }) => {
  const { options } = useGridStore();
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const visibleOptions = options.filter(opt => opt.isActive).sort((a, b) => a.order - b.order);

  const handleOptionClick = (opt: any) => {
    if (!appUser) {
      showAlert('অনুগ্রহ করে আগে লগইন করুন।');
      setTimeout(() => navigate('/auth'), 1500);
      return;
    }

    if (!appUser.isVerified && appUser.role !== 'admin') {
      showAlert('অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্ট ভেরিফাই করুন।');
      setTimeout(() => navigate('/deposit'), 1500);
      return;
    }

    if (opt.id === 1 || opt.title === 'প্রিমিয়াম কাজ') {
      navigate('/premium-jobs');
    } else if (opt.id === 13 || opt.title === 'প্রিমিয়াম কিনুন') {
      navigate('/premium-buy');
    } else if (opt.id === 2 || opt.title === 'ছোট কাজ') {
      navigate('/micro-jobs');
    } else if (opt.id === 14 || opt.title === 'জব পোস্ট') {
      navigate('/job-post');
    } else if (opt.id === 7 || opt.title === 'ডেইলি টাস্ক') {
      navigate('/daily-tasks');
    } else if (opt.id === 8 || opt.title === 'ভিডিও আর্ন') {
      navigate('/video-earn');
    } else if (opt.id === 15 || opt.title === 'ফেসবুক সেল') {
      navigate('/facebook-sell');
    } else if (opt.id === 16 || opt.title === 'জিমেইল সেল') {
      navigate('/gmail-sell');
    } else if (opt.id === 3 || opt.title === 'টার্গেট বোনাস') {
      navigate('/target-bonus');
    } else if (opt.id === 9 || opt.title === 'মাসিক বেতন') {
      navigate('/monthly-salary');
    } else if (opt.id === 10 || opt.title === 'লিডারশিপ বেতন') {
      navigate('/leadership-salary');
    } else if (opt.id === 11 || opt.title === 'লটারি') {
      navigate('/lottery');
    } else if (opt.id === 5 || opt.title === 'গিফট বোনাস') {
      navigate('/gift-bonus');
    } else if (opt.id === 6 || opt.title === 'স্বাগতম বোনাস') {
      navigate('/welcome-bonus');
    } else if (opt.id === 17 || opt.title === 'ডেইলি বোনাস') {
      navigate('/daily-bonus');
    } else if (opt.id === 12 || opt.title === 'স্পিন বোনাস') {
      navigate('/spin-bonus');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24">
      <BannerSlideshow />
      <AnimatedStats />

      {/* Marquee Notice */}
      <div className="bg-white border border-emerald-100 rounded-xl p-3 mb-8 flex items-center gap-3 shadow-sm">
        <div className="font-bold text-emerald-600 whitespace-nowrap">নোটিশ:</div>
        <div className="overflow-hidden relative w-full">
          <div className="whitespace-nowrap animate-[marquee_15s_linear_infinite] text-gray-700 font-medium">
            🔥 সবাই কঠোর পরিশ্রম শুরু করুন! ✅ 🔥 নতুন ফিচার এখন উপলব্ধ!
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px bg-emerald-200 flex-1"></div>
          <h3 className="text-lg font-bold text-emerald-800 uppercase tracking-wider">কাজ এবং সেবাসমূহ 🚀</h3>
          <div className="h-px bg-emerald-200 flex-1"></div>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {visibleOptions.map((opt) => (
            <button key={opt.id} onClick={() => handleOptionClick(opt)} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-gray-100 transition-transform group-hover:scale-110 group-hover:shadow-md">
                {iconMap[opt.iconId]}
              </div>
              <span className="text-xs text-center font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">
                {opt.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const BottomNav = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNav = (path: string) => {
    if (!user && path !== '/') {
      navigate('/auth');
    } else {
      navigate(path);
    }
  };

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex justify-around items-center p-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button onClick={() => handleNav('/')} className="flex flex-col items-center text-emerald-600 hover:text-emerald-500 transition">
        <Home size={24} />
        <span className="text-[10px] mt-1 font-medium">হোম</span>
      </button>
      <button onClick={() => handleNav('/wallet')} className="flex flex-col items-center text-gray-500 hover:text-emerald-600 transition">
        <Wallet size={24} />
        <span className="text-[10px] mt-1 font-medium">ওয়ালেট</span>
      </button>
      <button onClick={() => handleNav('/team')} className="flex flex-col items-center text-gray-500 hover:text-emerald-600 transition">
        <Users size={24} />
        <span className="text-[10px] mt-1 font-medium">টিম</span>
      </button>
      <button onClick={() => handleNav('/profile')} className="flex flex-col items-center text-gray-500 hover:text-emerald-600 transition">
        <User size={24} />
        <span className="text-[10px] mt-1 font-medium">প্রোফাইল</span>
      </button>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return user ? <>{children}</> : null;
};

const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; message: string } | null>(null);
  const { setOptions } = useGridStore();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'gridOptions'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.options) {
            let mergedOptions = data.options.filter((o: any) => o.id !== 4); // Remove Digital Service
            
            defaultOptions.forEach(defOpt => {
              if (!mergedOptions.find((o: any) => o.id === defOpt.id)) {
                mergedOptions.push(defOpt);
              }
            });

            // Sort by order to keep it clean
            mergedOptions.sort((a: any, b: any) => a.order - b.order);

            setOptions(mergedOptions);
          }
        } else {
          // Fallback to default options if document doesn't exist yet
          setOptions(defaultOptions);
        }
      },
      (error) => {
        console.error("Error fetching grid options:", error);
        handleFirestoreError(error, OperationType.GET, 'settings/gridOptions');
      }
    );
    return () => unsubscribe();
  }, [setOptions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 text-gray-900 font-sans selection:bg-emerald-500/30">
      <Header 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onNotifClick={() => setIsNotifOpen(true)} 
      />
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <NotificationsPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      
      <main>
        <Routes>
          <Route path="/" element={<HomeDashboard showAlert={(msg) => setAlertDialog({ isOpen: true, message: msg })} />} />
          <Route path="/ref/:code" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
          <Route path="/premium-jobs" element={<ProtectedRoute><PremiumJobsPage /></ProtectedRoute>} />
          <Route path="/premium-buy" element={<ProtectedRoute><PremiumBuyPage /></ProtectedRoute>} />
          <Route path="/deposit" element={<ProtectedRoute><DepositPage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/micro-jobs" element={<ProtectedRoute><MicroJobsPage /></ProtectedRoute>} />
          <Route path="/job-post" element={<ProtectedRoute><JobPostPage /></ProtectedRoute>} />
          <Route path="/daily-tasks" element={<ProtectedRoute><DailyTasksPage /></ProtectedRoute>} />
          <Route path="/video-earn" element={<ProtectedRoute><VideoEarnPage /></ProtectedRoute>} />
          <Route path="/facebook-sell" element={<ProtectedRoute><FacebookSellPage /></ProtectedRoute>} />
          <Route path="/gmail-sell" element={<ProtectedRoute><GmailSellPage /></ProtectedRoute>} />
          <Route path="/target-bonus" element={<ProtectedRoute><TargetBonusPage /></ProtectedRoute>} />
          <Route path="/monthly-salary" element={<ProtectedRoute><MonthlySalaryPage /></ProtectedRoute>} />
          <Route path="/leadership-salary" element={<ProtectedRoute><LeadershipSalaryPage /></ProtectedRoute>} />
          <Route path="/gift-bonus" element={<ProtectedRoute><GiftBonusPage /></ProtectedRoute>} />
          <Route path="/welcome-bonus" element={<ProtectedRoute><WelcomeBonusPage /></ProtectedRoute>} />
          <Route path="/daily-bonus" element={<ProtectedRoute><DailyBonusPage /></ProtectedRoute>} />
          <Route path="/spin-bonus" element={<ProtectedRoute><SpinBonusPage /></ProtectedRoute>} />
          <Route path="/lottery" element={<ProtectedRoute><LotteryPage /></ProtectedRoute>} />
        </Routes>
      </main>

      <div className="fixed bottom-[72px] inset-x-0 text-center pointer-events-none z-20">
        <p className="text-[10px] text-gray-400 font-medium bg-white/50 backdrop-blur-sm inline-block px-2 py-0.5 rounded-full">developed by Ohio</p>
      </div>

      <BottomNav />
      <AlertModal 
        isOpen={alertDialog?.isOpen || false}
        onClose={() => setAlertDialog(null)}
        message={alertDialog?.message || ''}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
