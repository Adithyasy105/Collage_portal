import React, { useState, useEffect } from 'react';
import styles from '../../styles/StaffDashboard.module.css';
import { getStaffFeedbackApi } from '../../api/staffApi';

const FeedbackView = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTerm, setSelectedTerm] = useState('');
    const [terms, setTerms] = useState([]);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await getStaffFeedbackApi();
                setFeedbacks(response.feedbacks || []);

                // Extract unique terms from feedbacks
                const uniqueTerms = Array.from(
                    new Map(
                        (response.feedbacks || []).map(fb => [fb.term.id, fb.term])
                    ).values()
                );
                setTerms(uniqueTerms);

                if (uniqueTerms.length > 0) setSelectedTerm(uniqueTerms[0].id); // default first term
            } catch (err) {
                setError('Failed to fetch feedback.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    if (loading) {
        return (
            <div className={styles.dashboardLoading}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    if (error) return <div className={`${styles.card} ${styles.error}`}>{error}</div>;

    // Filter feedbacks based on selected term
    const filteredFeedbacks = selectedTerm
        ? feedbacks.filter(fb => fb.term.id === selectedTerm)
        : feedbacks;

    if (filteredFeedbacks.length === 0) {
        return <div className={`${styles.card} ${styles.noData}`}>No feedback for this term.</div>;
    }

    // Group by student
    const groupedFeedback = filteredFeedbacks.reduce((acc, fb) => {
        const studentName = fb.student?.user?.name || `Student ${fb.student.id}`;
        if (!acc[studentName]) acc[studentName] = [];
        acc[studentName].push(fb);
        return acc;
    }, {});

    return (
        <div className={styles.feedbackContainer}>
            <h3 className={styles.viewTitle}>Feedback Submitted About You</h3>

            {/* Term Dropdown */}
            <div className={styles.formGroup}>
                <label htmlFor="termSelect">Select Term:</label>
                <select
                    id="termSelect"
                    value={selectedTerm}
                    onChange={e => setSelectedTerm(Number(e.target.value))}
                >
                    {terms.map(term => (
                        <option key={term.id} value={term.id}>
                            {term.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.feedbackList}>
                {Object.entries(groupedFeedback).map(([studentName, studentFeedbacks]) => (
                    <div key={studentName} className={styles.feedbackCard}>
                        <div className={styles.feedbackHeader}>
                            <h4>Feedback from {studentName}</h4>
                            <p className={styles.feedbackDate}>
                                Submitted: {new Date(studentFeedbacks[0].createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        {studentFeedbacks.map(fb => (
                            <div key={fb.id} className={styles.feedbackDetails}>
                                <p><strong>Subject:</strong> {fb.subject.name}</p>
                                <p>
                                    <strong>Rating:</strong> <span className={styles.rating}>{fb.rating} / 5</span>
                                </p>
                                <p><strong>Comments:</strong> {fb.comments || 'N/A'}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeedbackView;
