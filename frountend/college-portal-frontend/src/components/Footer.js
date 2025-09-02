import React from 'react';
import styles from '../styles/Footer.module.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Column 1: Brand Info */}
        <div className={styles.footerCol}>
          <div className={styles.footerBrand}>Umachagi ITI</div>
          <p className={styles.footerSlogan}>Empowering Skills, Building Futures.</p>
          <div className={styles.socialIcons}>
            <a href="https://facebook.com" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="https://twitter.com" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="https://linkedin.com" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className={styles.footerCol}>
          <h3>Quick Links</h3>
          <nav className={styles.footerNav}>
            <a href="/#about" className={styles.footerLink}>About Us</a>
            <a href="/#courses" className={styles.footerLink}>Courses Offered</a>
            <a href="/#admission" className={styles.footerLink}>Admission</a>
            <a href="/#contact" className={styles.footerLink}>Contact</a>
          </nav>
        </div>

        {/* Column 3: Contact Info */}
        <div className={styles.footerCol}>
          <h3>Contact Us</h3>
          <p>
            123 College Road, Hassan,<br />
            Karnataka, India
          </p>
          <p>
            Phone: +91 12345 67890<br />
            Email: info@umachagiiti.edu.in
          </p>
        </div>
      </div>
      
      <div className={styles.footerCopy}>
        &copy; {year} Umachagi ITI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;