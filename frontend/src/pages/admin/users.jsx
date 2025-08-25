import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import UserModal from "../../components/admin/userModal";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/users/getAllUsers", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch((err) => console.error("Error fetching users:", err));

    fetch("http://localhost:4000/api/users/getUserProfile", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCurrentUser(data))
      .catch((err) => console.error("Error fetching current user:", err));
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/api/users/deleteUserById/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleSave = async (formData) => {
    try {
      let url = "http://localhost:4000/api/auth/registerUser";
      let method = "POST";

      if (modalMode === "edit" && selectedUser) {
        url = `http://localhost:4000/api/users/updateUserProfileById/${selectedUser.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        const updated = await res.json();
        if (modalMode === "add") {
          setUsers((prev) => [...prev, updated.user]);
        } else {
          setUsers((prev) =>
            prev.map((u) => (u.id === selectedUser.id ? { ...u, ...formData } : u))
          );
        }
      }
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg p-4 bg-white dark:bg-gray-900">
      <div className="flex justify-end p-4">
        <button
          onClick={() => { setShowModal(true); setModalMode("add"); setSelectedUser(null); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add User
        </button>
      </div>

      {/* Table */}
      <div className="max-h-[500px] overflow-y-auto border rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="sticky top-0 z-10 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter((u) =>
                u.name?.toLowerCase().includes(search.toLowerCase()) ||
                u.email?.toLowerCase().includes(search.toLowerCase())
              )
              .map((u) => (
                <tr key={u.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4">{u.id}</td>
                  <td className="px-6 py-4">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">{u.role}</td>
                  <td className="px-6 py-2 flex gap-2">
                    <FaEdit
                      onClick={() => { setShowModal(true); setModalMode("edit"); setSelectedUser(u); }}
                      className="text-blue-600 text-2xl cursor-pointer"
                    />
                    {currentUser?.id !== u.id && (
                      <MdDelete
                        onClick={() => handleDelete(u.id)}
                        className="text-red-600 text-2xl cursor-pointer"
                      />
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      <UserModal
        show={showModal}
        mode={modalMode}
        userData={selectedUser}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default Users;
