import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordApi } from 'api/authApi.js';
import AuthForm from '../components/AuthForm';
import styles from '../styles/Auth.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await forgotPasswordApi(email);
      setMessage('If your email exists, a password reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPageContainer}>
      <div className={styles.authContainer}>
        <AuthForm
          title="Forgot Password"
          onSubmit={handleForgotPassword}
          loading={loading}
          error={error}
          message={message}
          fields={[
            { label: 'Email', type: 'email', value: email, onChange: (e) => setEmail(e.target.value) },
          ]}
          buttonText="Send Reset Link"
          links={[
            { text: 'Back to login', to: '/login' },
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

export default ForgotPassword;