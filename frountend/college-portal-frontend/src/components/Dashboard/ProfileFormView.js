import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { upsertStudentProfileApi, getMyStudentProfile, uploadProfilePhotoApi } from 'api/studentApi.js';
import styles from '../../styles/ProfileFormView.module.css';

const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'];
const CATEGORY_OPTIONS = ['GEN', 'OBC', 'SC', 'ST'];

const ProfileFormView = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rollNumber: '',
    admissionYear: new Date().getFullYear(),
    currentSemester: 1,
    programId: '',
    sectionId: '',
    dob: '',
    gender: '',
    category: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isNewProfile, setIsNewProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getMyStudentProfile();
        setFormData(prev => ({
          ...prev,
          ...profile,
          dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
          admissionYear: profile.admissionYear || '',
          currentSemester: profile.currentSemester || '',
          programId: profile.programId || '',
          sectionId: profile.sectionId || '',
          guardianEmail: profile.guardianEmail || '',
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
        const photoUploadResponse = await uploadProfilePhotoApi(photoFile);
        photoUrl = photoUploadResponse.photoUrl;
      }
      
      await upsertStudentProfileApi({
        ...formData,
        photoUrl: photoUrl || null,
        admissionYear: parseInt(formData.admissionYear),
        currentSemester: parseInt(formData.currentSemester),
        programId: parseInt(formData.programId),
        sectionId: parseInt(formData.sectionId),
      });

      alert('Profile saved successfully!');
      navigate('/dashboard');
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
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className={styles.photoImg} />
              ) : (
                <div className={styles.photoPlaceholder}>No Photo</div>
              )}
            </div>
            <label htmlFor="profile-photo" className={styles.photoLabel}>
              {photoPreview ? 'Change Photo' : 'Upload Photo'}
            </label>
            <input type="file" id="profile-photo" accept="image/*" onChange={handleFileChange} className={styles.photoInput} />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="rollNumber">Roll Number</label>
              <input type="text" id="rollNumber" value={formData.rollNumber} onChange={(e) => setFormData({...formData, rollNumber: e.target.value})} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="admissionYear">Admission Year</label>
              <input type="number" id="admissionYear" value={formData.admissionYear} onChange={(e) => setFormData({...formData, admissionYear: e.target.value})} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="currentSemester">Current Semester</label>
              <input type="number" id="currentSemester" value={formData.currentSemester} onChange={(e) => setFormData({...formData, currentSemester: e.target.value})} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="programId">Program ID</label>
              <input type="number" id="programId" value={formData.programId} onChange={(e) => setFormData({...formData, programId: e.target.value})} required disabled={!isNewProfile} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="sectionId">Section ID</label>
              <input type="number" id="sectionId" value={formData.sectionId} onChange={(e) => setFormData({...formData, sectionId: e.target.value})} disabled={!isNewProfile} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="dob">Date of Birth</label>
              <input type="date" id="dob" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="gender">Gender</label>
              <select id="gender" value={formData.gender || ''} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                <option value="" disabled>Select Gender</option>
                {GENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="category">Category</label>
              <select id="category" value={formData.category || ''} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="" disabled>Select Category</option>
                {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="address">Address</label>
              <input type="text" id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="city">City</label>
              <input type="text" id="city" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="state">State</label>
              <input type="text" id="state" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="pincode">Pincode</label>
              <input type="text" id="pincode" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="guardianName">Guardian Name</label>
              <input type="text" id="guardianName" value={formData.guardianName} onChange={(e) => setFormData({...formData, guardianName: e.target.value})} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="guardianPhone">Guardian Phone</label>
              <input type="tel" id="guardianPhone" value={formData.guardianPhone} onChange={(e) => setFormData({...formData, guardianPhone: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="guardianEmail">Guardian Email</label>
              <input type="email" id="guardianEmail" value={formData.guardianEmail} onChange={(e) => setFormData({...formData, guardianEmail: e.target.value})} />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileFormView;