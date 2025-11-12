import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../lib/api';
import { ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle } from '../components/icons';

const WalletPage = () => {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'telebirr' | 'bank'>('telebirr');
  const queryClient = useQueryClient();
  
  const { data: balanceData } = useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      const response = await walletApi.getBalance();
      return response.data.data;
    },
  });
  
  const { data: transactionsData } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await walletApi.getTransactions();
      return response.data.data;
    },
  });
  
  const depositMutation = useMutation({
    mutationFn: (data: { amount: number; method: 'telebirr' | 'bank' }) =>
      walletApi.initiateDeposit(data.amount, data.method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowDeposit(false);
      setAmount('');
      alert('Deposit initiated! Please complete the payment.');
    },
  });
  
  const withdrawMutation = useMutation({
    mutationFn: (amount: number) => walletApi.initiateWithdrawal(amount),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowWithdraw(false);
      setAmount('');
      
      if (response.data.data?.tasks) {
        alert(`Withdrawal initiated! Please complete ${response.data.data.tasks.length} tasks to proceed.`);
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Withdrawal failed');
    },
  });
  
  const handleDeposit = () => {
    const amountNum = parseFloat(amount);
    if (amountNum > 0) {
      depositMutation.mutate({ amount: amountNum, method });
    }
  };
  
  const handleWithdraw = () => {
    const amountNum = parseFloat(amount);
    if (amountNum > 0) {
      withdrawMutation.mutate(amountNum);
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-white" strokeWidth={2.5} />;
      case 'pending':
        return <Clock className="w-5 h-5 text-white" strokeWidth={2.5} />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-white" strokeWidth={2.5} />;
      default:
        return <Clock className="w-5 h-5 text-white" strokeWidth={2.5} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-army-900">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-black text-white uppercase tracking-wider text-glow">Wallet</h1>
        
        {/* Balance Card */}
        <div className="military-card rounded-2xl p-6 text-white border-2 border-white/20">
          <p className="text-white/70 mb-2 font-bold uppercase tracking-wide text-sm">Available Balance</p>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-6xl font-black text-glow">
              {balanceData?.balance?.toFixed(2) || '0.00'}
            </span>
            <span className="text-2xl font-bold">BIRR</span>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeposit(true)}
              className="flex-1 military-button py-4 rounded-lg flex items-center justify-center gap-2"
            >
              <ArrowDownCircle className="w-6 h-6" strokeWidth={2.5} />
              DEPOSIT
            </button>
            <button
              onClick={() => setShowWithdraw(true)}
              className="flex-1 military-button-dark py-4 rounded-lg flex items-center justify-center gap-2"
            >
              <ArrowUpCircle className="w-6 h-6" strokeWidth={2.5} />
              WITHDRAW
            </button>
          </div>
        </div>
        
        {/* Transactions */}
        <div className="military-card-light rounded-2xl p-6 border-2 border-black/10">
          <h2 className="text-xl font-black text-army-900 mb-4 uppercase tracking-wider">Operations</h2>
          
          {transactionsData?.transactions?.length > 0 ? (
            <div className="space-y-3">
              {transactionsData.transactions.map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 military-card rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg">
                      {getStatusIcon(transaction.status)}
                    </div>
                    <div>
                      <p className="font-black text-white uppercase text-sm tracking-wide">{transaction.type}</p>
                      <p className="text-xs text-white/60 font-semibold">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-white text-lg">
                      {transaction.type === 'deposit' || transaction.type === 'bonus' || transaction.type === 'referral' ? '+' : '-'}
                      {transaction.amount}
                    </p>
                    <p className="text-xs text-white/60 uppercase font-bold tracking-wide">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-army-600 py-8 font-bold uppercase tracking-wide">No Operations Yet</p>
          )}
        </div>
      </div>
      
      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="military-card-light rounded-2xl p-6 max-w-sm w-full border-2 border-black/20">
            <h2 className="text-2xl font-black text-army-900 mb-6 uppercase tracking-wider">Deposit Funds</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-army-700 mb-2 uppercase tracking-wide">
                  Amount (Birr)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-army-900 rounded-lg focus:ring-2 focus:ring-army-900 focus:border-transparent font-bold text-lg"
                  placeholder="0.00"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-army-700 mb-3 uppercase tracking-wide">
                  Payment Method
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => setMethod('telebirr')}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      method === 'telebirr'
                        ? 'border-army-900 bg-army-900 text-white'
                        : 'border-army-300 hover:border-army-900'
                    }`}
                  >
                    <p className="font-black uppercase tracking-wide">Telebirr</p>
                    <p className="text-sm font-semibold opacity-80">Mobile Payment</p>
                  </button>
                  
                  <button
                    onClick={() => setMethod('bank')}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      method === 'bank'
                        ? 'border-army-900 bg-army-900 text-white'
                        : 'border-army-300 hover:border-army-900'
                    }`}
                  >
                    <p className="font-black uppercase tracking-wide">Bank Transfer</p>
                    <p className="text-sm font-semibold opacity-80">Wire Transfer</p>
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeposit(false)}
                  className="flex-1 px-4 py-4 border-2 border-army-900 rounded-lg font-black uppercase tracking-wide hover:bg-army-900 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={!amount || parseFloat(amount) <= 0 || depositMutation.isPending}
                  className="flex-1 px-4 py-4 bg-army-900 text-white rounded-lg font-black uppercase tracking-wide hover:bg-army-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-army-900"
                >
                  {depositMutation.isPending ? 'Processing...' : 'Deposit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="military-card-light rounded-2xl p-6 max-w-sm w-full border-2 border-black/20">
            <h2 className="text-2xl font-black text-army-900 mb-6 uppercase tracking-wider">Withdraw Funds</h2>
            
            <div className="space-y-5">
              <div className="bg-army-900 border-2 border-white rounded-lg p-4 text-sm text-white">
                <p className="font-bold uppercase tracking-wide">⚠ Mission Required</p>
                <p className="text-white/80 font-semibold mt-1">Complete tasks to process withdrawal</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-army-700 mb-2 uppercase tracking-wide">
                  Amount (Birr)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-army-900 rounded-lg focus:ring-2 focus:ring-army-900 focus:border-transparent font-bold text-lg"
                  placeholder="0.00"
                  min="1"
                  max={balanceData?.balance || 0}
                />
                <p className="mt-2 text-sm text-army-600 font-bold uppercase tracking-wide">
                  Available: {balanceData?.balance?.toFixed(2) || '0.00'} Birr
                </p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 px-4 py-4 border-2 border-army-900 rounded-lg font-black uppercase tracking-wide hover:bg-army-900 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > (balanceData?.balance || 0) || withdrawMutation.isPending}
                  className="flex-1 px-4 py-4 bg-army-900 text-white rounded-lg font-black uppercase tracking-wide hover:bg-army-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-army-900"
                >
                  {withdrawMutation.isPending ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
