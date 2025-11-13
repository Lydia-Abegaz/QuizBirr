import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { quizApi } from '../lib/api';
import { LogOut, Trophy, Target, TrendingUp } from '../components/icons';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data: statsData } = useQuery({
    queryKey: ['quizStats'],
    queryFn: async () => {
      const response = await quizApi.getUserStats();
      return response.data.data;
    },
    enabled: !!user,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-army-900">
      <div className="max-w-3xl mx-auto">
        <main className="p-4">
          <h1 className="text-3xl font-black text-white mb-6">Profile</h1>

          {!user ? (
            <div className="military-card-light rounded-2xl p-6 border-2 border-black/10 text-center text-white font-bold text-xl">
              Loading profile... Please log in again if this persists.
            </div>
          ) : (
            <div className="space-y-6">
              <section className="military-card-light rounded-2xl p-6 border-2 border-black/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 bg-army-900 rounded-xl flex items-center justify-center border-2 border-white">
                    <span className="text-3xl font-black text-white">{user.phoneNumber?.slice(-2) || 'U'}</span>
                  </div>
                  <div>
                    <p className="font-black text-army-900 text-lg">{user.phoneNumber}</p>
                    <p className="text-sm text-army-600 uppercase font-bold tracking-wide">{user.role || 'Soldier'}</p>
                  </div>
                </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-army-900">
                  <div>
                    <p className="text-xs text-army-600 font-bold uppercase tracking-wide">Balance</p>
                        {
                          (() => {
                            const raw = user.balance ?? 0;
                            const asNum = Number(raw);
                            const display = Number.isFinite(asNum) ? asNum.toFixed(2) : '0.00';
                            return <p className="text-2xl font-black text-army-900">{display}</p>;
                          })()
                        }
                  </div>
                  <div>
                    <p className="text-xs text-army-600 font-bold uppercase tracking-wide">Points</p>
                    <p className="text-2xl font-black text-army-900">{user.points || 0}</p>
                  </div>
                </div>
                
                  <div className="mt-4 text-sm text-army-600 space-y-2">
                    <div><span className="font-bold text-white mr-2">User ID:</span><span className="text-white/90">{user.id}</span></div>
                    <div><span className="font-bold text-white mr-2">Referral:</span><span className="text-white/90">{user.referralCode || '—'}</span></div>
                    <div><span className="font-bold text-white mr-2">Verified:</span><span className="text-white/90">{user.isVerified ? 'Yes' : 'No'}</span></div>
                    <div><span className="font-bold text-white mr-2">Created:</span><span className="text-white/90">{user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</span></div>
                    <div><span className="font-bold text-white mr-2">Last Login:</span><span className="text-white/90">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}</span></div>
                  </div>
              </section>

              <section className="military-card rounded-2xl p-6 border-2 border-white/20">
                <h3 className="font-black text-white mb-4 uppercase tracking-wider">Combat Stats</h3>

                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-6 h-6 text-white" strokeWidth={2.5} />
                      <span className="text-white/80 font-bold uppercase tracking-wide text-sm">Total Attempts</span>
                    </div>
                    <span className="font-black text-white text-xl">{statsData?.totalAttempts || 0}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="w-6 h-6 text-white" strokeWidth={2.5} />
                      <span className="text-white/80 font-bold uppercase tracking-wide text-sm">Correct Answers</span>
                    </div>
                    <span className="font-black text-white text-xl">{statsData?.correctAttempts || 0}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
                      <span className="text-white/80 font-bold uppercase tracking-wide text-sm">Accuracy</span>
                    </div>
                    <span className="font-black text-white text-xl">{statsData?.accuracy?.toFixed(1) || 0}%</span>
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-3">
                {user?.role === 'admin' && (
                  <button onClick={() => navigate('/admin')} className="w-full military-card-light py-5 rounded-xl font-black uppercase tracking-wider border-2 border-black/20 hover:border-black/40 transition-all text-army-900">
                    Command Center
                  </button>
                )}

                <button onClick={handleLogout} className="w-full military-card py-5 rounded-xl font-black uppercase tracking-wider border-2 border-white/20 hover:border-white/40 transition-all text-white flex items-center justify-center gap-2">
                  <LogOut className="w-6 h-6" strokeWidth={2.5} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
