// src/components/AuthForm.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Auth.module.css';

// <-- ADD THESE IMPORT STATEMENTS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// A sub-component to handle the password input and its toggle button
const PasswordInput = ({ label, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const toggleVisibility = () => setShowPassword(!showPassword);

  return (
    <div className={styles.formGroup}>
      <label>{label}</label>
      <div className={styles.passwordWrapper}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required
          className={styles.passwordInput}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className={styles.passwordToggleBtn}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {/* CORRECT USAGE: Use the imported component and icons */}
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </button>
      </div>
    </div>
  );
};
// ... rest of the AuthForm component

// The main reusable AuthForm component
const AuthForm = ({ title, onSubmit, loading, error, message, fields, buttonText = 'Submit', links }) => (
  <form className={styles.authForm} onSubmit={onSubmit}>
    <h3>{title}</h3>
    {error && <div className={`${styles.messageBox} ${styles.error}`}>{error}</div>}
    {message && <div className={`${styles.messageBox} ${styles.success}`}>{message}</div>}
    {fields.map((field, index) => (
      field.type === 'password' ? (
        <PasswordInput
          key={index}
          label={field.label}
          value={field.value}
          onChange={field.onChange}
        />
      ) : (
        <div className={styles.formGroup} key={index}>
          <label>{field.label}</label>
          <input
            type={field.type}
            value={field.value}
            onChange={field.onChange}
            required
            className={styles.formInput}
          />
        </div>
      )
    ))}
    <button type="submit" disabled={loading} className={styles.submitBtn}>
      {loading ? 'Loading...' : buttonText}
    </button>
    <div className={styles.authLinks}>
      {links && links.map((link, index) => (
        <Link key={index} to={link.to}>{link.text}</Link>
      ))}
    </div>
  </form>
);

export default AuthForm;