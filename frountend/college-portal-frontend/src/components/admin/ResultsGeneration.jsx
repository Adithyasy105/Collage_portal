import React, { useEffect, useState } from "react";
import { getTermsApi, generateResultsApi } from "../../api/adminAPI";
import { toast } from "react-toastify";
import styles from "../../styles/AdminDashboard.module.css";

const ResultsTab = () => {
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // Fetch Academic Terms
  const fetchTerms = async () => {
    try {
      const data = await getTermsApi();
      setTerms(data);
    } catch {
      toast.error("Failed to fetch terms");
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  // Generate Results
  const onGenerate = async () => {
    if (!selectedTerm) {
      toast.error("Please select a term");
      return;
    }

    setLoading(true);
    try {
      const response = await generateResultsApi(Number(selectedTerm));
      toast.success(response.message || "Results generated successfully!");
      if (response.results) setResults(response.results);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to generate results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Generate Final Results</h2>

      {/* Term Selection */}
      <div className="flex gap-2 items-center">
        <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className={styles.select}
        >
          <option value="">Select Term</option>
          {terms.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({new Date(t.startDate).toLocaleDateString()} -{" "}
              {new Date(t.endDate).toLocaleDateString()})
            </option>
          ))}
        </select>
        <button
          onClick={onGenerate}
          className={styles.btnPrimary}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Results"}
        </button>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Student ID</th>
                <th>Program ID</th>
                <th>Total Marks</th>
                <th>Max Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Published At</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td>{idx + 1}</td>
                  <td>{r.studentId}</td>
                  <td>{r.programId}</td>
                  <td>{r.totalMarks}</td>
                  <td>{r.maxMarks}</td>
                  <td>{r.percentage.toFixed(2)}%</td>
                  <td>{r.grade}</td>
                  <td>{new Date(r.publishedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResultsTab;
