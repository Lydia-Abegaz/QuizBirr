import React from 'react';
import { useAuthStore } from '../store/authStore';

const AuthTest = () => {
  const { user, isAuthenticated } = useAuthStore();
  const token = localStorage.getItem('token');

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Authentication Debug Info</h2>
      <div>
        <strong>Has Token:</strong> {token ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>Token (first 20 chars):</strong> {token ? token.substring(0, 20) + '...' : 'None'}
      </div>
      <div>
        <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>User Data:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}
      </div>
    </div>
  );
};

export default AuthTest;
