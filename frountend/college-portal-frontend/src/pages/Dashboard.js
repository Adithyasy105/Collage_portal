import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyStudentProfile, getStudentDashboardData } from 'api/studentApi.js';
import Sidebar from '../components/Dashboard/Sidebar';
import ProfileHeader from '../components/Dashboard/ProfileHeader';
import ProfileView from '../components/Dashboard/ProfileView';
import ProfileFormView from '../components/Dashboard/ProfileFormView';
import MarksView from '../components/Dashboard/MarksView';
import AttendanceView from '../components/Dashboard/AttendanceView';
import FeedbackView from '../components/Dashboard/FeedbackView';
import LeaveApplicationView from '../components/Dashboard/LeaveApplicationView';
import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [studentProfile, setStudentProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      // Fetch the student profile first
      const profileData = await getMyStudentProfile();
      setStudentProfile(profileData);
      
      // Check if the profile is complete. A complete profile should have a rollNumber.
      if (profileData && profileData.rollNumber) {
          const dashboardSummary = await getStudentDashboardData();
          setDashboardData(dashboardSummary);
      }
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
  
  // The core of the new logic: check for the profile and rollNumber
  if (!studentProfile || !studentProfile.rollNumber) {
    return <ProfileFormView userId={studentProfile?.userId} />;
  }

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar setActiveTab={setActiveTab} activeTab={activeTab} />
      <div className={styles.mainContent}>
        <ProfileHeader studentProfile={studentProfile} onLogout={handleLogout} />
        <div className={styles.contentArea}>
          {activeTab === 'profile' && <ProfileView profile={studentProfile} />}
          {activeTab === 'marks' && <MarksView marksSummary={dashboardData?.marksSummary} />}
          {activeTab === 'attendance' && <AttendanceView />}
          {activeTab === 'feedback' && <FeedbackView studentProfile={studentProfile} />}
          {activeTab === 'leave' && <LeaveApplicationView />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;