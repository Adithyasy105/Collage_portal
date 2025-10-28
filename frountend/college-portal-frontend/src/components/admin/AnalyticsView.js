import React, { useState, useEffect, useMemo } from "react";
import { getTeacherAverageRatingsApi } from "../../api/adminAPI";
import { toast } from "react-toastify";
import { Star, User, ArrowUpDown } from "lucide-react";
// ------------------------------------------------------------------
// CORRECTED: Importing styles using the module format.
import styles from "../../styles/AdminDashboard.module.css"; 
// ------------------------------------------------------------------

// --- Sub-Component: StarRating ---
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;

  const fullStarElements = [...Array(fullStars)].map((_, i) =>
    React.createElement(Star, {
      key: i,
      className: styles.starFull, // Using styles.starFull
      fill: "currentColor",
    })
  );

  const emptyStarElements = [...Array(emptyStars)].map((_, i) =>
    React.createElement(Star, {
      key: i,
      className: styles.starEmpty, // Using styles.starEmpty
    })
  );

  return React.createElement("div", { className: styles.starContainer }, [...fullStarElements, ...emptyStarElements]);
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

  if (loading) {
    return React.createElement("div", { className: styles.loading }, "Loading analytics..."); // Using styles.loading
  }

  // Helper for sortable table headers
  const renderSortableHeader = (key, label) =>
    React.createElement("th", {
      onClick: () => requestSort(key),
      className: styles.tableHeaderSortable, // Using styles.tableHeaderSortable
    },
      React.createElement("div", { className: styles.headerContent }, // Using styles.headerContent
        React.createElement("span", null, label),
        React.createElement(ArrowUpDown, { className: styles.iconArrow }) // Using styles.iconArrow
      )
    );

  // Helper for table rows
  const renderTableRow = (r) =>
    React.createElement("tr", { key: r.staffId, className: styles.tableRow }, // Using styles.tableRow
      // Teacher Column
      React.createElement("td", { className: styles.tableCell }, // Using styles.tableCell
        React.createElement("div", { className: styles.teacherInfo }, // Using styles.teacherInfo
          React.createElement("div", { className: styles.avatarContainer }, // Using styles.avatarContainer
            r.photoUrl ?
              React.createElement("img", {
                src: r.photoUrl,
                alt: r.teacherName,
                className: styles.avatarImg, // Using styles.avatarImg
              }) :
              React.createElement(User, { className: styles.iconUser }) // Using styles.iconUser
          ),
          React.createElement("span", { className: styles.teacherName }, r.teacherName) // Using styles.teacherName
        )
      ),
      // Department Column
      React.createElement("td", { className: `${styles.tableCell} ${styles.dept}` }, r.department || "N/A"), // Using styles.dept
      // Average Rating Column
      React.createElement("td", { className: `${styles.tableCell} ${styles.ratingCell}` }, // Using styles.ratingCell
        React.createElement("div", { className: styles.ratingDisplay }, // Using styles.ratingDisplay
          React.createElement(StarRating, { rating: r.averageRating || 0 }),
          React.createElement("span", { className: styles.ratingValue }, r.averageRating?.toFixed(2) ?? "N/A") // Using styles.ratingValue
        )
      ),
      // Feedback Count Column
      React.createElement("td", { className: `${styles.tableCell} ${styles.count}` }, r.feedbackCount ?? 0) // Using styles.count
    );

  // Main render structure
  return React.createElement("div", { className: styles.container }, // Using styles.container
    React.createElement("h3", { className: styles.title }, "Teacher Average Ratings"), // Using styles.title

    React.createElement("div", { className: styles.tableWrapper }, // Using styles.tableWrapper
      React.createElement("table", { className: styles.table }, // Using styles.table
        // Table Header
        React.createElement("thead", { className: styles.tableHead }, // Using styles.tableHead
          React.createElement("tr", null,
            React.createElement("th", { className: styles.tableHeader }, "Teacher"), // Using styles.tableHeader
            React.createElement("th", { className: styles.tableHeader }, "Department"), // Using styles.tableHeader
            renderSortableHeader("averageRating", "Average Rating"),
            renderSortableHeader("feedbackCount", "Feedback Count")
          )
        ),
        // Table Body
        React.createElement("tbody", { className: styles.tableBody }, // Using styles.tableBody
          sortedRatings.map(renderTableRow),
          sortedRatings.length === 0 &&
            React.createElement("tr", null,
              React.createElement("td", { colSpan: 4, className: styles.noData }, "No data found.") // Using styles.noData
            )
        )
      )
    )
  );
}