import React, { useState } from "react";
import {
  FaUser,
  FaClipboardList,
  FaChartBar,
  FaComments,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import styles from "../../styles/Dashboard.module.css";

const navItems = [
  { id: "profile", label: "View Profile", icon: <FaUser /> },
  { id: "attendance", label: "Attendance", icon: <FaClipboardList /> },
  { id: "marks", label: "Marks", icon: <FaChartBar /> },
  { id: "feedback", label: "Feedback", icon: <FaComments /> },
];

const StaffSidebar = ({ setActiveTab, activeTab }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarLogo}>Teacher Dashboard</h3>
        <button
          className={styles.toggleBtn}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${
              activeTab === item.id ? styles.active : ""
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default StaffSidebar;