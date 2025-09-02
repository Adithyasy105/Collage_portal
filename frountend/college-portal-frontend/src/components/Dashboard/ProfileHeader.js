import React from 'react';
import styles from '../../styles/Dashboard.module.css';

const ProfileHeader = ({ studentProfile, onLogout }) => {
  return (
    <div className={styles.profileHeader}>
      <div className={styles.profileInfo}>
        <img src={studentProfile?.photoUrl || 'https://via.placeholder.com/50'} alt="Profile" className={styles.profilePhoto} />
        <div>
          <span className={styles.profileName}>{studentProfile?.user?.name}</span>
          <span className={styles.profileRollNumber}>{studentProfile?.rollNumber}</span>
        </div>
      </div>
      <button onClick={onLogout} className={styles.logoutBtn}>Logout</button>
    </div>
  );
};

export default ProfileHeader;