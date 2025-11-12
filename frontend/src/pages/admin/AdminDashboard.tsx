import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, HelpCircle, ListTodo, Users, User } from '../../components/icons';
import AdminTasks from './AdminTasks';
import AdminQuizzes from './AdminQuizzes';
import AdminSubmissions from './AdminSubmissions';
import AdminTransactions from './AdminTransactions';
import AdminUsers from './AdminUsers';

const AdminDashboard = () => {
  const location = useLocation();
  
  // If we're on a sub-route, render the appropriate component
  if (location.pathname !== '/admin' && location.pathname !== '/admin/') {
    return (
      <Routes>
        <Route path="/quizzes" element={<AdminQuizzes />} />
        <Route path="/tasks" element={<AdminTasks />} />
        <Route path="/submissions" element={<AdminSubmissions />} />
        <Route path="/transactions" element={<AdminTransactions />} />
        <Route path="/users" element={<AdminUsers />} />
      </Routes>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Link to="/admin/quizzes" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <HelpCircle className="w-8 h-8 text-blue-600 mb-2" />
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
          
          <Link to="/admin/users" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <User className="w-8 h-8 text-indigo-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-600">View and manage users</p>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Active Tasks</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">0 ETB</div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
