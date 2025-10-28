// MasterDataManagement.jsx
import React, { useEffect, useState } from "react";
import {
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
} from "../../api/adminAPI";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function SectionWrapper({ title, children }) {
  return (
    <section className="bg-white p-6 rounded-lg shadow-md space-y-6 mb-8 border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-3">{title}</h3>
      {children}
    </section>
  );
}

export default function MasterDataManagement() {
  // Departments
  const [departments, setDepartments] = useState([]);
  const {
    register: registerDep,
    handleSubmit: handleSubmitDep,
    reset: resetDep,
    formState: { errors: errorsDep, isSubmitting: isSubmittingDep },
  } = useForm();

  // Programs
  const [programs, setPrograms] = useState([]);
  const {
    register: registerProg,
    handleSubmit: handleSubmitProg,
    reset: resetProg,
    formState: { errors: errorsProg, isSubmitting: isSubmittingProg },
  } = useForm();

  // Sections
  const [sections, setSections] = useState([]);
  const {
    register: registerSec,
    handleSubmit: handleSubmitSec,
    reset: resetSec,
    formState: { errors: errorsSec, isSubmitting: isSubmittingSec },
  } = useForm();

  // Terms
  const [terms, setTerms] = useState([]);
  const {
    register: registerTerm,
    handleSubmit: handleSubmitTerm,
    reset: resetTerm,
    formState: { errors: errorsTerm, isSubmitting: isSubmittingTerm },
  } = useForm();

  // Subjects
  const [subjects, setSubjects] = useState([]);
  const {
    register: registerSubj,
    handleSubmit: handleSubmitSubj,
    reset: resetSubj,
    formState: { errors: errorsSubj, isSubmitting: isSubmittingSubj },
  } = useForm();

  // Fetch all master data
  const fetchDepartments = async () => {
    try {
      const data = await getDepartmentsApi();
      setDepartments(data);
    } catch {
      toast.error("Failed to fetch departments");
    }
  };

  const fetchPrograms = async () => {
    try {
      const data = await getProgramsApi();
      setPrograms(data);
    } catch {
      toast.error("Failed to fetch programs");
    }
  };

  const fetchSections = async () => {
    try {
      const data = await getSectionsApi();
      setSections(data);
    } catch {
      toast.error("Failed to fetch sections");
    }
  };

  const fetchTerms = async () => {
    try {
      const data = await getTermsApi();
      setTerms(data);
    } catch {
      toast.error("Failed to fetch terms");
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await getSubjectsApi();
      setSubjects(data);
    } catch {
      toast.error("Failed to fetch subjects");
    }
  };

  React.useEffect(() => {
    fetchDepartments();
    fetchPrograms();
    fetchSections();
    fetchTerms();
    fetchSubjects();
  }, []);

  // Handlers for create

  const onCreateDepartment = async (data) => {
    try {
      await createDepartmentApi(data);
      toast.success("Department created");
      resetDep();
      fetchDepartments();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create department");
    }
  };

  const onCreateProgram = async (data) => {
    try {
      data.departmentId = Number(data.departmentId);
      data.durationSemesters = Number(data.durationSemesters);
      await createProgramApi(data);
      toast.success("Program created");
      resetProg();
      fetchPrograms();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create program");
    }
  };

  const onCreateSection = async (data) => {
    try {
      data.programId = Number(data.programId);
      data.semester = Number(data.semester);
      await createSectionApi(data);
      toast.success("Section created");
      resetSec();
      fetchSections();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create section");
    }
  };

  const onCreateTerm = async (data) => {
    try {
      await createTermApi(data);
      toast.success("Term created");
      resetTerm();
      fetchTerms();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create term");
    }
  };

  const onCreateSubject = async (data) => {
    try {
      data.programId = Number(data.programId);
      data.semester = Number(data.semester);
      if (data.theoryHours) data.theoryHours = Number(data.theoryHours);
      if (data.practicalHours) data.practicalHours = Number(data.practicalHours);
      await createSubjectApi(data);
      toast.success("Subject created");
      resetSubj();
      fetchSubjects();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create subject");
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Departments */}
      <SectionWrapper title="Departments">
        <form
          onSubmit={handleSubmitDep(onCreateDepartment)}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          noValidate
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="e.g., Computer Science"
              {...registerDep("name", { required: "Name is required" })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsDep.name ? "border-red-500" : "border-gray-300"
              }`}
              autoComplete="off"
            />
            {errorsDep.name && <p className="text-red-500 text-xs mt-1">{errorsDep.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              type="text"
              placeholder="e.g., CSE"
              {...registerDep("code", { required: "Code is required" })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsDep.code ? "border-red-500" : "border-gray-300"
              }`}
              autoComplete="off"
            />
            {errorsDep.code && <p className="text-red-500 text-xs mt-1">{errorsDep.code.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmittingDep}
            className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 disabled:opacity-50 h-fit"
          >
            {isSubmittingDep ? "Adding..." : "Add Department"}
          </button>
        </form>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4 border-t">
          {departments.length === 0 ? (
            <p className="text-gray-600 col-span-full">No departments found</p>
          ) : (
            departments.map((d) => (
              <div
                key={d.id}
                className="bg-gray-100 rounded-md p-3 text-gray-800 font-medium"
              >
                {d.name} ({d.code})
              </div>
            ))
          )}
        </div>
      </SectionWrapper>

      {/* Programs */}
      <SectionWrapper title="Programs">
        <form
          onSubmit={handleSubmitProg(onCreateProgram)}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          noValidate
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="e.g., B.Tech"
              {...registerProg("name", { required: "Name is required" })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsProg.name ? "border-red-500" : "border-gray-300"
              }`}
              autoComplete="off"
            />
            {errorsProg.name && <p className="text-red-500 text-xs mt-1">{errorsProg.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              type="text"
              placeholder="e.g., BTECH-CSE"
              {...registerProg("code", { required: "Code is required" })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsProg.code ? "border-red-500" : "border-gray-300"
              }`}
              autoComplete="off"
            />
            {errorsProg.code && <p className="text-red-500 text-xs mt-1">{errorsProg.code.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Semesters)</label>
            <input
              type="number"
              placeholder="e.g., 8"
              {...registerProg("durationSemesters", { required: "Duration is required", valueAsNumber: true })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsProg.durationSemesters ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errorsProg.durationSemesters && <p className="text-red-500 text-xs mt-1">{errorsProg.durationSemesters.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              {...registerProg("departmentId", { required: "Department is required" })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsProg.departmentId ? "border-red-500" : "border-gray-300"
              }`}
              defaultValue=""
            >
              <option value="" disabled>
                Select Department
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errorsProg.departmentId && <p className="text-red-500 text-xs mt-1">{errorsProg.departmentId.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmittingProg}
            className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 disabled:opacity-50 h-fit md:col-start-4"
          >
            {isSubmittingProg ? "Adding..." : "Add Program"}
          </button>
        </form>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4 border-t">
          {programs.length === 0 ? (
            <p className="text-gray-600 col-span-full">No programs found</p>
          ) : (
            programs.map((p) => (
              <div
                key={p.id}
                className="bg-gray-100 rounded-md p-3 text-gray-800"
              >
                <strong>{p.name}</strong>
                <p className="text-sm text-gray-500">
                  {p.department?.name || "No Department"}
                </p>
              </div>
            ))
          )}
        </div>
      </SectionWrapper>

      {/* Sections */}
      <SectionWrapper title="Sections">
        <form
          onSubmit={handleSubmitSec(onCreateSection)}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          noValidate
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="e.g., A"
              {...registerSec("name", { required: "Name is required" })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsSec.name ? "border-red-500" : "border-gray-300"
              }`}
              autoComplete="off"
            />
            {errorsSec.name && <p className="text-red-500 text-xs mt-1">{errorsSec.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input
              type="text"
              placeholder="e.g., 2024-2025"
              {...registerSec("academicYear", { required: "Year is required" })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsSec.academicYear ? "border-red-500" : "border-gray-300"
              }`}
              autoComplete="off"
            />
            {errorsSec.academicYear && <p className="text-red-500 text-xs mt-1">{errorsSec.academicYear.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <input
              type="number"
              placeholder="e.g., 3"
              {...registerSec("semester", { required: "Semester is required", valueAsNumber: true })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsSec.semester ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errorsSec.semester && <p className="text-red-500 text-xs mt-1">{errorsSec.semester.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
            <select
              {...registerSec("programId", { required: "Program is required" })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsSec.programId ? "border-red-500" : "border-gray-300"
              }`}
              defaultValue=""
            >
              <option value="" disabled>
                Select Program
              </option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errorsSec.programId && <p className="text-red-500 text-xs mt-1">{errorsSec.programId.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmittingSec}
            className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 disabled:opacity-50 h-fit md:col-start-4"
          >
            {isSubmittingSec ? "Adding..." : "Add Section"}
          </button>
        </form>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4 border-t">
          {sections.length === 0 ? (
            <p className="text-gray-600 col-span-full">No sections found</p>
          ) : (
            sections.map((s) => (
              <div
                key={s.id}
                className="bg-gray-100 rounded-md p-3 text-gray-800"
              >
                <strong>{s.program?.name} - Sem {s.semester} - Sec {s.name}</strong>
                <p className="text-sm text-gray-500">
                  {s.program?.name || "No Program"}
                </p>
              </div>
            ))
          )}
        </div>
      </SectionWrapper>

      {/* Terms */}
      <SectionWrapper title="Academic Terms">
        <form
          onSubmit={handleSubmitTerm(onCreateTerm)}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          noValidate
        >
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Term Name</label>
            <input
              type="text"
              placeholder="e.g., Fall 2024"
              {...registerTerm("name", { required: "Name is required" })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsTerm.name ? "border-red-500" : "border-gray-300"
              }`}
              autoComplete="off"
            />
            {errorsTerm.name && <p className="text-red-500 text-xs mt-1">{errorsTerm.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              {...registerTerm("startDate", { required: "Start date is required" })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsTerm.startDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errorsTerm.startDate && <p className="text-red-500 text-xs mt-1">{errorsTerm.startDate.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              {...registerTerm("endDate", { required: "End date is required" })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsTerm.endDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errorsTerm.endDate && <p className="text-red-500 text-xs mt-1">{errorsTerm.endDate.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmittingTerm}
            className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 disabled:opacity-50 h-fit md:col-start-4"
          >
            {isSubmittingTerm ? "Adding..." : "Add Term"}
          </button>
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
          {terms.length === 0 ? (
            <p className="text-gray-600 col-span-full">No terms found</p>
          ) : (
            terms.map((t) => (
              <div
                key={t.id}
                className="bg-gray-100 rounded-md p-3 text-gray-800"
              >
                <strong>{t.name}</strong>
                <p className="text-sm text-gray-500">
                  {new Date(t.startDate).toLocaleDateString()} -{" "}
                  {new Date(t.endDate).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </SectionWrapper>

      {/* Subjects */}
      <SectionWrapper title="Subjects">
        <form
          onSubmit={handleSubmitSubj(onCreateSubject)}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end"
          noValidate
        >
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="e.g., Data Structures"
              {...registerSubj("name", { required: "Name is required" })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsSubj.name ? "border-red-500" : "border-gray-300"
              }`}
              autoComplete="off"
            />
            {errorsSubj.name && <p className="text-red-500 text-xs mt-1">{errorsSubj.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              type="text"
              placeholder="e.g., CS201"
              {...registerSubj("code", { required: "Code is required" })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsSubj.code ? "border-red-500" : "border-gray-300"
              }`}
              autoComplete="off"
            />
            {errorsSubj.code && <p className="text-red-500 text-xs mt-1">{errorsSubj.code.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <input
              type="number"
              placeholder="e.g., 3"
              {...registerSubj("semester", { required: "Semester is required", valueAsNumber: true })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsSubj.semester ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errorsSubj.semester && <p className="text-red-500 text-xs mt-1">{errorsSubj.semester.message}</p>}
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
            <select
              {...registerSubj("programId", { required: "Program is required" })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errorsSubj.programId ? "border-red-500" : "border-gray-300"
              }`}
              defaultValue=""
            >
              <option value="" disabled>
                Select Program
              </option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errorsSubj.programId && <p className="text-red-500 text-xs mt-1">{errorsSubj.programId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Theory Hours</label>
            <input type="number" placeholder="e.g., 40" {...registerSubj("theoryHours")} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Practical Hours</label>
            <input type="number" placeholder="e.g., 20" {...registerSubj("practicalHours")} className="w-full border rounded px-3 py-2" />
          </div>
          <button
            type="submit"
            disabled={isSubmittingSubj}
            className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 disabled:opacity-50 h-fit"
          >
            {isSubmittingSubj ? "Adding..." : "Add Subject"}
          </button>
        </form>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4 border-t">
          {subjects.length === 0 ? (
            <p className="text-gray-600 col-span-full">No subjects found</p>
          ) : (
            subjects.map((s) => (
              <div
                key={s.id}
                className="bg-gray-100 rounded-md p-3 text-gray-800"
              >
                <strong>{s.name} ({s.code})</strong>
                <p className="text-sm text-gray-500">
                  {s.program?.name || "No Program"}
                </p>
              </div>
            ))
          )}
        </div>
      </SectionWrapper>
    </div>
  );
}