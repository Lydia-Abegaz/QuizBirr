import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, HelpCircle, ListTodo, Users } from '../../components/icons';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/admin/quizzes" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <HelpCircle className="w-8 h-8 text-primary-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Manage Quizzes</h3>
            <p className="text-sm text-gray-600">Add, edit, or delete quizzes</p>
          </Link>
          
          <Link to="/admin/tasks" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <ListTodo className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Manage Tasks</h3>
            <p className="text-sm text-gray-600">Create and manage tasks</p>
          </Link>
          
          <Link to="/admin/submissions" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <Users className="w-8 h-8 text-yellow-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Task Submissions</h3>
            <p className="text-sm text-gray-600">Review user submissions</p>
          </Link>
          
          <Link to="/admin/transactions" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <LayoutDashboard className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Transactions</h3>
            <p className="text-sm text-gray-600">Manage deposits & withdrawals</p>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <p className="text-gray-600">Admin features coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
