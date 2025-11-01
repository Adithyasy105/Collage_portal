import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  uploadUsersCsvApi,
  getDepartmentsApi,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
  getProgramsApi,
  createProgramApi,
  updateProgramApi,
  deleteProgramApi,
  getSectionsApi,
  createSectionApi,
  updateSectionApi,
  deleteSectionApi,
  getTermsApi,
  createTermApi,
  updateTermApi,
  deleteTermApi,
  getSubjectsApi,
  createSubjectApi,
  updateSubjectApi,
  deleteSubjectApi,
  getHolidaysApi,
  createHolidayApi,
  updateHolidayApi,
  deleteHolidayApi,
  uploadHolidaysCsvApi,
  getAllStaff,
  getStaffAssignmentsApi,
  createStaffAssignmentApi,
  updateStaffAssignmentApi,
  deleteStaffAssignmentApi,
  fixStaffAssignmentSequenceApi,
} from "api/adminAPI.js";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AnalyticsView from "../components/admin/AnalyticsView";
import ResultsGeneration from "../components/admin/ResultsGeneration";
import { BarChart2 } from "lucide-react";
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
import styles from "../styles/AdminDashboard.module.css";

// ---------------- Components ----------------
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchUsers = async () => {
    try {
      const data = await getUsersApi();
      setUsers(data);
    } catch (e) {
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingUser) {
        await updateUserApi(editingUser.id, data);
        toast.success("User updated");
      } else {
        await createUserApi(data);
        toast.success("User created");
      }
      reset();
      setEditingUser(null);
      fetchUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save user");
    }
  };

  const onEdit = (user) => {
    setEditingUser(user);
    reset({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this user?")) return;
    try {
      await deleteUserApi(id);
      toast.success("User deleted");
      fetchUsers();
    } catch (e) {
      toast.error("Failed to delete user");
    }
  };

  const onUploadCsv = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadUsersCsvApi(file);
      toast.success("Users imported successfully");
      fetchUsers();
    } catch (e) {
      toast.error("Failed to import users");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  // Calculate user statistics for visualization
  const userStats = useMemo(() => {
    const roleCount = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: "Student", value: roleCount.STUDENT || 0, color: "#4db6ac" },
      { name: "Staff", value: roleCount.STAFF || 0, color: "#0d47a1" },
      { name: "Admin", value: roleCount.ADMIN || 0, color: "#f44336" },
    ];
  }, [users]);

  const totalUsers = users.length;

  return (
    <div className={styles.tabSection}>
      <h2 className={styles.sectionTitle}>Users</h2>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalUsers}</div>
          <div className={styles.statLabel}>Total Users</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{userStats.find(u => u.name === "Student")?.value || 0}</div>
          <div className={styles.statLabel}>Students</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{userStats.find(u => u.name === "Staff")?.value || 0}</div>
          <div className={styles.statLabel}>Staff</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{userStats.find(u => u.name === "Admin")?.value || 0}</div>
          <div className={styles.statLabel}>Admins</div>
        </div>
      </div>

      {/* Visualizations */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Users by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Role Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0d47a1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.termsForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Name</label>
        <input
              placeholder="Enter user name"
              className={styles.formInput}
          {...register("name", { required: "Name is required" })}
        />
            {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
        <input
              placeholder="Enter email address"
          type="email"
              className={styles.formInput}
          {...register("email", { required: "Email is required" })}
        />
            {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
        {!editingUser && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Password</label>
            <input
                placeholder="Enter password"
              type="password"
                className={styles.formInput}
              {...register("password", { required: "Password is required" })}
            />
              {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
            </div>
        )}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Role</label>
            <select className={styles.formSelect} {...register("role")}>
          <option value="STUDENT">Student</option>
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </select>
          </div>
        </div>

        <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary}>
          {editingUser ? "Update User" : "Create User"}
        </button>
        {editingUser && (
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => {
              reset();
              setEditingUser(null);
            }}
          >
            Cancel
          </button>
        )}
        </div>
      </form>

      <div className={styles.uploadContainer}>
        <label className={styles.uploadLabel}>
          {uploading ? "Uploading..." : "Upload Users CSV"}
          <input type="file" accept=".csv" onChange={onUploadCsv} disabled={uploading} />
        </label>
      </div>

      <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th style={{ minWidth: 120 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                No users found
              </td>
            </tr>
          )}
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button className={styles.btnSmall} onClick={() => onEdit(u)}>
                  Edit
                </button>
                <button
                  className={styles.btnSmallDanger}
                  onClick={() => onDelete(u.id)}
                >
                  Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

const HolidaysTab = () => {
  const [holidays, setHolidays] = useState([]);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchHolidays = async () => {
    try {
      const data = await getHolidaysApi();
      setHolidays(data);
    } catch (e) {
      toast.error("Failed to fetch holidays");
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingHoliday) {
        await updateHolidayApi(editingHoliday.id, data);
        toast.success("Holiday updated");
      } else {
      await createHolidayApi(data);
      toast.success("Holiday created");
      }
      reset();
      setEditingHoliday(null);
      fetchHolidays();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save holiday");
    }
  };

  const onEdit = (holiday) => {
    setEditingHoliday(holiday);
    const dateStr = new Date(holiday.date).toISOString().split('T')[0];
    reset({
      name: holiday.name,
      date: dateStr,
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this holiday?")) return;
    try {
      await deleteHolidayApi(id);
      toast.success("Holiday deleted");
      fetchHolidays();
    } catch (e) {
      toast.error("Failed to delete holiday");
    }
  };

  const onUploadCsv = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadHolidaysCsvApi(file);
      toast.success("Holidays imported successfully");
      fetchHolidays();
    } catch (e) {
      toast.error("Failed to import holidays");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  // Calculate holiday statistics
  const holidayStats = useMemo(() => {
    const monthCount = holidays.reduce((acc, holiday) => {
      const date = new Date(holiday.date);
      const month = date.toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(monthCount).map(([month, count]) => ({
      month,
      count,
    }));
  }, [holidays]);

  const totalHolidays = holidays.length;
  const upcomingHolidays = holidays.filter(h => new Date(h.date) >= new Date()).length;

  return (
    <div className={styles.tabSection}>
      <h2 className={styles.sectionTitle}>Holidays</h2>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalHolidays}</div>
          <div className={styles.statLabel}>Total Holidays</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{upcomingHolidays}</div>
          <div className={styles.statLabel}>Upcoming Holidays</div>
        </div>
      </div>

      {/* Visualizations */}
      {holidayStats.length > 0 && (
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Holidays by Month</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={holidayStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4db6ac" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.termsForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Holiday Name</label>
        <input
              placeholder="Enter holiday name"
              className={styles.formInput}
          {...register("name", { required: "Name is required" })}
        />
            {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Date</label>
        <input
          type="date"
              className={styles.formInput}
          {...register("date", { required: "Date is required" })}
        />
            {errors.date && <span className={styles.fieldError}>{errors.date.message}</span>}
          </div>
        </div>

        <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary}>
            {editingHoliday ? "Update Holiday" : "Add Holiday"}
        </button>
          {editingHoliday && (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                reset();
                setEditingHoliday(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className={styles.uploadContainer}>
        <label className={styles.uploadLabel}>
          {uploading ? "Uploading..." : "Upload Holidays CSV"}
          <input type="file" accept=".csv" onChange={onUploadCsv} disabled={uploading} />
        </label>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "2rem" }}>
                  No holidays found
                </td>
              </tr>
            ) : (
              holidays.map((h) => (
                <tr key={h.id}>
                  <td>{h.id}</td>
                  <td>{h.name}</td>
                  <td>{new Date(h.date).toLocaleDateString()}</td>
                  <td>
                    <button className={styles.btnSmall} onClick={() => onEdit(h)}>
                      Edit
                    </button>
            <button
              className={styles.btnSmallDanger}
              onClick={() => onDelete(h.id)}
            >
              Delete
            </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DepartmentsTab = () => {
  const [departments, setDepartments] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchDepartments = async () => {
    try {
      const data = await getDepartmentsApi();
      setDepartments(data);
    } catch (e) {
      toast.error("Failed to fetch departments");
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingDepartment) {
        await updateDepartmentApi(editingDepartment.id, data);
        toast.success("Department updated");
      } else {
      await createDepartmentApi(data);
      toast.success("Department created");
      }
      reset();
      setEditingDepartment(null);
      fetchDepartments();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save department");
    }
  };

  const onEdit = (dept) => {
    setEditingDepartment(dept);
    reset({
      code: dept.code,
      name: dept.name,
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this department?")) return;
    try {
      await deleteDepartmentApi(id);
      toast.success("Department deleted");
      fetchDepartments();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete department");
    }
  };

  // Calculate department statistics
  const deptStats = useMemo(() => {
    return departments.map(dept => ({
      name: dept.name,
      programs: dept.programs?.length || 0,
      staff: dept.staff?.length || 0,
    }));
  }, [departments]);

  const totalDepartments = departments.length;
  const totalPrograms = departments.reduce((sum, dept) => sum + (dept.programs?.length || 0), 0);

  return (
    <div className={styles.tabSection}>
      <h2 className={styles.sectionTitle}>Departments</h2>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalDepartments}</div>
          <div className={styles.statLabel}>Total Departments</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalPrograms}</div>
          <div className={styles.statLabel}>Total Programs</div>
        </div>
      </div>

      {/* Visualizations */}
      {deptStats.length > 0 && (
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Programs per Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="programs" fill="#0d47a1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.termsForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Department Code</label>
        <input
              placeholder="Enter department code"
              className={styles.formInput}
          {...register("code", { required: "Code is required" })}
        />
            {errors.code && <span className={styles.fieldError}>{errors.code.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Department Name</label>
        <input
              placeholder="Enter department name"
              className={styles.formInput}
          {...register("name", { required: "Name is required" })}
        />
            {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
          </div>
        </div>

        <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary}>
            {editingDepartment ? "Update Department" : "Add Department"}
        </button>
          {editingDepartment && (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                reset();
                setEditingDepartment(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>Name</th>
              <th>Programs</th>
              <th>Staff</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                  No departments found
                </td>
              </tr>
            ) : (
              departments.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.code}</td>
                  <td>{d.name}</td>
                  <td>{d.programs?.length || 0}</td>
                  <td>{d.staff?.length || 0}</td>
                  <td>
                    <button className={styles.btnSmall} onClick={() => onEdit(d)}>
                      Edit
                    </button>
                    <button
                      className={styles.btnSmallDanger}
                      onClick={() => onDelete(d.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProgramsTab = () => {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingProgram, setEditingProgram] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchPrograms = async () => {
    try {
      const data = await getProgramsApi();
      setPrograms(data);
    } catch (e) {
      toast.error("Failed to fetch programs");
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getDepartmentsApi();
      setDepartments(data);
    } catch (e) {
      toast.error("Failed to fetch departments");
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
  }, []);

  const onSubmit = async (data) => {
    try {
      data.departmentId = Number(data.departmentId);
      data.durationSemesters = Number(data.durationSemesters);
      if (editingProgram) {
        await updateProgramApi(editingProgram.id, data);
        toast.success("Program updated");
      } else {
      await createProgramApi(data);
      toast.success("Program created");
      }
      reset();
      setEditingProgram(null);
      fetchPrograms();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save program");
    }
  };

  const onEdit = (program) => {
    setEditingProgram(program);
    reset({
      code: program.code,
      name: program.name,
      durationSemesters: program.durationSemesters,
      departmentId: program.departmentId,
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this program?")) return;
    try {
      await deleteProgramApi(id);
      toast.success("Program deleted");
      fetchPrograms();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete program");
    }
  };

  // Calculate program statistics
  const programStats = useMemo(() => {
    const deptGroups = programs.reduce((acc, prog) => {
      const deptName = prog.department?.name || "Unknown";
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(deptGroups).map(([name, count]) => ({
      name,
      count,
    }));
  }, [programs]);

  const totalPrograms = programs.length;
  const avgDuration = programs.length > 0
    ? Math.round(programs.reduce((sum, p) => sum + (p.durationSemesters || 0), 0) / programs.length)
    : 0;

  return (
    <div className={styles.tabSection}>
      <h2 className={styles.sectionTitle}>Programs</h2>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalPrograms}</div>
          <div className={styles.statLabel}>Total Programs</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{avgDuration}</div>
          <div className={styles.statLabel}>Avg Duration (Semesters)</div>
        </div>
      </div>

      {/* Visualizations */}
      {programStats.length > 0 && (
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Programs by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={programStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4db6ac" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.termsForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Program Code</label>
        <input
              placeholder="Enter program code"
              className={styles.formInput}
          {...register("code", { required: "Code is required" })}
        />
            {errors.code && <span className={styles.fieldError}>{errors.code.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Program Name</label>
        <input
              placeholder="Enter program name"
              className={styles.formInput}
          {...register("name", { required: "Name is required" })}
        />
            {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Duration (in semesters)</label>
        <input
              placeholder="Enter duration"
          type="number"
              className={styles.formInput}
          {...register("durationSemesters", { required: "Duration is required" })}
        />
            {errors.durationSemesters && <span className={styles.fieldError}>{errors.durationSemesters.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Department</label>
            <select className={styles.formSelect} {...register("departmentId", { required: "Department is required" })}>
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
            {errors.departmentId && <span className={styles.fieldError}>{errors.departmentId.message}</span>}
          </div>
        </div>

        <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary}>
            {editingProgram ? "Update Program" : "Add Program"}
        </button>
          {editingProgram && (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                reset();
                setEditingProgram(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>Name</th>
              <th>Department</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                  No programs found
                </td>
              </tr>
            ) : (
              programs.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.code}</td>
                  <td>{p.name}</td>
                  <td>{p.department?.name || "N/A"}</td>
                  <td>{p.durationSemesters} semesters</td>
                  <td>
                    <button className={styles.btnSmall} onClick={() => onEdit(p)}>
                      Edit
                    </button>
                    <button
                      className={styles.btnSmallDanger}
                      onClick={() => onDelete(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SectionsTab = () => {
  const [sections, setSections] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [editingSection, setEditingSection] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchSections = async () => {
    try {
      const data = await getSectionsApi();
      setSections(data);
    } catch (e) {
      toast.error("Failed to fetch sections");
    }
  };

  const fetchPrograms = async () => {
    try {
      const data = await getProgramsApi();
      setPrograms(data);
    } catch (e) {
      toast.error("Failed to fetch programs");
    }
  };

  useEffect(() => {
    fetchSections();
    fetchPrograms();
  }, []);

  const onSubmit = async (data) => {
    try {
      data.programId = Number(data.programId);
      data.semester = Number(data.semester);
      if (editingSection) {
        await updateSectionApi(editingSection.id, data);
        toast.success("Section updated");
      } else {
      await createSectionApi(data);
      toast.success("Section created");
      }
      reset();
      setEditingSection(null);
      fetchSections();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save section");
    }
  };

  const onEdit = (section) => {
    setEditingSection(section);
    reset({
      name: section.name,
      academicYear: section.academicYear,
      semester: section.semester,
      shift: section.shift || "",
      programId: section.programId,
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this section?")) return;
    try {
      await deleteSectionApi(id);
      toast.success("Section deleted");
      fetchSections();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete section");
    }
  };

  // Calculate section statistics
  const sectionStats = useMemo(() => {
    const programGroups = sections.reduce((acc, sec) => {
      const progName = sec.program?.name || "Unknown";
      acc[progName] = (acc[progName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(programGroups).map(([name, count]) => ({
      name,
      count,
    }));
  }, [sections]);

  const totalSections = sections.length;
  const yearGroups = useMemo(() => {
    const groups = sections.reduce((acc, sec) => {
      const year = sec.academicYear || "Unknown";
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(groups).map(([year, count]) => ({ year, count }));
  }, [sections]);

  return (
    <div className={styles.tabSection}>
      <h2 className={styles.sectionTitle}>Sections</h2>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalSections}</div>
          <div className={styles.statLabel}>Total Sections</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{yearGroups.length}</div>
          <div className={styles.statLabel}>Academic Years</div>
        </div>
      </div>

      {/* Visualizations */}
      <div className={styles.chartsGrid}>
        {sectionStats.length > 0 && (
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Sections by Program</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectionStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0d47a1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {yearGroups.length > 0 && (
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Sections by Academic Year</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearGroups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4db6ac" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.termsForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Section Name</label>
        <input
              placeholder="Enter section name"
              className={styles.formInput}
          {...register("name", { required: "Name is required" })}
        />
            {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Academic Year</label>
        <input
              placeholder="e.g., 2024"
              className={styles.formInput}
          {...register("academicYear", { required: "Academic Year is required" })}
        />
            {errors.academicYear && <span className={styles.fieldError}>{errors.academicYear.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Semester</label>
        <input
              placeholder="Enter semester"
          type="number"
              className={styles.formInput}
          {...register("semester", { required: "Semester is required" })}
        />
            {errors.semester && <span className={styles.fieldError}>{errors.semester.message}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Shift (Optional)</label>
            <select className={styles.formSelect} {...register("shift")}>
          <option value="">Select Shift</option>
          <option value="MORNING">Morning</option>
          <option value="EVENING">Evening</option>
        </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Program</label>
            <select className={styles.formSelect} {...register("programId", { required: "Program is required" })}>
          <option value="">Select Program</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
            {errors.programId && <span className={styles.fieldError}>{errors.programId.message}</span>}
          </div>
        </div>

        <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary}>
            {editingSection ? "Update Section" : "Add Section"}
        </button>
          {editingSection && (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                reset();
                setEditingSection(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Academic Year</th>
              <th>Semester</th>
              <th>Shift</th>
              <th>Program</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                  No sections found
                </td>
              </tr>
            ) : (
              sections.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.academicYear}</td>
                  <td>{s.semester}</td>
                  <td>{s.shift || "N/A"}</td>
                  <td>{s.program?.name || "N/A"}</td>
                  <td>
                    <button className={styles.btnSmall} onClick={() => onEdit(s)}>
                      Edit
                    </button>
                    <button
                      className={styles.btnSmallDanger}
                      onClick={() => onDelete(s.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TermsTab = () => {
  const [terms, setTerms] = useState([]);
  const [editingTerm, setEditingTerm] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchTerms = async () => {
    try {
      const data = await getTermsApi();
      setTerms(data);
    } catch (e) {
      toast.error("Failed to fetch terms");
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingTerm) {
        await updateTermApi(editingTerm.id, data);
        toast.success("Term updated");
      } else {
      await createTermApi(data);
      toast.success("Term created");
      }
      reset();
      setEditingTerm(null);
      fetchTerms();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save term");
    }
  };

  const onEdit = (term) => {
    setEditingTerm(term);
    const startDateStr = new Date(term.startDate).toISOString().split('T')[0];
    const endDateStr = new Date(term.endDate).toISOString().split('T')[0];
    reset({
      name: term.name,
      startDate: startDateStr,
      endDate: endDateStr,
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this term?")) return;
    try {
      await deleteTermApi(id);
      toast.success("Term deleted");
      fetchTerms();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete term");
    }
  };

  // Calculate term statistics
  const termStats = useMemo(() => {
    const now = new Date();
    return terms.map(term => {
      const start = new Date(term.startDate);
      const end = new Date(term.endDate);
      const isActive = now >= start && now <= end;
      const isUpcoming = now < start;
      
      return {
        name: term.name,
        duration: Math.ceil((end - start) / (1000 * 60 * 60 * 24)),
        status: isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Past',
      };
    });
  }, [terms]);

  const totalTerms = terms.length;
  const activeTerms = termStats.filter(t => t.status === 'Active').length;

  return (
    <div className={styles.tabSection}>
      <h2 className={styles.sectionTitle}>Academic Terms</h2>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalTerms}</div>
          <div className={styles.statLabel}>Total Terms</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{activeTerms}</div>
          <div className={styles.statLabel}>Active Terms</div>
        </div>
      </div>

      {/* Visualizations */}
      {termStats.length > 0 && (
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Term Duration (Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={termStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="duration" fill="#0d47a1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.termsForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Term Name</label>
        <input
              placeholder="Enter term name"
              className={styles.formInput}
          {...register("name", { required: "Name is required" })}
        />
            {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Start Date</label>
        <input
          type="date"
              className={styles.formInput}
          {...register("startDate", { required: "Start date is required" })}
        />
            {errors.startDate && <span className={styles.fieldError}>{errors.startDate.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>End Date</label>
        <input
          type="date"
              className={styles.formInput}
          {...register("endDate", { required: "End date is required" })}
        />
            {errors.endDate && <span className={styles.fieldError}>{errors.endDate.message}</span>}
          </div>
        </div>

        <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary}>
            {editingTerm ? "Update Term" : "Add Term"}
        </button>
          {editingTerm && (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                reset();
                setEditingTerm(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {terms.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                  No terms found
                </td>
              </tr>
            ) : (
              terms.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.name}</td>
                  <td>{new Date(t.startDate).toLocaleDateString()}</td>
                  <td>{new Date(t.endDate).toLocaleDateString()}</td>
                  <td>
                    <button className={styles.btnSmall} onClick={() => onEdit(t)}>
                      Edit
                    </button>
                    <button
                      className={styles.btnSmallDanger}
                      onClick={() => onDelete(t.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// -------------------- SUBJECTS --------------------

const SubjectsTab = () => {
  const [subjects, setSubjects] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [editingSubject, setEditingSubject] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchSubjects = async () => {
    try {
      const data = await getSubjectsApi();
      setSubjects(data);
    } catch (e) {
      toast.error("Failed to fetch subjects");
    }
  };

  const fetchPrograms = async () => {
    try {
      const data = await getProgramsApi();
      setPrograms(data);
    } catch (e) {
      toast.error("Failed to fetch programs");
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchPrograms();
  }, []);

  const onSubmit = async (data) => {
    try {
      data.programId = Number(data.programId);
      data.practicalHours = Number(data.practicalHours);
      data.theoryHours = Number(data.theoryHours);
      data.semester = Number(data.semester);
      if (editingSubject) {
        await updateSubjectApi(editingSubject.id, data);
        toast.success("Subject updated");
      } else {
      await createSubjectApi(data);
      toast.success("Subject created");
      }
      reset();
      setEditingSubject(null);
      fetchSubjects();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save subject");
    }
  };

  const onEdit = (subject) => {
    setEditingSubject(subject);
    reset({
      code: subject.code,
      name: subject.name,
      semester: subject.semester,
      theoryHours: subject.theoryHours,
      practicalHours: subject.practicalHours,
      programId: subject.programId,
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this subject?")) return;
    try {
      await deleteSubjectApi(id);
      toast.success("Subject deleted");
      fetchSubjects();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete subject");
    }
  };

  // Calculate subject statistics
  const subjectStats = useMemo(() => {
    const programGroups = subjects.reduce((acc, subj) => {
      const progName = subj.program?.name || "Unknown";
      acc[progName] = (acc[progName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(programGroups).map(([name, count]) => ({
      name,
      count,
    }));
  }, [subjects]);

  const semesterGroups = useMemo(() => {
    const groups = subjects.reduce((acc, subj) => {
      const semester = `Semester ${subj.semester || 'N/A'}`;
      acc[semester] = (acc[semester] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(groups).map(([semester, count]) => ({ semester, count }));
  }, [subjects]);

  const totalSubjects = subjects.length;

  return (
    <div className={styles.tabSection}>
      <h2 className={styles.sectionTitle}>Subjects</h2>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalSubjects}</div>
          <div className={styles.statLabel}>Total Subjects</div>
        </div>
      </div>

      {/* Visualizations */}
      <div className={styles.chartsGrid}>
        {subjectStats.length > 0 && (
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Subjects by Program</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0d47a1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {semesterGroups.length > 0 && (
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Subjects by Semester</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={semesterGroups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4db6ac" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.termsForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Subject Code</label>
        <input
              placeholder="Enter subject code"
              className={styles.formInput}
          {...register("code", { required: "Code is required" })}
        />
            {errors.code && <span className={styles.fieldError}>{errors.code.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Subject Name</label>
        <input
              placeholder="Enter subject name"
              className={styles.formInput}
          {...register("name", { required: "Name is required" })}
        />
            {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Semester</label>
        <input
              placeholder="Enter semester"
          type="number"
              className={styles.formInput}
          {...register("semester", { required: "Semester is required" })}
        />
            {errors.semester && <span className={styles.fieldError}>{errors.semester.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Theory Hours</label>
        <input
              placeholder="Enter theory hours"
          type="number"
              className={styles.formInput}
          {...register("theoryHours", { required: "Theory Hours is required" })}
        />
            {errors.theoryHours && <span className={styles.fieldError}>{errors.theoryHours.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Practical Hours</label>
        <input
              placeholder="Enter practical hours"
          type="number"
              className={styles.formInput}
          {...register("practicalHours", { required: "Practical Hours is required" })}
        />
            {errors.practicalHours && <span className={styles.fieldError}>{errors.practicalHours.message}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Program</label>
            <select className={styles.formSelect} {...register("programId", { required: "Program is required" })}>
          <option value="">Select Program</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
            {errors.programId && <span className={styles.fieldError}>{errors.programId.message}</span>}
          </div>
        </div>

        <div className={styles.formActions}>
        <button type="submit" className={styles.btnPrimary}>
            {editingSubject ? "Update Subject" : "Add Subject"}
        </button>
          {editingSubject && (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                reset();
                setEditingSubject(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>Name</th>
              <th>Program</th>
              <th>Semester</th>
              <th>Theory Hours</th>
              <th>Practical Hours</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "2rem" }}>
                  No subjects found
                </td>
              </tr>
            ) : (
              subjects.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.code}</td>
                  <td>{s.name}</td>
                  <td>{s.program?.name || "N/A"}</td>
                  <td>{s.semester}</td>
                  <td>{s.theoryHours || "N/A"}</td>
                  <td>{s.practicalHours || "N/A"}</td>
                  <td>
                    <button className={styles.btnSmall} onClick={() => onEdit(s)}>
                      Edit
                    </button>
                    <button
                      className={styles.btnSmallDanger}
                      onClick={() => onDelete(s.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
          </div>
    </div>
  );
};

// -------------------- STAFF ASSIGNMENTS --------------------

const StaffAssignmentsTab = () => {
  const [assignments, setAssignments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [terms, setTerms] = useState([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchAssignments = async () => {
    try {
      const data = await getStaffAssignmentsApi();
      setAssignments(data);
    } catch (e) {
      toast.error("Failed to fetch assignments");
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await getAllStaff();
      setStaffList(data);
    } catch (e) {
      toast.error("Failed to fetch staff");
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await getSubjectsApi();
      setSubjects(data);
    } catch (e) {
      toast.error("Failed to fetch subjects");
    }
  };

  const fetchSections = async () => {
    try {
      const data = await getSectionsApi();
      setSections(data);
    } catch (e) {
      toast.error("Failed to fetch sections");
    }
  };

  const fetchTerms = async () => {
    try {
      const data = await getTermsApi();
      setTerms(data);
    } catch (e) {
      toast.error("Failed to fetch terms");
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchStaff();
    fetchSubjects();
    fetchSections();
    fetchTerms();
  }, []);

  const onSubmit = async (data) => {
    try {
      await createStaffAssignmentApi({
        staffId: Number(data.staffId),
        subjectId: Number(data.subjectId),
        sectionId: Number(data.sectionId),
        termId: Number(data.termId),
        active: data.active === "true" || data.active === true,
      });
      toast.success("Assignment created successfully");
      reset();
      fetchAssignments();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create assignment");
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      await updateStaffAssignmentApi(id, { active: !currentActive });
      toast.success("Assignment updated successfully");
      fetchAssignments();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update assignment");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await deleteStaffAssignmentApi(id);
      toast.success("Assignment deleted successfully");
      fetchAssignments();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete assignment");
    }
  };

  const handleFixSequence = async () => {
    if (!window.confirm("This will fix the database sequence for Staff Assignments. Continue?")) return;
    try {
      const result = await fixStaffAssignmentSequenceApi();
      toast.success(result.message || "Sequence fixed successfully");
      fetchAssignments();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to fix sequence");
    }
  };

  // Calculate assignment statistics
  const assignmentStats = useMemo(() => {
    const deptGroups = assignments.reduce((acc, assign) => {
      const deptName = assign.staff?.department?.name || "Unknown";
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(deptGroups).map(([name, count]) => ({
      name,
      count,
    }));
  }, [assignments]);

  const activeAssignments = assignments.filter(a => a.active).length;
  const totalAssignments = assignments.length;

  return (
    <div className={styles.tabSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Staff Assignments</h2>
        <button 
          onClick={handleFixSequence} 
          className={styles.btnFixSequence}
          title="Fix database sequence if you encounter ID conflicts"
        >
          Fix Sequence
        </button>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalAssignments}</div>
          <div className={styles.statLabel}>Total Assignments</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{activeAssignments}</div>
          <div className={styles.statLabel}>Active Assignments</div>
        </div>
      </div>

      {/* Visualizations */}
      {assignmentStats.length > 0 && (
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Assignments by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assignmentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0d47a1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.assignmentForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Staff</label>
            <select className={styles.formSelect} {...register("staffId", { required: "Staff is required" })}>
              <option value="">Select Staff</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.user?.name || staff.employeeId} {staff.department?.name && `- ${staff.department.name}`}
                </option>
              ))}
            </select>
            {errors.staffId && <span className={styles.fieldError}>{errors.staffId.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Subject</label>
            <select className={styles.formSelect} {...register("subjectId", { required: "Subject is required" })}>
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
            {errors.subjectId && <span className={styles.fieldError}>{errors.subjectId.message}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Section</label>
            <select className={styles.formSelect} {...register("sectionId", { required: "Section is required" })}>
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name} {section.program?.name && `- ${section.program.name}`}
                </option>
              ))}
            </select>
            {errors.sectionId && <span className={styles.fieldError}>{errors.sectionId.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Term</label>
            <select className={styles.formSelect} {...register("termId", { required: "Term is required" })}>
              <option value="">Select Term</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>
            {errors.termId && <span className={styles.fieldError}>{errors.termId.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Status</label>
            <select className={styles.formSelect} {...register("active", { required: "Status is required" })} defaultValue="true">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>
            Create Assignment
          </button>
        </div>
      </form>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Staff</th>
              <th>Subject</th>
              <th>Section</th>
              <th>Term</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                  No assignments found
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>
                    {assignment.staff?.user?.name || assignment.staff?.employeeId || "N/A"}
                    {assignment.staff?.department?.name && (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>
                        {assignment.staff.department.name}
                      </div>
                    )}
                  </td>
                  <td>
                    {assignment.subject?.name || "N/A"}
                    {assignment.subject?.code && (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>
                        {assignment.subject.code}
                      </div>
                    )}
                  </td>
                  <td>
                    {assignment.section?.name || "N/A"}
                    {assignment.section?.program?.name && (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>
                        {assignment.section.program.name}
                      </div>
                    )}
                  </td>
                  <td>{assignment.term?.name || "N/A"}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${assignment.active ? styles.statusActive : styles.statusInactive}`}>
                      {assignment.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(assignment.id, assignment.active)}
                      className={`${styles.btnSmall} ${assignment.active ? styles.btnDeactivate : styles.btnActivate}`}
                    >
                      {assignment.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className={styles.btnSmallDanger}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// -------------------- MAIN ADMIN DASHBOARD --------------------

const AdminDashboard = () => {
  const navigate = useNavigate();
  const tabs = [
    { key: "users", label: "Users", component: <UsersTab /> },
    { key: "holidays", label: "Holidays", component: <HolidaysTab /> },
    { key: "departments", label: "Departments", component: <DepartmentsTab /> },
    { key: "programs", label: "Programs", component: <ProgramsTab /> },
    { key: "sections", label: "Sections", component: <SectionsTab /> },
    { key: "terms", label: "Terms", component: <TermsTab /> },
    { key: "subjects", label: "Subjects", component: <SubjectsTab /> },
    { key: "assignments", label: "Staff Assignments", component: <StaffAssignmentsTab /> },
    { key: "results", label: "Results", component: <ResultsGeneration /> },
    { key: "analytics", label: "Analytics", component: <AnalyticsView />, Icon: BarChart2 },

  ];

  const [activeTab, setActiveTab] = useState("users");

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className={styles.adminContainer}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className={styles.headerRow}>
      <h1 className={styles.title}>Admin Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </div>

      <nav className={styles.nav}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.navButton} ${activeTab === key ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className={styles.tabContent}>
        {tabs.find((t) => t.key === activeTab)?.component}
      </div>
    </div>
  );
};

export default AdminDashboard;