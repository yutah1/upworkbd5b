import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Clock, DollarSign, Award, ChevronRight, X } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../AuthContext';

interface PremiumJob {
  id: string;
  title: string;
  description: string;
  duration?: string;
  expiredDate?: string;
  price: number;
  reward?: number;
  buyerLimit?: number;
  buyersCount?: number;
  isActive: boolean;
  thumbnail?: string;
}

const PremiumJobsPage = () => {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const [jobs, setJobs] = useState<PremiumJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<PremiumJob | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'premiumJobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedJobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PremiumJob[];
      
      // Add a demo job if no jobs exist
      if (fetchedJobs.length === 0) {
        fetchedJobs.push({
          id: 'demo-job-1',
          title: 'Demo: Watch YouTube Video & Subscribe',
          description: '1. Search for "Upwork BD 5" on YouTube.\n2. Watch the latest video for at least 3 minutes.\n3. Subscribe to the channel and like the video.\n4. Take a screenshot as proof and submit.',
          expiredDate: '7 Days',
          price: 50,
          buyerLimit: 100,
          buyersCount: 0,
          isActive: true
        });
      }

      setJobs(fetchedJobs.filter(job => job.isActive));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching premium jobs:", error);
      handleFirestoreError(error, OperationType.LIST, 'premiumJobs');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-4 sticky top-0 z-20 shadow-md flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-emerald-500 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">প্রিমিয়াম জবস</h1>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Instructions Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <Briefcase size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">প্রিমিয়াম জবস এ কীভাবে কাজ করবেন?</h2>
          </div>
          <div className="space-y-3 text-gray-600 text-sm">
            <p className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">১.</span>
              নিচে তালিকাভুক্ত প্রিমিয়াম কাজগুলো দেখুন। এই কাজগুলো বেশি রিওয়ার্ড দেয় কিন্তু নির্দিষ্ট কাজ সম্পন্ন করতে হয়।
            </p>
            <p className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">২.</span>
              কাজের সম্পূর্ণ নির্দেশিকা পড়তে "আরও তথ্য" এ ক্লিক করুন।
            </p>
            <p className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">৩.</span>
              নির্দেশিকাগুলো মনোযোগ সহকারে অনুসরণ করুন। আপনাকে কাজের প্রমাণ জমা দিতে হতে পারে।
            </p>
            <p className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">৪.</span>
              অনুমোদিত হলে, রিওয়ার্ড আপনার ব্যালেন্সে যোগ করা হবে।
            </p>
          </div>
        </div>

        {/* Jobs List */}
        <h3 className="text-lg font-bold text-gray-800 mb-4">আপনার আনলক করা কাজগুলো</h3>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : jobs.filter(job => appUser?.unlockedPackages?.includes(job.id) || job.title.includes('ছোট কাজ') || job.title.includes('Gmail Sell') || job.title.includes('Microjobs')).length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.filter(job => appUser?.unlockedPackages?.includes(job.id) || job.title.includes('ছোট কাজ') || job.title.includes('Gmail Sell') || job.title.includes('Microjobs')).map(job => {
              return (
              <div key={job.id} className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-200 hover:border-emerald-300 transition-colors">
                <div className="flex gap-4">
                  {job.thumbnail && (
                    <img src={job.thumbnail} alt={job.title} className="w-16 h-16 object-cover rounded-lg border border-gray-100 flex-shrink-0" referrerPolicy="no-referrer" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-gray-900 leading-tight">{job.title}</h4>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                        <Clock size={14} /> {job.expiredDate || job.duration}
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedJob(job)}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 font-medium rounded-xl border transition-colors bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                >
                  কাজ শুরু করুন <ChevronRight size={18} />
                </button>
              </div>
            )})}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 px-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
              <Briefcase size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">কোনো আনলক করা প্যাকেজ নেই</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">আপনি এখনও কোনো প্রিমিয়াম প্যাকেজ আনলক করেননি। প্যাকেজ আনলক করতে এবং কাজ শুরু করতে অনুগ্রহ করে প্রিমিয়াম বাই সেকশনে যান।</p>
            <button 
              onClick={() => navigate('/premium-buy')}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition shadow-sm"
            >
              প্রিমিয়াম বাই এ যান
            </button>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50 max-h-[85vh] flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl">
                <h3 className="font-bold text-lg text-gray-900">কাজের বিবরণ</h3>
                <button onClick={() => setSelectedJob(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedJob.title}</h2>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex-1 min-w-[100px]">
                    <div className="text-xs text-gray-500 mb-1">সময়কাল</div>
                    <div className="font-bold text-gray-800 flex items-center gap-1"><Clock size={16} className="text-blue-500"/> {selectedJob.duration}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex-1 min-w-[100px]">
                    <div className="text-xs text-gray-500 mb-1">মূল্য</div>
                    <div className="font-bold text-gray-800 flex items-center gap-1"><DollarSign size={16} className="text-amber-500"/> ৳{selectedJob.price}</div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex-1 min-w-[100px]">
                    <div className="text-xs text-emerald-600 mb-1">কাজের রিওয়ার্ড</div>
                    <div className="font-bold text-emerald-700 flex items-center gap-1"><Award size={16}/> ৳{selectedJob.reward}</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-gray-800 mb-2">নির্দেশিকা</h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedJob.description}
                  </div>
                </div>

                <button className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-transform active:scale-[0.98]">
                  এখনই কাজ শুরু করুন
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PremiumJobsPage;
