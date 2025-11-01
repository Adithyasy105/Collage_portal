// components/Dashboard/AttendanceView.js
import React, { useState, useEffect } from "react";
import {
  getStudentTermsApi,
  getStudentAttendanceSummaryApi,
  getStudentAttendanceApi,
} from "../../api/studentApi.js";
import styles from "../../styles/Dashboard.module.css";
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaCalendarAlt, 
  FaClock, 
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle
} from "react-icons/fa";

const AttendanceView = () => {
  const [terms, setTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState([]);
  const [overallPercent, setOverallPercent] = useState(0);
  const [detailedRecords, setDetailedRecords] = useState({}); // { subjectId: [records] }
  const [expandedSubjects, setExpandedSubjects] = useState(new Set());
  const [loadingDetails, setLoadingDetails] = useState(new Set());

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
          await fetchSummaryData(initialId);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch initial data.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (selectedTermId) {
      fetchSummaryData(selectedTermId);
    }
  }, [selectedTermId]);

  const fetchSummaryData = async (termId) => {
    setLoading(true);
    try {
      const data = await getStudentAttendanceSummaryApi(termId);
      setSummary(data.subjects || []);
      setOverallPercent(data.overallPercent || 0);
      // Clear detailed records when term changes
      setDetailedRecords({});
      setExpandedSubjects(new Set());
    } catch (err) {
      console.error(err);
      setError("Failed to fetch attendance summary.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSubjectDetails = async (subjectId) => {
    const newExpanded = new Set(expandedSubjects);
    
    if (newExpanded.has(subjectId)) {
      // Collapse
      newExpanded.delete(subjectId);
    } else {
      // Expand - fetch detailed records if not already loaded
      newExpanded.add(subjectId);
      
      if (!detailedRecords[subjectId]) {
        setLoadingDetails(new Set([...loadingDetails, subjectId]));
        try {
          const records = await getStudentAttendanceApi(selectedTermId);
          // Filter records for this subject and term
          const subjectRecords = records.filter(
            (record) => 
              record.subjectId === subjectId && 
              record.session?.term?.id === parseInt(selectedTermId)
          );
          
          // Sort by date (newest first)
          subjectRecords.sort((a, b) => 
            new Date(b.session.scheduledAt) - new Date(a.session.scheduledAt)
          );
          
          setDetailedRecords({
            ...detailedRecords,
            [subjectId]: subjectRecords
          });
        } catch (err) {
          console.error("Failed to fetch detailed attendance:", err);
          setError("Failed to load detailed attendance records.");
        } finally {
          const newLoading = new Set(loadingDetails);
          newLoading.delete(subjectId);
          setLoadingDetails(newLoading);
        }
      }
    }
    
    setExpandedSubjects(newExpanded);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':
        return <FaCheckCircle className={styles.attendanceStatusPresent} />;
      case 'ABSENT':
        return <FaTimesCircle className={styles.attendanceStatusAbsent} />;
      case 'LATE':
        return <FaExclamationTriangle className={styles.attendanceStatusLate} />;
      case 'EXCUSED':
        return <FaInfoCircle className={styles.attendanceStatusExcused} />;
      default:
        return null;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PRESENT':
        return styles.attendanceBadgePresent;
      case 'ABSENT':
        return styles.attendanceBadgeAbsent;
      case 'LATE':
        return styles.attendanceBadgeLate;
      case 'EXCUSED':
        return styles.attendanceBadgeExcused;
      default:
        return '';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
    };
  };

  if (loading && !summary.length) {
    return <div className={styles.loading}>Loading attendance data...</div>;
  }

  if (error && !summary.length) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.attendanceContainer}>
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
          <div className={styles.overallAttendanceCard}>
            <div className={styles.overallAttendance}>
              <span className={styles.overallLabel}>Overall Attendance:</span>
              <span
                className={`${styles.overallPercent} ${
                  overallPercent >= 75 ? styles.attendanceGood : styles.attendanceLow
                }`}
              >
                {overallPercent}%
              </span>
            </div>
          </div>

          <div className={styles.attendanceSubjectsContainer}>
            {summary.map((subject) => {
              const isExpanded = expandedSubjects.has(subject.subjectId);
              const records = detailedRecords[subject.subjectId] || [];
              const isLoadingDetails = loadingDetails.has(subject.subjectId);

              return (
                <div key={subject.subjectId} className={styles.attendanceSubjectCard}>
                  <div 
                    className={styles.subjectCardHeader}
                    onClick={() => toggleSubjectDetails(subject.subjectId)}
                  >
                    <div className={styles.subjectHeaderContent}>
                      <div className={styles.subjectInfo}>
                        <h4 className={styles.subjectName}>
                          {subject.subjectName}
                        </h4>
                        <span className={styles.subjectCode}>
                          {subject.subjectCode}
                        </span>
                      </div>
                      <div className={styles.subjectStats}>
                        <span
                          className={`${styles.attendancePercent} ${
                            subject.percentage >= 75 ? styles.attendanceGood : styles.attendanceLow
                          }`}
                        >
                          {subject.percentage}%
                        </span>
                        <span className={styles.attendanceDetails}>
                          {subject.present} / {subject.total} classes
                        </span>
                      </div>
                    </div>
                    <button className={styles.expandButton}>
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className={styles.subjectDetails}>
                      {isLoadingDetails ? (
                        <div className={styles.loadingDetails}>
                          Loading attendance records...
                        </div>
                      ) : records.length > 0 ? (
                        <div className={styles.attendanceRecordsTable}>
                          <table>
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Teacher</th>
                                <th>Room</th>
                                <th>Status</th>
                                <th>Duration</th>
                              </tr>
                            </thead>
                            <tbody>
                              {records.map((record) => {
                                const { date, time } = formatDateTime(record.session.scheduledAt);
                                const teacherName = record.session.takenBy?.user?.name || 
                                                  record.session.takenBy?.employeeId || 
                                                  'N/A';
                                
                                return (
                                  <tr key={record.id}>
                                    <td>
                                      <div className={styles.dateCell}>
                                        <FaCalendarAlt className={styles.dateIcon} />
                                        {date}
                                      </div>
                                    </td>
                                    <td>
                                      <div className={styles.timeCell}>
                                        <FaClock className={styles.timeIcon} />
                                        {time}
                                      </div>
                                    </td>
                                    <td>
                                      <div className={styles.teacherCell}>
                                        <FaUser className={styles.teacherIcon} />
                                        {teacherName}
                                        {record.session.takenBy?.designation && (
                                          <span className={styles.teacherDesignation}>
                                            ({record.session.takenBy.designation})
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td>{record.session.room || 'N/A'}</td>
                                    <td>
                                      <span className={`${styles.attendanceStatusBadge} ${getStatusClass(record.status)}`}>
                                        {getStatusIcon(record.status)}
                                        {record.status}
                                      </span>
                                    </td>
                                    <td>
                                      {record.session.durationMin 
                                        ? `${record.session.durationMin} min` 
                                        : 'N/A'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className={styles.noRecords}>
                          No attendance records found for this subject.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
