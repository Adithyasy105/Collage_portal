import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPasswordApi } from '../api/authApi.js';
import AuthForm from '../components/AuthForm';
import styles from '../styles/Auth.module.css';

function ResetPassword() {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await resetPasswordApi(token, newPassword);
            alert('Password reset successfully! You can now log in.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Password reset failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authPageContainer}>
            <div className={styles.authContainer}>
                <AuthForm
                    title="Reset Password"
                    onSubmit={handleResetPassword}
                    loading={loading}
                    error={error}
                    fields={[
                        { label: 'New Password', type: 'password', value: newPassword, onChange: (e) => setNewPassword(e.target.value) },
                        { label: 'Confirm New Password', type: 'password', value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value) },
                    ]}
                    buttonText="Reset Password"
                />
            </div>
        </div>
    );
}

export default ResetPassword;