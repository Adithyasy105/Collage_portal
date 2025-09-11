import React, { useEffect, useState } from "react";
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  uploadUsersCsvApi,
  getDepartmentsApi,
  createDepartmentApi,
  getProgramsApi,
  createProgramApi,
  getSectionsApi,
  createSectionApi,
  getTermsApi,
  createTermApi,
  getSubjectsApi,
  createSubjectApi,
  getHolidaysApi,
  createHolidayApi,
  deleteHolidayApi,
  uploadHolidaysCsvApi,
  generateResultsApi,
} from "../api/adminAPI";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import styles from "../styles/AdminDashboard.module.css";

// ---------------- Components ----------------
const Loading = () => <div className={styles.loading}>Loading...</div>;

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

  return (
    <div>
      <h2>Users</h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input
          placeholder="Name"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <span className={styles.error}>{errors.name.message}</span>}

        <input
          placeholder="Email"
          type="email"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && <span className={styles.error}>{errors.email.message}</span>}

        {!editingUser && (
          <>
            <input
              placeholder="Password"
              type="password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </>
        )}

        <select {...register("role")}>
          <option value="STUDENT">Student</option>
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </select>

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
      </form>

      <div className={styles.uploadContainer}>
        <label className={styles.uploadLabel}>
          Upload Users CSV
          <input type="file" accept=".csv" onChange={onUploadCsv} disabled={uploading} />
        </label>
        {uploading && <span>Uploading...</span>}
      </div>

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
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const HolidaysTab = () => {
  const [holidays, setHolidays] = useState([]);
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
      await createHolidayApi(data);
      toast.success("Holiday created");
      reset();
      fetchHolidays();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create holiday");
    }
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

  return (
    <div>
      <h2>Holidays</h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input
          placeholder="Holiday Name"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <span className={styles.error}>{errors.name.message}</span>}

        <input
          type="date"
          {...register("date", { required: "Date is required" })}
        />
        {errors.date && <span className={styles.error}>{errors.date.message}</span>}

        <button type="submit" className={styles.btnPrimary}>
          Add Holiday
        </button>
      </form>

      <div className={styles.uploadContainer}>
        <label className={styles.uploadLabel}>
          Upload Holidays CSV
          <input type="file" accept=".csv" onChange={onUploadCsv} disabled={uploading} />
        </label>
        {uploading && <span>Uploading...</span>}
      </div>

      <div className={styles.cardGrid}>
        {holidays.length === 0 && <p>No holidays found</p>}
        {holidays.map((h) => (
          <div key={h.id} className={styles.card}>
            <h4>{h.name}</h4>
            <p>{new Date(h.date).toLocaleDateString()}</p>
            <button
              className={styles.btnSmallDanger}
              onClick={() => onDelete(h.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const DepartmentsTab = () => {
  const [departments, setDepartments] = useState([]);
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
      await createDepartmentApi(data);
      toast.success("Department created");
      reset();
      fetchDepartments();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create department");
    }
  };

  return (
    <div>
      <h2>Departments</h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input
          placeholder="Department Name"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <span className={styles.error}>{errors.name.message}</span>}

        <button type="submit" className={styles.btnPrimary}>
          Add Department
        </button>
      </form>

      <div className={styles.cardGrid}>
        {departments.length === 0 && <p>No departments found</p>}
        {departments.map((d) => (
          <div key={d.id} className={styles.card}>
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const ProgramsTab = () => {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
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
      await createProgramApi(data);
      toast.success("Program created");
      reset();
      fetchPrograms();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create program");
    }
  };

  return (
    <div>
      <h2>Programs</h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input
          placeholder="Program Name"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <span className={styles.error}>{errors.name.message}</span>}

        <select {...register("departmentId", { required: "Department is required" })}>
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {errors.departmentId && <span className={styles.error}>{errors.departmentId.message}</span>}

        <button type="submit" className={styles.btnPrimary}>
          Add Program
        </button>
      </form>

      <div className={styles.cardGrid}>
        {programs.length === 0 && <p>No programs found</p>}
        {programs.map((p) => (
          <div key={p.id} className={styles.card}>
            <strong>{p.name}</strong>
            <p>{p.department?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionsTab = () => {
  const [sections, setSections] = useState([]);
  const [programs, setPrograms] = useState([]);
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
      await createSectionApi(data);
      toast.success("Section created");
      reset();
      fetchSections();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create section");
    }
  };

  return (
    <div>
      <h2>Sections</h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input
          placeholder="Section Name"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <span className={styles.error}>{errors.name.message}</span>}

        <select {...register("programId", { required: "Program is required" })}>
          <option value="">Select Program</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {errors.programId && <span className={styles.error}>{errors.programId.message}</span>}

        <button type="submit" className={styles.btnPrimary}>
          Add Section
        </button>
      </form>

      <div className={styles.cardGrid}>
        {sections.length === 0 && <p>No sections found</p>}
        {sections.map((s) => (
          <div key={s.id} className={styles.card}>
            <strong>{s.name}</strong>
            <p>{s.program?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// -------------------- TERMS --------------------

const TermsTab = () => {
  const [terms, setTerms] = useState([]);
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
      await createTermApi(data);
      toast.success("Term created");
      reset();
      fetchTerms();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create term");
    }
  };

  return (
    <div>
      <h2>Academic Terms</h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input
          placeholder="Term Name"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <span className={styles.error}>{errors.name.message}</span>}

        <label>Start Date</label>
        <input
          type="date"
          {...register("startDate", { required: "Start date is required" })}
        />
        {errors.startDate && <span className={styles.error}>{errors.startDate.message}</span>}

        <label>End Date</label>
        <input
          type="date"
          {...register("endDate", { required: "End date is required" })}
        />
        {errors.endDate && <span className={styles.error}>{errors.endDate.message}</span>}

        <button type="submit" className={styles.btnPrimary}>
          Add Term
        </button>
      </form>

      <div className={styles.cardGrid}>
        {terms.length === 0 && <p>No terms found</p>}
        {terms.map((t) => (
          <div key={t.id} className={styles.card}>
            <strong>{t.name}</strong>
            <p>
              {new Date(t.startDate).toLocaleDateString()} -{" "}
              {new Date(t.endDate).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// -------------------- SUBJECTS --------------------

const SubjectsTab = () => {
  const [subjects, setSubjects] = useState([]);
  const [programs, setPrograms] = useState([]);
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
      await createSubjectApi(data);
      toast.success("Subject created");
      reset();
      fetchSubjects();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create subject");
    }
  };

  return (
    <div>
      <h2>Subjects</h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input
          placeholder="Subject Name"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <span className={styles.error}>{errors.name.message}</span>}

        <select {...register("programId", { required: "Program is required" })}>
          <option value="">Select Program</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {errors.programId && <span className={styles.error}>{errors.programId.message}</span>}

        <button type="submit" className={styles.btnPrimary}>
          Add Subject
        </button>
      </form>

      <div className={styles.cardGrid}>
        {subjects.length === 0 && <p>No subjects found</p>}
        {subjects.map((s) => (
          <div key={s.id} className={styles.card}>
            <strong>{s.name}</strong>
            <p>{s.program?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResultsTab = () => {
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [loading, setLoading] = useState(false);

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

  const onGenerate = async () => {
    if (!selectedTerm) {
      toast.error("Please select a term");
      return;
    }
    setLoading(true);
    try {
      await generateResultsApi(Number(selectedTerm));
      toast.success("Results generated and students promoted");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to generate results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Generate Final Results</h2>
      <select
        value={selectedTerm}
        onChange={(e) => setSelectedTerm(e.target.value)}
        className={styles.select}
      >
        <option value="">Select Term</option>
        {terms.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} ({new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()})
          </option>
        ))}
      </select>
      <button onClick={onGenerate} className={styles.btnPrimary} disabled={loading}>
        {loading ? "Generating..." : "Generate Results"}
      </button>
    </div>
  );
};

// -------------------- MAIN ADMIN DASHBOARD --------------------

const AdminDashboard = () => {
  const tabs = [
    { key: "users", label: "Users", component: <UsersTab /> },
    { key: "holidays", label: "Holidays", component: <HolidaysTab /> },
    { key: "departments", label: "Departments", component: <DepartmentsTab /> },
    { key: "programs", label: "Programs", component: <ProgramsTab /> },
    { key: "sections", label: "Sections", component: <SectionsTab /> },
    { key: "terms", label: "Terms", component: <TermsTab /> },
    { key: "subjects", label: "Subjects", component: <SubjectsTab /> },
    { key: "results", label: "Results", component: <ResultsTab /> },
  ];

  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className={styles.adminContainer}>
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className={styles.title}>Admin Dashboard</h1>

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