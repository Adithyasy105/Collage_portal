import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi, getMe } from 'api/authApi.js';
import AuthForm from '../components/AuthForm';
import styles from '../styles/Auth.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const loginData = await loginApi(email, password);
      localStorage.setItem('token', loginData.token);
      
      const userData = await getMe();
      localStorage.setItem('user', JSON.stringify(userData.user));
      if (userData.profileCompleted) {
        if (userData.user.role === 'STUDENT') {
          navigate('/dashboard');
        } else if (userData.user.role === 'STAFF') {
            navigate('/staff-dashboard');
    } else if (userData.user.role === 'ADMIN') {
        navigate('/admin-dashboard');
    }
    } else {
    if (userData.user.role === 'STUDENT') {
        navigate('/profile-form');
    } else if (userData.user.role === 'STAFF') {
        navigate('/staff-profile-form');
    }
    }
  } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPageContainer}>
      <div className={styles.authContainer}>
        <AuthForm 
          title="Login to College Portal"
          onSubmit={handleLogin}
          loading={loading}
          error={error}
          fields={[
            { label: 'Email', type: 'email', value: email, onChange: (e) => setEmail(e.target.value) },
            { label: 'Password', type: 'password', value: password, onChange: (e) => setPassword(e.target.value) },
          ]}
          links={[
            { text: 'Forgot password?', to: '/forgot-password' },
          ]}
        />
        <button
          className={styles.backHomeBtn}
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Login;