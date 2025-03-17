"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import {
  FaChevronLeft,
  FaTachometerAlt,
  FaSitemap,
  FaProjectDiagram,
  FaChartBar,
  FaHeartbeat,
  FaChartLine,
  FaSolarPanel,
  FaBolt,
  FaUserAlt,
  FaAngleDown,
} from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa"; // ✅ Import Logout Icon
import { useRouter } from "next/navigation"; // ✅ Import Router for Redirect
import axios from "axios";
import Swal from "sweetalert2"; // ✅ Import SweetAlert for notifications

const API_BASE_URL = "http://localhost:5000"; // ✅ Backend URL

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProductionOpen, setIsProductionOpen] = useState(false);
  const pathname = usePathname();

  const [allowedPrivileges, setAllowedPrivileges] = useState([]);

  useEffect(() => {
    setIsProductionOpen(false);
    setIsExpanded(false); // Collapse sidebar on page change

    // Fetch user data from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role && parsedUser.role.privileges) {
          setAllowedPrivileges(parsedUser.role.privileges.map((p) => p.name));
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [pathname]);

  // Close submenu and collapse sidebar when page changes
  useEffect(() => {
    setIsProductionOpen(false);
    setIsExpanded(false); // Collapse sidebar on page change
  }, [pathname]);

  // Check if any submenu is active
  const isProductionActive =
    pathname.startsWith("/NationWide") ||
    pathname.startsWith("/PlantLevel") ||
    pathname.startsWith("/InvertorLevel");
  const router = useRouter(); // ✅ Initialize Router
  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Already Logged Out",
        text: "No active session found.",
        background: "#222D3B",
        color: "#ffffff",
      });
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ Clear Token and Redirect Immediately
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "You have been logged out successfully.",
        background: "#222D3B",
        color: "#ffffff",
        showConfirmButton: false,
        timer: 1500,
      });

      setTimeout(() => {
        router.push("/login"); // 🚀 Redirect to Login Page Immediately
      }, 1500);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: error.response?.data?.message || "Something went wrong!",
        background: "#222D3B",
        color: "#ffffff",
      });
    }
  };

  return (
    <aside
      className={`fixed top-2 left-2 h-[95vh] ${
        isExpanded ? "w-60" : "w-[90px]"
      } bg-[#0D2D42] rounded-2xl p-5 flex flex-col items-center transition-all duration-300 ease-in-out z-[9999] shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]`}
    >
      {/* Toggle Button */}
      <button
        className="text-white mb-4 absolute top-[45px] right-[-25px] bg-[#0D2D42] rounded-xl p-2 "
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <FaChevronLeft
          className={`text-lg transition-transform duration-300 ${
            isExpanded ? "" : "rotate-180"
          }`}
        />
      </button>

      {/* Logo */}
      <img src="/shams.png" alt="Logo" className="max-w-none" />

      <div className="border-t border-gray-500 w-full my-2"></div>

      {/* Sidebar Menu */}
      <nav className="flex flex-col w-full space-y-1 relative">
        {allowedPrivileges.includes("Dashboard") && (
          <SidebarItem
            icon={FaTachometerAlt}
            text="Dashboard"
            href="/PlantSummary"
            isExpanded={isExpanded}
            active={pathname === "/PlantSummary"}
          />
        )}

        {/* Production - Parent Item */}
        {allowedPrivileges.includes("Production") && (
          <div className="relative">
            <div
              className={`flex items-center space-x-3 px-3 text-white p-2 rounded-md transition w-full cursor-pointer ${
                isProductionActive ? "text-[#bf4a63]" : ""
              }`}
              onClick={() => setIsProductionOpen(!isProductionOpen)}
            >
              <FaSitemap
                className={`text-lg ${
                  isProductionActive ? "text-[#bf4a63]" : "text-white"
                }`}
              />
              {isExpanded && (
                <span
                  className={`text-[12px] ${
                    isProductionActive ? "text-[#bf4a63]" : "text-white"
                  }`}
                >
                  Production
                </span>
              )}
              {isExpanded && (
                <FaAngleDown
                  className={`ml-auto transition-transform ${
                    isProductionOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </div>

            {/* Submenu */}
            <div
              className={`${
                isExpanded
                  ? "ml-4"
                  : "absolute left-[80px] !pl-0 top-0 bg-[#04192b] p-2 border-l-3 border-[#bf4a63] rounded-lg w-[200px] shadow-lg"
              } ${isProductionOpen ? "block" : "hidden"}`}
            >
              <SidebarItem
                text="– &nbsp;Country Level"
                href="/NationWide"
                isExpanded={true}
                active={pathname === "/NationWide"}
                isSubmenu={true}
              />
              <SidebarItem
                text="– &nbsp;Plant Level"
                href="/PlantLevel"
                isExpanded={true}
                active={pathname === "/PlantLevel"}
                isSubmenu={true}
              />
              <SidebarItem
                text="– &nbsp;Inverter Level"
                href="/InvertorLevel"
                isExpanded={true}
                active={pathname === "/InvertorLevel"}
                isSubmenu={true}
              />
            </div>
          </div>
        )}

        {allowedPrivileges.includes("SLD") && (
          <SidebarItem
            icon={FaProjectDiagram}
            text="SLD"
            href="/SingleLineDiagram"
            isExpanded={isExpanded}
            active={pathname === "/SingleLineDiagram"}
          />
        )}
        {allowedPrivileges.includes("Suppression") && (
          <SidebarItem
            icon={FaChartBar}
            text="Suppression"
            href="/SuppressionView"
            isExpanded={isExpanded}
            active={pathname === "/SuppressionView"}
          />
        )}
        {allowedPrivileges.includes("Health") && (
          <SidebarItem
            icon={FaHeartbeat}
            text="Health"
            href="/Health"
            isExpanded={isExpanded}
            active={pathname === "/Health"}
          />
        )}
        {allowedPrivileges.includes("Analysis") && (
          <SidebarItem
            icon={FaChartLine}
            text="Analysis"
            href="/AnalysisTrend"
            isExpanded={isExpanded}
            active={pathname === "/AnalysisTrend"}
          />
        )}
        {allowedPrivileges.includes("Solar Analytics") && (
          <SidebarItem
            icon={FaSolarPanel}
            text="Solar Analytics"
            href="/SolarAnalytics"
            isExpanded={isExpanded}
            active={pathname === "/SolarAnalytics"}
          />
        )}
        {allowedPrivileges.includes("Power Analytics") && (
          <SidebarItem
            icon={FaBolt}
            text="Power Analytics"
            href="/PowerAnalytics"
            isExpanded={isExpanded}
            active={pathname === "/PowerAnalytics"}
          />
        )}
        {allowedPrivileges.includes("User Management") && (
          <SidebarItem
            icon={FaUserAlt}
            text="User Management"
            href="/UserManagement"
            isExpanded={isExpanded}
            active={pathname === "/UserManagement"}
          />
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-white px-3 py-3 rounded-md transition w-full cursor-pointer bg-red-600 hover:bg-red-700"
        >
          <FaSignOutAlt className="text-lg" />
          {isExpanded && <span className="text-[12px]">Logout</span>}
        </button>
      </nav>

      <div className="flex-grow"></div>

      {/* Footer Logo */}
      <img
        src="/company.png"
        alt="Footer Logo"
        className="h-[90px] mt-4 max-w-none"
      />
    </aside>
  );
}

/* ✅ Sidebar Item Component with Active State */
const SidebarItem = ({
  icon: Icon,
  text,
  href,
  isExpanded,
  active,
  isSubmenu = false,
}) => {
  return (
    <Link href={href} passHref>
      <div
        className={`flex items-center gap-3 text-white !p-[10px] rounded-md transition w-full cursor-pointer 
          ${isSubmenu ? "text-[12px] pl-5 py-1" : "px-3 py-3"} 
          ${active ? "text-[#bf4a63]" : "text-white"}`}
      >
        {Icon && (
          <Icon
            className={`text-lg shrink-0 ${
              active ? "text-[#bf4a63]" : "text-white"
            }`}
          />
        )}
        {isExpanded && (
          <span
            className={`text-[12px] ${
              active ? "text-[#bf4a63]" : "text-white"
            } leading-none`}
          >
            {text}
          </span>
        )}
      </div>
    </Link>
  );
};
