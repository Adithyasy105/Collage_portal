import React, { useEffect, useState, useMemo } from "react";
import { getTermsApi, generateResultsApi } from "../../api/adminAPI";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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

  // Calculate statistics for visualization
  const resultsStats = useMemo(() => {
    if (!results.length) return null;

    const gradeCount = results.reduce((acc, r) => {
      acc[r.grade] = (acc[r.grade] || 0) + 1;
      return acc;
    }, {});

    const gradeData = Object.entries(gradeCount).map(([grade, count]) => ({
      name: grade,
      value: count,
      color: 
        grade === "A" ? "#4caf50" :
        grade === "B" ? "#2196f3" :
        grade === "C" ? "#ff9800" :
        "#f44336",
    }));

    const avgPercentage = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;
    const passCount = results.filter(r => r.grade !== "F").length;
    const failCount = results.filter(r => r.grade === "F").length;

    // Percentage distribution for bar chart
    const percentageRanges = [
      { range: "90-100%", count: results.filter(r => r.percentage >= 90 && r.percentage <= 100).length },
      { range: "80-89%", count: results.filter(r => r.percentage >= 80 && r.percentage < 90).length },
      { range: "70-79%", count: results.filter(r => r.percentage >= 70 && r.percentage < 80).length },
      { range: "60-69%", count: results.filter(r => r.percentage >= 60 && r.percentage < 70).length },
      { range: "50-59%", count: results.filter(r => r.percentage >= 50 && r.percentage < 60).length },
      { range: "Below 50%", count: results.filter(r => r.percentage < 50).length },
    ];

    return {
      gradeData,
      avgPercentage,
      passCount,
      failCount,
      totalStudents: results.length,
      percentageRanges,
    };
  }, [results]);

  return (
    <div className={styles.tabSection}>
      <h2 className={styles.sectionTitle}>Generate Final Results</h2>

      {/* Term Selection Form */}
      <div className={styles.termsForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Select Academic Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className={styles.formSelect}
            >
              <option value="">Select Term</option>
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({new Date(t.startDate).toLocaleDateString()} -{" "}
                  {new Date(t.endDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.formActions}>
          <button
            onClick={onGenerate}
            className={styles.btnPrimary}
            disabled={loading || !selectedTerm}
          >
            {loading ? "Generating Results..." : "Generate Results"}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {resultsStats && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{resultsStats.totalStudents}</div>
              <div className={styles.statLabel}>Total Students</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{resultsStats.avgPercentage.toFixed(1)}%</div>
              <div className={styles.statLabel}>Average Percentage</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{resultsStats.passCount}</div>
              <div className={styles.statLabel}>Passed</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{resultsStats.failCount}</div>
              <div className={styles.statLabel}>Failed</div>
            </div>
          </div>

          {/* Visualizations */}
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Grade Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={resultsStats.gradeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {resultsStats.gradeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Grade Count</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resultsStats.gradeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0d47a1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Percentage Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resultsStats.percentageRanges}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4db6ac" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <div className={styles.tableContainer}>
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
                <tr key={r.id}>
                  <td>{idx + 1}</td>
                  <td>{r.studentId}</td>
                  <td>{r.programId}</td>
                  <td>{r.totalMarks}</td>
                  <td>{r.maxMarks}</td>
                  <td>{r.percentage.toFixed(2)}%</td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      r.grade === "A" ? styles.statusActive :
                      r.grade === "B" ? styles.statusActive :
                      r.grade === "C" ? styles.statusInactive :
                      styles.statusBadge
                    }`} style={{
                      backgroundColor: 
                        r.grade === "A" ? "#4caf50" :
                        r.grade === "B" ? "#2196f3" :
                        r.grade === "C" ? "#ff9800" :
                        "#f44336",
                      color: "#fff"
                    }}>
                      {r.grade}
                    </span>
                  </td>
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
