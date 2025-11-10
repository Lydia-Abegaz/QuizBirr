import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import WalletPage from './pages/WalletPage';
import TasksPage from './pages/TasksPage';
import ReferralPage from './pages/ReferralPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import Layout from './components/Layout';

// Protected Element wrapper — accepts a single React element prop to avoid children typing issues
const ProtectedElement: React.FC<{ component: React.ReactElement }> = ({ component }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? component : <Navigate to="/login" replace />;
};

// Admin Element wrapper
const AdminElement: React.FC<{ component: React.ReactElement }> = ({ component }) => {
  const { isAuthenticated, user } = useAuthStore();
  return isAuthenticated && user?.role === 'admin' ? component : <Navigate to="/" replace />;
};

function App() {
  return (
    <>
      {/* Animated GIF Background */}
      <div className="gif-background" />
      
      {/* Main Content */}
      <div className="content-wrapper">
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes (Layout wrapped per-route to avoid nested Route typing issues) */}
            <Route path="/" element={<ProtectedElement component={<Layout page={<HomePage />} />} />} />
            <Route path="/quiz" element={<ProtectedElement component={<Layout page={<QuizPage />} />} />} />
            <Route path="/wallet" element={<ProtectedElement component={<Layout page={<WalletPage />} />} />} />
            <Route path="/tasks" element={<ProtectedElement component={<Layout page={<TasksPage />} />} />} />
            <Route path="/referral" element={<ProtectedElement component={<Layout page={<ReferralPage />} />} />} />
            <Route path="/profile" element={<ProtectedElement component={<Layout page={<ProfilePage />} />} />} />
            <Route path="/admin/*" element={<ProtectedElement component={<Layout page={<AdminElement component={<AdminDashboard />} />} />} />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
