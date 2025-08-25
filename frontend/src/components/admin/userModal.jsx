import React, { useState, useEffect } from "react";

const UserModal = ({ show, mode, userData, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });

  useEffect(() => {
    if (mode === "edit" && userData) {
      setForm({
        name: userData.name || "",
        email: userData.email || "",
        role: userData.role || "",
        password: "",
      });
    } else {
      setForm({ name: "", email: "", password:"", role: "" });
    }
  }, [mode, userData, show]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[400px]">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          {mode === "add" ? "Add User" : "Edit User"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          {mode === "add" && (
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {mode === "add" ? "Add" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
