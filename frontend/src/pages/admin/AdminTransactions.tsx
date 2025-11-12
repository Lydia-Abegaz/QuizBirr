import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import { ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle, Wallet, Users } from '../../components/icons';

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  method?: string;
  reference?: string;
  createdAt: string;
  processedAt?: string;
  reason?: string;
}

const AdminTransactions = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [processReason, setProcessReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('pending');
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');

  const queryClient = useQueryClient();

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['adminTransactions'],
    queryFn: async () => {
      const response = await adminApi.getAllTransactions();
      return response.data.data;
    }
  });

  const processDepositMutation = useMutation({
    mutationFn: (transactionId: string) => adminApi.confirmDeposit(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTransactions'] });
      setSelectedTransaction(null);
    }
  });

  const processWithdrawalMutation = useMutation({
    mutationFn: ({ transactionId, approved, reason }: { transactionId: string; approved: boolean; reason?: string }) =>
      adminApi.processWithdrawal(transactionId, approved, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTransactions'] });
      setSelectedTransaction(null);
      setProcessReason('');
    }
  });

  const handleConfirmDeposit = (transactionId: string) => {
    processDepositMutation.mutate(transactionId);
  };

  const handleProcessWithdrawal = (transactionId: string, approved: boolean, reason?: string) => {
    processWithdrawalMutation.mutate({ transactionId, approved, reason });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'deposit' ? <ArrowDownCircle className="w-4 h-4" /> : <ArrowUpCircle className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    return type === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const filteredTransactions = transactionsData?.filter((transaction: Transaction) => {
    const statusMatch = filter === 'all' || transaction.status === filter;
    const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;
    return statusMatch && typeMatch;
  }) || [];

  const totalAmount = filteredTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  const pendingAmount = transactionsData?.filter((t: Transaction) => t.status === 'pending').reduce((sum: number, t: Transaction) => sum + t.amount, 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
          
          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
            </select>
          </div>
        </div>

        {/* Transaction Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{transactionsData?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">{pendingAmount.toLocaleString()} ETB</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <ArrowDownCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Deposits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transactionsData?.filter((t: Transaction) => t.type === 'deposit' && t.status === 'completed').reduce((sum: number, t: Transaction) => sum + t.amount, 0)?.toLocaleString() || 0} ETB
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <ArrowUpCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Withdrawals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transactionsData?.filter((t: Transaction) => t.type === 'withdrawal' && t.status === 'completed').reduce((sum: number, t: Transaction) => sum + t.amount, 0)?.toLocaleString() || 0} ETB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Transactions ({filteredTransactions.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction: Transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{transaction.userName}</div>
                          <div className="text-sm text-gray-500">{transaction.userPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                        {getTypeIcon(transaction.type)}
                        <span className="ml-1">{transaction.type}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.amount.toLocaleString()} ETB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1">{transaction.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.method || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      {transaction.status === 'pending' && (
                        <>
                          {transaction.type === 'deposit' ? (
                            <button
                              onClick={() => handleConfirmDeposit(transaction.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Confirm
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleProcessWithdrawal(transaction.id, true)}
                                className="text-green-600 hover:text-green-900 mr-4"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setProcessReason('');
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.userName}</p>
                  <p className="text-xs text-gray-500">{selectedTransaction.userPhone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedTransaction.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedTransaction.type)}`}>
                    {getTypeIcon(selectedTransaction.type)}
                    <span className="ml-1">{selectedTransaction.type}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="text-lg font-bold text-gray-900">{selectedTransaction.amount.toLocaleString()} ETB</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTransaction.status)}`}>
                    {getStatusIcon(selectedTransaction.status)}
                    <span className="ml-1">{selectedTransaction.status}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Method</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.method || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Created Date</label>
                <p className="text-sm text-gray-900">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
              </div>
              
              {selectedTransaction.reference && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reference</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedTransaction.reference}</p>
                </div>
              )}
              
              {selectedTransaction.reason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-900">{selectedTransaction.reason}</p>
                  </div>
                </div>
              )}
              
              {selectedTransaction.status === 'pending' && selectedTransaction.type === 'withdrawal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason (if rejecting)</label>
                  <textarea
                    value={processReason}
                    onChange={(e) => setProcessReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter reason for rejection (optional)"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              {selectedTransaction.status === 'pending' && (
                <>
                  {selectedTransaction.type === 'deposit' ? (
                    <button
                      onClick={() => handleConfirmDeposit(selectedTransaction.id)}
                      disabled={processDepositMutation.isPending}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {processDepositMutation.isPending ? 'Confirming...' : 'Confirm Deposit'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleProcessWithdrawal(selectedTransaction.id, false, processReason)}
                        disabled={processWithdrawalMutation.isPending}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {processWithdrawalMutation.isPending ? 'Rejecting...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => handleProcessWithdrawal(selectedTransaction.id, true)}
                        disabled={processWithdrawalMutation.isPending}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {processWithdrawalMutation.isPending ? 'Approving...' : 'Approve'}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
