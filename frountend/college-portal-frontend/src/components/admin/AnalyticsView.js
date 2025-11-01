import React, { useState, useEffect, useMemo } from "react";
import { getTeacherAverageRatingsApi } from "api/adminAPI.js";
import { toast } from "react-toastify";
import { Star, User, ArrowUpDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "../../styles/AdminDashboard.module.css";

// --- Sub-Component: StarRating ---
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;

  return (
    <div className={styles.starContainer}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={i} className={styles.starFull} fill="currentColor" />
      ))}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={i} className={styles.starEmpty} />
      ))}
    </div>
  );
};

// --- Main Component: AnalyticsView ---
export default function AnalyticsView() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: "averageRating", direction: "desc" });

  useEffect(() => {
    async function fetchRatings() {
      try {
        setLoading(true);
        const data = await getTeacherAverageRatingsApi();
        setRatings(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to fetch teacher ratings.");
      } finally {
        setLoading(false);
      }
    }
    fetchRatings();
  }, []);

  const sortedRatings = useMemo(() => {
    const sortableItems = [...ratings];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? 0;
        const bValue = b[sortConfig.key] ?? 0;

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [ratings, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  // Calculate statistics for visualization
  const analyticsStats = useMemo(() => {
    if (!ratings.length) return null;

    const totalTeachers = ratings.length;
    const avgRating = ratings.reduce((sum, r) => sum + (r.averageRating || 0), 0) / totalTeachers;
    const totalFeedback = ratings.reduce((sum, r) => sum + (r.feedbackCount || 0), 0);

    // Rating distribution
    const ratingDistribution = [
      { range: "4.5-5.0", count: ratings.filter(r => r.averageRating >= 4.5 && r.averageRating <= 5.0).length },
      { range: "4.0-4.4", count: ratings.filter(r => r.averageRating >= 4.0 && r.averageRating < 4.5).length },
      { range: "3.5-3.9", count: ratings.filter(r => r.averageRating >= 3.5 && r.averageRating < 4.0).length },
      { range: "3.0-3.4", count: ratings.filter(r => r.averageRating >= 3.0 && r.averageRating < 3.5).length },
      { range: "Below 3.0", count: ratings.filter(r => r.averageRating < 3.0).length },
    ];

    // Department distribution
    const deptGroups = ratings.reduce((acc, r) => {
      const dept = r.department || "Unknown";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const deptData = Object.entries(deptGroups).map(([name, count]) => ({
      name,
      count,
    }));

    // Top rated teachers for pie chart
    const topRated = ratings
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 5)
      .map(r => ({
        name: r.teacherName?.substring(0, 15) || "Unknown",
        value: r.averageRating || 0,
      }));

    return {
      totalTeachers,
      avgRating,
      totalFeedback,
      ratingDistribution,
      deptData,
      topRated,
    };
  }, [ratings]);

  if (loading) {
    return <div className={styles.loading}>Loading analytics...</div>;
  }

  return (
    <div className={styles.tabSection}>
      <h2 className={styles.sectionTitle}>Teacher Analytics</h2>

      {/* Statistics Cards */}
      {analyticsStats && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{analyticsStats.totalTeachers}</div>
              <div className={styles.statLabel}>Total Teachers</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{analyticsStats.avgRating.toFixed(2)}</div>
              <div className={styles.statLabel}>Average Rating</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{analyticsStats.totalFeedback}</div>
              <div className={styles.statLabel}>Total Feedback</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {ratings.filter(r => (r.averageRating || 0) >= 4.0).length}
              </div>
              <div className={styles.statLabel}>Highly Rated (4+)</div>
            </div>
          </div>

          {/* Visualizations */}
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Rating Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsStats.ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0d47a1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Teachers by Department</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsStats.deptData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4db6ac" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {analyticsStats.topRated.length > 0 && (
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Top 5 Rated Teachers</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsStats.topRated}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ff9800" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}

      {/* Teacher Ratings Table */}
      <div className={styles.tableContainer}>
        <h3 className={styles.sectionTitle} style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
          Teacher Average Ratings
        </h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.tableHeader}>Teacher</th>
              <th className={styles.tableHeader}>Department</th>
              <th
                className={styles.tableHeaderSortable}
                onClick={() => requestSort("averageRating")}
              >
                <div className={styles.headerContent}>
                  <span>Average Rating</span>
                  <ArrowUpDown className={styles.iconArrow} />
                </div>
              </th>
              <th
                className={styles.tableHeaderSortable}
                onClick={() => requestSort("feedbackCount")}
              >
                <div className={styles.headerContent}>
                  <span>Feedback Count</span>
                  <ArrowUpDown className={styles.iconArrow} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRatings.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.noData} style={{ textAlign: "center", padding: "2rem" }}>
                  No data found.
                </td>
              </tr>
            ) : (
              sortedRatings.map((r) => (
                <tr key={r.staffId} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className={styles.teacherInfo}>
                      <div className={styles.avatarContainer}>
                        {r.photoUrl ? (
                          <img src={r.photoUrl} alt={r.teacherName} className={styles.avatarImg} />
                        ) : (
                          <User className={styles.iconUser} />
                        )}
                      </div>
                      <span className={styles.teacherName}>{r.teacherName}</span>
                    </div>
                  </td>
                  <td className={`${styles.tableCell} ${styles.dept}`}>{r.department || "N/A"}</td>
                  <td className={`${styles.tableCell} ${styles.ratingCell}`}>
                    <div className={styles.ratingDisplay}>
                      <StarRating rating={r.averageRating || 0} />
                      <span className={styles.ratingValue}>
                        {r.averageRating?.toFixed(2) ?? "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className={`${styles.tableCell} ${styles.count}`}>
                    {r.feedbackCount ?? 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
