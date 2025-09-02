// components/Dashboard/AttendanceView.js
import React, { useState, useEffect } from "react";
import {
  getStudentTermsApi,
  getStudentAttendanceSummaryApi,
} from "../../api/studentApi";
import styles from "../../styles/Dashboard.module.css";

const AttendanceView = ({ studentProfile }) => {
  const [terms, setTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState([]);
  const [overallPercent, setOverallPercent] = useState(0);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const fetchedTerms = await getStudentTermsApi();
        setTerms(fetchedTerms);

        const currentTerm = fetchedTerms.find(
          (term) => new Date(term.endDate) > new Date()
        );
        const initialId =
          currentTerm?.id.toString() ||
          (fetchedTerms.length > 0 ? fetchedTerms[0].id.toString() : "");
        setSelectedTermId(initialId);

        if (initialId) {
          const data = await getStudentAttendanceSummaryApi(initialId);
          setSummary(data.subjects || []);
          setOverallPercent(data.overallPercent || 0);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch initial data.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, [studentProfile]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!selectedTermId) return;
      setLoading(true);
      try {
        const data = await getStudentAttendanceSummaryApi(selectedTermId);
        setSummary(data.subjects || []);
        setOverallPercent(data.overallPercent || 0);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch attendance summary.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [selectedTermId]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div>
      <h3 className={styles.viewTitle}>Attendance Summary</h3>

      <div className={styles.filterSection}>
        <label htmlFor="term-select" className={styles.formGroupLabel}>
          Select Term:
        </label>
        <select
          id="term-select"
          value={selectedTermId}
          onChange={(e) => setSelectedTermId(e.target.value)}
          className={styles.formSelect}
        >
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </select>
      </div>

      {summary.length > 0 ? (
        <>
          <div className={styles.overallAttendance}>
            Overall Attendance:{" "}
            <span
              style={{ color: overallPercent >= 75 ? "green" : "red" }}
            >
              {overallPercent}%
            </span>
          </div>

          <div className={styles.attendanceGrid}>
            {summary.map((subject) => (
              <div key={subject.subjectId} className={styles.card}>
                <h4>
                  {subject.subjectName} ({subject.subjectCode})
                </h4>
                <p
                  className={styles.attendancePercent}
                  style={{
                    color: subject.percentage >= 75 ? "green" : "red",
                  }}
                >
                  {subject.percentage}%
                </p>
                <p className={styles.attendanceDetails}>
                  {subject.present} / {subject.total} classes attended
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={`${styles.card} ${styles.loading}`}>
          No attendance data for this term.
        </div>
      )}
    </div>
  );
};

export default AttendanceView;
