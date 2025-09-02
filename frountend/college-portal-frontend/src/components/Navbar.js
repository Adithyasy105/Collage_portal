import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleAuthClick = () => {
        if (isLoggedIn) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
        setMobileMenuOpen(false);
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
                        {/* Use hrefs directly, without onClick, for native browser handling */}
                        <a href="/#home" className={styles.navLink}>Home</a>
                        <a href="/#about" className={styles.navLink}>About</a>
                        <a href="/#leadership" className={styles.navLink}>Leadership</a>
                        <a href="/#courses" className={styles.navLink}>Courses</a>
                        <a href="/#admission" className={styles.navLink}>Admission</a>
                        <a href="/#contact" className={styles.navLink}>Contact</a>
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