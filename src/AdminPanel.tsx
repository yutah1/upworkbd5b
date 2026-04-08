import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from './components/ConfirmModal';
import { AlertModal } from './components/AlertModal';
import { useGridStore } from './store/useGridStore';
import { ArrowLeft, Eye, EyeOff, Save, Edit2, ShieldAlert, LayoutDashboard, Grid, Briefcase, Users, CreditCard, Plus, Trash2, Bot, X, ChevronRight, Target, Gift, Award, Video, Menu, Settings } from 'lucide-react';
import { doc, setDoc, collection, addDoc, deleteDoc, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { useAuth } from './AuthContext';

export const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, appUser } = useAuth();
  const { options, updateOption } = useGridStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Grid Options State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showAddGrid, setShowAddGrid] = useState(false);
  const [newGridOption, setNewGridOption] = useState({ title: '', iconId: 'StarIcon' });

  // User Management State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [editBalance, setEditBalance] = useState<number>(0);

  // Premium Jobs State
  const [premiumJobs, setPremiumJobs] = useState<any[]>([]);
  const [newJob, setNewJob] = useState({ title: '', description: '', expiredDate: '', price: 0, dailyReward: 0, buyerLimit: 0, thumbnail: '' });
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editJobForm, setEditJobForm] = useState({ title: '', description: '', expiredDate: '', price: 0, dailyReward: 0, buyerLimit: 0, thumbnail: '' });

  // Micro Jobs State
  const [microJobs, setMicroJobs] = useState<any[]>([]);
  const [newMicroJob, setNewMicroJob] = useState({ category: '', prize: 0, limit: 0 });

  // Daily Tasks State
  const [userMicroJobs, setUserMicroJobs] = useState<any[]>([]);
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [newDailyTask, setNewDailyTask] = useState({ title: '', amount: 0, duration: '' });

  // Target Bonuses State
  const [targetBonuses, setTargetBonuses] = useState<any[]>([]);
  const [newTargetBonus, setNewTargetBonus] = useState({ title: '', amount: 0, packagePrice: 0, referralsNeeded: 0 });

  // Gift Bonuses State
  const [giftBonuses, setGiftBonuses] = useState<any[]>([]);
  const [newGiftBonus, setNewGiftBonus] = useState({ title: '', amount: 0, redeemCode: '' });

  // Welcome Bonuses State
  const [welcomeBonuses, setWelcomeBonuses] = useState<any[]>([]);
  const [newWelcomeBonus, setNewWelcomeBonus] = useState({ title: '', description: '', amount: 0 });
  const [welcomeBonusSubmissions, setWelcomeBonusSubmissions] = useState<any[]>([]);

  // Facebook Sell State
  const [fbPosts, setFbPosts] = useState<any[]>([]);
  const [newFbPost, setNewFbPost] = useState({ title: '', description: '', amount: 0 });
  const [fbSubmissions, setFbSubmissions] = useState<any[]>([]);

  // Gmail Sell State
  const [gmailPosts, setGmailPosts] = useState<any[]>([]);
  const [newGmailPost, setNewGmailPost] = useState({ title: '', description: '', amount: 0, requiredPassword: '' });
  const [gmailSubmissions, setGmailSubmissions] = useState<any[]>([]);

  // Daily Bonus State
  const [dailyBonus, setDailyBonus] = useState({ amount: 0 });

  // Spin Bonus State
  const [spinBonus, setSpinBonus] = useState({
    segments: [
      { label: '10', value: 10, probability: 20 },
      { label: '20', value: 20, probability: 20 },
      { label: '0', value: 0, probability: 60 }
    ]
  });
  const [paymentMethods, setPaymentMethods] = useState({ 
    bKash: '', bKashType: 'Personal', 
    nagad: '', nagadType: 'Personal', 
    rocket: '', rocketType: 'Personal', 
    upay: '', upayType: 'Personal' 
  });

  // Monthly Salary State
  const [monthlySalaries, setMonthlySalaries] = useState<any[]>([]);
  const [newMonthlySalary, setNewMonthlySalary] = useState({ title: '', description: '', amount: 0, target: 0 });
  const [monthlySalarySubmissions, setMonthlySalarySubmissions] = useState<any[]>([]);

  // Leadership Salary State
  const [leadershipSalaries, setLeadershipSalaries] = useState<any[]>([]);
  const [newLeadershipSalary, setNewLeadershipSalary] = useState({ title: '', description: '', amount: 0, target: 0 });
  const [leadershipSalarySubmissions, setLeadershipSalarySubmissions] = useState<any[]>([]);

  // Video Earn State
  const [videoTasks, setVideoTasks] = useState<any[]>([]);
  const [newVideoTask, setNewVideoTask] = useState({ title: '', reward: 0, duration: 0, videoUrl: '' });

  // Withdrawals State (Payments)
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);

  // Deposits State
  const [deposits, setDeposits] = useState<any[]>([]);
  const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null);

  // Dashboard Stats
  const [stats, setStats] = useState({ users: 0, activeJobs: 0, pendingDeposits: 0 });

  // Modal States
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; message: string } | null>(null);

  const showAlert = (message: string) => setAlertDialog({ isOpen: true, message });
  const showConfirm = (message: string, onConfirm: () => void) => setConfirmDialog({ isOpen: true, message, onConfirm });

  // Check if user is admin
  const isAdmin = user?.email === 'yuta81134@gmail.com' || appUser?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;

    // Fetch Premium Jobs
    const q = query(collection(db, 'premiumJobs'), orderBy('createdAt', 'desc'));
    const unsubscribeJobs = onSnapshot(q, (snapshot) => {
      setPremiumJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'premiumJobs');
    });

    // Fetch Deposits
    const qDeposits = query(collection(db, 'deposits'), orderBy('createdAt', 'desc'));
    const unsubscribeDeposits = onSnapshot(qDeposits, (snapshot) => {
      const deps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDeposits(deps);
      setStats(prev => ({ ...prev, pendingDeposits: deps.filter((d: any) => d.status === 'pending').length }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'deposits');
    });

    // Fetch Users
    const qUsers = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsersList(users);
      setStats(prev => ({ ...prev, users: users.length }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    // Fetch Facebook Sell Posts
    const qFbPosts = query(collection(db, 'facebookSellPosts'), orderBy('createdAt', 'desc'));
    const unsubscribeFbPosts = onSnapshot(qFbPosts, (snapshot) => {
      setFbPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'facebookSellPosts');
    });

    // Fetch Facebook Submissions
    const qFbSubs = query(collection(db, 'facebookSellSubmissions'), orderBy('createdAt', 'desc'));
    const unsubscribeFbSubs = onSnapshot(qFbSubs, (snapshot) => {
      setFbSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'facebookSellSubmissions');
    });

    // Fetch Gmail Sell Posts
    const qGmailPosts = query(collection(db, 'gmailSellPosts'), orderBy('createdAt', 'desc'));
    const unsubscribeGmailPosts = onSnapshot(qGmailPosts, (snapshot) => {
      setGmailPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gmailSellPosts');
    });

    // Fetch Gmail Submissions
    const qGmailSubs = query(collection(db, 'gmailSellSubmissions'), orderBy('createdAt', 'desc'));
    const unsubscribeGmailSubs = onSnapshot(qGmailSubs, (snapshot) => {
      setGmailSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gmailSellSubmissions');
    });

    // Fetch Daily Bonus Settings
    const unsubscribeDailyBonus = onSnapshot(doc(db, 'settings', 'dailyBonus'), (docSnap) => {
      if (docSnap.exists()) {
        setDailyBonus(docSnap.data() as any);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/dailyBonus');
    });

    // Fetch Spin Bonus Settings
    const unsubscribeSpinBonus = onSnapshot(doc(db, 'settings', 'spinBonus'), (docSnap) => {
      if (docSnap.exists()) {
        setSpinBonus(docSnap.data() as any);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/spinBonus');
    });

    // Fetch Monthly Salaries
    const qMonthlySalaries = query(collection(db, 'monthlySalaries'), orderBy('createdAt', 'desc'));
    const unsubscribeMonthlySalaries = onSnapshot(qMonthlySalaries, (snapshot) => {
      setMonthlySalaries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'monthlySalaries');
    });

    // Fetch Leadership Salaries
    const qLeadershipSalaries = query(collection(db, 'leadershipSalaries'), orderBy('createdAt', 'desc'));
    const unsubscribeLeadershipSalaries = onSnapshot(qLeadershipSalaries, (snapshot) => {
      setLeadershipSalaries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leadershipSalaries');
    });

    // Fetch Video Earn Tasks
    const qVideoTasks = query(collection(db, 'videoEarnTasks'), orderBy('createdAt', 'desc'));
    const unsubscribeVideoTasks = onSnapshot(qVideoTasks, (snapshot) => {
      setVideoTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videoEarnTasks');
    });

    // Fetch Micro Jobs
    const qMicroJobs = query(collection(db, 'microJobs'), orderBy('createdAt', 'desc'));
    const unsubscribeMicroJobs = onSnapshot(qMicroJobs, (snapshot) => {
      setMicroJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'microJobs');
    });

    // Fetch User Micro Jobs
    const qUserMicroJobs = query(collection(db, 'userMicroJobs'), orderBy('createdAt', 'desc'));
    const unsubscribeUserMicroJobs = onSnapshot(qUserMicroJobs, (snapshot) => {
      setUserMicroJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'userMicroJobs');
    });

    // Fetch Daily Tasks
    const qDailyTasks = query(collection(db, 'dailyTasks'), orderBy('createdAt', 'desc'));
    const unsubscribeDailyTasks = onSnapshot(qDailyTasks, (snapshot) => {
      setDailyTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'dailyTasks');
    });

    // Fetch Withdrawals (Payments to users)
    const qWithdrawals = query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'));
    const unsubscribeWithdrawals = onSnapshot(qWithdrawals, (snapshot) => {
      setWithdrawals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'withdrawals');
    });

    // Fetch Target Bonuses
    const qTargetBonuses = query(collection(db, 'targetBonuses'), orderBy('createdAt', 'desc'));
    const unsubscribeTargetBonuses = onSnapshot(qTargetBonuses, (snapshot) => {
      setTargetBonuses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'targetBonuses');
    });

    // Fetch Gift Bonuses
    const qGiftBonuses = query(collection(db, 'giftBonuses'), orderBy('createdAt', 'desc'));
    const unsubscribeGiftBonuses = onSnapshot(qGiftBonuses, (snapshot) => {
      setGiftBonuses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'giftBonuses');
    });

    // Fetch Welcome Bonuses
    const qWelcomeBonuses = query(collection(db, 'welcomeBonuses'), orderBy('createdAt', 'desc'));
    const unsubscribeWelcomeBonuses = onSnapshot(qWelcomeBonuses, (snapshot) => {
      setWelcomeBonuses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'welcomeBonuses');
    });

    const qWelcomeSubs = query(collection(db, 'welcomeBonusSubmissions'), orderBy('createdAt', 'desc'));
    const unsubscribeWelcomeSubs = onSnapshot(qWelcomeSubs, (snapshot) => {
      setWelcomeBonusSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'welcomeBonusSubmissions');
    });

    const qMonthlySubs = query(collection(db, 'monthlySalarySubmissions'), orderBy('createdAt', 'desc'));
    const unsubscribeMonthlySubs = onSnapshot(qMonthlySubs, (snapshot) => {
      setMonthlySalarySubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'monthlySalarySubmissions');
    });

    const qLeadershipSubs = query(collection(db, 'leadershipSalarySubmissions'), orderBy('createdAt', 'desc'));
    const unsubscribeLeadershipSubs = onSnapshot(qLeadershipSubs, (snapshot) => {
      setLeadershipSalarySubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leadershipSalarySubmissions');
    });

    const unsubPaymentMethods = onSnapshot(doc(db, 'settings', 'paymentMethods'), (docSnap) => {
      if (docSnap.exists()) {
        setPaymentMethods(docSnap.data() as any);
      }
    });

    return () => {
      unsubscribeJobs();
      unsubscribeDeposits();
      unsubscribeUsers();
      unsubscribeFbPosts();
      unsubscribeFbSubs();
      unsubscribeGmailPosts();
      unsubscribeGmailSubs();
      unsubscribeDailyBonus();
      unsubscribeSpinBonus();
      unsubscribeMonthlySalaries();
      unsubscribeLeadershipSalaries();
      unsubscribeVideoTasks();
      unsubscribeMicroJobs();
      unsubscribeUserMicroJobs();
      unsubscribeDailyTasks();
      unsubscribeWithdrawals();
      unsubscribeTargetBonuses();
      unsubscribeGiftBonuses();
      unsubscribeWelcomeBonuses();
      unsubscribeWelcomeSubs();
      unsubscribeMonthlySubs();
      unsubscribeLeadershipSubs();
      unsubPaymentMethods();
    };
  }, [isAdmin]);

  const [manageReferUser, setManageReferUser] = useState<any | null>(null);

  // --- Grid Options Handlers ---
  const handleToggleVisibility = async (id: number, currentStatus: boolean) => {
    if (!isAdmin) return showAlert("Access Denied");
    const newOptions = options.map(opt => opt.id === id ? { ...opt, isActive: !currentStatus } : opt);
    updateOption(id, { isActive: !currentStatus });
    try {
      await setDoc(doc(db, 'settings', 'gridOptions'), { options: newOptions });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/gridOptions');
    }
  };

  const startEditing = (id: number, title: string) => {
    if (!isAdmin) return showAlert("Access Denied");
    setEditingId(id);
    setEditTitle(title);
  };

  const saveEdit = async (id: number) => {
    if (editTitle.trim()) {
      const newOptions = options.map(opt => opt.id === id ? { ...opt, title: editTitle.trim() } : opt);
      updateOption(id, { title: editTitle.trim() });
      try {
        await setDoc(doc(db, 'settings', 'gridOptions'), { options: newOptions });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'settings/gridOptions');
      }
    }
    setEditingId(null);
  };

  const handleAddGridOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    const newId = Math.max(...options.map(o => o.id), 0) + 1;
    const newOrder = Math.max(...options.map(o => o.order), 0) + 1;
    
    const newOption = {
      id: newId,
      title: newGridOption.title,
      iconId: newGridOption.iconId,
      isActive: true,
      order: newOrder
    };
    
    const newOptions = [...options, newOption];
    updateOption(newId, newOption); // using updateOption to add might not work if it maps, wait, useGridStore has addOption
    // Actually, I'll just rely on the global state update or setDoc
    try {
      await setDoc(doc(db, 'settings', 'gridOptions'), { options: newOptions });
      setNewGridOption({ title: '', iconId: 'StarIcon' });
      setShowAddGrid(false);
      // The app will re-fetch or we can just reload
      window.location.reload(); // Simple way to sync state if addOption isn't exposed properly
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/gridOptions');
    }
  };

  // --- User Management Handlers ---
  const handleSaveUserBalance = async () => {
    if (!isAdmin || !selectedUser) return;
    try {
      await setDoc(doc(db, 'users', selectedUser.id), { balance: editBalance }, { merge: true });
      setSelectedUser({ ...selectedUser, balance: editBalance });
      showAlert("Balance updated successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${selectedUser.id}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isAdmin) return;
    showConfirm("Are you sure you want to permanently delete this user? This will remove them from the database.", async () => {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setSelectedUser(null);
        showAlert("User deleted successfully!");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
      }
    });
  };

  const handleBanUser = async (userId: string, currentBanStatus: boolean) => {
    if (!isAdmin) return;
    const action = currentBanStatus ? "unban" : "ban";
    showConfirm(`Are you sure you want to ${action} this user?`, async () => {
      try {
        await setDoc(doc(db, 'users', userId), { isBanned: !currentBanStatus }, { merge: true });
        setSelectedUser({ ...selectedUser, isBanned: !currentBanStatus });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      }
    });
  };

  // --- Withdrawals Handlers ---
  const handleApproveWithdrawal = async (withdrawal: any) => {
    if (!isAdmin) return;
    showConfirm(`Approve withdrawal of ৳${withdrawal.amount} for ${withdrawal.userName}?`, async () => {
      try {
        await setDoc(doc(db, 'withdrawals', withdrawal.id), { status: 'approved' }, { merge: true });
        showAlert("Withdrawal approved!");
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `withdrawals/${withdrawal.id}`);
      }
    });
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    if (!isAdmin) return;
    showConfirm("Are you sure you want to reject this withdrawal?", async () => {
      try {
        await setDoc(doc(db, 'withdrawals', withdrawalId), { status: 'rejected' }, { merge: true });
        showAlert("Withdrawal rejected!");
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `withdrawals/${withdrawalId}`);
      }
    });
  };

  // --- Premium Jobs Handlers ---
  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return showAlert("Access Denied");
    try {
      await addDoc(collection(db, 'premiumJobs'), {
        ...newJob,
        price: Number(newJob.price),
        dailyReward: Number(newJob.dailyReward),
        buyerLimit: Number(newJob.buyerLimit),
        buyersCount: 0,
        isActive: true,
        createdAt: new Date()
      });
      setNewJob({ title: '', description: '', expiredDate: '', price: 0, dailyReward: 0, buyerLimit: 0, thumbnail: '' });
      showAlert("Job added successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'premiumJobs');
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!isAdmin) return showAlert("Access Denied");
    showConfirm("Are you sure you want to delete this job?", async () => {
      try {
        await deleteDoc(doc(db, 'premiumJobs', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `premiumJobs/${id}`);
      }
    });
  };

  const handleToggleJobStatus = async (id: string, currentStatus: boolean) => {
    if (!isAdmin) return showAlert("Access Denied");
    try {
      await setDoc(doc(db, 'premiumJobs', id), { isActive: !currentStatus }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `premiumJobs/${id}`);
    }
  };

  const startEditingJob = (job: any) => {
    if (!isAdmin) return showAlert("Access Denied");
    setEditingJobId(job.id);
    setEditJobForm({
      title: job.title,
      description: job.description,
      expiredDate: job.expiredDate || '',
      price: job.price,
      dailyReward: job.dailyReward || 0,
      buyerLimit: job.buyerLimit || 0,
      thumbnail: job.thumbnail || ''
    });
  };

  const saveEditJob = async (id: string) => {
    if (!isAdmin) return showAlert("Access Denied");
    try {
      await setDoc(doc(db, 'premiumJobs', id), {
        ...editJobForm,
        price: Number(editJobForm.price),
        dailyReward: Number(editJobForm.dailyReward),
        buyerLimit: Number(editJobForm.buyerLimit),
      }, { merge: true });
      setEditingJobId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `premiumJobs/${id}`);
    }
  };

  // --- Micro Jobs Handlers ---
  const handleAddMicroJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'microJobs'), {
        ...newMicroJob,
        prize: Number(newMicroJob.prize),
        limit: Number(newMicroJob.limit),
        completedCount: 0,
        createdAt: new Date()
      });
      setNewMicroJob({ category: '', prize: 0, limit: 0 });
      showAlert("Micro Job added successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'microJobs');
    }
  };

  const handleDeleteMicroJob = async (id: string) => {
    if (!isAdmin) return;
    showConfirm("Delete this micro job?", async () => {
      try {
        await deleteDoc(doc(db, 'microJobs', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `microJobs/${id}`);
      }
    });
  };

  // --- Daily Tasks Handlers ---
  const handleDeleteUserMicroJob = async (id: string) => {
    showConfirm('Are you sure you want to delete this user-posted micro job?', async () => {
      try {
        await deleteDoc(doc(db, 'userMicroJobs', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `userMicroJobs/${id}`);
      }
    });
  };

  const handleAddDailyTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'dailyTasks'), {
        ...newDailyTask,
        amount: Number(newDailyTask.amount),
        createdAt: new Date()
      });
      setNewDailyTask({ title: '', amount: 0, duration: '' });
      showAlert("Daily Task added successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'dailyTasks');
    }
  };

  const handleDeleteDailyTask = async (id: string) => {
    if (!isAdmin) return;
    showConfirm("Delete this daily task?", async () => {
      try {
        await deleteDoc(doc(db, 'dailyTasks', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `dailyTasks/${id}`);
      }
    });
  };

  // --- Target Bonuses Handlers ---
  const handleAddTargetBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'targetBonuses'), {
        ...newTargetBonus,
        amount: Number(newTargetBonus.amount),
        packagePrice: Number(newTargetBonus.packagePrice),
        referralsNeeded: Number(newTargetBonus.referralsNeeded),
        createdAt: new Date()
      });
      setNewTargetBonus({ title: '', amount: 0, packagePrice: 0, referralsNeeded: 0 });
      showAlert("Target Bonus added successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'targetBonuses');
    }
  };

  const handleDeleteTargetBonus = async (id: string) => {
    if (!isAdmin) return;
    showConfirm("Delete this target bonus?", async () => {
      try {
        await deleteDoc(doc(db, 'targetBonuses', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `targetBonuses/${id}`);
      }
    });
  };

  // --- Gift Bonuses Handlers ---
  const handleAddGiftBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'giftBonuses'), {
        ...newGiftBonus,
        amount: Number(newGiftBonus.amount),
        createdAt: new Date()
      });
      setNewGiftBonus({ title: '', amount: 0, redeemCode: '' });
      showAlert("Gift Bonus added successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'giftBonuses');
    }
  };

  const handleDeleteGiftBonus = async (id: string) => {
    if (!isAdmin) return;
    showConfirm("Delete this gift bonus?", async () => {
      try {
        await deleteDoc(doc(db, 'giftBonuses', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `giftBonuses/${id}`);
      }
    });
  };

  // --- Welcome Bonuses Handlers ---
  const handleAddWelcomeBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'welcomeBonuses'), {
        ...newWelcomeBonus,
        amount: Number(newWelcomeBonus.amount),
        createdAt: new Date()
      });
      setNewWelcomeBonus({ title: '', description: '', amount: 0 });
      showAlert("Welcome Bonus added successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'welcomeBonuses');
    }
  };

  const handleDeleteWelcomeBonus = async (id: string) => {
    if (!isAdmin) return;
    showConfirm("Delete this welcome bonus?", async () => {
      try {
        await deleteDoc(doc(db, 'welcomeBonuses', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `welcomeBonuses/${id}`);
      }
    });
  };

  // --- Facebook Sell Handlers ---
  const handleAddFbPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'facebookSellPosts'), {
        ...newFbPost,
        amount: Number(newFbPost.amount),
        isActive: true,
        createdAt: new Date()
      });
      setNewFbPost({ title: '', description: '', amount: 0 });
      showAlert("Facebook Sell post added!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'facebookSellPosts');
    }
  };

  const handleDeleteFbPost = async (id: string) => {
    if (!isAdmin) return;
    showConfirm("Delete this post?", async () => {
      try {
        await deleteDoc(doc(db, 'facebookSellPosts', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `facebookSellPosts/${id}`);
      }
    });
  };

  const handleDeleteFbSubmission = async (id: string) => {
    if (!isAdmin) return;
    showConfirm("Delete this submission?", async () => {
      try {
        await deleteDoc(doc(db, 'facebookSellSubmissions', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `facebookSellSubmissions/${id}`);
      }
    });
  };

  // --- Gmail Sell Handlers ---
  const handleAddGmailPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'gmailSellPosts'), {
        ...newGmailPost,
        amount: Number(newGmailPost.amount),
        isActive: true,
        createdAt: new Date()
      });
      setNewGmailPost({ title: '', description: '', amount: 0, requiredPassword: '' });
      showAlert("Gmail Sell post added!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gmailSellPosts');
    }
  };

  const handleDeleteGmailPost = async (id: string) => {
    if (!isAdmin) return;
    showConfirm("Delete this post?", async () => {
      try {
        await deleteDoc(doc(db, 'gmailSellPosts', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `gmailSellPosts/${id}`);
      }
    });
  };

  const handleDeleteGmailSubmission = async (id: string) => {
    if (!isAdmin) return;
    showConfirm("Delete this submission?", async () => {
      try {
        await deleteDoc(doc(db, 'gmailSellSubmissions', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `gmailSellSubmissions/${id}`);
      }
    });
  };

  // --- Daily Bonus Handlers ---
  const handleSaveDailyBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await setDoc(doc(db, 'settings', 'dailyBonus'), { amount: Number(dailyBonus.amount) });
      showAlert("Daily Bonus updated!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/dailyBonus');
    }
  };

  // --- Spin Bonus Handlers ---
  const handleSaveSpinBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await setDoc(doc(db, 'settings', 'spinBonus'), spinBonus);
      showAlert("Spin Bonus updated!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/spinBonus');
    }
  };

  const handleSavePaymentMethods = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await setDoc(doc(db, 'settings', 'paymentMethods'), paymentMethods);
      showAlert("Payment Methods updated!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/paymentMethods');
    }
  };

  const updateSpinSegment = (index: number, field: string, value: string | number) => {
    const newSegments = [...spinBonus.segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    setSpinBonus({ segments: newSegments });
  };

  // --- Monthly Salary Handlers ---
  const handleAddMonthlySalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'monthlySalaries'), {
        ...newMonthlySalary,
        amount: Number(newMonthlySalary.amount),
        target: Number(newMonthlySalary.target),
        createdAt: new Date()
      });
      setNewMonthlySalary({ title: '', description: '', amount: 0, target: 0 });
      showAlert("Monthly Salary added!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'monthlySalaries');
    }
  };

  const handleDeleteMonthlySalary = async (id: string) => {
    if (!isAdmin) return;
    showConfirm("Delete this monthly salary?", async () => {
      try {
        await deleteDoc(doc(db, 'monthlySalaries', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `monthlySalaries/${id}`);
      }
    });
  };

  // --- Leadership Salary Handlers ---
  const handleAddLeadershipSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'leadershipSalaries'), {
        ...newLeadershipSalary,
        amount: Number(newLeadershipSalary.amount),
        target: Number(newLeadershipSalary.target),
        createdAt: new Date()
      });
      setNewLeadershipSalary({ title: '', description: '', amount: 0, target: 0 });
      showAlert("Leadership Salary added!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leadershipSalaries');
    }
  };

  const handleDeleteLeadershipSalary = async (id: string) => {
    if (!isAdmin) return;
    showConfirm("Delete this leadership salary?", async () => {
      try {
        await deleteDoc(doc(db, 'leadershipSalaries', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `leadershipSalaries/${id}`);
      }
    });
  };

  // --- Video Earn Handlers ---
  const handleAddVideoTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'videoEarnTasks'), {
        ...newVideoTask,
        reward: Number(newVideoTask.reward),
        duration: Number(newVideoTask.duration),
        createdAt: new Date()
      });
      setNewVideoTask({ title: '', reward: 0, duration: 0, videoUrl: '' });
      showAlert("Video Earn task added!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'videoEarnTasks');
    }
  };

  const handleDeleteVideoTask = async (id: string) => {
    if (!isAdmin) return;
    showConfirm("Delete this video task?", async () => {
      try {
        await deleteDoc(doc(db, 'videoEarnTasks', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `videoEarnTasks/${id}`);
      }
    });
  };

  const cancelEditJob = () => {
    setEditingJobId(null);
  };

  const handleApproveSubmission = async (collectionName: string, submission: any) => {
    if (!isAdmin) return;
    showConfirm(`Approve submission and add ৳${submission.amount} to ${submission.userName}'s balance?`, async () => {
      try {
        await setDoc(doc(db, collectionName, submission.id), { status: 'approved' }, { merge: true });
        
        const userRef = doc(db, 'users', submission.userId);
        const { getDoc } = await import('firebase/firestore');
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentBalance = userSnap.data().balance || 0;
          await setDoc(userRef, { balance: currentBalance + submission.amount }, { merge: true });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${submission.id}`);
      }
    });
  };

  const handleRejectSubmission = async (collectionName: string, id: string) => {
    if (!isAdmin) return;
    showConfirm("Reject this submission?", async () => {
      try {
        await setDoc(doc(db, collectionName, id), { status: 'rejected' }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
      }
    });
  };

  const handleApproveDeposit = async (deposit: any) => {
    if (!isAdmin) return;
    showConfirm(`Approve deposit of ${deposit.amount} BDT for ${deposit.userName}?`, async () => {
      try {
        // Update deposit status
        await setDoc(doc(db, 'deposits', deposit.id), { status: 'approved' }, { merge: true });
        
        // Update user balance
        const userRef = doc(db, 'users', deposit.userId);
        const { getDoc } = await import('firebase/firestore');
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentBalance = userSnap.data().balance || 0;
          await setDoc(userRef, { balance: currentBalance + deposit.amount }, { merge: true });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `deposits/${deposit.id}`);
      }
    });
  };

  const handleRejectDeposit = async (id: string) => {
    if (!isAdmin) return;
    showConfirm("Reject this deposit request?", async () => {
      try {
        await setDoc(doc(db, 'deposits', id), { status: 'rejected' }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `deposits/${id}`);
      }
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
        <ShieldAlert className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6 text-center">You do not have permission to view this page.</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg">Go Home</button>
      </div>
    );
  }

  return (
    <>
      <ConfirmModal 
        isOpen={confirmDialog?.isOpen || false}
        onClose={() => setConfirmDialog(null)}
        onConfirm={() => {
          if (confirmDialog?.onConfirm) confirmDialog.onConfirm();
        }}
        message={confirmDialog?.message || ''}
      />
      <AlertModal 
        isOpen={alertDialog?.isOpen || false}
        onClose={() => setAlertDialog(null)}
        message={alertDialog?.message || ''}
      />
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-emerald-800 text-white p-4 flex justify-between items-center shadow-md z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1.5 hover:bg-emerald-700 rounded-md transition">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">অ্যাডমিন প্যানেল</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-emerald-700 rounded-md transition">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-64 bg-emerald-800 text-white flex-col shadow-xl z-20 absolute md:relative min-h-screen md:min-h-0`}>
        <div className="hidden md:flex p-4 items-center gap-3 border-b border-emerald-700">
          <button onClick={() => navigate('/')} className="p-1.5 hover:bg-emerald-700 rounded-md transition">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">অ্যাডমিন প্যানেল</h1>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'dashboard' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <LayoutDashboard size={20} /> ড্যাশবোর্ড
          </button>
          <button onClick={() => { setActiveTab('grid'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'grid' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Grid size={20} /> গ্রিড অপশন
          </button>
          <button onClick={() => { setActiveTab('premiumJobs'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'premiumJobs' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Briefcase size={20} /> প্রিমিয়াম জবস
          </button>
          <button onClick={() => { setActiveTab('microJobs'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'microJobs' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Briefcase size={20} /> ছোট কাজ
          </button>
          <button onClick={() => { setActiveTab('dailyTasks'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'dailyTasks' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Briefcase size={20} /> দৈনিক কাজ
          </button>
          <button onClick={() => { setActiveTab('targetBonus'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'targetBonus' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Target size={20} /> টার্গেট বোনাস
          </button>
          <button onClick={() => { setActiveTab('giftBonus'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'giftBonus' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Gift size={20} /> গিফট বোনাস
          </button>
          <button onClick={() => { setActiveTab('welcomeBonus'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'welcomeBonus' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Gift size={20} /> স্বাগতম বোনাস
          </button>
          <button onClick={() => { setActiveTab('dailyBonus'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'dailyBonus' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Gift size={20} /> দৈনিক বোনাস
          </button>
          <button onClick={() => { setActiveTab('spinBonus'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'spinBonus' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Gift size={20} /> স্পিন বোনাস
          </button>
          <button onClick={() => { setActiveTab('monthlySalary'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'monthlySalary' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Award size={20} /> মাসিক বেতন
          </button>
          <button onClick={() => { setActiveTab('leadershipSalary'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'leadershipSalary' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Award size={20} /> লিডারশিপ বেতন
          </button>
          <button onClick={() => { setActiveTab('videoEarn'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'videoEarn' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Video size={20} /> ভিডিও আর্ন
          </button>
          <button onClick={() => { setActiveTab('facebookSell'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'facebookSell' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Gift size={20} /> ফেসবুক সেল
          </button>
          <button onClick={() => { setActiveTab('gmailSell'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'gmailSell' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Gift size={20} /> জিমেইল সেল
          </button>
          <button onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'users' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Users size={20} /> ইউজার ম্যানেজমেন্ট
          </button>
          <button onClick={() => { setActiveTab('referSettings'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'referSettings' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Users size={20} /> রেফার সেটিংস
          </button>
          <button onClick={() => { setActiveTab('deposits'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'deposits' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <CreditCard size={20} /> ডিপোজিট
            {stats.pendingDeposits > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{stats.pendingDeposits}</span>}
          </button>
          <button onClick={() => { setActiveTab('depositSettings'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'depositSettings' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <Settings size={20} /> ডিপোজিট সেটিংস
          </button>
          <button onClick={() => { setActiveTab('payments'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${activeTab === 'payments' ? 'bg-emerald-700 border-l-4 border-emerald-400' : 'hover:bg-emerald-700/50 border-l-4 border-transparent'}`}>
            <CreditCard size={20} /> পেমেন্ট
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800">ড্যাশবোর্ড ওভারভিউ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Users size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">মোট ইউজার</p>
                    <p className="text-xl font-bold text-gray-900">{usersList.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><Briefcase size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">সক্রিয় মেম্বার</p>
                    <p className="text-xl font-bold text-gray-900">{usersList.filter(u => u.balance > 0).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center"><Users size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">ভেরিফাইড না</p>
                    <p className="text-xl font-bold text-gray-900">{usersList.filter(u => !u.balance || u.balance === 0).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><CreditCard size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">প্রিমিয়াম ইউজার</p>
                    <p className="text-xl font-bold text-gray-900">{deposits.filter(d => d.status === 'approved').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center"><CreditCard size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">মোট উত্তোলন</p>
                    <p className="text-xl font-bold text-gray-900">{withdrawals.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center"><Briefcase size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">ফেসবুক সেল সাবমিট</p>
                    <p className="text-xl font-bold text-gray-900">{fbSubmissions.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center"><Briefcase size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">জিমেইল সেল সাবমিট</p>
                    <p className="text-xl font-bold text-gray-900">{gmailSubmissions.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center"><Users size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">মোট রেফার</p>
                    <p className="text-xl font-bold text-gray-900">{usersList.filter(u => u.referredBy).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center"><Briefcase size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">ছোট কাজ (Microjobs)</p>
                    <p className="text-xl font-bold text-gray-900">{microJobs.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><Target size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">টার্গেট বোনাস</p>
                    <p className="text-xl font-bold text-gray-900">{targetBonuses.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center"><Gift size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">স্বাগতম বোনাস</p>
                    <p className="text-xl font-bold text-gray-900">{welcomeBonuses.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center"><Gift size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">গিফট বোনাস</p>
                    <p className="text-xl font-bold text-gray-900">{giftBonuses.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center"><Gift size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">স্পিন বোনাস</p>
                    <p className="text-xl font-bold text-gray-900">{spinBonus.segments ? spinBonus.segments.length : 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-fuchsia-100 text-fuchsia-600 rounded-xl flex items-center justify-center"><Video size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">ভিডিও আর্ন</p>
                    <p className="text-xl font-bold text-gray-900">{videoTasks.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grid' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">গ্রিড অপশন</h2>
              <button onClick={() => setShowAddGrid(!showAddGrid)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                <Plus size={20} /> নতুন অপশন যোগ করুন
              </button>
            </div>

            {showAddGrid && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">নতুন গ্রিড অপশন যোগ করুন</h3>
                <form onSubmit={handleAddGridOption} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">শিরোনাম</label>
                    <input required type="text" value={newGridOption.title} onChange={e => setNewGridOption({...newGridOption, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: Special Task" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">আইকন আইডি (যেমন: StarIcon)</label>
                    <input required type="text" value={newGridOption.iconId} onChange={e => setNewGridOption({...newGridOption, iconId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="StarIcon" />
                  </div>
                  <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition">যোগ করুন</button>
                </form>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {options.sort((a, b) => a.order - b.order).map((opt) => (
                  <div key={opt.id} className={`p-4 flex items-center justify-between transition-colors ${opt.isActive ? 'bg-white' : 'bg-gray-50 opacity-75'}`}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-mono">
                        {opt.iconId.replace('Icon', '')}
                      </div>
                      {editingId === opt.id ? (
                        <div className="flex items-center gap-2 flex-1 max-w-xs">
                          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="flex-1 px-3 py-1.5 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" autoFocus />
                          <button onClick={() => saveEdit(opt.id)} className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200"><Save size={18} /></button>
                        </div>
                      ) : (
                        <div>
                          <h3 className={`font-medium ${opt.isActive ? 'text-gray-900' : 'text-gray-500 line-through'}`}>{opt.title}</h3>
                          <p className="text-xs text-gray-400">ID: {opt.id} • Order: {opt.order}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingId !== opt.id && (
                        <button onClick={() => startEditing(opt.id, opt.title)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit Name"><Edit2 size={18} /></button>
                      )}
                      <button onClick={() => handleToggleVisibility(opt.id, opt.isActive)} className={`p-2 rounded-lg transition flex items-center gap-2 ${opt.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`} title={opt.isActive ? "Hide Option" : "Show Option"}>
                        {opt.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'premiumJobs' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800">প্রিমিয়াম জবস ম্যানেজমেন্ট</h2>
            
            {/* Add New Job Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Plus size={20}/> নতুন জব পোস্ট করুন</h3>
              </div>
              <form onSubmit={handleAddJob} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">জবের শিরোনাম</label>
                    <input required type="text" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: Watch YouTube Video" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">মেয়াদ (সময়কাল)</label>
                    <input required type="text" value={newJob.expiredDate} onChange={e => setNewJob({...newJob, expiredDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: 7 Days" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">মূল্য (৳)</label>
                    <input required type="number" min="0" value={newJob.price} onChange={e => setNewJob({...newJob, price: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">দৈনিক রিওয়ার্ড (৳)</label>
                    <input required type="number" min="0" value={newJob.dailyReward} onChange={e => setNewJob({...newJob, dailyReward: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="প্রতিদিনের পরিমাণ" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ক্রেতার সীমা</label>
                    <input required type="number" min="1" value={newJob.buyerLimit} onChange={e => setNewJob({...newJob, buyerLimit: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">থাম্বনেইল URL (ঐচ্ছিক)</label>
                  <input type="url" value={newJob.thumbnail} onChange={e => setNewJob({...newJob, thumbnail: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="https://example.com/image.jpg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">নির্দেশিকা / বিবরণ</label>
                  <textarea required rows={4} value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="ব্যবহারকারীর জন্য বিস্তারিত নির্দেশিকা..."></textarea>
                </div>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition">জব পোস্ট করুন</button>
              </form>
            </div>

            {/* Jobs List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">বিদ্যমান জবসমূহ</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {premiumJobs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">এখনও কোনো জব পোস্ট করা হয়নি।</div>
                ) : (
                  premiumJobs.map(job => (
                    <div key={job.id} className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${job.isActive ? '' : 'bg-gray-50 opacity-75'}`}>
                      {editingJobId === job.id ? (
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">শিরোনাম</label>
                              <input type="text" value={editJobForm.title} onChange={e => setEditJobForm({...editJobForm, title: e.target.value})} className="w-full px-3 py-1.5 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="শিরোনাম" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">থাম্বনেইল URL</label>
                              <input type="url" value={editJobForm.thumbnail} onChange={e => setEditJobForm({...editJobForm, thumbnail: e.target.value})} className="w-full px-3 py-1.5 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="থাম্বনেইল URL" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">মেয়াদ</label>
                              <input type="text" value={editJobForm.expiredDate} onChange={e => setEditJobForm({...editJobForm, expiredDate: e.target.value})} className="w-full px-3 py-1.5 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="মেয়াদ" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">মূল্য (৳)</label>
                              <input type="number" value={editJobForm.price} onChange={e => setEditJobForm({...editJobForm, price: Number(e.target.value)})} className="w-full px-3 py-1.5 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="মূল্য" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">দৈনিক রিওয়ার্ড (৳)</label>
                              <input type="number" value={editJobForm.dailyReward} onChange={e => setEditJobForm({...editJobForm, dailyReward: Number(e.target.value)})} className="w-full px-3 py-1.5 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="দৈনিক রিওয়ার্ড" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">ক্রেতার সীমা</label>
                              <input type="number" value={editJobForm.buyerLimit} onChange={e => setEditJobForm({...editJobForm, buyerLimit: Number(e.target.value)})} className="w-full px-3 py-1.5 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="সীমা" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">বিবরণ</label>
                            <textarea rows={2} value={editJobForm.description} onChange={e => setEditJobForm({...editJobForm, description: e.target.value})} className="w-full px-3 py-1.5 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="বিবরণ"></textarea>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => saveEditJob(job.id)} className="px-4 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm font-medium">সংরক্ষণ করুন</button>
                            <button onClick={cancelEditJob} className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium">বাতিল</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start gap-4">
                            {job.thumbnail && (
                              <img src={job.thumbnail} alt={job.title} className="w-16 h-16 object-cover rounded-lg border border-gray-200" referrerPolicy="no-referrer" />
                            )}
                            <div>
                              <h4 className="font-bold text-gray-900">{job.title}</h4>
                              <p className="text-sm text-gray-500 line-clamp-1">{job.description}</p>
                              <div className="flex gap-3 mt-2 text-xs font-medium">
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">⏱ {job.expiredDate}</span>
                                <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded">মূল্য: ৳{job.price}</span>
                                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">দৈনিক: ৳{job.dailyReward || 0}</span>
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded">ক্রেতা: {job.buyersCount || 0} / {job.buyerLimit}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-end md:self-auto">
                            <button onClick={() => startEditingJob(job)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition" title="Edit Job">
                              <Edit2 size={20} />
                            </button>
                            <button onClick={() => handleToggleJobStatus(job.id, job.isActive)} className={`px-3 py-1.5 rounded text-sm font-medium ${job.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                              {job.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                            </button>
                            <button onClick={() => handleDeleteJob(job.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition" title="Delete Job">
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deposits' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">ডিপোজিট রিকোয়েস্ট</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {deposits.length === 0 ? (
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 opacity-75">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900">Demo User</h4>
                        <span className="text-sm text-gray-500">(demo@example.com)</span>
                      </div>
                      <div className="flex gap-3 mt-2 text-xs font-medium">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">পরিমাণ: ৳500</span>
                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">মাধ্যম: bKash</span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">TrxID: 8J9K2L3M4N</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        {new Date().toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <button onClick={() => showAlert('এটি একটি ডেমো রিকোয়েস্ট')} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded font-medium text-sm transition">
                        অনুমোদন করুন
                      </button>
                      <button onClick={() => showAlert('এটি একটি ডেমো রিকোয়েস্ট')} className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded font-medium text-sm transition">
                        বাতিল করুন
                      </button>
                    </div>
                  </div>
                ) : (
                  deposits.map(deposit => (
                    <div key={deposit.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedDeposit(deposit)}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">{deposit.userName}</h4>
                          <span className="text-sm text-gray-500">({deposit.userEmail})</span>
                        </div>
                        <div className="flex gap-3 mt-2 text-xs font-medium">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">পরিমাণ: ৳{deposit.amount}</span>
                          <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">মাধ্যম: {deposit.method}</span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">TrxID: {deposit.transactionId}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          {deposit.createdAt?.toDate().toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end md:self-auto" onClick={(e) => e.stopPropagation()}>
                        {deposit.status === 'pending' ? (
                          <>
                            <button onClick={() => handleApproveDeposit(deposit)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition">অনুমোদন করুন</button>
                            <button onClick={() => handleRejectDeposit(deposit.id)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition">বাতিল করুন</button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${deposit.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {deposit.status === 'approved' ? 'অনুমোদিত' : 'বাতিলকৃত'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Deposit Details Modal */}
        {selectedDeposit && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-xl font-bold text-gray-900">ডিপোজিট বিবরণ</h3>
                <button onClick={() => setSelectedDeposit(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">ইউজারের নাম</p>
                  <p className="font-medium text-gray-900">{selectedDeposit.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ইউজারের ইমেইল</p>
                  <p className="font-medium text-gray-900">{selectedDeposit.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">পাঠানো পরিমাণ</p>
                  <p className="font-bold text-emerald-600 text-lg">৳{selectedDeposit.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">পেমেন্ট মাধ্যম</p>
                  <p className="font-medium text-gray-900">{selectedDeposit.method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">প্রেরকের নম্বর</p>
                  <p className="font-medium text-gray-900">{selectedDeposit.senderNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ট্রানজেকশন আইডি</p>
                  <p className="font-mono text-gray-900 bg-gray-100 p-2 rounded mt-1">{selectedDeposit.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">তারিখ ও সময়</p>
                  <p className="font-medium text-gray-900">{selectedDeposit.createdAt?.toDate().toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">স্ট্যাটাস</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${selectedDeposit.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : selectedDeposit.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {selectedDeposit.status === 'approved' ? 'অনুমোদিত' : selectedDeposit.status === 'rejected' ? 'বাতিলকৃত' : 'অপেক্ষমাণ'}
                  </span>
                </div>

                {selectedDeposit.status === 'pending' && (
                  <div className="pt-4 border-t flex gap-3">
                    <button onClick={() => { handleApproveDeposit(selectedDeposit); setSelectedDeposit(null); }} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition">
                      অনুমোদন করুন
                    </button>
                    <button onClick={() => { handleRejectDeposit(selectedDeposit.id); setSelectedDeposit(null); }} className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 transition">
                      বাতিল করুন
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Withdrawal Details Modal */}
        {selectedWithdrawal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-xl font-bold text-gray-900">উত্তোলনের বিবরণ</h3>
                <button onClick={() => setSelectedWithdrawal(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">ইউজারের নাম</p>
                  <p className="font-medium text-gray-900">{selectedWithdrawal.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ইউজারের ইমেইল</p>
                  <p className="font-medium text-gray-900">{selectedWithdrawal.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">অনুরোধকৃত পরিমাণ</p>
                  <p className="font-bold text-emerald-600 text-lg">৳{selectedWithdrawal.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">পেমেন্ট মাধ্যম</p>
                  <p className="font-medium text-gray-900">{selectedWithdrawal.method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">গ্রহীতার নম্বর</p>
                  <p className="font-medium text-gray-900">{selectedWithdrawal.number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">তারিখ ও সময়</p>
                  <p className="font-medium text-gray-900">{selectedWithdrawal.createdAt?.toDate().toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">স্ট্যাটাস</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${selectedWithdrawal.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : selectedWithdrawal.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {selectedWithdrawal.status === 'approved' ? 'অনুমোদিত' : selectedWithdrawal.status === 'rejected' ? 'বাতিলকৃত' : 'অপেক্ষমাণ'}
                  </span>
                </div>

                {selectedWithdrawal.status === 'pending' && (
                  <div className="pt-4 border-t flex gap-3">
                    <button onClick={() => { handleApproveWithdrawal(selectedWithdrawal); setSelectedWithdrawal(null); }} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition">
                      অনুমোদন করুন
                    </button>
                    <button onClick={() => { handleRejectWithdrawal(selectedWithdrawal.id); setSelectedWithdrawal(null); }} className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 transition">
                      বাতিল করুন
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dailyBonus' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800">ডেইলি বোনাস সেটিংস</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <form onSubmit={handleSaveDailyBonus} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ডেইলি বোনাসের পরিমাণ (৳)</label>
                  <input required type="number" min="0" value={dailyBonus.amount} onChange={e => setDailyBonus({ amount: Number(e.target.value) })} className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition">সেটিংস সংরক্ষণ করুন</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'spinBonus' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800">স্পিন বোনাস সেটিংস</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <form onSubmit={handleSaveSpinBonus} className="space-y-4">
                <div className="space-y-4">
                  {spinBonus.segments.map((segment, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 items-end border-b pb-4 last:border-0">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">লেবেল (চাকায় লেখা)</label>
                        <input required type="text" value={segment.label} onChange={e => updateSpinSegment(index, 'label', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">মান (৳)</label>
                        <input required type="number" min="0" value={segment.value} onChange={e => updateSpinSegment(index, 'value', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">সম্ভাবনা (%)</label>
                        <input required type="number" min="0" max="100" value={segment.probability} onChange={e => updateSpinSegment(index, 'probability', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                  <strong>নোট:</strong> নিশ্চিত করুন যে মোট সম্ভাবনা ঠিক ১০০% হয়। বর্তমান মোট: {spinBonus.segments.reduce((acc, curr) => acc + curr.probability, 0)}%
                </div>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition">সেটিংস সংরক্ষণ করুন</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'monthlySalary' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800">মাসিক বেতন ম্যানেজমেন্ট</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Edit2 size={20}/> স্যালারি টিয়ার যোগ করুন</h3>
              <form onSubmit={handleAddMonthlySalary} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">শিরোনাম</label>
                    <input required type="text" value={newMonthlySalary.title} onChange={e => setNewMonthlySalary({...newMonthlySalary, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: Level 1 Salary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ডেসক্রিপশন</label>
                    <input required type="text" value={newMonthlySalary.description} onChange={e => setNewMonthlySalary({...newMonthlySalary, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="শর্তসমূহ" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ (৳)</label>
                    <input required type="number" min="0" value={newMonthlySalary.amount} onChange={e => setNewMonthlySalary({...newMonthlySalary, amount: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">টার্গেট (রেফারেল/পয়েন্ট)</label>
                    <input required type="number" min="0" value={newMonthlySalary.target} onChange={e => setNewMonthlySalary({...newMonthlySalary, target: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition">টিয়ার যোগ করুন</button>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">সক্রিয় স্যালারি টিয়ার</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {monthlySalaries.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">এখনও কোনো স্যালারি টিয়ার তৈরি করা হয়নি।</div>
                ) : (
                  monthlySalaries.map(salary => (
                    <div key={salary.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{salary.title}</h4>
                        <p className="text-sm text-gray-500">{salary.description}</p>
                        <p className="text-sm font-medium text-emerald-600 mt-1">Amount: ৳{salary.amount} | Target: {salary.target}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDeleteMonthlySalary(salary.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">মাসিক বেতন রিকোয়েস্ট</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {monthlySalarySubmissions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">কোনো রিকোয়েস্ট নেই।</div>
                ) : (
                  monthlySalarySubmissions.map(sub => (
                    <div key={sub.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{sub.userName} <span className="text-sm font-normal text-gray-500">({sub.userEmail})</span></h4>
                        <p className="text-sm text-gray-600">বেতন: {sub.salaryTitle}</p>
                        <p className="text-sm font-medium text-emerald-600">পরিমাণ: ৳{sub.amount}</p>
                        <p className="text-xs text-gray-400 mt-1">{sub.createdAt?.toDate().toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {sub.status === 'pending' ? (
                          <>
                            <button onClick={() => handleApproveSubmission('monthlySalarySubmissions', sub)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition">অনুমোদন</button>
                            <button onClick={() => handleRejectSubmission('monthlySalarySubmissions', sub.id)} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition">বাতিল</button>
                          </>
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs font-bold ${sub.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {sub.status === 'approved' ? 'অনুমোদিত' : 'বাতিলকৃত'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leadershipSalary' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800">লিডারশিপ বেতন ম্যানেজমেন্ট</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Edit2 size={20}/> লিডারশিপ টিয়ার যোগ করুন</h3>
              <form onSubmit={handleAddLeadershipSalary} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">শিরোনাম</label>
                    <input required type="text" value={newLeadershipSalary.title} onChange={e => setNewLeadershipSalary({...newLeadershipSalary, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: Bronze Leader" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ডেসক্রিপশন</label>
                    <input required type="text" value={newLeadershipSalary.description} onChange={e => setNewLeadershipSalary({...newLeadershipSalary, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="শর্তসমূহ" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ (৳)</label>
                    <input required type="number" min="0" value={newLeadershipSalary.amount} onChange={e => setNewLeadershipSalary({...newLeadershipSalary, amount: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">টার্গেট (টিমের আকার)</label>
                    <input required type="number" min="0" value={newLeadershipSalary.target} onChange={e => setNewLeadershipSalary({...newLeadershipSalary, target: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition">টিয়ার যোগ করুন</button>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">সক্রিয় লিডারশিপ টিয়ার</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {leadershipSalaries.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">এখনও কোনো লিডারশিপ টিয়ার তৈরি করা হয়নি।</div>
                ) : (
                  leadershipSalaries.map(salary => (
                    <div key={salary.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{salary.title}</h4>
                        <p className="text-sm text-gray-500">{salary.description}</p>
                        <p className="text-sm font-medium text-emerald-600 mt-1">Amount: ৳{salary.amount} | Target: {salary.target}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDeleteLeadershipSalary(salary.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">লিডারশিপ বেতন রিকোয়েস্ট</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {leadershipSalarySubmissions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">কোনো রিকোয়েস্ট নেই।</div>
                ) : (
                  leadershipSalarySubmissions.map(sub => (
                    <div key={sub.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{sub.userName} <span className="text-sm font-normal text-gray-500">({sub.userEmail})</span></h4>
                        <p className="text-sm text-gray-600">বেতন: {sub.salaryTitle}</p>
                        <p className="text-sm font-medium text-emerald-600">পরিমাণ: ৳{sub.amount}</p>
                        <p className="text-xs text-gray-400 mt-1">{sub.createdAt?.toDate().toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {sub.status === 'pending' ? (
                          <>
                            <button onClick={() => handleApproveSubmission('leadershipSalarySubmissions', sub)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition">অনুমোদন</button>
                            <button onClick={() => handleRejectSubmission('leadershipSalarySubmissions', sub.id)} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition">বাতিল</button>
                          </>
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs font-bold ${sub.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {sub.status === 'approved' ? 'অনুমোদিত' : 'বাতিলকৃত'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'videoEarn' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800">ভিডিও আর্ন ম্যানেজমেন্ট</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Edit2 size={20}/> ভিডিও টাস্ক যোগ করুন</h3>
              <form onSubmit={handleAddVideoTask} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">শিরোনাম</label>
                    <input required type="text" value={newVideoTask.title} onChange={e => setNewVideoTask({...newVideoTask, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: Watch YouTube Video" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">রিওয়ার্ড (৳)</label>
                    <input required type="number" min="0" value={newVideoTask.reward} onChange={e => setNewVideoTask({...newVideoTask, reward: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">সময়কাল (সেকেন্ড)</label>
                    <input required type="number" min="0" value={newVideoTask.duration} onChange={e => setNewVideoTask({...newVideoTask, duration: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ভিডিও URL (YouTube Embed)</label>
                    <input required type="text" value={newVideoTask.videoUrl} onChange={e => setNewVideoTask({...newVideoTask, videoUrl: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="https://www.youtube.com/embed/..." />
                  </div>
                </div>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition">ভিডিও টাস্ক যোগ করুন</button>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">সক্রিয় ভিডিও টাস্ক</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {videoTasks.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">এখনও কোনো ভিডিও টাস্ক তৈরি করা হয়নি।</div>
                ) : (
                  videoTasks.map(task => (
                    <div key={task.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-500 truncate max-w-md">{task.videoUrl}</p>
                        <p className="text-sm font-medium text-emerald-600 mt-1">Reward: ৳{task.reward} | Duration: {task.duration}s</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDeleteVideoTask(task.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'referSettings' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800">রেফার সেটিংস</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">ইউজার রেফারেল তালিকা</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {usersList.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">কোনো ইউজার পাওয়া যায়নি।</div>
                ) : (
                  usersList.map(u => {
                    const referredUsers = usersList.filter(user => user.referredBy === u.referId);
                    const activeReferred = referredUsers.filter(user => user.balance > 0).length;
                    const inactiveReferred = referredUsers.length - activeReferred;
                    
                    return (
                      <div key={u.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900">{u.name || 'অজানা ইউজার'}</h4>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-bold">কোড: {u.referId}</span>
                          </div>
                          <p className="text-sm text-gray-500">{u.email}</p>
                          <div className="mt-2 flex gap-4 text-sm">
                            <span className="text-gray-600">মোট রেফার: <strong className="text-gray-900">{referredUsers.length}</strong></span>
                            <span className="text-emerald-600">সক্রিয়: <strong>{activeReferred}</strong></span>
                            <span className="text-red-600">ভেরিফাইড না: <strong>{inactiveReferred}</strong></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setManageReferUser(u)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">ম্যানেজ করুন</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Manage Refer Modal */}
            {manageReferUser && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">{manageReferUser.name} এর রেফার ম্যানেজ করুন</h3>
                  <div className="space-y-3">
                    <button onClick={async () => {
                       showConfirm('আপনি কি নিশ্চিত যে এই ইউজারের রেফার মুছে ফেলতে চান?', async () => {
                         try {
                           await setDoc(doc(db, 'users', manageReferUser.id), { referredBy: null }, { merge: true });
                           setManageReferUser(null);
                           showAlert('রেফার মুছে ফেলা হয়েছে।');
                         } catch (error) {
                           console.error(error);
                         }
                       });
                    }} className="w-full py-3 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl font-bold transition">রেফার মুছে ফেলুন (Remove Refer)</button>
                    
                    <button onClick={async () => {
                       showConfirm('আপনি কি নিশ্চিত যে এই ইউজারকে ব্যান করতে চান?', async () => {
                         try {
                           await setDoc(doc(db, 'users', manageReferUser.id), { isBanned: true }, { merge: true });
                           setManageReferUser(null);
                           showAlert('ইউজারকে ব্যান করা হয়েছে।');
                         } catch (error) {
                           console.error(error);
                         }
                       });
                    }} className="w-full py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold transition">ইউজার ব্যান করুন (Ban User)</button>
                    
                    <button onClick={async () => {
                       showConfirm('আপনি কি নিশ্চিত যে এই ইউজারকে ডিলিট করতে চান? এই কাজ বাতিল করা যাবে না।', async () => {
                         try {
                           await deleteDoc(doc(db, 'users', manageReferUser.id));
                           setManageReferUser(null);
                           showAlert('ইউজার ডিলিট করা হয়েছে।');
                         } catch (error) {
                           console.error(error);
                         }
                       });
                    }} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">ইউজার ডিলিট করুন (Delete User)</button>
                  </div>
                  <button onClick={() => setManageReferUser(null)} className="mt-4 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition">বাতিল করুন</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">ইউজার ম্যানেজমেন্ট</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {usersList.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">কোনো ইউজার পাওয়া যায়নি।</div>
                ) : (
                  usersList.map(u => (
                    <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer" onClick={() => { setSelectedUser(u); setEditBalance(u.balance || 0); }}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                          {u.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{u.name || 'অজানা ইউজার'}</h4>
                          <p className="text-sm text-gray-500">{u.phone || u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-emerald-600">৳{u.balance || 0}</span>
                        {u.isBanned && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">নিষিদ্ধ</span>}
                        <ChevronRight size={20} className="text-gray-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-xl font-bold text-gray-900">ইউজারের বিবরণ</h3>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">নাম</p>
                  <p className="font-medium text-gray-900">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ইমেইল</p>
                  <p className="font-medium text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ফোন নম্বর</p>
                  <p className="font-medium text-gray-900">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">রেফারেল আইডি</p>
                  <p className="font-medium text-gray-900">{selectedUser.referId}</p>
                </div>
                
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ব্যালেন্স এডিট করুন (৳)</label>
                  <div className="flex gap-2">
                    <input type="number" value={editBalance} onChange={(e) => setEditBalance(Number(e.target.value))} className="flex-1 px-3 py-2 border border-gray-300 rounded-md" />
                    <button onClick={handleSaveUserBalance} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition">সংরক্ষণ করুন</button>
                  </div>
                </div>

                <div className="pt-4 border-t flex gap-3">
                  <button onClick={() => handleBanUser(selectedUser.id, selectedUser.isBanned)} className={`flex-1 py-2 rounded-lg font-medium transition ${selectedUser.isBanned ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}>
                    {selectedUser.isBanned ? 'নিষেধাজ্ঞা প্রত্যাহার করুন' : 'নিষিদ্ধ করুন'}
                  </button>
                  <button onClick={() => handleDeleteUser(selectedUser.id)} className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 transition">
                    ইউজার ডিলিট করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'depositSettings' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800">ডিপোজিট সেটিংস</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <form onSubmit={handleSavePaymentMethods} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">বিকাশ নাম্বার</label>
                    <div className="flex gap-2">
                      <select 
                        value={paymentMethods.bKashType || 'Personal'} 
                        onChange={(e) => setPaymentMethods({...paymentMethods, bKashType: e.target.value})}
                        className="w-1/3 px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="Personal">Personal</option>
                        <option value="Agent">Agent</option>
                      </select>
                      <input 
                        required
                        type="text" 
                        value={paymentMethods.bKash}
                        onChange={(e) => setPaymentMethods({...paymentMethods, bKash: e.target.value})}
                        className="w-2/3 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g. 01XXXXXXXXX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">নগদ নাম্বার</label>
                    <div className="flex gap-2">
                      <select 
                        value={paymentMethods.nagadType || 'Personal'} 
                        onChange={(e) => setPaymentMethods({...paymentMethods, nagadType: e.target.value})}
                        className="w-1/3 px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="Personal">Personal</option>
                        <option value="Agent">Agent</option>
                      </select>
                      <input 
                        required
                        type="text" 
                        value={paymentMethods.nagad}
                        onChange={(e) => setPaymentMethods({...paymentMethods, nagad: e.target.value})}
                        className="w-2/3 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g. 01XXXXXXXXX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">রকেট নাম্বার</label>
                    <div className="flex gap-2">
                      <select 
                        value={paymentMethods.rocketType || 'Personal'} 
                        onChange={(e) => setPaymentMethods({...paymentMethods, rocketType: e.target.value})}
                        className="w-1/3 px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="Personal">Personal</option>
                        <option value="Agent">Agent</option>
                      </select>
                      <input 
                        required
                        type="text" 
                        value={paymentMethods.rocket}
                        onChange={(e) => setPaymentMethods({...paymentMethods, rocket: e.target.value})}
                        className="w-2/3 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g. 01XXXXXXXXX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">উপায় নাম্বার</label>
                    <div className="flex gap-2">
                      <select 
                        value={paymentMethods.upayType || 'Personal'} 
                        onChange={(e) => setPaymentMethods({...paymentMethods, upayType: e.target.value})}
                        className="w-1/3 px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="Personal">Personal</option>
                        <option value="Agent">Agent</option>
                      </select>
                      <input 
                        required
                        type="text" 
                        value={paymentMethods.upay}
                        onChange={(e) => setPaymentMethods({...paymentMethods, upay: e.target.value})}
                        className="w-2/3 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g. 01XXXXXXXXX"
                      />
                    </div>
                  </div>
                </div>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition">সেটিংস সংরক্ষণ করুন</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">পেমেন্ট ওভারভিউ</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CreditCard size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">মোট পেইড</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {withdrawals.filter(w => w.status === 'approved').length}
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                  <Briefcase size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">হোল্ডিং</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {withdrawals.filter(w => w.status === 'pending').length}
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">বাতিল</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {withdrawals.filter(w => w.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">ইউজার উইথড্রয়াল রিকোয়েস্ট</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {withdrawals.length === 0 ? (
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 opacity-75">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900">ডেমো ইউজার</h4>
                        <span className="text-sm text-gray-500">(demo@example.com)</span>
                      </div>
                      <div className="flex gap-3 mt-2 text-xs font-medium">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">পরিমাণ: ৳200</span>
                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">পদ্ধতি: bKash</span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">নম্বর: 01700000000</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        {new Date().toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        অপেক্ষমান (ডেমো)
                      </span>
                    </div>
                  </div>
                ) : (
                  withdrawals.map(withdrawal => (
                    <div key={withdrawal.id} onClick={() => setSelectedWithdrawal(withdrawal)} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition cursor-pointer">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">{withdrawal.userName}</h4>
                          <span className="text-sm text-gray-500">({withdrawal.userEmail})</span>
                        </div>
                        <div className="flex gap-3 mt-2 text-xs font-medium">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">পরিমাণ: ৳{withdrawal.amount}</span>
                          <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">পদ্ধতি: {withdrawal.method}</span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">নম্বর: {withdrawal.number}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          {withdrawal.createdAt?.toDate().toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end md:self-auto" onClick={(e) => e.stopPropagation()}>
                        {withdrawal.status === 'pending' ? (
                          <>
                            <button onClick={() => handleApproveWithdrawal(withdrawal)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition">অনুমোদন করুন</button>
                            <button onClick={() => handleRejectWithdrawal(withdrawal.id)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition">বাতিল করুন</button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${withdrawal.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {withdrawal.status === 'approved' ? 'অনুমোদিত' : 'বাতিল'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'microJobs' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800">ছোট কাজ ম্যানেজমেন্ট</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={20}/> মাইক্রো জব যোগ করুন</h3>
              <form onSubmit={handleAddMicroJob} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরির নাম</label>
                    <input required type="text" value={newMicroJob.category} onChange={e => setNewMicroJob({...newMicroJob, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: Facebook Like" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">পুরস্কারের পরিমাণ (৳)</label>
                    <input required type="number" min="0" value={newMicroJob.prize} onChange={e => setNewMicroJob({...newMicroJob, prize: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">লিমিট (ইউজার)</label>
                    <input required type="number" min="1" value={newMicroJob.limit} onChange={e => setNewMicroJob({...newMicroJob, limit: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition">মাইক্রো জব যোগ করুন</button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">বিদ্যমান ছোট কাজ</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {microJobs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">এখনও কোনো মাইক্রো জব পোস্ট করা হয়নি।</div>
                ) : (
                  microJobs.map(job => (
                    <div key={job.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{job.category}</h4>
                        <p className="text-sm text-gray-500">পুরস্কার: ৳{job.prize} • সম্পন্ন হয়েছে: {job.completedCount || 0} / {job.limit}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDeleteMicroJob(job.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">ইউজারদের পোস্ট করা ছোট কাজ</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {userMicroJobs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">এখনও কোনো ইউজার জব পোস্ট করেনি।</div>
                ) : (
                  userMicroJobs.map(job => (
                    <div key={job.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-500">মূল্য: ৳{job.price} • লিমিট: {job.limit} • পোস্টকারী: {job.posterName} ({job.posterReferCode})</p>
                        <a href={job.taskLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs hover:underline">টাস্ক লিংক</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDeleteUserMicroJob(job.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dailyTasks' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800">ডেইলি টাস্ক ম্যানেজমেন্ট</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={20}/> ডেইলি টাস্ক যোগ করুন</h3>
              <form onSubmit={handleAddDailyTask} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">টাস্কের নাম</label>
                    <input required type="text" value={newDailyTask.title} onChange={e => setNewDailyTask({...newDailyTask, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: Daily Check-in" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ (৳)</label>
                    <input required type="number" min="0" value={newDailyTask.amount} onChange={e => setNewDailyTask({...newDailyTask, amount: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">সময়কাল</label>
                    <input required type="text" value={newDailyTask.duration} onChange={e => setNewDailyTask({...newDailyTask, duration: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: 24 hours" />
                  </div>
                </div>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition">ডেইলি টাস্ক যোগ করুন</button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">বিদ্যমান ডেইলি টাস্ক</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {dailyTasks.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">এখনও কোনো ডেইলি টাস্ক পোস্ট করা হয়নি।</div>
                ) : (
                  dailyTasks.map(task => (
                    <div key={task.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-500">পরিমাণ: ৳{task.amount} • সময়কাল: {task.duration}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDeleteDailyTask(task.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'targetBonus' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800">টার্গেট বোনাস ম্যানেজমেন্ট</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={20}/> টার্গেট বোনাস যোগ করুন</h3>
              <form onSubmit={handleAddTargetBonus} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">শিরোনাম</label>
                    <input required type="text" value={newTargetBonus.title} onChange={e => setNewTargetBonus({...newTargetBonus, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: 5 Referrals Bonus" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">বোনাসের পরিমাণ (৳)</label>
                    <input required type="number" min="0" value={newTargetBonus.amount} onChange={e => setNewTargetBonus({...newTargetBonus, amount: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">প্রয়োজনীয় প্যাকেজ মূল্য (৳)</label>
                    <input required type="number" min="0" value={newTargetBonus.packagePrice} onChange={e => setNewTargetBonus({...newTargetBonus, packagePrice: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: 500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">প্রয়োজনীয় রেফারেল</label>
                    <input required type="number" min="1" value={newTargetBonus.referralsNeeded} onChange={e => setNewTargetBonus({...newTargetBonus, referralsNeeded: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition">টার্গেট বোনাস যোগ করুন</button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">বিদ্যমান টার্গেট বোনাস</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {targetBonuses.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">এখনও কোনো টার্গেট বোনাস পোস্ট করা হয়নি।</div>
                ) : (
                  targetBonuses.map(bonus => (
                    <div key={bonus.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{bonus.title}</h4>
                        <p className="text-sm text-gray-500">বোনাস: ৳{bonus.amount} • প্রয়োজনীয় প্যাকেজ: ৳{bonus.packagePrice} • প্রয়োজনীয় রেফারেল: {bonus.referralsNeeded}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDeleteTargetBonus(bonus.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'giftBonus' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800">গিফট বোনাস ম্যানেজমেন্ট</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={20}/> গিফট বোনাস যোগ করুন</h3>
              <form onSubmit={handleAddGiftBonus} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">শিরোনাম</label>
                    <input required type="text" value={newGiftBonus.title} onChange={e => setNewGiftBonus({...newGiftBonus, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: Eid Bonus" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">বোনাসের পরিমাণ (৳)</label>
                    <input required type="number" min="0" value={newGiftBonus.amount} onChange={e => setNewGiftBonus({...newGiftBonus, amount: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">রিডিম কোড</label>
                    <input required type="text" value={newGiftBonus.redeemCode} onChange={e => setNewGiftBonus({...newGiftBonus, redeemCode: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: EID2026" />
                  </div>
                </div>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition">গিফট বোনাস যোগ করুন</button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">বিদ্যমান গিফট বোনাস</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {giftBonuses.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">এখনও কোনো গিফট বোনাস পোস্ট করা হয়নি।</div>
                ) : (
                  giftBonuses.map(bonus => (
                    <div key={bonus.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{bonus.title}</h4>
                        <p className="text-sm text-gray-500">বোনাস: ৳{bonus.amount} • রিডিম কোড: {bonus.redeemCode}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDeleteGiftBonus(bonus.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'welcomeBonus' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800">স্বাগতম বোনাস ম্যানেজমেন্ট</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={20}/> স্বাগতম বোনাস যোগ করুন</h3>
              <form onSubmit={handleAddWelcomeBonus} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">শিরোনাম</label>
                    <input required type="text" value={newWelcomeBonus.title} onChange={e => setNewWelcomeBonus({...newWelcomeBonus, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: New User Bonus" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">টার্গেট / ডেসক্রিপশন</label>
                    <input required type="text" value={newWelcomeBonus.description} onChange={e => setNewWelcomeBonus({...newWelcomeBonus, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: ৫ জন রেফার করুন" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">বোনাসের পরিমাণ (৳)</label>
                    <input required type="number" min="0" value={newWelcomeBonus.amount} onChange={e => setNewWelcomeBonus({...newWelcomeBonus, amount: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition">পোস্ট করুন</button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">বিদ্যমান স্বাগতম বোনাস</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {welcomeBonuses.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">এখনও কোনো স্বাগতম বোনাস পোস্ট করা হয়নি।</div>
                ) : (
                  welcomeBonuses.map(bonus => (
                    <div key={bonus.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{bonus.title}</h4>
                        <p className="text-sm text-gray-500">{bonus.description}</p>
                        <p className="text-sm font-medium text-emerald-600">বোনাস: ৳{bonus.amount}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDeleteWelcomeBonus(bonus.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">স্বাগতম বোনাস রিকোয়েস্ট</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {welcomeBonusSubmissions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">কোনো রিকোয়েস্ট নেই।</div>
                ) : (
                  welcomeBonusSubmissions.map(sub => (
                    <div key={sub.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{sub.userName} <span className="text-sm font-normal text-gray-500">({sub.userEmail})</span></h4>
                        <p className="text-sm text-gray-600">বোনাস: {sub.bonusTitle}</p>
                        <p className="text-sm font-medium text-emerald-600">পরিমাণ: ৳{sub.amount}</p>
                        <p className="text-xs text-gray-400 mt-1">{sub.createdAt?.toDate().toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {sub.status === 'pending' ? (
                          <>
                            <button onClick={() => handleApproveSubmission('welcomeBonusSubmissions', sub)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition">অনুমোদন</button>
                            <button onClick={() => handleRejectSubmission('welcomeBonusSubmissions', sub.id)} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition">বাতিল</button>
                          </>
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs font-bold ${sub.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {sub.status === 'approved' ? 'অনুমোদিত' : 'বাতিলকৃত'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'facebookSell' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800">ফেসবুক সেল ম্যানেজমেন্ট</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Edit2 size={20}/> পোস্ট তৈরি করুন</h3>
              <form onSubmit={handleAddFbPost} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">শিরোনাম</label>
                    <input required type="text" value={newFbPost.title} onChange={e => setNewFbPost({...newFbPost, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: Old Facebook Account Needed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ (৳)</label>
                    <input required type="number" min="0" value={newFbPost.amount} onChange={e => setNewFbPost({...newFbPost, amount: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">বিবরণ</label>
                    <textarea required value={newFbPost.description} onChange={e => setNewFbPost({...newFbPost, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="ইউজারদের জন্য নির্দেশাবলী..." rows={3} />
                  </div>
                </div>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition">পোস্ট করুন</button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">সক্রিয় পোস্ট</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {fbPosts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">এখনও কোনো পোস্ট তৈরি করা হয়নি।</div>
                ) : (
                  fbPosts.map(post => (
                    <div key={post.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{post.title}</h4>
                        <p className="text-sm text-gray-500">{post.description}</p>
                        <p className="text-sm font-medium text-emerald-600 mt-1">পরিমাণ: ৳{post.amount}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDeleteFbPost(post.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">জমাকৃত ফেসবুক অ্যাকাউন্ট</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {fbSubmissions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">এখনও কোনো অ্যাকাউন্ট জমা দেওয়া হয়নি।</div>
                ) : (
                  fbSubmissions.map(sub => (
                    <div key={sub.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">আইডি/ইমেইল: {sub.accountId}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${sub.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : sub.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{sub.status === 'pending' ? 'অপেক্ষমান' : sub.status === 'approved' ? 'অনুমোদিত' : 'বাতিল'}</span>
                        </div>
                        <p className="text-sm text-gray-500">পাসওয়ার্ড: <span className="font-mono bg-gray-100 px-1 rounded">{sub.password}</span></p>
                        <p className="text-xs text-gray-400 mt-1">জমা দিয়েছেন: {sub.userName} ({sub.userId})</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDeleteFbSubmission(sub.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gmailSell' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-800">জিমেইল সেল ম্যানেজমেন্ট</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Edit2 size={20}/> পোস্ট তৈরি করুন</h3>
              <form onSubmit={handleAddGmailPost} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">শিরোনাম</label>
                    <input required type="text" value={newGmailPost.title} onChange={e => setNewGmailPost({...newGmailPost, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="যেমন: New Gmail Account Needed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ (৳)</label>
                    <input required type="number" min="0" value={newGmailPost.amount} onChange={e => setNewGmailPost({...newGmailPost, amount: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">প্রয়োজনীয় পাসওয়ার্ড</label>
                    <input required type="text" value={newGmailPost.requiredPassword} onChange={e => setNewGmailPost({...newGmailPost, requiredPassword: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="ইউজারদের যে পাসওয়ার্ড ব্যবহার করতে হবে..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">বিবরণ</label>
                    <textarea required value={newGmailPost.description} onChange={e => setNewGmailPost({...newGmailPost, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="ইউজারদের জন্য নির্দেশাবলী..." rows={3} />
                  </div>
                </div>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition">পোস্ট করুন</button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">সক্রিয় পোস্ট</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {gmailPosts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">এখনও কোনো পোস্ট তৈরি করা হয়নি।</div>
                ) : (
                  gmailPosts.map(post => (
                    <div key={post.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{post.title}</h4>
                        <p className="text-sm text-gray-500">{post.description}</p>
                        <p className="text-sm font-medium text-emerald-600 mt-1">পরিমাণ: ৳{post.amount} | প্রয়োজনীয় পাসওয়ার্ড: <span className="font-mono bg-gray-100 px-1 rounded">{post.requiredPassword}</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDeleteGmailPost(post.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">জমাকৃত জিমেইল অ্যাকাউন্ট</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {gmailSubmissions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">এখনও কোনো অ্যাকাউন্ট জমা দেওয়া হয়নি।</div>
                ) : (
                  gmailSubmissions.map(sub => (
                    <div key={sub.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">জিমেইল: {sub.gmailId}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${sub.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : sub.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{sub.status === 'pending' ? 'অপেক্ষমান' : sub.status === 'approved' ? 'অনুমোদিত' : 'বাতিল'}</span>
                        </div>
                        <p className="text-sm text-gray-500">পাসওয়ার্ড: <span className="font-mono bg-gray-100 px-1 rounded">{sub.password}</span></p>
                        <p className="text-xs text-gray-400 mt-1">জমা দিয়েছেন: {sub.userName} ({sub.userId})</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDeleteGmailSubmission(sub.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  );
};
