import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full bg-army-800 border-b border-army-700">
      <div className="max-w-3xl mx-auto flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="px-3 py-1 rounded bg-army-700 text-white font-bold">Home</button>
          <button onClick={() => navigate('/wallet')} className="px-3 py-1 rounded bg-army-700 text-white font-bold">Wallet</button>
          <button onClick={() => navigate('/tasks')} className="px-3 py-1 rounded bg-army-700 text-white font-bold">Tasks</button>
          <button onClick={() => navigate('/referral')} className="px-3 py-1 rounded bg-army-700 text-white font-bold">Referral</button>
        </div>

        <div className="flex items-center gap-3">
          {user && <div className="text-white font-bold mr-2">{user.phoneNumber}</div>}
          <button onClick={() => navigate('/profile')} className="px-3 py-1 rounded bg-yellow-400 font-black">Profile</button>
          <button onClick={handleLogout} className="px-3 py-1 rounded bg-red-600 text-white font-bold">Logout</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
