"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState("addUser");
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    privileges: [],
  });

  const API_BASE_URL = "http://localhost:5002"; // Change this if needed

  const sidebarOptions = [
    "Dashboard",
    "Production",
    "SLD",
    "Suppression",
    "Health",
    "Analysis",
    "Solar Analytics",
    "Power Analytics",
    "User Management",
  ];

  // ✅ Fetch Users & Roles on Load
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users/all`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/roles/all?selection=true`);
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // ✅ Add User
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      Swal.fire("Error", "Please fill in all fields!", "error");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/users/register`, newUser);
      Swal.fire("Success", "User added successfully!", "success");
      fetchUsers();
      setNewUser({ name: "", email: "", password: "", role: "", privileges: [] });
    } catch (error) {
      console.error("Error adding user:", error);
      Swal.fire("Error", "Failed to add user!", "error");
    }
  };

  // ✅ Delete User
  const handleDeleteUser = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/users/delete/${id}`);
          Swal.fire("Deleted!", "User has been deleted.", "success");
          fetchUsers();
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire("Error", "Failed to delete user!", "error");
        }
      }
    });
  };

  // ✅ Toggle Privilege Selection
  const handlePrivilegeChange = (privilege) => {
    setNewUser((prev) => ({
      ...prev,
      privileges: prev.privileges.includes(privilege)
        ? prev.privileges.filter((p) => p !== privilege)
        : [...prev.privileges, privilege],
    }));
  };

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-700 mb-6">
        <button className={`px-6 py-2 ${activeTab === "roles" ? "border-b-4 border-blue-500 text-white" : "text-gray-400"}`} onClick={() => setActiveTab("roles")}>Roles</button>
        <button className={`px-6 py-2 ${activeTab === "addUser" ? "border-b-4 border-blue-500 text-white" : "text-gray-400"}`} onClick={() => setActiveTab("addUser")}>Add User</button>
        <button className={`px-6 py-2 ${activeTab === "viewUsers" ? "border-b-4 border-blue-500 text-white" : "text-gray-400"}`} onClick={() => setActiveTab("viewUsers")}>View Users</button>
      </div>

      {/* Roles Tab */}
      {activeTab === "roles" && (
        <div className="bg-[#182028] p-6 rounded-xl shadow-md">
          <h3 className="text-white mb-4">Roles List</h3>
          <table className="w-full text-white border border-gray-600">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Role Name</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-700">
                  <td className="p-2 border text-center">{role.id}</td>
                  <td className="p-2 border">{role.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Tab */}
      {activeTab === "addUser" && (
        <div className="bg-[#182028] p-6 rounded-xl shadow-md">
          <h2 className="text-white mb-4">Add New User</h2>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Name" className="input-field" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
            <input type="email" placeholder="Email" className="input-field" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
            <input type="password" placeholder="Password" className="input-field" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
            <select className="select-field" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          <h3 className="mt-6 mb-2 text-white">Privileges</h3>
          <div className="grid grid-cols-2 gap-6 p-4">
            {sidebarOptions.map((option, index) => (
              <label key={index} className="flex items-center text-white gap-2">
                <input type="checkbox" checked={newUser.privileges.includes(option)} onChange={() => handlePrivilegeChange(option)} />
                {option}
              </label>
            ))}
          </div>
          <button className="mt-6 bg-blue-500 px-6 py-2 rounded-md" onClick={handleAddUser}>Add User</button>
        </div>
      )}

      {/* View Users Tab */}
      {activeTab === "viewUsers" && (
        <div className="bg-[#182028] p-6 rounded-xl shadow-md">
          <h3 className="text-white mb-4">Users List</h3>
          <table className="w-full text-white border border-gray-600">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700">
                  <td className="p-2 border">{user.id}</td>
                  <td className="p-2 border">{user.name}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">{user.role}</td>
                  <td className="p-2 border"><button className="bg-red-500 px-3 py-1 rounded-md" onClick={() => handleDeleteUser(user.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
