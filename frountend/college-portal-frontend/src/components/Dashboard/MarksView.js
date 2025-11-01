import React, { useState, useEffect } from 'react';
import { getStudentMarksApi, getStudentTermsApi } from 'api/studentApi.js';
import styles from '../../styles/Dashboard.module.css';

const MarksView = () => {
  const [terms, setTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Group marks by subject
  const groupMarksBySubject = (marksArray) => {
    return marksArray.reduce((acc, mark) => {
      const subjectId = mark.assessment.subject.id;
      const staffName = mark.assessment.createdBy?.user?.name || 'Unknown';

      if (!acc[subjectId]) {
        acc[subjectId] = {
          subjectId: subjectId,
          subjectName: mark.assessment.subject.name,
          subjectCode: mark.assessment.subject.code,
          teacher: staffName,
          assessments: [],
        };
      }

      acc[subjectId].assessments.push({
        assessmentName: mark.assessment.name,
        marksObtained: mark.marksObtained,
        maxMarks: mark.assessment.maxMarks,
        date: mark.assessment.date,
      });

      return acc;
    }, {});
  };

  // Initial fetch for terms and default term marks
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const fetchedTerms = await getStudentTermsApi();
        setTerms(fetchedTerms);

        const currentTerm = fetchedTerms.find(term => new Date(term.endDate) > new Date());
        const initialId = currentTerm?.id?.toString() || fetchedTerms[0]?.id?.toString() || '';
        setSelectedTermId(initialId);

        if (initialId) {
          const fetchedMarks = await getStudentMarksApi(null, initialId);
          setMarks(fetchedMarks);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch marks data.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, []);

  // Fetch marks when term changes
  useEffect(() => {
    const fetchMarks = async () => {
      if (!selectedTermId) return;
      setLoading(true);
      try {
        const fetchedMarks = await getStudentMarksApi(null, selectedTermId);
        setMarks(fetchedMarks);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch marks for this term.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [selectedTermId]);

  const handleTermChange = (e) => {
    setSelectedTermId(e.target.value);
  };

  if (loading) return <div className={styles.loading}>Loading marks...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const groupedMarks = Object.values(groupMarksBySubject(marks));

  return (
    <div>
      <h3 className={styles.viewTitle}>My Marks</h3>

      {/* Term Selector */}
      <div className={styles.filterSection}>
        <label htmlFor="term-select" className={styles.formGroupLabel}>Select Term:</label>
        <select
          id="term-select"
          value={selectedTermId}
          onChange={handleTermChange}
          className={styles.formSelect}
        >
          {terms.map(term => (
            <option key={term.id} value={term.id}>{term.name}</option>
          ))}
        </select>
      </div>

      {groupedMarks.length === 0 ? (
        <div className={`${styles.card} ${styles.loading}`}>No marks data available for this term.</div>
      ) : (
        <div className={styles.marksSection}>
          {groupedMarks.map(subject => (
            <div key={subject.subjectId} className={styles.marksSubjectCard}>
              <div className={styles.subjectHeader}>
                <h4>{subject.subjectName} ({subject.subjectCode})</h4>
                <p>Teacher: {subject.teacher}</p>
              </div>
              <div className={styles.marksAssessmentList}>
                {subject.assessments.map((assessment, index) => (
                  <div key={index} className={styles.marksAssessmentItem}>
                    <p className={styles.assessmentName}>{assessment.assessmentName}</p>
                    <p className={styles.marksObtained}>
                      {assessment.marksObtained} / {assessment.maxMarks}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarksView;
