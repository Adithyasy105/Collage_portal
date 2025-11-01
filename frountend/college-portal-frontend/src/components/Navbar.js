import React, { useState, useEffect } from "react";
import styles from "../styles/Navbar.module.css";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      setIsLoggedIn(true);
      setRole(user.role);
    } else {
      setIsLoggedIn(false);
      setRole(null);
    }
  }, []);

  const handleAuthClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      if (role === "STUDENT") navigate("/dashboard");
      else if (role === "STAFF") navigate("/staff-dashboard");
      else if (role === "ADMIN") navigate("/admin-dashboard");
      else navigate("/");
    }
    setMobileMenuOpen(false);
  };


  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      // Navigate to home first
      navigate("/", { state: { scrollTarget: id } });
    } else {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMobileMenuOpen(false); // Close mobile menu
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div
          className={styles.navbarBrand}
          onClick={() => scrollToSection("home")}
          style={{ cursor: "pointer" }}
        >
          Umachagi ITI, Hassan
        </div>

        <button
          className={`${styles.navbarToggle} ${
            mobileMenuOpen ? styles.active : ""
          }`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
        </button>

        <div
          className={`${styles.navbarLinks} ${
            mobileMenuOpen ? styles.active : ""
          }`}
        >
          <nav className={styles.nav} aria-label="Main Navigation">
            <button
              className={styles.navLink}
              onClick={() => scrollToSection("home")}
            >
              Home
            </button>
            <button
              className={styles.navLink}
              onClick={() => scrollToSection("about")}
            >
              About
            </button>
            <button
              className={styles.navLink}
              onClick={() => scrollToSection("leadership")}
            >
              Leadership
            </button>
            <button
              className={styles.navLink}
              onClick={() => scrollToSection("courses")}
            >
              Courses
            </button>
            <button
              className={styles.navLink}
              onClick={() => scrollToSection("admission")}
            >
              Admission
            </button>
            <button
              className={styles.navLink}
              onClick={() => scrollToSection("contact")}
            >
              Contact
            </button>
            <button
              className={styles.navLink}
              onClick={() => {
                navigate("/tools");
                setMobileMenuOpen(false);
              }}
            >
              Tools
            </button>
          </nav>

          <button
            className={styles.loginBtn}
            onClick={handleAuthClick}
            aria-label="Login"
          >
            {isLoggedIn
              ? role === "STUDENT"
                ? "Student Dashboard"
                : role === "STAFF"
                ? "Staff Dashboard"
                : role === "ADMIN"
                ? "Admin Dashboard"
                : "Dashboard"
              : "Login"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
