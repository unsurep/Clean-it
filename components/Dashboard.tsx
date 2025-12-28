
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getCravingAdvice } from '../services/gemini';

interface DashboardProps {
  profile: UserProfile;
}

const MILESTONES = [
  { label: "Pulse Recovery", hours: 0.33, description: "Heart rate and blood pressure drop." },
  { label: "Oxygen Normalization", hours: 12, description: "Blood oxygen levels increase to normal." },
  { label: "Carbon Monoxide Normalization", hours: 24, description: "Carbon monoxide levels in your blood drop." },
  { label: "Nicotine Clearance", hours: 48, description: "Nicotine is fully processed by your body." },
  { label: "Taste & Smell Improvement", hours: 72, description: "Nerve endings start to regrow." },
  { label: "Lung Function Boost", hours: 336, description: "Lungs begin to clear and function better." }, // 2 weeks
];

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const [timeLeft, setTimeLeft] = useState({
    totalHours: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [sosLoading, setSosLoading] = useState(false);
  const [sosAdvice, setSosAdvice] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const quit = new Date(profile.quitDate).getTime();
      const diff = now - quit;

      if (diff > 0) {
        setTimeLeft({
          totalHours: diff / (1000 * 60 * 60),
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [profile.quitDate]);

  const handleSOS = async () => {
    setSosLoading(true);
    setSosAdvice(null);
    
    try {
      // Call Gemini API for highly personalized craving advice using all profile context
      const advice = await getCravingAdvice(profile.name, timeLeft.days, profile.reason);
      setSosAdvice(advice);
    } catch (error) {
      console.error("SOS Error:", error);
      setSosAdvice("Change your environment immediately. Walk to a different room and count 5 red things you see.");
    } finally {
      setSosLoading(false);
    }
  };

  const cigarettesAvoided = Math.floor(timeLeft.totalHours * 0.833); // Assuming 20 per day (20/24 = 0.833)
  
  // Find the index of the milestone currently in progress
  const activeMilestoneIdx = MILESTONES.findIndex(m => (timeLeft.totalHours / m.hours) * 100 < 100);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hello, {profile.name}!</h2>
          <p className="text-slate-500 text-sm">You're making history today.</p>
        </div>
        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100 group cursor-default">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
           </svg>
        </div>
      </div>

      {/* Main Counter */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 rounded-3xl p-8 shadow-xl text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <span className="text-blue-100 text-xs font-semibold uppercase tracking-wider relative z-10">Time Smoke-Free</span>
        <div className="flex justify-center items-end gap-2 mt-4 relative z-10">
          <span className="text-7xl font-bold tracking-tight transition-all duration-500">{timeLeft.days}</span>
          <span className="text-xl font-medium mb-3">days</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-8 pt-8 border-t border-white/20 relative z-10">
          <div>
            <div className="text-2xl font-bold">{timeLeft.hours}</div>
            <div className="text-[10px] text-blue-100 uppercase font-bold tracking-tighter opacity-80">Hours</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{timeLeft.minutes}</div>
            <div className="text-[10px] text-blue-100 uppercase font-bold tracking-tighter opacity-80">Mins</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{timeLeft.seconds}</div>
            <div className="text-[10px] text-blue-100 uppercase font-bold tracking-tighter opacity-80">Secs</div>
          </div>
        </div>
      </div>

      {/* SOS Craving Section */}
      <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <h3 className="font-bold text-rose-800">Cravings SOS</h3>
          </div>
          <button 
            onClick={handleSOS}
            disabled={sosLoading}
            className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-200 transition-all active:scale-95 disabled:opacity-50 min-w-[120px]"
          >
            {sosLoading ? "Consulting AI..." : "Help Me Now"}
          </button>
        </div>
        {sosAdvice && (
          <div className="bg-white p-5 rounded-2xl border border-rose-100 animate-fadeIn shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0">
               <span className="bg-rose-100 text-rose-600 text-[8px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-tighter">Instant Advice</span>
            </div>
            <p className="text-slate-700 text-sm font-medium leading-relaxed italic pr-4">
              "{sosAdvice}"
            </p>
          </div>
        )}
      </div>

      {/* Daily Motivation */}
      <div className="bg-white rounded-3xl p-8 shadow-md relative overflow-hidden group border border-slate-50">
        <div className="absolute top-0 right-0 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-100 group-hover:text-blue-50 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C15.4647 8 15.017 8.44772 15.017 9V12C15.017 12.5523 14.5693 13 14.017 13H11.017C10.4647 13 10.017 12.5523 10.017 12V9C10.017 8.44772 10.4647 8 11.017 8H13.017C13.5693 8 14.017 7.55228 14.017 7V5C14.017 3.89543 13.1216 3 12.017 3H5.01701C3.91244 3 3.01701 3.89543 3.01701 5V15C3.01701 17.2091 4.80787 19 7.01701 19H12.017C13.1216 19 14.017 19.8954 14.017 21Z" />
            </svg>
        </div>
        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full mb-4 uppercase tracking-widest">Daily Insight</span>
        <p className="text-xl font-medium text-slate-700 italic leading-relaxed relative z-10">
          "{profile.todaysMessage}"
        </p>
        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xs text-slate-400">Personalized for your goal: <span className="text-slate-500 font-medium">"{profile.reason}"</span></span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Money Saved */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative group">
            <div className="absolute top-[-5px] right-[-5px] opacity-10 group-hover:opacity-20 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
            </div>
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Money Saved</div>
            <div className="text-2xl font-bold text-slate-800">${(timeLeft.totalHours * 0.52).toFixed(2)}</div>
            <div className="text-[10px] text-green-500 mt-1 font-medium">Growing daily</div>
        </div>

        {/* Cigarettes Avoided */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative group">
             <div className="absolute top-[-5px] right-[-5px] opacity-10 group-hover:opacity-20 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9h-7c-.28 0-.5.22-.5.5s.22.5.5.5h7c.28 0 .5-.22.5-.5s-.22-.5-.5-.5z"/>
                </svg>
            </div>
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Avoided</div>
            <div className="text-2xl font-bold text-slate-800">{cigarettesAvoided}</div>
            <div className="text-[10px] text-rose-500 mt-1 font-medium">Clean air</div>
        </div>
      </div>

      {/* Health Milestones */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Health Milestones
        </h3>
        <div className="space-y-6">
          {MILESTONES.map((milestone, idx) => {
            const progress = Math.min(100, (timeLeft.totalHours / milestone.hours) * 100);
            const isCompleted = progress === 100;
            const isActive = idx === activeMilestoneIdx;
            
            return (
              <div key={idx} className={`relative transition-all duration-500 ${isCompleted ? 'opacity-100' : 'opacity-80'} ${isActive ? 'scale-[1.02] opacity-100' : ''}`}>
                <div className="flex justify-between items-center text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-500 ${isCompleted ? 'bg-green-100' : 'bg-slate-100'}`}>
                      {isCompleted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600 animate-bounce" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-400 animate-ping' : 'bg-slate-300'}`}></div>
                      )}
                    </div>
                    <span className={`font-semibold ${isCompleted ? 'text-green-600' : 'text-slate-600'}`}>
                      {milestone.label}
                    </span>
                  </div>
                  <span className={`font-bold transition-all ${isCompleted ? 'text-green-500' : 'text-slate-400'}`}>
                    {isCompleted ? 'ACHIEVED' : `${Math.round(progress)}%`}
                  </span>
                </div>
                
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out relative ${
                      isCompleted 
                        ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                        : isActive 
                          ? 'bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                          : 'bg-blue-300'
                    }`}
                    style={{ width: `${progress}%` }}
                  >
                    {isActive && (
                      <div className="absolute top-0 right-0 h-full w-4 bg-white/30 animate-pulse"></div>
                    )}
                  </div>
                </div>
                <p className={`text-[10px] mt-2 leading-relaxed transition-colors duration-500 ${isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>
                  {milestone.description}
                </p>
                
                {isActive && (
                  <div className="absolute -left-3 top-0 h-full w-0.5 bg-blue-500/20 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50 flex items-center justify-between group cursor-default">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.53 6.47a1 1 0 011.414 0 4.938 4.938 0 003.116 1.346c1.173 0 2.25-.402 3.116-1.346a1 1 0 011.414 1.414 6.938 6.938 0 01-4.53 1.956 6.938 6.938 0 01-4.53-1.956 1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Life Regained</div>
                <div className="text-lg font-bold text-slate-800">{Math.floor(timeLeft.days * 1.5 + (timeLeft.hours * 0.06))}h</div>
              </div>
          </div>
          <div className="text-[10px] text-blue-400 font-semibold italic animate-pulse">Healing in progress</div>
      </div>
    </div>
  );
};

export default Dashboard;
