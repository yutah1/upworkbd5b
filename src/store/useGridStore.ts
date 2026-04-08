import { create } from 'zustand';

export interface GridOption {
  id: number;
  title: string;
  iconId: string;
  isActive: boolean;
  order: number;
}

interface GridStore {
  options: GridOption[];
  setOptions: (options: GridOption[]) => void;
  updateOption: (id: number, updates: Partial<GridOption>) => void;
  addOption: (option: GridOption) => void;
  removeOption: (id: number) => void;
}

export const defaultOptions: GridOption[] = [
  { id: 1, title: 'প্রিমিয়াম জবস', iconId: 'PremiumJobsIcon', isActive: true, order: 1 },
  { id: 13, title: 'প্রিমিয়াম বাই', iconId: 'PremiumBuyIcon', isActive: true, order: 2 },
  { id: 2, title: 'ছোট কাজ', iconId: 'MicroJobsIcon', isActive: true, order: 3 },
  { id: 14, title: 'জব পোস্ট', iconId: 'JobPostIcon', isActive: true, order: 4 },
  { id: 3, title: 'টার্গেট বোনাস', iconId: 'TargetBonusIcon', isActive: true, order: 5 },
  { id: 15, title: 'ফেসবুক সেল', iconId: 'FacebookSellIcon', isActive: true, order: 6 },
  { id: 16, title: 'জিমেইল সেল', iconId: 'GmailSellIcon', isActive: true, order: 7 },
  { id: 5, title: 'গিফট বোনাস', iconId: 'GiftBonusIcon', isActive: true, order: 8 },
  { id: 6, title: 'স্বাগতম বোনাস', iconId: 'WelcomeBonusIcon', isActive: true, order: 9 },
  { id: 7, title: 'ডেইলি টাস্ক', iconId: 'DailyWorkIcon', isActive: true, order: 10 },
  { id: 17, title: 'ডেইলি বোনাস', iconId: 'DailyBonusIcon', isActive: true, order: 11 },
  { id: 8, title: 'ভিডিও আর্ন', iconId: 'VideoEarnIcon', isActive: true, order: 12 },
  { id: 9, title: 'মাসিক বেতন', iconId: 'MonthlySalaryIcon', isActive: true, order: 13 },
  { id: 10, title: 'লিডারশিপ বেতন', iconId: 'LeadershipSalaryIcon', isActive: true, order: 14 },
  { id: 11, title: 'লটারি', iconId: 'LotteryIcon', isActive: true, order: 15 },
  { id: 12, title: 'স্পিন বোনাস', iconId: 'SpinBonusIcon', isActive: true, order: 16 },
];

export const useGridStore = create<GridStore>((set) => ({
  options: defaultOptions,
  setOptions: (options) => set({ options }),
  updateOption: (id, updates) =>
    set((state) => ({
      options: state.options.map((opt) =>
        opt.id === id ? { ...opt, ...updates } : opt
      ),
    })),
  addOption: (option) =>
    set((state) => ({ options: [...state.options, option] })),
  removeOption: (id) =>
    set((state) => ({
      options: state.options.filter((opt) => opt.id !== id),
    })),
}));
