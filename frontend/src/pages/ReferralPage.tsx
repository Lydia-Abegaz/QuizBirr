import { useQuery } from '@tanstack/react-query';
import { referralApi } from '../lib/api';
import { Copy, Users, TrendingUp, Gift } from '../components/icons';

const ReferralPage = () => {
  const { data: statsData } = useQuery({
    queryKey: ['referralStats'],
    queryFn: async () => {
      const response = await referralApi.getReferralStats();
      return response.data.data;
    },
  });
  
  const copyReferralCode = () => {
    if (statsData?.referralCode) {
      navigator.clipboard.writeText(statsData.referralCode);
      alert('Referral code copied!');
    }
  };
  
  return (
    <div className="min-h-screen bg-army-900">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-black text-white uppercase tracking-wider text-glow">Recruitment</h1>
        
        <div className="military-card rounded-2xl p-6 text-white border-2 border-white/20">
          <h2 className="text-xl font-black mb-4 uppercase tracking-wider">Your Code</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 mb-4 border-2 border-white/20">
            <p className="text-4xl font-black text-center tracking-widest text-glow">
              {statsData?.referralCode || 'LOADING...'}
            </p>
          </div>
          <button
            onClick={copyReferralCode}
            className="w-full military-button py-4 rounded-lg flex items-center justify-center gap-2"
          >
            <Copy className="w-6 h-6" strokeWidth={2.5} />
            COPY CODE
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="military-card-light rounded-xl p-4 border-2 border-black/10 text-center">
            <Users className="w-7 h-7 text-army-900 mx-auto mb-2" strokeWidth={2.5} />
            <p className="text-3xl font-black text-army-900">{statsData?.totalReferrals || 0}</p>
            <p className="text-xs text-army-600 font-bold uppercase tracking-wide">Total</p>
          </div>
          
          <div className="military-card-light rounded-xl p-4 border-2 border-black/10 text-center">
            <TrendingUp className="w-7 h-7 text-army-900 mx-auto mb-2" strokeWidth={2.5} />
            <p className="text-3xl font-black text-army-900">{statsData?.activeReferrals || 0}</p>
            <p className="text-xs text-army-600 font-bold uppercase tracking-wide">Active</p>
          </div>
          
          <div className="military-card-light rounded-xl p-4 border-2 border-black/10 text-center">
            <Gift className="w-7 h-7 text-army-900 mx-auto mb-2" strokeWidth={2.5} />
            <p className="text-3xl font-black text-army-900">{statsData?.totalEarnings?.toFixed(0) || 0}</p>
            <p className="text-xs text-army-600 font-bold uppercase tracking-wide">Birr</p>
          </div>
        </div>
        
        <div className="military-card-light rounded-2xl p-6 border-2 border-black/10">
          <h3 className="font-black text-army-900 mb-4 uppercase tracking-wider">Mission Brief</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-army-900 text-white rounded-lg flex items-center justify-center font-black text-lg">1</div>
              <div>
                <p className="font-black text-army-900 uppercase tracking-wide text-sm">Share Code</p>
                <p className="text-sm text-army-600 font-semibold">Deploy code to recruits</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-army-900 text-white rounded-lg flex items-center justify-center font-black text-lg">2</div>
              <div>
                <p className="font-black text-army-900 uppercase tracking-wide text-sm">They Enlist</p>
                <p className="text-sm text-army-600 font-semibold">Recruit registers with code</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-army-900 text-white rounded-lg flex items-center justify-center font-black text-lg">3</div>
              <div>
                <p className="font-black text-army-900 uppercase tracking-wide text-sm">Earn Rewards</p>
                <p className="text-sm text-army-600 font-semibold">50 Points + 5 Birr per recruit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;
