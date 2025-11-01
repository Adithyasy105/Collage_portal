// HolidaysManagement.jsx
import React, { useEffect, useState } from "react";
import {
  getHolidaysApi,
  createHolidayApi,
  deleteHolidayApi,
  uploadHolidaysCsvApi,
} from "api/adminAPI.js";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function HolidaysManagement() {
  const [holidays, setHolidays] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const fetchHolidays = async () => {
    try {
      const data = await getHolidaysApi();
      setHolidays(data);
    } catch {
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
    } catch {
      toast.error("Failed to delete holiday");
    }
  };

  const onUploadCsv = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadHolidaysCsvApi(file);
      toast.success(
        `Import complete! ${result.createdCount} holidays added.`
      );
      setUploadResult(result);
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to import holidays");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Manage Holidays</h2>

      {/* Add Holiday Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-50 p-6 rounded-lg border border-gray-200 max-w-md space-y-4"
        noValidate
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="flex-grow">
            <label htmlFor="name" className="block font-medium text-gray-700 mb-1">
            Holiday Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register("name", { required: "Name is required" })}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            autoComplete="off"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
          </div>

          <div>
          <label htmlFor="date" className="block font-medium text-gray-700 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            type="date"
            {...register("date", { required: "Date is required" })}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
              errors.date ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.date && (
            <p className="text-red-600 text-sm mt-1">{errors.date.message}</p>
          )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-fit"
          >
            {isSubmitting ? "Adding..." : "Add Holiday"}
          </button>
        </div>
      </form>

      {/* CSV Upload */}
      <div className="max-w-md">
        <label 
          htmlFor="upload-holidays-csv"
          className="inline-block cursor-pointer bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Upload Holidays CSV
          <input
            id="upload-holidays-csv"
            type="file"
            accept=".csv"
            onChange={onUploadCsv}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {uploading && <span className="ml-3 text-gray-600 animate-pulse">Uploading...</span>}
        {uploadResult && uploadResult.errors?.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <h4 className="font-semibold text-red-800">Import Errors:</h4>
            <ul className="list-disc list-inside text-sm text-red-700 mt-2">
              {uploadResult.errors.map((e, i) => (
                <li key={i}>
                  Row: <code>{JSON.stringify(e.row)}</code> - Error: {e.error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Upcoming Holidays
        </h3>
      </div>

      {/* Holidays Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {holidays.length === 0 ? (
          <p className="text-gray-600 col-span-full">No holidays found</p>
        ) : (
          holidays.map((h) => (
            <div
              key={h.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{h.name}</h3>
                <p className="text-gray-600 mt-1">
                  {new Date(h.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => onDelete(h.id)}
                className="mt-4 self-start text-red-600 hover:text-red-800 text-sm font-medium"
                type="button"
                aria-label={`Delete holiday ${h.name}`}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}