import React, { useState, useEffect, useCallback } from "react";
import styles from "../../styles/StaffDashboard.module.css";
import {
  createClassSessionApi,
  uploadAttendanceCsvApi,
  getSectionStudentsApi,
  markAttendanceApi,
  getMySessionsApi,
} from "../../api/staffApi";

const AttendanceUploadView = ({ assignments }) => {
  const [sessionForm, setSessionForm] = useState({
    sectionId: "",
    subjectId: "",
    termId: "",
    scheduledAt: "",
    durationMin: "",
    room: "",
  });

  const [students, setStudents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [csvFile, setCsvFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState("manual");
  const [editingExisting, setEditingExisting] = useState(false);

  const resetForNewSession = () => {
    setEditingExisting(false);
    setSessionId(null);
    setStudents([]);
    setAttendanceStatus({});
    setSessionForm({
      sectionId: "",
      subjectId: "",
      termId: "",
      scheduledAt: "",
      durationMin: "",
      room: "",
    });
    setSuccess(null);
    setError(null);
  };

  const fetchSessions = useCallback(async () => {
    try {
      const data = await getMySessionsApi();
      setSessions(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch your sessions.");
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    if (editingExisting) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await createClassSessionApi({
        ...sessionForm,
        sectionId: Number(sessionForm.sectionId),
        subjectId: Number(sessionForm.subjectId),
        termId: Number(sessionForm.termId),
      });

      const newSession = response.session;
      setSessionId(newSession.id);
      setSuccess(
        `Session created successfully at ${new Date(
          newSession.startTime || newSession.scheduledAt
        ).toLocaleTimeString()}`
      );
      setEditingExisting(false);

      await fetchSessions();

      // ✅ Fetch students for section
      if (newSession.sectionId || sessionForm.sectionId) {
        const rawList = await getSectionStudentsApi(
          newSession.sectionId ?? sessionForm.sectionId
        );
        const studentList = (rawList || []).map((s) => ({
          id: s.id,
          rollNumber: s.rollNumber,
          name: s.user?.name ?? s.name ?? "",
          photoUrl: s.photoUrl ?? null,
        }));
        setStudents(studentList);

        const initialStatus = {};
        studentList.forEach((s) => {
          initialStatus[s.id] = "PRESENT";
        });
        setAttendanceStatus(initialStatus);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create session.");
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSelect = async (id) => {
    const sessionToLoad = sessions.find((s) => String(s.id) === String(id));
    if (!sessionToLoad) return;

    setEditingExisting(true);
    setSessionId(sessionToLoad.id);
    setSuccess(`Opened session #${sessionToLoad.id} for editing.`);

    setSessionForm({
      sectionId: sessionToLoad.sectionId?.toString() || "",
      subjectId: sessionToLoad.subjectId?.toString() || "",
      termId: sessionToLoad.termId?.toString() || "",
      scheduledAt: sessionToLoad.scheduledAt
        ? new Date(sessionToLoad.scheduledAt).toISOString().slice(0, 16)
        : "",
      durationMin: sessionToLoad.durationMin?.toString() || "",
      room: sessionToLoad.room || "",
    });

    // ✅ Load existing attendance
    const attendance = sessionToLoad.attendance || [];
    const studentList = attendance.map((a) => ({
      id: a.student.id,
      rollNumber: a.student.rollNumber,
      name: a.student.user?.name ?? "",
      photoUrl: a.student.photoUrl ?? null,
    }));
    setStudents(studentList);

    const initialStatus = {};
    attendance.forEach((a) => {
      initialStatus[a.studentId] = a.status;
    });
    setAttendanceStatus(initialStatus);
  };

  /*const handleManualMark = (studentId) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "ABSENT" ? "PRESENT" : "ABSENT",
    }));
  };*/

  const handleManualSubmit = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const attendance = Object.entries(attendanceStatus).map(
      ([studentId, status]) => ({
        studentId: Number(studentId),
        status,
      })
    );

    try {
      const response = await markAttendanceApi({ sessionId, attendance });
      setSuccess(response.message || "Attendance saved.");
      await fetchSessions();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to mark attendance.");
    } finally {
      setLoading(false);
    }
  };

  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    if (!sessionId) {
      setError("Please create or select a session first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await uploadAttendanceCsvApi(csvFile, sessionId);
      setSuccess(response.message || "CSV uploaded.");
      await fetchSessions();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload attendance.");
    } finally {
      setLoading(false);
    }
  };

  const uniqueSections = [
    ...new Set(
      assignments.map((a) =>
        JSON.stringify({ id: a.section.id, name: a.section.name })
      )
    ),
  ].map((s) => JSON.parse(s));

  const uniqueTerms = [
    ...new Set(
      assignments.map((a) =>
        JSON.stringify({ id: a.term.id, name: a.term.name })
      )
    ),
  ].map((t) => JSON.parse(t));

  return (
    <div className={styles.container}>
      <h3 className={styles.viewTitle}>Manage Attendance</h3>

      {success && (
        <div className={`${styles.messageBox} ${styles.success}`}>{success}</div>
      )}
      {error && (
        <div className={`${styles.messageBox} ${styles.error}`}>{error}</div>
      )}

      {/* Step 1: Create a New Session */}
      <div className={styles.card}>
        <div className={styles.cardHeaderRow}>
          <h4>1. Create a New Session</h4>
          {editingExisting && (
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={resetForNewSession}
            >
              Start New Session
            </button>
          )}
        </div>

        <form onSubmit={handleSessionSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Section */}
            <div className={styles.formGroup}>
              <label>Section</label>
              <select
                value={sessionForm.sectionId}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, sectionId: e.target.value })
                }
                required
                disabled={editingExisting}
              >
                <option value="">Select Section</option>
                {uniqueSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Term */}
            <div className={styles.formGroup}>
              <label>Term</label>
              <select
                value={sessionForm.termId}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, termId: e.target.value })
                }
                required
                disabled={editingExisting}
              >
                <option value="">Select Term</option>
                {uniqueTerms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className={styles.formGroup}>
              <label>Subject</label>
              <select
                value={sessionForm.subjectId}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, subjectId: e.target.value })
                }
                required
                disabled={editingExisting}
              >
                <option value="">Select Subject</option>
                {assignments
                  .filter(
                    (a) =>
                      String(a.sectionId) === String(sessionForm.sectionId) &&
                      String(a.termId) === String(sessionForm.termId)
                  )
                  .map((a) => (
                    <option key={a.subject.id} value={a.subject.id}>
                      {a.subject.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Scheduled At */}
            <div className={styles.formGroup}>
              <label>Scheduled At</label>
              <input
                type="datetime-local"
                value={sessionForm.scheduledAt}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, scheduledAt: e.target.value })
                }
                required
                disabled={editingExisting}
              />
            </div>

            {/* Duration */}
            <div className={styles.formGroup}>
              <label>Duration (min)</label>
              <input
                type="number"
                value={sessionForm.durationMin}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, durationMin: e.target.value })
                }
                required
                disabled={editingExisting}
              />
            </div>

            {/* Room */}
            <div className={styles.formGroup}>
              <label>Room</label>
              <input
                type="text"
                value={sessionForm.room}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, room: e.target.value })
                }
                disabled={editingExisting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || editingExisting}
            className={styles.submitBtn}
          >
            {editingExisting
              ? "Editing existing session"
              : loading
              ? "Creating..."
              : "Create Session"}
          </button>
        </form>
      </div>

      {/* Step 2: Select Existing Session */}
      {sessions.length > 0 && (
        <div className={styles.card}>
          <h4>2. Open an Existing Session</h4>
          <select
            onChange={(e) => handleSessionSelect(e.target.value)}
            className={styles.formSelect}
            value={sessionId || ""}
          >
            <option value="">-- Select a session --</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.section.name} - {s.subject.name} ({s.term.name}) on{" "}
                {new Date(s.scheduledAt).toLocaleDateString()} at{" "}
                {new Date(s.scheduledAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Step 3: Attendance */}
      {sessionId && (
        <div className={styles.card}>
          <h4>3. Mark Attendance</h4>
          <div className={styles.toggleButtonGroup}>
            <button
              type="button"
              onClick={() => setViewMode("manual")}
              className={`${styles.toggleButton} ${
                viewMode === "manual" ? styles.active : ""
              }`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => setViewMode("csv")}
              className={`${styles.toggleButton} ${
                viewMode === "csv" ? styles.active : ""
              }`}
            >
              CSV Upload
            </button>
          </div>

          {viewMode === "manual" && (
  <div className={styles.manualAttendance}>
    <div className={styles.attendanceTableWrapper}>
      <table className={styles.attendanceTable}>
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Roll No</th>
            <th>Present</th>
            <th>Absent</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>
                <img
                  src={student.photoUrl || "/default-avatar.png"}
                  alt={student.name}
                  className={styles.studentPhotoSmall}
                />
              </td>
              <td >{student.name}</td>
              <td>{student.rollNumber}</td>
              <td>
                <input
                  type="radio"
                  name={`attendance-${student.id}`}
                  value="PRESENT"
                  checked={attendanceStatus[student.id] === "PRESENT"}
                  onChange={() =>
                    setAttendanceStatus((prev) => ({
                      ...prev,
                      [student.id]: "PRESENT",
                    }))
                  }
                  className={styles.attendanceRadio}
                />
              </td>
              <td>
                <input
                  type="radio"
                  name={`attendance-${student.id}`}
                  value="ABSENT"
                  checked={attendanceStatus[student.id] === "ABSENT"}
                  onChange={() =>
                    setAttendanceStatus((prev) => ({
                      ...prev,
                      [student.id]: "ABSENT",
                    }))
                  }
                  className={styles.attendanceRadio}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className={styles.submitWrapper}>
      <button
        onClick={handleManualSubmit}
        disabled={loading}
        className={styles.submitBtn}
      >
        {loading ? <div className={styles.loadingSpinner}></div> : "Save Attendance"}
      </button>
    </div>
  </div>
)}


          {viewMode === "csv" && (
            <form onSubmit={handleCsvSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Upload CSV File</label>
                <input
                  type="file"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  accept=".csv"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={styles.submitBtn}
              >
                {loading ? "Uploading..." : "Upload CSV"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceUploadView;
