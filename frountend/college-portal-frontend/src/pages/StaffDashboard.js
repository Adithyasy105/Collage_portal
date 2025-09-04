import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyStaffProfile, getStaffDashboardData } from '../api/staffApi';
import StaffSidebar from '../components/StaffDashboard/StaffSidebar';
import StaffProfileHeader from '../components/StaffDashboard/StaffProfileHeader';
import StaffProfileView from '../components/StaffDashboard/ProfileView';
import ProfileFormView from '../components/StaffDashboard/ProfileFormView';
import AttendanceUploadView from '../components/StaffDashboard/AttendanceUploadView';
import MarksUploadView from '../components/StaffDashboard/MarksUploadView';
import FeedbackView from '../components/StaffDashboard/FeedbackView';
import styles from '../styles/StaffDashboard.module.css';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [staffProfile, setStaffProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [profileData, dashboardData] = await Promise.all([
        getMyStaffProfile(),
        getStaffDashboardData()
      ]);
      setStaffProfile(profileData);
      setDashboardData(dashboardData);
    } catch (err) {
      setError('Failed to fetch dashboard data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
  return (
    <div className={styles.dashboardLoading}>
      <div className={styles.spinner}></div>
    </div>
  );
}


  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!staffProfile || !staffProfile.employeeId) {
    return <ProfileFormView />;
  }

  return (
    <div className={styles.dashboardLayout}>
      <StaffSidebar setActiveTab={setActiveTab} activeTab={activeTab} />
      <div className={styles.mainContent}>
        <StaffProfileHeader staffProfile={staffProfile} onLogout={handleLogout} />
        <div className={styles.contentArea}>
          {activeTab === 'profile' && <StaffProfileView profile={staffProfile} />}
          {activeTab === 'attendance' && <AttendanceUploadView assignments={dashboardData.assignments} />}
          {activeTab === 'marks' && <MarksUploadView assignments={dashboardData.assignments} />}
          {activeTab === 'feedback' && <FeedbackView />}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;