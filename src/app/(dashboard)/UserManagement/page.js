"use client";
import { useState } from "react";
import Swal from "sweetalert2"; // ✅ Import SweetAlert2

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState("addUser");

  // ✅ Predefined Roles
  const roles = [
    { id: 1, name: "Admin" },
    { id: 2, name: "User" },
    { id: 3, name: "Operator" },
  ];

  // ✅ User Management
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    privileges: [],
  });

  // ✅ Sidebar options for privilege selection
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

  // ✅ Add User Function with Success Popup
  const handleAddUser = (e) => {
    e.preventDefault();
  
    // Ensure all required fields are filled
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill in all required fields!",
        background: "#222D3B", // 🔵 Set Background Color
        color: "#ffffff", // 🔵 Set Text Color to White
      });
      return;
    }
  
    // Add User to the State
    setUsers([...users, { id: users.length + 1, ...newUser }]);
  
    // Clear Form Fields
    setNewUser({ name: "", email: "", password: "", role: "", privileges: [] });
  
    // ✅ Show Success Popup with Custom Background
    Swal.fire({
      icon: "success",
      title: "User Added Successfully!",
      text: `The user ${newUser.name} has been added.`,
      background: "#222D3B", // 🔵 Custom Background Color
      color: "#ffffff", // 🔵 Set Text Color to White
      confirmButtonColor: "#3085d6", // 🔵 Customize Button Color
      showConfirmButton: false,
      timer: 2000, // Auto close after 2 seconds
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
      {/* Tabs Navigation */}
      <div className="flex space-x-4 border-b border-gray-700 mb-6">
        <button
          className={`px-6 py-2 ${
            activeTab === "roles"
              ? "border-b-4 border-blue-500 text-white"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("roles")}
        >
          Roles
        </button>
        <button
          className={`px-6 py-2 ${
            activeTab === "addUser"
              ? "border-b-4 border-blue-500 text-white"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("addUser")}
        >
          Add User
        </button>
        <button
          className={`px-6 py-2 ${
            activeTab === "viewUsers"
              ? "border-b-4 border-blue-500 text-white"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("viewUsers")}
        >
          View Users
        </button>
      </div>

      {/* Roles Tab */}
      {activeTab === "roles" && (
        <div className="bg-[#182028] p-6 rounded-xl shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]">
          {/* Roles Table */}
          <h3 className="custom-header mb-6">Roles List</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-600 text-white">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-600 p-2">ID</th>
                  <th className="border border-gray-600 p-2">Role Name</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-700">
                    <td className="border border-gray-600 p-2 text-center">
                      {role.id}
                    </td>
                    <td className="border border-gray-600 p-2 text-center">{role.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Tab */}
      {activeTab === "addUser" && (
        <div className="bg-[#182028] p-6 rounded-xl shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]">
          <h2 className="custom-header">Add New User</h2>

          {/* User Details Section */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-white font-semibold">User Name</label>
              <input
                type="text"
                placeholder="Enter Name"
                className="input-field"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-white font-semibold">Email</label>
              <input
                type="email"
                placeholder="Enter Email"
                className="input-field"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-white font-semibold">Password</label>
              <input
                type="password"
                placeholder="Enter Password"
                className="input-field"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-white font-semibold">User Role</label>
              <select
                className="select-field"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User Privileges Section */}
          <h3 className="mt-6 mb-2 text-white font-semibold">Privileges</h3>
          <div className="grid grid-cols-2 gap-6 p-4 rounded-lg mb-2">
            {sidebarOptions.map((option, index) => (
              <label key={index} className="flex items-center text-white gap-2">
                <input
                  type="checkbox"
                  checked={newUser.privileges.includes(option)}
                  onChange={() => handlePrivilegeChange(option)}
                />
                {option}
              </label>
            ))}
          </div>

          {/* Submit Button */}
          <button
            className="mt-6 bg-blue-500 px-6 py-2 rounded-md shadow-md hover:bg-blue-600 transition-all"
            onClick={handleAddUser}
          >
            Add User
          </button>
        </div>
      )}

      {/* View Users Tab */}
      {activeTab === "viewUsers" && (
        <div className="bg-[#182028] p-6 rounded-xl shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]">
          <h3 className="custom-header mb-4">Users List</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-600 text-white">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-600 p-2">ID</th>
                  <th className="border border-gray-600 p-2">Name</th>
                  <th className="border border-gray-600 p-2">Email</th>
                  <th className="border border-gray-600 p-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center p-4 text-gray-400">
                      No users added yet.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700">
                      <td className="border border-gray-600 p-2 text-center">
                        {user.id}
                      </td>
                      <td className="border border-gray-600 p-2">
                        {user.name}
                      </td>
                      <td className="border border-gray-600 p-2">
                        {user.email}
                      </td>
                      <td className="border border-gray-600 p-2">
                        {user.role}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
