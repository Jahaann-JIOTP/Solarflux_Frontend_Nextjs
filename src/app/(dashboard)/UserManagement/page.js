"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import config from "@/config";
export default function UserManagement() {
  const [activeTab, setActiveTab] = useState("addUser");
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const baseUrl = config.BASE_URL;
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    privileges: [],
  });
  const [editUserPopup, setEditUserPopup] = useState(false);
  const [editUserData, setEditUserData] = useState({
    _id: "",
    name: "",
    email: "",
    role: "",
  });
  const [token, setToken] = useState(null);
  const [showRolePopup, setShowRolePopup] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [selectedPrivileges, setSelectedPrivileges] = useState([]);
  const [privileges, setPrivileges] = useState([]);
  const [editRolePopup, setEditRolePopup] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [editPrivileges, setEditPrivileges] = useState([]);

  const openEditRolePopup = (role) => {
    setEditRole(role);
    setEditPrivileges(role.privileges.map((p) => p._id)); // Store existing privileges
    setEditRolePopup(true);
  };

  // ✅ Use useEffect to retrieve token only when component is mounted
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, []);

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
  const openEditUserPopup = (user) => {
    setEditUserData({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role?._id || "", // ensure role is ID
    });
    setEditUserPopup(true);
  };

  // ✅ Fetch Users
  const fetchUsers = async () => {
    if (!token) return; // ✅ Ensure token is available
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to fetch users!", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    if (!token) return; // ✅ Prevent API call if token is not yet set
    try {
      const response = await axios.get(`${baseUrl}roles/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to fetch roles!", "error");
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchRoles();
    }
  }, [token]); // ✅ Re-run fetch when token is available

  // ✅ Add User
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      Swal.fire("Error", "Please fill in all fields!", "error");
      return;
    }

    try {
      await axios.post(
        `${baseUrl}users/register`,
        { ...newUser },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Swal.fire("Success", "User added successfully!", "success");
      fetchUsers();
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "",
        privileges: [],
      });
    } catch (error) {
      console.error("Error adding user:", error);

      // Extract message (handle if it's an array)
      const errorMessage = Array.isArray(error.response?.data?.message)
        ? error.response.data.message.join("\n") // Join array messages with a newline
        : error.response?.data?.message || "Something went wrong";

      Swal.fire("Error", errorMessage, "error");
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
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${baseUrl}users/delete/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          Swal.fire("Deleted!", "User has been removed successfully.", "success");
          // Refresh the users list
          fetchUsers();
        } catch (error) {
          Swal.fire("Error", error.response?.data?.message || "Failed to delete user!", "error");
          console.error("Error deleting user:", error);
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
  const fetchPrivileges = async () => {
    if (!token) return; // Ensure token is available
    try {
      const response = await axios.get(`${baseUrl}privileges/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrivileges(response.data);
    } catch (error) {
      console.error("Error fetching privileges:", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to fetch privileges!", "error");
    }
  };

  // Fetch privileges when token is available
  useEffect(() => {
    if (token) {
      fetchPrivileges();
    }
  }, [token]);

  const handleAddRole = async (e) => {
    e.preventDefault(); // ✅ Prevent form submission and page refresh

    if (!newRole.trim()) {
      Swal.fire("Error", "Role name is required!", "error");
      return;
    }

    if (selectedPrivileges.length === 0) {
      Swal.fire("Error", "Please select at least one privilege!", "error");
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}roles/add`,
        { name: newRole, privileges: selectedPrivileges },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ Check if API request was successful
      if (response.status === 200 || response.status === 201) {
        setNewRole(""); // ✅ Reset role name
        setSelectedPrivileges([]); // ✅ Reset privileges

        setShowRolePopup(false); // ✅ Close popup **before** showing success message

        await fetchRoles(); // ✅ Fetch updated roles list **AFTER** adding new role

        // ✅ Show success popup
        Swal.fire({
          title: "Success",
          text: response.data.message || "Your role has been added successfully!",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        });
      } else {
        throw new Error("Failed to add role");
      }
    } catch (error) {
      console.error("Error adding role:", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to add role!", "error");
    }
  };

  const handleUpdateRole = async () => {
    if (!editRole || editPrivileges.length === 0) {
      Swal.fire("Error", "Please select at least one privilege!", "error");
      return;
    }

    try {
      await axios.patch(
        `${baseUrl}roles/update/${editRole._id}`,
        { name: editRole.name, privileges: editPrivileges },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Success", "Role privileges updated successfully!", "success");
      setEditRolePopup(false); // Close the popup
      fetchRoles(); // Refresh roles list
    } catch (error) {
      console.error("Error updating role:", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to update role!", "error");
    }
  };

  const handleDeleteRole = async (roleId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${baseUrl}roles/delete/${roleId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Deleted!", "Role has been removed successfully.", "success");
          fetchRoles(); // Refresh roles list
        } catch (error) {
          console.error("Error deleting role:", error);
          Swal.fire("Error", error.response?.data?.message || "Failed to delete role!", "error");
        }
      }
    });
  };

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-700 mb-6">
        <button
          className={`px-6 py-2 cursor-pointer ${activeTab === "roles"
              ? "border-b-4 border-blue-500 text-white"
              : "text-gray-400"
            }`}
          onClick={() => setActiveTab("roles")}
        >
          Roles
        </button>
        <button
          className={`px-6 py-2 cursor-pointer ${activeTab === "addUser"
              ? "border-b-4 border-blue-500 text-white"
              : "text-gray-400"
            }`}
          onClick={() => setActiveTab("addUser")}
        >
          Add User
        </button>
        <button
          className={`px-6 py-2 cursor-pointer ${activeTab === "viewUsers"
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
        <div className="bg-[#182028] p-6 rounded-xl shadow-md">
          {/* Add Role Form */}
          <h3 className="custom-header mb-4">Add Role</h3>
          <form onSubmit={handleAddRole} className="flex gap-4">
            <input
              type="text"
              placeholder="Enter role name"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:border-blue-500"
            />
            {/* Ensure "Add Role" button only opens popup, does NOT submit form */}
            {/* Open Privilege Popup - Add type="button" to prevent form submission */}
            <button
              type="button"
              onClick={() => {
                if (!newRole.trim()) {
                  Swal.fire(
                    "Error",
                    "Please enter a role name first!",
                    "error"
                  );
                  return;
                }
                setShowRolePopup(true);
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 cursor-pointer"
            >
              + Add Role
            </button>

            {showRolePopup && (
              <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
                <div className="bg-gray-900 p-6 rounded-md shadow-lg w-[400px]">
                  <h2 className="text-white text-lg font-semibold mb-3">
                    Select Privileges for "{newRole}"
                  </h2>

                  {/* Privileges List */}
                  <div className="max-h-[280px] overflow-y-auto p-2 border border-gray-600 rounded-md">
                    {privileges.map((privilege) => (
                      <label
                        key={privilege._id}
                        className="flex items-center text-white gap-2 mb-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPrivileges.includes(privilege._id)}
                          onChange={() => {
                            setSelectedPrivileges((prev) =>
                              prev.includes(privilege._id)
                                ? prev.filter((id) => id !== privilege._id)
                                : [...prev, privilege._id]
                            );
                          }}
                        />
                        {privilege.name}
                      </label>
                    ))}
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between mt-4">
                    {/* Save Role Button - Make sure to add type="button" */}
                    <button
                      type="button"
                      onClick={handleAddRole}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      Save Role
                    </button>

                    <button
                      onClick={() => setShowRolePopup(false)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Roles Table */}
          <h3 className="custom-header mt-6 mb-4">Roles List</h3>
          <table className="w-full text-white border border-gray-600">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2 border">Sr No</th>
                <th className="p-2 border">Role Name</th>
                <th className="p-2 border">Privileges</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {roles.map((role, i) => (
                <tr key={role._id} className="hover:bg-gray-700">
                  <td className="p-2 border text-center">{i + 1}</td>
                  <td className="p-2 border text-center">{role.name}</td>
                  <td className="p-2 border text-center">
                    {role.privileges.map((p) => p.name).join(", ")}
                  </td>
                  <td className="p-2 border text-center">
                    <button
                      className="bg-yellow-500 px-3 py-1 rounded-md hover:bg-yellow-600 cursor-pointer"
                      onClick={() => openEditRolePopup(role)}
                    >
                      Edit
                    </button>
                    &#160;<span></span>&#160;
                    <button
                      className="bg-red-500 px-3 py-1 rounded-md hover:bg-red-600 cursor-pointer"
                      onClick={() => handleDeleteRole(role._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "addUser" && (
        <div className="p-6 rounded-xl shadow-md flex justify-center ">
          <div className="w-full max-w-xl bg-[#182028] p-10 rounded-2xl">
            {" "}
            {/* Centered container */}
            <h2 className="text-white mb-6 text-center text-xl font-semibold">
              Add New User
            </h2>
            <div className="grid gap-4 mb-4">
              <input
                type="text"
                placeholder="Name"
                className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:border-blue-500 w-full"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:border-blue-500 w-full"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Password"
                className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:border-blue-500 w-full"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />
              <select
                className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:border-blue-500 w-full"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="w-full bg-blue-500 px-6 py-2 rounded-md text-white hover:bg-blue-600"
              onClick={handleAddUser}
            >
              Add User
            </button>
          </div>
        </div>
      )}

      {/* View Users Tab */}
      {activeTab === "viewUsers" && (
        <div className="bg-[#182028] p-6 rounded-xl shadow-md">
          <h3 className="text-white mb-4">Users List</h3>
          <table className="w-full text-white border border-gray-600">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2 border">Sr No</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user._id || user.id} className="hover:bg-gray-700 text-center">
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">{user.name}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">{user.role?.name || "N/A"}</td>
                  <td className="p-2 border">
                    <button
                      className="bg-yellow-500 px-3 py-1 rounded-md hover:bg-yellow-600 mr-2 cursor-pointer"
                      onClick={() => openEditUserPopup(user)}
                    >
                      Edit
                    </button>

                    <button
                      className="bg-red-500 px-3 py-1 rounded-md hover:bg-red-700 cursor-pointer"
                      onClick={() => handleDeleteUser(user._id || user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editUserPopup && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-md shadow-lg w-[400px]">
            <h2 className="text-white text-lg font-semibold mb-3">Edit User</h2>

            <div className="grid gap-4 mb-4">
              <input
                type="text"
                placeholder="Name"
                value={editUserData.name}
                onChange={(e) =>
                  setEditUserData({ ...editUserData, name: e.target.value })
                }
                className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 w-full"
              />
              <input
                type="email"
                placeholder="Email"
                value={editUserData.email}
                onChange={(e) =>
                  setEditUserData({ ...editUserData, email: e.target.value })
                }
                className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 w-full"
              />
              <select
                value={editUserData.role}
                onChange={(e) =>
                  setEditUserData({ ...editUserData, role: e.target.value })
                }
                className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 w-full"
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between">
              <button
                onClick={async () => {
                  try {
                    await axios.patch(
                      `${baseUrl}users/update/${editUserData._id}`,
                      {
                        name: editUserData.name,
                        email: editUserData.email,
                        role: editUserData.role,
                      },
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    Swal.fire("Success", "User updated successfully!", "success");
                    setEditUserPopup(false);
                    fetchUsers(); // refresh the list
                  } catch (error) {
                    console.error("Error updating user:", error);
                    Swal.fire("Error", error.response?.data?.message || "Failed to update user!", "error");
                  }
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditUserPopup(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editRolePopup && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-gray-900 p-6 rounded-md shadow-lg w-[400px]">
            <h2 className="text-white text-lg font-semibold mb-3">
              Edit Privileges for "{editRole.name}"
            </h2>

            {/* Privileges List */}
            <div className="max-h-[280px] overflow-y-auto p-2 border border-gray-600 rounded-md">
              {privileges.map((privilege) => (
                <label
                  key={privilege._id}
                  className="flex items-center text-white gap-2 mb-2"
                >
                  <input
                    type="checkbox"
                    checked={editPrivileges.includes(privilege._id)}
                    onChange={() => {
                      setEditPrivileges((prev) =>
                        prev.includes(privilege._id)
                          ? prev.filter((id) => id !== privilege._id)
                          : [...prev, privilege._id]
                      );
                    }}
                  />
                  {privilege.name}
                </label>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={handleUpdateRole} // ✅ Submit updated role privileges
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditRolePopup(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
