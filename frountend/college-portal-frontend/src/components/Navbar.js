import React, { useState, useEffect } from 'react';
import styles from '../styles/Navbar.module.css';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const userData = JSON.parse(localStorage.getItem('user')) || {};

  const handleAuthClick = () => {
    const role = userData?.user?.role;
    if (role === 'STUDENT') navigate('/dashboard');
    else if (role === 'STAFF') navigate('/staff-dashboard');
    else navigate('/login');

    setMobileMenuOpen(false);
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false); // Close mobile menu after click
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.navbarBrand}>Umachagi ITI, Hassan</div>

        <button
          className={`${styles.navbarToggle} ${mobileMenuOpen ? styles.active : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
        </button>

        <div className={`${styles.navbarLinks} ${mobileMenuOpen ? styles.active : ''}`}>
          <nav className={styles.nav} aria-label="Main Navigation">
            <button className={styles.navLink} onClick={() => scrollToSection('home')}>Home</button>
            <button className={styles.navLink} onClick={() => scrollToSection('about')}>About</button>
            <button className={styles.navLink} onClick={() => scrollToSection('leadership')}>Leadership</button>
            <button className={styles.navLink} onClick={() => scrollToSection('courses')}>Courses</button>
            <button className={styles.navLink} onClick={() => scrollToSection('admission')}>Admission</button>
            <button className={styles.navLink} onClick={() => scrollToSection('contact')}>Contact</button>
          </nav>

          <button className={styles.loginBtn} onClick={handleAuthClick} aria-label="Login">
            {isLoggedIn ? 'Dashboard' : 'Login'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
