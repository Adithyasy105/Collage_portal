import React, { useState, useEffect, useCallback } from 'react';
import styles from '../../styles/Dashboard.module.css';
import { getTeachersForFeedbackApi, submitBulkFeedbackApi, getStudentTermsApi } from '../../api/studentApi';

const FeedbackView = ({ studentProfile }) => {
  const [terms, setTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [feedbackForms, setFeedbackForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchAssignments = useCallback(async (termId) => {
    if (!studentProfile || !termId) return;
    setLoading(true);
    setSuccessMessage(null);
    setError(null);

    try {
      const data = await getTeachersForFeedbackApi(termId);

      const { assignments, existingFeedback } = data;
      setAssignments(assignments);

      // map feedbacks to assignment keys
      const initialForms = assignments.reduce((acc, assignment) => {
        const existing = existingFeedback.find(
          fb => fb.staffId === assignment.staffId && fb.subjectId === assignment.subjectId
        );
        const key = `${assignment.staffId}-${assignment.subjectId}`;
        acc[key] = {
          staffId: assignment.staffId,
          subjectId: assignment.subjectId,
          termId: parseInt(termId),
          rating: existing?.rating || '',
          comments: existing?.comments || '',
          submitted: !!existing,
        };
        return acc;
      }, {});
      setFeedbackForms(initialForms);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch teachers for feedback.');
    } finally {
      setLoading(false);
    }
  }, [studentProfile]);

  useEffect(() => {
    const fetchAllTerms = async () => {
      if (!studentProfile) return;
      try {
        const fetchedTerms = await getStudentTermsApi();
        setTerms(fetchedTerms);

        const currentTerm = fetchedTerms.find(term => new Date(term.endDate) > new Date());
        const initialId = currentTerm?.id.toString() || (fetchedTerms[0]?.id?.toString() || '');
        setSelectedTermId(initialId);
      } catch (err) {
        console.error("Failed to fetch terms:", err);
        setError('Failed to fetch terms for feedback.');
      }
    };

    fetchAllTerms();
  }, [studentProfile]);

  useEffect(() => {
    if (selectedTermId) {
      fetchAssignments(selectedTermId);
    }
  }, [selectedTermId, fetchAssignments]);

  const handleFormChange = (key, field, value) => {
    setFeedbackForms(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleSubmitAll = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const feedbacksToSubmit = Object.values(feedbackForms).filter(
      form => !form.submitted && form.rating !== ''
    );

    if (feedbacksToSubmit.length === 0) {
      setError('No new feedback to submit.');
      setLoading(false);
      return;
    }

    try {
      await submitBulkFeedbackApi(feedbacksToSubmit);
      setSuccessMessage('All new feedback submitted successfully!');
      fetchAssignments(selectedTermId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Fetching teachers...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div>
      <h3 className={styles.viewTitle}>Submit Feedback for Your Teachers</h3>
      <div className={styles.card}>
        {successMessage && <div className={`${styles.messageBox} ${styles.success}`}>{successMessage}</div>}
        {error && <div className={`${styles.messageBox} ${styles.error}`}>{error}</div>}

        <div className={styles.filterSection}>
          <label htmlFor="term-select" className={styles.formGroupLabel}>Select Term:</label>
          <select
            id="term-select"
            value={selectedTermId}
            onChange={e => setSelectedTermId(e.target.value)}
            className={styles.formSelect}
          >
            {terms.map(term => (
              <option key={term.id} value={term.id}>{term.name}</option>
            ))}
          </select>
        </div>

        <form className={styles.form} onSubmit={handleSubmitAll}>
          <div className={styles.feedbackGrid}>
            {assignments.map(assignment => {
              const key = `${assignment.staffId}-${assignment.subjectId}`;
              return (
                <div key={key} className={styles.feedbackCard}>
                  <div className={styles.feedbackTeacher}>
                    <h4>{assignment.staff.user.name}</h4>
                    <p>{assignment.subject.name}</p>
                  </div>

                  <div className={styles.ratingSelect}>
                    <label htmlFor={`rating-${key}`}>Rating:</label>
                    <select
                      id={`rating-${key}`}
                      value={feedbackForms[key]?.rating || ''}
                      onChange={e => handleFormChange(key, 'rating', e.target.value)}
                      disabled={feedbackForms[key]?.submitted}
                      required={!feedbackForms[key]?.submitted}
                    >
                      <option value="" disabled>--</option>
                      {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className={styles.commentsGroup}>
                    <label htmlFor={`comments-${key}`}>Comments:</label>
                    <textarea
                      id={`comments-${key}`}
                      value={feedbackForms[key]?.comments || ''}
                      onChange={e => handleFormChange(key, 'comments', e.target.value)}
                      disabled={feedbackForms[key]?.submitted}
                      rows="2"
                    />
                  </div>
                  {feedbackForms[key]?.submitted && (
                    <p className={styles.feedbackSubmitted}>✅ Feedback submitted</p>
                  )}
                </div>
              );
            })}
          </div>
          <button type="submit" disabled={loading} className={`${styles.submitBtn} ${styles.fullWidth}`}>
            {loading ? 'Submitting...' : 'Submit All Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackView;
