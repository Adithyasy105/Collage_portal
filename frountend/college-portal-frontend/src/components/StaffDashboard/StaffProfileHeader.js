import React from 'react';
import styles from '../../styles/StaffDashboard.module.css';

const StaffProfileHeader = ({ staffProfile, onLogout }) => {
    return (
        <div className={styles.profileHeader}>
            <div className={styles.profileInfo}>
                <img src={staffProfile?.photoUrl || 'https://via.placeholder.com/50'} alt="Profile" className={styles.profilePhoto} />
                <div>
                    <span className={styles.profileName}>{staffProfile?.user?.name}</span>
                    <span className={styles.profileId}>{staffProfile?.employeeId}</span>
                </div>
            </div>
            <button onClick={onLogout} className={styles.logoutBtn}>Logout</button>
        </div>
    );
};

export default StaffProfileHeader;