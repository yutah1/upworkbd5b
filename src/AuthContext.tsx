import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

interface AppUser {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  referId: string;
  referredBy?: string;
  role: 'user' | 'admin';
  balance: number;
  unlockedPackages: string[];
  isVerified?: boolean;
  spinCount?: number;
  referCount?: number;
  walletAddress?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, phone: string, referCode: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          // Listen to user document changes
          unsubscribeSnapshot = onSnapshot(userDocRef, async (userDoc) => {
            if (userDoc.exists()) {
              const data = userDoc.data() as AppUser;
              const isAdminEmail = firebaseUser.email === 'islamohi453@gmail.com' || firebaseUser.email === 'yuta81134@gmail.com';
              if (isAdminEmail && data.role !== 'admin') {
                data.role = 'admin';
                await setDoc(userDocRef, { role: 'admin' }, { merge: true });
              }
              setAppUser(data);
            } else {
              // Create new user profile
              const isAdminEmail = firebaseUser.email === 'islamohi453@gmail.com' || firebaseUser.email === 'yuta81134@gmail.com';
              const newAppUser: AppUser = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email || '',
                referId: Math.random().toString(36).substring(2, 10).toUpperCase(),
                role: isAdminEmail ? 'admin' : 'user',
                balance: 0,
                unlockedPackages: ['demo-job-1'],
                spinCount: 0,
                createdAt: new Date(),
              };
              await setDoc(userDocRef, newAppUser);
              // setAppUser will be called by the next snapshot
            }
            setLoading(false);
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
            setLoading(false);
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setLoading(false);
        }
      } else {
        setAppUser(null);
        setLoading(false);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        if (email === 'islamohi453@gmail.com' || email === 'yuta81134@gmail.com') {
          try {
            await registerWithEmail(email, pass, 'Admin', '01700000000', 'ADMIN');
            return;
          } catch (regError: any) {
            if (regError.code === 'auth/email-already-in-use') {
              throw new Error('ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।');
            }
            throw regError;
          }
        }
      }
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, phone: string, referCode: string) => {
    if (!referCode || referCode.trim() === '') {
      throw new Error('রেফার কোড দেওয়া আবশ্যক।');
    }

    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    const userDocRef = doc(db, 'users', userCred.user.uid);
    const isAdminEmail = email === 'islamohi453@gmail.com' || email === 'yuta81134@gmail.com';
    const newAppUser: AppUser = {
      uid: userCred.user.uid,
      name: name,
      email: email,
      phone: phone,
      referId: Math.random().toString(36).substring(2, 10).toUpperCase(),
      referredBy: referCode,
      role: isAdminEmail ? 'admin' : 'user',
      balance: 0,
      unlockedPackages: ['demo-job-1'],
      spinCount: 0,
      createdAt: new Date(),
    };
    await setDoc(userDocRef, newAppUser);
    setAppUser(newAppUser);
  };

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, login, logout, loginWithEmail, registerWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
