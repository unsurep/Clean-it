
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './services/firebase';
import { getMotivationalQuote } from './services/gemini';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Loader from './components/Loader';
import { UserProfile } from './types';

const LOCAL_STORAGE_KEY = 'breathe_user_profile';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      if (!isFirebaseConfigured) {
        console.warn("Firebase not configured. Using local storage for demo mode.");
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
          const parsed = JSON.parse(localData) as UserProfile;
          await checkDailyMessage(parsed.uid, parsed);
        } else {
          setLoading(false);
        }
        return;
      }

      if (!auth) return;

      const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
        if (authUser) {
          setUser(authUser);
          await fetchProfile(authUser.uid);
        } else {
          try {
            await signInAnonymously(auth);
          } catch (err) {
            console.error("Auth error:", err);
            setError("Authentication failed. Please check your Firebase configuration.");
            setLoading(false);
          }
        }
      });

      return unsubscribe;
    };

    initApp();
  }, []);

  const fetchProfile = async (uid: string) => {
    if (!db) return;
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        await checkDailyMessage(uid, data);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to fetch user profile.");
      setLoading(false);
    }
  };

  const checkDailyMessage = async (uid: string, currentProfile: UserProfile) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check cache
    if (currentProfile.lastMessageDate === today && currentProfile.todaysMessage) {
      setProfile(currentProfile);
      setLoading(false);
      return;
    }

    // Generate new message
    const quitDate = new Date(currentProfile.quitDate);
    const diffTime = Math.abs(new Date().getTime() - quitDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    try {
      const newMessage = await getMotivationalQuote(
        currentProfile.name,
        diffDays,
        currentProfile.reason
      );

      const updatedData = {
        ...currentProfile,
        todaysMessage: newMessage,
        lastMessageDate: today
      };

      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'users', uid), {
          todaysMessage: newMessage,
          lastMessageDate: today
        });
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
      }

      setProfile(updatedData);
    } catch (err) {
      console.error("Daily message update error:", err);
      setProfile(currentProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (name: string, quitDate: string, reason: string) => {
    setLoading(true);
    const uid = user?.uid || 'guest_' + Math.random().toString(36).substr(2, 9);
    
    const newProfile: UserProfile = {
      uid,
      name,
      quitDate,
      reason
    };

    try {
      if (isFirebaseConfigured && db) {
        await setDoc(doc(db, 'users', uid), newProfile);
        await fetchProfile(uid);
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));
        await checkDailyMessage(uid, newProfile);
      }
    } catch (err) {
      console.error("Onboarding save error:", err);
      setError("Failed to save your progress.");
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      {profile ? (
        <Dashboard profile={profile} />
      ) : (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      
      {!isFirebaseConfigured && !error && (
        <div className="mt-6 text-center">
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-widest">Demo Mode</span>
            <p className="text-[10px] text-slate-400 mt-1">Firebase not configured. Data saved locally.</p>
        </div>
      )}

      <footer className="mt-auto py-8 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} Breathe App. Your journey matters.</p>
      </footer>
    </div>
  );
};

export default App;
