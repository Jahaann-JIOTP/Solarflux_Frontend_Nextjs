"use client"; // Ensures it's a client component

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation"; // ✅ Detect active path

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
  FaAngleDown, // Icon for dropdown toggle
} from "react-icons/fa";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProductionOpen, setIsProductionOpen] = useState(false);
  const pathname = usePathname(); // ✅ Get current active path

  return (
    <aside
      className={`fixed top-2 left-2 h-[95vh] ${
        isExpanded ? "w-64" : "w-[90px]"
      } bg-[#04192b] rounded-2xl p-5 flex flex-col items-center transition-all duration-300 ease-in-out z-[9999]`}
    >
      {/* Toggle Button */}
      <button
        className="text-white mb-4 absolute top-[45px] right-[-25px] bg-[#04192b] rounded-xl p-2"
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
      <nav className="flex flex-col w-full space-y-3 relative">
        <SidebarItem
          icon={FaTachometerAlt}
          text="Dashboard"
          href="/PlantSummary"
          isExpanded={isExpanded}
          active={pathname === "/PlantSummary"}
        />

        {/* Production - Parent Item */}
        <div className="relative">
          <div
            className={`flex items-center space-x-3 text-white p-3 rounded-md transition w-full cursor-pointer ${
              isProductionOpen ? "bg-[#222d3b]" : ""
            } ${pathname.startsWith("/Production") ? "bg-[#045DA3]" : ""}`}
            onClick={() => setIsProductionOpen(!isProductionOpen)}
          >
            <FaSitemap className="text-lg" />
            {isExpanded && <span className="text-sm">Production</span>}
            {isExpanded && (
              <FaAngleDown
                className={`ml-auto transition-transform ${
                  isProductionOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </div>

          {/* ✅ Submenu (When Sidebar is Open or Closed) */}
          <div 
            className={` shadow-lg transition-all duration-300 ${
              isProductionOpen ? "block" : "hidden"
            } ${isExpanded ? "left-0 ml-0 w-full" : "left-[80px] ml-2 w-44"} submenu`}
          >
            <SidebarItem
              text="Country Level"
              href="/NationWide"
              isExpanded={true} // Always show text outside
              active={pathname === "/NationWide"}
            />
            <SidebarItem
              text="Plant Level"
              href="/PlantLevel"
              isExpanded={true}
              active={pathname === "/PlantLevel"}
            />
            <SidebarItem
              text="Inverter Level"
              href="/InvertorLevel"
              isExpanded={true}
              active={pathname === "/InvertorLevel"}
            />
          </div>
        </div>

        <SidebarItem
          icon={FaProjectDiagram}
          text="SLD"
          href="/SingleLineDiagram"
          isExpanded={isExpanded}
          active={pathname === "/SingleLineDiagram"}
        />
        <SidebarItem
          icon={FaChartBar}
          text="Suppression"
          href="/SuppressionView"
          isExpanded={isExpanded}
          active={pathname === "/SuppressionView"}
        />
        <SidebarItem
          icon={FaHeartbeat}
          text="Health"
          href="/Health"
          isExpanded={isExpanded}
          active={pathname === "/Health"}
        />
        <SidebarItem
          icon={FaChartLine}
          text="Analysis"
          href="/AnalysisTrend"
          isExpanded={isExpanded}
          active={pathname === "/AnalysisTrend"}
        />
        <SidebarItem
          icon={FaSolarPanel}
          text="Solar Analytics"
          href="/SolarAnalytics"
          isExpanded={isExpanded}
          active={pathname === "/SolarAnalytics"}
        />
        <SidebarItem
          icon={FaBolt}
          text="Power Analytics"
          href="/PowerAnalytics"
          isExpanded={isExpanded}
          active={pathname === "/PowerAnalytics"}
        />
        <SidebarItem
          icon={FaUserAlt}
          text="User Management"
          href="/UserManagement"
          isExpanded={isExpanded}
          active={pathname === "/UserManagement"}
        />
      </nav>

      <div className="flex-grow"></div>

      {/* Footer Logo */}
      <img src="/company.png" alt="Footer Logo" className="h-[90px] mt-4 max-w-none" />
    </aside>
  );
}

/* ✅ Sidebar Item Component with Active State */
const SidebarItem = ({ icon: Icon, text, href, isExpanded, active }) => {
  return (
    <Link href={href} passHref>
      <div
        className={`flex items-center space-x-3 text-white p-3 rounded-md transition w-full cursor-pointer ${
          active ? "bg-[#045DA3]" : "hover:bg-blue-500"
        }`}
      >
        {Icon && <Icon className="text-lg" />}
        {isExpanded && <span className="text-sm">{text}</span>}
      </div>
    </Link>
  );
};
