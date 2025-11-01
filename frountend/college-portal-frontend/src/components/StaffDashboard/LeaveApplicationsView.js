import React, { useState, useEffect } from 'react';
import styles from '../../styles/Dashboard.module.css';
import { 
  getStaffLeaveApplicationsApi, 
  updateLeaveApplicationStatusApi 
} from 'api/leaveApi.js';
import { 
  FaFileAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaUser,
  FaGraduationCap
} from 'react-icons/fa';

const LeaveApplicationsView = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeStatus, setActiveStatus] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStaffLeaveApplicationsApi();
      setApplications(data.applications || []);
    } catch (err) {
      setError('Failed to fetch leave applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, action) => {
    setActionLoading(applicationId);
    setError(null);
    setSuccessMessage(null);

    try {
      await updateLeaveApplicationStatusApi(applicationId, action, comments);
      setSuccessMessage(`Leave application ${action.toLowerCase()} successfully!`);
      setComments('');
      setSelectedApplication(null);
      await fetchApplications();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action.toLowerCase()} application`);
    } finally {
      setActionLoading(null);
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
    if (activeStatus === 'pending') return app.status === 'PENDING';
    if (activeStatus === 'approved') return app.status === 'APPROVED';
    if (activeStatus === 'rejected') return app.status === 'REJECTED';
    return true;
  });

  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;

  return (
    <div className={styles.leaveApplicationContainer}>
      <h2 className={styles.sectionTitle}>Leave Applications</h2>

      {/* Status Filter Tabs */}
      <div className={styles.leaveTabs}>
        <button
          className={`${styles.leaveTab} ${activeStatus === 'all' ? styles.active : ''}`}
          onClick={() => setActiveStatus('all')}
        >
          All ({applications.length})
        </button>
        <button
          className={`${styles.leaveTab} ${activeStatus === 'pending' ? styles.active : ''}`}
          onClick={() => setActiveStatus('pending')}
        >
          Pending {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button
          className={`${styles.leaveTab} ${activeStatus === 'approved' ? styles.active : ''}`}
          onClick={() => setActiveStatus('approved')}
        >
          Approved {approvedCount > 0 && `(${approvedCount})`}
        </button>
        <button
          className={`${styles.leaveTab} ${activeStatus === 'rejected' ? styles.active : ''}`}
          onClick={() => setActiveStatus('rejected')}
        >
          Rejected {rejectedCount > 0 && `(${rejectedCount})`}
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && <div className={styles.errorMessage}>{error}</div>}
      {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

      {/* Applications Table */}
      <div className={styles.applicationsList}>
        {loading ? (
          <div className={styles.loading}>Loading applications...</div>
        ) : filteredApplications.length === 0 ? (
          <div className={styles.noApplications}>
            No {activeStatus === 'all' ? '' : activeStatus} applications found.
          </div>
        ) : (
          <div className={styles.applicationsTable}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll Number</th>
                  <th>Program</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Letter</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map(app => (
                  <tr key={app.id}>
                    <td>
                      <div className={styles.studentInfo}>
                        <FaUser className={styles.studentIcon} />
                        <div>
                          <strong>{app.student.name}</strong>
                          <span>{app.student.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{app.student.rollNumber}</td>
                    <td>
                      <div className={styles.programInfo}>
                        <FaGraduationCap className={styles.programIcon} />
                        <span>{app.student.program}</span>
                      </div>
                    </td>
                    <td>{new Date(app.startDate).toLocaleDateString()}</td>
                    <td>{new Date(app.endDate).toLocaleDateString()}</td>
                    <td className={styles.reasonCell}>{app.reason}</td>
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
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {app.status}
                      </span>
                    </td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      {app.status === 'PENDING' ? (
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => setSelectedApplication(app.id)}
                            className={styles.actionButton}
                          >
                            Review
                          </button>
                        </div>
                      ) : (
                        <div className={styles.commentsDisplay}>
                          {app.staffComments && (
                            <span className={styles.commentsText}>
                              {app.staffComments}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal for Pending Applications */}
      {selectedApplication && (
        <div className={styles.modalOverlay} onClick={() => setSelectedApplication(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Review Leave Application</h3>
              <button
                className={styles.modalClose}
                onClick={() => setSelectedApplication(null)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {(() => {
                const app = applications.find(a => a.id === selectedApplication);
                if (!app) return null;
                return (
                  <>
                    <div className={styles.modalSection}>
                      <h4>Student Information</h4>
                      <p><strong>Name:</strong> {app.student.name}</p>
                      <p><strong>Roll Number:</strong> {app.student.rollNumber}</p>
                      <p><strong>Program:</strong> {app.student.program}</p>
                      <p><strong>Email:</strong> {app.student.email}</p>
                    </div>
                    <div className={styles.modalSection}>
                      <h4>Leave Details</h4>
                      <p><strong>Start Date:</strong> {new Date(app.startDate).toLocaleDateString()}</p>
                      <p><strong>End Date:</strong> {new Date(app.endDate).toLocaleDateString()}</p>
                      <p><strong>Reason:</strong> {app.reason}</p>
                      {app.letterUrl && (
                        <p>
                          <a
                            href={app.letterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.viewLetterLink}
                          >
                            <FaFileAlt /> View Leave Letter
                          </a>
                        </p>
                      )}
                    </div>
                    <div className={styles.modalSection}>
                      <label htmlFor="comments">
                        Comments (Optional)
                      </label>
                      <textarea
                        id="comments"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows="3"
                        className={styles.formTextarea}
                        placeholder="Add any comments or notes..."
                      />
                    </div>
                    <div className={styles.modalActions}>
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'APPROVED')}
                        disabled={actionLoading === app.id}
                        className={`${styles.approveButton} ${styles.modalButton}`}
                      >
                        {actionLoading === app.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                        disabled={actionLoading === app.id}
                        className={`${styles.rejectButton} ${styles.modalButton}`}
                      >
                        {actionLoading === app.id ? 'Processing...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApplication(null);
                          setComments('');
                        }}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApplicationsView;
