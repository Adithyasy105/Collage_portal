import React from 'react';
import styles from '../../styles/StaffDashboard.module.css';

const ProfileView = ({ profile }) => {
  if (!profile || !profile.user) {
    return <div className={styles.card}>Profile data is missing. Please contact support.</div>;
  }

  return (
    <div className={styles.profileViewContainer}>
      {/* Top Photo Section */}
      <div className={styles.profilePhotoSection}>
        <img
          src={profile.photoUrl || 'https://via.placeholder.com/150'}
          alt="Student Profile"
          className={styles.profilePhotoLarge}
        />
        <h3>{profile.user.name}</h3>
        <p className={styles.profileId}>{profile.rollNumber}</p>
      </div>

      {/* Profile Details */}
      <div className={styles.profileDetailsGrid}>
        <div className={styles.profileDetailsCard}>
          <h4>Personal Information</h4>
          <p><strong>Email:</strong> {profile.user.email}</p>
          <p><strong>Admission Year:</strong> {profile.admissionYear}</p>
          <p><strong>Current Semester:</strong> {profile.currentSemester}</p>
        </div>
        <div className={styles.profileDetailsCard}>
          <h4>Academic & Guardian Information</h4>
          <p><strong>Program:</strong> {profile.program.name}</p>
          <p><strong>Section:</strong> {profile.section?.name || 'N/A'}</p>
          <p><strong>Guardian Name:</strong> {profile.guardianName}</p>
          <p><strong>Guardian Phone:</strong> {profile.guardianPhone}</p>
          <p><strong>Guardian Email:</strong> {profile.guardianEmail}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
