import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../lib/api';
import { CheckCircle, Clock, XCircle } from '../components/icons';

const TasksPage = () => {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [proof, setProof] = useState('');
  const queryClient = useQueryClient();
  
  const { data: tasksData } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await taskApi.getActiveTasks();
      return response.data.data;
    },
  });
  
  const { data: submissionsData } = useQuery({
    queryKey: ['taskSubmissions'],
    queryFn: async () => {
      const response = await taskApi.getUserSubmissions();
      return response.data.data;
    },
  });
  
  const submitMutation = useMutation({
    mutationFn: (data: { taskId: string; proof?: string }) =>
      taskApi.submitTask(data.taskId, data.proof),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskSubmissions'] });
      setSelectedTask(null);
      setProof('');
      alert('Task submitted successfully!');
    },
  });
  
  const handleSubmit = () => {
    if (selectedTask) {
      submitMutation.mutate({ taskId: selectedTask.id, proof });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Rejected</span>;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-army-900">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-black text-white uppercase tracking-wider text-glow">Missions</h1>
        
        {/* Available Tasks */}
        <div className="military-card-light rounded-2xl p-6 border-2 border-black/10">
          <h2 className="text-xl font-black text-army-900 mb-4 uppercase tracking-wider">Active Missions</h2>
          
          {tasksData && tasksData.length > 0 ? (
            <div className="space-y-3">
              {tasksData.map((task: any) => (
                <div key={task.id} className="military-card border-2 border-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-white uppercase tracking-wide">{task.title}</h3>
                    <span className="text-white font-black text-lg">+{task.reward}</span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-white/70 mb-3 font-semibold">{task.description}</p>
                  )}
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="w-full military-button py-3 rounded-lg"
                  >
                    Deploy
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-army-600 py-8 font-bold uppercase tracking-wide">No Missions Available</p>
          )}
        </div>
        
        {/* My Submissions */}
        <div className="military-card rounded-2xl p-6 border-2 border-white/20">
          <h2 className="text-xl font-black text-white mb-4 uppercase tracking-wider">Mission Reports</h2>
          
          {submissionsData && submissionsData.length > 0 ? (
            <div className="space-y-3">
              {submissionsData.map((submission: any) => (
                <div key={submission.id} className="military-card-light border-2 border-black/10 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-army-900 uppercase tracking-wide text-sm">{submission.task.title}</h3>
                    {getStatusBadge(submission.status)}
                  </div>
                  <p className="text-xs text-army-600 font-bold uppercase tracking-wide">
                    Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                  </p>
                  {submission.rejectionReason && (
                    <p className="text-sm text-army-900 mt-2 font-bold">
                      Reason: {submission.rejectionReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-white/70 py-8 font-bold uppercase tracking-wide">No Reports Yet</p>
          )}
        </div>
      </div>
      
      {/* Task Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="military-card-light rounded-2xl p-6 max-w-sm w-full border-2 border-black/20">
            <h2 className="text-2xl font-black text-army-900 mb-4 uppercase tracking-wider">{selectedTask.title}</h2>
            
            {selectedTask.description && (
              <p className="text-army-600 mb-4 font-semibold">{selectedTask.description}</p>
            )}
            
            <div className="mb-5 bg-army-900 p-4 rounded-lg border-2 border-white">
              <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                Reward
              </p>
              <p className="text-2xl font-black text-white">+{selectedTask.reward} BIRR</p>
            </div>
            
            <div className="mb-5">
              <label className="block text-sm font-bold text-army-700 mb-2 uppercase tracking-wide">
                Proof (optional)
              </label>
              <textarea
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                className="w-full px-4 py-3 border-2 border-army-900 rounded-lg focus:ring-2 focus:ring-army-900 focus:border-transparent font-semibold"
                placeholder="Enter proof URL or description..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setProof('');
                }}
                className="flex-1 px-4 py-4 border-2 border-army-900 rounded-lg font-black uppercase tracking-wide hover:bg-army-900 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="flex-1 px-4 py-4 bg-army-900 text-white rounded-lg font-black uppercase tracking-wide hover:bg-army-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-army-900"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
