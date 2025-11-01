import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyStaffProfile, upsertStaffProfileApi, uploadStaffProfilePhotoApi } from '../../api/staffApi.js';
import styles from '../../styles/StaffDashboard.module.css';

const ProfileFormView = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId: '',
    designation: '',
    departmentId: '',
    phone: '',
    emailAlt: '',
    qualification: '',
    joiningDate: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isNewProfile, setIsNewProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getMyStaffProfile();
        setFormData(prev => ({
          ...prev,
          ...profile,
          joiningDate: profile.joiningDate ? new Date(profile.joiningDate).toISOString().split('T')[0] : '',
        }));
        setPhotoPreview(profile.photoUrl);
        setIsNewProfile(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setIsNewProfile(true);
        } else {
          setError('Failed to fetch existing profile data.');
        }
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let photoUrl = photoPreview;
      if (photoFile) {
        const photoUploadResponse = await uploadStaffProfilePhotoApi(photoFile);
        photoUrl = photoUploadResponse.photoUrl;
      }
      
      await upsertStaffProfileApi({
        ...formData,
        photoUrl: photoUrl || null,
        departmentId: parseInt(formData.departmentId),
      });
      alert('Profile saved successfully!');
      navigate('/staff-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.viewTitle}>{isNewProfile ? 'Complete Your Profile' : 'Edit Your Profile'}</h3>
      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.errorMsg}>{error}</div>}
          <div className={styles.profilePhotoUpload}>
            <div className={styles.photoPreview}>
              {photoPreview ? <img src={photoPreview} alt="Profile" className={styles.photoImg} /> : <div className={styles.photoPlaceholder}>No Photo</div>}
            </div>
            <label htmlFor="profile-photo" className={styles.photoLabel}>{photoPreview ? 'Change Photo' : 'Upload Photo'}</label>
            <input type="file" id="profile-photo" accept="image/*" onChange={handleFileChange} className={styles.photoInput} />
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="employeeId">Employee ID</label>
              <input type="text" id="employeeId" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} required disabled={!isNewProfile} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="departmentId">Department ID</label>
              <input type="number" id="departmentId" value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} required disabled={!isNewProfile} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="designation">Designation</label>
              <input type="text" id="designation" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone</label>
              <input type="tel" id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="emailAlt">Alternate Email</label>
              <input type="email" id="emailAlt" value={formData.emailAlt} onChange={(e) => setFormData({ ...formData, emailAlt: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="qualification">Qualification</label>
              <input type="text" id="qualification" value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="joiningDate">Joining Date</label>
              <input type="date" id="joiningDate" value={formData.joiningDate} onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={loading} className={styles.submitBtn}>{loading ? 'Saving...' : 'Save Profile'}</button>
        </form>
      </div>
    </div>
  );
};

export default ProfileFormView;