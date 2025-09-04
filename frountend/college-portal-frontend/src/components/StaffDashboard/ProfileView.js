import React from 'react';
import styles from '../../styles/StaffDashboard.module.css';

const ProfileView = ({ profile }) => {
    if (!profile || !profile.user) {
        return <div className={styles.card}>Profile data is missing. Please contact support.</div>;
    }
    
    return (
        <div className={styles.profileViewContainer}>
            <div className={styles.profilePhotoSection}>
                <img 
                    src={profile.photoUrl || 'https://via.placeholder.com/150'} 
                    alt="Staff Profile" 
                    className={styles.profilePhotoLarge} 
                />
                <h3>{profile.user.name}</h3>
                <p className={styles.profileId}>{profile.employeeId}</p>
            </div>
            <div className={styles.profileDetailsGrid}>
                <div className={styles.profileDetailsCard}>
                    <h4>Personal Information</h4>
                    <p><strong>Email:</strong> {profile.user.email}</p>
                    <p><strong>Phone:</strong> {profile.phone || 'N/A'}</p>
                    <p><strong>Alternate Email:</strong> {profile.emailAlt || 'N/A'}</p>
                    <p><strong>Qualification:</strong> {profile.qualification || 'N/A'}</p>
                    <p><strong>Joining Date:</strong> {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className={styles.profileDetailsCard}>
                    <h4>Academic & Role Information</h4>
                    <p><strong>Employee ID:</strong> {profile.employeeId}</p>
                    <p><strong>Designation:</strong> {profile.designation}</p>
                    <p><strong>Department:</strong> {profile.department.name}</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;