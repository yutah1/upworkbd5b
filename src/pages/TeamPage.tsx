import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, User, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const TeamPage = () => {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!appUser?.referId) return;
      try {
        const q = query(collection(db, 'users'), where('referredBy', '==', appUser.referId));
        const snapshot = await getDocs(q);
        const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // For each member, fetch how many they referred
        const membersWithStats = await Promise.all(members.map(async (member: any) => {
          const subQ = query(collection(db, 'users'), where('referredBy', '==', member.referId));
          const subSnap = await getDocs(subQ);
          return {
            ...member,
            referCount: subSnap.size,
            isActive: (member.unlockedPackages && member.unlockedPackages.length > 1) || member.balance > 0
          };
        }));
        
        setTeamMembers(membersWithStats);
      } catch (error) {
        console.error("Error fetching team:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [appUser]);

  const demoUser = {
    id: 'demo-user-1',
    name: 'ডেমো ইউজার (টেস্টিং)',
    email: 'demo@example.com',
    phone: '01700000000',
    referCount: 3,
    isActive: true,
    createdAt: { toDate: () => new Date() }
  };

  const displayMembers = [demoUser, ...teamMembers];
  const activeCount = displayMembers.filter(m => m.isActive).length;
  const inactiveCount = displayMembers.length - activeCount;
  const teamTasks = activeCount * 12 + 5; // Mock data for team tasks

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-emerald-600 text-white p-4 sticky top-0 z-20 shadow-md flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-emerald-500 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">আমার টিম</h1>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
              <Users size={24} />
            </div>
            <h2 className="text-sm font-bold text-gray-500">মোট টিম</h2>
            <p className="text-2xl font-black text-emerald-600">{displayMembers.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
              <CheckCircle size={24} />
            </div>
            <h2 className="text-sm font-bold text-gray-500">টিমের কাজ</h2>
            <p className="text-2xl font-black text-blue-600">{teamTasks}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
              <CheckCircle size={24} />
            </div>
            <h2 className="text-sm font-bold text-gray-500">সক্রিয়</h2>
            <p className="text-2xl font-black text-green-600">{activeCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
              <XCircle size={24} />
            </div>
            <h2 className="text-sm font-bold text-gray-500">ভেরিফাইড না</h2>
            <p className="text-2xl font-black text-red-600">{inactiveCount}</p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-4">টিম মেম্বার তালিকা</h3>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayMembers.length > 0 ? (
          <div className="space-y-3">
            {displayMembers.map(member => (
              <div 
                key={member.id} 
                onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 cursor-pointer hover:border-emerald-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{member.name}</h4>
                      <p className="text-xs text-gray-500">{member.phone || member.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {member.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
                        <CheckCircle size={12} /> অ্যাক্টিভ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md">
                        <XCircle size={12} /> ভেরিফাইড না
                      </span>
                    )}
                  </div>
                </div>
                
                {selectedMember?.id === member.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">তার রেফার সংখ্যা</p>
                      <p className="font-bold text-gray-800">{member.referCount} জন</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">যোগদানের তারিখ</p>
                      <p className="font-bold text-gray-800">
                        {member.createdAt?.toDate ? member.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 px-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">কোনো টিম মেম্বার নেই</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">আপনার রেফার কোড শেয়ার করে টিম তৈরি করুন এবং বেশি আয় করুন।</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
