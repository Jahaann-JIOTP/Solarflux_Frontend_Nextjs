"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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

  const sidebarRef = useRef();

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsProductionOpen(false);
        setIsHealthOpen(false);
        setIsPowerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      ref={sidebarRef}
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
          <SidebarGroup
            isExpanded={isExpanded}
            isOpen={isProductionOpen}
            setIsOpen={setIsProductionOpen}
            icon={FaSitemap}
            title="Production"
            active={isProductionActive}
            links={[
              { text: "– Country Level", href: "/NationWide" },
              { text: "– Plant Level", href: "/PlantLevel" },
              { text: "– Inverter Level", href: "/InvertorLevel" },
            ]}
            pathname={pathname}
            onLinkClick={closeAllMenus}
          />
        )}

        {allowedPrivileges.includes("Health") && (
          <SidebarGroup
            isExpanded={isExpanded}
            isOpen={isHealthOpen}
            setIsOpen={setIsHealthOpen}
            icon={FaHeartbeat}
            title="Health"
            active={isHealthActive}
            links={[
              { text: "– System Alerter", href: "/SystemAlerter" },
              { text: "– String Clustering", href: "/StringClustering" },
              { text: "– System Comparator", href: "/SystemComparator" },
              { text: "– Efficiency & Temperature", href: "/EfficiencyandTemperature" },
            ]}
            pathname={pathname}
            onLinkClick={closeAllMenus}
          />
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
          <SidebarGroup
            isExpanded={isExpanded}
            isOpen={isPowerOpen}
            setIsOpen={setIsPowerOpen}
            icon={FaBolt}
            title="Power Analytics"
            active={isPowerActive}
            links={[
              { text: "– Summary", href: "/PowerAnalytics" },
              { text: "– Weekly", href: "/PowerAnalyticsWeekly" },
              { text: "– Hourly", href: "/PowerAnalyticsHourly" },
            ]}
            pathname={pathname}
            onLinkClick={closeAllMenus}
          />
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

// ✅ Sidebar Item Component
const SidebarItem = ({ icon: Icon, text, href, isExpanded, active, isSubmenu = false, onClick }) => (
  <Link href={href} passHref>
    <div
      onClick={onClick}
      className={`flex ${!isExpanded ? "flex-col items-center justify-center text-center" : "flex-row items-center justify-start pl-3"}
      text-white !p-[10px] rounded-md transition w-full cursor-pointer 
      ${isSubmenu ? "text-[12px] pl-5 py-1" : "px-3 py-3"} 
      ${active ? "text-[#bf4a63]" : "text-white"}`}
    >
      {Icon && <Icon className={`text-lg ${active ? "text-[#bf4a63]" : "text-white"}`} />}
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

// ✅ Reusable Sidebar Group (submenu)
const SidebarGroup = ({ icon: Icon, title, links, isExpanded, isOpen, setIsOpen, active, pathname, onLinkClick }) => (
  <div className="relative">
    <div
      className={`flex ${isExpanded ? "flex-row items-center justify-start pl-2" : "flex-col items-center justify-center"} text-white p-2 rounded-md transition w-full cursor-pointer ${active ? "text-[#bf4a63]" : ""}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <Icon className={`text-lg ${active ? "text-[#bf4a63]" : "text-white"}`} />
      {isExpanded ? (
        <span className="text-[12px] ml-3">{title}</span>
      ) : (
        <span className="text-[10px] mt-1 leading-tight text-center">{title}</span>
      )}
      {isExpanded && (
        <FaAngleDown className={`ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`} />
      )}
    </div>

    <div
      className={`${isExpanded
        ? "ml-4"
        : "absolute left-[80px] !pl-0 top-0 bg-[#04192b] p-2 border-l-3 border-[#bf4a63] rounded-lg w-[200px] shadow-lg"
        } ${isOpen ? "block" : "hidden"}`}
    >
      {links.map((link, index) => (
        <SidebarItem
          key={index}
          text={link.text}
          href={link.href}
          isExpanded={true}
          active={pathname === link.href}
          isSubmenu={true}
          onClick={onLinkClick}
        />
      ))}
    </div>
  </div>
);
