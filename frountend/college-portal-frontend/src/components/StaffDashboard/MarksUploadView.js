import React, { useEffect, useState } from "react";
import {
  getMyAssessments,
  getAssessmentMarks,
  uploadMarksApi,
  uploadMarksCsvApi,
  createAssessment,
  getStaffAssignments,
} from "../../api/staffApi";
import styles from "../../styles/MarksUpload.module.css";

const MarksUpload = () => {
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [viewMode, setViewMode] = useState("manual");
  const [csvFile, setCsvFile] = useState(null);

  const [newAssessment, setNewAssessment] = useState({
    name: "",
    date: "",
    maxMarks: "",
    weightage: "",
    sectionId: "",
    subjectId: "",
    termId: "",
  });

  const [assignments, setAssignments] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchAssessments();
    fetchAssignments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await getMyAssessments();
      setAssessments(res);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to fetch assessments" });
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await getStaffAssignments();
      setAssignments(res);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to fetch staff assignments" });
    }
  };

  // =================== Assessment Creation ===================
  const handleNewAssessmentChange = (field, value) => {
    setNewAssessment({ ...newAssessment, [field]: value });
  };

  const handleCreateAssessment = async () => {
    const { name, date, maxMarks, sectionId, subjectId, termId, weightage } = newAssessment;
    if (!name || !date || !maxMarks || !sectionId || !subjectId || !termId) {
      setMessage({ type: "error", text: "Please fill all required fields." });
      return;
    }

    try {
      await createAssessment({
        name,
        date,
        maxMarks: Number(maxMarks),
        weightage: weightage ? Number(weightage) : null,
        sectionId: Number(sectionId),
        subjectId: Number(subjectId),
        termId: Number(termId),
      });
      setMessage({ type: "success", text: "Assessment created successfully!" });
      setNewAssessment({
        name: "",
        date: "",
        maxMarks: "",
        weightage: "",
        sectionId: "",
        subjectId: "",
        termId: "",
      });
      fetchAssessments();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to create assessment",
      });
    }
  };

  // =================== Marks Handling ===================
  const handleAssessmentSelect = async (id) => {
    if (!id) {
      setSelectedAssessment(null);
      setStudents([]);
      setMarks({});
      return;
    }

    try {
      const res = await getAssessmentMarks(id);
      setSelectedAssessment(res.assessment);
      setStudents(res.students);

      const initialMarks = {};
      res.students.forEach((s) => {
        initialMarks[s.studentId] = s.marksObtained !== null ? s.marksObtained : "";
      });
      setMarks(initialMarks);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to fetch marks for this assessment" });
    }
  };

  const handleMarksChange = (studentId, value) => {
    setMarks({ ...marks, [studentId]: value });
  };

  const handleManualSubmit = async () => {
    if (!selectedAssessment) return;

    const payload = {
      assessmentId: Number(selectedAssessment.id),
      marks: Object.keys(marks).map((studentId) => {
        let val = Number(marks[studentId]);
        if (isNaN(val) || val < 0) val = 0;
        if (val > selectedAssessment.maxMarks) val = selectedAssessment.maxMarks;
        return { studentId: Number(studentId), marksObtained: val };
      }),
    };

    try {
      await uploadMarksApi(payload);
      setMessage({ type: "success", text: "Marks uploaded successfully!" });
      handleAssessmentSelect(selectedAssessment.id);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Upload failed." });
    }
  };

  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile || !selectedAssessment) return;

    try {
      await uploadMarksCsvApi(csvFile, selectedAssessment.id);
      setMessage({ type: "success", text: "CSV uploaded successfully!" });
      handleAssessmentSelect(selectedAssessment.id);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "CSV upload failed." });
    }
  };

  // Remove duplicates
  const uniqueSections = Array.from(new Map(assignments.map(a => [a.section.id, a.section])).values());
  const uniqueSubjects = Array.from(new Map(assignments.map(a => [a.subject.id, a.subject])).values());
  const uniqueTerms = Array.from(new Map(assignments.map(a => [a.term.id, a.term])).values());

  return (
    <div className={styles.container}>
      <h2>Marks Upload & Assessment Creation</h2>

      {/* Display messages */}
      {message.text && (
        <div className={`${styles.message} ${message.type === "success" ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}

      {/* ========== Create Assessment Form ========== */}
      <div className={styles.card}>
        <h3>Create New Assessment</h3>
        <div className={styles.formGroup}>
          <input
            type="text"
            placeholder="Assessment Name"
            value={newAssessment.name}
            onChange={(e) => handleNewAssessmentChange("name", e.target.value)}
          />
          <input
            type="date"
            value={newAssessment.date}
            onChange={(e) => handleNewAssessmentChange("date", e.target.value)}
          />
          <input
            type="number"
            placeholder="Max Marks"
            value={newAssessment.maxMarks}
            onChange={(e) => handleNewAssessmentChange("maxMarks", e.target.value)}
          />
          <input
            type="number"
            placeholder="Weightage (optional)"
            value={newAssessment.weightage}
            onChange={(e) => handleNewAssessmentChange("weightage", e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <select
            value={newAssessment.sectionId}
            onChange={(e) => handleNewAssessmentChange("sectionId", e.target.value)}
          >
            <option value="">-- Select Section --</option>
            {uniqueSections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={newAssessment.subjectId}
            onChange={(e) => handleNewAssessmentChange("subjectId", e.target.value)}
          >
            <option value="">-- Select Subject --</option>
            {uniqueSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={newAssessment.termId}
            onChange={(e) => handleNewAssessmentChange("termId", e.target.value)}
          >
            <option value="">-- Select Term --</option>
            {uniqueTerms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button className={styles.submitBtn} onClick={handleCreateAssessment}>
          Create Assessment
        </button>
      </div>

      {/* ========== Select Assessment ========== */}
      <div className={styles.card}>
        <label>Select Assessment</label>
        <select
          onChange={(e) => handleAssessmentSelect(e.target.value)}
          className={styles.dropdown}
          value={selectedAssessment?.id || ""}
        >
          <option value="">-- Select --</option>
          {assessments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} - {a.subject?.name} ({a.section?.name})
            </option>
          ))}
        </select>
      </div>

      {/* ========== Manual / CSV Entry ========== */}
      {selectedAssessment && (
        <div className={styles.card}>
          <div className={styles.toggleBtns}>
            <button
              className={viewMode === "manual" ? styles.activeBtn : ""}
              onClick={() => setViewMode("manual")}
            >
              Manual Entry
            </button>
            <button
              className={viewMode === "csv" ? styles.activeBtn : ""}
              onClick={() => setViewMode("csv")}
            >
              Upload CSV
            </button>
          </div>

          {viewMode === "manual" && (
            <>
              <h4>
                {selectedAssessment.name} ({selectedAssessment.subject?.name}) - Max:{" "}
                {selectedAssessment.maxMarks}
              </h4>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Roll No</th>
                      <th>Name</th>
                      <th>Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.studentId}>
                        <td>
                          <img
                            src={s.photoUrl || "/default-avatar.png"}
                            alt="student"
                            className={styles.photo}
                          />
                        </td>
                        <td>{s.rollNumber}</td>
                        <td>{s.name}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max={selectedAssessment.maxMarks}
                            value={marks[s.studentId]}
                            onChange={(e) => handleMarksChange(s.studentId, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className={styles.submitBtn} onClick={handleManualSubmit}>
                Save Marks
              </button>
            </>
          )}

          {viewMode === "csv" && (
            <form onSubmit={handleCsvSubmit} className={styles.form}>
              <input
                type="file"
                onChange={(e) => setCsvFile(e.target.files[0])}
                accept=".csv"
                required
              />
              <button type="submit" className={styles.submitBtn}>
                Upload CSV
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default MarksUpload;
