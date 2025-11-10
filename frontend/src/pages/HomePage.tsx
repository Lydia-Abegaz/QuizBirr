import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authApi, walletApi, referralApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Coins, TrendingUp, Gift, Zap, Target, Users, User } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { data: balanceData } = useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      const response = await walletApi.getBalance();
      return response.data.data;
    },
  });
  
  const handleClaimDaily = async () => {
    try {
      await referralApi.claimDailyBonus();
      window.location.reload();
    } catch (error) {
      console.error('Failed to claim daily bonus:', error);
    }
  };
  
  return (
    <div className="min-h-screen">
      <div className="max-w-lg mx-auto p-6 space-y-6">
        {/* Welcome Header with Glassmorphism */}
        <div className="backdrop-blur-xl bg-green-900/30 rounded-3xl p-8 border-2 border-green-500/40 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-green-400 mb-2 drop-shadow-lg">Welcome Back! 👋</h1>
              <p className="text-green-300/90 text-lg font-semibold">Ready to win big today?</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <Zap className="w-14 h-14 text-green-400 relative z-10 drop-shadow-lg" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        
        {/* Balance Card with Gradient */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-black/60 to-green-950/50 rounded-3xl p-8 border-2 border-green-500/40 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-green-400 drop-shadow-lg">Your Balance</h2>
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-40"></div>
              <Coins className="w-10 h-10 text-green-400 relative z-10 drop-shadow-lg" strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-black text-green-400 drop-shadow-2xl">
                {balanceData?.balance?.toFixed(2) || '0.00'}
              </span>
              <span className="text-2xl font-bold text-green-300/80">BIRR</span>
            </div>
            <div className="flex items-center gap-3 bg-green-900/40 backdrop-blur-md text-green-300 px-6 py-3 rounded-2xl border-2 border-green-500/30">
              <TrendingUp className="w-6 h-6" strokeWidth={2.5} />
              <span className="font-bold text-lg">{balanceData?.points || 0} Points</span>
            </div>
          </div>
        </div>
        
        {/* Daily Bonus with Glow Effect */}
        <button
          onClick={handleClaimDaily}
          className="w-full backdrop-blur-xl bg-gradient-to-r from-green-600/30 to-green-800/40 rounded-3xl p-6 border-2 border-green-500/50 shadow-2xl hover:shadow-green-500/50 transition-all transform hover:scale-105 active:scale-95 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="bg-gradient-to-br from-green-500 to-green-700 p-4 rounded-2xl relative z-10">
                  <Gift className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="text-left">
                <h3 className="font-black text-2xl text-green-400 drop-shadow-lg">Daily Bonus</h3>
                <p className="text-green-300/80 font-semibold text-sm">Claim your reward now!</p>
              </div>
            </div>
            <span className="text-4xl font-bold text-green-400 group-hover:translate-x-2 transition-transform">→</span>
          </div>
        </button>
        
        {/* Play Quiz Button - Main CTA */}
        <button
          onClick={() => navigate('/quiz')}
          className="w-full backdrop-blur-xl bg-gradient-to-r from-green-600/50 to-black/60 rounded-3xl p-10 border-2 border-green-500/60 shadow-2xl hover:shadow-green-500/60 transition-all transform hover:scale-105 active:scale-95 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <h2 className="text-5xl font-black text-green-400 drop-shadow-2xl">PLAY QUIZ</h2>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            </div>
            <p className="text-green-300/90 font-bold text-lg">Swipe • Answer • Win Money!</p>
          </div>
        </button>
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-5">
          <button
            onClick={() => navigate('/wallet')}
            className="backdrop-blur-xl bg-green-900/30 rounded-2xl p-6 border-2 border-green-500/40 shadow-xl hover:shadow-2xl hover:bg-green-900/50 transition-all transform hover:scale-105 active:scale-95 group"
          >
            <div className="text-center">
              <div className="relative mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-green-500 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="bg-gradient-to-br from-green-500 to-green-700 w-full h-full rounded-2xl flex items-center justify-center relative z-10">
                  <Coins className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <p className="font-black text-green-400 text-lg drop-shadow-lg">Wallet</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/tasks')}
            className="backdrop-blur-xl bg-black/40 rounded-2xl p-6 border-2 border-green-500/40 shadow-xl hover:shadow-2xl hover:bg-black/60 transition-all transform hover:scale-105 active:scale-95 group"
          >
            <div className="text-center">
              <div className="relative mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-green-600 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="bg-gradient-to-br from-green-600 to-green-800 w-full h-full rounded-2xl flex items-center justify-center relative z-10">
                  <Target className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <p className="font-black text-green-400 text-lg drop-shadow-lg">Tasks</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/referral')}
            className="backdrop-blur-xl bg-black/40 rounded-2xl p-6 border-2 border-green-500/40 shadow-xl hover:shadow-2xl hover:bg-black/60 transition-all transform hover:scale-105 active:scale-95 group"
          >
            <div className="text-center">
              <div className="relative mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-green-600 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="bg-gradient-to-br from-green-600 to-green-800 w-full h-full rounded-2xl flex items-center justify-center relative z-10">
                  <Users className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <p className="font-black text-green-400 text-lg drop-shadow-lg">Referral</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className="backdrop-blur-xl bg-green-900/30 rounded-2xl p-6 border-2 border-green-500/40 shadow-xl hover:shadow-2xl hover:bg-green-900/50 transition-all transform hover:scale-105 active:scale-95 group"
          >
            <div className="text-center">
              <div className="relative mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-green-500 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="bg-gradient-to-br from-green-500 to-green-700 w-full h-full rounded-2xl flex items-center justify-center relative z-10">
                  <User className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <p className="font-black text-green-400 text-lg drop-shadow-lg">Profile</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
