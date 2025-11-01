import React, { useState, useEffect } from 'react';
import styles from '../../styles/Dashboard.module.css';
import { 
  getStaffForLeaveApi, 
  submitLeaveApplicationApi, 
  getStudentLeaveApplicationsApi 
} from '../../api/leaveApi';
import { FaFileUpload, FaCalendarAlt, FaUser, FaFileAlt, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const LeaveApplicationView = () => {
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'pending', 'approved', 'rejected'
  const [staffList, setStaffList] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    staffId: '',
    startDate: '',
    endDate: '',
    reason: '',
    letter: null
  });

  useEffect(() => {
    fetchApplications();
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await getStaffForLeaveApi();
      setStaffList(data.staff || []);
    } catch (err) {
      setError('Failed to fetch staff list');
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentLeaveApplicationsApi();
      setApplications(data.applications || []);
    } catch (err) {
      setError('Failed to fetch leave applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, letter: e.target.files[0] || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!formData.staffId || !formData.startDate || !formData.endDate || !formData.reason) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const submitFormData = new FormData();
      submitFormData.append('staffId', formData.staffId);
      submitFormData.append('startDate', formData.startDate);
      submitFormData.append('endDate', formData.endDate);
      submitFormData.append('reason', formData.reason);
      if (formData.letter) {
        submitFormData.append('letter', formData.letter);
      }

      await submitLeaveApplicationApi(submitFormData);
      setSuccessMessage('Leave application submitted successfully!');
      setFormData({
        staffId: '',
        startDate: '',
        endDate: '',
        reason: '',
        letter: null
      });
      // Reset file input
      const fileInput = document.getElementById('leaveLetter');
      if (fileInput) fileInput.value = '';
      
      fetchApplications();
      setActiveTab('pending');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <FaCheckCircle className={styles.statusIconApproved} />;
      case 'REJECTED':
        return <FaTimesCircle className={styles.statusIconRejected} />;
      default:
        return <FaClock className={styles.statusIconPending} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return styles.statusBadgeApproved;
      case 'REJECTED':
        return styles.statusBadgeRejected;
      default:
        return styles.statusBadgePending;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'pending') return app.status === 'PENDING';
    if (activeTab === 'approved') return app.status === 'APPROVED';
    if (activeTab === 'rejected') return app.status === 'REJECTED';
    return false;
  });

  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;

  return (
    <div className={styles.leaveApplicationContainer}>
      <h2 className={styles.sectionTitle}>Leave Applications</h2>

      {/* Tabs */}
      <div className={styles.leaveTabs}>
        <button
          className={`${styles.leaveTab} ${activeTab === 'new' ? styles.active : ''}`}
          onClick={() => setActiveTab('new')}
        >
          New Application
        </button>
        <button
          className={`${styles.leaveTab} ${activeTab === 'pending' ? styles.active : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button
          className={`${styles.leaveTab} ${activeTab === 'approved' ? styles.active : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved {approvedCount > 0 && `(${approvedCount})`}
        </button>
        <button
          className={`${styles.leaveTab} ${activeTab === 'rejected' ? styles.active : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected {rejectedCount > 0 && `(${rejectedCount})`}
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && <div className={styles.errorMessage}>{error}</div>}
      {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

      {/* New Application Form */}
      {activeTab === 'new' && (
        <form className={styles.leaveForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="staffId">
              <FaUser className={styles.formIcon} />
              Select Teacher <span className={styles.required}>*</span>
            </label>
            <select
              id="staffId"
              name="staffId"
              value={formData.staffId}
              onChange={handleInputChange}
              required
              className={styles.formSelect}
            >
              <option value="">-- Select a teacher --</option>
              {staffList.map(staff => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} - {staff.designation} ({staff.department})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="startDate">
                <FaCalendarAlt className={styles.formIcon} />
                Start Date <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endDate">
                <FaCalendarAlt className={styles.formIcon} />
                End Date <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                min={formData.startDate}
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="reason">
              Reason <span className={styles.required}>*</span>
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              rows="4"
              className={styles.formTextarea}
              placeholder="Please provide a reason for your leave application..."
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="leaveLetter">
              <FaFileUpload className={styles.formIcon} />
              Upload Leave Letter (Optional)
            </label>
            <input
              type="file"
              id="leaveLetter"
              name="letter"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className={styles.formFileInput}
            />
            {formData.letter && (
              <div className={styles.fileInfo}>
                Selected: {formData.letter.name}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      )}

      {/* Applications List */}
      {(activeTab === 'pending' || activeTab === 'approved' || activeTab === 'rejected') && (
        <div className={styles.applicationsList}>
          {loading ? (
            <div className={styles.loading}>Loading applications...</div>
          ) : filteredApplications.length === 0 ? (
            <div className={styles.noApplications}>
              No {activeTab} applications found.
            </div>
          ) : (
            <div className={styles.applicationsTable}>
              <table>
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Letter</th>
                    {activeTab === 'approved' || activeTab === 'rejected' ? <th>Comments</th> : null}
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map(app => (
                    <tr key={app.id}>
                      <td>
                        <div className={styles.teacherInfo}>
                          <strong>{app.staff.name}</strong>
                          <span>{app.staff.designation}</span>
                        </div>
                      </td>
                      <td>{new Date(app.startDate).toLocaleDateString()}</td>
                      <td>{new Date(app.endDate).toLocaleDateString()}</td>
                      <td className={styles.reasonCell}>{app.reason}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusClass(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.status}
                        </span>
                      </td>
                      <td>
                        {app.letterUrl ? (
                          <a
                            href={app.letterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.viewLetterLink}
                          >
                            <FaFileAlt /> View Letter
                          </a>
                        ) : (
                          <span className={styles.noLetter}>No letter</span>
                        )}
                      </td>
                      {(activeTab === 'approved' || activeTab === 'rejected') && (
                        <td className={styles.commentsCell}>
                          {app.staffComments || '-'}
                        </td>
                      )}
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveApplicationView;
