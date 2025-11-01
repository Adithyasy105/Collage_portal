// UsersManagement.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  uploadUsersCsvApi,
} from "api/adminAPI.js";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Fetch users
  const fetchUsers = async () => {
    try {
      const data = await getUsersApi();
      setUsers(data);
    } catch {
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered users by search term (name or email)
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const lower = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower)
    );
  }, [users, searchTerm]);

  // Submit handler for create/update
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

  // Edit user
  const onEdit = (user) => {
    setEditingUser(user);
    reset({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  // Cancel editing
  const onCancelEdit = () => {
    reset();
    setEditingUser(null);
  };

  // Delete user
  const onDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this user?")) return;
    try {
      await deleteUserApi(id);
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  // Upload CSV
  const onUploadCsv = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadUsersCsvApi(file);
      toast.success("Users imported successfully");
      fetchUsers();
    } catch {
      toast.error("Failed to import users");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">User Management</h2>

      {/* Form for create/update */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-md shadow space-y-4 max-w-md"
        noValidate
      >
        <div>
          <label htmlFor="name" className="block font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
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
          <label htmlFor="email" className="block font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register("email", { required: "Email is required" })}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            autoComplete="off"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {!editingUser && (
          <div>
            <label
              htmlFor="password"
              className="block font-medium text-gray-700 mb-1"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              {...register("password", { required: "Password is required" })}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="role" className="block font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            {...register("role")}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring border-gray-300"
            defaultValue="STUDENT"
          >
            <option value="STUDENT">Student</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 disabled:opacity-50"
          >
            {editingUser ? "Update User" : "Create User"}
          </button>
          {editingUser && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* CSV Upload */}
      <div className="max-w-md">
        <label
          htmlFor="upload-users-csv"
          className="inline-block cursor-pointer bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Upload Users CSV
          <input
            id="upload-users-csv"
            type="file"
            accept=".csv"
            onChange={onUploadCsv}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {uploading && <span className="ml-3 text-gray-600">Uploading...</span>}
      </div>

      {/* Search */}
      <div className="max-w-2xl">
        <input
          type="search"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
          aria-label="Search users"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto max-w-7xl">
        <table className="min-w-full bg-white rounded-md shadow">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-center px-4 py-3" style={{ minWidth: 140 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => onEdit(u)}
                      className="text-blue-700 hover:underline"
                      aria-label={`Edit user ${u.name}`}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(u.id)}
                      className="text-red-600 hover:underline"
                      aria-label={`Delete user ${u.name}`}
                      type="button"
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
    </section>
  );
}