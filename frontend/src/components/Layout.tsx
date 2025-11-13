import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Wallet, ListTodo, Users, User } from './icons';

const Layout: React.FC<{ page?: React.ReactElement }> = ({ page }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'HOME' },
    { path: '/wallet', icon: Wallet, label: 'WALLET' },
    { path: '/tasks', icon: ListTodo, label: 'TASKS' },
    { path: '/referral', icon: Users, label: 'REFER' },
    { path: '/profile', icon: User, label: 'PROFILE' },
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-army-900">
      <main className="flex-1 pb-20">
        {page ?? <Outlet />}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-army-900 border-t-2 border-white/20 z-50 backdrop-blur-lg">
        <div className="max-w-lg mx-auto px-2">
          <div className="flex justify-around items-center h-20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
                    isActive
                      ? 'text-white scale-110'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    isActive ? 'bg-white/10 shadow-lg' : ''
                  }`}>
                    <Icon className={`w-6 h-6 ${isActive ? 'animate-pulse-slow' : ''}`} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] mt-1 font-bold tracking-wider">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
