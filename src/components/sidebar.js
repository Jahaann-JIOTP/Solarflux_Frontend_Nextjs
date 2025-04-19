"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import config from "@/config";
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
  FaSignOutAlt,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";

const baseUrl = config.BASE_URL;

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProductionOpen, setIsProductionOpen] = useState(false);
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [isPowerOpen, setIsPowerOpen] = useState(false);
  const [allowedPrivileges, setAllowedPrivileges] = useState([]);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsProductionOpen(false);
    setIsHealthOpen(false);
    setIsExpanded(false);

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role?.privileges) {
          setAllowedPrivileges(parsedUser.role.privileges.map((p) => p.name));
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [pathname]);

  const isProductionActive =
    pathname.startsWith("/NationWide") ||
    pathname.startsWith("/PlantLevel") ||
    pathname.startsWith("/InvertorLevel");

  const isHealthActive =
    pathname.startsWith("/Health") ||
    pathname.startsWith("/EfficiencyandTemperature") ||
    pathname.startsWith("/SystemComparator") ||
    pathname.startsWith("/SystemAlerter") ||
    pathname.startsWith("/StringClustering");

  const isPowerActive =
    pathname.startsWith("/PowerAnalytics") ||
    pathname.startsWith("/PowerAnalyticsWeekly") ||
    pathname.startsWith("/PowerAnalyticsHourly");

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
        `${baseUrl}auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
        router.push("/login");
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

  const closeAllMenus = () => {
    setIsProductionOpen(false);
    setIsHealthOpen(false);
    setIsPowerOpen(false);
  };

  return (
    <aside
      className={`fixed top-4 left-3 h-[95vh] ${isExpanded ? "w-60" : "w-[90px]"} bg-[#0D2D42] rounded-2xl p-5 flex flex-col items-center transition-all duration-300 ease-in-out z-[9999] shadow-[0px_0px_15px_rgba(0,136,255,0.7),_inset_0px_10px_15px_rgba(0,0,0,0.6)]`}
    >
      <img src="/shams.png" alt="Logo" className="max-w-none" />

      <div className="border-t border-gray-500 w-full my-2"></div>

      <button
        className="text-white bg-[#0D2D42] rounded-xl p-2 "
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <FaChevronLeft
          className={`text-lg transition-transform duration-300 ${isExpanded ? "" : "rotate-180"}`}
        />
      </button>

      <div className="border-t border-gray-500 w-full my-2"></div>

      <nav className={`flex justify-center ${isExpanded ? "" : "items-center"} flex-col w-full space-y-1 relative`}>
        {allowedPrivileges.includes("Dashboard") && (
          <SidebarItem
            icon={FaTachometerAlt}
            text="Dashboard"
            href="/PlantSummary"
            isExpanded={isExpanded}
            active={pathname === "/PlantSummary"}
            onClick={closeAllMenus}
          />
        )}

        {allowedPrivileges.includes("Production") && (
          <div className="relative">
            <div
              className={`flex ${isExpanded ? "flex-row items-center justify-start pl-2" : "flex-col items-center justify-center"} text-white p-2 rounded-md transition w-full cursor-pointer ${isProductionActive ? "text-[#bf4a63]" : ""}`}
              onClick={() => setIsProductionOpen(!isProductionOpen)}
            >
              <FaSitemap className={`text-lg ${isProductionActive ? "text-[#bf4a63]" : "text-white"}`} />
              {isExpanded ? (
                <span className="text-[12px] ml-3">Production</span>
              ) : (
                <span className="text-[10px] mt-1 leading-tight text-center">Production</span>
              )}
              {isExpanded && (
                <FaAngleDown className={`ml-auto transition-transform ${isProductionOpen ? "rotate-180" : ""}`} />
              )}
            </div>

            <div
              className={`${isExpanded
                ? "ml-4"
                : "absolute left-[80px] !pl-0 top-0 bg-[#04192b] p-2 border-l-3 border-[#bf4a63] rounded-lg w-[200px] shadow-lg"
                } ${isProductionOpen ? "block" : "hidden"}`}
            >
              <SidebarItem text="– &nbsp;Country Level" href="/NationWide" isExpanded={true} active={pathname === "/NationWide"} isSubmenu={true} onClick={closeAllMenus} />
              <SidebarItem text="– &nbsp;Plant Level" href="/PlantLevel" isExpanded={true} active={pathname === "/PlantLevel"} isSubmenu={true} onClick={closeAllMenus} />
              <SidebarItem text="– &nbsp;Inverter Level" href="/InvertorLevel" isExpanded={true} active={pathname === "/InvertorLevel"} isSubmenu={true} onClick={closeAllMenus} />
            </div>
          </div>
        )}

        {allowedPrivileges.includes("Health") && (
          <div className="relative">
            <div
              className={`flex ${isExpanded ? "flex-row items-center justify-start pl-2" : "flex-col items-center justify-center"} text-white p-2 rounded-md transition w-full cursor-pointer ${isHealthActive ? "text-[#bf4a63]" : ""}`}
              onClick={() => setIsHealthOpen(!isHealthOpen)}
            >
              <FaHeartbeat className={`text-lg ${isHealthActive ? "text-[#bf4a63]" : "text-white"}`} />
              {isExpanded ? (
                <span className="text-[12px] ml-3">Health</span>
              ) : (
                <span className="text-[10px] mt-1 leading-tight text-center">Health</span>
              )}
              {isExpanded && (
                <FaAngleDown className={`ml-auto transition-transform ${isHealthOpen ? "rotate-180" : ""}`} />
              )}
            </div>

            <div
              className={`${isExpanded
                ? "ml-4"
                : "absolute left-[80px] !pl-0 top-0 bg-[#04192b] p-2 border-l-3 border-[#bf4a63] rounded-lg w-[200px] shadow-lg"
                } ${isHealthOpen ? "block" : "hidden"}`}
            >
              <SidebarItem text="– &nbsp;System Alerter" href="/SystemAlerter" isExpanded={true} active={pathname === "/SystemAlerter"} isSubmenu={true} onClick={closeAllMenus} />
              <SidebarItem text="– &nbsp;String Clustering" href="/StringClustering" isExpanded={true} active={pathname === "/StringClustering"} isSubmenu={true} onClick={closeAllMenus} />
              <SidebarItem text="– &nbsp;System Comparator" href="/SystemComparator" isExpanded={true} active={pathname === "/SystemComparator"} isSubmenu={true} onClick={closeAllMenus} />
              <SidebarItem text="– &nbsp;Efficiency & Temperature" href="/EfficiencyandTemperature" isExpanded={true} active={pathname === "/EfficiencyandTemperature"} isSubmenu={true} onClick={closeAllMenus} />
            </div>
          </div>
        )}

        {allowedPrivileges.includes("SLD") && (
          <SidebarItem icon={FaProjectDiagram} text="SLD" href="/SingleLineDiagram" isExpanded={isExpanded} active={pathname === "/SingleLineDiagram"} onClick={closeAllMenus} />
        )}

        {allowedPrivileges.includes("Suppression") && (
          <SidebarItem icon={FaChartBar} text="Suppression" href="/SuppressionView" isExpanded={isExpanded} active={pathname === "/SuppressionView"} onClick={closeAllMenus} />
        )}

        {allowedPrivileges.includes("Analysis") && (
          <SidebarItem icon={FaChartLine} text="Analysis" href="/TrendAnalysis" isExpanded={isExpanded} active={pathname === "/TrendAnalysis"} onClick={closeAllMenus} />
        )}

        {allowedPrivileges.includes("Solar Analytics") && (
          <SidebarItem icon={FaSolarPanel} text="Solar Analytics" href="/SolarAnalytics" isExpanded={isExpanded} active={pathname === "/SolarAnalytics"} onClick={closeAllMenus} />
        )}

        {allowedPrivileges.includes("Power Analytics") && (
          <div className="relative">
            <div
              className={`flex ${isExpanded ? "flex-row items-center justify-start pl-2" : "flex-col items-center justify-center"} text-white p-2 rounded-md transition w-full cursor-pointer ${isPowerActive ? "text-[#bf4a63]" : ""}`}
              onClick={() => setIsPowerOpen(!isPowerOpen)}
            >
              <FaBolt className={`text-lg ${isPowerActive ? "text-[#bf4a63]" : "text-white"}`} />
              {isExpanded ? (
                <span className="text-[12px] ml-3">Power Analytics</span>
              ) : (
                <span className="text-[10px] mt-1 leading-tight text-center">Power</span>
              )}
              {isExpanded && (
                <FaAngleDown className={`ml-auto transition-transform ${isPowerOpen ? "rotate-180" : ""}`} />
              )}
            </div>

            <div
              className={`${isExpanded
                ? "ml-4"
                : "absolute left-[80px] !pl-0 top-0 bg-[#04192b] p-2 border-l-3 border-[#bf4a63] rounded-lg w-[200px] shadow-lg"
                } ${isPowerOpen ? "block" : "hidden"}`}
            >
              <SidebarItem text="– &nbsp;Summary" href="/PowerAnalytics" isExpanded={true} active={pathname === "/PowerAnalytics"} isSubmenu={true} onClick={closeAllMenus} />
              <SidebarItem text="– &nbsp;Weekly" href="/PowerAnalyticsWeekly" isExpanded={true} active={pathname === "/PowerAnalyticsWeekly"} isSubmenu={true} onClick={closeAllMenus} />
              <SidebarItem text="– &nbsp;Hourly" href="/PowerAnalyticsHourly" isExpanded={true} active={pathname === "/PowerAnalyticsHourly"} isSubmenu={true} onClick={closeAllMenus} />
            </div>
          </div>
        )}

        {allowedPrivileges.includes("User Management") && (
          <SidebarItem icon={FaUserAlt} text="User Management" href="/UserManagement" isExpanded={isExpanded} active={pathname === "/UserManagement"} onClick={closeAllMenus} />
        )}

        <button onClick={handleLogout} className="flex justify-center items-center gap-3 text-white px-3 py-3 rounded-md transition w-full cursor-pointer bg-[#bf4a63]">
          <FaSignOutAlt className="text-lg" />
          {isExpanded && <span className="text-[12px]">Logout</span>}
        </button>
      </nav>

      <div className="flex-grow"></div>
      <img src="/company.png" alt="Footer Logo" className="h-[70px] mt-4 mb-[-10px] max-w-none" />
    </aside>
  );
}

// ✅ Updated SidebarItem Component
const SidebarItem = ({
  icon: Icon,
  text,
  href,
  isExpanded,
  active,
  isSubmenu = false,
  onClick,
}) => {
  return (
    <Link href={href} passHref>
      <div
        onClick={onClick}
        className={`flex ${!isExpanded ? "flex-col items-center justify-center text-center" : "flex-row items-center justify-start pl-3"} 
        text-white !p-[10px] rounded-md transition w-full cursor-pointer 
        ${isSubmenu ? "text-[12px] pl-5 py-1" : "px-3 py-3"} 
        ${active ? "text-[#bf4a63]" : "text-white"}`}
      >
        {Icon && (
          <Icon className={`text-lg ${active ? "text-[#bf4a63]" : "text-white"}`} />
        )}
        {isExpanded ? (
          <span className={`text-[12px] ml-3 ${active ? "text-[#bf4a63]" : "text-white"} leading-none`}>
            {text}
          </span>
        ) : (
          <span className="text-[10px] mt-1 leading-tight break-words w-full">{text}</span>
        )}
      </div>
    </Link>
  );
};
