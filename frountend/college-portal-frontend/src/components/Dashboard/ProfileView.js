import React from 'react';
import styles from '../../styles/Dashboard.module.css';

const ProfileView = ({ profile }) => {
  if (!profile || !profile.user) {
      // Add this check for robustness
      return <div className={styles.card}>Profile data is missing. Please contact support.</div>;
  }
  
  return (
    <div className={styles.profileViewContainer}>
        <h3 className={styles.viewTitle}>My Profile</h3>
        <div className={styles.profileDetails}>
            <div className={styles.profileSection}>
                <p><strong>Name:</strong> {profile.user.name}</p>
                <p><strong>Email:</strong> {profile.user.email}</p>
                <p><strong>Roll Number:</strong> {profile.rollNumber}</p>
                <p><strong>Admission Year:</strong> {profile.admissionYear}</p>
                <p><strong>Current Semester:</strong> {profile.currentSemester}</p>
            </div>
            <div className={styles.profileSection}>
                <p><strong>Program:</strong> {profile.program.name}</p>
                <p><strong>Section:</strong> {profile.section?.name || 'N/A'}</p>
                <p><strong>Guardian:</strong> {profile.guardianName}</p>
                <p><strong>Guardian Phone:</strong> {profile.guardianPhone}</p>
                <p><strong>Guardian Email:</strong> {profile.guardianEmail}</p>
            </div>
        </div>
    </div>
  );
};

export default ProfileView;